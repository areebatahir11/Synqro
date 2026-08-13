"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ProjectStatusBadge, PriorityBadge } from "@/components/ui/StatusBadges";
import { TaskRow } from "@/components/domain/TaskRow";
import { projectsService } from "@/services/projects.service";
import { tasksService } from "@/services/tasks.service";
import { usersService } from "@/services/users.service";
import { formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

export default function AdminProjectDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const [projectData, membersData, tasksData, usersData] = await Promise.all([
        projectsService.get(id),
        projectsService.listMembers(id),
        tasksService.listForProject(id),
        usersService.list(),
      ]);
      setProject(projectData);
      setMembers(membersData);
      setTasks(tasksData);
      setUsersById(Object.fromEntries(usersData.map((u) => [u.id, u])));
    } catch (err) {
      toast({ title: "Couldn't load project", description: err.message, variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Delete "${project.name}"? This also deletes its tasks and discussions.`)) return;
    try {
      await projectsService.remove(id);
      toast({ title: "Project deleted", variant: "success" });
      router.push("/admin/projects");
    } catch (err) {
      toast({ title: "Couldn't delete project", description: err.message, variant: "error" });
    }
  };

  if (isLoading || !project) return <PageLoading />;

  const pm = project.project_manager_id ? usersById[project.project_manager_id] : null;

  return (
    <div>
      <PageHeader
        eyebrow="Admin / Projects"
        title={project.name}
        description={project.description}
        actions={
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        }
      />
      <div className="grid gap-4 px-6 py-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><p className="text-sm font-medium text-ink">Tasks ({tasks.length})</p></CardHeader>
            {tasks.length === 0 ? (
              <CardBody>
                <EmptyState icon={ListChecks} title="No tasks yet" description="Tasks will appear here once the project manager creates them." />
              </CardBody>
            ) : (
              <div>
                {tasks.map((t) => (
                  <TaskRow key={t.id} task={t} assigneeName={t.assigned_to ? usersById[t.assigned_to]?.full_name : null} />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><p className="text-sm font-medium text-ink">Details</p></CardHeader>
            <CardBody className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Status</span>
                <ProjectStatusBadge status={project.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Priority</span>
                <PriorityBadge priority={project.priority} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Start date</span>
                <span className="text-ink">{formatDate(project.start_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">End date</span>
                <span className="text-ink">{formatDate(project.end_date)}</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-medium text-ink">Project manager</p></CardHeader>
            <CardBody>
              {pm ? (
                <div className="flex items-center gap-2.5">
                  <Avatar name={pm.full_name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-ink">{pm.full_name}</p>
                    <p className="text-xs text-ink-muted">{pm.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-faint">Not assigned yet.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-medium text-ink">Team members ({members.length})</p></CardHeader>
            <CardBody className="space-y-3">
              {members.length === 0 && <p className="text-sm text-ink-faint">No members added yet.</p>}
              {members.map((m) => {
                const u = usersById[m.member_id];
                return (
                  <div key={m.id} className="flex items-center gap-2.5">
                    <Avatar name={u?.full_name} size="sm" />
                    <p className="text-sm text-ink">{u?.full_name || "Unknown user"}</p>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
