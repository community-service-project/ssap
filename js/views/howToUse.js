import { icon, refreshIcons } from '../icons.js';
import { store, navigateTo } from '../store.js';

const STEPS = [
  { step: 'Step 1', title: 'Create Your Account & Sign In', category: 'Getting Started', iconName: 'UserPlus', color: 'text-indigo-600', badge: 'Start Here', content: [
    'Open the SSAP landing page and click "Create Account" or "Get Started".',
    'Enter your name, university email, and a secure password.',
    'Complete registration to land instantly in your daily Dashboard command center.',
    'Tip: You can also use the pre-loaded "Explore Demo Student" button to explore realistic course data immediately.',
  ]},
  { step: 'Step 2', title: 'Configure Your Preferences & 100% Work Priority Distribution', category: 'Settings', iconName: 'Percent', color: 'text-purple-600', badge: 'Core Formula', content: [
    'Select between 12-hour (e.g., 2:30 PM) and 24-hour (e.g., 14:30) time formats across the entire app.',
    'Confirm your local timezone and preferred week-start day (Sunday or Monday).',
    'Set your overall Work Priority Distribution: allocate percentages across Academic %, Personal %, and Goals %.',
    'Crucial Rule: The three values MUST sum to exactly 100% (e.g. Academic 60% + Personal 25% + Goals 15% = 100%). Changing these macro weights never alters individual task urgency.',
  ]},
  { step: 'Step 3', title: 'Plan Your Academic Works & Timetable', category: 'Academic Works', iconName: 'BookOpen', color: 'text-blue-600', badge: 'Academics', content: [
    'Create your semester subjects (code, name, professor, room, and custom color badge).',
    'Add your weekly timetable entries (Day of week, start time, end time, lecture/lab type).',
    'Log upcoming Assignments, Exams, Projects, and Study Sessions with estimated duration in minutes.',
    'Assign individual priority (High, Medium, Low), set due dates, and optionally link academic works to long-term goals.',
  ]},
  { step: 'Step 4', title: 'Add Personal Works & Dedicated Sleep Routine', category: 'Personal Works', iconName: 'Moon', color: 'text-amber-600', badge: 'Wellbeing', content: [
    'Add sleep, exercise, meal prep, laundry, chores, doctor appointments, and relaxation blocks.',
    'Set estimated duration or start/end times, and enable repeating schedules for weekly routines.',
    'Crucial Feature: Set up your Sleep Routine as a recurring block with a gentle Wind-Down reminder (e.g. 30 mins before bedtime) instead of an abrupt alarm.',
  ]},
  { step: 'Step 5', title: 'Use Tasks for Quick, Actionable Work', category: 'Tasks', iconName: 'Zap', color: 'text-emerald-600', badge: 'Quick Add', content: [
    'Use Quick Add to capture tasks fast whenever an assignment or chore arises.',
    'Enter title, pick individual priority (High / Medium / Low), and set estimated minutes (15m, 30m, 45m, 60m, etc.).',
    'Classify as Academic, Personal, or Other, and attach an optional schedule time or goal connection.',
    'Update task status seamlessly to "In Progress" or "Completed" as you knock out items.',
  ]},
  { step: 'Step 6', title: 'Create Goals & Break Down Milestones', category: 'Goals', iconName: 'Target', color: 'text-rose-600', badge: 'Long-Term', content: [
    'Define long-term semester or career goals (e.g. "Master Python & Algorithms for Summer Tech Internship").',
    'Choose goal category (Academic, Career, Skill, Personal, Health) and set target completion date.',
    'Break down the goal into sequential milestones (e.g., Python Basics \u2192 LeetCode Blind 75 \u2192 Project Build).',
    'Link relevant tasks directly to the goal; progress is calculated automatically as milestones and tasks are completed.',
  ]},
  { step: 'Step 7', title: 'Schedule Your Day & Watch for Conflicts', category: 'Schedule', iconName: 'Calendar', color: 'text-cyan-600', badge: 'Conflict Engine', content: [
    'Switch between Agenda, Day, and Week views to inspect your commitments.',
    'Review your total estimated daily workload in hours and minutes versus available waking daytime hours.',
    'Non-destructive Conflict Detection: If a task overlaps with a lecture or gym slot, SSAP displays a prominent collision warning banner with details so you can manually reschedule without data loss.',
  ]},
  { step: 'Step 8', title: 'Activate Smart Notifications', category: 'Smart Notifications', iconName: 'Clock', color: 'text-indigo-600', badge: 'Reminders', content: [
    'Grant browser notification permissions when prompted.',
    'Scheduled tasks automatically dispatch a 5-minute reminder and a 1-minute reminder before start time.',
    'Optional alerts include Start-Time pings, Overdue notifications, and gentle Sleep Wind-down reminders.',
    'Use the in-app Notification Drawer anytime to review alerts, mark them as read, or test the audio chime.',
  ]},
  { step: 'Step 9', title: 'Review Your Daily Command Center on Dashboard', category: 'Dashboard', iconName: 'Compass', color: 'text-teal-600', badge: 'Command Center', content: [
    'Make the Dashboard your daily starting tab every morning.',
    'Glance at the "Next Up" countdown card to know what room or task requires your attention next.',
    'Review total planned workload hours, high-priority action items, upcoming exam deadlines, and active goal momentum.',
    'Keep your Academic, Personal, and Goal priorities in balance every single day.',
  ]},
];

export function renderHowToUse(root) {
  const isLoggedIn = store.state.isLoggedIn;

  root.innerHTML = `
  <div class="bg-slate-50 min-h-screen py-10 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between pb-6 border-b border-slate-200 mb-8">
        <button id="how-to-use-back-btn" class="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition">${icon('ArrowLeft', 'w-4 h-4')}<span>${isLoggedIn ? 'Back to Dashboard' : 'Back to Home'}</span></button>
        <div class="flex items-center gap-2">
          <button id="how-to-use-creators-btn" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-xs">${icon('Users', 'w-3.5 h-3.5 text-cyan-600')}<span>Meet the Creators</span></button>
          ${!isLoggedIn ? `<button id="how-to-use-start-btn" class="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition">Get Started</button>` : ''}
        </div>
      </div>

      <div class="text-center max-w-2xl mx-auto mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-3">${icon('HelpCircle', 'w-3.5 h-3.5')}<span>Official SSAP User Manual \u2022 v3.0</span></div>
        <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">How to Use SSAP Step-by-Step</h1>
        <p class="mt-3 text-sm text-slate-600 leading-relaxed">A practical, beginner-friendly guide to mastering your semester timetable, daily tasks, wellbeing routines, and career milestones in one unified system.</p>
      </div>

      <div class="space-y-6">
        ${STEPS.map((item, idx) => `
        <div id="guide-step-${idx + 1}" class="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">${icon(item.iconName, `w-5 h-5 ${item.color}`)}</div>
              <div><span class="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">${item.step} \u2022 ${item.category}</span><h3 class="text-base sm:text-lg font-bold text-slate-900">${item.title}</h3></div>
            </div>
            <span class="self-start sm:self-auto px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">${item.badge}</span>
          </div>
          <div class="mt-4 space-y-2.5">
            ${item.content.map((line) => `<div class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">${icon('CheckCircle', 'w-4 h-4 text-indigo-500 shrink-0 mt-0.5')}<span class="leading-relaxed">${line}</span></div>`).join('')}
          </div>
        </div>`).join('')}
      </div>

      <div class="mt-12 p-8 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl text-white text-center shadow-xl">
        ${icon('Sparkles', 'w-8 h-8 text-cyan-400 mx-auto mb-3')}
        <h2 class="text-xl sm:text-2xl font-bold">Ready to take control of your student life?</h2>
        <p class="mt-2 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">Experience the unified flow on desktop, tablet, or install it on your mobile device as a Progressive Web App.</p>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button id="how-to-use-cta-btn" class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition"><span>${isLoggedIn ? 'Open Your Dashboard' : 'Create Free Student Account'}</span>${icon('ArrowRight', 'w-4 h-4')}</button>
          <button id="how-to-use-cta-creators-btn" class="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition">${icon('Users', 'w-4 h-4 text-cyan-400')}<span>Meet the Creators</span></button>
        </div>
      </div>
    </div>
  </div>`;

  root.querySelector('#how-to-use-back-btn')?.addEventListener('click', () => navigateTo(isLoggedIn ? 'dashboard' : 'landing'));
  root.querySelector('#how-to-use-creators-btn')?.addEventListener('click', () => navigateTo('creators'));
  root.querySelector('#how-to-use-start-btn')?.addEventListener('click', () => store.setState({ authModal: { isOpen: true, mode: 'register' } }));
  root.querySelector('#how-to-use-cta-btn')?.addEventListener('click', () => {
    if (isLoggedIn) navigateTo('dashboard'); else store.setState({ authModal: { isOpen: true, mode: 'register' } });
  });
  root.querySelector('#how-to-use-cta-creators-btn')?.addEventListener('click', () => navigateTo('creators'));

  refreshIcons();
}
