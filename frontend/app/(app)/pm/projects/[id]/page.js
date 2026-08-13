"use client";

import { useEffect, useState, use } from "react";
import { Plus, UserPlus, X, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { ProjectStatusBadge, PriorityBadge } from "@/components/ui/StatusBadges";
import { TaskRow } from "@/components/domain/TaskRow";
import { CreateTaskDialog } from "@/components/domain/CreateTaskDialog";
import { AddMemberDialog } from "@/components/domain/AddMemberDialog";
import { projectsService } from "@/services/projects.service";
import { tasksService } from "@/services/tasks.service";
import { usersService } from "@/services/users.service";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/constants/statuses";
import { ROLES } from "@/constants/roles";
import { useToast } from "@/hooks/use-toast";

export default function PmProjectDetailPage({ params }) {
  const { id } = use(params);
  const { toast } = useToast();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allTeamMembers, setAllTeamMembers] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [description, setDescription] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      const [projectData, membersData, tasksData, teamMembers] = await Promise.all([
        projectsService.get(id),
        projectsService.listMembers(id),
        tasksService.listForProject(id),
        usersService.list({ role: ROLES.TEAM_MEMBER }),
      ]);
      setProject(projectData);
      setDescription(projectData.description || "");
      setMembers(membersData);
      setTasks(tasksData);
      setAllTeamMembers(teamMembers);
      setUsersById(Object.fromEntries(teamMembers.map((u) => [u.id, u])));
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

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setSavingStatus(true);
    try {
      const updated = await projectsService.update(id, { status });
      setProject(updated);
      toast({ title: "Status updated", variant: "success" });
    } catch (err) {
      toast({ title: "Couldn't update status", description: err.message, variant: "error" });
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDescriptionBlur = async () => {
    if (description === project.description) return;
    try {
      const updated = await projectsService.update(id, { description });
      setProject(updated);
      toast({ title: "Description saved", variant: "success" });
    } catch (err) {
      toast({ title: "Couldn't save description", description: err.message, variant: "error" });
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await projectsService.removeMember(id, memberId);
      setMembers((m) => m.filter((x) => x.member_id !== memberId));
      toast({ title: "Member removed", variant: "success" });
    } catch (err) {
      toast({ title: "Couldn't remove member", description: err.message, variant: "error" });
    }
  };

  if (isLoading || !project) return <PageLoading />;

  const memberIds = new Set(members.map((m) => m.member_id));
  const candidates = allTeamMembers.filter((u) => !memberIds.has(u.id));

  return (
    <div>
      <PageHeader
        eyebrow="My Projects"
        title={project.name}
        actions={
          <Select value={project.status} onChange={handleStatusChange} disabled={savingStatus} className="w-40">
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>)}
          </Select>
        }
      />
      <div className="grid gap-4 px-6 py-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><p className="text-sm font-medium text-ink">Description</p></CardHeader>
            <CardBody>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="What's this project about?"
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Tasks ({tasks.length})</p>
              <Button size="sm" onClick={() => setTaskDialogOpen(true)}><Plus className="h-3.5 w-3.5" /> New task</Button>
            </CardHeader>
            {tasks.length === 0 ? (
              <CardBody>
                <EmptyState
                  icon={ListChecks}
                  title="No tasks yet"
                  description="Create the first task and assign it to a team member."
                  action={<Button size="sm" onClick={() => setTaskDialogOpen(true)}><Plus className="h-3.5 w-3.5" /> New task</Button>}
                />
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
                <span className="text-ink-muted">Priority</span>
                <PriorityBadge priority={project.priority} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Status</span>
                <ProjectStatusBadge status={project.status} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Team ({members.length})</p>
              <Button size="sm" variant="secondary" onClick={() => setMemberDialogOpen(true)}>
                <UserPlus className="h-3.5 w-3.5" /> Add
              </Button>
            </CardHeader>
            <CardBody className="space-y-3">
              {members.length === 0 && <p className="text-sm text-ink-faint">No members added yet.</p>}
              {members.map((m) => {
                const u = usersById[m.member_id];
                return (
                  <div key={m.id} className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u?.full_name} size="sm" />
                      <p className="text-sm text-ink">{u?.full_name || "Unknown user"}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(m.member_id)}
                      className="rounded-md p-1 text-ink-faint hover:bg-danger-bg hover:text-danger"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
      </div>

      <CreateTaskDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        onCreated={load}
        projectId={id}
        members={members.map((m) => usersById[m.member_id]).filter(Boolean)}
      />
      <AddMemberDialog
        open={memberDialogOpen}
        onClose={() => setMemberDialogOpen(false)}
        onAdded={load}
        projectId={id}
        candidates={candidates}
      />
    </div>
  );
}
