export const PRIORITIES = ["low", "medium", "high", "critical"];

export const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

// Tailwind classes keyed to the --color-priority-* tokens in globals.css
export const PRIORITY_STYLES = {
  low: "bg-priority-low/10 text-priority-low border-priority-low/20",
  medium: "bg-priority-medium/10 text-priority-medium border-priority-medium/20",
  high: "bg-priority-high/10 text-priority-high border-priority-high/20",
  critical: "bg-priority-critical/10 text-priority-critical border-priority-critical/20",
};
