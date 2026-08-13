import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { PriorityBadge, TaskStatusBadge } from "@/components/ui/StatusBadges";
import { formatDate } from "@/lib/format";

export function TaskRow({ task, assigneeName }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0 hover:bg-canvas"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{task.title}</p>
        <p className="eyebrow mt-0.5">
          {task.due_date ? `Due ${formatDate(task.due_date)}` : "No due date"}
        </p>
      </div>
      <PriorityBadge priority={task.priority} />
      <TaskStatusBadge status={task.status} />
      {assigneeName ? (
        <Avatar name={assigneeName} size="sm" />
      ) : (
        <span className="eyebrow w-9 text-center">—</span>
      )}
    </Link>
  );
}
