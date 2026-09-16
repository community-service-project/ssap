// ============================================================================
// SSAP — send-reminders Edge Function
//
// Runs on a schedule (see supabase/schema.sql's pg_cron block, or Supabase's
// dashboard "Cron Jobs" UI) roughly once a minute. It re-implements the exact
// same reminder rules as js/notifications.js's checkScheduledReminders(), but
// server-side, per user, so reminders arrive as real OS notifications even
// when nobody has the app open.
//
// Setup: see the accompanying README.md in this folder.
// ============================================================================
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@example.com';
const CRON_SECRET = Deno.env.get('CRON_SECRET'); // optional but recommended

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function timeToMinutes(t: string | null | undefined): number | null {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/** "Now", split into local minutes-of-day + YYYY-MM-DD, for a given IANA timezone. */
function nowInTimezone(timeZone: string) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  const dateStr = `${get('year')}-${get('month')}-${get('day')}`;
  const hour = Number(get('hour')) % 24; // Intl can format midnight as "24"
  const minute = Number(get('minute'));
  return { dateStr, minutesOfDay: hour * 60 + minute };
}

type NotifRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  read: boolean;
  related_item_id: string | null;
  related_item_type: string | null;
};

Deno.serve(async (req) => {
  if (CRON_SECRET && req.headers.get('x-cron-secret') !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const [{ data: profiles, error: profilesErr }, { data: tasks }, { data: personalWorks }, { data: subs }] =
    await Promise.all([
      supabase.from('profiles').select('id, timezone, notifications_enabled, notify_5min, notify_1min, notify_at_start, notify_overdue, notify_sleep_winddown'),
      supabase.from('tasks').select('id, user_id, title, priority, estimated_minutes, status, scheduled_date, scheduled_time, reminders_enabled'),
      supabase.from('personal_works').select('id, user_id, category, is_recurring, scheduled_date, start_time, wind_down_minutes'),
      supabase.from('push_subscriptions').select('*'),
    ]);

  if (profilesErr) return new Response(JSON.stringify({ error: profilesErr.message }), { status: 500 });

  const tasksByUser = groupBy(tasks || [], (t) => t.user_id);
  const personalByUser = groupBy(personalWorks || [], (p) => p.user_id);
  const subsByUser = groupBy(subs || [], (s) => s.user_id);

  const candidateNotifs: NotifRow[] = [];

  for (const profile of profiles || []) {
    if (!profile.notifications_enabled) continue;
    const { dateStr: todayStr, minutesOfDay: currentMinutes } = nowInTimezone(profile.timezone || 'UTC');
    const userTasks = (tasksByUser[profile.id] || []).filter(
      (t) => (t.status === 'Pending' || t.status === 'In Progress') && t.reminders_enabled !== false && t.scheduled_date === todayStr && t.scheduled_time
    );

    for (const task of userTasks) {
      const startMin = timeToMinutes(task.scheduled_time);
      if (startMin === null) continue;
      const diffMin = startMin - currentMinutes;

      if (profile.notify_5min && diffMin === 5) {
        candidateNotifs.push(mkNotif(`notif-5m-${task.id}-${todayStr}`, profile.id, `Starting in 5 min: ${task.title}`, `Allocated duration: ${task.estimated_minutes}m. Priority: ${task.priority}.`, 'reminder_5m', task.id, 'task'));
      }
      if (profile.notify_1min && diffMin === 1) {
        candidateNotifs.push(mkNotif(`notif-1m-${task.id}-${todayStr}`, profile.id, `Starting in 1 min: ${task.title}`, `Get ready to begin. Duration: ${task.estimated_minutes}m.`, 'reminder_1m', task.id, 'task'));
      }
      if (profile.notify_at_start && diffMin === 0) {
        candidateNotifs.push(mkNotif(`notif-start-${task.id}-${todayStr}`, profile.id, `Action Required: ${task.title}`, `Scheduled start time reached (${task.scheduled_time}).`, 'start', task.id, 'task'));
      }
      if (profile.notify_overdue && diffMin < -15 && diffMin >= -30) {
        candidateNotifs.push(mkNotif(`notif-overdue-${task.id}-${todayStr}`, profile.id, `Task Overdue: ${task.title}`, `Was scheduled at ${task.scheduled_time}. Mark complete or reschedule.`, 'overdue', task.id, 'task'));
      }
    }

    if (profile.notify_sleep_winddown) {
      const sleepRoutine = (personalByUser[profile.id] || []).find(
        (p) => p.category === 'Sleep' && (p.is_recurring || p.scheduled_date === todayStr)
      );
      if (sleepRoutine?.start_time) {
        const sleepMin = timeToMinutes(sleepRoutine.start_time)!;
        const windDownMins = sleepRoutine.wind_down_minutes || 30;
        const windDownTargetMin = sleepMin - windDownMins;
        if (currentMinutes === windDownTargetMin) {
          candidateNotifs.push(mkNotif(`notif-winddown-${profile.id}-${todayStr}`, profile.id, 'Sleep Wind-Down Window', `Gentle reminder: Sleep begins in ${windDownMins} mins at ${sleepRoutine.start_time}. Dim screens and unwind.`, 'sleep_winddown', sleepRoutine.id, 'personal'));
        }
      }
    }
  }

  if (candidateNotifs.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Only rows that didn't already exist (i.e. not already sent by this
  // function on a previous run, or by the client while the tab was open)
  // come back here — that's how we avoid double-notifying.
  const { data: inserted, error: insertErr } = await supabase
    .from('notifications')
    .upsert(candidateNotifs, { onConflict: 'id', ignoreDuplicates: true })
    .select();
  if (insertErr) return new Response(JSON.stringify({ error: insertErr.message }), { status: 500 });

  let sent = 0;
  const staleEndpoints: string[] = [];

  await Promise.all(
    (inserted || []).map(async (notif) => {
      const userSubs = subsByUser[notif.user_id] || [];
      await Promise.all(
        userSubs.map(async (sub) => {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              JSON.stringify({ title: notif.title, body: notif.message, tag: notif.type, url: '/' })
            );
            sent++;
          } catch (err) {
            if (err?.statusCode === 404 || err?.statusCode === 410) staleEndpoints.push(sub.endpoint);
            else console.error('[send-reminders] push failed:', err?.message || err);
          }
        })
      );
    })
  );

  if (staleEndpoints.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', staleEndpoints);
  }

  return new Response(JSON.stringify({ notifsCreated: inserted?.length || 0, pushed: sent }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

function mkNotif(id: string, userId: string, title: string, message: string, type: string, relatedId: string, relatedType: string): NotifRow {
  return { id, user_id: userId, title, message, type, timestamp: new Date().toISOString(), read: false, related_item_id: relatedId, related_item_type: relatedType };
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    (acc[key] ||= []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
