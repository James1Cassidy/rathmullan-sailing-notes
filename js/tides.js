(function(){
  // Direct endpoint (blocked by CORS when called from browser)
  const DIRECT_ENDPOINT = 'https://tidesnear.me/api/v2/stations/tide/3459?language=en-GB';
  // Optional Worker/Pages Function proxy (set your deployed URL here if available)
  const WORKER_ENDPOINT = 'https://hidden-voice-f194.jamescassidylk.workers.dev/?target=https://tidesnear.me/api/v2/stations/tide/3459?language=en-GB';
  // Generic public CORS proxy (allorigins) used as fallback; returns raw body
  const CORS_PROXY_PREFIX = 'https://api.allorigins.win/raw?url=';
  const containerId = 'tides-nearme';
  const POLL_INTERVAL_MS = 60 * 1000; // refresh tide data every 60s
  let autoRefreshInterval = null;

  function cmToMeters(cm){return (cm/100).toFixed(2);}
  function fmt(ts){
    try {return new Date(ts).toLocaleString('en-GB',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'});}catch(e){return ts;}
  }

  function buildApproximate(next){
    if(!next) return '<div class="text-center text-red-600">Approximate schedule unavailable.</div>';
    const base = new Date(next.timestamp);
    const events = [];
    // Simple semi-diurnal model: alternate every ~6h 12m
    let current = base;
    let high = next.high;
    for(let i=0;i<6;i++){
      events.push({timestamp: current.toISOString(), high: high, height_cm: next.height_cm, height_ft: next.height_ft});
      current = new Date(current.getTime() + 6*60*60*1000 + 12*60*1000); // 6h12m
      high = !high;
    }
    return '<div class="text-center text-xs text-gray-500 mb-2"><em>Approximate (live fallback)</em></div>' + listEvents(events);
  }

  function listEvents(events){
    return '<ul class="mt-2 space-y-1">' + events.map(e=>
      `<li class="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm border border-blue-200 mb-1">
        <span class="font-semibold ${e.high ? 'text-blue-700' : 'text-blue-500'}">${e.high ? 'High' : 'Low'}</span>
        <span class="text-gray-700">${fmt(e.timestamp)}</span>
        <span class="font-mono text-blue-900">${cmToMeters(e.height_cm)} m</span>
        <span class="text-xs text-gray-500">(${e.height_ft} ft)</span>
      </li>`
    ).join('') + '</ul>';
  }

  // Estimate current tide height using the Rule of Twelfths between two tide events
  // lastEvent and nextEvent must include: {timestamp, height_cm}
  function estimateTideByRuleOfTwelfths(lastEvent, nextEvent, nowDate){
    if(!lastEvent || !nextEvent) return null;
    if(typeof lastEvent.height_cm !== 'number' || typeof nextEvent.height_cm !== 'number') return null;
    const lastTs = new Date(lastEvent.timestamp).getTime();
    const nextTs = new Date(nextEvent.timestamp).getTime();
    const nowTs = (nowDate || new Date()).getTime();
    const duration = nextTs - lastTs;
    if(duration <= 0) return null;
    const elapsed = Math.max(0, Math.min(nowTs - lastTs, duration));
    const f = elapsed / duration; // 0..1 fraction of the tide cycle from last -> next

    // Rule of twelfths weights for the six equal time segments
    const weights = [1,2,3,3,2,1];
    const totalTwelfths = 12;
    const segments = 6;
    // cumulative proportion at segment boundaries
    const segProps = [];
    let acc = 0;
    for(let i=0;i<segments;i++){ acc += weights[i]; segProps[i] = acc/totalTwelfths; }

    // Map continuous fraction f into cumulative proportion using the twelfths pattern
    const segIndex = Math.min(segments-1, Math.floor(f*segments));
    const prevProp = segIndex===0 ? 0 : segProps[segIndex-1];
    const withinSeg = (f*segments) - segIndex; // 0..1 inside this segment
    const segProp = (weights[segIndex]/totalTwelfths) * withinSeg;
    const currentProp = prevProp + segProp;

    const delta = nextEvent.height_cm - lastEvent.height_cm;
    const estimated_cm = lastEvent.height_cm + delta * currentProp;
    return {
      height_cm: Math.round(estimated_cm),
      height_m: (estimated_cm/100).toFixed(2),
      rising: delta > 0,
      fraction: currentProp
    };
  }

function renderCompactTideTile(element, heightM, isRising, nextTide) {
    if (!element) return;

    element.className = 'text-center w-full'; // Reset classes, take full width for centering text

    const nextShortLabel = (nextTide && nextTide.timestamp && typeof nextTide.height_cm !== 'undefined') ? `Next: ${new Date(nextTide.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} (${cmToMeters(nextTide.height_cm)}m)` : '';

    const risingText = isRising ? 'Rising' : 'Falling';
    const arrow = isRising ? '▲' : '▼';
    const colorClass = isRising ? 'text-green-600' : 'text-red-600';

    element.innerHTML = `
        <div class="text-4xl font-extrabold text-blue-900 flex justify-center items-center">
            <span>${heightM}</span>
            <span class="text-2xl font-medium text-gray-600 ml-1">m</span>
            <span class="text-3xl ${colorClass} ml-2">${arrow}</span>
        </div>
        <div class="text-md text-gray-600 mt-1">Tide (${risingText})</div>
        <div class="text-xs text-gray-500 mt-1">${nextShortLabel}</div>
    `;
}

  function render(data){
    const el = document.getElementById(containerId);
    if(!el) return;
    if(!data){el.innerHTML = '<div class="text-center text-red-600">No data.</div>';return;}

    // Store tide data globally for use by tide chart
    window.tideData = data;

    const parts = [];
    // Card wrapper
    parts.push('<div class="max-w-md mx-auto bg-white/90 rounded-xl shadow-lg border border-blue-200 p-6 mb-2">');
        // compute current estimate if possible
        let estimate = null;
        let smallUpdated = false; // true if we wrote the compact tile (avoid duplicating same info in large card)
        try{
          if(data.last_tide && data.next_tide){
            estimate = estimateTideByRuleOfTwelfths(data.last_tide, data.next_tide, new Date());
          }
        }catch(e){ estimate = null; }
        // Update only the compact dashboard tile with estimated height, trend and next tide info
        if(estimate){
          try{
            const small = document.getElementById('weather-tide');
            if(small){
              renderCompactTideTile(small, estimate.height_m, estimate.rising, data.next_tide);
              smallUpdated = true;
            }
          }catch(e){}
        } else if(data.last_tide && data.next_tide && (typeof data.last_tide.height_cm === 'number' || typeof data.next_tide.height_cm === 'number')){
          // fallback linear interpolation if heights available but estimator failed
          try{
            const lastH = data.last_tide.height_cm || 0; const nextH = data.next_tide.height_cm || 0;
            const now = Date.now();
            const t0 = new Date(data.last_tide.timestamp).getTime();
            const t1 = new Date(data.next_tide.timestamp).getTime();
            const frac = Math.max(0, Math.min(1, (now - t0)/(t1 - t0)));
            const est_cm = Math.round(lastH + (nextH-lastH)*frac);
            const est_m = (est_cm/100).toFixed(2);
            try{
              const small = document.getElementById('weather-tide');
              if(small){
                const rising = (nextH - lastH) > 0;
                renderCompactTideTile(small, est_m, rising, data.next_tide);
                smallUpdated = true;
              }
            }catch(e){}
          }catch(e){ /* ignore */ }
        }
    // If we updated the small dashboard tile above, avoid duplicating the same Next/Last summary here.
    if(!smallUpdated){
      if(data.next_tide){
        parts.push(`<div class="mb-2 text-lg font-bold text-blue-800 flex items-center justify-center gap-2"><span>Next Tide:</span> <span class="${data.next_tide.high ? 'text-blue-700' : 'text-blue-500'}">${data.next_tide.high?'High':'Low'}</span> <span class="text-gray-700">@ ${fmt(data.next_tide.timestamp)}</span> <span class="font-mono text-blue-900">${cmToMeters(data.next_tide.height_cm)} m</span> <span class="text-xs text-gray-500">(${data.next_tide.height_ft} ft)</span></div>`);
      }
      if(data.last_tide){
        parts.push(`<div class="mb-4 text-sm text-gray-600 flex items-center justify-center gap-2"><span>Last Tide:</span> <span class="${data.last_tide.high ? 'text-blue-700' : 'text-blue-500'}">${data.last_tide.high?'High':'Low'}</span> <span class="text-gray-700">@ ${fmt(data.last_tide.timestamp)}</span> <span class="font-mono text-blue-900">${cmToMeters(data.last_tide.height_cm)} m</span> <span class="text-xs text-gray-500">(${data.last_tide.height_ft} ft)</span></div>`);

          // Show next High and next Low tide (times + heights) if available
          try{
            const now = Date.now();
            const upcomingList = [];
            const days = data.next_seven_days || {};
            Object.keys(days).forEach(k=>{
              const arr = days[k].tidal_events || days[k].tides || days[k].tide_events || days[k].events || [];
              arr.forEach(i=> upcomingList.push(i));
            });
            upcomingList.sort((a,b)=> new Date(a.timestamp) - new Date(b.timestamp));
            const nextHigh = upcomingList.find(e=> e.high && new Date(e.timestamp).getTime() > now) || (data.next_tide && data.next_tide.high ? data.next_tide : null);
            const nextLow = upcomingList.find(e=> !e.high && new Date(e.timestamp).getTime() > now) || (data.next_tide && !data.next_tide.high ? data.next_tide : null);
            if(nextHigh || nextLow){
              parts.push('<div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">');
              if(nextHigh){
                parts.push(`<div class="bg-blue-50 border border-blue-100 rounded p-3 text-center"><div class="font-semibold text-blue-700">Next High</div><div class="mt-1">${fmt(nextHigh.timestamp)}</div><div class="font-mono text-blue-900 mt-1">${nextHigh.height_cm? cmToMeters(nextHigh.height_cm) + ' m' : '—'}</div></div>`);
              }
              if(nextLow){
                parts.push(`<div class="bg-blue-50 border border-blue-100 rounded p-3 text-center"><div class="font-semibold text-blue-700">Next Low</div><div class="mt-1">${fmt(nextLow.timestamp)}</div><div class="font-mono text-blue-900 mt-1">${nextLow.height_cm? cmToMeters(nextLow.height_cm) + ' m' : '—'}</div></div>`);
              }
              parts.push('</div>');
            }
          }catch(e){ /* ignore */ }
      }
    }
    // Collect upcoming events from next_seven_days if structure present
    const upcoming = [];
    const days = data.next_seven_days || {};
    Object.keys(days).forEach(dayKey => {
      const dayObj = days[dayKey];
      // Try all possible property names for tide events
      const tidesArr = dayObj.tidal_events || dayObj.tides || dayObj.tide_events || dayObj.events || [];
      tidesArr.forEach(t => upcoming.push(t));
    });
    if(upcoming.length){
      upcoming.sort((a,b)=> new Date(a.timestamp) - new Date(b.timestamp));
      parts.push('<h4 class="mt-4 font-semibold text-blue-700 text-center">24h Tides</h4>' + listEvents(upcoming.slice(0,6)));
    } else {
      // Fallback approximate series based on next_tide
      parts.push('<h4 class="mt-4 font-semibold text-blue-700 text-center">Approximate Upcoming</h4>' + buildApproximate(data.next_tide));
    }
    parts.push('</div>'); // end card
    el.innerHTML = parts.join('');
  }

  async function fetchViaWorker(){
    if(!WORKER_ENDPOINT.includes('YOUR-WORKER-URL')){
      // Append a cache-busting timestamp to the worker URL
      const url = new URL(WORKER_ENDPOINT);
      url.searchParams.set('cache_bust', new Date().getTime());

      const r = await fetch(url.toString(), {headers:{'Accept':'application/json'}});
      if(!r.ok) throw new Error('Worker HTTP '+r.status);
      const text = await r.text();
      try {
        return JSON.parse(text);
      } catch(e) {
        console.error('Worker JSON parse error:', e);
        throw new Error('Worker JSON parse error');
      }
    }
    throw new Error('Worker endpoint not configured');
  }

  async function fetchDirect(){
    const r = await fetch(DIRECT_ENDPOINT,{headers:{'Accept':'application/json','Cache-Control':'no-cache'}});
    if(!r.ok) throw new Error('Direct HTTP '+r.status);
    return r.json();
  }

  async function fetchViaProxy(){
    const proxied = CORS_PROXY_PREFIX + encodeURIComponent(DIRECT_ENDPOINT);
    const r = await fetch(proxied,{headers:{'Cache-Control':'no-cache'}});
    if(!r.ok) throw new Error('Proxy HTTP '+r.status);
    // allorigins raw returns the upstream body directly (JSON string)
    const text = await r.text();
    try { return JSON.parse(text); } catch(e){ throw new Error('Proxy JSON parse failed'); }
  }

  function chooseNextChain(errorChain){
    // Only try the Worker for now
    return fetchViaWorker().catch(e=>{
      console.error('Worker fetch failed:', e);
      return Promise.reject(errorChain);
    });
  }

  async function load(){
    const el = document.getElementById(containerId);
    if(!el) return;
    el.textContent = 'Loading Rathmullan tide data...';
    try{
      const data = await chooseNextChain({});
      render(data);
      // Trigger tide chart rendering if function exists (slight delay to ensure data is set)
      setTimeout(() => {
        if (typeof window.renderTideChart === 'function') {
          window.renderTideChart();
        }
      }, 100);
      // start periodic refresh (one interval only)
      if(!autoRefreshInterval){
        autoRefreshInterval = setInterval(async ()=>{
          try{
            const d = await chooseNextChain({});
            if(d) render(d);
          }catch(e){ /* keep trying */ }
        }, POLL_INTERVAL_MS);
      }
    }catch(chain){
      el.innerHTML = '<p class="text-sm text-red-600">Live tide data unavailable (CORS/503). Showing approximate.</p>' +
        buildApproximate({timestamp: new Date().toISOString(), high: true, height_cm: 300, height_ft: 9.8});
      // Even when initial fetch fails, keep polling so we can recover automatically
      if(!autoRefreshInterval){
        autoRefreshInterval = setInterval(async ()=>{
          try{
            const d = await chooseNextChain({});
            if(d){ render(d); clearInterval(autoRefreshInterval); autoRefreshInterval = null; }
          }catch(e){ /* ignore and retry */ }
        }, POLL_INTERVAL_MS);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', load);

  // Optional live-reload for development: auto-enable on localhost/file or when query/localStorage flag present
  (function maybeEnableLiveReload(){
    try{
      const params = new URLSearchParams(window.location.search);
      const localFlag = window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:' || localStorage.getItem('liveReload') === '1';
      if(!params.get('liveReload') && !localFlag) return;
      const scriptTag = Array.from(document.scripts).find(s=> s.src && s.src.includes('tides.js'));
      if(!scriptTag) return;
      const scriptUrl = scriptTag.src.split('#')[0].split('?')[0];
      let lastText = null;
      // initial fetch
      fetch(scriptUrl, {cache: 'no-store'}).then(r=>r.text()).then(t=>{ lastText = t; }).catch(()=>{});
      // poll every 3s
      setInterval(()=>{
        fetch(scriptUrl, {cache: 'no-store'}).then(r=>r.text()).then(t=>{
          if(lastText && t && t !== lastText){
            // script changed — reload the page to pick up new code
            window.location.replace(window.location.href);
          }
          lastText = t;
        }).catch(()=>{});
      }, 3000);
    }catch(e){}
  })();
})();
