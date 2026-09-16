export function rerenderPreservingFocus(root, renderFn) {
  const active = document.activeElement;
  let savedId = null, savedStart = null, savedEnd = null;
  if (active && root.contains(active) && active.id) {
    savedId = active.id;
    if (typeof active.selectionStart === 'number') {
      savedStart = active.selectionStart;
      savedEnd = active.selectionEnd;
    }
  }
  renderFn();
  if (savedId) {
    const el = document.getElementById(savedId);
    if (el && root.contains(el)) {
      el.focus();
      if (savedStart !== null && typeof el.setSelectionRange === 'function') {
        try { el.setSelectionRange(savedStart, savedEnd); } catch (_) { /* not a text-like input */ }
      }
    }
  }
}
