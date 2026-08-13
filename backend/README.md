# Synqro — Backend

FastAPI + Supabase (Postgres + Auth + RLS) backend for the Project Management
& Team Collaboration Platform.

## Setup

### 1. Supabase project
1. Create a project at supabase.com
2. Open **SQL Editor** → paste the contents of `supabase/schema.sql` → Run.
   This creates all tables, enums, RLS policies, and the auto-profile trigger.
3. Go to **Project Settings → API** and copy: Project URL, `anon` public key,
   `service_role` key.

### 2. Backend env
```bash
cd backend
cp .env.example .env
# fill in SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

### 3. Install & run
```bash
pip install -r requirements.txt --break-system-packages   # or use a venv
uvicorn app.main:app --reload
```
API docs: http://localhost:8000/docs

### 4. Create the first admin
There's no public signup route on purpose — admins create every user
(per the task spec). To bootstrap your very first admin, either:
- Use Supabase Dashboard → Authentication → Add user, then manually set
  `role = 'admin'` on that user's row in the `profiles` table, OR
- Temporarily call `POST /users` with a valid token by inserting yourself
  directly as admin in `profiles` via the SQL editor once, then use the API
  normally from there.

## How auth + RLS fit together
1. Frontend calls `POST /auth/login` → gets back a Supabase access token.
2. Every subsequent request sends `Authorization: Bearer <token>`.
3. FastAPI (`app/dependencies/auth.py`) verifies the token, loads the
   caller's profile/role, and builds a **request-scoped Supabase client**
   carrying that same token (`app/core/supabase_client.py::get_user_client`).
4. All table reads/writes go through that scoped client — so Postgres RLS
   policies (in `supabase/schema.sql`) are the actual enforcement layer,
   not just `if` checks in Python. FastAPI's `require_role()` dependency is
   a fast-fail UX layer on top of that, not the only line of defense.
5. The service-role client (`get_service_client`) bypasses RLS entirely and
   is used ONLY for: verifying tokens, admin user creation/deletion, and
   system-generated notifications written to another user's row.

## Still to build
- Deadline-approaching notifications need a scheduled job (Supabase
  `pg_cron` calling a Postgres function, or an external cron hitting a
  protected endpoint) — everything else is request-triggered and done.
- File attachments (bonus feature) — would use Supabase Storage.
