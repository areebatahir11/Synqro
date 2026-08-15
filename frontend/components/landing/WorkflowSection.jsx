"use client";

import { motion } from "framer-motion";
import { FolderPlus, ListPlus, MessagesSquare, BellRing } from "lucide-react";

const STEPS = [
  { icon: FolderPlus, title: "Admin creates the project", description: "Assigns a project manager, sets priority and dates." },
  { icon: ListPlus, title: "PM breaks it into tasks", description: "Assigns each task, sets a deadline and priority." },
  { icon: MessagesSquare, title: "The team gets to work", description: "Status updates, questions, and context — all on the task." },
  { icon: BellRing, title: "Everyone stays in sync", description: "Assignments, status changes, and deadlines — notified instantly." },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="border-y border-border bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 max-w-xl"
        >
          <p className="eyebrow mb-2">How it works</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            From idea to done, without losing the thread.
          </h2>
        </motion.div>

        <div className="relative grid gap-10 sm:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-border sm:block" />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative"
            >
              <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-signal-500 bg-canvas">
                <step.icon className="h-5 w-5 text-signal-600" />
              </div>
              <p className="mb-1.5 font-display text-sm font-semibold text-ink">{step.title}</p>
              <p className="text-sm text-ink-muted">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
