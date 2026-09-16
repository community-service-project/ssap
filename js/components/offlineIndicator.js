import { icon, refreshIcons } from '../icons.js';

let showReconnected = false;
let reconnectTimer = null;

export function mountOfflineIndicator() {
  const root = document.getElementById('offline-indicator-root');

  function render() {
    const isOnline = navigator.onLine;

    if (showReconnected) {
      root.innerHTML = `
        <div id="reconnected-banner" class="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl animate-fade-in">
          ${icon('CheckCircle', 'w-4 h-4 text-emerald-200')}
          <span>Back online — All changes synchronized</span>
        </div>`;
    } else if (!isOnline) {
      root.innerHTML = `
        <div id="offline-banner" class="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl animate-bounce-subtle">
          ${icon('WifiOff', 'w-4 h-4 text-amber-200 animate-pulse')}
          <span>Offline Shell Active — Local storage keeping your data safe</span>
        </div>`;
    } else {
      root.innerHTML = '';
    }
    refreshIcons();
  }

  window.addEventListener('online', () => {
    showReconnected = true;
    render();
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => { showReconnected = false; render(); }, 3000);
  });
  window.addEventListener('offline', () => {
    showReconnected = false;
    render();
  });

  render();
}
