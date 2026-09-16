import { timeToMinutes } from './time.js';
import { subscribeToPush } from './push.js';

/** Play a subtle gentle chime using the browser Web Audio API. */
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  } catch (err) {
    console.debug('Audio chime playback omitted or unsupported:', err);
  }
}

/** Request system notification permission with fallback. Also registers this
 *  device for background Web Push once permission is granted, so reminders
 *  keep arriving even when the app/tab is closed. */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'denied';
  let permission = Notification.permission;
  if (permission !== 'granted' && permission !== 'denied') permission = await Notification.requestPermission();
  if (permission === 'granted') subscribeToPush(); // fire-and-forget, never blocks the UI
  return permission;
}

/** Sends a system or fallback in-app notification. */
export function sendSmartNotification(title, options) {
  if (options.sound !== false) playNotificationChime();

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: options.body,
        icon: options.icon || '/pwa-192x192.png',
        tag: options.tag || 'ssap-notification',
      });
    } catch (err) {
      console.warn('System Notification display failed, relying on in-app UI:', err);
    }
  }
}

/** Evaluates upcoming tasks and personal routines against current time to trigger reminders. */
export function checkScheduledReminders(tasks, personalWorks, preferences, existingNotifs) {
  if (!preferences.notificationsEnabled) return [];

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayStr = now.toISOString().slice(0, 10);
  const newRecords = [];

  tasks
    .filter((t) => t.status === 'Pending' || t.status === 'In Progress')
    .filter((t) => t.remindersEnabled !== false)
    .filter((t) => t.scheduledDate === todayStr && t.scheduledTime)
    .forEach((task) => {
      const taskStartMin = timeToMinutes(task.scheduledTime);
      const diffMin = taskStartMin - currentMinutes;

      if (preferences.notify5MinBefore && diffMin === 5) {
        const notifId = `notif-5m-${task.id}-${todayStr}`;
        if (!existingNotifs.some((n) => n.id === notifId)) {
          newRecords.push({
            id: notifId,
            title: `Starting in 5 min: ${task.title}`,
            message: `Allocated duration: ${task.estimatedMinutes}m. Priority: ${task.priority}.`,
            type: 'reminder_5m',
            timestamp: new Date().toISOString(),
            read: false,
            relatedItemId: task.id,
            relatedItemType: 'task',
          });
        }
      }

      if (preferences.notify1MinBefore && diffMin === 1) {
        const notifId = `notif-1m-${task.id}-${todayStr}`;
        if (!existingNotifs.some((n) => n.id === notifId)) {
          newRecords.push({
            id: notifId,
            title: `Starting in 1 min: ${task.title}`,
            message: `Get ready to begin. Duration: ${task.estimatedMinutes}m.`,
            type: 'reminder_1m',
            timestamp: new Date().toISOString(),
            read: false,
            relatedItemId: task.id,
            relatedItemType: 'task',
          });
        }
      }

      if (preferences.notifyAtStart && diffMin === 0) {
        const notifId = `notif-start-${task.id}-${todayStr}`;
        if (!existingNotifs.some((n) => n.id === notifId)) {
          newRecords.push({
            id: notifId,
            title: `Action Required: ${task.title}`,
            message: `Scheduled start time reached (${task.scheduledTime}).`,
            type: 'start',
            timestamp: new Date().toISOString(),
            read: false,
            relatedItemId: task.id,
            relatedItemType: 'task',
          });
        }
      }

      if (preferences.notifyOverdue && diffMin < -15 && diffMin >= -30) {
        const notifId = `notif-overdue-${task.id}-${todayStr}`;
        if (!existingNotifs.some((n) => n.id === notifId)) {
          newRecords.push({
            id: notifId,
            title: `Task Overdue: ${task.title}`,
            message: `Was scheduled at ${task.scheduledTime}. Mark complete or reschedule.`,
            type: 'overdue',
            timestamp: new Date().toISOString(),
            read: false,
            relatedItemId: task.id,
            relatedItemType: 'task',
          });
        }
      }
    });

  if (preferences.notifySleepWindDown) {
    const sleepRoutine = personalWorks.find(
      (p) => p.category === 'Sleep' && (p.isRecurring || p.scheduledDate === todayStr)
    );
    if (sleepRoutine && sleepRoutine.startTime) {
      const sleepMin = timeToMinutes(sleepRoutine.startTime);
      const windDownMins = sleepRoutine.windDownMinutes || 30;
      const windDownTargetMin = sleepMin - windDownMins;

      if (currentMinutes === windDownTargetMin) {
        const notifId = `notif-winddown-${todayStr}`;
        if (!existingNotifs.some((n) => n.id === notifId)) {
          newRecords.push({
            id: notifId,
            title: 'Sleep Wind-Down Window',
            message: `Gentle reminder: Sleep begins in ${windDownMins} mins at ${sleepRoutine.startTime}. Dim screens and unwind.`,
            type: 'sleep_winddown',
            timestamp: new Date().toISOString(),
            read: false,
            relatedItemId: sleepRoutine.id,
            relatedItemType: 'personal',
          });
        }
      }
    }
  }

  return newRecords;
}
