"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { PulseDot } from "@/components/ui/PulseDot";
import { PriorityBadge, TaskStatusBadge } from "@/components/ui/StatusBadges";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* decorative gradient blobs */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-signal-500/20 blur-[100px]" />
      <div className="pointer-events-none absolute top-10 right-0 h-80 w-80 rounded-full bg-pulse-500/25 blur-[100px]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pt-16 pb-24 md:grid-cols-2 md:pt-24 md:pb-32">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5"
          >
            <PulseDot />
            <span className="text-xs font-medium text-ink-muted">Built for software teams</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            Plan the work.
            <br />
            <span className="relative inline-block">
              Sync the team.
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M2 9C60 3 240 3 298 9" stroke="var(--color-pulse-500)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-md text-lg text-ink-muted"
          >
            Projects, tasks, and team discussions — in one connected workspace built
            specifically for how software teams actually work. No clutter, no clones.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/login">
              <Button size="lg">
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#workflow">
              <Button variant="secondary" size="lg">See how it works</Button>
            </a>
          </motion.div>
        </div>

        {/* Floating mockup cards */}
        <div className="relative hidden h-[420px] md:block">
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -4 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ rotate: 0 }}
            className="absolute left-4 top-8 w-72 rounded-lg border border-border bg-white p-4 shadow-popover"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-sm font-semibold text-ink">Aurelia Redesign</p>
              <TaskStatusBadge status="in_progress" />
            </div>
            <p className="mb-3 text-xs text-ink-muted">Rebuilding the customer storefront ahead of Q3 launch.</p>
            <div className="flex items-center justify-between">
              <PriorityBadge priority="high" />
              <div className="flex -space-x-2">
                <Avatar name="Areeba Tahir" size="sm" className="ring-2 ring-white" />
                <Avatar name="Kinza Rasheed" size="sm" className="ring-2 ring-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, rotate: 3 }}
            animate={{ opacity: 1, y: 0, rotate: 3 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ rotate: 0 }}
            className="absolute right-2 top-40 w-64 rounded-lg border border-border bg-white p-4 shadow-popover"
          >
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <p className="text-sm font-medium text-ink">Fix login redirect bug</p>
            </div>
            <p className="eyebrow">Marked complete · on time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ rotate: 0 }}
            className="absolute bottom-6 left-16 w-72 rounded-lg border border-border bg-white p-4 shadow-popover"
          >
            <div className="mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-signal-500" />
              <p className="text-sm font-medium text-ink">Task discussion</p>
            </div>
            <p className="text-xs text-ink-muted">"Pushed the fix — can you re-test on staging?"</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
