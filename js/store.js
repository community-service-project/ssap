import { supabase } from './supabaseClient.js';
import { sendSmartNotification } from './notifications.js';
import { DEFAULT_USER } from './initialData.js';

// ----------------------------------------------------------------------------
// Reactive-ish store: components call store.setState(patch) which merges the
// patch into state and notifies subscribers (main.js re-renders on change).
// ----------------------------------------------------------------------------
const listeners = [];

export const store = {
  state: {
    booting: true,
    session: null, // Supabase auth session
    isLoggedIn: false,
    currentView: 'landing',
    user: { ...DEFAULT_USER },
    preferences: { ...DEFAULT_USER.preferences },
    tasks: [],
    subjects: [],
    timetable: [],
    academicWorks: [],
    personalWorks: [],
    goals: [],
    freeTimeSlots: [],
    notifications: [],
    isQuickAddOpen: false,
    isNotificationsOpen: false,
    authModal: { isOpen: false, mode: 'login' },
  },
  subscribe(fn) {
    listeners.push(fn);
    return () => listeners.splice(listeners.indexOf(fn), 1);
  },
  setState(patch) {
    Object.assign(store.state, typeof patch === 'function' ? patch(store.state) : patch);
    listeners.forEach((fn) => fn(store.state));
  },
};

const uid = () => store.state.session?.user?.id;

// View Navigation Router (ported from App.tsx handleNavigate)
export function navigateTo(view) {
  const publicViews = ['landing', 'how_to_use', 'creators'];
  if (!store.state.isLoggedIn && !publicViews.includes(view)) {
    store.setState({ authModal: { isOpen: true, mode: 'login' } });
    return;
  }
  store.setState({ currentView: view });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function rowToPreferences(row) {
  return {
    timeFormat: row.time_format,
    timezone: row.timezone,
    weekStart: row.week_start,
    weekStartDay: row.week_start_day ?? undefined,
    priorityWeights: {
      academic: row.priority_academic,
      personal: row.priority_personal,
      goals: row.priority_goals,
    },
    defaultPriority: row.default_priority,
    notificationsEnabled: row.notifications_enabled,
    notify5MinBefore: row.notify_5min,
    notify1MinBefore: row.notify_1min,
    notifyAtStart: row.notify_at_start,
    notifyOverdue: row.notify_overdue,
    notifySleepWindDown: row.notify_sleep_winddown,
    soundEnabled: row.sound_enabled,
    theme: row.theme,
    themeMode: row.theme_mode ?? undefined,
  };
}

function preferencesToRow(p) {
  return {
    time_format: p.timeFormat,
    timezone: p.timezone,
    week_start: p.weekStart,
    week_start_day: p.weekStartDay ?? null,
    priority_academic: p.priorityWeights.academic,
    priority_personal: p.priorityWeights.personal,
    priority_goals: p.priorityWeights.goals,
    default_priority: p.defaultPriority,
    notifications_enabled: p.notificationsEnabled,
    notify_5min: p.notify5MinBefore,
    notify_1min: p.notify1MinBefore,
    notify_at_start: p.notifyAtStart,
    notify_overdue: p.notifyOverdue,
    notify_sleep_winddown: p.notifySleepWindDown,
    sound_enabled: p.soundEnabled,
    theme: p.theme,
    theme_mode: p.themeMode ?? null,
  };
}

// ----------------------------------------------------------------------------
// Mapping helpers: DB (snake_case) rows <-> app (camelCase) objects
// ----------------------------------------------------------------------------
const taskFromRow = (r) => ({
  id: r.id, title: r.title, description: r.description || undefined,
  classification: r.classification, priority: r.priority, estimatedMinutes: r.estimated_minutes,
  status: r.status, scheduledDate: r.scheduled_date || undefined, scheduledTime: r.scheduled_time || undefined,
  dueDate: r.due_date || undefined, dueTime: r.due_time || undefined, linkedGoalId: r.linked_goal_id || undefined,
  linkedSubjectId: r.linked_subject_id || undefined, remindersEnabled: r.reminders_enabled,
  customReminderMinutes: r.custom_reminder_minutes || undefined, recurring: r.recurring || 'none',
  createdAt: r.created_at, completedAt: r.completed_at || undefined,
});
const taskToRow = (t) => ({
  id: t.id, user_id: uid(), title: t.title, description: t.description || null, classification: t.classification,
  priority: t.priority, estimated_minutes: t.estimatedMinutes, status: t.status,
  scheduled_date: t.scheduledDate || null, scheduled_time: t.scheduledTime || null, due_date: t.dueDate || null,
  due_time: t.dueTime || null, linked_goal_id: t.linkedGoalId || null, linked_subject_id: t.linkedSubjectId || null,
  reminders_enabled: t.remindersEnabled, custom_reminder_minutes: t.customReminderMinutes || null,
  recurring: t.recurring || 'none', created_at: t.createdAt, completed_at: t.completedAt || null,
});

const subjectFromRow = (r) => ({ id: r.id, code: r.code, name: r.name, color: r.color, instructor: r.instructor || undefined, room: r.room || undefined });
const subjectToRow = (s) => ({ id: s.id, user_id: uid(), code: s.code, name: s.name, color: s.color, instructor: s.instructor || null, room: s.room || null });

const timetableFromRow = (r) => ({ id: r.id, subjectId: r.subject_id, dayOfWeek: r.day_of_week, startTime: r.start_time, endTime: r.end_time, room: r.room || undefined, type: r.type || undefined });
const timetableToRow = (t) => ({ id: t.id, user_id: uid(), subject_id: t.subjectId, day_of_week: t.dayOfWeek, start_time: t.startTime, end_time: t.endTime, room: t.room || null, type: t.type || null });

const academicWorkFromRow = (r) => ({ id: r.id, subjectId: r.subject_id, title: r.title, type: r.type, priority: r.priority, estimatedMinutes: r.estimated_minutes, dueDate: r.due_date, dueTime: r.due_time || undefined, status: r.status, linkedGoalId: r.linked_goal_id || undefined, notes: r.notes || undefined, createdAt: r.created_at });
const academicWorkToRow = (w) => ({ id: w.id, user_id: uid(), subject_id: w.subjectId, title: w.title, type: w.type, priority: w.priority, estimated_minutes: w.estimatedMinutes, due_date: w.dueDate, due_time: w.dueTime || null, status: w.status, linked_goal_id: w.linkedGoalId || null, notes: w.notes || null, created_at: w.createdAt });

const personalWorkFromRow = (r) => ({ id: r.id, title: r.title, category: r.category, priority: r.priority, estimatedMinutes: r.estimated_minutes, scheduledDate: r.scheduled_date || undefined, startTime: r.start_time || undefined, endTime: r.end_time || undefined, isRecurring: r.is_recurring, recurringDays: r.recurring_days || undefined, notes: r.notes || undefined, windDownMinutes: r.wind_down_minutes || undefined, status: r.status, createdAt: r.created_at });
const personalWorkToRow = (p) => ({ id: p.id, user_id: uid(), title: p.title, category: p.category, priority: p.priority, estimated_minutes: p.estimatedMinutes, scheduled_date: p.scheduledDate || null, start_time: p.startTime || null, end_time: p.endTime || null, is_recurring: p.isRecurring, recurring_days: p.recurringDays || [], notes: p.notes || null, wind_down_minutes: p.windDownMinutes || null, status: p.status, created_at: p.createdAt });

const goalFromRow = (r, milestoneRows) => ({ id: r.id, title: r.title, description: r.description || undefined, type: r.type, priority: r.priority, targetDate: r.target_date, status: r.status, progressPercent: r.progress_percent, atRisk: r.at_risk, milestones: milestoneRows.filter((m) => m.goal_id === r.id).map((m) => ({ id: m.id, title: m.title, targetDate: m.target_date || undefined, completed: m.completed, completedAt: m.completed_at || undefined })), createdAt: r.created_at });
const goalToRow = (g) => ({ id: g.id, user_id: uid(), title: g.title, description: g.description || null, type: g.type, priority: g.priority, target_date: g.targetDate, status: g.status, progress_percent: g.progressPercent, at_risk: !!g.atRisk, created_at: g.createdAt });
const milestoneToRow = (m, goalId) => ({ id: m.id, goal_id: goalId, user_id: uid(), title: m.title, target_date: m.targetDate || null, completed: m.completed, completed_at: m.completedAt || null });

const freeSlotFromRow = (r) => ({ id: r.id, title: r.title, date: r.date, startTime: r.start_time, endTime: r.end_time, notes: r.notes || undefined, isRecurring: r.is_recurring, recurringDays: r.recurring_days || undefined, color: r.color || undefined });
const freeSlotToRow = (s) => ({ id: s.id, user_id: uid(), title: s.title, date: s.date, start_time: s.startTime, end_time: s.endTime, notes: s.notes || null, is_recurring: !!s.isRecurring, recurring_days: s.recurringDays || [], color: s.color || null });

const notifFromRow = (r) => ({ id: r.id, title: r.title, message: r.message, type: r.type, timestamp: r.timestamp, read: r.read, relatedItemId: r.related_item_id || undefined, relatedItemType: r.related_item_type || undefined });
const notifToRow = (n) => ({ id: n.id, user_id: uid(), title: n.title, message: n.message, type: n.type, timestamp: n.timestamp, read: n.read, related_item_id: n.relatedItemId || null, related_item_type: n.relatedItemType || null });

async function upsert(table, row) {
  const { error } = await supabase.from(table).upsert(row);
  if (error) console.error(`[supabase] upsert ${table} failed:`, error.message);
}
async function remove(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) console.error(`[supabase] delete ${table} failed:`, error.message);
}

// ----------------------------------------------------------------------------
// Bootstrapping: load everything for the logged-in user from Supabase
// ----------------------------------------------------------------------------
export async function loadAllDataForUser() {
  const userId = uid();
  if (!userId) return;

  const [profileRes, tasksRes, subjectsRes, timetableRes, academicRes, personalRes, goalsRes, milestonesRes, freeSlotsRes, notifsRes] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('tasks').select('*').eq('user_id', userId),
      supabase.from('academic_subjects').select('*').eq('user_id', userId),
      supabase.from('timetable_entries').select('*').eq('user_id', userId),
      supabase.from('academic_works').select('*').eq('user_id', userId),
      supabase.from('personal_works').select('*').eq('user_id', userId),
      supabase.from('goals').select('*').eq('user_id', userId),
      supabase.from('goal_milestones').select('*').eq('user_id', userId),
      supabase.from('free_time_slots').select('*').eq('user_id', userId),
      supabase.from('notifications').select('*').eq('user_id', userId).order('timestamp', { ascending: false }),
    ]);

  const milestoneRows = milestonesRes.data || [];
  const profile = profileRes.data;
  const subjects = (subjectsRes.data || []).map(subjectFromRow);
  const goals = (goalsRes.data || []).map((r) => goalFromRow(r, milestoneRows));

  store.setState({
    user: profile
      ? { id: profile.id, name: profile.name, email: profile.email, avatarUrl: profile.avatar_url || undefined, createdAt: profile.created_at }
      : { ...DEFAULT_USER },
    preferences: profile ? rowToPreferences(profile) : { ...DEFAULT_USER.preferences },
    tasks: (tasksRes.data || []).map(taskFromRow),
    subjects,
    timetable: (timetableRes.data || []).map(timetableFromRow),
    academicWorks: (academicRes.data || []).map(academicWorkFromRow),
    personalWorks: (personalRes.data || []).map(personalWorkFromRow),
    goals,
    freeTimeSlots: (freeSlotsRes.data || []).map(freeSlotFromRow),
    notifications: (notifsRes.data || []).map(notifFromRow),
  });
}

// ----------------------------------------------------------------------------
// Tasks
// ----------------------------------------------------------------------------
export function addTask(newTask) {
  const task = { ...newTask, id: `task-${Date.now()}`, createdAt: new Date().toISOString() };
  store.setState({ tasks: [task, ...store.state.tasks] });
  upsert('tasks', taskToRow(task));
}
export function toggleTaskStatus(taskId) {
  const tasks = store.state.tasks.map((t) => {
    if (t.id !== taskId) return t;
    const nextStatus = t.status === 'Completed' ? 'Pending' : 'Completed';
    return { ...t, status: nextStatus, completedAt: nextStatus === 'Completed' ? new Date().toISOString() : undefined };
  });
  store.setState({ tasks });
  const updated = tasks.find((t) => t.id === taskId);
  upsert('tasks', taskToRow(updated));
}
export function updateTask(taskId, patch) {
  const tasks = store.state.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
  store.setState({ tasks });
  upsert('tasks', taskToRow(tasks.find((t) => t.id === taskId)));
}
export function deleteTask(taskId) {
  store.setState({ tasks: store.state.tasks.filter((t) => t.id !== taskId) });
  remove('tasks', taskId);
}
export function setTasksBulk(updatedTasks) {
  store.setState({ tasks: updatedTasks });
  updatedTasks.forEach((t) => upsert('tasks', taskToRow(t)));
}

// ----------------------------------------------------------------------------
// Academic
// ----------------------------------------------------------------------------
export function addSubject(subject) {
  const s = { ...subject, id: `subj-${Date.now()}` };
  store.setState({ subjects: [...store.state.subjects, s] });
  upsert('academic_subjects', subjectToRow(s));
}
export function updateSubject(subjectId, patch) {
  const subjects = store.state.subjects.map((s) => (s.id === subjectId ? { ...s, ...patch } : s));
  store.setState({ subjects });
  upsert('academic_subjects', subjectToRow(subjects.find((s) => s.id === subjectId)));
}
export function deleteSubject(subjectId) {
  store.setState({
    subjects: store.state.subjects.filter((s) => s.id !== subjectId),
    timetable: store.state.timetable.filter((t) => t.subjectId !== subjectId),
    academicWorks: store.state.academicWorks.filter((w) => w.subjectId !== subjectId),
  });
  remove('academic_subjects', subjectId); // cascades in DB
}
export function addTimetableEntry(entry) {
  const e = { ...entry, id: `tt-${Date.now()}` };
  store.setState({ timetable: [...store.state.timetable, e] });
  upsert('timetable_entries', timetableToRow(e));
}
export function updateTimetableEntry(entryId, patch) {
  const timetable = store.state.timetable.map((t) => (t.id === entryId ? { ...t, ...patch } : t));
  store.setState({ timetable });
  upsert('timetable_entries', timetableToRow(timetable.find((t) => t.id === entryId)));
}
export function deleteTimetableEntry(entryId) {
  store.setState({ timetable: store.state.timetable.filter((t) => t.id !== entryId) });
  remove('timetable_entries', entryId);
}
export function addAcademicWork(work) {
  const w = { ...work, id: `work-${Date.now()}` };
  store.setState({ academicWorks: [...store.state.academicWorks, w] });
  upsert('academic_works', academicWorkToRow(w));
}
export function updateAcademicWork(workId, patch) {
  const academicWorks = store.state.academicWorks.map((w) => (w.id === workId ? { ...w, ...patch } : w));
  store.setState({ academicWorks });
  upsert('academic_works', academicWorkToRow(academicWorks.find((w) => w.id === workId)));
}
export function deleteAcademicWork(workId) {
  store.setState({ academicWorks: store.state.academicWorks.filter((w) => w.id !== workId) });
  remove('academic_works', workId);
}
export function toggleAcademicWorkStatus(workId) {
  const academicWorks = store.state.academicWorks.map((w) =>
    w.id === workId ? { ...w, status: w.status === 'Completed' ? 'Pending' : 'Completed' } : w
  );
  store.setState({ academicWorks });
  upsert('academic_works', academicWorkToRow(academicWorks.find((w) => w.id === workId)));
}

// ----------------------------------------------------------------------------
// Personal works
// ----------------------------------------------------------------------------
export function addPersonalWork(work) {
  const w = { ...work, id: `personal-${Date.now()}` };
  store.setState({ personalWorks: [...store.state.personalWorks, w] });
  upsert('personal_works', personalWorkToRow(w));
}
export function updatePersonalWork(workId, patch) {
  const personalWorks = store.state.personalWorks.map((p) => (p.id === workId ? { ...p, ...patch } : p));
  store.setState({ personalWorks });
  upsert('personal_works', personalWorkToRow(personalWorks.find((p) => p.id === workId)));
}
export function deletePersonalWork(workId) {
  store.setState({ personalWorks: store.state.personalWorks.filter((w) => w.id !== workId) });
  remove('personal_works', workId);
}
export function updateSleepRoutine(patch) {
  const exists = store.state.personalWorks.some((p) => p.category === 'Sleep');
  let personalWorks;
  let saved;
  if (exists) {
    personalWorks = store.state.personalWorks.map((p) => (p.category === 'Sleep' ? { ...p, ...patch } : p));
    saved = personalWorks.find((p) => p.category === 'Sleep');
  } else {
    const newSleep = {
      id: `sleep-${Date.now()}`, category: 'Sleep', title: 'Night Sleep & Restoration',
      startTime: patch.startTime || '23:00', endTime: patch.endTime || '07:00', estimatedMinutes: 480,
      priority: 'High', isRecurring: true, windDownMinutes: patch.windDownMinutes || 30,
      status: 'Scheduled', createdAt: new Date().toISOString(),
    };
    personalWorks = [newSleep, ...store.state.personalWorks];
    saved = newSleep;
  }
  store.setState({ personalWorks });
  upsert('personal_works', personalWorkToRow(saved));
}

// ----------------------------------------------------------------------------
// Goals
// ----------------------------------------------------------------------------
export function addGoal(goal) {
  const totalMs = goal.milestones.length;
  const completedMs = goal.milestones.filter((m) => m.completed).length;
  const progressPercent = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0;
  const g = { ...goal, id: `goal-${Date.now()}`, progressPercent };
  store.setState({ goals: [...store.state.goals, g] });
  upsert('goals', goalToRow(g));
  if (g.milestones.length) {
    supabase.from('goal_milestones').upsert(g.milestones.map((m) => milestoneToRow(m, g.id)));
  }
}
export function updateGoal(goalId, patch) {
  const goals = store.state.goals.map((g) => {
    if (g.id !== goalId) return g;
    const updated = { ...g, ...patch };
    const total = updated.milestones.length;
    const completed = updated.milestones.filter((m) => m.completed).length;
    updated.progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return updated;
  });
  store.setState({ goals });
  upsert('goals', goalToRow(goals.find((g) => g.id === goalId)));
}
export function deleteGoal(goalId) {
  store.setState({ goals: store.state.goals.filter((g) => g.id !== goalId) });
  remove('goals', goalId); // cascades milestones
}
export function toggleMilestone(goalId, milestoneId) {
  let changedMilestone = null;
  const goals = store.state.goals.map((g) => {
    if (g.id !== goalId) return g;
    const updatedMilestones = g.milestones.map((m) => {
      if (m.id !== milestoneId) return m;
      changedMilestone = { ...m, completed: !m.completed };
      return changedMilestone;
    });
    const total = updatedMilestones.length;
    const completed = updatedMilestones.filter((m) => m.completed).length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { ...g, milestones: updatedMilestones, progressPercent, status: progressPercent === 100 ? 'Completed' : 'In Progress' };
  });
  store.setState({ goals });
  const g = goals.find((g) => g.id === goalId);
  upsert('goals', goalToRow(g));
  if (changedMilestone) upsert('goal_milestones', milestoneToRow(changedMilestone, goalId));
}
export function addMilestone(goalId, title) {
  let newMs;
  const goals = store.state.goals.map((g) => {
    if (g.id !== goalId) return g;
    newMs = { id: `ms-${Date.now()}`, title, completed: false };
    const updated = [...g.milestones, newMs];
    const completed = updated.filter((m) => m.completed).length;
    const progressPercent = Math.round((completed / updated.length) * 100);
    return { ...g, milestones: updated, progressPercent };
  });
  store.setState({ goals });
  const g = goals.find((g) => g.id === goalId);
  upsert('goals', goalToRow(g));
  if (newMs) upsert('goal_milestones', milestoneToRow(newMs, goalId));
}
export function toggleAtRisk(goalId) {
  const goals = store.state.goals.map((g) => (g.id === goalId ? { ...g, atRisk: !g.atRisk } : g));
  store.setState({ goals });
  upsert('goals', goalToRow(goals.find((g) => g.id === goalId)));
}

// ----------------------------------------------------------------------------
// Notifications
// ----------------------------------------------------------------------------
export function pushNotifications(newNotifs) {
  store.setState({ notifications: [...newNotifs, ...store.state.notifications] });
  newNotifs.forEach((n) => upsert('notifications', notifToRow(n)));
}
export function markAllNotificationsRead() {
  const notifications = store.state.notifications.map((n) => ({ ...n, read: true }));
  store.setState({ notifications });
  notifications.forEach((n) => upsert('notifications', notifToRow(n)));
}
export function clearAllNotifications() {
  const ids = store.state.notifications.map((n) => n.id);
  store.setState({ notifications: [] });
  if (ids.length) supabase.from('notifications').delete().in('id', ids).then(() => {});
}
export function triggerTestNotification() {
  const testRecord = {
    id: `test-notif-${Date.now()}`,
    title: '5-Min Reminder: CS301 Database Class',
    message: 'Lecture starts at 10:00 AM in Science Hall 302. Duration: 75m.',
    type: 'reminder_5m', timestamp: new Date().toISOString(), read: false,
  };
  store.setState({ notifications: [testRecord, ...store.state.notifications] });
  upsert('notifications', notifToRow(testRecord));
  sendSmartNotification(testRecord.title, { body: testRecord.message, sound: store.state.preferences.soundEnabled });
  return testRecord;
}

// ----------------------------------------------------------------------------
// Free time slots
// ----------------------------------------------------------------------------
export function addFreeTimeSlot(slot) {
  const s = { ...slot, id: `free-slot-${Date.now()}` };
  store.setState({ freeTimeSlots: [...store.state.freeTimeSlots, s] });
  upsert('free_time_slots', freeSlotToRow(s));
}
export function updateFreeTimeSlot(slotId, patch) {
  const freeTimeSlots = store.state.freeTimeSlots.map((s) => (s.id === slotId ? { ...s, ...patch } : s));
  store.setState({ freeTimeSlots });
  upsert('free_time_slots', freeSlotToRow(freeTimeSlots.find((s) => s.id === slotId)));
}
export function deleteFreeTimeSlot(slotId) {
  store.setState({ freeTimeSlots: store.state.freeTimeSlots.filter((s) => s.id !== slotId) });
  remove('free_time_slots', slotId);
}

// ----------------------------------------------------------------------------
// Preferences
// ----------------------------------------------------------------------------
export function updatePreferences(patch) {
  const preferences = { ...store.state.preferences, ...patch };
  store.setState({ preferences });
  const userId = uid();
  if (userId) upsert('profiles', { id: userId, email: store.state.user.email, name: store.state.user.name, ...preferencesToRow(preferences) });
}

// ----------------------------------------------------------------------------
// Export / Import / Reset
// ----------------------------------------------------------------------------
export function exportToJSON(data, filename) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const a = document.createElement('a');
  a.setAttribute('href', jsonString);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
}
export function exportToCSV(data, columns, filename) {
  const headers = columns.map((c) => c.header);
  const rows = data.map((item) => columns.map((c) => {
    const val = item[c.key];
    if (val === undefined || val === null) return '';
    return `"${String(val).replace(/"/g, '""')}"`;
  }));
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const a = document.createElement('a');
  a.setAttribute('href', encodeURI(csvContent));
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function importJSONBundle(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    if (data.tasks) { store.setState({ tasks: data.tasks }); await supabase.from('tasks').upsert(data.tasks.map(taskToRow)); }
    if (data.subjects) { store.setState({ subjects: data.subjects }); await supabase.from('academic_subjects').upsert(data.subjects.map(subjectToRow)); }
    if (data.timetable) { store.setState({ timetable: data.timetable }); await supabase.from('timetable_entries').upsert(data.timetable.map(timetableToRow)); }
    if (data.academicWorks) { store.setState({ academicWorks: data.academicWorks }); await supabase.from('academic_works').upsert(data.academicWorks.map(academicWorkToRow)); }
    if (data.personalWorks) { store.setState({ personalWorks: data.personalWorks }); await supabase.from('personal_works').upsert(data.personalWorks.map(personalWorkToRow)); }
    if (data.goals) {
      store.setState({ goals: data.goals });
      await supabase.from('goals').upsert(data.goals.map(goalToRow));
      for (const g of data.goals) await supabase.from('goal_milestones').upsert(g.milestones.map((m) => milestoneToRow(m, g.id)));
    }
    if (data.preferences) { store.setState({ preferences: data.preferences }); updatePreferences(data.preferences); }
    if (data.freeTimeSlots) { store.setState({ freeTimeSlots: data.freeTimeSlots }); await supabase.from('free_time_slots').upsert(data.freeTimeSlots.map(freeSlotToRow)); }
    alert('Workspace backup successfully restored!');
  } catch (err) {
    console.error(err);
    alert('Failed to parse backup JSON file. Ensure file is valid.');
  }
}
