"use client";

import { useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { TaskRow } from "@/components/domain/TaskRow";
import { projectsService } from "@/services/projects.service";
import { tasksService } from "@/services/tasks.service";
import { useAuth } from "@/context/AuthContext";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/constants/statuses";

export default function MemberTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      const projects = await projectsService.list();
      const params = statusFilter ? { status: statusFilter, assigned_to: user.id } : { assigned_to: user.id };
      const allTasks = await Promise.all(
        projects.map((p) => tasksService.listForProject(p.id, params).catch(() => []))
      );
      setTasks(allTasks.flat().sort((a, b) => new Date(a.due_date || "9999") - new Date(b.due_date || "9999")));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <div>
      <PageHeader
        eyebrow="My Tasks"
        title="Your tasks"
        description="Everything assigned to you, across all your projects."
        actions={
          <Select className="w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {TASK_STATUSES.map((s) => <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
          </Select>
        }
      />
      <div className="px-6 py-6">
        {isLoading ? (
          <PageLoading />
        ) : tasks.length === 0 ? (
          <EmptyState icon={ListChecks} title="No tasks here" description="Tasks assigned to you will show up here." />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            {tasks.map((t) => <TaskRow key={t.id} task={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}
