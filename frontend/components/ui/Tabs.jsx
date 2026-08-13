import { cn } from "@/lib/utils";

export function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn("flex gap-1 border-b border-border", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "relative px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink",
            active === tab.value && "text-signal-600"
          )}
        >
          {tab.label}
          {active === tab.value && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-signal-500" />
          )}
        </button>
      ))}
    </div>
  );
}
