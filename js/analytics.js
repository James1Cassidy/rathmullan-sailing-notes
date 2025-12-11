(function(){
  // Wait until Chart.js and firebase are ready
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function(){
    const gate = document.getElementById('gate');
    const content = document.getElementById('content');

    const db = window.db || firebase.database();
    const auth = firebase.auth();

    function showGate(msg){ gate.style.display='block'; gate.textContent = msg || gate.textContent; content.style.display='none'; }
    function showContent(){ gate.style.display='none'; content.style.display='block'; }

    function isApproved(uid){
      return db.ref('users/'+uid+'/approved').once('value').then(s=>!!s.val());
    }

    auth.onAuthStateChanged(async (user)=>{
      if(!user){ showGate('Please sign in with an approved account to view analytics.'); return; }
      const approved = await isApproved(user.uid);
      if(!approved){ showGate('Your account is not approved to view analytics.'); return; }
      showContent();
      loadAnalytics();
    });

    async function loadAnalytics(){
      const studentsSnap = await db.ref('students').once('value');
      const students = studentsSnap.val() || {};

      // Level keys present in DB
      const levelKeys = Object.keys(students);

      // 1) Students per level
      const levelCountsData = levelKeys.map(k => Array.isArray(students[k]) ? students[k].length : Object.keys(students[k]||{}).length);
      const totalStudents = levelCountsData.reduce((a,b)=>a+b,0);

      // 2) Skill attainment per level - aggregate statuses
      const statuses = ['achieved','partially_achieved','not_demonstrated','not_assessed'];
      const statusByLevel = {
        achieved: [], partially_achieved: [], not_demonstrated: [], not_assessed: []
      };

      const overallStatus = { achieved:0, partially_achieved:0, not_demonstrated:0, not_assessed:0 };
      const skillGapCounts = {}; // skillId -> {count, label}

      let assessedTotal = 0; // total skills with a status other than not_assessed
      let achievedTotal = 0;

      const now = Date.now();
      const THIRTY_DAYS = 30*24*60*60*1000;
      let newLast30 = 0;

      for (const level of levelKeys) {
        const notesSnap = await db.ref('studentNotes/'+level).once('value');
        const notes = notesSnap.val() || {};

        // Count statuses across all students and all defined skills for that level
        let counts = { achieved:0, partially_achieved:0, not_demonstrated:0, not_assessed:0 };

        // Use SAILING_SKILLS if available to know skill IDs; else fallback to observed IDs in DB
        let skillIds = [];
        try {
          const levelDef = SAILING_SKILLS[level];
          if (levelDef) {
            levelDef.sections.forEach(sec => sec.competencies.forEach(c => skillIds.push(c.id)));
          }
        } catch(e) {}
        if (skillIds.length === 0) {
          // Fallback: first student notes to derive keys
          const firstStudent = Object.values(notes)[0];
          if (firstStudent && firstStudent.skillsChecklist) skillIds = Object.keys(firstStudent.skillsChecklist);
        }

        // Iterate each student in this level
        for (const [studentId, sData] of Object.entries(notes)) {
          const sc = sData.skillsChecklist || {};
          for (const skillId of skillIds) {
            const st = sc[skillId] || 'not_assessed';
            if (counts[st] !== undefined) counts[st]++;
            if (overallStatus[st] !== undefined) overallStatus[st]++;
            if (st !== 'not_assessed') assessedTotal++;
            if (st === 'achieved') achievedTotal++;
            if (st === 'not_demonstrated' || st === 'not_assessed') {
              const label = (()=>{
                try {
                  const lvl = SAILING_SKILLS[level];
                  for (const sec of (lvl?.sections||[])) {
                    for (const c of sec.competencies) if (c.id === skillId) return c.skill;
                  }
                } catch(e) {}
                return skillId;
              })();
              skillGapCounts[skillId] = skillGapCounts[skillId] || { count:0, label };
              skillGapCounts[skillId].count++;
            }
          }
        }

        // Count new students in last 30 days for this level
        const arr = Array.isArray(students[level]) ? students[level] : Object.values(students[level]||{});
        for (const st of arr) {
          const ts = st.timestamp || st.ts || Date.parse(st.date||'') || null;
          if (ts && (now - ts) <= THIRTY_DAYS) newLast30++;
        }

        // Push to arrays for chart stacking
        statusByLevel.achieved.push(counts.achieved);
        statusByLevel.partially_achieved.push(counts.partially_achieved);
        statusByLevel.not_demonstrated.push(counts.not_demonstrated);
        statusByLevel.not_assessed.push(counts.not_assessed);
      }

      // 3) New students over time (weekly)
      const weekBuckets = {}; // key: ISO week start (YYYY-MM-DD) value: count
      function weekStart(ts){
        const d = new Date(ts || Date.now());
        // normalize to Monday
        const day = d.getDay();
        const diff = (day===0?6:day-1); // 0->Sun
        d.setHours(0,0,0,0);
        d.setDate(d.getDate()-diff);
        return d.toISOString().slice(0,10);
      }
      for (const level of levelKeys) {
        const arr = Array.isArray(students[level]) ? students[level] : Object.values(students[level]||{});
        for (const st of arr) {
          const ts = st.timestamp || st.ts || Date.parse(st.date||'') || null;
          if (!ts) continue;
          const key = weekStart(ts);
          weekBuckets[key] = (weekBuckets[key]||0)+1;
        }
      }
      const weeks = Object.keys(weekBuckets).sort();
      const weekCounts = weeks.map(k=>weekBuckets[k]);

      // KPIs
      const avgCompletion = assessedTotal ? Math.round((achievedTotal/assessedTotal)*100) : 0;
      setKPI('kpi-total', totalStudents);
      setKPI('kpi-new', newLast30);
      setKPI('kpi-completion', `${avgCompletion}%`);

      // Render charts
      renderLevelCounts(levelKeys, levelCountsData);
      renderSkillStatuses(levelKeys, statusByLevel);
      renderNewStudents(weeks, weekCounts);
      renderOverallStatus(overallStatus);
      renderGaps(skillGapCounts);
    }

    function setKPI(id, value){
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    }

    function renderLevelCounts(labels, data){
      const ctx = document.getElementById('levelCounts').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Students', data, backgroundColor: '#3b82f6' }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });
    }

    function renderSkillStatuses(labels, byLevel){
      const ctx = document.getElementById('skillStatuses').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Achieved', data: byLevel.achieved, backgroundColor: '#16a34a' },
            { label: 'Partial', data: byLevel.partially_achieved, backgroundColor: '#f59e0b' },
            { label: 'Not demonstrated', data: byLevel.not_demonstrated, backgroundColor: '#ef4444' },
            { label: 'Not assessed', data: byLevel.not_assessed, backgroundColor: '#94a3b8' }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } },
          scales: { y: { beginAtZero: true } },
          interaction: { mode: 'index', intersect: false },
          stacked: true
        }
      });
    }

    function renderNewStudents(labels, data){
      const ctx = document.getElementById('newStudents').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'New students (weekly)', data, borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.2)', fill: true }] },
        options: { responsive: true, plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true } } }
      });
    }

    function renderOverallStatus(overall){
      const ctx = document.getElementById('overallStatus').getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Achieved','Partial','Not demonstrated','Not assessed'],
          datasets: [{
            data: [overall.achieved, overall.partially_achieved, overall.not_demonstrated, overall.not_assessed],
            backgroundColor: ['#16a34a','#f59e0b','#ef4444','#94a3b8']
          }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
      });
    }

    function renderGaps(gaps){
      const list = document.getElementById('gaps-list');
      if (!list) return;
      const sorted = Object.values(gaps).sort((a,b)=>b.count-a.count).slice(0,5);
      list.innerHTML = '';
      if (!sorted.length) { list.innerHTML = '<li>No gaps found.</li>'; return; }
      sorted.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.label} — ${item.count}`;
        list.appendChild(li);
      });
    }
  });
})();
