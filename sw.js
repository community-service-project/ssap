const CACHE_NAME = 'ssap-shell-v3';
const APP_SHELL = ['/', '/index.html', '/css/tailwind.css', '/css/animations.css'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for navigation/API, cache-first for the static app shell.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (request.url.includes('supabase.co')) return; // never cache API/auth calls

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// ----------------------------------------------------------------------------
// Web Push: fires even when the PWA/tab is closed or backgrounded. Payloads
// are sent by the Supabase Edge Function in supabase/functions/send-reminders.
// ----------------------------------------------------------------------------
self.addEventListener('push', (event) => {
  let payload = { title: 'SSAP Reminder', body: 'You have a scheduled item coming up.' };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch (err) {
    if (event.data) payload.body = event.data.text();
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/public/pwa-192x192.png',
    badge: payload.badge || '/public/pwa-192x192.png',
    tag: payload.tag || 'ssap-notification',
    data: { url: payload.url || '/', ...payload.data },
    renotify: !!payload.tag,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// Focus (or open) the app when a background push notification is tapped.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
