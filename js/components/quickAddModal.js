import { icon, refreshIcons } from '../icons.js';
import { store, addTask } from '../store.js';
import { getTodayDateString } from '../time.js';

const DURATION_PRESETS = [5, 15, 30, 45, 60, 90, 120];

function freshForm() {
  return {
    title: '', description: '', classification: 'Academic', priority: 'Medium',
    estimatedMinutes: 30, scheduledDate: getTodayDateString(), scheduledTime: '',
    dueDate: '', dueTime: '', linkedSubjectId: '', linkedGoalId: '',
    remindersEnabled: true, showAdvanced: false,
  };
}
let form = freshForm();

export function renderQuickAddModal() {
  const root = document.getElementById('quick-add-root');
  const { isQuickAddOpen, subjects, goals } = store.state;

  if (!isQuickAddOpen) { root.innerHTML = ''; return; }

  root.innerHTML = `
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
    <div id="quick-add-modal-panel" class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
      <div class="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-indigo-500/30 rounded-lg border border-indigo-400/30">${icon('Sparkles', 'w-4 h-4 text-indigo-300')}</div>
          <div><h2 class="text-base font-bold">Quick Add Task</h2><p class="text-xs text-indigo-200">Capture actionable work with estimated duration &amp; priority</p></div>
        </div>
        <button id="close-quick-add-btn" class="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition">${icon('X', 'w-5 h-5')}</button>
      </div>

      <form id="quick-add-form" class="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Classification</label>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" data-classification="Academic" class="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border transition ${form.classification === 'Academic' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}">${icon('BookOpen', 'w-3.5 h-3.5')}<span>Academic</span></button>
            <button type="button" data-classification="Personal" class="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border transition ${form.classification === 'Personal' ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}">${icon('User', 'w-3.5 h-3.5')}<span>Personal</span></button>
            <button type="button" data-classification="Other" class="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border transition ${form.classification === 'Other' ? 'bg-slate-100 border-slate-500 text-slate-900 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}"><span>Other</span></button>
          </div>
        </div>

        <div>
          <label for="task-title-input" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Task Title *</label>
          <input id="task-title-input" type="text" required autofocus value="${escapeAttr(form.title)}" placeholder="e.g., Complete DBMS Normalization Problem Set 3" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Individual Priority</label>
            <div class="grid grid-cols-3 gap-1.5">
              ${['High', 'Medium', 'Low'].map((p) => {
                const active = form.priority === p;
                const activeCls = p === 'High' ? 'bg-rose-50 border-rose-500 text-rose-700' : p === 'Medium' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-slate-100 border-slate-400 text-slate-700';
                return `<button type="button" data-priority="${p}" id="select-priority-${p.toLowerCase()}" class="py-1.5 text-xs font-semibold rounded-lg border transition ${active ? activeCls : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}">${p}</button>`;
              }).join('')}
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Estimated Duration</label>
              <span class="text-xs font-bold text-indigo-600">${form.estimatedMinutes} min</span>
            </div>
            <div class="flex flex-wrap gap-1">
              ${DURATION_PRESETS.map((dur) => `<button type="button" data-duration="${dur}" class="px-2 py-1 text-xs font-medium rounded-md border transition ${form.estimatedMinutes === dur ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}">${dur}m</button>`).join('')}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label for="task-schedule-date" class="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">${icon('Calendar', 'w-3.5 h-3.5 text-slate-400')}Schedule Date</label>
            <input id="task-schedule-date" type="date" value="${form.scheduledDate}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
          </div>
          <div>
            <label for="task-schedule-time" class="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">${icon('Clock', 'w-3.5 h-3.5 text-slate-400')}Schedule Time (Optional)</label>
            <input id="task-schedule-time" type="time" value="${form.scheduledTime}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
          </div>
        </div>

        <div class="pt-1">
          <button type="button" id="toggle-advanced-fields-btn" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1">
            <span>${form.showAdvanced ? '\u2212 Hide Advanced Fields' : '+ Link to Subject, Goal, or Due Date'}</span>
          </button>
        </div>

        ${form.showAdvanced ? `
        <div class="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in text-xs sm:text-sm">
          ${form.classification === 'Academic' ? `
          <div>
            <label for="task-subject-select" class="block text-xs font-medium text-slate-600 mb-1">Related Subject</label>
            <select id="task-subject-select" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">None / General</option>
              ${subjects.map((sub) => `<option value="${sub.id}" ${form.linkedSubjectId === sub.id ? 'selected' : ''}>${sub.code}: ${sub.name}</option>`).join('')}
            </select>
          </div>` : ''}
          <div>
            <label for="task-goal-select" class="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">${icon('Target', 'w-3.5 h-3.5 text-indigo-500')}Connect to Long-Term Goal</label>
            <select id="task-goal-select" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">No linked goal</option>
              ${goals.map((g) => `<option value="${g.id}" ${form.linkedGoalId === g.id ? 'selected' : ''}>${g.title} (${g.type})</option>`).join('')}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div><label for="task-due-date" class="block text-xs font-medium text-slate-600 mb-1">Hard Deadline Date</label><input id="task-due-date" type="date" value="${form.dueDate}" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs" /></div>
            <div><label for="task-due-time" class="block text-xs font-medium text-slate-600 mb-1">Deadline Time</label><input id="task-due-time" type="time" value="${form.dueTime}" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs" /></div>
          </div>
          <div>
            <label for="task-notes-input" class="block text-xs font-medium text-slate-600 mb-1">Description / Notes</label>
            <textarea id="task-notes-input" rows="2" placeholder="Key sub-steps, references, or reminder instructions..." class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">${escapeHtml(form.description)}</textarea>
          </div>
          <div class="flex items-center justify-between pt-1">
            <span class="text-xs text-slate-600">Smart 5m &amp; 1m reminders for this task</span>
            <input id="task-reminder-toggle" type="checkbox" ${form.remindersEnabled ? 'checked' : ''} class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
          </div>
        </div>` : ''}

        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button type="button" id="cancel-quick-add-btn" class="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition">Cancel</button>
          <button type="submit" id="submit-quick-add-btn" class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition">${icon('Plus', 'w-4 h-4')}<span>Add to Schedule</span></button>
        </div>
      </form>
    </div>
  </div>`;

  wireEvents(root);
  refreshIcons();
}

function escapeAttr(s) { return (s || '').replace(/"/g, '&quot;'); }
function escapeHtml(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function closeModal() {
  form = freshForm();
  store.setState({ isQuickAddOpen: false });
}

function wireEvents(root) {
  const syncFromDom = () => {
    form.title = root.querySelector('#task-title-input')?.value ?? form.title;
    form.scheduledDate = root.querySelector('#task-schedule-date')?.value ?? form.scheduledDate;
    form.scheduledTime = root.querySelector('#task-schedule-time')?.value ?? form.scheduledTime;
    if (form.showAdvanced) {
      form.linkedSubjectId = root.querySelector('#task-subject-select')?.value ?? form.linkedSubjectId;
      form.linkedGoalId = root.querySelector('#task-goal-select')?.value ?? form.linkedGoalId;
      form.dueDate = root.querySelector('#task-due-date')?.value ?? form.dueDate;
      form.dueTime = root.querySelector('#task-due-time')?.value ?? form.dueTime;
      form.description = root.querySelector('#task-notes-input')?.value ?? form.description;
      form.remindersEnabled = root.querySelector('#task-reminder-toggle')?.checked ?? form.remindersEnabled;
    }
  };

  root.querySelector('#close-quick-add-btn')?.addEventListener('click', closeModal);
  root.querySelector('#cancel-quick-add-btn')?.addEventListener('click', closeModal);

  root.querySelectorAll('[data-classification]').forEach((b) => b.addEventListener('click', () => {
    syncFromDom(); form.classification = b.getAttribute('data-classification'); renderQuickAddModal();
  }));
  root.querySelectorAll('[data-priority]').forEach((b) => b.addEventListener('click', () => {
    syncFromDom(); form.priority = b.getAttribute('data-priority'); renderQuickAddModal();
  }));
  root.querySelectorAll('[data-duration]').forEach((b) => b.addEventListener('click', () => {
    syncFromDom(); form.estimatedMinutes = parseInt(b.getAttribute('data-duration'), 10); renderQuickAddModal();
  }));
  root.querySelector('#toggle-advanced-fields-btn')?.addEventListener('click', () => {
    syncFromDom(); form.showAdvanced = !form.showAdvanced; renderQuickAddModal();
  });

  root.querySelector('#quick-add-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    syncFromDom();
    if (!form.title.trim()) return;

    addTask({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      classification: form.classification,
      priority: form.priority,
      estimatedMinutes: Math.max(5, form.estimatedMinutes),
      status: 'Pending',
      scheduledDate: form.scheduledDate || undefined,
      scheduledTime: form.scheduledTime || undefined,
      dueDate: form.dueDate || undefined,
      dueTime: form.dueTime || undefined,
      linkedSubjectId: form.classification === 'Academic' && form.linkedSubjectId ? form.linkedSubjectId : undefined,
      linkedGoalId: form.linkedGoalId || undefined,
      remindersEnabled: form.remindersEnabled,
      customReminderMinutes: 5,
    });
    closeModal();
  });
}
