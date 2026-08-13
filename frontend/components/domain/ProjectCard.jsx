import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { ProjectStatusBadge, PriorityBadge } from "@/components/ui/StatusBadges";
import { formatDate } from "@/lib/format";

export function ProjectCard({ project, href }) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-popover">
        <CardBody className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-base font-semibold text-ink">{project.name}</p>
            <ProjectStatusBadge status={project.status} />
          </div>
          {project.description && (
            <p className="line-clamp-2 text-sm text-ink-muted">{project.description}</p>
          )}
          <div className="flex items-center justify-between pt-1">
            <PriorityBadge priority={project.priority} />
            <p className="eyebrow">
              {project.end_date ? `Due ${formatDate(project.end_date)}` : "No due date"}
            </p>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
