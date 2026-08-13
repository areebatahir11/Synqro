"use client";

import { useEffect, useState } from "react";
import { FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardBody } from "@/components/ui/Card";
import { ProjectStatusBadge, PriorityBadge } from "@/components/ui/StatusBadges";
import { projectsService } from "@/services/projects.service";
import { formatDate } from "@/lib/format";

export default function MemberProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    projectsService.list().then(setProjects).finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <PageHeader eyebrow="My Projects" title="Your projects" description="Projects you've been added to." />
      <div className="px-6 py-6">
        {isLoading ? (
          <PageLoading />
        ) : projects.length === 0 ? (
          <EmptyState icon={FolderKanban} title="No projects yet" description="Once you're added to a project, it'll show up here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Card key={p.id}>
                <CardBody className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-base font-semibold text-ink">{p.name}</p>
                    <ProjectStatusBadge status={p.status} />
                  </div>
                  {p.description && <p className="line-clamp-2 text-sm text-ink-muted">{p.description}</p>}
                  <div className="flex items-center justify-between pt-1">
                    <PriorityBadge priority={p.priority} />
                    <p className="eyebrow">{p.end_date ? `Due ${formatDate(p.end_date)}` : "No due date"}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
