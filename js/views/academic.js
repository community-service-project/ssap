import { icon, refreshIcons } from '../icons.js';
import { store, addSubject, deleteSubject, addTimetableEntry, deleteTimetableEntry, addAcademicWork, deleteAcademicWork, toggleAcademicWorkStatus } from '../store.js';
import { DAYS_OF_WEEK, formatMinutes, formatShortDate, formatTimeString } from '../time.js';

const ui = {
  activeTab: 'works',
  showSubjectModal: false, showTimetableModal: false, showWorkModal: false,
  subj: { code: '', name: '', color: '#3B82F6', instructor: '', room: '' },
  tt: { subjectId: '', dayOfWeek: 1, startTime: '09:00', endTime: '10:15', type: 'Lecture', room: '' },
  work: { title: '', subjectId: '', type: 'Assignment', dueDate: '', dueTime: '23:59', estimatedMinutes: 60, priority: 'High', goalId: '' },
};

export function renderAcademic(root) {
  const { subjects, timetable, academicWorks, goals, preferences: userPreferences } = store.state;

  root.innerHTML = `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">${icon('BookOpen', 'w-5 h-5 text-blue-600')}Academic Works &amp; Timetable</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Manage your semester subjects, weekly lecture schedules, exams, and assignments.</p>
      </div>
      <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto text-xs font-bold">
        <button data-tab="works" id="academic-tab-works-btn" class="px-3.5 py-1.5 rounded-xl transition ${ui.activeTab === 'works' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">Assignments &amp; Exams (${academicWorks.length})</button>
        <button data-tab="timetable" id="academic-tab-timetable-btn" class="px-3.5 py-1.5 rounded-xl transition ${ui.activeTab === 'timetable' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">Weekly Classes (${timetable.length})</button>
        <button data-tab="subjects" id="academic-tab-subjects-btn" class="px-3.5 py-1.5 rounded-xl transition ${ui.activeTab === 'subjects' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">Subjects (${subjects.length})</button>
      </div>
    </div>

    ${ui.activeTab === 'works' ? renderWorksTab(academicWorks, subjects, goals, userPreferences) : ''}
    ${ui.activeTab === 'timetable' ? renderTimetableTab(timetable, subjects, userPreferences) : ''}
    ${ui.activeTab === 'subjects' ? renderSubjectsTab(subjects, timetable, academicWorks) : ''}
    ${ui.showSubjectModal ? renderSubjectModal() : ''}
    ${ui.showTimetableModal ? renderTimetableModal(subjects) : ''}
    ${ui.showWorkModal ? renderWorkModal(subjects, goals) : ''}
  </div>`;

  wireEvents(root);
  refreshIcons();
}

function renderWorksTab(academicWorks, subjects, goals, userPreferences) {
  return `
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-bold text-slate-900">Assignments, Exams &amp; Projects</h2>
      <button id="add-academic-work-btn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition">${icon('Plus', 'w-4 h-4')}<span>Add Academic Work</span></button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      ${academicWorks.map((work) => {
        const sub = subjects.find((s) => s.id === work.subjectId);
        const goal = goals.find((g) => g.id === work.linkedGoalId);
        const isCompleted = work.status === 'Completed';
        return `
        <div class="p-4 rounded-2xl border transition ${isCompleted ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-slate-200/90 shadow-xs'}">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <button data-toggle-work="${work.id}" class="mt-0.5 p-1 rounded-lg border transition ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-500 text-transparent hover:text-emerald-500'}">${icon('CheckCircle2', 'w-4 h-4')}</button>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-sm font-bold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}">${work.title}</h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800">${work.type}</span>
                  <span class="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${work.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}">${work.priority}</span>
                </div>
                <div class="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                  ${sub ? `<span class="font-semibold text-blue-700">${sub.code}: ${sub.name}</span>` : ''}
                  <span class="text-rose-600 font-semibold">Due: ${formatShortDate(work.dueDate)} ${work.dueTime ? formatTimeString(work.dueTime, userPreferences.timeFormat) : ''}</span>
                  <span>Est: ${formatMinutes(work.estimatedMinutes)}</span>
                  ${goal ? `<span class="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">${icon('Target', 'w-3 h-3')}${goal.title}</span>` : ''}
                </div>
              </div>
            </div>
            <button data-delete-work="${work.id}" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition">${icon('Trash2', 'w-4 h-4')}</button>
          </div>
        </div>`;
      }).join('')}
      ${academicWorks.length === 0 ? `<div class="col-span-2 py-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">${icon('BookOpen', 'w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1')}<p class="text-sm font-semibold text-slate-700">No academic works logged</p><p class="text-xs text-slate-400 mt-1">Add upcoming homework, lab reports, or exams.</p></div>` : ''}
    </div>
  </div>`;
}

function renderTimetableTab(timetable, subjects, userPreferences) {
  const order = [1, 2, 3, 4, 5, 6, 0];
  return `
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-bold text-slate-900">Weekly Lecture &amp; Lab Schedule</h2>
      <button id="add-timetable-entry-btn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition">${icon('Plus', 'w-4 h-4')}<span>Add Class Entry</span></button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
      ${order.map((dayNum) => {
        const dayClasses = timetable.filter((t) => t.dayOfWeek === dayNum).sort((a, b) => a.startTime.localeCompare(b.startTime));
        return `
        <div class="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col min-h-[220px]">
          <div class="pb-2 border-b border-slate-100 mb-2"><span class="text-xs font-bold uppercase text-slate-500">${DAYS_OF_WEEK[dayNum]}</span><span class="text-[10px] text-slate-400 block">${dayClasses.length} sessions</span></div>
          <div class="space-y-2 flex-1">
            ${dayClasses.map((item) => {
              const sub = subjects.find((s) => s.id === item.subjectId);
              return `
              <div class="p-2 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs relative group">
                <div class="flex items-start justify-between"><span class="font-bold text-blue-900">${sub?.code || 'Class'}</span><button data-delete-timetable="${item.id}" class="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition">${icon('X', 'w-3 h-3')}</button></div>
                <p class="text-[11px] text-slate-600 font-mono mt-0.5">${formatTimeString(item.startTime, userPreferences.timeFormat)} \u2013 ${formatTimeString(item.endTime, userPreferences.timeFormat)}</p>
                <div class="flex items-center gap-1 text-[10px] text-slate-500 mt-1"><span class="px-1 bg-white rounded border border-blue-200">${item.type}</span>${item.room ? `<span>${item.room}</span>` : ''}</div>
              </div>`;
            }).join('') || '<div class="h-full flex items-center justify-center text-[11px] text-slate-400 italic">Free day</div>'}
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function renderSubjectsTab(subjects, timetable, academicWorks) {
  return `
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-bold text-slate-900">Enrolled Semester Subjects</h2>
      <button id="add-subject-btn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition">${icon('Plus', 'w-4 h-4')}<span>New Subject</span></button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${subjects.map((sub) => `
      <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between">
            <span class="px-2.5 py-1 rounded-lg text-xs font-black text-white" style="background-color:${sub.color}">${sub.code}</span>
            <button data-delete-subject="${sub.id}" class="text-slate-400 hover:text-rose-600 p-1">${icon('Trash2', 'w-4 h-4')}</button>
          </div>
          <h3 class="text-base font-bold text-slate-900 mt-3">${sub.name}</h3>
          <div class="mt-3 space-y-1.5 text-xs text-slate-600">
            ${sub.instructor ? `<div class="flex items-center gap-1.5">${icon('User', 'w-3.5 h-3.5 text-slate-400')}<span>${sub.instructor}</span></div>` : ''}
            ${sub.room ? `<div class="flex items-center gap-1.5">${icon('MapPin', 'w-3.5 h-3.5 text-slate-400')}<span>Room: ${sub.room}</span></div>` : ''}
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Classes: ${timetable.filter((t) => t.subjectId === sub.id).length} per week</span>
          <span>Works: ${academicWorks.filter((w) => w.subjectId === sub.id).length}</span>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

function modalShell(title, closeAttr, bodyHtml) {
  return `
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 class="text-base font-bold text-slate-900">${title}</h3>
        <button data-close-modal="${closeAttr}" class="text-slate-400 hover:text-slate-600">${icon('X', 'w-5 h-5')}</button>
      </div>
      ${bodyHtml}
    </div>
  </div>`;
}

function renderSubjectModal() {
  const s = ui.subj;
  return modalShell('Add Academic Subject', 'subject', `
    <form id="create-subject-form" class="space-y-3 text-xs sm:text-sm">
      <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Subject Code *</label><input id="subj-code-input" type="text" required placeholder="e.g. CS301" value="${s.code}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
      <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Subject Name *</label><input id="subj-name-input" type="text" required placeholder="e.g. Database Management Systems" value="${s.name}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
      <div class="grid grid-cols-2 gap-2">
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Instructor</label><input id="subj-instructor-input" type="text" placeholder="Prof. Smith" value="${s.instructor}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Default Room</label><input id="subj-room-input" type="text" placeholder="Hall 4B" value="${s.room}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
      </div>
      <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Badge Color</label><input id="subj-color-input" type="color" value="${s.color}" class="w-full h-10 p-1 bg-white border border-slate-300 rounded-xl cursor-pointer" /></div>
      <div class="pt-3 flex justify-end gap-2">
        <button type="button" data-close-modal="subject" class="px-4 py-2 text-slate-600 font-semibold">Cancel</button>
        <button type="submit" class="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-xs">Save Subject</button>
      </div>
    </form>`);
}

function renderTimetableModal(subjects) {
  const t = ui.tt;
  return modalShell('Add Class Session', 'timetable', `
    <form id="create-timetable-form" class="space-y-3 text-xs sm:text-sm">
      <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Subject *</label>
        <select id="tt-subject-select" required class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
          ${subjects.map((s) => `<option value="${s.id}" ${t.subjectId === s.id ? 'selected' : ''}>${s.code}: ${s.name}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Day of Week</label>
          <select id="tt-day-select" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
            ${[1, 2, 3, 4, 5, 6, 0].map((d) => `<option value="${d}" ${t.dayOfWeek === d ? 'selected' : ''}>${DAYS_OF_WEEK[d]}</option>`).join('')}
          </select>
        </div>
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Session Type</label>
          <select id="tt-type-select" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
            ${['Lecture', 'Lab', 'Tutorial', 'Seminar'].map((v) => `<option value="${v}" ${t.type === v ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Start Time</label><input id="tt-start-input" type="time" value="${t.startTime}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">End Time</label><input id="tt-end-input" type="time" value="${t.endTime}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
      </div>
      <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Room / Location</label><input id="tt-room-input" type="text" placeholder="e.g. Science Hall 302" value="${t.room}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
      <div class="pt-3 flex justify-end gap-2">
        <button type="button" data-close-modal="timetable" class="px-4 py-2 text-slate-600 font-semibold">Cancel</button>
        <button type="submit" class="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-xs">Add Class</button>
      </div>
    </form>`);
}

function renderWorkModal(subjects, goals) {
  const w = ui.work;
  return modalShell('Add Assignment or Exam', 'work', `
    <form id="create-work-form" class="space-y-3 text-xs sm:text-sm">
      <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Title *</label><input id="work-title-input" type="text" required placeholder="e.g., Midterm Exam Prep" value="${w.title}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
      <div class="grid grid-cols-2 gap-2">
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Subject *</label>
          <select id="work-subject-select" required class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
            ${subjects.map((s) => `<option value="${s.id}" ${w.subjectId === s.id ? 'selected' : ''}>${s.code}: ${s.name}</option>`).join('')}
          </select>
        </div>
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Type</label>
          <select id="work-type-select" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
            ${[['Assignment', 'Assignment'], ['Exam', 'Exam'], ['Project', 'Project'], ['Study', 'Study Session'], ['Reading', 'Reading']].map(([v, label]) => `<option value="${v}" ${w.type === v ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Due Date *</label><input id="work-due-date-input" type="date" required value="${w.dueDate}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Due Time</label><input id="work-due-time-input" type="time" value="${w.dueTime}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Est Duration (m)</label><input id="work-duration-input" type="number" min="15" step="15" value="${w.estimatedMinutes}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
        <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Priority</label>
          <select id="work-priority-select" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
            ${['High', 'Medium', 'Low'].map((v) => `<option value="${v}" ${w.priority === v ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
      </div>
      <div><label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Link to Goal (Optional)</label>
        <select id="work-goal-select" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
          <option value="">None</option>
          ${goals.map((g) => `<option value="${g.id}" ${w.goalId === g.id ? 'selected' : ''}>${g.title}</option>`).join('')}
        </select>
      </div>
      <div class="pt-3 flex justify-end gap-2">
        <button type="button" data-close-modal="work" class="px-4 py-2 text-slate-600 font-semibold">Cancel</button>
        <button type="submit" class="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-xs">Save Work</button>
      </div>
    </form>`);
}

function wireEvents(root) {
  root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { ui.activeTab = b.getAttribute('data-tab'); renderAcademic(root); }));

  root.querySelector('#add-subject-btn')?.addEventListener('click', () => { ui.showSubjectModal = true; renderAcademic(root); });
  root.querySelector('#add-timetable-entry-btn')?.addEventListener('click', () => {
    if (store.state.subjects.length > 0 && !ui.tt.subjectId) ui.tt.subjectId = store.state.subjects[0].id;
    ui.showTimetableModal = true; renderAcademic(root);
  });
  root.querySelector('#add-academic-work-btn')?.addEventListener('click', () => {
    if (store.state.subjects.length > 0 && !ui.work.subjectId) ui.work.subjectId = store.state.subjects[0].id;
    ui.showWorkModal = true; renderAcademic(root);
  });
  root.querySelectorAll('[data-close-modal]').forEach((b) => b.addEventListener('click', () => {
    const which = b.getAttribute('data-close-modal');
    if (which === 'subject') ui.showSubjectModal = false;
    if (which === 'timetable') ui.showTimetableModal = false;
    if (which === 'work') ui.showWorkModal = false;
    renderAcademic(root);
  }));

  root.querySelectorAll('[data-toggle-work]').forEach((b) => b.addEventListener('click', () => toggleAcademicWorkStatus(b.getAttribute('data-toggle-work'))));
  root.querySelectorAll('[data-delete-work]').forEach((b) => b.addEventListener('click', () => deleteAcademicWork(b.getAttribute('data-delete-work'))));
  root.querySelectorAll('[data-delete-timetable]').forEach((b) => b.addEventListener('click', () => deleteTimetableEntry(b.getAttribute('data-delete-timetable'))));
  root.querySelectorAll('[data-delete-subject]').forEach((b) => b.addEventListener('click', () => deleteSubject(b.getAttribute('data-delete-subject'))));

  // Subject form
  root.querySelector('#subj-code-input')?.addEventListener('input', (e) => (ui.subj.code = e.target.value));
  root.querySelector('#subj-name-input')?.addEventListener('input', (e) => (ui.subj.name = e.target.value));
  root.querySelector('#subj-instructor-input')?.addEventListener('input', (e) => (ui.subj.instructor = e.target.value));
  root.querySelector('#subj-room-input')?.addEventListener('input', (e) => (ui.subj.room = e.target.value));
  root.querySelector('#subj-color-input')?.addEventListener('input', (e) => (ui.subj.color = e.target.value));
  root.querySelector('#create-subject-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!ui.subj.code.trim() || !ui.subj.name.trim()) return;
    addSubject({ code: ui.subj.code.trim().toUpperCase(), name: ui.subj.name.trim(), color: ui.subj.color, instructor: ui.subj.instructor.trim() || undefined, room: ui.subj.room.trim() || undefined });
    ui.subj = { code: '', name: '', color: '#3B82F6', instructor: '', room: '' };
    ui.showSubjectModal = false;
    renderAcademic(root);
  });

  // Timetable form
  root.querySelector('#tt-subject-select')?.addEventListener('change', (e) => (ui.tt.subjectId = e.target.value));
  root.querySelector('#tt-day-select')?.addEventListener('change', (e) => (ui.tt.dayOfWeek = Number(e.target.value)));
  root.querySelector('#tt-type-select')?.addEventListener('change', (e) => (ui.tt.type = e.target.value));
  root.querySelector('#tt-start-input')?.addEventListener('input', (e) => (ui.tt.startTime = e.target.value));
  root.querySelector('#tt-end-input')?.addEventListener('input', (e) => (ui.tt.endTime = e.target.value));
  root.querySelector('#tt-room-input')?.addEventListener('input', (e) => (ui.tt.room = e.target.value));
  root.querySelector('#create-timetable-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!ui.tt.subjectId) return;
    addTimetableEntry({ subjectId: ui.tt.subjectId, dayOfWeek: Number(ui.tt.dayOfWeek), startTime: ui.tt.startTime, endTime: ui.tt.endTime, type: ui.tt.type, room: ui.tt.room.trim() || undefined });
    ui.showTimetableModal = false;
    renderAcademic(root);
  });

  // Academic work form
  root.querySelector('#work-title-input')?.addEventListener('input', (e) => (ui.work.title = e.target.value));
  root.querySelector('#work-subject-select')?.addEventListener('change', (e) => (ui.work.subjectId = e.target.value));
  root.querySelector('#work-type-select')?.addEventListener('change', (e) => (ui.work.type = e.target.value));
  root.querySelector('#work-due-date-input')?.addEventListener('input', (e) => (ui.work.dueDate = e.target.value));
  root.querySelector('#work-due-time-input')?.addEventListener('input', (e) => (ui.work.dueTime = e.target.value));
  root.querySelector('#work-duration-input')?.addEventListener('input', (e) => (ui.work.estimatedMinutes = Number(e.target.value)));
  root.querySelector('#work-priority-select')?.addEventListener('change', (e) => (ui.work.priority = e.target.value));
  root.querySelector('#work-goal-select')?.addEventListener('change', (e) => (ui.work.goalId = e.target.value));
  root.querySelector('#create-work-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!ui.work.title.trim() || !ui.work.subjectId || !ui.work.dueDate) return;
    addAcademicWork({ subjectId: ui.work.subjectId, title: ui.work.title.trim(), type: ui.work.type, dueDate: ui.work.dueDate, dueTime: ui.work.dueTime || undefined, estimatedMinutes: ui.work.estimatedMinutes, priority: ui.work.priority, status: 'Pending', linkedGoalId: ui.work.goalId || undefined });
    ui.work.title = '';
    ui.showWorkModal = false;
    renderAcademic(root);
  });
}
