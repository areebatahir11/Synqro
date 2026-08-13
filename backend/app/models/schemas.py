# from datetime import date, datetime
# from enum import Enum
# from typing import Optional
# from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


# # ---------- ENUMS ----------
# # Real enums (not just str) so FastAPI/Pydantic reject an invalid value with a
# # clean 422 before it ever reaches Supabase — the DB enum constraint (schema.sql)
# # is the backstop, this is the first line of defense with a readable error.
# class UserRole(str, Enum):
#     admin = "admin"
#     project_manager = "project_manager"
#     team_member = "team_member"


# class ProjectPriority(str, Enum):
#     low = "low"
#     medium = "medium"
#     high = "high"
#     critical = "critical"


# class ProjectStatus(str, Enum):
#     not_started = "not_started"
#     active = "active"
#     on_hold = "on_hold"
#     completed = "completed"


# class TaskPriority(str, Enum):
#     low = "low"
#     medium = "medium"
#     high = "high"
#     critical = "critical"


# class TaskStatus(str, Enum):
#     todo = "todo"
#     in_progress = "in_progress"
#     review = "review"
#     completed = "completed"


# class NotificationType(str, Enum):
#     task_assigned = "task_assigned"
#     status_updated = "status_updated"
#     new_discussion = "new_discussion"
#     deadline_approaching = "deadline_approaching"


# # ---------- AUTH ----------
# class LoginRequest(BaseModel):
#     email: EmailStr
#     password: str = Field(min_length=1)


# class LoginResponse(BaseModel):
#     access_token: str
#     refresh_token: str
#     user: "ProfileOut"


# class MeResponse(BaseModel):
#     id: str
#     email: str
#     full_name: str
#     role: UserRole


# # ---------- USERS / PROFILES ----------
# class ProfileOut(BaseModel):
#     id: str
#     full_name: str
#     email: str
#     role: UserRole
#     avatar_url: Optional[str] = None
#     created_at: Optional[datetime] = None


# class UserCreate(BaseModel):
#     email: EmailStr
#     password: str = Field(min_length=8, max_length=72)
#     full_name: str = Field(min_length=1, max_length=120)
#     role: UserRole = UserRole.team_member

#     @field_validator("full_name")
#     @classmethod
#     def strip_and_check_name(cls, v: str) -> str:
#         v = v.strip()
#         if not v:
#             raise ValueError("full_name cannot be blank")
#         return v


# class UserUpdate(BaseModel):
#     full_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
#     role: Optional[UserRole] = None
#     avatar_url: Optional[str] = Field(default=None, max_length=2048)


# class UserSelfUpdate(BaseModel):
#     """
#     What a user can change about THEIR OWN profile. Deliberately excludes
#     `role` — a user must never be able to promote themselves. Admins still
#     use UserUpdate (via /users/{id}) for role changes.
#     """
#     full_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
#     avatar_url: Optional[str] = Field(default=None, max_length=2048)


# # ---------- PROJECTS ----------
# class ProjectCreate(BaseModel):
#     name: str = Field(min_length=1, max_length=200)
#     description: Optional[str] = Field(default=None, max_length=5000)
#     start_date: Optional[date] = None
#     end_date: Optional[date] = None
#     priority: ProjectPriority = ProjectPriority.medium
#     status: ProjectStatus = ProjectStatus.not_started
#     project_manager_id: Optional[str] = None

#     @field_validator("name")
#     @classmethod
#     def name_not_blank(cls, v: str) -> str:
#         v = v.strip()
#         if not v:
#             raise ValueError("name cannot be blank")
#         return v

#     @model_validator(mode="after")
#     def check_date_order(self):
#         if self.start_date and self.end_date and self.end_date < self.start_date:
#             raise ValueError("end_date cannot be before start_date")
#         return self


# class ProjectUpdate(BaseModel):
#     name: Optional[str] = Field(default=None, min_length=1, max_length=200)
#     description: Optional[str] = Field(default=None, max_length=5000)
#     start_date: Optional[date] = None
#     end_date: Optional[date] = None
#     priority: Optional[ProjectPriority] = None
#     status: Optional[ProjectStatus] = None
#     project_manager_id: Optional[str] = None

#     @model_validator(mode="after")
#     def check_date_order(self):
#         if self.start_date and self.end_date and self.end_date < self.start_date:
#             raise ValueError("end_date cannot be before start_date")
#         return self


# class ProjectOut(BaseModel):
#     id: str
#     name: str
#     description: Optional[str] = None
#     start_date: Optional[date] = None
#     end_date: Optional[date] = None
#     priority: ProjectPriority
#     status: ProjectStatus
#     project_manager_id: Optional[str] = None
#     created_by: str
#     created_at: datetime
#     updated_at: datetime


# class ProjectMemberAdd(BaseModel):
#     member_id: str = Field(min_length=1)


# class ProjectMemberOut(BaseModel):
#     id: str
#     project_id: str
#     member_id: str
#     added_at: datetime


# # ---------- TASKS ----------
# class TaskCreate(BaseModel):
#     title: str = Field(min_length=1, max_length=200)
#     description: Optional[str] = Field(default=None, max_length=5000)
#     assigned_to: Optional[str] = None
#     priority: TaskPriority = TaskPriority.medium
#     due_date: Optional[date] = None
#     status: TaskStatus = TaskStatus.todo

#     @field_validator("title")
#     @classmethod
#     def title_not_blank(cls, v: str) -> str:
#         v = v.strip()
#         if not v:
#             raise ValueError("title cannot be blank")
#         return v


# class TaskUpdate(BaseModel):
#     title: Optional[str] = Field(default=None, min_length=1, max_length=200)
#     description: Optional[str] = Field(default=None, max_length=5000)
#     assigned_to: Optional[str] = None
#     priority: Optional[TaskPriority] = None
#     due_date: Optional[date] = None
#     status: Optional[TaskStatus] = None


# class TaskStatusUpdate(BaseModel):
#     status: TaskStatus


# class TaskOut(BaseModel):
#     id: str
#     project_id: str
#     title: str
#     description: Optional[str] = None
#     assigned_to: Optional[str] = None
#     priority: TaskPriority
#     due_date: Optional[date] = None
#     status: TaskStatus
#     created_by: str
#     created_at: datetime
#     updated_at: datetime


# # ---------- TASK DISCUSSIONS ----------
# class DiscussionCreate(BaseModel):
#     message: str = Field(min_length=1, max_length=3000)

#     @field_validator("message")
#     @classmethod
#     def message_not_blank(cls, v: str) -> str:
#         v = v.strip()
#         if not v:
#             raise ValueError("message cannot be blank")
#         return v


# class DiscussionOut(BaseModel):
#     id: str
#     task_id: str
#     user_id: str
#     message: str
#     created_at: datetime


# # ---------- NOTIFICATIONS ----------
# class NotificationOut(BaseModel):
#     id: str
#     user_id: str
#     type: NotificationType
#     message: str
#     related_project_id: Optional[str] = None
#     related_task_id: Optional[str] = None
#     is_read: bool
#     created_at: datetime


# # ---------- DASHBOARDS ----------
# class AdminDashboard(BaseModel):
#     total_projects: int
#     total_users: int
#     projects_by_status: dict
#     total_tasks: int
#     tasks_by_status: dict


# class PMDashboard(BaseModel):
#     assigned_projects: int
#     pending_tasks: int
#     completed_tasks: int
#     upcoming_deadlines: list[TaskOut]


# class MemberDashboard(BaseModel):
#     assigned_tasks: int
#     pending_tasks: int
#     completed_tasks: int
#     upcoming_deadlines: list[TaskOut]

from datetime import date, datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


# ---------- ENUMS ----------
# Real enums (not just str) so FastAPI/Pydantic reject an invalid value with a
# clean 422 before it ever reaches Supabase — the DB enum constraint (schema.sql)
# is the backstop, this is the first line of defense with a readable error.
class UserRole(str, Enum):
    admin = "admin"
    project_manager = "project_manager"
    team_member = "team_member"


class ProjectPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ProjectStatus(str, Enum):
    not_started = "not_started"
    active = "active"
    on_hold = "on_hold"
    completed = "completed"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    review = "review"
    completed = "completed"


class NotificationType(str, Enum):
    task_assigned = "task_assigned"
    status_updated = "status_updated"
    new_discussion = "new_discussion"
    deadline_approaching = "deadline_approaching"


# ---------- AUTH ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: "ProfileOut"


class MeResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole


# ---------- USERS / PROFILES ----------
class ProfileOut(BaseModel):
    id: str
    full_name: str
    email: str
    role: UserRole
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None


class PublicProfileOut(BaseModel):
    """
    Minimal, non-admin-only view of another user — just enough for the
    frontend to render a name/avatar next to a task, discussion message,
    or project manager field. No email, no created_at.
    """
    id: str
    full_name: str
    role: UserRole
    avatar_url: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    full_name: str = Field(min_length=1, max_length=120)
    role: UserRole = UserRole.team_member

    @field_validator("full_name")
    @classmethod
    def strip_and_check_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("full_name cannot be blank")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    role: Optional[UserRole] = None
    avatar_url: Optional[str] = Field(default=None, max_length=2048)


class UserSelfUpdate(BaseModel):
    """
    What a user can change about THEIR OWN profile. Deliberately excludes
    `role` — a user must never be able to promote themselves. Admins still
    use UserUpdate (via /users/{id}) for role changes.
    """
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    avatar_url: Optional[str] = Field(default=None, max_length=2048)


# ---------- PROJECTS ----------
class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=5000)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    priority: ProjectPriority = ProjectPriority.medium
    status: ProjectStatus = ProjectStatus.not_started
    project_manager_id: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name cannot be blank")
        return v

    @model_validator(mode="after")
    def check_date_order(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date cannot be before start_date")
        return self


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=5000)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    priority: Optional[ProjectPriority] = None
    status: Optional[ProjectStatus] = None
    project_manager_id: Optional[str] = None

    @model_validator(mode="after")
    def check_date_order(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date cannot be before start_date")
        return self


class ProjectOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    priority: ProjectPriority
    status: ProjectStatus
    project_manager_id: Optional[str] = None
    created_by: str
    created_at: datetime
    updated_at: datetime


class ProjectMemberAdd(BaseModel):
    member_id: str = Field(min_length=1)


class ProjectMemberOut(BaseModel):
    id: str
    project_id: str
    member_id: str
    added_at: datetime


# ---------- TASKS ----------
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=5000)
    assigned_to: Optional[str] = None
    priority: TaskPriority = TaskPriority.medium
    due_date: Optional[date] = None
    status: TaskStatus = TaskStatus.todo

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("title cannot be blank")
        return v


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=5000)
    assigned_to: Optional[str] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[date] = None
    status: Optional[TaskStatus] = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskOut(BaseModel):
    id: str
    project_id: str
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: TaskPriority
    due_date: Optional[date] = None
    status: TaskStatus
    created_by: str
    created_at: datetime
    updated_at: datetime


# ---------- TASK DISCUSSIONS ----------
class DiscussionCreate(BaseModel):
    message: str = Field(min_length=1, max_length=3000)

    @field_validator("message")
    @classmethod
    def message_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("message cannot be blank")
        return v


class DiscussionOut(BaseModel):
    id: str
    task_id: str
    user_id: str
    message: str
    created_at: datetime


# ---------- NOTIFICATIONS ----------
class NotificationOut(BaseModel):
    id: str
    user_id: str
    type: NotificationType
    message: str
    related_project_id: Optional[str] = None
    related_task_id: Optional[str] = None
    is_read: bool
    created_at: datetime


# ---------- DASHBOARDS ----------
class AdminDashboard(BaseModel):
    total_projects: int
    total_users: int
    projects_by_status: dict
    total_tasks: int
    tasks_by_status: dict


class PMDashboard(BaseModel):
    assigned_projects: int
    pending_tasks: int
    completed_tasks: int
    upcoming_deadlines: list[TaskOut]


class MemberDashboard(BaseModel):
    assigned_tasks: int
    pending_tasks: int
    completed_tasks: int
    upcoming_deadlines: list[TaskOut]