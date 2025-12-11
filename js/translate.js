// Simple site-wide translation toggle (English ↔ Gaeilge)
// Uses Google Website Translator and the 'googtrans' cookie to persist language.
(function(){
  function injectStyle(){
    var css = [
      '#google_translate_element{display:none!important}',
      '.goog-te-banner-frame{display:none!important}',
      'body{top:0!important}',
      '.goog-te-menu-frame{box-shadow:none!important}',
    ].join('\n');
    var style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function ensureHostElement(){
    if(!document.getElementById('google_translate_element')){
      var host = document.createElement('div');
      host.id = 'google_translate_element';
      host.style.display = 'none';
      document.body.appendChild(host);
    }
  }

  function loadGoogleTranslate(){
    if(window.google && window.google.translate) return;
    window.googleTranslateElementInit = function(){
      try {
        new google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,ga',
          autoDisplay: false,
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
      } catch(e) {
        console.warn('Translate init failed:', e);
      }
    };
    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.defer = true;
    document.head.appendChild(s);
  }

  function setCookie(name, value, domain){
    var expires = '; expires=' + new Date(Date.now()+365*24*60*60*1000).toUTCString();
    var path = '; path=/';
    var dom = domain ? ('; domain=' + domain) : '';
    document.cookie = name + '=' + value + expires + path + dom;
  }

  function getCookie(name){
    return (document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)') || 0)[2] || '';
  }

  function applyLang(lang){
    var val = '/en/' + lang;
    try {
      setCookie('googtrans', val);
      setCookie('googtrans', val, window.location.hostname);
      // also set on parent domain if possible
      var host = window.location.hostname;
      if(host.indexOf('.') !== -1){
        var parts = host.split('.');
        if(parts.length >= 2){
          setCookie('googtrans', val, '.' + parts.slice(-2).join('.'));
        }
      }
    } catch(e) {
      console.warn('Failed to set language cookie:', e);
    }
    // Small delay to allow cookie write
    setTimeout(function(){ window.location.reload(); }, 50);
  }

  function currentLang(){
    var v = getCookie('googtrans');
    if(v && v.split('/').length >= 3) return v.split('/')[2];
    return 'en';
  }

  function buildButtons(){
    var container = document.querySelector('header .container') || document.querySelector('header');
    if(!container) return;

    var wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.gap = '8px';
    wrap.style.alignItems = 'center';
    wrap.style.marginLeft = '8px';

    var btnGa = document.createElement('button');
    btnGa.id = 'translate-ga';
    btnGa.textContent = 'Gaeilge';
    btnGa.className = 'ml-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm';
    btnGa.addEventListener('click', function(){ applyLang('ga'); });

    var btnEn = document.createElement('button');
    btnEn.id = 'translate-en';
    btnEn.textContent = 'English';
    btnEn.className = 'ml-2 bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300 text-sm';
    btnEn.addEventListener('click', function(){ applyLang('en'); });

    var lang = currentLang();
    if(lang === 'ga'){
      btnGa.className += ' ring-2 ring-white';
    } else {
      btnEn.className += ' ring-2 ring-blue-300';
    }

    wrap.appendChild(btnGa);
    wrap.appendChild(btnEn);

    // Insert near the end of header content
    container.appendChild(wrap);
  }

  document.addEventListener('DOMContentLoaded', function(){
    injectStyle();
    ensureHostElement();
    loadGoogleTranslate();
    buildButtons();
  });
})();
