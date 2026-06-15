"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronsUpDown,
  LogOut,
  Plus,
  Search,
  Settings,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Avatar } from "@/components/ui/avatar";
import {
  CommandPaletteProvider,
  useCommandPalette,
} from "@/components/app/command-palette";
import { NewProjectModal } from "@/components/app/new-project-modal";
import { cn } from "@/lib/utils";

type User = { id: string; name: string; email: string };

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  return (
    <CommandPaletteProvider onNewProject={() => setNewProjectOpen(true)}>
      <div className="flex h-screen overflow-hidden bg-bg">
        <Sidebar user={user} onNewProject={() => setNewProjectOpen(true)} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
      />
    </CommandPaletteProvider>
  );
}

function Sidebar({
  user,
  onNewProject,
}: {
  user: User;
  onNewProject: () => void;
}) {
  const pathname = usePathname();
  const { setOpen } = useCommandPalette();
  const { data: projects, isLoading } = trpc.project.list.useQuery();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2 px-4 py-4">
        <Link href="/app" className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand">
            <Zap className="h-4 w-4 text-white" />
          </span>
          <span className="font-semibold tracking-tight">Pulse</span>
        </Link>
      </div>

      <div className="px-3">
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-bg/40 px-3 py-2 text-sm text-faint transition-colors hover:border-faint"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search…</span>
          <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px]">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between px-4">
        <span className="text-xs font-medium uppercase tracking-wider text-faint">
          Projects
        </span>
        <button
          onClick={onNewProject}
          className="rounded p-0.5 text-faint transition-colors hover:bg-elevated hover:text-text"
          aria-label="New project"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <nav className="mt-1 flex-1 space-y-0.5 overflow-y-auto px-2 py-1">
        {isLoading && <SidebarSkeleton />}
        {projects?.length === 0 && (
          <p className="px-2 py-2 text-xs text-faint">
            No projects yet. Create your first one.
          </p>
        )}
        {projects?.map((p) => {
          const active = pathname === `/app/${p.id}`;
          return (
            <Link key={p.id} href={`/app/${p.id}`}>
              <motion.span
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-elevated text-text"
                    : "text-muted hover:bg-surface-2 hover:text-text",
                )}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: p.color }}
                >
                  {p.key.slice(0, 1)}
                </span>
                <span className="truncate">{p.name}</span>
                <span className="ml-auto text-[10px] text-faint">
                  {p._count.tasks}
                </span>
              </motion.span>
            </Link>
          );
        })}
      </nav>

      <UserMenu user={user} />
    </aside>
  );
}

function UserMenu({ user }: { user: User }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      router.push("/login");
      router.refresh();
    },
  });

  return (
    <div className="relative border-t border-border p-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-surface-2"
      >
        <Avatar name={user.name} color="#6366f1" size={26} />
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate font-medium">{user.name}</span>
          <span className="block truncate text-xs text-faint">
            {user.email}
          </span>
        </span>
        <ChevronsUpDown className="h-4 w-4 text-faint" />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-2 right-2 mb-1 overflow-hidden rounded-lg border border-border bg-elevated shadow-xl shadow-black/40"
        >
          <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text">
            <Settings className="h-4 w-4" /> Settings
          </button>
          <button
            onClick={() => logout.mutate()}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </motion.div>
      )}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-1.5 px-2">
      {[60, 80, 50].map((w, i) => (
        <div key={i} className="flex items-center gap-2.5 py-1.5">
          <div className="h-5 w-5 rounded skeleton" />
          <div className="h-3 rounded skeleton" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}
