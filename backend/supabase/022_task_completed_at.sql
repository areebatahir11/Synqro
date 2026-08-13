-- Migration: track when a task actually finished, separately from updated_at
-- (updated_at changes on ANY edit — title, priority, reassignment — so it
-- can't be trusted to mean "the moment status became completed". This gives
-- analytics a real timestamp to compare against due_date.)

alter table tasks
  add column if not exists completed_at timestamptz;

create or replace function set_task_completed_at()
returns trigger
language plpgsql
as $$
begin
  -- status just flipped TO completed -> stamp it
  if new.status = 'completed' and (old.status is distinct from 'completed') then
    new.completed_at := now();

  -- status was completed and just moved AWAY from it (reopened) -> clear it
  elsif new.status <> 'completed' and old.status = 'completed' then
    new.completed_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_set_task_completed_at on tasks;

create trigger trg_set_task_completed_at
before update on tasks
for each row
execute function set_task_completed_at();

-- Backfill: for tasks that are already completed today (created before this
-- migration existed), we have no true completion moment on record. Best
-- available signal is updated_at, so use that as a one-time backfill only —
-- the trigger takes over correctly from here on.
update tasks
set completed_at = updated_at
where status = 'completed'
  and completed_at is null;