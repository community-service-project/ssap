import { supabase } from './supabaseClient.js';
import { VAPID_PUBLIC_KEY } from './config.js';

// ----------------------------------------------------------------------------
// Web Push subscription management.
//
// This is what makes notifications fire even when the PWA is closed / in the
// background: the browser's Push service (not this app) wakes the service
// worker up with a `push` event whenever the Supabase Edge Function sends one
// to the subscription's endpoint. See sw.js for the `push` event listener and
// supabase/functions/send-reminders for the sender.
// ----------------------------------------------------------------------------

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Subscribes the current browser to Web Push (if not already subscribed) and
 * upserts the subscription against the signed-in user in Supabase, so the
 * send-reminders Edge Function knows where to deliver background pushes.
 * Silently no-ops if push isn't supported, permission isn't granted yet, or
 * nobody is signed in — safe to call opportunistically.
 */
export async function subscribeToPush() {
  try {
    if (!isPushSupported()) return null;
    if (Notification.permission !== 'granted') return null;
    if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.includes('YOUR_')) {
      console.warn('[push] VAPID_PUBLIC_KEY not configured in js/config.js — skipping push subscription.');
      return null;
    }

    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id;
    if (!userId) return null;

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const json = subscription.toJSON();
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      },
      { onConflict: 'endpoint' }
    );
    if (error) console.error('[push] failed to save subscription:', error.message);
    return subscription;
  } catch (err) {
    console.warn('[push] subscription failed:', err);
    return null;
  }
}

/** Removes the current device's push subscription (browser + Supabase row). */
export async function unsubscribeFromPush() {
  try {
    if (!isPushSupported()) return;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
  } catch (err) {
    console.warn('[push] unsubscribe failed:', err);
  }
}
