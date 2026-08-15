"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PulseDot } from "@/components/ui/PulseDot";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

const ROLE_HOME = {
  [ROLES.ADMIN]: "/admin",
  [ROLES.PROJECT_MANAGER]: "/pm",
  [ROLES.TEAM_MEMBER]: "/member",
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      router.push(ROLE_HOME[user.role] || "/login");
    } catch (err) {
      setError(err.message || "Couldn't sign in. Check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* ---------- Left: branded panel ---------- */}
      <div className="relative hidden overflow-hidden bg-signal-700 md:flex md:flex-col md:justify-between md:p-10">
        <div className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-pulse-500/30 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-signal-300/20 blur-[100px]" />

        <div className="relative flex items-center gap-2">
          <Logo showWordmark={false} />
          <span className="font-display text-lg font-semibold tracking-tight text-white">Synqro</span>
        </div>

        <div className="relative flex flex-1 items-center justify-center py-16">
          <OrbitGraphic />
        </div>

        <div className="relative max-w-sm">
          <h2 className="font-display text-2xl font-semibold text-white">
            Everyone on the same page — automatically.
          </h2>
          <p className="mt-2 text-sm text-signal-100">
            Assignments, status changes, and deadlines sync the moment they happen.
          </p>
        </div>
      </div>

      {/* ---------- Right: form ---------- */}
      <div className="flex items-center justify-center bg-canvas px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="flex flex-col gap-3 md:hidden">
            <Logo />
          </div>

          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 md:hidden">
              <PulseDot />
              <span className="text-xs font-medium text-ink-muted">Welcome back</span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink">Sign in to your workspace</h1>
            <p className="mt-1 text-sm text-ink-muted">Pick up right where the team left off.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-white p-6 shadow-card">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-xs text-ink-faint">
            Accounts are created by your administrator. Contact them if you need access.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function OrbitGraphic() {
  return (
    <div className="relative flex h-64 w-64 items-center justify-center">
      {/* orbit rings */}
      <div className="absolute h-64 w-64 rounded-full border border-white/15" />
      <div className="absolute h-44 w-44 rounded-full border border-white/15" />

      {/* center node */}
      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-popover">
        <div className="h-6 w-6 rounded-full bg-signal-500" />
      </div>

      {/* orbiting dot 1 */}
      <motion.div
        className="absolute h-64 w-64"
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pulse-500 shadow-popover">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
        </div>
      </motion.div>

      {/* orbiting dot 2 */}
      <motion.div
        className="absolute h-44 w-44"
        animate={{ rotate: -360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <PulseDot className="h-3.5 w-3.5" />
        </div>
      </motion.div>
    </div>
  );
}