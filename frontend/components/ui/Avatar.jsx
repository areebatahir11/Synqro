import { cn } from "@/lib/utils";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZES = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ name, size = "md", className }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-signal-100 font-medium text-signal-700",
        SIZES[size],
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
