"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MessageSquare } from "lucide-react";
import type { RouterOutputs } from "@/lib/trpc";
import { PriorityIcon } from "@/components/ui/indicators";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type BoardTask = RouterOutputs["task"]["board"][number];

export function TaskCard({
  task,
  projectKey,
  onOpen,
  dragging,
}: {
  task: BoardTask;
  projectKey: string;
  onOpen: () => void;
  dragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { status: task.status } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      className={cn(
        "group cursor-grab touch-none rounded-lg border border-border bg-surface-2 p-3 shadow-sm transition-colors hover:border-faint active:cursor-grabbing",
        isDragging && "opacity-30",
        dragging && "rotate-2 scale-105 cursor-grabbing border-brand shadow-2xl shadow-black/50",
      )}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[10px] text-faint">
          {projectKey}-{task.number}
        </span>
        {task._count.comments > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-faint">
            <MessageSquare className="h-3 w-3" />
            {task._count.comments}
          </span>
        )}
      </div>

      <p className="mb-2.5 text-sm leading-snug text-text">{task.title}</p>

      <div className="flex items-center gap-2">
        <PriorityIcon priority={task.priority} />
        {task.labels.slice(0, 2).map(({ label }) => (
          <span
            key={label.id}
            className="rounded px-1.5 py-0.5 text-[9px] font-medium"
            style={{ color: label.color, backgroundColor: `${label.color}1a` }}
          >
            {label.name}
          </span>
        ))}
        <div className="ml-auto">
          {task.assignee && (
            <Avatar
              name={task.assignee.name}
              color={task.assignee.avatarColor}
              size={20}
            />
          )}
        </div>
      </div>
    </div>
  );
}
