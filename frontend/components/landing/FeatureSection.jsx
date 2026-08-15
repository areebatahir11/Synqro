"use client";

import { motion } from "framer-motion";
import { ShieldCheck, FolderKanban, ListChecks } from "lucide-react";

const PORTALS = [
  {
    icon: ShieldCheck,
    color: "bg-signal-100 text-signal-600",
    title: "Admin",
    description:
      "Create accounts, spin up projects, assign project managers, and keep an eye on everything from one dashboard.",
  },
  {
    icon: FolderKanban,
    color: "bg-pulse-100 text-pulse-600",
    title: "Project Manager",
    description:
      "Manage your assigned projects, build out the team, and create tasks with priorities and deadlines that stick.",
  },
  {
    icon: ListChecks,
    color: "bg-signal-100 text-signal-600",
    title: "Team Member",
    description:
      "See exactly what's yours, move tasks through To Do → In Progress → Review → Completed, and stay in the loop.",
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mb-14 max-w-xl"
      >
        <p className="eyebrow mb-2">Three portals, one workspace</p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Everyone gets exactly what they need — nothing they don't.
        </h2>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-3">
        {PORTALS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="rounded-lg border border-border bg-white p-6"
          >
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${p.color}`}>
              <p.icon className="h-5 w-5" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-ink">{p.title}</h3>
            <p className="text-sm text-ink-muted">{p.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
