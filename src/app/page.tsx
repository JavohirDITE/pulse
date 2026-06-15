"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Command,
  Layers,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.8 18.3 5.1 18.3 5.1c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}
import { Button } from "@/components/ui/button";
import { BoardPreview } from "@/components/landing/board-preview";

const features = [
  {
    icon: Layers,
    title: "Boards that feel instant",
    body: "Drag-and-drop kanban with fractional ordering. No flicker, no full reloads — optimistic updates land before the network does.",
  },
  {
    icon: Command,
    title: "Keyboard-first",
    body: "A command palette (⌘K) and shortcuts for everything. Create, assign, and move issues without touching the mouse.",
  },
  {
    icon: Users,
    title: "Real-time by design",
    body: "An activity stream and shared state keep the whole team on the same board, live.",
  },
  {
    icon: Zap,
    title: "Typed end-to-end",
    body: "tRPC + Prisma + Zod means the client and server share one source of truth. If it compiles, it connects.",
  },
];

const fade: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: EASE },
  }),
};

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden aurora">
      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <PulseMark />
          <span className="text-lg font-semibold tracking-tight">Pulse</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-10 text-center sm:pt-24">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fade}
          custom={0}
          className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-bright" />
          Built with Next.js, tRPC, Prisma & Framer Motion
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fade}
          custom={1}
          className="mx-auto max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
        >
          Issue tracking that{" "}
          <span className="bg-gradient-to-r from-brand-bright via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">
            keeps up with you
          </span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fade}
          custom={2}
          className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted"
        >
          A fast, keyboard-first task tracker for product teams. Plan in boards,
          move in milliseconds, and stay in flow.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fade}
          custom={3}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Link href="/register">
            <Button size="lg">
              Start for free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a
            href="https://github.com/JavohirDITE"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="lg" variant="secondary">
              <GithubIcon className="h-4 w-4" /> Source
            </Button>
          </a>
        </motion.div>
      </section>

      {/* Board preview */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto mt-6 max-w-6xl px-6"
      >
        <div className="rounded-2xl border border-border bg-surface/70 p-2 shadow-2xl shadow-black/40 glass">
          <BoardPreview />
        </div>
      </motion.section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={fade}
              custom={i}
              className="group rounded-xl border border-border bg-surface/60 p-6 transition-colors hover:border-faint"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft/40 text-brand-bright transition-transform group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 text-base font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-soft">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-faint sm:flex-row">
          <div className="flex items-center gap-2">
            <PulseMark size={18} />
            <span>Pulse — a portfolio project</span>
          </div>
          <p>Next.js · tRPC · Prisma · PostgreSQL · Tailwind</p>
        </div>
      </footer>
    </div>
  );
}

function PulseMark({ size = 24 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-lg bg-brand"
      style={{ width: size, height: size }}
    >
      <span
        className="absolute inset-0 rounded-lg"
        style={{ animation: "var(--animate-pulse-ring)" }}
      />
      <Zap className="text-white" style={{ width: size * 0.6, height: size * 0.6 }} />
    </span>
  );
}
