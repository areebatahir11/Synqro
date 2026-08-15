"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const POINTS = [
  "Role-based access that's actually enforced — not just hidden buttons in the UI",
  "Every task keeps its own discussion thread, so context never gets lost in a separate chat app",
  "Notifications fire the moment something changes — assignments, status, deadlines",
  "Search, filter, and sort on every list — projects, tasks, users, notifications",
];

export function WhySection() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="eyebrow mb-2">Why Synqro</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Built like real software, because it is one.
          </h2>
          <p className="mt-4 text-ink-muted">
            Not a template with a new coat of paint. Synqro is built ground-up for the
            way software teams actually plan, assign, and ship work.
          </p>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          {POINTS.map((point) => (
            <li key={point} className="flex items-start gap-3 rounded-lg border border-border bg-white p-4">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-500">
                <Check className="h-3 w-3 text-white" />
              </span>
              <span className="text-sm text-ink">{point}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
