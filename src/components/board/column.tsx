"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Status } from "@prisma/client";
import { STATUS_MAP } from "@/lib/constants";
import { StatusIcon } from "@/components/ui/indicators";
import { TaskCard, type BoardTask } from "./task-card";
import { cn } from "@/lib/utils";

export function Column({
  status,
  tasks,
  projectKey,
  onOpenTask,
  onCreate,
}: {
  status: Status;
  tasks: BoardTask[];
  projectKey: string;
  onOpenTask: (id: string) => void;
  onCreate: (title: string, status: Status) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const meta = STATUS_MAP[status];

  const submit = () => {
    const t = title.trim();
    if (t) onCreate(t, status);
    setTitle("");
    setAdding(false);
  };

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <StatusIcon status={status} />
        <span className="text-sm font-medium">{meta.label}</span>
        <span className="text-xs text-faint">{tasks.length}</span>
        <button
          onClick={() => setAdding(true)}
          className="ml-auto rounded p-0.5 text-faint transition-colors hover:bg-elevated hover:text-text"
          aria-label={`Add to ${meta.label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 rounded-xl p-1.5 transition-colors",
          isOver && "bg-elevated/50 ring-1 ring-brand/40",
        )}
      >
        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <textarea
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={submit}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                  if (e.key === "Escape") {
                    setTitle("");
                    setAdding(false);
                  }
                }}
                placeholder="Issue title…"
                rows={2}
                className="w-full resize-none rounded-lg border border-brand/50 bg-surface-2 p-3 text-sm outline-none ring-2 ring-brand/20"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              projectKey={projectKey}
              onOpen={() => onOpenTask(task.id)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-6 text-xs text-faint transition-colors hover:border-faint hover:text-muted"
          >
            <Plus className="h-3.5 w-3.5" /> Add issue
          </button>
        )}
      </div>
    </div>
  );
}
