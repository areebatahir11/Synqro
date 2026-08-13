import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names and resolves Tailwind conflicts
 * (e.g. cn("px-2", condition && "px-4") -> "px-4", not both).
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
