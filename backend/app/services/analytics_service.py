"""
Aggregation logic for the PM and member analytics dashboards.

Pure functions on plain dicts (as returned by the Supabase client), same
style as notification_service.py — no DB access here, routers fetch rows
and pass them in. Makes this trivially unit-testable without a live DB.
"""

from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Optional

from app.models.analytics_schemas import (
    GroupBreakdown,
    MemberAnalyticsDashboard,
    PMAnalyticsDashboard,
    TimelinessBreakdown,
    TrendPoint,
)

TREND_MONTHS = 6


def _parse_date(value) -> Optional[date]:
    if not value:
        return None
    if isinstance(value, date):
        return value
    # completed_at/due_date come back as ISO strings from the Supabase client
    return datetime.fromisoformat(str(value).replace("Z", "+00:00")).date()


def _bucket_task(task: dict, today: date) -> str:
    """Classify one task: on_time / late / never_completed / no_deadline / pending."""
    due = _parse_date(task.get("due_date"))
    completed_at = _parse_date(task.get("completed_at"))
    status = task.get("status")

    if status == "completed":
        if not due:
            return "no_deadline"
        return "on_time" if completed_at and completed_at <= due else "late"

    if due and due < today:
        return "never_completed"

    return "pending"  # not yet due, not our concern for this dashboard


def compute_timeliness(tasks: list[dict], today: date) -> TimelinessBreakdown:
    counts = defaultdict(int)
    for t in tasks:
        counts[_bucket_task(t, today)] += 1
    return TimelinessBreakdown(
        on_time=counts["on_time"],
        late=counts["late"],
        never_completed=counts["never_completed"],
        no_deadline=counts["no_deadline"],
    )


def compute_on_time_rate(breakdown: TimelinessBreakdown) -> float:
    finished = breakdown.on_time + breakdown.late
    if finished == 0:
        return 0.0
    return round((breakdown.on_time / finished) * 100, 1)


def compute_avg_completion_days(tasks: list[dict]) -> Optional[float]:
    """Average (completed_at - due_date) in days across completed tasks that
    had a due date. Negative = finished early on average, positive = late."""
    diffs = []
    for t in tasks:
        if t.get("status") != "completed":
            continue
        due = _parse_date(t.get("due_date"))
        completed_at = _parse_date(t.get("completed_at"))
        if due and completed_at:
            diffs.append((completed_at - due).days)
    if not diffs:
        return None
    return round(sum(diffs) / len(diffs), 1)


def compute_trend(tasks: list[dict], months: int = TREND_MONTHS) -> list[TrendPoint]:
    """On-time vs late completion counts per month, oldest -> newest,
    zero-filled so the chart never has gaps."""
    today = date.today()
    buckets: dict[str, dict] = {}
    ordered_keys = []
    cursor = today.replace(day=1)
    for _ in range(months):
        key = cursor.strftime("%Y-%m")
        ordered_keys.append(key)
        buckets[key] = {"on_time": 0, "late": 0}
        cursor = (cursor - timedelta(days=1)).replace(day=1)
    ordered_keys.reverse()

    for t in tasks:
        if t.get("status") != "completed":
            continue
        completed_at = _parse_date(t.get("completed_at"))
        due = _parse_date(t.get("due_date"))
        if not completed_at or not due:
            continue
        key = completed_at.strftime("%Y-%m")
        if key not in buckets:
            continue
        bucket = "on_time" if completed_at <= due else "late"
        buckets[key][bucket] += 1

    return [TrendPoint(period=k, **buckets[k]) for k in ordered_keys]


def compute_group_breakdown(
    tasks: list[dict],
    group_key: str,
    labels: dict[str, str],
    today: date,
) -> list[GroupBreakdown]:
    """Group tasks by `group_key` ('project_id' or 'assigned_to') and bucket each group."""
    grouped: dict[str, list[dict]] = defaultdict(list)
    for t in tasks:
        gid = t.get(group_key)
        if gid:
            grouped[gid].append(t)

    result = []
    for gid, group_tasks in grouped.items():
        breakdown = compute_timeliness(group_tasks, today)
        total = len(group_tasks)
        completed = breakdown.on_time + breakdown.late
        result.append(
            GroupBreakdown(
                id=gid,
                label=labels.get(gid, "Unknown"),
                on_time=breakdown.on_time,
                late=breakdown.late,
                never_completed=breakdown.never_completed,
                total=total,
                completion_rate=round((completed / total) * 100, 1) if total else 0.0,
            )
        )
    result.sort(key=lambda g: g.total, reverse=True)
    return result


def build_pm_analytics(
    tasks: list[dict],
    project_labels: dict[str, str],
    member_labels: dict[str, str],
) -> PMAnalyticsDashboard:
    today = date.today()
    overall = compute_timeliness(tasks, today)
    return PMAnalyticsDashboard(
        overall=overall,
        on_time_rate=compute_on_time_rate(overall),
        avg_completion_days=compute_avg_completion_days(tasks),
        trend=compute_trend(tasks),
        by_project=compute_group_breakdown(tasks, "project_id", project_labels, today),
        by_member=compute_group_breakdown(tasks, "assigned_to", member_labels, today),
    )


def build_member_analytics(
    tasks: list[dict],
    project_labels: dict[str, str],
) -> MemberAnalyticsDashboard:
    today = date.today()
    overall = compute_timeliness(tasks, today)
    return MemberAnalyticsDashboard(
        overall=overall,
        on_time_rate=compute_on_time_rate(overall),
        avg_completion_days=compute_avg_completion_days(tasks),
        trend=compute_trend(tasks),
        by_project=compute_group_breakdown(tasks, "project_id", project_labels, today),
    )