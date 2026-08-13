# Running the automated test suite

These tests hit your **real Supabase project** — RLS is what's actually
being verified, so there's no meaningful way to mock it. Each test run
creates and deletes real rows (projects/tasks/etc.) under three real
test accounts. Safe to run against your dev Supabase project.

## One-time setup

### 1. Install test dependencies
```bash
pip install -r requirements-dev.txt --break-system-packages
```

### 2. Create three test accounts (one per role)
You need a real admin, PM, and team member account that already exist in
Supabase Auth with the correct `role` set on their `profiles` row.

Easiest path, using your already-bootstrapped real admin account:
1. Log in as your real admin via `POST /auth/login` (Swagger is fine for
   this one-time step)
2. Use `POST /users` (as that admin) to create:
   - `pm@test.synqro.local` with `role: project_manager`
   - `member@test.synqro.local` with `role: team_member`
3. For the test **admin** account itself, either reuse your real admin's
   credentials in `tests/.env.test`, or create a second admin the same way
   Supabase Dashboard → Authentication → Add user + set `role='admin'` in
   the SQL Editor (see main README's bootstrap section)

### 3. Configure test credentials
```bash
cp tests/.env.test.example tests/.env.test
```
Fill in your real Supabase URL/keys and the three test accounts' emails
and passwords. **Never commit this file** — it should already be covered
by `.gitignore`, but double check.

## Running

```bash
pytest                    # run everything
pytest tests/test_auth.py # just one file
pytest -v                 # verbose, shows each test name
pytest -k "rbac"          # only tests with "rbac" in the name
```

## What's covered

- `test_auth.py` — login, `/auth/me`, rejecting invalid/missing tokens
- `test_rbac_projects.py` — admin-only create/delete, PM scoped to own
  project, team member invisible to a project until added, PM can't
  reassign the project manager
- `test_rbac_tasks.py` — PM-only create, the team-member status-only
  restriction (the trickiest RBAC rule in the app), notification on
  assignment
- `test_discussions_and_notifications.py` — posting/reading discussions,
  notification triggers, users only ever seeing their own notifications
- `test_input_validation.py` — invalid enum values, bad date ranges,
  blank required fields, and that every error response comes back in the
  same `{"error": {"message": ..., "code": ...}}` shape

## What this does NOT cover yet

- File attachments, email notifications, real-time updates — not built
  yet (see `pending.md`)
- Load/performance testing
- The deadline-approaching pg_cron job (would need to fast-forward time
  or manipulate `due_date`/`created_at` directly in Supabase to test
  meaningfully — worth doing manually once, not part of this suite)
