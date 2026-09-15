# SSAP — Student Productivity & Life Management PWA
### (Plain HTML / CSS / JS + Supabase edition)

This is a full rewrite of the original React + TypeScript app into **plain HTML, CSS and
JavaScript** (no build step, no framework, no bundler), backed by **Supabase** for
authentication and the database.

> **Important naming note:** Supabase's built-in database is **PostgreSQL**, not MySQL.
> Supabase does not offer MySQL hosting. Everything else about "using Supabase as the
> backend" works exactly as expected — the `schema.sql` in this project targets Postgres.

## What changed vs. the original

- **UI**: Pixel-identical. All the original Tailwind CSS classes were carried over as-is.
  Styling is now a **precompiled, self-hosted stylesheet** (`css/tailwind.css`) built by
  scanning `index.html` and every `js/**/*.js` file for the classes actually used — instead
  of loading Tailwind from `cdn.tailwindcss.com` at runtime. This fixes styling breaking
  when the CDN is slow/blocked/offline, and (combined with the service worker fix below)
  makes the CSS actually available once the PWA is installed and offline. Icons still use
  [Lucide](https://lucide.dev) via its CDN build (only affects icons, not layout/colors).
  If you add new Tailwind classes to any view/component, rebuild with:
  ```bash
  npm install   # one-time
  npm run build:css
  ```
- **Framework**: React/JSX/TypeScript components were rewritten as plain JS modules that
  build HTML strings and attach event listeners (`js/views/*.js`, `js/components/*.js`).
- **Data storage**: The original app stored everything in `localStorage` with no real
  backend. It now persists to a Supabase Postgres database (`supabase/schema.sql`) scoped
  per signed-in user with Row Level Security.
- **Authentication**: The original had a placeholder "any email + 6 char password works"
  login and started every visitor already logged in as a demo user. This version uses
  real **Supabase Auth**: email/password sign-up & sign-in, plus a genuine **anonymous
  sign-in** for the "Explore as Demo Student" button. Because auth is now real, the app
  correctly starts on the public landing page for signed-out visitors instead of
  auto-logging everyone in.
- Two "Download Project ZIP" links from the original (which pointed at a static asset
  produced by its old build tooling) were removed since there's no equivalent build
  artifact in this stack.

## One-time setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (the free tier
   is enough).
2. **Run the schema**: open the SQL Editor in your Supabase dashboard → New Query → paste
   the entire contents of `supabase/schema.sql` → Run. This creates all tables and Row
   Level Security policies.
3. **Get your API keys**: Project Settings → API → copy the "Project URL" and the "anon
   public" key.
4. **Edit `js/config.js`** and paste them in:
   ```js
   export const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
   export const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';
   ```
5. **Enable auth providers**: Authentication → Providers →
   - Make sure **Email** is enabled (for normal sign-up/sign-in).
   - Enable **Anonymous Sign-ins** (used by the "Explore as Demo Student" button). If you
     skip this, everything else still works — only the demo button will show an error.
6. By default Supabase requires email confirmation for new sign-ups. For quick local
   testing you can turn this off under Authentication → Providers → Email →
   "Confirm email".

## Running it

This is a static site — no build step. Because it uses native ES module `import`s, you
need to serve it over `http://` (opening `index.html` directly via `file://` will not
work). Any static file server works, for example:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open the printed local URL in your browser.

## Project structure

```
index.html                 App shell (Tailwind + Lucide CDN, mounts main.js)
sw.js                       Minimal service worker (PWA installability + app-shell cache)
css/animations.css          The 3 custom keyframe animations the original used
public/                     App icons + manifest
supabase/schema.sql          Full Postgres schema + Row Level Security policies
js/
  config.js                  Your Supabase URL/key go here
  supabaseClient.js           Supabase client singleton
  auth.js                     Sign up / sign in / demo (anonymous) / sign out
  store.js                    Central app state + all Supabase CRUD (replaces storage.ts)
  initialData.js               Demo/seed data (used the first time a new user logs in)
  time.js / notifications.js / autoSchedule.js   Direct ports of the original utils
  icons.js                    Lucide icon helper
  domUtils.js                 Small helper to keep input focus across re-renders
  components/                 Navbar, modals, PWA install button, offline indicator
  views/                      One file per screen (dashboard, tasks, academic, personal,
                               goals, schedule, settings, landing, how-to-use, creators)
  main.js                     App bootstrap, router, reminder engine, keyboard shortcuts
```

## Notes on behavior

- The first time a new account logs in with an empty account, the app automatically
  seeds it with the same demo data (subjects, timetable, tasks, goals, etc.) the original
  app shipped with.
- The 30-second reminder engine, 5-min/1-min/start/overdue notifications, sleep
  wind-down reminders, schedule conflict detection, and the free-time auto-arrange
  algorithm are all direct ports of the original logic — same behavior, same math.
- All your data now lives in your own Supabase project instead of the browser's
  `localStorage`, so it follows you across devices/browsers once you sign in.
