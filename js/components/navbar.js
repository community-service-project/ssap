import { icon, refreshIcons } from '../icons.js';
import { AppLogo } from './appLogo.js';
import { pwaInstallSlot, mountPWAInstallSlots } from './pwaInstall.js';
import { store, navigateTo } from '../store.js';
import { signOut } from '../auth.js';

let mobileMenuOpen = false;

const AUTH_NAV_ITEMS = [
  { view: 'dashboard', label: 'Dashboard', iconName: 'Compass' },
  { view: 'tasks', label: 'Tasks', iconName: 'CheckSquare' },
  { view: 'academic', label: 'Academic', iconName: 'BookOpen' },
  { view: 'personal', label: 'Personal', iconName: 'Heart' },
  { view: 'goals', label: 'Goals', iconName: 'Target' },
  { view: 'schedule', label: 'Schedule', iconName: 'Calendar' },
  { view: 'settings', label: 'Settings', iconName: 'Settings' },
];

export function renderNavbar() {
  const root = document.getElementById('navbar-root');
  const { currentView, isLoggedIn, user, notifications } = store.state;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const desktopNav = isLoggedIn
    ? AUTH_NAV_ITEMS.map((item) => {
        const isActive = currentView === item.view;
        return `<button data-nav="${item.view}" id="nav-${item.view}-btn" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
          isActive ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }">${icon(item.iconName, 'w-4 h-4')}<span>${item.label}</span></button>`;
      }).join('')
    : `<div class="flex items-center gap-1 text-xs font-medium">
        <button data-nav="landing" id="nav-landing-public-btn" class="px-3 py-1.5 rounded-lg transition ${currentView === 'landing' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white'}">Overview</button>
        <button data-nav="how_to_use" id="nav-how-to-use-public-btn" class="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${currentView === 'how_to_use' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white'}">${icon('HelpCircle', 'w-3.5 h-3.5 text-indigo-400')}<span>How to Use</span></button>
        <button data-nav="creators" id="nav-creators-public-btn" class="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${currentView === 'creators' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white'}">${icon('Users', 'w-3.5 h-3.5 text-cyan-400')}<span>Meet the Creators</span></button>
      </div>`;

  const rightCluster = isLoggedIn
    ? `
      <button id="navbar-quick-add-btn" title="Quick Add Task (Alt+N)" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition">
        ${icon('Plus', 'w-3.5 h-3.5')}<span class="hidden sm:inline">Quick Add</span>
      </button>
      <button id="navbar-notifications-btn" title="Smart Notifications" class="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition">
        ${icon('Bell', 'w-4 h-4')}
        ${unreadCount > 0 ? `<span id="notifications-badge" class="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center rounded-full animate-pulse ring-2 ring-slate-900">${unreadCount}</span>` : ''}
      </button>
      <div class="flex items-center gap-2 pl-2 border-l border-slate-800">
        <div data-nav="settings" class="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-xs" title="${user.name} (${user.email})">${(user.name || '?').charAt(0)}</div>
        <button id="navbar-logout-btn" title="Sign Out" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition">${icon('LogOut', 'w-4 h-4')}</button>
      </div>`
    : `
      <div class="flex items-center gap-2">
        <button id="nav-login-btn" class="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white rounded-lg hover:bg-slate-800 transition">Sign In</button>
        <button id="nav-register-btn" class="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition">Get Started</button>
      </div>`;

  const mobileMenu = mobileMenuOpen
    ? `<div class="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1 animate-fade-in">
        ${isLoggedIn ? `
          <div class="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Productivity Command</div>
          ${AUTH_NAV_ITEMS.map((item) => `<button data-nav="${item.view}" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left ${currentView === item.view ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}">${icon(item.iconName, 'w-4 h-4')}<span>${item.label}</span></button>`).join('')}
          <div class="pt-2 border-t border-slate-800 mt-2 space-y-1">
            <button data-nav="how_to_use" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white">${icon('HelpCircle', 'w-4 h-4')}<span>How to Use SSAP</span></button>
            <button data-nav="creators" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white">${icon('Users', 'w-4 h-4')}<span>Meet the Creators</span></button>
          </div>` : `
          <div class="space-y-2 pt-1 pb-2">
            <button data-nav="landing" class="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg">Overview</button>
            <button data-nav="how_to_use" class="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg">How to Use Guide</button>
            <button data-nav="creators" class="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg">Meet the Creators</button>
          </div>`}
      </div>`
    : '';

  root.innerHTML = `
    <header class="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <button id="brand-logo-btn" data-nav="${isLoggedIn ? 'dashboard' : 'landing'}" class="flex items-center gap-2.5 text-left group">
              ${AppLogo({ size: 'md', variant: 'compass_shield' })}
              <div class="flex flex-col"><span class="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">SSAP</span></div>
            </button>
          </div>
          <nav class="hidden md:flex items-center gap-1">${desktopNav}</nav>
          <div class="flex items-center gap-2 sm:gap-3">
            ${pwaInstallSlot('navbar-pwa-slot', 'compact', 'hidden sm:inline-flex')}
            ${rightCluster}
            <button id="mobile-menu-toggle-btn" class="p-2 text-slate-300 hover:text-white md:hidden rounded-lg hover:bg-slate-800">${mobileMenuOpen ? icon('X', 'w-5 h-5') : icon('Menu', 'w-5 h-5')}</button>
          </div>
        </div>
      </div>
      ${mobileMenu}
    </header>`;

  // Event wiring
  root.querySelectorAll('[data-nav]').forEach((elm) => {
    elm.addEventListener('click', () => {
      navigateTo(elm.getAttribute('data-nav'));
      mobileMenuOpen = false;
      renderNavbar();
    });
  });
  root.querySelector('#mobile-menu-toggle-btn')?.addEventListener('click', () => {
    mobileMenuOpen = !mobileMenuOpen;
    renderNavbar();
  });
  root.querySelector('#navbar-quick-add-btn')?.addEventListener('click', () => store.setState({ isQuickAddOpen: true }));
  root.querySelector('#navbar-notifications-btn')?.addEventListener('click', () => store.setState({ isNotificationsOpen: true }));
  root.querySelector('#navbar-logout-btn')?.addEventListener('click', async () => { await signOut(); });
  root.querySelector('#nav-login-btn')?.addEventListener('click', () => store.setState({ authModal: { isOpen: true, mode: 'login' } }));
  root.querySelector('#nav-register-btn')?.addEventListener('click', () => store.setState({ authModal: { isOpen: true, mode: 'register' } }));

  refreshIcons();
  mountPWAInstallSlots();
}
