import type { Status, Priority } from "@prisma/client";

export const STATUSES: {
  value: Status;
  label: string;
  color: string;
  dot: string;
}[] = [
  { value: "BACKLOG", label: "Backlog", color: "#94a3b8", dot: "bg-slate-400" },
  { value: "TODO", label: "Todo", color: "#a78bfa", dot: "bg-violet-400" },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    color: "#fbbf24",
    dot: "bg-amber-400",
  },
  {
    value: "IN_REVIEW",
    label: "In Review",
    color: "#38bdf8",
    dot: "bg-sky-400",
  },
  { value: "DONE", label: "Done", color: "#34d399", dot: "bg-emerald-400" },
];

export const PRIORITIES: {
  value: Priority;
  label: string;
  rank: number;
  color: string;
}[] = [
  { value: "NONE", label: "No priority", rank: 0, color: "#64748b" },
  { value: "LOW", label: "Low", rank: 1, color: "#60a5fa" },
  { value: "MEDIUM", label: "Medium", rank: 2, color: "#fbbf24" },
  { value: "HIGH", label: "High", rank: 3, color: "#fb923c" },
  { value: "URGENT", label: "Urgent", rank: 4, color: "#f87171" },
];

export const STATUS_MAP = Object.fromEntries(
  STATUSES.map((s) => [s.value, s]),
) as Record<Status, (typeof STATUSES)[number]>;

export const PRIORITY_MAP = Object.fromEntries(
  PRIORITIES.map((p) => [p.value, p]),
) as Record<Priority, (typeof PRIORITIES)[number]>;

export const LABEL_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];
