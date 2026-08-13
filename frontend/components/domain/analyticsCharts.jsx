"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MONTH_LABEL = (period) => {
  const [year, month] = period.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
    month: "short",
  });
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-mono text-ink-muted">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-ink">
          <span className="font-mono">{Math.abs(entry.value)}</span>{" "}
          {entry.dataKey === "onTime" ? "on time" : "late"}
        </p>
      ))}
    </div>
  );
}

/**
 * Signature visual — "Delivery Pulse".
 * On-time completions rise above the baseline in the brand's pulse color,
 * late completions drop below it in danger red — read at a glance like a
 * heartbeat monitor for the team's delivery health, deliberately echoing
 * the PulseDot live-status motif used elsewhere in the product.
 */
export function DeliveryRhythmChart({ trend }) {
  const data = trend.map((point) => ({
    period: MONTH_LABEL(point.period),
    onTime: point.on_time,
    late: -point.late,
  }));

  const hasData = trend.some((p) => p.on_time > 0 || p.late > 0);

  if (!hasData) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-ink-muted">
        No completed tasks in this window yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barCategoryGap={18}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #2a2a2a)" vertical={false} />
        <XAxis
          dataKey="period"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }}
        />
        <YAxis hide />
        <ReferenceLine y={0} stroke="var(--color-ink-muted)" strokeOpacity={0.5} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-canvas)" }} />
        <Bar dataKey="onTime" fill="var(--color-pulse-500)" radius={[3, 3, 0, 0]} maxBarSize={26} />
        <Bar dataKey="late" fill="var(--color-danger)" radius={[0, 0, 3, 3]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const TIMELINESS_COLORS = {
  on_time: "var(--color-pulse-500)",
  late: "var(--color-danger)",
  never_completed: "var(--color-status-review, #b45309)",
  no_deadline: "var(--color-ink-muted)",
};

const TIMELINESS_LABELS = {
  on_time: "On time",
  late: "Late",
  never_completed: "Never done",
  no_deadline: "No deadline",
};

export function TimelinessDonut({ overall }) {
  const data = Object.entries(overall)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({ key, value, label: TIMELINESS_LABELS[key] }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-ink-muted">
        Nothing tracked yet.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={TIMELINESS_COLORS[entry.key]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {data.map((entry) => (
          <div key={entry.key} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: TIMELINESS_COLORS[entry.key] }}
            />
            <span className="text-ink-muted">{entry.label}</span>
            <span className="font-mono text-ink">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GroupBreakdownBars({ groups, emptyLabel }) {
  if (!groups?.length) {
    return <p className="text-sm text-ink-muted">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.id}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-ink">{group.label}</span>
            <span className="font-mono text-ink-muted">
              {group.completion_rate}% · {group.total} tasks
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
            <div
              className="h-full rounded-full"
              style={{
                width: `${group.completion_rate}%`,
                background:
                  group.completion_rate >= 80
                    ? "var(--color-pulse-500)"
                    : group.completion_rate >= 50
                      ? "var(--color-signal-500)"
                      : "var(--color-danger)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}