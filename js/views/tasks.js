import { icon, refreshIcons } from '../icons.js';
import { store, addTask, toggleTaskStatus, deleteTask } from '../store.js';
import { formatMinutes, formatShortDate, formatTimeString } from '../time.js';
import { rerenderPreservingFocus } from '../domUtils.js';
import { openEditTaskModal } from '../components/quickAddModal.js';

const ui = {
  searchQuery: '', statusFilter: 'active', classificationFilter: 'All', priorityFilter: 'All',
  sortBy: 'priority', expandedTaskId: null,
  quickTitle: '', quickPriority: 'Medium', quickDuration: 30, quickClassification: 'Academic',
};

export function renderTasks(root) {
  const { tasks, subjects, goals, preferences: userPreferences } = store.state;

  let filteredTasks = tasks.filter((t) => {
    if (ui.searchQuery.trim()) {
      const q = ui.searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    if (ui.statusFilter === 'active') {
      if (t.status === 'Completed' || t.status === 'Archived') return false;
    } else if (ui.statusFilter !== 'all') {
      if (t.status !== ui.statusFilter) return false;
    }
    if (ui.classificationFilter !== 'All' && t.classification !== ui.classificationFilter) return false;
    if (ui.priorityFilter !== 'All' && t.priority !== ui.priorityFilter) return false;
    return true;
  });

  filteredTasks.sort((a, b) => {
    if (ui.sortBy === 'priority') {
      const weight = { High: 3, Medium: 2, Low: 1 };
      return weight[b.priority] - weight[a.priority];
    }
    if (ui.sortBy === 'duration') return b.estimatedMinutes - a.estimatedMinutes;
    if (ui.sortBy === 'date') {
      const dateA = a.dueDate || a.scheduledDate || '9999-99-99';
      const dateB = b.dueDate || b.scheduledDate || '9999-99-99';
      return dateA.localeCompare(dateB);
    }
    return a.title.localeCompare(b.title);
  });

  root.innerHTML = `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">${icon('Zap', 'w-5 h-5 text-indigo-600')}Actionable Work &amp; Tasks</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Rapid task capture with estimated durations, individual priorities, and goal links.</p>
        </div>
        <button id="tasks-open-full-modal-btn" class="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition self-start sm:self-auto">${icon('Plus', 'w-4 h-4')}<span>Full Task Creator</span></button>
      </div>

      <form id="inline-quick-add-form" class="bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input id="inline-task-title-input" type="text" value="${escapeAttr(ui.quickTitle)}" placeholder="Type a task and hit Enter (e.g., Review Week 4 Lecture Notes)..." class="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <div class="flex items-center gap-2 flex-wrap">
          <select id="inline-classification-select" class="px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="Academic" ${ui.quickClassification === 'Academic' ? 'selected' : ''}>Academic</option>
            <option value="Personal" ${ui.quickClassification === 'Personal' ? 'selected' : ''}>Personal</option>
            <option value="Other" ${ui.quickClassification === 'Other' ? 'selected' : ''}>Other</option>
          </select>
          <select id="inline-priority-select" class="px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="High" ${ui.quickPriority === 'High' ? 'selected' : ''}>High Priority</option>
            <option value="Medium" ${ui.quickPriority === 'Medium' ? 'selected' : ''}>Medium Priority</option>
            <option value="Low" ${ui.quickPriority === 'Low' ? 'selected' : ''}>Low Priority</option>
          </select>
          <select id="inline-duration-select" class="px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            ${[15, 30, 45, 60, 90].map((d) => `<option value="${d}" ${ui.quickDuration === d ? 'selected' : ''}>${d}m</option>`).join('')}
          </select>
          <button type="submit" id="inline-add-task-btn" ${!ui.quickTitle.trim() ? 'disabled' : ''} class="px-4 py-2 bg-indigo-600 disabled:opacity-50 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition">Add</button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <div class="relative flex-1 max-w-md">
        ${icon('Search', 'w-4 h-4 text-slate-400 absolute left-3 top-2.5')}
        <input id="search-tasks-input" type="text" value="${escapeAttr(ui.searchQuery)}" placeholder="Search tasks or notes..." class="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
      </div>
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button data-status-filter="active" class="px-2.5 py-1 rounded-lg font-semibold transition ${ui.statusFilter === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}">Active</button>
          <button data-status-filter="Completed" class="px-2.5 py-1 rounded-lg font-semibold transition ${ui.statusFilter === 'Completed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}">Done</button>
          <button data-status-filter="all" class="px-2.5 py-1 rounded-lg font-semibold transition ${ui.statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}">All</button>
        </div>
        <select id="classification-filter-select" class="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none">
          ${['All', 'Academic', 'Personal', 'Other'].map((v) => `<option value="${v}" ${ui.classificationFilter === v ? 'selected' : ''}>${v === 'All' ? 'All Types' : v}</option>`).join('')}
        </select>
        <select id="priority-filter-select" class="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none">
          ${['All', 'High', 'Medium', 'Low'].map((v) => `<option value="${v}" ${ui.priorityFilter === v ? 'selected' : ''}>${v === 'All' ? 'All Priorities' : v}</option>`).join('')}
        </select>
        <select id="sort-by-select" class="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none">
          <option value="priority" ${ui.sortBy === 'priority' ? 'selected' : ''}>Sort: Priority</option>
          <option value="duration" ${ui.sortBy === 'duration' ? 'selected' : ''}>Sort: Duration</option>
          <option value="date" ${ui.sortBy === 'date' ? 'selected' : ''}>Sort: Date</option>
          <option value="title" ${ui.sortBy === 'title' ? 'selected' : ''}>Sort: Title</option>
        </select>
      </div>
    </div>

    <div class="space-y-3">
      ${filteredTasks.map((task) => {
        const sub = subjects.find((s) => s.id === task.linkedSubjectId);
        const goal = goals.find((g) => g.id === task.linkedGoalId);
        const isExpanded = ui.expandedTaskId === task.id;
        const isCompleted = task.status === 'Completed';
        return `
        <div id="task-row-${task.id}" class="p-4 rounded-2xl border transition-all ${isCompleted ? 'bg-slate-50/60 border-slate-200 opacity-70' : 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300'}">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <button id="toggle-task-${task.id}-btn" data-toggle-task="${task.id}" class="mt-0.5 p-1 rounded-lg border transition ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-500 text-transparent hover:text-emerald-500'}">${icon('CheckCircle2', 'w-4 h-4')}</button>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-sm font-bold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}">${task.title}</h3>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${task.priority === 'High' ? 'bg-rose-100 text-rose-700' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}">${task.priority} Priority</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">${formatMinutes(task.estimatedMinutes)}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${task.classification === 'Academic' ? 'bg-blue-50 text-blue-700' : task.classification === 'Personal' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'}">${task.classification}</span>
                </div>
                <div class="flex items-center gap-3 flex-wrap mt-2 text-xs text-slate-500">
                  ${sub ? `<span class="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">${icon('BookOpen', 'w-3 h-3')}${sub.code}</span>` : ''}
                  ${goal ? `<span class="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">${icon('Target', 'w-3 h-3')}${goal.title}</span>` : ''}
                  ${task.scheduledTime ? `<span class="inline-flex items-center gap-1 text-slate-600">${icon('Clock', 'w-3 h-3 text-slate-400')}Scheduled: ${formatTimeString(task.scheduledTime, userPreferences.timeFormat)}</span>` : ''}
                  ${task.dueDate ? `<span class="inline-flex items-center gap-1 text-rose-600 font-semibold">${icon('Calendar', 'w-3 h-3')}Due: ${formatShortDate(task.dueDate)}</span>` : ''}
                </div>
                ${isExpanded && task.description ? `<div class="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">${task.description}</div>` : ''}
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              ${task.description ? `<button data-toggle-expand="${task.id}" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition" title="${isExpanded ? 'Collapse notes' : 'Expand notes'}">${isExpanded ? icon('ChevronUp', 'w-4 h-4') : icon('ChevronDown', 'w-4 h-4')}</button>` : ''}
              <button data-edit-task="${task.id}" class="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition" title="Edit task">${icon('Pencil', 'w-4 h-4')}</button>
              <button data-delete-task="${task.id}" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition" title="Delete task">${icon('Trash2', 'w-4 h-4')}</button>
            </div>
          </div>
        </div>`;
      }).join('')}
      ${filteredTasks.length === 0 ? `
      <div class="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
        ${icon('Zap', 'w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1')}
        <p class="text-sm font-semibold text-slate-700">No tasks matching current filters</p>
        <p class="text-xs text-slate-400 mt-1">Add a quick task using the input bar above or change your active filters.</p>
      </div>` : ''}
    </div>
  </div>`;

  wireEvents(root);
  refreshIcons();
}

function escapeAttr(s) { return (s || '').replace(/"/g, '&quot;'); }

function wireEvents(root) {
  root.querySelector('#tasks-open-full-modal-btn')?.addEventListener('click', () => store.setState({ isQuickAddOpen: true }));

  root.querySelector('#inline-task-title-input')?.addEventListener('input', (e) => {
    ui.quickTitle = e.target.value;
    root.querySelector('#inline-add-task-btn').disabled = !ui.quickTitle.trim();
  });
  root.querySelector('#inline-classification-select')?.addEventListener('change', (e) => (ui.quickClassification = e.target.value));
  root.querySelector('#inline-priority-select')?.addEventListener('change', (e) => (ui.quickPriority = e.target.value));
  root.querySelector('#inline-duration-select')?.addEventListener('change', (e) => (ui.quickDuration = Number(e.target.value)));
  root.querySelector('#inline-quick-add-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!ui.quickTitle.trim()) return;
    addTask({ title: ui.quickTitle.trim(), classification: ui.quickClassification, priority: ui.quickPriority, estimatedMinutes: ui.quickDuration, status: 'Pending', remindersEnabled: true, customReminderMinutes: 5 });
    ui.quickTitle = '';
    renderTasks(root);
  });

  root.querySelector('#search-tasks-input')?.addEventListener('input', (e) => {
    ui.searchQuery = e.target.value;
    rerenderPreservingFocus(root, () => renderTasks(root));
  });
  root.querySelectorAll('[data-status-filter]').forEach((b) => b.addEventListener('click', () => { ui.statusFilter = b.getAttribute('data-status-filter'); renderTasks(root); }));
  root.querySelector('#classification-filter-select')?.addEventListener('change', (e) => { ui.classificationFilter = e.target.value; renderTasks(root); });
  root.querySelector('#priority-filter-select')?.addEventListener('change', (e) => { ui.priorityFilter = e.target.value; renderTasks(root); });
  root.querySelector('#sort-by-select')?.addEventListener('change', (e) => { ui.sortBy = e.target.value; renderTasks(root); });

  root.querySelectorAll('[data-toggle-task]').forEach((b) => b.addEventListener('click', () => toggleTaskStatus(b.getAttribute('data-toggle-task'))));
  root.querySelectorAll('[data-edit-task]').forEach((b) => b.addEventListener('click', () => {
    const task = store.state.tasks.find((t) => t.id === b.getAttribute('data-edit-task'));
    if (task) openEditTaskModal(task);
  }));
  root.querySelectorAll('[data-delete-task]').forEach((b) => b.addEventListener('click', () => deleteTask(b.getAttribute('data-delete-task'))));
  root.querySelectorAll('[data-toggle-expand]').forEach((b) => b.addEventListener('click', () => {
    const id = b.getAttribute('data-toggle-expand');
    ui.expandedTaskId = ui.expandedTaskId === id ? null : id;
    renderTasks(root);
  }));
}
