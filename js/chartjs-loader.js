// Chart.js v3.x + plugins CDN loader (luxon adapter, zoom, annotation)
(function(){
  if (window.Chart && window.ChartLoaded) {
    return;
  }

  // Load scripts sequentially to ensure dependencies are met
  var scripts = [
    'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
    'https://cdn.jsdelivr.net/npm/luxon@2.3.0/build/global/luxon.min.js',
    'https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon@1.2.0/dist/chartjs-adapter-luxon.min.js',
    'https://cdn.jsdelivr.net/npm/hammerjs@2.0.8/hammer.min.js',
    'https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@1.2.1/dist/chartjs-plugin-zoom.min.js',
    'https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@1.4.0/dist/chartjs-plugin-annotation.min.js'
  ];

  var index = 0;

  function loadNext() {
    if (index >= scripts.length) {
      window.ChartLoaded = true;
      console.log('All Chart.js scripts loaded');
      return;
    }
    var s = document.createElement('script');
    s.src = scripts[index];
    s.onload = function() {
      index++;
      loadNext();
    };
    s.onerror = function() {
      console.warn('Failed to load', scripts[index]);
      index++;
      loadNext();
    };
    document.head.appendChild(s);
  }

  loadNext();
})();
