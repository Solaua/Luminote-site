/* Luminote — site vitrine.
   1) Bascule de langue FR/EN/ES : détection navigateur + choix manuel
      mémorisé localement (localStorage, jamais transmis).
   2) Mouvement réduit : la vidéo de jeu reste figée sur son image. */
(function () {
  var LANGS = ['fr', 'en', 'es'];
  var KEY = 'luminote-site-lang';

  function detect() {
    try {
      var saved = localStorage.getItem(KEY);
      if (LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) { /* stockage indisponible : on retombe sur le navigateur */ }
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return LANGS.indexOf(nav) !== -1 ? nav : 'en';
  }

  function apply(lang) {
    var html = document.documentElement;
    LANGS.forEach(function (l) { html.classList.remove('lang-' + l); });
    html.classList.add('lang-' + lang);
    html.setAttribute('lang', lang);
    document.querySelectorAll('.lang-switch button').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
    });
    var titles = document.body.dataset;
    var t = titles['title' + lang.charAt(0).toUpperCase() + lang.slice(1)];
    if (t) document.title = t;
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply(detect());
    document.querySelectorAll('.lang-switch button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        try { localStorage.setItem(KEY, btn.dataset.lang); } catch (e) { /* sans gravité */ }
        apply(btn.dataset.lang);
      });
    });

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('video[autoplay]').forEach(function (v) {
        v.pause(); v.removeAttribute('autoplay'); v.currentTime = 0; v.load();
      });
    }
  });
})();
