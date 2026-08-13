import { Badge } from "@/components/ui/Badge";
import { PRIORITY_LABELS, PRIORITY_STYLES } from "@/constants/priorities";
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_STYLES,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_STYLES,
} from "@/constants/statuses";

export function PriorityBadge({ priority, className }) {
  return (
    <Badge className={`${PRIORITY_STYLES[priority]} ${className || ""}`}>
      {PRIORITY_LABELS[priority] || priority}
    </Badge>
  );
}

export function TaskStatusBadge({ status, className }) {
  return (
    <Badge className={`${TASK_STATUS_STYLES[status]} ${className || ""}`}>
      {TASK_STATUS_LABELS[status] || status}
    </Badge>
  );
}

export function ProjectStatusBadge({ status, className }) {
  return (
    <Badge className={`${PROJECT_STATUS_STYLES[status]} ${className || ""}`}>
      {PROJECT_STATUS_LABELS[status] || status}
    </Badge>
  );
}
