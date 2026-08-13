"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/ui/Spinner";
import { StatCard } from "@/components/domain/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TaskRow } from "@/components/domain/TaskRow";
import { dashboardService } from "@/services/dashboard.service";
import { CalendarClock } from "lucide-react";

export default function PmDashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService.pm().then(setData).finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <PageHeader eyebrow="Overview" title="Your dashboard" description="Progress across your assigned projects." />
      <div className="px-6 py-6">
        {isLoading ? (
          <PageLoading />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Assigned projects" value={data.assigned_projects} />
              <StatCard label="Pending tasks" value={data.pending_tasks} />
              <StatCard label="Completed tasks" value={data.completed_tasks} />
            </div>

            <Card>
              <CardHeader><p className="text-sm font-medium text-ink">Upcoming deadlines</p></CardHeader>
              {data.upcoming_deadlines.length === 0 ? (
                <div className="p-5">
                  <EmptyState icon={CalendarClock} title="No upcoming deadlines" description="Tasks due within the next 7 days will show up here." />
                </div>
              ) : (
                <div>
                  {data.upcoming_deadlines.map((t) => (
                    <TaskRow key={t.id} task={t} />
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
