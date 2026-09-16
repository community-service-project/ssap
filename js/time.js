// Ported 1:1 from src/utils/time.ts (TypeScript types removed)

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const SHORT_DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Converts a 24-hour HH:mm string to formatted 12h or 24h string. */
export function formatTimeString(timeStr, format = '12h') {
  if (!timeStr) return '--:--';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return timeStr;

  if (format === '24h') {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const adjustedHours = hours % 12 || 12;
  return `${adjustedHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/** Formats duration in minutes to "Xh Ym" or "Ym". */
export function formatMinutes(minutes) {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/** Parses "HH:mm" into total minutes from midnight. */
export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Converts total minutes from midnight back to "HH:mm". */
export function minutesToTime(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Adds minutes to an "HH:mm" string. */
export function addMinutesToTime(timeStr, minutesToAdd) {
  return minutesToTime(timeToMinutes(timeStr) + minutesToAdd);
}

/** Returns a human-friendly relative or short date string. */
export function formatShortDate(dateStr) {
  if (!dateStr) return 'No date';
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  return target.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    weekday: diffDays < 7 && diffDays > 0 ? 'short' : undefined,
  });
}

/** Get current date as YYYY-MM-DD in local time */
export function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Detect schedule conflicts for a given day among timetable, scheduled tasks, and personal works. */
export function detectConflictsForDate(dateStr, timetableEntries, subjects, tasks, personalWorks) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = dateObj.getDay();

  const intervals = [];

  timetableEntries
    .filter((entry) => entry.dayOfWeek === dayOfWeek)
    .forEach((entry) => {
      const subject = subjects.find((s) => s.id === entry.subjectId);
      const title = subject ? `${subject.code}: ${subject.name} (${entry.type || 'Class'})` : 'Scheduled Class';
      const startMin = timeToMinutes(entry.startTime);
      const endMin = timeToMinutes(entry.endTime);
      if (endMin > startMin) {
        intervals.push({ id: entry.id, title, type: 'timetable', startMin, endMin, startTime: entry.startTime, endTime: entry.endTime });
      }
    });

  tasks
    .filter((t) => t.status !== 'Completed' && t.status !== 'Archived')
    .filter((t) => t.scheduledDate === dateStr && t.scheduledTime)
    .forEach((t) => {
      const startMin = timeToMinutes(t.scheduledTime);
      const duration = t.estimatedMinutes > 0 ? t.estimatedMinutes : 30;
      const endMin = startMin + duration;
      intervals.push({ id: t.id, title: t.title, type: 'task', startMin, endMin, startTime: t.scheduledTime, endTime: minutesToTime(endMin) });
    });

  personalWorks
    .filter((p) => p.category !== 'Sleep')
    .filter((p) => {
      if (p.isRecurring && p.recurringDays?.includes(dayOfWeek)) return true;
      if (p.scheduledDate === dateStr) return true;
      return false;
    })
    .forEach((p) => {
      if (p.startTime && p.endTime) {
        const startMin = timeToMinutes(p.startTime);
        const endMin = timeToMinutes(p.endTime);
        if (endMin > startMin) {
          intervals.push({ id: p.id, title: p.title, type: 'personal', startMin, endMin, startTime: p.startTime, endTime: p.endTime });
        }
      }
    });

  intervals.sort((a, b) => a.startMin - b.startMin);

  const conflicts = [];
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      const a = intervals[i];
      const b = intervals[j];
      if (b.startMin < a.endMin) {
        const overlap = Math.min(a.endMin, b.endMin) - Math.max(a.startMin, b.startMin);
        conflicts.push({
          date: dateStr,
          itemA: { id: a.id, title: a.title, type: a.type, startTime: a.startTime, endTime: a.endTime },
          itemB: { id: b.id, title: b.title, type: b.type, startTime: b.startTime, endTime: b.endTime },
          overlapMinutes: Math.max(0, overlap),
        });
      }
    }
  }

  return conflicts;
}
