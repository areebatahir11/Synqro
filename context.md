# Project Context — Full Stack Project Management Platform - Synqro

> Working name: **[TBD]** — rename once branding decide ho. Placeholder tables/routes isi naam pe assume karo.

## Tech Stack
- **Backend**: FastAPI (Python) — business logic + validation layer
- **Database + Auth**: Supabase (Postgres + Supabase Auth + Row Level Security)
- **Auth flow**: User Supabase Auth se login karta hai → frontend ko JWT milta hai → FastAPI ko har request ke saath ye JWT forward hota hai (`Authorization: Bearer <token>`) → FastAPI Supabase client ko **user's JWT** ke saath init karta hai (service role key nahi) → RLS automatically enforce hoti hai per-user
- **No separate role table checks in FastAPI logic** jahan possible ho — RLS database level pe hi filtering kar degi. FastAPI sirf request validate karega aur Supabase ko forward karega.

---

## Database Schema

### `profiles`
Extends `auth.users` (1:1 via `id`)
| column | type | notes |
|---|---|---|
| id | uuid PK, FK → auth.users.id | |
| full_name | text | |
| email | text | |
| role | enum('admin','project_manager','team_member') | |
| avatar_url | text | nullable |
| created_at | timestamptz | default now() |

### `projects`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| description | text | |
| start_date | date | |
| end_date | date | |
| priority | enum('low','medium','high','critical') | |
| status | enum('not_started','active','on_hold','completed') | |
| project_manager_id | uuid FK → profiles.id | assigned by admin |
| created_by | uuid FK → profiles.id | always an admin |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `project_members`
Junction table — team members per project
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK → projects.id | |
| member_id | uuid FK → profiles.id | |
| added_at | timestamptz | |

unique constraint on `(project_id, member_id)`

### `tasks`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK → projects.id | |
| title | text | |
| description | text | |
| assigned_to | uuid FK → profiles.id | nullable initially |
| priority | enum('low','medium','high','critical') | |
| due_date | date | |
| status | enum('todo','in_progress','review','completed') | default 'todo' |
| created_by | uuid FK → profiles.id | the PM |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `task_discussions`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| task_id | uuid FK → tasks.id | |
| user_id | uuid FK → profiles.id | |
| message | text | |
| created_at | timestamptz | |

### `notifications`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → profiles.id | recipient |
| type | enum('task_assigned','status_updated','new_discussion','deadline_approaching') | |
| message | text | |
| related_project_id | uuid FK → projects.id | nullable |
| related_task_id | uuid FK → tasks.id | nullable |
| is_read | boolean | default false |
| created_at | timestamptz | |

---

## RLS Policy Summary (enforced at DB level, not just in FastAPI)

| table | admin | project_manager | team_member |
|---|---|---|---|
| profiles | full access | read all (needs names for UI) | read all (needs names for UI) |
| projects | full CRUD | read/update WHERE `project_manager_id = auth.uid()` | read WHERE id IN (own `project_members` rows) |
| project_members | full CRUD | CRUD WHERE project belongs to them | read own membership rows only |
| tasks | full CRUD | CRUD WHERE project belongs to them | read WHERE `assigned_to = auth.uid()`; update ONLY `status` column on own tasks |
| task_discussions | full CRUD | CRUD on tasks in own projects | CRUD on tasks assigned to them (insert own messages, read thread) |
| notifications | full read | read own | read own |

Team member's restricted "status-only" update needs either a Postgres trigger/check constraint, or a dedicated FastAPI endpoint (`PATCH /tasks/{id}/status`) that only ever writes the `status` column — cleaner to enforce in FastAPI + a narrower RLS UPDATE policy that only grants that column.

---

## API Endpoints (FastAPI)

### Auth
- `POST /auth/login` — proxies to Supabase Auth, returns JWT
- `GET /auth/me` — current user profile + role
- `POST /auth/logout`

### Users (admin only)
- `GET /users`
- `POST /users` — creates in `auth.users` via Supabase admin API + `profiles` row
- `PATCH /users/{id}`
- `DELETE /users/{id}`

### Projects
- `GET /projects` — RLS auto-filters by role
- `POST /projects` — admin only
- `GET /projects/{id}`
- `PATCH /projects/{id}` — admin (all fields), PM (limited fields e.g. description/status)
- `DELETE /projects/{id}` — admin only
- `POST /projects/{id}/members` — PM adds team member
- `DELETE /projects/{id}/members/{member_id}` — PM removes team member

### Tasks
- `GET /projects/{id}/tasks`
- `POST /projects/{id}/tasks` — PM only
- `GET /tasks/{id}`
- `PATCH /tasks/{id}` — PM full edit
- `PATCH /tasks/{id}/status` — team member, status field only
- `DELETE /tasks/{id}` — PM only

### Task Discussions
- `GET /tasks/{id}/discussions`
- `POST /tasks/{id}/discussions`

### Notifications
- `GET /notifications`
- `PATCH /notifications/{id}/read`
- `PATCH /notifications/read-all`

### Dashboards (aggregated, role-specific)
- `GET /dashboard/admin` — total projects, total users, projects by status, overall progress
- `GET /dashboard/pm` — assigned projects, pending/completed tasks across them, upcoming deadlines
- `GET /dashboard/member` — assigned tasks, pending/completed count, upcoming deadlines

---

## FastAPI Folder Structure

```
backend/
  app/
    main.py
    core/
      config.py          # env vars, settings
      supabase_client.py # builds client per-request using forwarded JWT
    dependencies/
      auth.py            # get_current_user, require_role() dependency
    models/
      schemas.py          # Pydantic request/response models
    routers/
      auth.py
      users.py
      projects.py
      tasks.py
      discussions.py
      notifications.py
      dashboard.py
    services/
      project_service.py
      task_service.py
      notification_service.py
    utils/
  requirements.txt
  .env
```

Key pattern: `dependencies/auth.py` extracts JWT from `Authorization` header → verifies with Supabase → builds a per-request Supabase client scoped to that user's JWT → injects into route handlers. No global service-role client used for normal CRUD, only for admin user-creation endpoints.

---

## Notifications — trigger points
- Task assigned → notify assignee
- Task status changed → notify PM (and admin, optionally)
- New discussion message → notify other participants on that task
- Deadline approaching (task due_date within 24-48h) → needs a scheduled job (Supabase cron / pg_cron, or a simple periodic check) — not request-triggered like the others