// Delegated click handler: works for static or dynamically-inserted buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.toggle[aria-pressed]');
  if (!btn) return;
  const on = btn.getAttribute('aria-pressed') === 'true';
  btn.setAttribute('aria-pressed', String(!on));
  // Broadcast for app logic
  btn.dispatchEvent(new CustomEvent('togglechange', { bubbles: true, detail: { id: btn.id, on: !on } }));
});
