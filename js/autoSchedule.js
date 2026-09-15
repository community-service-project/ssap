import { minutesToTime, timeToMinutes } from './time.js';

/**
 * Arranges pending tasks into user-defined Free Time slots for a target date.
 * Highest priority tasks are slotted first, honoring slot time windows.
 */
export function autoArrangeTasksInFreeSlots(tasks, freeSlots, targetDate, options = {}) {
  const targetDateObj = new Date(targetDate + 'T12:00:00');
  const dayOfWeek = targetDateObj.getDay();

  const applicableSlots = freeSlots
    .filter((slot) => {
      if (slot.date === targetDate) return true;
      if (slot.isRecurring && slot.recurringDays && slot.recurringDays.includes(dayOfWeek)) return true;
      return false;
    })
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const activeTasks = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Archived');

  let candidateTasks;
  if (options.onlyUnscheduled) {
    candidateTasks = activeTasks.filter((t) => !t.scheduledTime || t.scheduledDate !== targetDate);
  } else {
    candidateTasks = [...activeTasks];
  }

  const priorityScore = (p) => (p === 'High' ? 3 : p === 'Medium' ? 2 : 1);

  candidateTasks.sort((a, b) => {
    const pDiff = priorityScore(b.priority) - priorityScore(a.priority);
    if (pDiff !== 0) return pDiff;

    if (a.dueDate && b.dueDate) {
      if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    } else if (a.dueDate) {
      return -1;
    } else if (b.dueDate) {
      return 1;
    }

    return (a.estimatedMinutes || 30) - (b.estimatedMinutes || 30);
  });

  const assignedTaskMap = new Map();
  const slotBreakdowns = [];
  let totalMinutesAllocated = 0;
  let arrangedCount = 0;

  const remainingQueue = [...candidateTasks];

  for (const slot of applicableSlots) {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);
    const capacity = Math.max(0, slotEnd - slotStart);

    let currentPointer = slotStart;
    let slotAllocated = 0;
    const arrangedInSlot = [];

    let i = 0;
    while (i < remainingQueue.length) {
      const task = remainingQueue[i];
      const duration = Math.max(5, task.estimatedMinutes || 30);

      if (currentPointer + duration <= slotEnd) {
        const taskStartStr = minutesToTime(currentPointer);
        const taskEndStr = minutesToTime(currentPointer + duration);

        assignedTaskMap.set(task.id, { scheduledDate: targetDate, scheduledTime: taskStartStr });

        arrangedInSlot.push({ id: task.id, title: task.title, startTime: taskStartStr, endTime: taskEndStr, duration });

        currentPointer += duration;
        slotAllocated += duration;
        totalMinutesAllocated += duration;
        arrangedCount += 1;

        remainingQueue.splice(i, 1);
      } else {
        i++;
      }
    }

    slotBreakdowns.push({
      slotId: slot.id,
      slotTitle: slot.title || 'Free Time Window',
      startTime: slot.startTime,
      endTime: slot.endTime,
      allocatedMinutes: slotAllocated,
      totalCapacityMinutes: capacity,
      remainingMinutes: Math.max(0, capacity - slotAllocated),
      arrangedTasks: arrangedInSlot,
    });
  }

  const updatedTasks = tasks.map((task) => {
    const assignment = assignedTaskMap.get(task.id);
    if (assignment) {
      return { ...task, scheduledDate: assignment.scheduledDate, scheduledTime: assignment.scheduledTime };
    }
    return task;
  });

  return {
    updatedTasks,
    arrangedCount,
    totalMinutesAllocated,
    unarrangedCount: remainingQueue.length,
    slotBreakdowns,
  };
}
