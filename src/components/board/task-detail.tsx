"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { Priority } from "@prisma/client";
import { trpc } from "@/lib/trpc";
import { PRIORITIES } from "@/lib/constants";
import { PriorityIcon } from "@/components/ui/indicators";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, formatRelative } from "@/lib/utils";

type Member = {
  user: { id: string; name: string; email: string; avatarColor: string };
};

export function TaskDetail({
  taskId,
  projectKey,
  members,
  onClose,
}: {
  taskId: string | null;
  projectKey: string;
  members: Member[];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {taskId && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl shadow-black/50"
          >
            <Inner
              taskId={taskId}
              projectKey={projectKey}
              members={members}
              onClose={onClose}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Inner({
  taskId,
  projectKey,
  members,
  onClose,
}: {
  taskId: string;
  projectKey: string;
  members: Member[];
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const { data: task, isLoading } = trpc.task.byId.useQuery({ taskId });
  const [comment, setComment] = useState("");

  const refresh = () => {
    utils.task.byId.invalidate({ taskId });
    if (task) utils.task.board.invalidate({ projectId: task.projectId });
  };

  const update = trpc.task.update.useMutation({ onSuccess: refresh });
  const addComment = trpc.comment.add.useMutation({
    onSuccess: () => {
      setComment("");
      utils.task.byId.invalidate({ taskId });
      if (task) utils.task.board.invalidate({ projectId: task.projectId });
    },
    onError: (e) => toast.error(e.message),
  });
  const del = trpc.task.delete.useMutation({
    onSuccess: () => {
      toast.success("Issue deleted");
      if (task) utils.task.board.invalidate({ projectId: task.projectId });
      onClose();
    },
  });

  if (isLoading || !task) {
    return (
      <div className="space-y-3 p-5">
        <div className="h-5 w-24 rounded skeleton" />
        <div className="h-7 w-3/4 rounded skeleton" />
        <div className="h-20 w-full rounded skeleton" />
      </div>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <span className="font-mono text-xs text-faint">
          {projectKey}-{task.number}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => del.mutate({ taskId })}
            className="rounded-md p-1.5 text-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
            aria-label="Delete issue"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-faint transition-colors hover:bg-elevated hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <h2 className="text-lg font-semibold leading-snug">{task.title}</h2>
        {task.description && (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
            {task.description}
          </p>
        )}

        <div className="mt-5 space-y-4 rounded-xl border border-border bg-bg/40 p-4">
          <Row label="Priority">
            <div className="flex flex-wrap gap-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() =>
                    update.mutate({ taskId, priority: p.value as Priority })
                  }
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors",
                    task.priority === p.value
                      ? "bg-elevated text-text"
                      : "text-muted hover:bg-surface-2",
                  )}
                >
                  <PriorityIcon priority={p.value as Priority} />
                  {p.label}
                </button>
              ))}
            </div>
          </Row>

          <Row label="Assignee">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => update.mutate({ taskId, assigneeId: null })}
                className={cn(
                  "rounded-md px-2 py-1 text-xs transition-colors",
                  !task.assigneeId
                    ? "bg-elevated text-text"
                    : "text-muted hover:bg-surface-2",
                )}
              >
                Unassigned
              </button>
              {members.map((m) => (
                <button
                  key={m.user.id}
                  onClick={() =>
                    update.mutate({ taskId, assigneeId: m.user.id })
                  }
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors",
                    task.assigneeId === m.user.id
                      ? "bg-elevated text-text"
                      : "text-muted hover:bg-surface-2",
                  )}
                >
                  <Avatar
                    name={m.user.name}
                    color={m.user.avatarColor}
                    size={16}
                  />
                  {m.user.name}
                </button>
              ))}
            </div>
          </Row>

          <Row label="Created by">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Avatar
                name={task.creator.name}
                color={task.creator.avatarColor}
                size={18}
              />
              {task.creator.name} · {formatRelative(task.createdAt)}
            </div>
          </Row>
        </div>

        {/* Comments */}
        <div className="mt-6">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-faint">
            Comments · {task.comments.length}
          </h3>
          <div className="space-y-3">
            {task.comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <Avatar
                  name={c.author.name}
                  color={c.author.avatarColor}
                  size={26}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">
                      {c.author.name}
                    </span>
                    <span className="text-[11px] text-faint">
                      {formatRelative(c.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-muted">
                    {c.body}
                  </p>
                </div>
              </div>
            ))}
            {task.comments.length === 0 && (
              <p className="text-sm text-faint">No comments yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (comment.trim())
              addComment.mutate({ taskId, body: comment.trim() });
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (comment.trim())
                  addComment.mutate({ taskId, body: comment.trim() });
              }
            }}
            placeholder="Write a comment… (⌘↵ to send)"
            rows={1}
            className="max-h-28 flex-1 resize-none rounded-lg border border-border bg-bg/60 px-3 py-2 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
          <Button
            type="submit"
            size="icon"
            disabled={addComment.isPending || !comment.trim()}
          >
            {addComment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-faint">{label}</span>
      {children}
    </div>
  );
}
