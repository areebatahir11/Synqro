import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef(function Input(
  { label, error, className, id, ...props },
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
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "h-10 rounded-md border border-border bg-white px-3 text-sm text-ink placeholder:text-ink-faint",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-500 focus-visible:border-signal-500",
          error && "border-danger focus-visible:ring-danger",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});
