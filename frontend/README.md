# Synqro — Frontend

Next.js (App Router, JavaScript) frontend for the Project Management &
Team Collaboration Platform. This is the design-system + scaffold phase —
actual pages (login, dashboards, projects, tasks) come next.

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local if your backend runs somewhere other than localhost:8000
npm run dev
```

Visit `http://localhost:3000/style-guide` to see every design system
component in one place — colors, typography, buttons, form fields,
badges, cards, dialogs, toasts, and the sync-pulse signature element.

## What's here

- **Design tokens** — `app/globals.css` (Tailwind v4 `@theme`, no config
  file). Signal teal (brand), pulse amber (accent), cool paper-gray canvas.
  Sora (headings) + IBM Plex Sans (body) + IBM Plex Mono (task codes,
  timestamps) — loaded from Google Fonts in `app/layout.js`.
- **UI components** — `components/ui/` — Button, Input, Textarea, Select,
  Badge (+ Priority/Status variants wired to the backend's exact enum
  values), Card, Avatar, Dialog, Tabs, Spinner, EmptyState, Logo, PulseDot.
- **Layout shell** — `components/layout/` — Sidebar (reads nav items per
  role from `constants/nav.js`), Topbar, PageHeader, AppShell.
- **Data layer** — `lib/api-client.js` (Axios, attaches the stored token,
  unwraps the backend's `{error: {message, code}}` shape into a plain
  Error), `context/AuthContext.jsx` (login/logout/session), `services/`
  (one file per backend router — calls match the FastAPI endpoints
  exactly).
- **Constants** — `constants/roles.js`, `priorities.js`, `statuses.js`,
  `nav.js` — single source of truth so labels/colors never drift from
  what the backend actually returns.

## Verified

- `npm install` — 0 vulnerabilities (Next 16.3.0, Tailwind 4.3.3, axios
  1.19.0 — all patched versions, not what a fresh `create-next-app` would
  give you today)
- `npm run build` — compiles cleanly, all routes statically generate
- Visually checked at desktop (1280px) and mobile (390px) — reflows
  correctly, no overflow

## Pages (all built)

- `/login`
- `/admin`, `/admin/projects`, `/admin/projects/[id]`, `/admin/users`
- `/pm`, `/pm/projects`, `/pm/projects/[id]`
- `/member`, `/member/tasks`, `/member/projects`
- `/tasks/[id]` — shared, role-aware (status update for the assignee, full edit + delete for admin/PM, discussion thread for everyone with access)
- `/notifications`, `/profile`

All authenticated routes sit under `app/(app)/` and are guarded by
`app/(app)/layout.js`, which redirects to `/login` if there's no session
and wraps everything in `AppShell` using the logged-in user's role.

## Known gap to fix in the backend

`GET /users` is admin-only, so on the task detail page a Project Manager
or Team Member can't resolve another user's name (e.g. seeing who posted
a discussion message, or who a task is assigned to) — the frontend falls
back to "Team member" for anyone who isn't the viewer themselves. Worth
adding a lightweight endpoint (e.g. `GET /users/{id}` returning just
`id`/`full_name`/`avatar_url`, open to any authenticated user) so this
displays real names for every role.
