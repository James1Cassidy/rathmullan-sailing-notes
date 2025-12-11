// Simple site-wide search using Lunr.js
(function() {
  const pages = [
    { url: '/index.html', title: 'Home' },
    { url: '/instructors.html', title: 'Instructors' },
    { url: '/taste_of_sailing.html', title: 'Taste of Sailing' },
    { url: '/start_sailing.html', title: 'Start Sailing' },
    { url: '/basic_skills.html', title: 'Basic Skills' },
    { url: '/improving_skills.html', title: 'Improving Skills' },
    { url: '/advanced.html', title: 'Advanced' },
    { url: '/advanced_boat_handling.html', title: 'Advanced Boat Handling' },
    { url: '/adventure.html', title: 'Adventure' },
    { url: '/boat_diagram.html', title: 'Boat Diagram' },
    { url: '/coastal_navigation.html', title: 'Coastal Navigation' },
    { url: '/kites_and_wires.html', title: 'Kites and Wires' },
    { url: '/quiz.html', title: 'Quiz' },
    { url: '/start_racing.html', title: 'Start Racing' }
  ];

  const resultsEl = document.getElementById('results');
  const q = document.getElementById('q');

  function extractContent(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const title = doc.querySelector('h1, h2')?.textContent?.trim() || '';
    const headings = Array.from(doc.querySelectorAll('h1,h2,h3')).map(h => h.textContent.trim()).join(' ');
    const paragraphs = Array.from(doc.querySelectorAll('p,li')).map(p => p.textContent.trim()).join(' ');
    return { title, text: `${headings} ${paragraphs}` };
  }

  async function buildIndex() {
    const docs = [];
    for (const p of pages) {
      try {
        const res = await fetch(p.url, { cache: 'no-cache' });
        if (!res.ok) continue;
        const html = await res.text();
        const content = extractContent(html);
        docs.push({ id: p.url, title: p.title || content.title, text: content.text, url: p.url });
      } catch (e) {
        // ignore errors for pages that may be restricted
      }
    }

    const idx = lunr(function () {
      this.ref('id');
      this.field('title');
      this.field('text');
      docs.forEach(d => this.add(d));
    });

    function render(results) {
      resultsEl.innerHTML = '';
      if (!results.length) {
        resultsEl.innerHTML = '<p class="muted">No matches found.</p>';
        return;
      }
      for (const r of results) {
        const doc = docs.find(d => d.id === r.ref);
        const div = document.createElement('div');
        div.className = 'result';
        div.innerHTML = `<a href="${doc.url}">${doc.title}</a><div class="muted">${doc.url}</div>`;
        resultsEl.appendChild(div);
      }
    }

    q.addEventListener('input', () => {
      const query = q.value.trim();
      if (!query) { resultsEl.innerHTML = ''; return; }
      const results = idx.search(query);
      render(results);
    });
  }

  buildIndex();
})();
