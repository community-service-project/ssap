// Renders a lucide icon as an inline placeholder <i> tag.
// After inserting HTML into the DOM, call refreshIcons() to turn these into SVGs
// (wraps window.lucide.createIcons(), loaded via the lucide CDN script in index.html).
export function icon(name, cls = '') {
  const kebab = name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
    .toLowerCase();
  return `<i data-lucide="${kebab}" class="${cls}"></i>`;
}

export function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}
