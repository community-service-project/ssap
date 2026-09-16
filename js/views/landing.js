import { icon, refreshIcons } from '../icons.js';
import { store, navigateTo } from '../store.js';
import { pwaInstallSlot, mountPWAInstallSlots } from '../components/pwaInstall.js';

const WORKFLOW_STEPS = [
  { step: '01', title: 'Plan', desc: 'Add semester subjects, recurring timetables, and long-term milestone goals.', iconName: 'BookOpen', color: 'text-indigo-600' },
  { step: '02', title: 'Schedule', desc: 'Place tasks and personal routines into calendar blocks with collision alerts.', iconName: 'Calendar', color: 'text-blue-600' },
  { step: '03', title: 'Work', desc: 'Execute with estimated durations (15m, 30m, 60m) and focused priorities.', iconName: 'Zap', color: 'text-amber-600' },
  { step: '04', title: 'Track', desc: 'Check workload balance and 100% Academic/Personal/Goals allocation.', iconName: 'Layers', color: 'text-purple-600' },
  { step: '05', title: 'Achieve', desc: 'Watch semester GPA and career milestone progress steadily advance.', iconName: 'Target', color: 'text-emerald-600' },
];

const FEATURES = [
  { iconName: 'BookOpen', bg: 'bg-blue-50 text-blue-600', title: 'Academic Works', desc: 'Organize subjects, recurring weekly timetables (Lectures, Labs, Tutorials), exam schedules, and project milestones with priority flags and estimated durations.' },
  { iconName: 'Moon', bg: 'bg-purple-50 text-purple-600', title: 'Personal Works &amp; Sleep', desc: 'Protect recovery with dedicated sleep routine blocks, gentle wind-down reminders (not urgent sirens), workout routines, meal prep, and daily chores.' },
  { iconName: 'CheckCircle', bg: 'bg-emerald-50 text-emerald-600', title: 'Quick Actionable Tasks', desc: 'Instant Quick Add with 5 to 120-minute estimated slots, High/Medium/Low priority, subject connections, and goal linkages so you never lose context.' },
  { iconName: 'Target', bg: 'bg-amber-50 text-amber-600', title: 'Goals &amp; Milestones', desc: 'Connect big semester objectives (like "Master Python" or "3.8+ GPA") into tangible milestones and linked daily study sessions with automated progress tracking.' },
  { iconName: 'Calendar', bg: 'bg-cyan-50 text-cyan-600', title: 'Schedule &amp; Conflict Engine', desc: 'View your agenda in 12h or 24h formats. Receive non-destructive conflict alerts if a task overlaps with a scheduled lecture or lab session.' },
  { iconName: 'Clock', bg: 'bg-rose-50 text-rose-600', title: 'Smart Notifications', desc: 'Stay ahead with 5-minute and 1-minute countdowns before actionable items start, start-time pings, and overdue warnings to keep procrastination at bay.' },
];

export function renderLanding(root) {
  root.innerHTML = `
  <div class="bg-white text-slate-900 overflow-x-hidden">
    <section class="relative pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden">
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/3 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/25 text-xs font-semibold text-indigo-300 mb-6 backdrop-blur-xs">${icon('Sparkles', 'w-3.5 h-3.5 text-cyan-400')}<span>SSAP v3.0 \u2022 Mobile-First Progressive Web App</span></div>
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">One Command Center for <span class="bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">Academic Mastery</span> &amp; Real Life Harmony</h1>
        <p class="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">Understand what you need to do, when to do it, how long it takes, and how every minute contributes to your long-term student goals.</p>

        <div class="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button id="hero-create-account-btn" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/30 transition"><span>Get Started Free</span>${icon('ArrowRight', 'w-4 h-4')}</button>
          <button id="hero-login-btn" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 border border-slate-700 font-semibold text-sm sm:text-base transition"><span>Sign In</span></button>
          ${pwaInstallSlot('landing-pwa-install-slot', 'button', 'w-full sm:w-auto')}
        </div>

        <div class="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
          <span class="flex items-center gap-1">${icon('CheckCircle', 'w-3.5 h-3.5 text-emerald-400')} No mandatory paid SaaS</span>
          <span class="flex items-center gap-1">${icon('CheckCircle', 'w-3.5 h-3.5 text-emerald-400')} Installable PWA</span>
          <span class="flex items-center gap-1">${icon('CheckCircle', 'w-3.5 h-3.5 text-emerald-400')} Offline Capable</span>
        </div>

        <div class="mt-14 relative max-w-4xl mx-auto rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-2xl p-4 sm:p-6 text-left backdrop-blur-sm">
          <div class="flex items-center justify-between pb-4 border-b border-slate-700/70 text-xs text-slate-400">
            <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-rose-500/80"></span><span class="w-3 h-3 rounded-full bg-amber-500/80"></span><span class="w-3 h-3 rounded-full bg-emerald-500/80"></span><span class="ml-2 font-mono text-slate-300">ssap.app/dashboard</span></div>
            <div class="flex items-center gap-2 text-indigo-300 font-semibold">${icon('Clock', 'w-3.5 h-3.5')} Next: CS301 Lecture in 25m</div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div class="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60">
              <div class="flex items-center justify-between"><span class="text-xs font-semibold text-slate-400 uppercase">Today's Workload</span><span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[11px] font-bold">4h 15m</span></div>
              <div class="mt-3">
                <div class="flex justify-between text-xs text-slate-300 mb-1"><span>Academic: 2h 45m</span><span>Personal: 1h 30m</span></div>
                <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex"><div class="bg-blue-500 w-[65%]"></div><div class="bg-purple-500 w-[35%]"></div></div>
              </div>
              <p class="text-[11px] text-slate-400 mt-2">Planned load vs 16h waking day window</p>
            </div>
            <div class="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60">
              <div class="flex items-center justify-between"><span class="text-xs font-semibold text-slate-400 uppercase">Category Allocation</span><span class="text-xs font-bold text-emerald-400">100% Total</span></div>
              <div class="mt-3 space-y-1.5 text-xs">
                <div class="flex justify-between text-slate-300"><span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-blue-400"></span> Academic Weight</span><span class="font-semibold">60%</span></div>
                <div class="flex justify-between text-slate-300"><span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-purple-400"></span> Personal Routine</span><span class="font-semibold">25%</span></div>
                <div class="flex justify-between text-slate-300"><span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400"></span> Long-Term Goals</span><span class="font-semibold">15%</span></div>
              </div>
            </div>
            <div class="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60">
              <div class="flex items-center justify-between"><span class="text-xs font-semibold text-slate-400 uppercase">Smart Reminders</span><span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">Active</span></div>
              <div class="mt-2.5 space-y-2">
                <div class="p-2 rounded-lg bg-slate-800/80 text-xs flex items-center justify-between"><span class="text-slate-200">5-min before task</span><span class="text-indigo-400 font-mono text-[11px]">Enabled</span></div>
                <div class="p-2 rounded-lg bg-slate-800/80 text-xs flex items-center justify-between"><span class="text-slate-200">Sleep wind-down</span><span class="text-purple-400 font-mono text-[11px]">10:30 PM</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-slate-50 border-b border-slate-200">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto">
          <span class="text-xs font-bold text-indigo-600 uppercase tracking-widest">The SSAP Workflow</span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Plan \u2192 Schedule \u2192 Work \u2192 Track \u2192 Achieve</h2>
          <p class="mt-2 text-sm text-slate-600">Designed specifically around how modern students study, rest, and build careers.</p>
        </div>
        <div class="mt-12 grid grid-cols-1 md:grid-cols-5 gap-4">
          ${WORKFLOW_STEPS.map((item) => `
          <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-200 hover:shadow-md transition group">
            <div class="flex items-center justify-between mb-3"><div class="p-2.5 rounded-xl bg-slate-50 group-hover:bg-indigo-50 transition">${icon(item.iconName, `w-5 h-5 ${item.color}`)}</div><span class="text-xs font-mono font-bold text-slate-400">${item.step}</span></div>
            <h3 class="text-base font-bold text-slate-900">${item.title}</h3>
            <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">${item.desc}</p>
          </div>`).join('')}
        </div>
      </div>
    </section>

    <section class="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-14">
        <span class="text-xs font-bold text-indigo-600 uppercase tracking-widest">Core Modules</span>
        <h2 class="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2">Everything a Student Needs, Nothing You Don't</h2>
        <p class="mt-3 text-slate-600 text-sm sm:text-base">Eliminate fragmented apps. SSAP ties tasks, classes, sleep, and long-term milestones into one cohesive system.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${FEATURES.map((f) => `
        <div class="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div class="w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4">${icon(f.iconName, 'w-5 h-5')}</div>
          <h3 class="text-lg font-bold text-slate-900">${f.title}</h3>
          <p class="text-xs text-slate-600 mt-2 leading-relaxed">${f.desc}</p>
        </div>`).join('')}
      </div>
    </section>

    <section class="py-16 bg-slate-900 text-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span class="text-xs font-bold text-cyan-400 uppercase tracking-widest">The SSAP Philosophy</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">Two Priority Concepts, Zero Confusion</h2>
            <p class="mt-4 text-sm text-slate-300 leading-relaxed">Traditional apps conflate item urgency with macro life goals. SSAP deliberately separates them:</p>
            <div class="mt-6 space-y-4 text-xs">
              <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700"><strong class="text-indigo-400 block text-sm font-semibold mb-1">1. Overall Category Weight (100% Total)</strong>How much macro attention you choose to allocate between Academic Works, Personal Routines, and Long-Term Goals (e.g. 60% + 25% + 15% = 100%).</div>
              <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700"><strong class="text-cyan-400 block text-sm font-semibold mb-1">2. Individual Item Priority</strong>The immediate urgency of a specific item (e.g., "DBMS Exam Prep" = High, "Refill Water Bottle" = Low). Changing macro weights never alters individual priorities.</div>
            </div>
          </div>
          <div class="p-6 bg-slate-800 rounded-2xl border border-slate-700 space-y-4">
            <h4 class="text-sm font-bold text-slate-200">Balanced Student Life Ratio</h4>
            <div><div class="flex justify-between text-xs mb-1"><span class="text-blue-300 font-medium">Academic Works</span><span class="font-bold">60%</span></div><div class="w-full h-3 bg-slate-900 rounded-full overflow-hidden"><div class="bg-blue-500 h-full w-[60%]"></div></div></div>
            <div><div class="flex justify-between text-xs mb-1"><span class="text-purple-300 font-medium">Personal Works &amp; Sleep</span><span class="font-bold">25%</span></div><div class="w-full h-3 bg-slate-900 rounded-full overflow-hidden"><div class="bg-purple-500 h-full w-[25%]"></div></div></div>
            <div><div class="flex justify-between text-xs mb-1"><span class="text-amber-300 font-medium">Long-Term Growth &amp; Goals</span><span class="font-bold">15%</span></div><div class="w-full h-3 bg-slate-900 rounded-full overflow-hidden"><div class="bg-amber-500 h-full w-[15%]"></div></div></div>
            <div class="pt-2 text-right"><span class="inline-block px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold">Sum: Exactly 100% \u2713</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-14 bg-indigo-50/50 border-b border-indigo-100">
      <div class="max-w-4xl mx-auto px-4 text-center">
        ${icon('Shield', 'w-8 h-8 text-indigo-600 mx-auto mb-3')}
        <h3 class="text-xl font-bold text-slate-900">Free-First, Private &amp; Maintainable Long-Term</h3>
        <p class="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">SSAP requires no mandatory paid SaaS dependencies. Your data belongs to you\u2014stored securely in your own Supabase project with instant JSON/CSV export and PWA offline installability.</p>
      </div>
    </section>

    <section class="py-12 bg-white">
      <div class="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
        <div><h4 class="text-base font-bold text-slate-900">New to SSAP? Read the Step-by-Step Guide</h4><p class="text-xs text-slate-600 mt-1">Explore our 9 practical steps from account setup to timetable planning and smart alerts.</p></div>
        <button id="landing-how-to-use-btn" class="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-indigo-600 border border-slate-300 font-semibold text-xs rounded-xl shadow-xs transition">${icon('HelpCircle', 'w-4 h-4')}<span>Open How to Use Guide</span></button>
      </div>
    </section>

    <section class="py-16 sm:py-20 bg-gradient-to-b from-slate-900 to-slate-950 text-white text-center">
      <div class="max-w-4xl mx-auto px-4 sm:px-6">
        <div class="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-400/30">${icon('Users', 'w-6 h-6')}</div>
        <h2 class="text-2xl sm:text-3xl font-black tracking-tight">Engineered by Students &amp; Faculty</h2>
        <p class="mt-3 text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">SSAP was crafted under faculty mentorship to solve real-world student workload friction, procrastination loops, and sleep deprivation.</p>
        <div class="mt-8"><button id="meet-the-creators-main-btn" class="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 transition transform hover:-translate-y-0.5">${icon('Users', 'w-4 h-4')}<span>Meet the Creators</span>${icon('ArrowRight', 'w-4 h-4 ml-1')}</button></div>
        <p class="mt-3 text-xs text-slate-400">View the mentor, team leader, and core engineers behind SSAP v3.0</p>
      </div>
    </section>

    <footer class="bg-slate-950 text-slate-400 py-10 border-t border-slate-800 text-xs">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-slate-300"><div class="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">S</div><span class="font-semibold text-white">SSAP v3.0</span><span class="text-slate-500">\u2022 Student Productivity &amp; Life Management PWA</span></div>
        <div class="flex flex-wrap items-center gap-4 text-xs font-medium">
          <button id="footer-creators-link" class="text-cyan-400 hover:text-cyan-300 font-semibold">Meet the Creators</button>
          <button id="footer-how-to-use-link" class="hover:text-slate-200">How to Use</button>
          <button id="footer-signin-link" class="hover:text-slate-200">Sign In</button>
        </div>
      </div>
    </footer>
  </div>`;

  wireEvents(root);
  refreshIcons();
  mountPWAInstallSlots();
}

function wireEvents(root) {
  root.querySelector('#hero-create-account-btn')?.addEventListener('click', () => store.setState({ authModal: { isOpen: true, mode: 'register' } }));
  root.querySelector('#hero-login-btn')?.addEventListener('click', () => store.setState({ authModal: { isOpen: true, mode: 'login' } }));
  root.querySelector('#landing-how-to-use-btn')?.addEventListener('click', () => navigateTo('how_to_use'));
  root.querySelector('#meet-the-creators-main-btn')?.addEventListener('click', () => navigateTo('creators'));
  root.querySelector('#footer-creators-link')?.addEventListener('click', () => navigateTo('creators'));
  root.querySelector('#footer-how-to-use-link')?.addEventListener('click', () => navigateTo('how_to_use'));
  root.querySelector('#footer-signin-link')?.addEventListener('click', () => store.setState({ authModal: { isOpen: true, mode: 'login' } }));
}
