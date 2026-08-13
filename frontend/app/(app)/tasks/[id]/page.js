"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/ui/Spinner";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { PriorityBadge, TaskStatusBadge } from "@/components/ui/StatusBadges";
import { tasksService } from "@/services/tasks.service";
import { discussionsService } from "@/services/discussions.service";
import { projectsService } from "@/services/projects.service";
import { usersService } from "@/services/users.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/constants/statuses";
import { formatDate, formatRelative } from "@/lib/format";
import { ROLES } from "@/constants/roles";

export default function TaskDetailPage({ params }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [namesById, setNamesById] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const canManage = user.role === ROLES.ADMIN || user.role === ROLES.PROJECT_MANAGER;
  const isMyTask = task?.assigned_to === user.id;

  const load = async () => {
    setIsLoading(true);
    try {
      const taskData = await tasksService.get(id);
      const [projectData, discussionsData] = await Promise.all([
        projectsService.get(taskData.project_id),
        discussionsService.listForTask(id),
      ]);
      setTask(taskData);
      setProject(projectData);
      setDiscussions(discussionsData);

      // Resolve every user referenced on this page (assignee, task
      // creator, discussion authors) via the public per-user lookup —
      // works for every role, not just admins.
      const idsToResolve = new Set([
        taskData.assigned_to,
        taskData.created_by,
        ...discussionsData.map((d) => d.user_id),
      ].filter(Boolean));

      const resolved = await Promise.all(
        [...idsToResolve].map((uid) =>
          uid === user.id
            ? Promise.resolve({ id: uid, full_name: user.full_name })
            : usersService.getPublic(uid).catch(() => ({ id: uid, full_name: "Team member" }))
        )
      );
      setNamesById(Object.fromEntries(resolved.map((u) => [u.id, u.full_name])));
    } catch (err) {
      toast({ title: "Couldn't load task", description: err.message, variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const nameFor = (userId) => namesById[userId] || (userId === user.id ? user.full_name : "Team member");

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setSavingStatus(true);
    try {
      const updated = isMyTask
        ? await tasksService.updateStatus(id, status)
        : await tasksService.update(id, { status });
      setTask(updated);
      toast({ title: "Status updated", variant: "success" });
    } catch (err) {
      toast({ title: "Couldn't update status", description: err.message, variant: "error" });
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await tasksService.remove(id);
      toast({ title: "Task deleted", variant: "success" });
      router.back();
    } catch (err) {
      toast({ title: "Couldn't delete task", description: err.message, variant: "error" });
    }
  };

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsPosting(true);
    try {
      const posted = await discussionsService.post(id, message.trim());
      setDiscussions((d) => [...d, posted]);
      setMessage("");
    } catch (err) {
      toast({ title: "Couldn't post message", description: err.message, variant: "error" });
    } finally {
      setIsPosting(false);
    }
  };

  if (isLoading || !task) return <PageLoading />;

  const canUpdateStatus = canManage || isMyTask;

  return (
    <div>
      <PageHeader
        eyebrow={project ? `${project.name} / Task` : "Task"}
        title={task.title}
        description={task.description}
        actions={
          canManage && (
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )
        }
      />
      <div className="grid gap-4 px-6 py-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><p className="text-sm font-medium text-ink">Discussion</p></CardHeader>
            <CardBody className="space-y-4">
              {discussions.length === 0 && (
                <p className="text-sm text-ink-faint">No messages yet — start the conversation below.</p>
              )}
              {discussions.map((d) => (
                <div key={d.id} className="flex gap-3">
                  <Avatar name={nameFor(d.user_id)} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-medium text-ink">{nameFor(d.user_id)}</p>
                      <p className="eyebrow">{formatRelative(d.created_at)}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-ink-muted">{d.message}</p>
                  </div>
                </div>
              ))}

              <form onSubmit={handlePostMessage} className="flex gap-2 border-t border-border pt-4">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message…"
                  className="min-h-[44px] flex-1"
                />
                <Button type="submit" isLoading={isPosting} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><p className="text-sm font-medium text-ink">Details</p></CardHeader>
            <CardBody className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Status</span>
                {canUpdateStatus ? (
                  <Select value={task.status} onChange={handleStatusChange} disabled={savingStatus} className="h-8 w-36 text-xs">
                    {TASK_STATUSES.map((s) => <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
                  </Select>
                ) : (
                  <TaskStatusBadge status={task.status} />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Priority</span>
                <PriorityBadge priority={task.priority} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Due date</span>
                <span className="text-ink">{formatDate(task.due_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Assignee</span>
                <span className="text-ink">{task.assigned_to ? nameFor(task.assigned_to) : "Unassigned"}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}