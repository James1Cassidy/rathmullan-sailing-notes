// PWA helper: register service worker and handle install prompt
(function () {
  if (!('serviceWorker' in navigator)) return;

  // Register service worker
  navigator.serviceWorker.register('/sw.js').then(reg => {
    console.log('SW registered', reg);
  }).catch(err => console.warn('SW register failed', err));

  // Install prompt handling
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-info bar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  function showInstallBanner() {
    // Avoid duplicate banners
    if (document.getElementById('pwa-install-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed left-4 right-4 bottom-6 z-50 flex items-center justify-between bg-white border rounded-lg shadow-lg p-3';
    banner.style.maxWidth = '480px';
    banner.style.margin = '0 auto';

    const text = document.createElement('div');
    text.innerHTML = '<strong>Install app</strong><div class="text-sm text-gray-600">Add this site to your home screen for quick access.</div>';

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';

    const installBtn = document.createElement('button');
    installBtn.className = 'bg-blue-600 text-white px-3 py-1 rounded';
    installBtn.textContent = 'Install';
    installBtn.onclick = () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choice => {
        if (choice.outcome === 'accepted') console.log('PWA: user accepted install');
        deferredPrompt = null;
        removeBanner();
      }).catch(() => { deferredPrompt = null; removeBanner(); });
    };

    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'bg-gray-100 text-gray-800 px-3 py-1 rounded';
    dismissBtn.textContent = 'Dismiss';
    dismissBtn.onclick = () => { removeBanner(); };

    actions.appendChild(installBtn);
    actions.appendChild(dismissBtn);

    banner.appendChild(text);
    banner.appendChild(actions);
    document.body.appendChild(banner);

    function removeBanner() { try { document.body.removeChild(banner); } catch (_) {} }
  }
})();
