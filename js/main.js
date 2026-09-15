import { store, loadAllDataForUser, pushNotifications } from './store.js';
import { getSession, onAuthStateChange, signOut } from './auth.js';
import { checkScheduledReminders, sendSmartNotification } from './notifications.js';
import { renderNavbar } from './components/navbar.js';
import { renderQuickAddModal } from './components/quickAddModal.js';
import { renderNotificationDrawer } from './components/notificationDrawer.js';
import { renderAuthModal } from './components/authModal.js';
import { mountOfflineIndicator } from './components/offlineIndicator.js';
import { renderLanding } from './views/landing.js';
import { renderHowToUse } from './views/howToUse.js';
import { renderCreators } from './views/creators.js';
import { renderDashboard } from './views/dashboard.js';
import { renderTasks } from './views/tasks.js';
import { renderAcademic } from './views/academic.js';
import { renderPersonal } from './views/personal.js';
import { renderGoals } from './views/goals.js';
import { renderSchedule } from './views/schedule.js';
import { renderSettings } from './views/settings.js';

const VIEW_RENDERERS = {
  landing: renderLanding,
  how_to_use: renderHowToUse,
  creators: renderCreators,
  dashboard: renderDashboard,
  tasks: renderTasks,
  academic: renderAcademic,
  personal: renderPersonal,
  goals: renderGoals,
  schedule: renderSchedule,
  settings: renderSettings,
};

function renderCurrentView() {
  const root = document.getElementById('view-root');
  const renderer = VIEW_RENDERERS[store.state.currentView] || renderLanding;
  renderer(root);
}

function renderAll() {
  renderNavbar();
  renderCurrentView();
  renderQuickAddModal();
  renderNotificationDrawer();
  renderAuthModal();
}

store.subscribe(renderAll);

// ----------------------------------------------------------------------------
// Auth bootstrap
// ----------------------------------------------------------------------------
async function handleSession(session) {
  const wasLoggedIn = store.state.isLoggedIn;
  const isLoggedIn = !!session;

  if (isLoggedIn && !wasLoggedIn) {
    store.setState({ session, isLoggedIn: true, currentView: 'dashboard', authModal: { isOpen: false, mode: 'login' } });
    await loadAllDataForUser();
  } else if (!isLoggedIn && wasLoggedIn) {
    store.setState({ session: null, isLoggedIn: false, currentView: 'landing' });
  } else {
    store.setState({ session });
  }
}

async function bootstrap() {
  document.getElementById('view-root').innerHTML = `
    <div class="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm font-semibold">Loading SSAP…</div>`;

  const session = await getSession();
  if (session) {
    store.setState({ session, isLoggedIn: true, currentView: 'dashboard', booting: false });
    await loadAllDataForUser();
  } else {
    store.setState({ booting: false, currentView: 'landing' });
  }

  onAuthStateChange((session) => handleSession(session));

  mountOfflineIndicator();
  renderAll();
  startReminderEngine();
  wireKeyboardShortcuts();
}

// ----------------------------------------------------------------------------
// Periodic Reminder Engine (every 30s: 5m/1m/start/overdue/wind-down reminders)
// ----------------------------------------------------------------------------
function startReminderEngine() {
  setInterval(() => {
    if (!store.state.isLoggedIn) return;
    const { tasks, personalWorks, preferences, notifications } = store.state;
    const newNotifs = checkScheduledReminders(tasks, personalWorks, preferences, notifications);
    if (newNotifs.length > 0) {
      pushNotifications(newNotifs);
      newNotifs.forEach((n) => sendSmartNotification(n.title, { body: n.message, sound: preferences.soundEnabled }));
    }
  }, 30000);
}

// ----------------------------------------------------------------------------
// Keyboard shortcut: Alt+N or Cmd/Ctrl+K to open Quick Add
// ----------------------------------------------------------------------------
function wireKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if ((e.altKey && e.key.toLowerCase() === 'n') || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      if (store.state.isLoggedIn) store.setState({ isQuickAddOpen: true });
    }
  });
}

bootstrap();
