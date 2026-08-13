"""
Response models for the analytics endpoints (GET /dashboard/pm/analytics,
GET /dashboard/member/analytics).

Kept separate from schemas.py rather than appended into it, so this can be
dropped in without hand-editing a file we can't see the full contents of.
Import path: app.models.analytics_schemas
"""

from typing import Optional
from pydantic import BaseModel


class TimelinessBreakdown(BaseModel):
    """How a set of tasks split across the three outcomes that matter:
    finished before/on the deadline, finished after it, or never finished
    at all (deadline has passed, task is still open). `no_deadline` is
    tracked separately since a task with no due_date can't be judged late.
    """
    on_time: int
    late: int
    never_completed: int
    no_deadline: int


class TrendPoint(BaseModel):
    period: str  # "YYYY-MM"
    on_time: int
    late: int


class GroupBreakdown(BaseModel):
    """Timeliness broken down per project or per team member."""
    id: str
    label: str
    on_time: int
    late: int
    never_completed: int
    total: int
    completion_rate: float  # % of total tasks that reached "completed"


class PMAnalyticsDashboard(BaseModel):
    overall: TimelinessBreakdown
    on_time_rate: float  # % of *completed* tasks that were on time
    avg_completion_days: Optional[float] = None  # negative = early on average, positive = late
    trend: list[TrendPoint]
    by_project: list[GroupBreakdown]
    by_member: list[GroupBreakdown]


class MemberAnalyticsDashboard(BaseModel):
    overall: TimelinessBreakdown
    on_time_rate: float
    avg_completion_days: Optional[float] = None
    trend: list[TrendPoint]
    by_project: list[GroupBreakdown]