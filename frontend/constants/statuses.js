export const TASK_STATUSES = ["todo", "in_progress", "review", "completed"];

export const TASK_STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
};

export const TASK_STATUS_STYLES = {
  todo: "bg-status-todo/10 text-status-todo border-status-todo/20",
  in_progress: "bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20",
  review: "bg-status-review/10 text-status-review border-status-review/20",
  completed: "bg-status-completed/10 text-status-completed border-status-completed/20",
};

export const PROJECT_STATUSES = ["not_started", "active", "on_hold", "completed"];

export const PROJECT_STATUS_LABELS = {
  not_started: "Not Started",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
};

export const PROJECT_STATUS_STYLES = {
  not_started: "bg-status-todo/10 text-status-todo border-status-todo/20",
  active: "bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20",
  on_hold: "bg-status-review/10 text-status-review border-status-review/20",
  completed: "bg-status-completed/10 text-status-completed border-status-completed/20",
};
