-- ============================================================
-- Run this AFTER schema.sql — sets up deadline-approaching notifications
-- Requires: Database > Extensions > enable "pg_cron" (Supabase dashboard)
-- ============================================================

create extension if not exists pg_cron;

create or replace function notify_upcoming_deadlines()
returns void
language plpgsql
security definer
as $$
begin
  insert into notifications (user_id, type, message, related_project_id, related_task_id)
  select
    t.assigned_to,
    'deadline_approaching',
    'Task "' || t.title || '" is due on ' || t.due_date,
    t.project_id,
    t.id
  from tasks t
  where t.due_date is not null
    and t.due_date <= (current_date + interval '2 days')
    and t.due_date >= current_date
    and t.status != 'completed'
    and t.assigned_to is not null
    -- avoid duplicate reminders: skip if we already notified for this task today
    and not exists (
      select 1 from notifications n
      where n.related_task_id = t.id
        and n.type = 'deadline_approaching'
        and n.created_at::date = current_date
    );
end;
$$;

-- Runs once a day at 08:00 UTC
select cron.schedule(
  'notify-upcoming-deadlines',
  '0 8 * * *',
  $$ select notify_upcoming_deadlines(); $$
);
