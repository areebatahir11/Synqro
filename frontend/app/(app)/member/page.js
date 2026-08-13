"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/ui/Spinner";
import { StatCard } from "@/components/domain/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TaskRow } from "@/components/domain/TaskRow";
import { dashboardService } from "@/services/dashboard.service";

export default function MemberDashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService.member().then(setData).finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <PageHeader eyebrow="Overview" title="Your dashboard" description="Your tasks and what's coming up." />
      <div className="px-6 py-6">
        {isLoading ? (
          <PageLoading />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Assigned tasks" value={data.assigned_tasks} />
              <StatCard label="Pending" value={data.pending_tasks} />
              <StatCard label="Completed" value={data.completed_tasks} />
            </div>

            <Card>
              <CardHeader><p className="text-sm font-medium text-ink">Upcoming deadlines</p></CardHeader>
              {data.upcoming_deadlines.length === 0 ? (
                <div className="p-5">
                  <EmptyState icon={CalendarClock} title="Nothing due soon" description="Tasks due within the next 7 days will show up here." />
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
