import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-signal-500 text-white hover:bg-signal-600 border border-transparent",
  secondary: "bg-white text-ink border border-border hover:bg-canvas",
  ghost: "bg-transparent text-ink-muted hover:bg-canvas hover:text-ink border border-transparent",
  danger: "bg-danger text-white hover:bg-danger/90 border border-transparent",
};

const SIZES = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
