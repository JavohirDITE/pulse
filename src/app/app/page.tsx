"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FolderKanban, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { AvatarStack } from "@/components/ui/avatar";
import { NewProjectModal } from "@/components/app/new-project-modal";

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const { data: projects, isLoading } = trpc.project.list.useQuery();

  return (
    <div className="h-full overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg/80 px-8 py-4 backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold">Projects</h1>
          <p className="text-sm text-muted">Everything you&apos;re working on.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New project
        </Button>
      </header>

      <div className="mx-auto max-w-5xl p-8">
        {isLoading && <Grid>{[0, 1, 2].map((i) => <CardSkeleton key={i} />)}</Grid>}

        {projects?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center"
          >
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft/40 text-brand-bright">
              <FolderKanban className="h-7 w-7" />
            </div>
            <h2 className="text-base font-semibold">No projects yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Projects hold your boards, issues and team. Create your first one
              to get going.
            </p>
            <Button className="mt-5" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Create project
            </Button>
          </motion.div>
        )}

        {projects && projects.length > 0 && (
          <Grid>
            {projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/app/${p.id}`}>
                  <div className="group h-full rounded-xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-faint hover:shadow-lg hover:shadow-black/20">
                    <div className="mb-3 flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.key.slice(0, 2)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{p.name}</h3>
                        <span className="font-mono text-xs text-faint">
                          {p.key}
                        </span>
                      </div>
                    </div>
                    {p.description && (
                      <p className="mb-4 line-clamp-2 text-sm text-muted">
                        {p.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="text-xs text-faint">
                        {p._count.tasks} issues
                      </span>
                      <AvatarStack
                        users={p.members.map((m) => m.user)}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </Grid>
        )}
      </div>

      <NewProjectModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 rounded skeleton" />
          <div className="h-2.5 w-1/4 rounded skeleton" />
        </div>
      </div>
      <div className="h-3 w-full rounded skeleton" />
    </div>
  );
}
