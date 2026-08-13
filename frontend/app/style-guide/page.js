"use client";

import { useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PulseDot } from "@/components/ui/PulseDot";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PriorityBadge, TaskStatusBadge, ProjectStatusBadge } from "@/components/ui/StatusBadges";
import { Dialog } from "@/components/ui/Dialog";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/use-toast";
import { PRIORITIES } from "@/constants/priorities";
import { TASK_STATUSES, PROJECT_STATUSES } from "@/constants/statuses";

function Section({ eyebrow, title, children }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, varName }) {
  return (
    <div className="space-y-1.5">
      <div className="h-14 w-full rounded-md border border-border" style={{ background: `var(${varName})` }} />
      <p className="text-xs font-medium text-ink">{name}</p>
      <p className="font-mono text-[11px] text-ink-faint">{varName}</p>
    </div>
  );
}

export default function StyleGuidePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState("overview");
  const { toast } = useToast();

  return (
    <div className="mx-auto max-w-5xl space-y-14 px-6 py-10">
      <header className="space-y-2">
        <Logo />
        <p className="eyebrow">Design System / v1</p>
        <h1 className="font-display text-2xl font-semibold text-ink">Synqro Style Guide</h1>
        <p className="max-w-xl text-sm text-ink-muted">
          A live reference for every design token and component used across the Admin,
          Project Manager, and Team Member portals.
        </p>
      </header>

      <Section eyebrow="Foundation / 01" title="Color">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
          <Swatch name="Canvas" varName="--color-canvas" />
          <Swatch name="Surface" varName="--color-surface" />
          <Swatch name="Ink" varName="--color-ink" />
          <Swatch name="Signal (brand)" varName="--color-signal-500" />
          <Swatch name="Pulse (accent)" varName="--color-pulse-500" />
          <Swatch name="Danger" varName="--color-danger" />
        </div>
      </Section>

      <Section eyebrow="Foundation / 02" title="Typography">
        <Card>
          <CardBody className="space-y-4">
            <div>
              <p className="eyebrow mb-1">Display — Sora</p>
              <p className="font-display text-2xl font-semibold text-ink">Plan the work, sync the team</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Body — IBM Plex Sans</p>
              <p className="text-sm text-ink">
                Every project, task, and discussion your team needs, in one connected workspace.
              </p>
            </div>
            <div>
              <p className="eyebrow mb-1">Mono — IBM Plex Mono</p>
              <p className="font-mono text-sm text-ink">TASK-042 · due 2026-08-14 · 14:32:07</p>
            </div>
          </CardBody>
        </Card>
      </Section>

      <Section eyebrow="Foundation / 03" title="Signature — Sync Pulse">
        <Card>
          <CardBody className="flex items-center gap-6">
            <Logo showWordmark={false} />
            <div className="flex items-center gap-2">
              <PulseDot />
              <span className="text-sm text-ink-muted">Live status indicator</span>
            </div>
          </CardBody>
        </Card>
      </Section>

      <Section eyebrow="Components / 01" title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary"><Plus className="h-4 w-4" /> Create project</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="primary" isLoading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </Section>

      <Section eyebrow="Components / 02" title="Form fields">
        <Card>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Input label="Project name" placeholder="e.g. Q3 Platform Migration" />
            <Select label="Priority" defaultValue="medium">
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
            <Textarea label="Description" placeholder="What's this project about?" className="sm:col-span-2" />
            <Input label="With an error" defaultValue="oops" error="This field is required." />
          </CardBody>
        </Card>
      </Section>

      <Section eyebrow="Components / 03" title="Badges">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {PRIORITIES.map((p) => <PriorityBadge key={p} priority={p} />)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {TASK_STATUSES.map((s) => <TaskStatusBadge key={s} status={s} />)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PROJECT_STATUSES.map((s) => <ProjectStatusBadge key={s} status={s} />)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-border bg-canvas text-ink-muted">Neutral</Badge>
          </div>
        </div>
      </Section>

      <Section eyebrow="Components / 04" title="Avatars">
        <div className="flex items-center gap-3">
          <Avatar name="Areeba Tahir" size="sm" />
          <Avatar name="Areeba Tahir" size="md" />
          <Avatar name="Areeba Tahir" size="lg" />
          <Avatar name="Solo" size="md" />
        </div>
      </Section>

      <Section eyebrow="Components / 05" title="Card & Empty state">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <p className="text-sm font-medium text-ink">Aurelia Redesign</p>
              <ProjectStatusBadge status="active" />
            </CardHeader>
            <CardBody className="text-sm text-ink-muted">
              Rebuilding the customer-facing storefront for the Q3 launch.
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description="Projects assigned to you will show up here."
              />
            </CardBody>
          </Card>
        </div>
      </Section>

      <Section eyebrow="Components / 06" title="Tabs, Dialog & Toast">
        <Card>
          <CardBody className="space-y-4">
            <Tabs
              tabs={[
                { value: "overview", label: "Overview" },
                { value: "tasks", label: "Tasks" },
                { value: "discussion", label: "Discussion" },
              ]}
              active={tab}
              onChange={setTab}
            />
            <p className="text-sm text-ink-muted">Active tab: {tab}</p>
            <div className="flex gap-3">
              <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
              <Button
                variant="secondary"
                onClick={() => toast({ title: "Task updated", description: "Status changed to In Progress.", variant: "success" })}
              >
                Trigger success toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast({ title: "Could not save", description: "Check the required fields.", variant: "error" })}
              >
                Trigger error toast
              </Button>
            </div>
          </CardBody>
        </Card>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Add team member">
          <div className="space-y-4">
            <Select label="Member">
              <option>Choose a team member…</option>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setDialogOpen(false)}>Add member</Button>
            </div>
          </div>
        </Dialog>
      </Section>

      <Section eyebrow="Components / 07" title="Loading">
        <div className="flex items-center gap-4">
          <Spinner />
          <span className="text-sm text-ink-muted">Inline spinner</span>
        </div>
      </Section>
    </div>
  );
}
