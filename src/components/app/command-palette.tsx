"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search } from "lucide-react";import { trpc } from "@/lib/trpc";

type CmdCtx = { open: boolean; setOpen: (v: boolean) => void };
const Ctx = createContext<CmdCtx | null>(null);

export function useCommandPalette() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCommandPalette outside provider");
  return ctx;
}

export function CommandPaletteProvider({
  children,
  onNewProject,
}: {
  children: React.ReactNode;
  onNewProject: () => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: projects } = trpc.project.list.useQuery(undefined, {
    enabled: open,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <Ctx.Provider value={{ open, setOpen }}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[18vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/50"
            >
              <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-faint">
                <div className="flex items-center gap-2 border-b border-border px-3">
                  <Search className="h-4 w-4 text-faint" />
                  <Command.Input
                    autoFocus
                    placeholder="Search projects or run a command…"
                    className="h-12 w-full bg-transparent text-sm text-text outline-none placeholder:text-faint"
                  />
                  <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-faint">
                    ESC
                  </kbd>
                </div>
                <Command.List className="max-h-80 overflow-y-auto p-2">
                  <Command.Empty className="py-8 text-center text-sm text-faint">
                    No results found.
                  </Command.Empty>

                  <Command.Group heading="Actions">
                    <Item onSelect={() => run(onNewProject)}>
                      <Plus className="h-4 w-4 text-brand-bright" />
                      Create new project
                    </Item>
                  </Command.Group>

                  {projects && projects.length > 0 && (
                    <Command.Group heading="Projects">
                      {projects.map((p) => (
                        <Item
                          key={p.id}
                          onSelect={() => run(() => router.push(`/app/${p.id}`))}
                        >
                          <span
                            className="flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold text-white"
                            style={{ backgroundColor: p.color }}
                          >
                            {p.key.slice(0, 1)}
                          </span>
                          {p.name}
                          <span className="ml-auto font-mono text-[10px] text-faint">
                            {p.key}
                          </span>
                        </Item>
                      ))}
                    </Command.Group>
                  )}
                </Command.List>
              </Command>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

function Item({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted aria-selected:bg-elevated aria-selected:text-text"
    >
      {children}
    </Command.Item>
  );
}
