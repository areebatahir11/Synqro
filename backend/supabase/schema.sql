-- ============================================================
-- Synqro — Project Management & Team Collaboration Platform
-- Supabase schema: enums, tables, RLS policies
-- Run this in Supabase SQL Editor (after enabling the pgcrypto/uuid ext, which Supabase has by default)
-- ============================================================

-- ---------- ENUMS ----------
create type user_role as enum ('admin', 'project_manager', 'team_member');
create type project_priority as enum ('low', 'medium', 'high', 'critical');
create type project_status as enum ('not_started', 'active', 'on_hold', 'completed');
create type task_priority as enum ('low', 'medium', 'high', 'critical');
create type task_status as enum ('todo', 'in_progress', 'review', 'completed');
create type notification_type as enum ('task_assigned', 'status_updated', 'new_discussion', 'deadline_approaching');

-- ---------- PROFILES ----------
-- Extends auth.users 1:1
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null default 'team_member',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ---------- PROJECTS ----------
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date,
  end_date date,
  priority project_priority not null default 'medium',
  status project_status not null default 'not_started',
  project_manager_id uuid references profiles(id),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- PROJECT MEMBERS ----------
create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  member_id uuid not null references profiles(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (project_id, member_id)
);

-- ---------- TASKS ----------
create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references profiles(id),
  priority task_priority not null default 'medium',
  due_date date,
  status task_status not null default 'todo',
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- TASK DISCUSSIONS ----------
create table task_discussions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references profiles(id),
  message text not null,
  created_at timestamptz not null default now()
);

-- ---------- NOTIFICATIONS ----------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  message text not null,
  related_project_id uuid references projects(id) on delete cascade,
  related_task_id uuid references tasks(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- HELPER FUNCTION — current user's role (used inside RLS policies)
-- security definer so it can read profiles regardless of caller's own RLS
-- ============================================================
create or replace function current_user_role()
returns user_role
language sql
security definer
stable
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_project_manager_of(p_project_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from projects
    where id = p_project_id and project_manager_id = auth.uid()
  );
$$;

create or replace function is_member_of(p_project_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id and member_id = auth.uid()
  );
$$;

-- ============================================================
-- ENABLE RLS
-- ============================================================
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table tasks enable row level security;
alter table task_discussions enable row level security;
alter table notifications enable row level security;

-- ---------- PROFILES POLICIES ----------
create policy "profiles_select_all_authenticated"
  on profiles for select
  using (auth.uid() is not null);

create policy "profiles_update_own"
  on profiles for update
  using (id = auth.uid());

create policy "profiles_admin_full"
  on profiles for all
  using (current_user_role() = 'admin');

-- ---------- PROJECTS POLICIES ----------
create policy "projects_admin_full"
  on projects for all
  using (current_user_role() = 'admin');

create policy "projects_pm_select_own"
  on projects for select
  using (project_manager_id = auth.uid());

create policy "projects_pm_update_own"
  on projects for update
  using (project_manager_id = auth.uid());

create policy "projects_member_select"
  on projects for select
  using (is_member_of(id));

-- ---------- PROJECT MEMBERS POLICIES ----------
create policy "project_members_admin_full"
  on project_members for all
  using (current_user_role() = 'admin');

create policy "project_members_pm_manage_own_project"
  on project_members for all
  using (is_project_manager_of(project_id));

create policy "project_members_read_own"
  on project_members for select
  using (member_id = auth.uid());

-- ---------- TASKS POLICIES ----------
create policy "tasks_admin_full"
  on tasks for all
  using (current_user_role() = 'admin');

create policy "tasks_pm_full_own_project"
  on tasks for all
  using (is_project_manager_of(project_id));

create policy "tasks_member_select_own"
  on tasks for select
  using (assigned_to = auth.uid());

-- Team members may only ever change the status column — enforced in FastAPI
-- (route only ever sends {status: ...} in the update payload), backed by this policy:
create policy "tasks_member_update_status_only"
  on tasks for update
  using (assigned_to = auth.uid());

-- ---------- TASK DISCUSSIONS POLICIES ----------
create policy "discussions_admin_full"
  on task_discussions for all
  using (current_user_role() = 'admin');

create policy "discussions_pm_own_project"
  on task_discussions for all
  using (
    exists (
      select 1 from tasks t
      where t.id = task_id and is_project_manager_of(t.project_id)
    )
  );

create policy "discussions_member_own_task"
  on task_discussions for all
  using (
    exists (
      select 1 from tasks t
      where t.id = task_id and t.assigned_to = auth.uid()
    )
  );

-- ---------- NOTIFICATIONS POLICIES ----------
create policy "notifications_own_only"
  on notifications for all
  using (user_id = auth.uid());

create policy "notifications_admin_read_all"
  on notifications for select
  using (current_user_role() = 'admin');

-- ============================================================
-- AUTO-CREATE PROFILE on new auth.users signup (admin creates users via
-- the Supabase Admin API, which fires this trigger too)
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Unnamed User'),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'team_member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
