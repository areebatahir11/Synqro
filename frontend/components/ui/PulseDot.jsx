import { cn } from "@/lib/utils";

export function PulseDot({ className, active = true }) {
  if (!active) return null;
  return (
    <span className={cn("relative flex h-2 w-2", className)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pulse-500 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-pulse-500" />
    </span>
  );
}
