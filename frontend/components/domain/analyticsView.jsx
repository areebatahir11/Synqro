"use client";

import { useEffect, useState } from "react";
import { Activity, TrendingDown, TrendingUp, Users } from "lucide-react";

import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PulseDot } from "@/components/ui/PulseDot";
import { Spinner } from "@/components/ui/Spinner";
import { dashboardService } from "@/services/dashboard.service";

import {
  DeliveryRhythmChart,
  GroupBreakdownBars,
  TimelinessDonut,
} from "./AnalyticsCharts";

function Eyebrow({ children }) {
  return <p className="eyebrow mb-1 text-xs uppercase tracking-wide text-ink-muted">{children}</p>;
}

function SummaryCard({ label, value, sub, tone = "neutral", icon: Icon }) {
  const toneColor = {
    good: "text-[var(--color-pulse-500)]",
    bad: "text-[var(--color-danger)]",
    neutral: "text-ink",
  }[tone];

  return (
    <Card>
      <CardBody className="flex items-start justify-between gap-3">
        <div>
          <Eyebrow>{label}</Eyebrow>
          <p className={`font-display text-3xl font-semibold ${toneColor}`}>{value}</p>
          {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
        </div>
        {Icon && <Icon className={`h-5 w-5 ${toneColor}`} />}
      </CardBody>
    </Card>
  );
}

function formatAvgDays(avg) {
  if (avg === null || avg === undefined) return { text: "—", sub: "Not enough data yet", tone: "neutral" };
  if (avg === 0) return { text: "On the day", sub: "Average finish is right on the deadline", tone: "good" };
  const days = Math.abs(avg);
  const rounded = Number.isInteger(days) ? days : days.toFixed(1);
  return avg < 0
    ? { text: `${rounded}d early`, sub: "Average time ahead of deadline", tone: "good" }
    : { text: `${rounded}d late`, sub: "Average time past deadline", tone: "bad" };
}

export function AnalyticsView({ role }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | error | ready

  useEffect(() => {
    let cancelled = false;
    const fetcher = role === "pm" ? dashboardService.pmAnalytics : dashboardService.memberAnalytics;

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [role]);

  if (status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status === "error") {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={Activity}
            title="Couldn't load analytics"
            description="Something went wrong fetching your delivery data. Try refreshing the page."
          />
        </CardBody>
      </Card>
    );
  }

  const { overall, on_time_rate, avg_completion_days, trend, by_project, by_member } = data;
  const totalTracked = overall.on_time + overall.late + overall.never_completed + overall.no_deadline;
  const avgDaysDisplay = formatAvgDays(avg_completion_days);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <PulseDot />
        <div>
          <Eyebrow>Performance</Eyebrow>
          <h1 className="font-display text-2xl font-semibold text-ink">Delivery Pulse</h1>
        </div>
      </div>

      {totalTracked === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={Activity}
              title="Nothing tracked yet"
              description={
                role === "pm"
                  ? "Once tasks across your projects start getting completed, delivery trends will show up here."
                  : "Once you complete a few tasks, your delivery trends will show up here."
              }
            />
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="On-time rate"
              value={`${on_time_rate}%`}
              sub={`${overall.on_time} of ${overall.on_time + overall.late} finished tasks`}
              tone={on_time_rate >= 70 ? "good" : on_time_rate >= 40 ? "neutral" : "bad"}
              icon={on_time_rate >= 70 ? TrendingUp : TrendingDown}
            />
            <SummaryCard
              label="Avg. finish vs deadline"
              value={avgDaysDisplay.text}
              sub={avgDaysDisplay.sub}
              tone={avgDaysDisplay.tone}
              icon={Activity}
            />
            <SummaryCard
              label="Never completed"
              value={overall.never_completed}
              sub="Past due, still open"
              tone={overall.never_completed > 0 ? "bad" : "good"}
            />
            <SummaryCard
              label="Tracked tasks"
              value={totalTracked}
              sub="With a due date or a completion"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <p className="text-sm font-medium text-ink">Delivery rhythm</p>
                <span className="text-xs text-ink-muted">Last 6 months</span>
              </CardHeader>
              <CardBody>
                <DeliveryRhythmChart trend={trend} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <p className="text-sm font-medium text-ink">Timeliness breakdown</p>
              </CardHeader>
              <CardBody>
                <TimelinessDonut overall={overall} />
              </CardBody>
            </Card>
          </div>

          <div className={`grid gap-4 ${role === "pm" ? "lg:grid-cols-2" : ""}`}>
            <Card>
              <CardHeader>
                <p className="text-sm font-medium text-ink">By project</p>
              </CardHeader>
              <CardBody>
                <GroupBreakdownBars groups={by_project} emptyLabel="No project data yet." />
              </CardBody>
            </Card>

            {role === "pm" && (
              <Card>
                <CardHeader className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-ink-muted" />
                  <p className="text-sm font-medium text-ink">By team member</p>
                </CardHeader>
                <CardBody>
                  <GroupBreakdownBars groups={by_member} emptyLabel="No team data yet." />
                </CardBody>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}