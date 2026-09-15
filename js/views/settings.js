import { icon, refreshIcons } from '../icons.js';
import { store, updatePreferences, resetDemoData, importJSONBundle, exportToJSON, exportToCSV } from '../store.js';
import { playNotificationChime, sendSmartNotification, requestNotificationPermission } from '../notifications.js';

let form = null; // lazily initialized from current preferences
let saveStatus = false;

function initForm(preferences) {
  form = {
    academicWeight: preferences.priorityWeights.academic,
    personalWeight: preferences.priorityWeights.personal,
    goalsWeight: preferences.priorityWeights.goals,
    timeFormat: preferences.timeFormat,
    timezone: preferences.timezone,
    weekStartDay: preferences.weekStartDay,
    themeMode: preferences.themeMode,
    notifsEnabled: preferences.notificationsEnabled,
    n5m: preferences.notify5MinBefore,
    n1m: preferences.notify1MinBefore,
    nStart: preferences.notifyAtStart,
    nOverdue: preferences.notifyOverdue,
    nWindDown: preferences.notifySleepWindDown,
    soundEnabled: preferences.soundEnabled,
  };
}

export function renderSettings(root) {
  const { preferences } = store.state;
  if (!form) initForm(preferences);
  const f = form;
  const currentTotalWeight = f.academicWeight + f.personalWeight + f.goalsWeight;
  const isTotalValid = currentTotalWeight === 100;

  root.innerHTML = `
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex items-center justify-between">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">${icon('Settings', 'w-5 h-5 text-indigo-600')}System &amp; Work Preferences</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Configure 12h/24h time, the 100% Work Priority formula, and smart notifications.</p>
      </div>
      <button id="save-settings-top-btn" ${!isTotalValid ? 'disabled' : ''} class="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition">${saveStatus ? icon('Check', 'w-4 h-4') : icon('Save', 'w-4 h-4')}<span>${saveStatus ? 'Saved!' : 'Save Preferences'}</span></button>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <div class="flex items-center gap-2">${icon('Percent', 'w-4 h-4 text-purple-600')}<h2 class="text-base font-bold text-slate-900">Work Priority Distribution (Must Total 100%)</h2></div>
          <p class="text-xs text-slate-500 mt-1">Macro balance formula between Academic Works, Personal Recovery, and Long-Term Goals.</p>
        </div>
        <div class="px-3 py-1 rounded-xl text-xs font-black self-start sm:self-auto border ${isTotalValid ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'}">Sum: ${currentTotalWeight}% ${isTotalValid ? '\u2713 Valid' : '\u26a0\ufe0f Must be 100%'}</div>
      </div>

      <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
        <strong class="text-slate-900 font-semibold block mb-0.5">Dual-Priority Isolation Rule:</strong>
        Adjusting these overall category percentages reflects your macro student focus (e.g. during finals). It <em>never</em> changes individual task priorities (High/Medium/Low).
      </div>

      <div class="space-y-4 pt-1">
        <div>
          <div class="flex justify-between text-xs font-bold mb-1.5"><span class="text-blue-700">Academic Works</span><span class="font-mono text-sm">${f.academicWeight}%</span></div>
          <input id="weight-academic-slider" type="range" min="0" max="100" step="5" value="${f.academicWeight}" class="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
        </div>
        <div>
          <div class="flex justify-between text-xs font-bold mb-1.5"><span class="text-purple-700">Personal Works &amp; Sleep</span><span class="font-mono text-sm">${f.personalWeight}%</span></div>
          <input id="weight-personal-slider" type="range" min="0" max="100" step="5" value="${f.personalWeight}" class="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600" />
        </div>
        <div>
          <div class="flex justify-between text-xs font-bold mb-1.5"><span class="text-amber-700">Long-Term Goals</span><span class="font-mono text-sm">${f.goalsWeight}%</span></div>
          <input id="weight-goals-slider" type="range" min="0" max="100" step="5" value="${f.goalsWeight}" class="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600" />
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
        <span class="text-slate-500 font-semibold">Recommended Presets:</span>
        <div class="flex gap-2">
          <button type="button" data-preset="60,25,15" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold transition">Standard (60/25/15)</button>
          <button type="button" data-preset="75,15,10" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold transition">Exam Crunch (75/15/10)</button>
          <button type="button" data-preset="40,40,20" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold transition">Wellness Reset (40/40/20)</button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div class="flex items-center gap-2 pb-3 border-b border-slate-100">${icon('Clock', 'w-4 h-4 text-cyan-600')}<h2 class="text-base font-bold text-slate-900">Time Format &amp; Regional Display</h2></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Clock Representation</label>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" id="format-12h-btn" class="py-2 px-3 rounded-xl border font-bold text-xs transition ${f.timeFormat === '12h' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs' : 'bg-white border-slate-200 text-slate-600'}">12-Hour (e.g., 2:30 PM)</button>
            <button type="button" id="format-24h-btn" class="py-2 px-3 rounded-xl border font-bold text-xs transition ${f.timeFormat === '24h' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs' : 'bg-white border-slate-200 text-slate-600'}">24-Hour (e.g., 14:30)</button>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Week Starts On</label>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" id="weekstart-mon-btn" class="py-2 px-3 rounded-xl border font-bold text-xs transition ${f.weekStartDay === 1 ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs' : 'bg-white border-slate-200 text-slate-600'}">Monday (Standard)</button>
            <button type="button" id="weekstart-sun-btn" class="py-2 px-3 rounded-xl border font-bold text-xs transition ${f.weekStartDay === 0 ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs' : 'bg-white border-slate-200 text-slate-600'}">Sunday</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">${icon('Bell', 'w-4 h-4 text-rose-500')}<h2 class="text-base font-bold text-slate-900">Smart Notifications Rules</h2></div>
        <button id="test-notification-settings-btn" class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 transition">${icon('Volume2', 'w-3.5 h-3.5')}<span>Test Audio &amp; Alert</span></button>
      </div>
      <div class="space-y-3 text-xs sm:text-sm">
        ${toggleRow('n5m-toggle', '5 Minutes Before Start (Default)', 'Gives advance time to open notes and reach lecture hall.', f.n5m)}
        ${toggleRow('n1m-toggle', '1 Minute Before Start (Default)', 'Final transition cue to begin actionable task.', f.n1m)}
        ${toggleRow('nstart-toggle', 'At Scheduled Start Time', 'Direct prompt when the slot begins.', f.nStart)}
        ${toggleRow('nwinddown-toggle', 'Sleep Wind-Down Reminders', 'Gentle evening prompt to dim screens and prepare for rest.', f.nWindDown)}
        ${toggleRow('sound-toggle', 'Audio Bell Chime', 'Web Audio API gentle harmonic bell on notifications.', f.soundEnabled)}
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div class="flex items-center gap-2 pb-3 border-b border-slate-100">${icon('Shield', 'w-4 h-4 text-emerald-600')}<h2 class="text-base font-bold text-slate-900">Data Management &amp; Self-Hostability</h2></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <button id="export-json-btn" class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition flex flex-col items-center justify-center gap-1.5 text-slate-800">${icon('Download', 'w-4 h-4 text-slate-600')}<span class="text-xs font-bold">Export JSON</span><span class="text-[10px] text-slate-500">Database backup</span></button>
        <button id="export-csv-btn" class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition flex flex-col items-center justify-center gap-1.5 text-slate-800">${icon('FileSpreadsheet', 'w-4 h-4 text-emerald-600')}<span class="text-xs font-bold">Export Tasks CSV</span><span class="text-[10px] text-slate-500">Spreadsheets</span></button>
        <label class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition flex flex-col items-center justify-center gap-1.5 text-slate-800 cursor-pointer">${icon('Upload', 'w-4 h-4 text-cyan-600')}<span class="text-xs font-bold">Import Backup</span><span class="text-[10px] text-slate-500">Restore state</span><input id="import-json-file-input" type="file" accept=".json" class="hidden" /></label>
        <button id="reset-demo-data-btn" class="p-3.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 transition flex flex-col items-center justify-center gap-1.5 text-rose-800">${icon('RefreshCw', 'w-4 h-4 text-rose-600')}<span class="text-xs font-bold">Reset Demo</span><span class="text-[10px] text-rose-500">Fresh seed</span></button>
      </div>
    </div>
  </div>`;

  wireEvents(root);
  refreshIcons();
}

function toggleRow(id, title, desc, checked) {
  return `
  <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
    <div><strong class="block text-slate-900 font-semibold">${title}</strong><span class="text-xs text-slate-500">${desc}</span></div>
    <input id="${id}" type="checkbox" ${checked ? 'checked' : ''} class="w-4 h-4 text-indigo-600 rounded" />
  </div>`;
}

function wireEvents(root) {
  root.querySelector('#weight-academic-slider')?.addEventListener('input', (e) => { form.academicWeight = Number(e.target.value); renderSettings(root); });
  root.querySelector('#weight-personal-slider')?.addEventListener('input', (e) => { form.personalWeight = Number(e.target.value); renderSettings(root); });
  root.querySelector('#weight-goals-slider')?.addEventListener('input', (e) => { form.goalsWeight = Number(e.target.value); renderSettings(root); });
  root.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    const [a, p, g] = b.getAttribute('data-preset').split(',').map(Number);
    form.academicWeight = a; form.personalWeight = p; form.goalsWeight = g;
    renderSettings(root);
  }));

  root.querySelector('#format-12h-btn')?.addEventListener('click', () => { form.timeFormat = '12h'; renderSettings(root); });
  root.querySelector('#format-24h-btn')?.addEventListener('click', () => { form.timeFormat = '24h'; renderSettings(root); });
  root.querySelector('#weekstart-mon-btn')?.addEventListener('click', () => { form.weekStartDay = 1; renderSettings(root); });
  root.querySelector('#weekstart-sun-btn')?.addEventListener('click', () => { form.weekStartDay = 0; renderSettings(root); });

  root.querySelector('#n5m-toggle')?.addEventListener('change', (e) => (form.n5m = e.target.checked));
  root.querySelector('#n1m-toggle')?.addEventListener('change', (e) => (form.n1m = e.target.checked));
  root.querySelector('#nstart-toggle')?.addEventListener('change', (e) => (form.nStart = e.target.checked));
  root.querySelector('#nwinddown-toggle')?.addEventListener('change', (e) => (form.nWindDown = e.target.checked));
  root.querySelector('#sound-toggle')?.addEventListener('change', (e) => (form.soundEnabled = e.target.checked));

  root.querySelector('#test-notification-settings-btn')?.addEventListener('click', async () => {
    if (form.soundEnabled) playNotificationChime();
    const perm = await requestNotificationPermission();
    if (perm === 'granted') sendSmartNotification('SSAP 5-Minute Alert Test', { body: 'Upcoming task test: Your lecture starts in 5 minutes.', sound: form.soundEnabled });
  });

  root.querySelector('#save-settings-top-btn')?.addEventListener('click', () => {
    const f = form;
    if (f.academicWeight + f.personalWeight + f.goalsWeight !== 100) return;
    updatePreferences({
      timeFormat: f.timeFormat, timezone: f.timezone, weekStartDay: f.weekStartDay,
      priorityWeights: { academic: f.academicWeight, personal: f.personalWeight, goals: f.goalsWeight },
      notificationsEnabled: f.notifsEnabled, notify5MinBefore: f.n5m, notify1MinBefore: f.n1m,
      notifyAtStart: f.nStart, notifyOverdue: f.nOverdue, notifySleepWindDown: f.nWindDown, soundEnabled: f.soundEnabled,
    });
    saveStatus = true;
    renderSettings(root);
    setTimeout(() => { saveStatus = false; renderSettings(root); }, 2500);
  });

  root.querySelector('#export-json-btn')?.addEventListener('click', () => {
    const { tasks, subjects, timetable, academicWorks, personalWorks, goals, preferences, freeTimeSlots } = store.state;
    exportToJSON({ tasks, subjects, timetable, academicWorks, personalWorks, goals, preferences, freeTimeSlots }, `ssap-backup-${new Date().toISOString().slice(0, 10)}.json`);
  });
  root.querySelector('#export-csv-btn')?.addEventListener('click', () => {
    exportToCSV(
      store.state.tasks,
      [{ header: 'Title', key: 'title' }, { header: 'Classification', key: 'classification' }, { header: 'Priority', key: 'priority' }, { header: 'Status', key: 'status' }, { header: 'Estimated Minutes', key: 'estimatedMinutes' }, { header: 'Scheduled Date', key: 'scheduledDate' }, { header: 'Due Date', key: 'dueDate' }],
      `ssap-tasks-${new Date().toISOString().slice(0, 10)}.csv`
    );
  });
  root.querySelector('#import-json-file-input')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => { if (evt.target?.result) importJSONBundle(evt.target.result); };
    reader.readAsText(file);
  });
  root.querySelector('#reset-demo-data-btn')?.addEventListener('click', () => {
    if (window.confirm('Reset all tasks, timetable, and subjects to initial university demo data?')) resetDemoData();
  });
}
