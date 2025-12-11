// Add loading="lazy" and decoding="async" to images site-wide where possible
(function(){
  function enhance(img){
    if(!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
    if(!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
  }
  document.querySelectorAll('img').forEach(enhance);
  // Observe dynamically added images
  const obs = new MutationObserver(muts => {
    for (const m of muts) {
      m.addedNodes.forEach(n => {
        if (n.tagName === 'IMG') enhance(n);
        if (n.querySelectorAll) n.querySelectorAll('img').forEach(enhance);
      });
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();
