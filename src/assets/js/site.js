// Menu do celular
(function () {
  var btn = document.getElementById('menu-btn');
  var panel = document.getElementById('menu-panel');
  if (!btn || !panel) return;
  btn.addEventListener('click', function () {
    var open = panel.hasAttribute('hidden');
    if (open) { panel.removeAttribute('hidden'); } else { panel.setAttribute('hidden', ''); }
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
})();
// Parallax do anel de palavras (ponteiro)
document.querySelectorAll('.ring-sec').forEach(function (s) {
  s.addEventListener('pointermove', function (e) {
    var r = s.getBoundingClientRect();
    s.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3));
    s.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3));
  });
  s.addEventListener('pointerleave', function () {
    s.style.setProperty('--mx', 0); s.style.setProperty('--my', 0);
  });
});
