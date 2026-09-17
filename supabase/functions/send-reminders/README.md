# Background push notifications — one-time setup

This is what makes SSAP notify you even when the app/PWA is fully closed. It
has three moving parts:

1. **`js/push.js`** (already wired in) — when you grant notification
   permission in the app, the browser subscribes to Push and the subscription
   is saved to a new `push_subscriptions` table in Supabase.
2. **`sw.js`** (already wired in) — the service worker's `push` event listener
   shows the OS notification, even if no tab is open.
3. **This Edge Function** — runs on a schedule, checks every user's tasks and
   preferences (the exact same 5-min/1-min/start/overdue/wind-down rules the
   in-app engine uses), and sends a push to every subscribed device.

The in-app 30-second reminder engine still runs too, for while the app is
open — nothing about the existing notification settings or UI changed.

## 1. Run the updated schema

Re-run `supabase/schema.sql` in the SQL Editor (Supabase Dashboard → SQL
Editor). It's idempotent (`create table if not exists`), so it's safe to
re-run — it just adds the new `push_subscriptions` table alongside your
existing ones.

## 2. VAPID keys

A real key pair is already filled in for you:
- Public key: already placed in `js/config.js` (`VAPID_PUBLIC_KEY`) — no
  action needed.
- Private key: `j-AKZz4GvK7FnR-qPdeVleyIzLi9biRFA5P-AxY1qBU` — you'll set this
  as a secret below. Keep it private (never put it in client-side code).

(You can generate your own pair instead any time with
`npx web-push generate-vapid-keys` — just update both the public key in
`js/config.js` and the private key as a secret in step 3.)

## 3. Deploy the Edge Function

Requires the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
supabase login
supabase link --project-ref <YOUR-PROJECT-REF>

# Secrets the function needs (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are
# injected automatically by Supabase — you only need to set these four):
supabase secrets set VAPID_PUBLIC_KEY="BGOTiE9z3AqNUif9fV-Lb7vvSywPIvcsx5WymWdapEbZ2arD6f8bGkzj1H9CdTKBPrnMqBmZT4ebDVcMOGKFf08"
supabase secrets set VAPID_PRIVATE_KEY="j-AKZz4GvK7FnR-qPdeVleyIzLi9biRFA5P-AxY1qBU"
supabase secrets set VAPID_SUBJECT="mailto:you@example.com"
supabase secrets set CRON_SECRET="pick-any-random-string-here"

supabase functions deploy send-reminders --no-verify-jwt
```

`--no-verify-jwt` is needed because the cron job below calls this function
without a user session — the `CRON_SECRET` header check in the function is
what keeps randoms from calling it instead.

## 4. Schedule it to run every minute

Two options — pick one:

**Option A — Supabase Dashboard (easiest):** Edge Functions → `send-reminders`
→ "Cron Jobs" tab → add a schedule of `* * * * *` (every minute) with header
`x-cron-secret: <the same value you set above>`.

**Option B — SQL (`pg_cron` + `pg_net`):** Database → Extensions → enable
`pg_cron` and `pg_net`, then run the commented-out block at the bottom of
`supabase/schema.sql` (fill in your project ref and `CRON_SECRET`).

## Verifying it works

1. Open the app, sign in, go to Settings → click "Test Audio & Alert" once to
   grant notification permission (this also creates your push subscription).
2. Confirm a row appeared in `push_subscriptions` (Table Editor).
3. Schedule a task for 5 minutes from now (Tasks or Quick Add).
4. Close the tab/app entirely.
5. Wait — you should get an OS notification at the 5-minute mark, generated
   by the Edge Function rather than the page.

If nothing arrives, check the function's logs (Edge Functions →
`send-reminders` → Logs) — 401 means the cron secret header is missing or
wrong; a `web-push` error usually means the VAPID keys don't match what's in
`js/config.js`.
