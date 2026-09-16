import { icon, refreshIcons } from '../icons.js';
import { store, addGoal, updateGoal, deleteGoal, toggleMilestone, addMilestone, toggleAtRisk } from '../store.js';
import { formatShortDate } from '../time.js';

let initialized = false;
const ui = {
  showAddGoalModal: false,
  expandedGoalId: null,
  editingGoalId: null,
  newMilestoneText: {},
  form: { title: '', description: '', type: 'Career', targetDate: '', priority: 'High', initialMilestones: ['', ''] },
};

export function renderGoals(root) {
  const { goals, tasks } = store.state;
  if (!initialized) { ui.expandedGoalId = goals[0]?.id || null; initialized = true; }

  root.innerHTML = `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">${icon('Target', 'w-5 h-5 text-amber-500')}Long-Term Goals &amp; Milestone Breakdown</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Break macro semester objectives down into actionable milestones and linked daily tasks.</p>
      </div>
      <button id="open-add-goal-modal-btn" class="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition self-start sm:self-auto">${icon('Plus', 'w-4 h-4')}<span>New Goal</span></button>
    </div>

    <div class="space-y-4">
      ${goals.map((goal) => {
        const isExpanded = ui.expandedGoalId === goal.id;
        const completedMilestones = goal.milestones.filter((m) => m.completed).length;
        const totalMilestones = goal.milestones.length;
        const linkedTasks = tasks.filter((t) => t.linkedGoalId === goal.id);
        return `
        <div id="goal-card-${goal.id}" class="bg-white rounded-3xl border transition shadow-xs ${goal.atRisk ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'}">
          <div class="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">${goal.type}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${goal.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}">${goal.priority} Priority</span>
                ${goal.atRisk ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500 text-white animate-pulse">${icon('AlertTriangle', 'w-3 h-3')}At Risk</span>` : ''}
              </div>
              <h3 class="text-lg font-bold text-slate-900 mt-2">${goal.title}</h3>
              ${goal.description ? `<p class="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">${goal.description}</p>` : ''}
              <div class="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
                <span class="flex items-center gap-1 font-semibold text-slate-700">${icon('Calendar', 'w-3.5 h-3.5 text-slate-400')}Target: ${formatShortDate(goal.targetDate)}</span>
                <span>Milestones: ${completedMilestones}/${totalMilestones} done</span>
                <span>${linkedTasks.length} linked active tasks</span>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:w-80 shrink-0">
              <div class="w-full sm:flex-1">
                <div class="flex justify-between text-xs font-bold mb-1"><span class="text-slate-600">Progress</span><span class="text-amber-600 font-mono">${goal.progressPercent}%</span></div>
                <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden"><div class="bg-amber-500 h-full rounded-full transition-all duration-300" style="width:${goal.progressPercent}%"></div></div>
              </div>
              <div class="flex items-center gap-1 self-end sm:self-center">
                <button data-toggle-risk="${goal.id}" title="Flag as At Risk" class="p-2 rounded-xl border text-xs font-semibold transition ${goal.atRisk ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'}">${icon('Flag', 'w-4 h-4')}</button>
                <button data-toggle-expand-goal="${goal.id}" title="${isExpanded ? 'Collapse Milestones' : 'Expand Milestones'}" class="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">${isExpanded ? icon('ChevronUp', 'w-4 h-4') : icon('ChevronDown', 'w-4 h-4')}</button>
                <button data-edit-goal="${goal.id}" title="Edit Goal" class="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition">${icon('Pencil', 'w-4 h-4')}</button>
                <button data-delete-goal="${goal.id}" title="Delete Goal" class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition">${icon('Trash2', 'w-4 h-4')}</button>
              </div>
            </div>
          </div>

          ${isExpanded ? `
          <div class="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6 rounded-b-3xl space-y-5 animate-fade-in">
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Sequential Milestones (Calculates Progress Automatically)</h4>
              <div class="space-y-2">
                ${goal.milestones.map((ms) => `
                <div data-toggle-milestone="${goal.id}:${ms.id}" class="p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${ms.completed ? 'bg-white/60 border-slate-200 text-slate-500' : 'bg-white border-slate-300/80 shadow-xs hover:border-amber-400'}">
                  <div class="flex items-center gap-3">${ms.completed ? icon('CheckCircle2', 'w-5 h-5 text-emerald-600 shrink-0') : icon('Circle', 'w-5 h-5 text-slate-300 hover:text-amber-500 shrink-0')}<span class="text-xs sm:text-sm font-semibold ${ms.completed ? 'line-through text-slate-400' : 'text-slate-800'}">${ms.title}</span></div>
                  ${ms.completed ? '<span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Done</span>' : ''}
                </div>`).join('')}
              </div>
              <div class="mt-3 flex gap-2">
                <input id="new-milestone-input-${goal.id}" type="text" value="${(ui.newMilestoneText[goal.id] || '').replace(/"/g, '&quot;')}" placeholder="Add next concrete milestone..." class="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                <button data-add-milestone="${goal.id}" type="button" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition">Add Milestone</button>
              </div>
            </div>
            ${linkedTasks.length > 0 ? `
            <div class="pt-4 border-t border-slate-200/80">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Connected Daily Tasks (${linkedTasks.length})</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${linkedTasks.map((t) => `<div class="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between"><span class="font-semibold text-slate-800 truncate">${t.title}</span><span class="text-[10px] text-slate-500 font-mono">${t.estimatedMinutes}m</span></div>`).join('')}
              </div>
            </div>` : ''}
          </div>` : ''}
        </div>`;
      }).join('')}

      ${goals.length === 0 ? `<div class="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">${icon('Target', 'w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1')}<p class="text-sm font-semibold text-slate-700">No active goals registered</p><p class="text-xs text-slate-400 mt-1">Create a goal to establish purpose and connect daily study sessions with macro achievements.</p></div>` : ''}
    </div>

    ${ui.showAddGoalModal ? renderAddGoalModal() : ''}
  </div>`;

  wireEvents(root);
  refreshIcons();
}

function renderAddGoalModal() {
  const f = ui.form;
  const isEdit = !!ui.editingGoalId;
  return `
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
    <div class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 overflow-y-auto max-h-[90vh]">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 class="text-base font-bold text-slate-900">${isEdit ? 'Edit Goal' : 'Define New Goal'}</h3>
        <button id="close-add-goal-modal-btn" class="text-slate-400 hover:text-slate-600">${icon('X', 'w-5 h-5')}</button>
      </div>
      <form id="create-goal-form" class="space-y-4 text-xs sm:text-sm">
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Goal Title *</label><input id="goal-title-input" type="text" required placeholder="e.g. Master Python & Algorithms for Internship" value="${f.title}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
        <div class="grid grid-cols-2 gap-2">
          <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
            <select id="goal-type-select" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
              ${['Academic', 'Career', 'Skill', 'Personal', 'Health'].map((t) => `<option value="${t}" ${f.type === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Priority</label>
            <select id="goal-priority-select" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
              ${['High', 'Medium', 'Low'].map((p) => `<option value="${p}" ${f.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
          </div>
        </div>
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Completion Date *</label><input id="goal-target-date-input" type="date" required value="${f.targetDate}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Description / Purpose</label><textarea id="goal-description-input" rows="2" placeholder="Why this goal matters and what success looks like..." class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">${f.description}</textarea></div>
        ${!isEdit ? `
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Key Milestones (At least 1 recommended)</label>
          <div class="space-y-2" id="milestones-list">
            ${f.initialMilestones.map((ms, idx) => `<input data-milestone-idx="${idx}" type="text" placeholder="Milestone ${idx + 1}..." value="${ms.replace(/"/g, '&quot;')}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" />`).join('')}
            <button type="button" id="add-milestone-field-btn" class="text-xs font-bold text-amber-600 hover:text-amber-700">+ Add Another Milestone</button>
          </div>
        </div>` : `<p class="text-[11px] text-slate-400 italic">Milestones can be added or checked off directly on the goal card.</p>`}
        <div class="pt-4 flex justify-end gap-2 border-t border-slate-100">
          <button type="button" id="cancel-add-goal-btn" class="px-4 py-2 text-slate-600 font-semibold">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-amber-500 text-white font-bold rounded-xl shadow-xs">${isEdit ? 'Save Changes' : 'Save Goal'}</button>
        </div>
      </form>
    </div>
  </div>`;
}

function wireEvents(root) {
  root.querySelector('#open-add-goal-modal-btn')?.addEventListener('click', () => {
    ui.editingGoalId = null;
    ui.form = { title: '', description: '', type: 'Career', targetDate: '', priority: 'High', initialMilestones: ['', ''] };
    ui.showAddGoalModal = true; renderGoals(root);
  });
  root.querySelectorAll('[data-edit-goal]').forEach((b) => b.addEventListener('click', () => {
    const goal = store.state.goals.find((g) => g.id === b.getAttribute('data-edit-goal'));
    if (!goal) return;
    ui.editingGoalId = goal.id;
    ui.form = { title: goal.title, description: goal.description || '', type: goal.type, targetDate: goal.targetDate, priority: goal.priority, initialMilestones: ['', ''] };
    ui.showAddGoalModal = true; renderGoals(root);
  }));
  root.querySelector('#close-add-goal-modal-btn')?.addEventListener('click', () => { ui.showAddGoalModal = false; ui.editingGoalId = null; renderGoals(root); });
  root.querySelector('#cancel-add-goal-btn')?.addEventListener('click', () => { ui.showAddGoalModal = false; ui.editingGoalId = null; renderGoals(root); });

  root.querySelectorAll('[data-toggle-risk]').forEach((b) => b.addEventListener('click', () => toggleAtRisk(b.getAttribute('data-toggle-risk'))));
  root.querySelectorAll('[data-toggle-expand-goal]').forEach((b) => b.addEventListener('click', () => {
    const id = b.getAttribute('data-toggle-expand-goal');
    ui.expandedGoalId = ui.expandedGoalId === id ? null : id;
    renderGoals(root);
  }));
  root.querySelectorAll('[data-delete-goal]').forEach((b) => b.addEventListener('click', () => deleteGoal(b.getAttribute('data-delete-goal'))));
  root.querySelectorAll('[data-toggle-milestone]').forEach((el) => el.addEventListener('click', () => {
    const [goalId, msId] = el.getAttribute('data-toggle-milestone').split(':');
    toggleMilestone(goalId, msId);
  }));

  root.querySelectorAll('[id^="new-milestone-input-"]').forEach((inp) => {
    const goalId = inp.id.replace('new-milestone-input-', '');
    inp.addEventListener('input', (e) => (ui.newMilestoneText[goalId] = e.target.value));
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); submitMilestone(root, goalId); }
    });
  });
  root.querySelectorAll('[data-add-milestone]').forEach((b) => b.addEventListener('click', () => submitMilestone(root, b.getAttribute('data-add-milestone'))));

  // Add-goal form
  root.querySelector('#goal-title-input')?.addEventListener('input', (e) => (ui.form.title = e.target.value));
  root.querySelector('#goal-type-select')?.addEventListener('change', (e) => (ui.form.type = e.target.value));
  root.querySelector('#goal-priority-select')?.addEventListener('change', (e) => (ui.form.priority = e.target.value));
  root.querySelector('#goal-target-date-input')?.addEventListener('input', (e) => (ui.form.targetDate = e.target.value));
  root.querySelector('#goal-description-input')?.addEventListener('input', (e) => (ui.form.description = e.target.value));
  root.querySelectorAll('[data-milestone-idx]').forEach((inp) => {
    const idx = Number(inp.getAttribute('data-milestone-idx'));
    inp.addEventListener('input', (e) => (ui.form.initialMilestones[idx] = e.target.value));
  });
  root.querySelector('#add-milestone-field-btn')?.addEventListener('click', () => {
    ui.form.initialMilestones = [...ui.form.initialMilestones, ''];
    renderGoals(root);
  });

  root.querySelector('#create-goal-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = ui.form;
    if (!f.title.trim() || !f.targetDate) return;
    if (ui.editingGoalId) {
      updateGoal(ui.editingGoalId, { title: f.title.trim(), description: f.description.trim() || undefined, type: f.type, targetDate: f.targetDate, priority: f.priority });
    } else {
      const validMilestones = f.initialMilestones.filter((m) => m.trim().length > 0).map((m, idx) => ({ id: `ms-${Date.now()}-${idx}`, title: m.trim(), completed: false }));
      addGoal({ title: f.title.trim(), description: f.description.trim() || undefined, type: f.type, targetDate: f.targetDate, priority: f.priority, status: 'In Progress', milestones: validMilestones, atRisk: false });
    }
    ui.form = { title: '', description: '', type: 'Career', targetDate: '', priority: 'High', initialMilestones: ['', ''] };
    ui.editingGoalId = null;
    ui.showAddGoalModal = false;
    renderGoals(root);
  });
}

function submitMilestone(root, goalId) {
  const text = ui.newMilestoneText[goalId];
  if (!text || !text.trim()) return;
  addMilestone(goalId, text.trim());
  ui.newMilestoneText[goalId] = '';
  renderGoals(root);
}
