"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/ui/Spinner";
import { StatCard } from "@/components/domain/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { dashboardService } from "@/services/dashboard.service";
import { PROJECT_STATUS_LABELS } from "@/constants/statuses";
import { TASK_STATUS_LABELS } from "@/constants/statuses";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService.admin().then(setData).finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <PageHeader eyebrow="Overview" title="Admin dashboard" description="Everything happening across the organization." />
      <div className="px-6 py-6">
        {isLoading ? (
          <PageLoading />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Total projects" value={data.total_projects} />
              <StatCard label="Total users" value={data.total_users} />
              <StatCard label="Total tasks" value={data.total_tasks} />
              <StatCard label="Active projects" value={data.projects_by_status?.active || 0} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader><p className="text-sm font-medium text-ink">Projects by status</p></CardHeader>
                <CardBody className="space-y-2">
                  {Object.entries(data.projects_by_status || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted">{PROJECT_STATUS_LABELS[status] || status}</span>
                      <span className="font-medium text-ink">{count}</span>
                    </div>
                  ))}
                  {Object.keys(data.projects_by_status || {}).length === 0 && (
                    <p className="text-sm text-ink-faint">No projects yet.</p>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader><p className="text-sm font-medium text-ink">Tasks by status</p></CardHeader>
                <CardBody className="space-y-2">
                  {Object.entries(data.tasks_by_status || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted">{TASK_STATUS_LABELS[status] || status}</span>
                      <span className="font-medium text-ink">{count}</span>
                    </div>
                  ))}
                  {Object.keys(data.tasks_by_status || {}).length === 0 && (
                    <p className="text-sm text-ink-faint">No tasks yet.</p>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
