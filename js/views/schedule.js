import { icon, refreshIcons } from '../icons.js';
import { store, deleteFreeTimeSlot, addFreeTimeSlot, setTasksBulk, toggleTaskStatus } from '../store.js';
import { DAYS_OF_WEEK, SHORT_DAYS_OF_WEEK, detectConflictsForDate, formatMinutes, formatTimeString, getTodayDateString, timeToMinutes } from '../time.js';
import { autoArrangeTasksInFreeSlots } from '../autoSchedule.js';

const ui = {
  selectedDate: getTodayDateString(),
  isAddFreeSlotOpen: false,
  ftm: { arrangeFeedback: null, isExpanded: true },
  slotForm: null, // lazily set to selectedDate when modal opens
};

export function renderSchedule(root) {
  const { preferences: userPreferences, timetable, tasks, personalWorks, subjects, freeTimeSlots } = store.state;
  const selectedDate = ui.selectedDate;
  const currentDateObj = new Date(selectedDate + 'T12:00:00');
  const dayOfWeek = currentDateObj.getDay();

  const conflicts = detectConflictsForDate(selectedDate, timetable, subjects, tasks, personalWorks);

  const timelineItems = [];
  timetable.filter((t) => t.dayOfWeek === dayOfWeek).forEach((entry) => {
    const sub = subjects.find((s) => s.id === entry.subjectId);
    const startMin = timeToMinutes(entry.startTime);
    const endMin = timeToMinutes(entry.endTime);
    const hasConflict = conflicts.some((c) => c.itemA.id === entry.id || c.itemB.id === entry.id);
    timelineItems.push({ id: `class-${entry.id}`, originalId: entry.id, title: sub ? `${sub.code}: ${sub.name}` : 'Course Class', type: 'class', startTime: entry.startTime, endTime: entry.endTime, startMin, endMin, context: `${entry.type} ${entry.room ? '\u2022 ' + entry.room : ''}`, hasConflict });
  });
  tasks.filter((t) => t.scheduledDate === selectedDate && t.scheduledTime).forEach((t) => {
    const startMin = timeToMinutes(t.scheduledTime);
    const endMin = startMin + (t.estimatedMinutes || 30);
    const sub = subjects.find((s) => s.id === t.linkedSubjectId);
    const hasConflict = conflicts.some((c) => c.itemA.id === t.id || c.itemB.id === t.id);
    timelineItems.push({ id: `task-${t.id}`, originalId: t.id, title: t.title, type: 'task', startTime: t.scheduledTime, endTime: minutesPad(endMin), startMin, endMin, context: `${t.estimatedMinutes}m duration \u2022 Priority: ${t.priority} ${sub ? '\u2022 ' + sub.code : ''}`, isCompleted: t.status === 'Completed', hasConflict });
  });
  personalWorks.filter((p) => p.scheduledDate === selectedDate || (p.isRecurring && p.recurringDays?.includes(dayOfWeek))).forEach((p) => {
    if (p.startTime) {
      const startMin = timeToMinutes(p.startTime);
      const endMin = p.endTime ? timeToMinutes(p.endTime) : startMin + (p.estimatedMinutes || 45);
      const hasConflict = conflicts.some((c) => c.itemA.id === p.id || c.itemB.id === p.id);
      timelineItems.push({ id: `personal-${p.id}`, originalId: p.id, title: p.title, type: 'routine', startTime: p.startTime, endTime: p.endTime || minutesPad(endMin), startMin, endMin, context: p.category, hasConflict });
    }
  });
  timelineItems.sort((a, b) => a.startMin - b.startMin);
  const totalMinutesThisDay = timelineItems.reduce((sum, item) => sum + (item.endMin - item.startMin), 0);

  root.innerHTML = `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">${icon('Calendar', 'w-5 h-5 text-cyan-600')}Schedule &amp; Conflict Engine</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Unified timetable, task slots, and wellbeing routines with non-destructive collision alerts.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button id="schedule-prev-day-btn" class="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition">${icon('ChevronLeft', 'w-4 h-4')}</button>
          <button id="schedule-today-btn" class="px-3 py-1 text-xs font-bold text-slate-800 hover:bg-white rounded-lg transition">Today</button>
          <button id="schedule-next-day-btn" class="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition">${icon('ChevronRight', 'w-4 h-4')}</button>
        </div>
        <input id="schedule-date-picker" type="date" value="${selectedDate}" class="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800" />
        <button id="schedule-quick-add-btn" class="inline-flex items-center gap-1 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-xs transition">${icon('Plus', 'w-4 h-4')}<span>Add to Day</span></button>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
      <h2 class="text-lg sm:text-xl font-extrabold text-slate-900">${DAYS_OF_WEEK[dayOfWeek]}, ${new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</h2>
      <div class="flex items-center gap-3 text-xs font-semibold">
        <span class="text-slate-500">Total Allocated: <strong class="text-slate-900">${formatMinutes(totalMinutesThisDay)}</strong></span>
        <span class="text-slate-300">\u2022</span>
        <span class="text-slate-500">Time Format: <strong class="text-indigo-600 font-mono">${userPreferences.timeFormat}</strong></span>
      </div>
    </div>

    <div id="free-time-manager-root"></div>

    ${conflicts.length > 0 ? `
    <div id="schedule-conflict-banner" class="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 shadow-sm text-amber-950 animate-fade-in">
      <div class="flex items-start gap-3">
        <div class="p-2 rounded-xl bg-amber-200 text-amber-900 shrink-0">${icon('AlertTriangle', 'w-5 h-5')}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline justify-between gap-2">
            <h3 class="text-sm font-black tracking-tight text-amber-900 uppercase">Schedule Overlap Detected (${conflicts.length} Collision${conflicts.length > 1 ? 's' : ''})</h3>
            <span class="text-xs font-mono font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">Non-Destructive Alert</span>
          </div>
          <p class="text-xs text-amber-800 mt-1">SSAP preserves both items without data loss. Please adjust start or end times to prevent double-booking.</p>
          <div class="mt-3 space-y-2">
            ${conflicts.map((conf) => `
            <div class="p-2.5 bg-white/80 rounded-xl border border-amber-300/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-600 shrink-0"></span>
                <span class="font-bold text-slate-900">${conf.itemA.title}</span>
                <span class="text-amber-800 font-mono text-[11px]">(${formatTimeString(conf.itemA.startTime, userPreferences.timeFormat)} \u2013 ${formatTimeString(conf.itemA.endTime, userPreferences.timeFormat)})</span>
                <span class="text-slate-400 font-bold">collides with</span>
                <span class="font-bold text-slate-900">${conf.itemB.title}</span>
                <span class="text-amber-800 font-mono text-[11px]">(${formatTimeString(conf.itemB.startTime, userPreferences.timeFormat)} \u2013 ${formatTimeString(conf.itemB.endTime, userPreferences.timeFormat)})</span>
              </div>
              <span class="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded self-start sm:self-auto">${conf.overlapMinutes}m overlap</span>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>` : ''}

    <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
      ${timelineItems.length === 0 ? `
      <div class="py-16 text-center text-slate-400">
        ${icon('Calendar', 'w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1')}
        <p class="text-sm font-semibold text-slate-700">No scheduled items on this date</p>
        <p class="text-xs text-slate-400 mt-1">Use "Quick Add" to block out study sessions or assign task times.</p>
      </div>` : timelineItems.map((item) => {
        const isCompleted = item.isCompleted;
        const cardCls = item.hasConflict ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200' : isCompleted ? 'bg-slate-50/60 border-slate-200 opacity-70' : item.type === 'class' ? 'bg-blue-50/40 border-blue-200' : item.type === 'routine' ? 'bg-purple-50/40 border-purple-200' : 'bg-white border-slate-200 shadow-xs';
        const leftIcon = item.type === 'task'
          ? `<button data-toggle-task="${item.originalId}" class="mt-0.5 sm:mt-0 p-1 rounded-lg border transition ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-500 text-transparent hover:text-emerald-500'}">${icon('CheckCircle2', 'w-4 h-4')}</button>`
          : item.type === 'class'
          ? `<div class="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">${icon('BookOpen', 'w-4 h-4')}</div>`
          : `<div class="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">${icon('Heart', 'w-4 h-4')}</div>`;
        return `
        <div id="timeline-item-${item.id}" class="p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cardCls}">
          <div class="flex items-start sm:items-center gap-3">
            ${leftIcon}
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-bold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}">${item.title}</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">${item.type}</span>
                ${item.hasConflict ? '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500 text-white animate-pulse">Conflict</span>' : ''}
              </div>
              ${item.context ? `<p class="text-xs text-slate-500 mt-0.5">${item.context}</p>` : ''}
            </div>
          </div>
          <div class="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 self-end sm:self-center bg-slate-100 px-3 py-1.5 rounded-xl">${icon('Clock', 'w-3.5 h-3.5 text-slate-400')}<span>${formatTimeString(item.startTime, userPreferences.timeFormat)} \u2013 ${formatTimeString(item.endTime, userPreferences.timeFormat)}</span></div>
        </div>`;
      }).join('')}
    </div>

    ${ui.isAddFreeSlotOpen ? renderAddFreeSlotModal(userPreferences.timeFormat) : ''}
  </div>`;

  renderFreeTimeManager(document.getElementById('free-time-manager-root'), selectedDate, freeTimeSlots, tasks, userPreferences);
  wireEvents(root);
  refreshIcons();
}

function minutesPad(totalMinutes) {
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const m = (totalMinutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

// ---------------------------------------------------------------------------
// Free Time Manager (sub-panel)
// ---------------------------------------------------------------------------
function renderFreeTimeManager(mountEl, selectedDate, freeSlots, tasks, userPreferences) {
  const selectedDateObj = new Date(selectedDate + 'T12:00:00');
  const dayOfWeek = selectedDateObj.getDay();

  const daySlots = freeSlots.filter((slot) => {
    if (slot.date === selectedDate) return true;
    if (slot.isRecurring && slot.recurringDays && slot.recurringDays.includes(dayOfWeek)) return true;
    return false;
  }).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const totalFreeMinutes = daySlots.reduce((sum, s) => sum + Math.max(0, timeToMinutes(s.endTime) - timeToMinutes(s.startTime)), 0);
  const tasksInDay = tasks.filter((t) => t.scheduledDate === selectedDate && t.scheduledTime);
  const allocatedMinutes = tasksInDay.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
  const pendingUnscheduledTasks = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Archived' && (!t.scheduledTime || t.scheduledDate !== selectedDate));
  const isExpanded = ui.ftm.isExpanded;

  mountEl.innerHTML = `
  <div class="bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-white rounded-3xl border border-emerald-200/90 p-5 sm:p-6 shadow-xs transition-all">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">${icon('Clock', 'w-5 h-5')}</div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base font-black text-slate-900 tracking-tight">Free Time Slots &amp; Smart Task Arranger</h2>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-emerald-100 text-emerald-800">${daySlots.length} Slot${daySlots.length !== 1 ? 's' : ''}</span>
          </div>
          <p class="text-xs text-slate-600 mt-0.5">Enter your open windows; the system automatically arranges your tasks by priority into these free periods.</p>
        </div>
      </div>
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button id="add-free-slot-trigger-btn" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs transition">${icon('Plus', 'w-4 h-4 text-emerald-600')}<span>Add Free Slot</span></button>
        <button id="auto-arrange-tasks-btn" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/25 transition active:scale-98">${icon('Sparkles', 'w-4 h-4 text-amber-300')}<span>Auto-Arrange Tasks</span></button>
        <button id="toggle-ftm-expand-btn" title="${isExpanded ? 'Collapse' : 'Expand'}" class="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-emerald-100/50 transition">${isExpanded ? icon('ChevronUp', 'w-4 h-4') : icon('ChevronDown', 'w-4 h-4')}</button>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <div class="p-3 bg-white/90 rounded-2xl border border-emerald-100/80 shadow-2xs"><div class="text-[11px] font-semibold text-slate-500">Free Time Capacity</div><div class="text-base sm:text-lg font-black text-emerald-900 font-mono mt-0.5">${formatMinutes(totalFreeMinutes)}</div></div>
      <div class="p-3 bg-white/90 rounded-2xl border border-emerald-100/80 shadow-2xs"><div class="text-[11px] font-semibold text-slate-500">Tasks Allocated</div><div class="text-base sm:text-lg font-black text-indigo-900 font-mono mt-0.5">${tasksInDay.length} <span class="text-xs font-semibold text-slate-500">(${formatMinutes(allocatedMinutes)})</span></div></div>
      <div class="p-3 bg-white/90 rounded-2xl border border-emerald-100/80 shadow-2xs"><div class="text-[11px] font-semibold text-slate-500">Remaining Free Time</div><div class="text-base sm:text-lg font-black text-teal-800 font-mono mt-0.5">${formatMinutes(Math.max(0, totalFreeMinutes - allocatedMinutes))}</div></div>
      <div class="p-3 bg-white/90 rounded-2xl border border-emerald-100/80 shadow-2xs"><div class="text-[11px] font-semibold text-slate-500">Unscheduled Tasks Queue</div><div class="text-base sm:text-lg font-black text-amber-700 font-mono mt-0.5">${pendingUnscheduledTasks.length} pending</div></div>
    </div>

    ${ui.ftm.arrangeFeedback ? `
    <div class="mt-3.5 p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center justify-between border border-emerald-300 animate-fade-in">
      <div class="flex items-center gap-2">${icon('CheckCircle2', 'w-4 h-4 text-emerald-700 shrink-0')}<span>${ui.ftm.arrangeFeedback}</span></div>
      <button id="dismiss-arrange-feedback-btn" class="text-emerald-700 hover:text-emerald-900 text-[11px] underline">Dismiss</button>
    </div>` : ''}

    ${isExpanded ? `
    <div class="mt-4 space-y-2.5">
      ${daySlots.length === 0 ? `
      <div class="py-6 px-4 bg-white/60 rounded-2xl border border-dashed border-emerald-200 text-center text-xs text-slate-500">
        ${icon('Clock', 'w-6 h-6 mx-auto mb-1.5 text-emerald-400')}
        <p class="font-bold text-slate-700">No Free Time Slots configured for this day</p>
        <p class="text-[11px] text-slate-500 mt-0.5">Click <strong>"Add Free Slot"</strong> above to enter when you are free (e.g. 14:00 - 17:00), then tasks will arrange into them automatically.</p>
      </div>` : `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${daySlots.map((slot) => {
          const slotDuration = Math.max(0, timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime));
          const slotTasks = tasksInDay.filter((t) => t.scheduledTime && timeToMinutes(t.scheduledTime) >= timeToMinutes(slot.startTime) && timeToMinutes(t.scheduledTime) < timeToMinutes(slot.endTime));
          const slotAllocatedMinutes = slotTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
          const slotRemaining = Math.max(0, slotDuration - slotAllocatedMinutes);
          return `
          <div class="p-3.5 bg-white rounded-2xl border border-emerald-200/80 shadow-2xs flex flex-col justify-between gap-2.5">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-2 flex-wrap"><h4 class="text-xs sm:text-sm font-extrabold text-slate-900">${slot.title}</h4>${slot.isRecurring ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">Recurring</span>' : ''}</div>
                <div class="flex items-center gap-2 mt-1 text-xs font-mono font-bold text-emerald-800">${icon('Clock', 'w-3.5 h-3.5 text-emerald-600')}<span>${formatTimeString(slot.startTime, userPreferences.timeFormat)} \u2013 ${formatTimeString(slot.endTime, userPreferences.timeFormat)}</span><span class="text-slate-400 font-sans font-normal text-[11px]">(${formatMinutes(slotDuration)})</span></div>
              </div>
              <button data-delete-slot="${slot.id}" title="Delete free slot" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition">${icon('Trash2', 'w-3.5 h-3.5')}</button>
            </div>
            ${slot.notes ? `<p class="text-[11px] text-slate-500 italic">${slot.notes}</p>` : ''}
            <div>
              <div class="flex items-center justify-between text-[11px] text-slate-600 font-medium mb-1"><span>${slotTasks.length} task${slotTasks.length !== 1 ? 's' : ''} arranged (${formatMinutes(slotAllocatedMinutes)})</span><span class="font-semibold text-emerald-700">${slotRemaining > 0 ? `${formatMinutes(slotRemaining)} open` : 'Full'}</span></div>
              <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex"><div class="h-full bg-emerald-500 rounded-full transition-all duration-300" style="width:${Math.min(100, Math.round((slotAllocatedMinutes / slotDuration) * 100))}%"></div></div>
            </div>
            ${slotTasks.length > 0 ? `
            <div class="pt-1 border-t border-slate-100 space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Arranged in this window:</span>
              ${slotTasks.map((t) => `<div class="flex items-center justify-between gap-2 text-[11px] bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60"><span class="truncate font-semibold text-slate-800">${t.title}</span><span class="font-mono text-[10px] text-indigo-600 font-bold shrink-0">${formatTimeString(t.scheduledTime, userPreferences.timeFormat)} (${t.estimatedMinutes}m)</span></div>`).join('')}
            </div>` : ''}
          </div>`;
        }).join('')}
      </div>`}
      ${tasksInDay.length > 0 ? `
      <div class="pt-2 flex items-center justify-between text-xs text-slate-500">
        <span>Want to clear task times for today to re-pack them?</span>
        <button id="clear-day-schedules-btn" class="text-slate-600 hover:text-rose-600 font-bold underline transition">Clear Scheduled Times for Today</button>
      </div>` : ''}
    </div>` : ''}
  </div>`;

  mountEl.querySelector('#add-free-slot-trigger-btn')?.addEventListener('click', () => { ui.isAddFreeSlotOpen = true; ui.slotForm = null; renderSchedule(document.getElementById('view-root')); });
  mountEl.querySelector('#toggle-ftm-expand-btn')?.addEventListener('click', () => { ui.ftm.isExpanded = !ui.ftm.isExpanded; renderFreeTimeManager(mountEl, selectedDate, store.state.freeTimeSlots, store.state.tasks, store.state.preferences); refreshIcons(); });
  mountEl.querySelector('#dismiss-arrange-feedback-btn')?.addEventListener('click', () => { ui.ftm.arrangeFeedback = null; renderFreeTimeManager(mountEl, selectedDate, store.state.freeTimeSlots, store.state.tasks, store.state.preferences); refreshIcons(); });
  mountEl.querySelectorAll('[data-delete-slot]').forEach((b) => b.addEventListener('click', () => deleteFreeTimeSlot(b.getAttribute('data-delete-slot'))));
  mountEl.querySelector('#clear-day-schedules-btn')?.addEventListener('click', () => {
    if (!window.confirm('Clear scheduled times for tasks on this day so they can be re-arranged?')) return;
    const cleared = store.state.tasks.map((t) => (t.scheduledDate === selectedDate ? { ...t, scheduledTime: undefined } : t));
    setTasksBulk(cleared);
    ui.ftm.arrangeFeedback = 'Cleared scheduled times for this day.';
    renderSchedule(document.getElementById('view-root'));
    setTimeout(() => { ui.ftm.arrangeFeedback = null; renderSchedule(document.getElementById('view-root')); }, 4000);
  });
  mountEl.querySelector('#auto-arrange-tasks-btn')?.addEventListener('click', () => {
    if (daySlots.length === 0) {
      ui.ftm.arrangeFeedback = 'Please add at least one Free Time slot first.';
      renderSchedule(document.getElementById('view-root'));
      setTimeout(() => { ui.ftm.arrangeFeedback = null; renderSchedule(document.getElementById('view-root')); }, 8000);
      return;
    }
    const result = autoArrangeTasksInFreeSlots(store.state.tasks, store.state.freeTimeSlots, selectedDate);
    setTasksBulk(result.updatedTasks);
    ui.ftm.arrangeFeedback = result.arrangedCount === 0
      ? 'No pending tasks could be fitted into the available free time slots.'
      : `Successfully arranged ${result.arrangedCount} task${result.arrangedCount > 1 ? 's' : ''} (${formatMinutes(result.totalMinutesAllocated)} total) into your free slots!`;
    renderSchedule(document.getElementById('view-root'));
    setTimeout(() => { ui.ftm.arrangeFeedback = null; renderSchedule(document.getElementById('view-root')); }, 8000);
  });
}

// ---------------------------------------------------------------------------
// Add Free Slot Modal
// ---------------------------------------------------------------------------
function renderAddFreeSlotModal(timeFormat) {
  const f = ui.slotForm || (ui.slotForm = { title: '', startTime: '14:00', endTime: '17:00', date: ui.selectedDate, notes: '', isRecurring: false, recurringDays: [1, 2, 3, 4, 5] });
  return `
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
    <div class="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative">
      <button id="close-free-slot-modal-btn" class="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition">${icon('X', 'w-5 h-5')}</button>
      <div class="flex items-center gap-2 text-emerald-600 mb-1">
        <div class="p-2 rounded-xl bg-emerald-50 border border-emerald-200">${icon('Clock', 'w-5 h-5 text-emerald-600')}</div>
        <div><h2 class="text-lg font-black text-slate-900">Add Free Time Slot</h2><p class="text-xs text-slate-500">Define periods when you are free to automatically arrange tasks.</p></div>
      </div>
      <form id="add-free-slot-form" class="mt-5 space-y-4">
        <div><label class="block text-xs font-bold text-slate-700 mb-1">Slot Title / Description</label><input id="free-slot-title-input" type="text" value="${f.title}" placeholder="e.g. Afternoon Study Window, Evening Free Slot" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <div><label class="block text-xs font-bold text-slate-700 mb-1">Date</label><input id="free-slot-date-input" type="date" required value="${f.date}" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="block text-xs font-bold text-slate-700 mb-1">Start Time</label><input id="free-slot-start-time-input" type="time" required value="${f.startTime}" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
          <div><label class="block text-xs font-bold text-slate-700 mb-1">End Time</label><input id="free-slot-end-time-input" type="time" required value="${f.endTime}" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        </div>
        <div class="pt-1">
          <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800"><input id="free-slot-recurring-checkbox" type="checkbox" ${f.isRecurring ? 'checked' : ''} class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300" /><span>Repeat weekly on specific days</span></label>
          ${f.isRecurring ? `<div class="mt-2.5 flex items-center gap-1.5 flex-wrap">${SHORT_DAYS_OF_WEEK.map((dayName, idx) => `<button type="button" data-toggle-slot-day="${idx}" class="px-2.5 py-1 text-xs font-bold rounded-lg border transition ${f.recurringDays.includes(idx) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}">${dayName}</button>`).join('')}</div>` : ''}
        </div>
        <div><label class="block text-xs font-bold text-slate-700 mb-1">Notes / Location (Optional)</label><input id="free-slot-notes-input" type="text" value="${f.notes}" placeholder="e.g. University Library Desk 4, quiet time" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <div class="pt-2 flex items-center justify-end gap-2.5">
          <button type="button" id="cancel-free-slot-btn" class="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition">Cancel</button>
          <button type="submit" id="save-free-slot-btn" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5">${icon('Plus', 'w-4 h-4')}<span>Add Free Slot</span></button>
        </div>
      </form>
    </div>
  </div>`;
}

function wireEvents(root) {
  root.querySelector('#schedule-prev-day-btn')?.addEventListener('click', () => { shiftDate(-1); renderSchedule(root); });
  root.querySelector('#schedule-next-day-btn')?.addEventListener('click', () => { shiftDate(1); renderSchedule(root); });
  root.querySelector('#schedule-today-btn')?.addEventListener('click', () => { ui.selectedDate = getTodayDateString(); renderSchedule(root); });
  root.querySelector('#schedule-date-picker')?.addEventListener('change', (e) => { ui.selectedDate = e.target.value; renderSchedule(root); });
  root.querySelector('#schedule-quick-add-btn')?.addEventListener('click', () => store.setState({ isQuickAddOpen: true }));
  root.querySelectorAll('[data-toggle-task]').forEach((b) => b.addEventListener('click', () => toggleTaskStatus(b.getAttribute('data-toggle-task'))));

  // Add free slot modal
  root.querySelector('#close-free-slot-modal-btn')?.addEventListener('click', () => { ui.isAddFreeSlotOpen = false; renderSchedule(root); });
  root.querySelector('#cancel-free-slot-btn')?.addEventListener('click', () => { ui.isAddFreeSlotOpen = false; renderSchedule(root); });
  root.querySelector('#free-slot-title-input')?.addEventListener('input', (e) => (ui.slotForm.title = e.target.value));
  root.querySelector('#free-slot-date-input')?.addEventListener('input', (e) => (ui.slotForm.date = e.target.value));
  root.querySelector('#free-slot-start-time-input')?.addEventListener('input', (e) => (ui.slotForm.startTime = e.target.value));
  root.querySelector('#free-slot-end-time-input')?.addEventListener('input', (e) => (ui.slotForm.endTime = e.target.value));
  root.querySelector('#free-slot-notes-input')?.addEventListener('input', (e) => (ui.slotForm.notes = e.target.value));
  root.querySelector('#free-slot-recurring-checkbox')?.addEventListener('change', (e) => { ui.slotForm.isRecurring = e.target.checked; renderSchedule(root); });
  root.querySelectorAll('[data-toggle-slot-day]').forEach((b) => b.addEventListener('click', () => {
    const idx = Number(b.getAttribute('data-toggle-slot-day'));
    const days = ui.slotForm.recurringDays;
    ui.slotForm.recurringDays = days.includes(idx) ? days.filter((d) => d !== idx) : [...days, idx].sort((a, b2) => a - b2);
    renderSchedule(root);
  }));
  root.querySelector('#add-free-slot-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = ui.slotForm;
    if (!f.startTime || !f.endTime) return;
    addFreeTimeSlot({ title: f.title.trim() || 'Free Time Window', date: f.date, startTime: f.startTime, endTime: f.endTime, notes: f.notes.trim() || undefined, isRecurring: f.isRecurring, recurringDays: f.isRecurring ? f.recurringDays : undefined });
    ui.isAddFreeSlotOpen = false;
    ui.slotForm = null;
    renderSchedule(root);
  });
}

function shiftDate(delta) {
  const d = new Date(ui.selectedDate + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  ui.selectedDate = d.toISOString().slice(0, 10);
}
