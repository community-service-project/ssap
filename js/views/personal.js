import { icon, refreshIcons } from '../icons.js';
import { store, addPersonalWork, deletePersonalWork, updateSleepRoutine } from '../store.js';
import { DAYS_OF_WEEK, formatMinutes, formatTimeString } from '../time.js';

const ui = {
  showAddModal: false,
  sleepSavedAlert: false,
  form: { title: '', category: 'Exercise', estimatedMinutes: 45, startTime: '07:30', priority: 'Medium', isRecurring: true, recurringDays: [1, 3, 5] },
};
let sleepForm = null; // lazily initialized from current sleep routine

function categoryIcon(cat) {
  switch (cat) {
    case 'Sleep': return icon('Moon', 'w-4 h-4 text-purple-500');
    case 'Exercise': return icon('Dumbbell', 'w-4 h-4 text-emerald-500');
    case 'Meals': case 'Meal': return icon('Utensils', 'w-4 h-4 text-amber-500');
    default: return icon('Heart', 'w-4 h-4 text-pink-500');
  }
}

export function renderPersonal(root) {
  const { personalWorks, preferences: userPreferences } = store.state;
  const sleepRoutine = personalWorks.find((p) => p.category === 'Sleep');
  if (!sleepForm) {
    sleepForm = { bedtime: sleepRoutine?.startTime || '23:00', wakeTime: sleepRoutine?.endTime || '07:00', windDownMins: sleepRoutine?.windDownMinutes || 30 };
  }
  const otherPersonalWorks = personalWorks.filter((p) => p.category !== 'Sleep');

  root.innerHTML = `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">${icon('Heart', 'w-5 h-5 text-purple-600')}Personal Works &amp; Rest Management</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Protect your sleep routine, fitness, nutrition, and daily recovery alongside academic work.</p>
      </div>
      <button id="open-add-personal-modal-btn" class="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition self-start sm:self-auto">${icon('Plus', 'w-4 h-4')}<span>Add Routine / Habit</span></button>
    </div>

    <div class="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-6 sm:p-8 shadow-xl border border-purple-900/50 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="relative z-10">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/30">${icon('Moon', 'w-6 h-6')}</div>
            <div><span class="text-xs font-bold uppercase tracking-wider text-purple-300">Daily Anchor Routine</span><h2 class="text-xl sm:text-2xl font-black text-white">Restorative Sleep &amp; Wind-Down</h2></div>
          </div>
          ${ui.sleepSavedAlert ? `<span class="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold rounded-full animate-fade-in">${icon('CheckCircle2', 'w-3.5 h-3.5')} Sleep preferences saved</span>` : ''}
        </div>

        <form id="save-sleep-form" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
            <label class="block text-xs font-bold uppercase text-purple-200 mb-2">Target Bedtime</label>
            <input id="sleep-bedtime-input" type="time" value="${sleepForm.bedtime}" class="w-full px-3.5 py-2.5 bg-slate-900/80 border border-purple-400/30 rounded-xl text-lg font-bold font-mono text-cyan-300 focus:outline-none focus:border-cyan-400" />
            <span class="text-[11px] text-slate-400 mt-2 block">Formatted: <strong id="sleep-bedtime-formatted" class="text-slate-200">${formatTimeString(sleepForm.bedtime, userPreferences.timeFormat)}</strong></span>
          </div>
          <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
            <label class="block text-xs font-bold uppercase text-purple-200 mb-2">Target Wake-Up Time</label>
            <input id="sleep-waketime-input" type="time" value="${sleepForm.wakeTime}" class="w-full px-3.5 py-2.5 bg-slate-900/80 border border-purple-400/30 rounded-xl text-lg font-bold font-mono text-cyan-300 focus:outline-none focus:border-cyan-400" />
            <span class="text-[11px] text-slate-400 mt-2 block">Formatted: <strong id="sleep-waketime-formatted" class="text-slate-200">${formatTimeString(sleepForm.wakeTime, userPreferences.timeFormat)}</strong></span>
          </div>
          <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div>
              <label class="block text-xs font-bold uppercase text-purple-200 mb-2">Gentle Wind-Down Window</label>
              <select id="sleep-winddown-select" class="w-full px-3.5 py-2.5 bg-slate-900/80 border border-purple-400/30 rounded-xl text-sm font-bold text-white focus:outline-none">
                <option value="15" ${sleepForm.windDownMins === 15 ? 'selected' : ''}>15 minutes before sleep</option>
                <option value="30" ${sleepForm.windDownMins === 30 ? 'selected' : ''}>30 minutes before sleep (Recommended)</option>
                <option value="45" ${sleepForm.windDownMins === 45 ? 'selected' : ''}>45 minutes before sleep</option>
                <option value="60" ${sleepForm.windDownMins === 60 ? 'selected' : ''}>60 minutes before sleep</option>
              </select>
              <p class="text-[11px] text-purple-300 mt-2">Dispatches a gentle, non-urgent chime to dim blue-light screens and prepare for rest.</p>
            </div>
            <button type="submit" id="save-sleep-routine-btn" class="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-500 font-bold text-xs rounded-xl shadow-md transition">Update Sleep Routine</button>
          </div>
        </form>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900">Personal Activities &amp; Habits</h2>
        <span class="text-xs text-slate-500">${otherPersonalWorks.length} active routines</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${otherPersonalWorks.map((work) => `
        <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-2"><div class="p-2 rounded-xl bg-slate-50 border border-slate-100">${categoryIcon(work.category)}</div><span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">${work.category}</span></div>
              <button data-delete-personal="${work.id}" class="p-1 text-slate-400 hover:text-rose-600 transition">${icon('Trash2', 'w-4 h-4')}</button>
            </div>
            <h3 class="text-base font-bold text-slate-900 mt-3">${work.title}</h3>
            <div class="mt-3 space-y-1.5 text-xs text-slate-600">
              ${work.startTime ? `<div class="flex items-center gap-1.5 font-mono">${icon('Clock', 'w-3.5 h-3.5 text-slate-400')}<span>${formatTimeString(work.startTime, userPreferences.timeFormat)}</span></div>` : ''}
              <div class="flex items-center gap-1.5">${icon('Activity', 'w-3.5 h-3.5 text-slate-400')}<span>Duration: ${formatMinutes(work.estimatedMinutes)}</span></div>
            </div>
            ${work.isRecurring && work.recurringDays ? `
            <div class="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1">
              ${[1, 2, 3, 4, 5, 6, 0].map((d) => `<span class="w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center ${work.recurringDays.includes(d) ? 'bg-purple-100 text-purple-700' : 'bg-slate-50 text-slate-300'}">${DAYS_OF_WEEK[d].charAt(0)}</span>`).join('')}
            </div>` : ''}
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${work.priority === 'High' ? 'bg-rose-100 text-rose-700' : work.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}">${work.priority}</span>
            <span class="text-slate-400 text-[11px]">${work.isRecurring ? 'Repeats weekly' : 'Single event'}</span>
          </div>
        </div>`).join('')}
      </div>
    </div>

    ${ui.showAddModal ? renderAddModal() : ''}
  </div>`;

  wireEvents(root);
  refreshIcons();
}

function renderAddModal() {
  const f = ui.form;
  return `
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 class="text-base font-bold text-slate-900">Add Personal Activity / Routine</h3>
        <button id="close-add-personal-modal-btn" class="text-slate-400 hover:text-slate-600">${icon('X', 'w-5 h-5')}</button>
      </div>
      <form id="add-personal-form" class="space-y-3 text-xs sm:text-sm">
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Activity Name *</label><input id="personal-title-input" type="text" required placeholder="e.g. Strength Training & Cardio" value="${f.title}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
        <div class="grid grid-cols-2 gap-2">
          <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
            <select id="personal-category-select" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
              ${['Exercise', 'Meals', 'Chores', 'Health', 'Hobbies', 'Other'].map((c) => `<option value="${c}" ${f.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Priority</label>
            <select id="personal-priority-select" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
              ${['High', 'Medium', 'Low'].map((p) => `<option value="${p}" ${f.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Estimated Duration (m)</label><input id="personal-duration-input" type="number" min="10" step="5" value="${f.estimatedMinutes}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
          <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Start Time (Optional)</label><input id="personal-starttime-input" type="time" value="${f.startTime}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
        </div>
        <div class="pt-2">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-slate-700">Recurring Routine</span>
            <input id="personal-recurring-toggle" type="checkbox" ${f.isRecurring ? 'checked' : ''} class="w-4 h-4 text-purple-600 rounded" />
          </div>
          ${f.isRecurring ? `
          <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            ${[1, 2, 3, 4, 5, 6, 0].map((d) => `<button type="button" data-toggle-day="${d}" class="w-7 h-7 rounded-lg text-xs font-bold transition ${f.recurringDays.includes(d) ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}">${DAYS_OF_WEEK[d].charAt(0)}</button>`).join('')}
          </div>` : ''}
        </div>
        <div class="pt-4 flex justify-end gap-2">
          <button type="button" id="cancel-add-personal-btn" class="px-4 py-2 text-slate-600 font-semibold">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs">Add Routine</button>
        </div>
      </form>
    </div>
  </div>`;
}

function wireEvents(root) {
  root.querySelector('#sleep-bedtime-input')?.addEventListener('input', (e) => {
    sleepForm.bedtime = e.target.value;
    root.querySelector('#sleep-bedtime-formatted').textContent = formatTimeString(sleepForm.bedtime, store.state.preferences.timeFormat);
  });
  root.querySelector('#sleep-waketime-input')?.addEventListener('input', (e) => {
    sleepForm.wakeTime = e.target.value;
    root.querySelector('#sleep-waketime-formatted').textContent = formatTimeString(sleepForm.wakeTime, store.state.preferences.timeFormat);
  });
  root.querySelector('#sleep-winddown-select')?.addEventListener('change', (e) => (sleepForm.windDownMins = Number(e.target.value)));
  root.querySelector('#save-sleep-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    updateSleepRoutine({ startTime: sleepForm.bedtime, endTime: sleepForm.wakeTime, windDownMinutes: sleepForm.windDownMins, estimatedMinutes: 480 });
    ui.sleepSavedAlert = true;
    renderPersonal(root);
    setTimeout(() => { ui.sleepSavedAlert = false; renderPersonal(root); }, 2500);
  });

  root.querySelector('#open-add-personal-modal-btn')?.addEventListener('click', () => { ui.showAddModal = true; renderPersonal(root); });
  root.querySelector('#close-add-personal-modal-btn')?.addEventListener('click', () => { ui.showAddModal = false; renderPersonal(root); });
  root.querySelector('#cancel-add-personal-btn')?.addEventListener('click', () => { ui.showAddModal = false; renderPersonal(root); });

  root.querySelectorAll('[data-delete-personal]').forEach((b) => b.addEventListener('click', () => deletePersonalWork(b.getAttribute('data-delete-personal'))));

  root.querySelector('#personal-title-input')?.addEventListener('input', (e) => (ui.form.title = e.target.value));
  root.querySelector('#personal-category-select')?.addEventListener('change', (e) => (ui.form.category = e.target.value));
  root.querySelector('#personal-priority-select')?.addEventListener('change', (e) => (ui.form.priority = e.target.value));
  root.querySelector('#personal-duration-input')?.addEventListener('input', (e) => (ui.form.estimatedMinutes = Number(e.target.value)));
  root.querySelector('#personal-starttime-input')?.addEventListener('input', (e) => (ui.form.startTime = e.target.value));
  root.querySelector('#personal-recurring-toggle')?.addEventListener('change', (e) => { ui.form.isRecurring = e.target.checked; renderPersonal(root); });
  root.querySelectorAll('[data-toggle-day]').forEach((b) => b.addEventListener('click', () => {
    const d = Number(b.getAttribute('data-toggle-day'));
    ui.form.recurringDays = ui.form.recurringDays.includes(d) ? ui.form.recurringDays.filter((x) => x !== d) : [...ui.form.recurringDays, d];
    renderPersonal(root);
  }));

  root.querySelector('#add-personal-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = ui.form;
    if (!f.title.trim()) return;
    addPersonalWork({ title: f.title.trim(), category: f.category, estimatedMinutes: f.estimatedMinutes, startTime: f.startTime || undefined, priority: f.priority, isRecurring: f.isRecurring, recurringDays: f.isRecurring ? f.recurringDays : undefined, status: 'Scheduled', createdAt: new Date().toISOString() });
    ui.form.title = '';
    ui.showAddModal = false;
    renderPersonal(root);
  });
}
