import type { Priority, Status } from "@prisma/client";
import { PRIORITY_MAP, STATUS_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Linear-style stacked bars that fill up with priority. */
export function PriorityIcon({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  const { rank, color } = PRIORITY_MAP[priority];
  if (priority === "URGENT") {
    return (
      <span
        className={cn(
          "inline-flex h-3.5 w-3.5 items-center justify-center rounded-[3px]",
          className,
        )}
        style={{ backgroundColor: color }}
        title="Urgent"
      >
        <span className="h-1.5 w-[2px] rounded bg-white" />
      </span>
    );
  }
  return (
    <span
      className={cn("inline-flex items-end gap-[2px]", className)}
      title={PRIORITY_MAP[priority].label}
    >
      {[1, 2, 3].map((bar) => (
        <span
          key={bar}
          className="w-[3px] rounded-[1px]"
          style={{
            height: 4 + bar * 3,
            backgroundColor: rank >= bar ? color : "var(--color-border)",
          }}
        />
      ))}
    </span>
  );
}

export function StatusIcon({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const { color, value } = STATUS_MAP[status];
  const done = value === "DONE";
  const inProgress = value === "IN_PROGRESS";
  return (
    <span
      className={cn("relative inline-flex h-3.5 w-3.5", className)}
      title={STATUS_MAP[status].label}
    >
      <svg viewBox="0 0 14 14" className="h-3.5 w-3.5">
        <circle
          cx="7"
          cy="7"
          r="6"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray={value === "BACKLOG" ? "2 2" : undefined}
        />
        {done && <circle cx="7" cy="7" r="3.2" fill={color} />}
        {inProgress && (
          <path d="M7 7 L7 2 A5 5 0 0 1 12 7 Z" fill={color} />
        )}
        {value === "IN_REVIEW" && <circle cx="7" cy="7" r="2.2" fill={color} />}
      </svg>
    </span>
  );
}
