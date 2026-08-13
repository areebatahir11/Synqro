import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-signal-500", className)} />;
}

export function PageLoading() {
  return (
    <div className="flex h-64 w-full items-center justify-center">
      <Spinner className="h-6 w-6" />
    </div>
  );
}
