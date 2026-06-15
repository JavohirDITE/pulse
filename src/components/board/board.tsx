"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import type { Status } from "@prisma/client";
import { trpc } from "@/lib/trpc";
import { STATUSES } from "@/lib/constants";
import { Column } from "./column";
import { TaskCard, type BoardTask } from "./task-card";

type Grouped = Record<Status, BoardTask[]>;

function group(tasks: BoardTask[]): Grouped {
  const g = Object.fromEntries(
    STATUSES.map((s) => [s.value, []]),
  ) as unknown as Grouped;
  for (const t of tasks) g[t.status].push(t);
  for (const s of STATUSES) g[s.value].sort((a, b) => a.order - b.order);
  return g;
}

export function Board({
  projectId,
  projectKey,
  search,
  onOpenTask,
}: {
  projectId: string;
  projectKey: string;
  search: string;
  onOpenTask: (id: string) => void;
}) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.task.board.useQuery({ projectId, search });

  const [columns, setColumns] = useState<Grouped>(() => group([]));
  const [activeId, setActiveId] = useState<string | null>(null);
  const dragging = useRef(false);

  // Sync server state into local board, but never while a drag is in flight.
  useEffect(() => {
    if (data && !dragging.current) setColumns(group(data));
  }, [data]);

  const move = trpc.task.move.useMutation({
    onError: (e) => {
      toast.error(e.message);
      utils.task.board.invalidate({ projectId });
    },
    onSettled: () => utils.task.board.invalidate({ projectId }),
  });

  const create = trpc.task.create.useMutation({
    onSuccess: () => utils.task.board.invalidate({ projectId }),
    onError: (e) => toast.error(e.message),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const findContainer = (id: string): Status | undefined => {
    if (STATUSES.some((s) => s.value === id)) return id as Status;
    return STATUSES.find((s) => columns[s.value].some((t) => t.id === id))
      ?.value;
  };

  const activeTask = activeId
    ? Object.values(columns)
        .flat()
        .find((t) => t.id === activeId)
    : null;

  function onDragStart(e: DragStartEvent) {
    dragging.current = true;
    setActiveId(e.active.id as string);
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const from = findContainer(active.id as string);
    const to = findContainer(over.id as string);
    if (!from || !to || from === to) return;

    setColumns((prev) => {
      const fromItems = [...prev[from]];
      const toItems = [...prev[to]];
      const idx = fromItems.findIndex((t) => t.id === active.id);
      if (idx === -1) return prev;
      const [moved] = fromItems.splice(idx, 1);
      const overIdx = toItems.findIndex((t) => t.id === over.id);
      const insertAt = overIdx === -1 ? toItems.length : overIdx;
      toItems.splice(insertAt, 0, { ...moved, status: to });
      return { ...prev, [from]: fromItems, [to]: toItems };
    });
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    dragging.current = false;
    setActiveId(null);
    if (!over) return;

    const container = findContainer(active.id as string);
    if (!container) return;

    setColumns((prev) => {
      const items = [...prev[container]];
      const oldIdx = items.findIndex((t) => t.id === active.id);
      const newIdx =
        over.id === container
          ? items.length - 1
          : items.findIndex((t) => t.id === over.id);
      const ordered =
        oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx
          ? arrayMove(items, oldIdx, newIdx)
          : items;

      const pos = ordered.findIndex((t) => t.id === active.id);
      const prevOrder = ordered[pos - 1]?.order;
      const nextOrder = ordered[pos + 1]?.order;
      let order: number;
      if (prevOrder != null && nextOrder != null)
        order = (prevOrder + nextOrder) / 2;
      else if (nextOrder != null) order = nextOrder - 1000;
      else if (prevOrder != null) order = prevOrder + 1000;
      else order = 1000;

      ordered[pos] = { ...ordered[pos], order, status: container };
      move.mutate({ taskId: active.id as string, status: container, order });
      return { ...prev, [container]: ordered };
    });
  }

  if (isLoading) return <BoardSkeleton />;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto p-6">
        {STATUSES.map((s) => (
          <Column
            key={s.value}
            status={s.value}
            tasks={columns[s.value]}
            projectKey={projectKey}
            onOpenTask={onOpenTask}
            onCreate={(title, status) =>
              create.mutate({ projectId, title, status })
            }
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <TaskCard
            task={activeTask}
            projectKey={projectKey}
            onOpen={() => {}}
            dragging
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex h-full gap-4 overflow-hidden p-6">
      {[0, 1, 2, 3, 4].map((c) => (
        <div key={c} className="w-72 shrink-0 space-y-2">
          <div className="h-4 w-24 rounded skeleton" />
          {[0, 1].map((i) => (
            <div key={i} className="h-20 rounded-lg skeleton" />
          ))}
        </div>
      ))}
    </div>
  );
}
