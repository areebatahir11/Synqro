"use client";

import { useEffect, useState } from "react";
import { Plus, Search, FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ProjectCard } from "@/components/domain/ProjectCard";
import { CreateProjectDialog } from "@/components/domain/CreateProjectDialog";
import { projectsService } from "@/services/projects.service";
import { usersService } from "@/services/users.service";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/constants/statuses";
import { ROLES } from "@/constants/roles";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadProjects = () => {
    setIsLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    projectsService.list(params).then(setProjects).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(loadProjects, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  useEffect(() => {
    usersService.list({ role: ROLES.PROJECT_MANAGER }).then(setProjectManagers);
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Admin / Projects"
        title="Projects"
        description="Create projects and assign a project manager."
        actions={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> New project</Button>}
      />
      <div className="px-6 py-6">
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <Input placeholder="Search projects…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select className="w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>)}
          </Select>
        </div>

        {isLoading ? (
          <PageLoading />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project and assign a project manager to it."
            action={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> New project</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} href={`/admin/projects/${p.id}`} />
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={loadProjects}
        projectManagers={projectManagers}
      />
    </div>
  );
}
