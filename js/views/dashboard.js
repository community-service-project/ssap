import { icon, refreshIcons } from '../icons.js';
import { store, toggleTaskStatus } from '../store.js';
import { navigateTo } from '../store.js';
import { formatMinutes, formatShortDate, formatTimeString, getTodayDateString, timeToMinutes } from '../time.js';

export function renderDashboard(root) {
  const { preferences: userPreferences, tasks, subjects, timetable, academicWorks, personalWorks, goals } = store.state;

  const todayStr = getTodayDateString();
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayTasks = tasks.filter((t) => t.scheduledDate === todayStr || (!t.scheduledDate && t.status !== 'Completed'));
  const pendingTasks = tasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress');

  const totalTaskMinutes = todayTasks
    .filter((t) => t.status !== 'Completed' && t.status !== 'Archived')
    .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

  const todayClasses = timetable.filter((entry) => entry.dayOfWeek === currentDayOfWeek);
  const totalClassMinutes = todayClasses.reduce((sum, entry) => {
    const diff = timeToMinutes(entry.endTime) - timeToMinutes(entry.startTime);
    return sum + (diff > 0 ? diff : 0);
  }, 0);

  const todayPersonal = personalWorks.filter(
    (p) => p.category !== 'Sleep' && (p.scheduledDate === todayStr || (p.isRecurring && p.recurringDays?.includes(currentDayOfWeek)))
  );
  const totalPersonalMinutes = todayPersonal.reduce((sum, p) => sum + (p.estimatedMinutes || 0), 0);
  const totalDayWorkloadMinutes = totalTaskMinutes + totalClassMinutes + totalPersonalMinutes;

  const upcomingItems = [];
  todayClasses.forEach((entry) => {
    const startMin = timeToMinutes(entry.startTime);
    if (startMin >= currentMinutes - 10) {
      const sub = subjects.find((s) => s.id === entry.subjectId);
      upcomingItems.push({ title: sub ? `${sub.code}: ${sub.name}` : 'Class Lecture', startTime: entry.startTime, startMin, roomOrContext: entry.room || entry.type });
    }
  });
  todayTasks.filter((t) => t.scheduledTime && t.status !== 'Completed').forEach((t) => {
    const startMin = timeToMinutes(t.scheduledTime);
    if (startMin >= currentMinutes - 10) {
      upcomingItems.push({ title: t.title, startTime: t.scheduledTime, startMin, roomOrContext: `${t.estimatedMinutes}m duration` });
    }
  });
  upcomingItems.sort((a, b) => a.startMin - b.startMin);
  const nextItem = upcomingItems[0];

  const upcomingDeadlines = academicWorks.filter((w) => w.status !== 'Completed').sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1)).slice(0, 3);
  const sleepRoutine = personalWorks.find((p) => p.category === 'Sleep');
  const activeGoals = goals.filter((g) => g.status !== 'Completed').slice(0, 3);

  root.innerHTML = `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/20">${icon('Compass', 'w-3.5 h-3.5 text-cyan-400')}<span>Daily Command Center</span></div>
            <span class="text-xs text-slate-400 font-mono">${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-black mt-3 tracking-tight">Good day, student. Here is your daily roadmap.</h1>
          <p class="text-xs sm:text-sm text-slate-300 mt-1">Balanced across your Academic, Personal, and Goal priorities.</p>
        </div>
        <div class="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-xl bg-indigo-500 text-white shadow-sm shrink-0">${icon('Clock', 'w-5 h-5')}</div>
            <div>
              <span class="text-[11px] uppercase tracking-wider text-indigo-300 font-bold block">Next Scheduled Commitment</span>
              <h4 class="text-sm sm:text-base font-bold text-white">${nextItem ? nextItem.title : 'No more events scheduled today'}</h4>
              ${nextItem ? `<p class="text-xs text-slate-300 mt-0.5">Starts at <strong class="text-cyan-300">${formatTimeString(nextItem.startTime, userPreferences.timeFormat)}</strong>${nextItem.roomOrContext ? ` \u2022 ${nextItem.roomOrContext}` : ''}</p>` : ''}
            </div>
          </div>
          <div class="flex items-center gap-2 self-end sm:self-center">
            <button id="dashboard-view-schedule-btn" class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold text-white rounded-xl transition">Full Schedule</button>
            <button id="dashboard-quick-add-trigger-btn" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition">${icon('Plus', 'w-3.5 h-3.5')}<span>Quick Add</span></button>
          </div>
        </div>
      </div>

      <div class="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Workload</span>
            <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-extrabold">${formatMinutes(totalDayWorkloadMinutes)} Total</span>
          </div>
          <div class="mt-4 space-y-2">
            <div class="flex justify-between text-xs text-slate-600"><span>Timetable Lectures/Labs</span><span class="font-semibold text-slate-900">${formatMinutes(totalClassMinutes)}</span></div>
            <div class="flex justify-between text-xs text-slate-600"><span>Actionable Tasks</span><span class="font-semibold text-slate-900">${formatMinutes(totalTaskMinutes)}</span></div>
            <div class="flex justify-between text-xs text-slate-600"><span>Personal Routines</span><span class="font-semibold text-slate-900">${formatMinutes(totalPersonalMinutes)}</span></div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100">
            <div class="flex justify-between text-[11px] text-slate-500 mb-1"><span>Waking Day Allocation</span><span>${Math.round((totalDayWorkloadMinutes / (16 * 60)) * 100)}% of 16h day</span></div>
            <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div class="bg-blue-500 h-full" style="width:${Math.min(100, (totalClassMinutes / (16 * 60)) * 100)}%" title="Classes: ${formatMinutes(totalClassMinutes)}"></div>
              <div class="bg-indigo-500 h-full" style="width:${Math.min(100, (totalTaskMinutes / (16 * 60)) * 100)}%" title="Tasks: ${formatMinutes(totalTaskMinutes)}"></div>
              <div class="bg-purple-500 h-full" style="width:${Math.min(100, (totalPersonalMinutes / (16 * 60)) * 100)}%" title="Personal: ${formatMinutes(totalPersonalMinutes)}"></div>
            </div>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-500">Dual-Priority Weights:</span>
          <button id="dashboard-goto-settings-weights" class="text-indigo-600 font-bold hover:underline">A: ${userPreferences.priorityWeights.academic}% \u2022 P: ${userPreferences.priorityWeights.personal}% \u2022 G: ${userPreferences.priorityWeights.goals}%</button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div class="flex items-center gap-2.5">
              <div class="p-2 rounded-xl bg-rose-50 text-rose-600">${icon('Zap', 'w-4 h-4')}</div>
              <div><h3 class="text-base font-bold text-slate-900">Priority Work Items</h3><p class="text-xs text-slate-500">Tasks requiring your attention today</p></div>
            </div>
            <button id="dashboard-goto-tasks" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"><span>View all tasks</span>${icon('ArrowRight', 'w-3.5 h-3.5')}</button>
          </div>
          <div class="mt-4 space-y-2.5">
            ${pendingTasks.slice(0, 5).map((task) => {
              const sub = subjects.find((s) => s.id === task.linkedSubjectId);
              return `
              <div id="dashboard-task-item-${task.id}" class="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition flex items-start justify-between gap-3 group">
                <div class="flex items-start gap-3 flex-1 min-w-0">
                  <button data-toggle-task="${task.id}" class="mt-0.5 p-1 rounded-lg border border-slate-300 hover:border-emerald-500 text-transparent hover:text-emerald-500 transition">${icon('CheckCircle2', 'w-4 h-4')}</button>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h4 class="text-xs sm:text-sm font-semibold text-slate-900 truncate">${task.title}</h4>
                      ${task.priority === 'High' ? '<span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">High</span>' : ''}
                      ${task.priority === 'Medium' ? '<span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-700">Med</span>' : ''}
                      <span class="px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-600 bg-white border border-slate-200">${task.estimatedMinutes}m</span>
                    </div>
                    <div class="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      ${sub ? `<span class="font-semibold text-indigo-600">${sub.code}</span>` : ''}
                      ${task.scheduledTime ? `<span>Scheduled: ${formatTimeString(task.scheduledTime, userPreferences.timeFormat)}</span>` : ''}
                      ${task.dueDate ? `<span class="text-amber-600 font-medium">Due: ${formatShortDate(task.dueDate)}</span>` : ''}
                    </div>
                  </div>
                </div>
              </div>`;
            }).join('') || ''}
            ${pendingTasks.length === 0 ? `<div class="py-8 text-center text-slate-400">${icon('CheckCircle2', 'w-8 h-8 mx-auto text-emerald-500 mb-1')}<p class="text-xs font-semibold text-slate-700">All tasks completed!</p><p class="text-[11px] text-slate-400">Enjoy your rest or add new goals.</p></div>` : ''}
          </div>
        </div>

        <div class="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div class="flex items-center gap-2.5">
              <div class="p-2 rounded-xl bg-amber-50 text-amber-600">${icon('Target', 'w-4 h-4')}</div>
              <div><h3 class="text-base font-bold text-slate-900">Goal Momentum</h3><p class="text-xs text-slate-500">Connecting semester targets with daily progress</p></div>
            </div>
            <button id="dashboard-goto-goals" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"><span>View all goals</span>${icon('ArrowRight', 'w-3.5 h-3.5')}</button>
          </div>
          <div class="mt-4 space-y-4">
            ${activeGoals.map((goal) => {
              const completedMilestones = goal.milestones.filter((m) => m.completed).length;
              return `
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div class="flex items-baseline justify-between gap-2"><h4 class="text-xs sm:text-sm font-bold text-slate-900">${goal.title}</h4><span class="text-xs font-extrabold text-indigo-600 font-mono">${goal.progressPercent}%</span></div>
                <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2"><div class="bg-indigo-600 h-full rounded-full transition-all" style="width:${goal.progressPercent}%"></div></div>
                <div class="flex items-center justify-between mt-2 text-[11px] text-slate-500"><span>Milestones: ${completedMilestones} of ${goal.milestones.length} done</span><span>Target: ${formatShortDate(goal.targetDate)}</span></div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">${icon('BookOpen', 'w-4 h-4 text-blue-600')}<h3 class="text-sm font-bold text-slate-900">Academic Deadlines</h3></div>
            <button id="dashboard-goto-academic" class="text-xs font-semibold text-blue-600 hover:underline">View Works</button>
          </div>
          <div class="mt-3 space-y-3">
            ${upcomingDeadlines.map((item) => {
              const sub = subjects.find((s) => s.id === item.subjectId);
              return `
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div class="flex items-start justify-between gap-1"><span class="text-xs font-bold text-slate-900 leading-tight">${item.title}</span><span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">${item.type}</span></div>
                <div class="flex items-center justify-between mt-2 text-[11px] text-slate-500"><span class="font-semibold text-indigo-600">${sub?.code || 'Course'}</span><span class="text-rose-600 font-semibold">Due: ${formatShortDate(item.dueDate)}</span></div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <div class="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div class="flex items-center gap-2">${icon('Moon', 'w-4 h-4 text-purple-400')}<h3 class="text-sm font-bold text-white">Sleep &amp; Recovery Block</h3></div>
            <button id="dashboard-goto-personal" class="text-xs font-semibold text-purple-300 hover:underline">Configure</button>
          </div>
          ${sleepRoutine ? `
          <div class="mt-3 space-y-3 text-xs">
            <div class="flex justify-between items-center"><span class="text-slate-300">Sleep Schedule:</span><span class="font-bold font-mono text-cyan-300">${formatTimeString(sleepRoutine.startTime, userPreferences.timeFormat)} \u2013 ${formatTimeString(sleepRoutine.endTime, userPreferences.timeFormat)}</span></div>
            <div class="flex justify-between items-center"><span class="text-slate-300">Target Duration:</span><span class="font-semibold text-white">8 hours restorative</span></div>
            <div class="p-2.5 rounded-xl bg-purple-900/40 border border-purple-700/50 flex items-start gap-2 text-purple-200">${icon('Sparkles', 'w-4 h-4 text-purple-300 shrink-0 mt-0.5')}<div><strong class="block text-white font-semibold">Gentle Wind-Down Window</strong>Alerts at 10:30 PM (30m before). Screens dimmed, light reading.</div></div>
          </div>` : `<div class="mt-3 text-xs text-slate-400">No sleep routine configured. Set one in Personal Works.</div>`}
        </div>
      </div>
    </div>
  </div>`;

  root.querySelector('#dashboard-view-schedule-btn')?.addEventListener('click', () => navigateTo('schedule'));
  root.querySelector('#dashboard-quick-add-trigger-btn')?.addEventListener('click', () => store.setState({ isQuickAddOpen: true }));
  root.querySelector('#dashboard-goto-settings-weights')?.addEventListener('click', () => navigateTo('settings'));
  root.querySelector('#dashboard-goto-tasks')?.addEventListener('click', () => navigateTo('tasks'));
  root.querySelector('#dashboard-goto-goals')?.addEventListener('click', () => navigateTo('goals'));
  root.querySelector('#dashboard-goto-academic')?.addEventListener('click', () => navigateTo('academic'));
  root.querySelector('#dashboard-goto-personal')?.addEventListener('click', () => navigateTo('personal'));
  root.querySelectorAll('[data-toggle-task]').forEach((b) => b.addEventListener('click', () => toggleTaskStatus(b.getAttribute('data-toggle-task'))));

  refreshIcons();
}
