import { icon, refreshIcons } from '../icons.js';

let deferredPrompt = null;
let isInstalled = false;
let isIOS = false;
let showIOSGuide = false;
const initListeners = [];

function detectInstalled() {
  isInstalled =
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function initGlobalPWAListeners() {
  if (initListeners.length) return; // only wire once
  detectInstalled();
  isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

  const onBeforeInstall = (e) => {
    e.preventDefault();
    deferredPrompt = e;
    rerenderAll();
  };
  const onInstalled = () => {
    isInstalled = true;
    deferredPrompt = null;
    rerenderAll();
  };
  window.addEventListener('beforeinstallprompt', onBeforeInstall);
  window.addEventListener('appinstalled', onInstalled);
  initListeners.push(onBeforeInstall, onInstalled);
}

const slots = new Set(); // { elId, variant, className }
function rerenderAll() {
  slots.forEach((slot) => renderInto(slot));
}

async function install() {
  if (!deferredPrompt) return;
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    isInstalled = true;
    deferredPrompt = null;
  }
  rerenderAll();
}

function iosGuideMarkup() {
  if (!showIOSGuide) return '';
  return `
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
    <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          ${icon('Download', 'w-5 h-5 text-indigo-600')}
          Install SSAP on iPhone / iPad
        </h3>
        <button data-pwa-close-ios class="p-1 text-slate-400 hover:text-slate-600 rounded-md">${icon('X', 'w-5 h-5')}</button>
      </div>
      <div class="mt-4 space-y-3 text-sm text-slate-600">
        <div class="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
          <div class="p-2 bg-white rounded-lg shadow-xs text-indigo-600">${icon('Share', 'w-4 h-4')}</div>
          <div><strong class="block text-slate-900 font-semibold">1. Tap Share</strong>Tap the Share icon in the Safari bottom toolbar.</div>
        </div>
        <div class="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
          <div class="p-2 bg-white rounded-lg shadow-xs text-indigo-600">${icon('PlusSquare', 'w-4 h-4')}</div>
          <div><strong class="block text-slate-900 font-semibold">2. Add to Home Screen</strong>Scroll down and select <em>"Add to Home Screen"</em>.</div>
        </div>
      </div>
      <button data-pwa-close-ios class="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition">Got It</button>
    </div>
  </div>`;
}

function renderInto(slot) {
  const el = document.getElementById(slot.elId);
  if (!el) { slots.delete(slot); return; }

  if (isInstalled) { el.innerHTML = ''; return; }

  if (deferredPrompt) {
    if (slot.variant === 'compact') {
      el.innerHTML = `<button id="pwa-install-compact-btn" title="Install SSAP App" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors ${slot.className}">${icon('Download', 'w-3.5 h-3.5')}<span>Install</span></button>`;
    } else {
      el.innerHTML = `<button id="pwa-install-main-btn" class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-98 transition ${slot.className}">${icon('Download', 'w-4 h-4')}<span>Install PWA</span></button>`;
    }
    el.querySelector('button')?.addEventListener('click', install);
  } else if (isIOS) {
    el.innerHTML = `
      <button id="pwa-install-ios-btn" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs ${slot.className}">
        ${icon('Download', 'w-3.5 h-3.5 text-indigo-600')}<span>Install on iOS</span>
      </button>
      ${iosGuideMarkup()}`;
    el.querySelector('#pwa-install-ios-btn')?.addEventListener('click', () => { showIOSGuide = true; rerenderAll(); });
    el.querySelectorAll('[data-pwa-close-ios]').forEach((b) => b.addEventListener('click', () => { showIOSGuide = false; rerenderAll(); }));
  } else {
    el.innerHTML = '';
  }
  refreshIcons();
}

// Returns a placeholder <div> to embed in a parent's HTML string; call
// mountPWAInstallSlot with the same elId right after the parent is in the DOM.
export function pwaInstallSlot(elId, variant = 'button', className = '') {
  slots.add({ elId, variant, className });
  return `<div id="${elId}"></div>`;
}

export function mountPWAInstallSlots() {
  initGlobalPWAListeners();
  rerenderAll();
}
