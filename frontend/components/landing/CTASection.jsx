"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="relative mx-6 my-8 overflow-hidden rounded-2xl bg-signal-700 px-6 py-20 text-center sm:mx-auto sm:max-w-6xl">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-pulse-500/30 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-signal-300/20 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <h2 className="mx-auto max-w-xl font-display text-3xl font-semibold text-white sm:text-4xl">
          Give your team a workspace that actually keeps up.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-signal-100">
          Accounts are created by your administrator — ask them to get you set up.
        </p>
        <Link href="/login" className="mt-8 inline-block">
          <Button size="lg" className="bg-white text-signal-700 hover:bg-signal-50">
            Sign in to Synqro <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
