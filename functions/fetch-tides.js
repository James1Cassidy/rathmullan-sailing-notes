/**
 * Serverless function to fetch tide data from tidesnear.me
 * Bypasses CORS restrictions by making request server-side
 */

const https = require('https');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const url = 'https://tidesnear.me/tide_stations/3459';

    const html = await new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': 'https://tidesnear.me/',
          'Connection': 'keep-alive'
        },
        timeout: 10000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject).on('timeout', () => reject(new Error('Request timeout')));
    });

    // Parse tide data from HTML
    const tides = parseTideHTML(html);

    // Basic heuristics: if page is extremely short or lacks High/Low keywords, likely blocked or needs JS
    let reason = null;
    if (!/High|Low/i.test(html)) {
      reason = 'No High/Low keywords in raw HTML (likely JS‑rendered or blocked)';
    } else if (html.length < 2000) {
      reason = 'HTML too short (' + html.length + ' bytes) – possibly blocked by anti‑bot';
    }

    // If no tides found, attempt lightweight fallback by stripping scripts
    if (!tides.length) {
      const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, '');
      const retry = parseTideHTML(stripped);
      if (retry.length) {
        tides.push(...retry);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        station: 'Rathmullan, Lough Swilly',
        tides,
        fetchedAt: new Date().toISOString(),
        diagnostics: {
          htmlBytes: html.length,
          patternHits: tides.length,
          reason
        }
      })
    };

  } catch (error) {
    console.error('Tide fetch error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

function parseTideHTML(html) {
  const results = [];

  // Candidate regexes (broad coverage)
  const patterns = [
    /(High|Low)\s*Tide\s*(?:at)?\s*(\d{1,2}):(\d{2})\s*(AM|PM)/gi,
    /(High|Low)\s*(\d{1,2}):(\d{2})\s*(AM|PM)/gi,
    /(\d{1,2}):(\d{2})\s*(AM|PM)\s*(High|Low)/gi,
    // e.g. High 6:30am or Low 11:05pm without space before am/pm
    /(High|Low)\s*(\d{1,2}):(\d{2})(am|pm)/gi,
    /(\d{1,2}):(\d{2})(am|pm)\s*(High|Low)/gi
  ];

  const heightAroundWindow = 60; // chars to search near match for height
  const heightRegex = /(\d+(?:\.\d+)?)\s*(m|ft)/i;

  patterns.forEach(pat => {
    let match;
    while ((match = pat.exec(html)) !== null) {
      let type, hour, minute, meridiem;
      if (/High|Low/i.test(match[1])) {
        // Pattern where High/Low first
        type = match[1].toLowerCase();
        hour = parseInt(match[2], 10);
        minute = parseInt(match[3], 10);
        meridiem = (match[4] || match[5] || '').toUpperCase();
      } else {
        // Pattern where High/Low last
        hour = parseInt(match[1], 10);
        minute = parseInt(match[2], 10);
        meridiem = (match[3] || '').toUpperCase();
        type = (match[4] || match[5] || '').toLowerCase();
      }
      if (!type || !hour || isNaN(minute)) continue;

      // Normalize meridiem (AM/PM)
      if (meridiem === 'PM' && hour !== 12) hour += 12;
      if (meridiem === 'AM' && hour === 12) hour = 0;

      const date = new Date();
      const tideTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0);

      // Height search around match index
      let height = null;
      const startWindow = Math.max(0, match.index - heightAroundWindow);
      const endWindow = Math.min(html.length, match.index + heightAroundWindow);
      const windowSlice = html.slice(startWindow, endWindow);
      const heightMatch = windowSlice.match(heightRegex);
      if (heightMatch) {
        height = parseFloat(heightMatch[1]);
        if (heightMatch[2].toLowerCase() === 'ft') {
          // Convert feet to meters approx.
          height = +(height * 0.3048).toFixed(2);
        }
      }

      results.push({
        time: tideTime.toISOString(),
        type,
        height
      });
    }
  });

  // Deduplicate by time+type
  const dedupMap = new Map();
  results.forEach(r => {
    const key = r.type + '|' + r.time;
    if (!dedupMap.has(key)) dedupMap.set(key, r);
  });
  return Array.from(dedupMap.values());
}
