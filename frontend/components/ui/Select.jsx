import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = forwardRef(function Select(
  { label, error, className, id, children, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "h-10 w-full appearance-none rounded-md border border-border bg-white px-3 pr-9 text-sm text-ink",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-500 focus-visible:border-signal-500",
            error && "border-danger focus-visible:ring-danger",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});
