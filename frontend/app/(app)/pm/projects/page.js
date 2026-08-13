"use client";

import { useEffect, useState } from "react";
import { FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectCard } from "@/components/domain/ProjectCard";
import { projectsService } from "@/services/projects.service";

export default function PmProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    projectsService.list().then(setProjects).finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <PageHeader eyebrow="My Projects" title="Assigned to you" description="Projects your admin has assigned you to manage." />
      <div className="px-6 py-6">
        {isLoading ? (
          <PageLoading />
        ) : projects.length === 0 ? (
          <EmptyState icon={FolderKanban} title="No projects assigned yet" description="Once your admin assigns you a project, it'll show up here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} href={`/pm/projects/${p.id}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
