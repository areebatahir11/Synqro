import { cn } from "@/lib/utils";

export function Logo({ className, showWordmark = true }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <path
          d="M8 15C8 11 11 8 15 8"
          stroke="var(--color-signal-500)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="7" cy="16" r="4.5" fill="var(--color-signal-500)" />
        <circle cx="17" cy="9" r="4.5" fill="var(--color-pulse-500)" />
      </svg>
      {showWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-ink">
          Synqro
        </span>
      )}
    </div>
  );
}
