import { icon, refreshIcons } from '../icons.js';
import { store, markAllNotificationsRead, clearAllNotifications, triggerTestNotification } from '../store.js';
import { requestNotificationPermission, sendSmartNotification, playNotificationChime } from '../notifications.js';

let permStatus = typeof Notification !== 'undefined' ? Notification.permission : 'default';

function iconForType(type) {
  switch (type) {
    case 'reminder_5m':
    case 'reminder_1m':
      return icon('Clock', 'w-4 h-4 text-indigo-600');
    case 'sleep_winddown':
      return icon('Moon', 'w-4 h-4 text-purple-600');
    case 'overdue':
      return icon('ShieldAlert', 'w-4 h-4 text-rose-600');
    case 'start':
      return icon('Sparkles', 'w-4 h-4 text-emerald-600');
    default:
      return icon('Bell', 'w-4 h-4 text-slate-600');
  }
}

export function renderNotificationDrawer() {
  const root = document.getElementById('notification-drawer-root');
  const { isNotificationsOpen, notifications } = store.state;
  if (!isNotificationsOpen) { root.innerHTML = ''; return; }

  root.innerHTML = `
  <div class="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
    <div id="notification-drawer-panel" class="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right">
      <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-indigo-50 text-indigo-600">${icon('Bell', 'w-5 h-5')}</div>
          <div><h2 class="text-base font-bold text-slate-900">Smart Notifications</h2><p class="text-xs text-slate-500">5-min, 1-min &amp; wind-down reminders</p></div>
        </div>
        <button id="close-notifications-drawer-btn" class="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">${icon('X', 'w-5 h-5')}</button>
      </div>

      ${permStatus !== 'granted' ? `
      <div class="m-4 p-3.5 bg-indigo-50/80 border border-indigo-100 rounded-xl flex items-start gap-3">
        ${icon('Volume2', 'w-5 h-5 text-indigo-600 shrink-0 mt-0.5')}
        <div class="flex-1 text-xs text-indigo-900">
          <span class="font-semibold block mb-0.5">Enable Browser Audio &amp; Web Push</span>
          Get native desktop &amp; mobile alerts before exams, lectures, and sleep wind-down.
          <button id="enable-browser-notifs-btn" class="mt-2 block px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-xs transition">Allow Notifications</button>
        </div>
      </div>` : ''}

      <div class="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
        <button id="test-smart-notification-btn" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-semibold rounded-lg transition">${icon('Sparkles', 'w-3.5 h-3.5')}<span>Test 5-Min Alert</span></button>
        <div class="flex items-center gap-2">
          ${notifications.some((n) => !n.read) ? `<button id="mark-all-read-btn" class="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded">${icon('Check', 'w-3.5 h-3.5')}<span>Mark read</span></button>` : ''}
          ${notifications.length > 0 ? `<button id="clear-all-notifs-btn" class="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-medium px-2 py-1 rounded">${icon('Trash2', 'w-3.5 h-3.5')}<span>Clear</span></button>` : ''}
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        ${notifications.length === 0 ? `
          <div class="py-16 text-center text-slate-400">
            ${icon('Bell', 'w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1')}
            <p class="text-sm font-medium text-slate-600">No recent notifications</p>
            <p class="text-xs text-slate-400 mt-1">Reminders will appear 5 minutes and 1 minute before scheduled items.</p>
          </div>` : notifications.map((n) => `
          <div class="p-3.5 rounded-xl border transition-all ${n.read ? 'bg-white border-slate-200' : 'bg-indigo-50/40 border-indigo-200 shadow-xs'}">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-slate-100 shrink-0">${iconForType(n.type)}</div>
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline justify-between gap-2">
                  <h4 class="text-xs sm:text-sm font-semibold text-slate-900 truncate">${n.title}</h4>
                  ${!n.read ? '<span class="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>' : ''}
                </div>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">${n.message}</p>
                <span class="text-[10px] text-slate-400 mt-2 block">${new Date(n.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>`).join('')}
      </div>

      <div class="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 text-center">Configured in Settings: 5m, 1m, start time &amp; sleep wind-down</div>
    </div>
  </div>`;

  root.querySelector('#close-notifications-drawer-btn')?.addEventListener('click', () => store.setState({ isNotificationsOpen: false }));
  root.querySelector('#enable-browser-notifs-btn')?.addEventListener('click', async () => {
    const res = await requestNotificationPermission();
    permStatus = res;
    if (res === 'granted') sendSmartNotification('Smart Notifications Active', { body: 'SSAP will deliver 5-minute and 1-minute reminders before your commitments.' });
    renderNotificationDrawer();
  });
  root.querySelector('#test-smart-notification-btn')?.addEventListener('click', () => {
    playNotificationChime();
    triggerTestNotification();
  });
  root.querySelector('#mark-all-read-btn')?.addEventListener('click', markAllNotificationsRead);
  root.querySelector('#clear-all-notifs-btn')?.addEventListener('click', clearAllNotifications);

  refreshIcons();
}
