"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Avatar } from "@/components/ui/avatar";
import { formatRelative } from "@/lib/utils";

const VERB: Record<string, string> = {
  created: "created",
  moved: "moved",
  assigned: "reassigned",
  commented: "commented on",
  renamed: "renamed",
};

export function ActivityFeed({
  projectId,
  open,
  onClose,
}: {
  projectId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = trpc.activity.feed.useQuery(
    { projectId, limit: 30 },
    { enabled: open, refetchInterval: open ? 5000 : false },
  );

  return (
    <AnimatePresence>
      {open && (
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
            className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-sm flex-col border-l border-border bg-surface shadow-2xl shadow-black/50"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold">Activity</h2>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-faint transition-colors hover:bg-elevated hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading && (
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-10 rounded skeleton" />
                  ))}
                </div>
              )}
              <ol className="relative space-y-4 border-l border-border pl-4">
                {data?.map((a) => (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                  >
                    <span className="absolute -left-[22px] top-1">
                      <Avatar
                        name={a.actor.name}
                        color={a.actor.avatarColor}
                        size={20}
                      />
                    </span>
                    <p className="text-sm leading-snug text-muted">
                      <span className="font-medium text-text">
                        {a.actor.name}
                      </span>{" "}
                      {VERB[a.type] ?? a.type}{" "}
                      {a.task && (
                        <span className="text-text">{a.task.title}</span>
                      )}
                    </p>
                    <span className="text-[11px] text-faint">
                      {formatRelative(a.createdAt)}
                    </span>
                  </motion.li>
                ))}
                {data?.length === 0 && (
                  <p className="text-sm text-faint">No activity yet.</p>
                )}
              </ol>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
