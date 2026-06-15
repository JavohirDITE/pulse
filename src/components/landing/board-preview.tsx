"use client";

import { motion } from "framer-motion";
import { PriorityIcon, StatusIcon } from "@/components/ui/indicators";
import type { Priority, Status } from "@prisma/client";

type Card = {
  id: string;
  title: string;
  priority: Priority;
  tag?: { label: string; color: string };
};

const columns: { status: Status; title: string; cards: Card[] }[] = [
  {
    status: "TODO",
    title: "Todo",
    cards: [
      {
        id: "PUL-41",
        title: "Design empty states for boards",
        priority: "MEDIUM",
        tag: { label: "Design", color: "#8b5cf6" },
      },
      {
        id: "PUL-44",
        title: "Add keyboard shortcut hints",
        priority: "LOW",
      },
    ],
  },
  {
    status: "IN_PROGRESS",
    title: "In Progress",
    cards: [
      {
        id: "PUL-38",
        title: "Optimistic drag-and-drop reorder",
        priority: "HIGH",
        tag: { label: "Feature", color: "#22c55e" },
      },
      {
        id: "PUL-45",
        title: "Command palette fuzzy search",
        priority: "URGENT",
      },
    ],
  },
  {
    status: "DONE",
    title: "Done",
    cards: [
      {
        id: "PUL-30",
        title: "tRPC + Prisma context wiring",
        priority: "HIGH",
      },
      {
        id: "PUL-33",
        title: "Session auth with httpOnly cookies",
        priority: "MEDIUM",
        tag: { label: "Bug", color: "#ef4444" },
      },
    ],
  },
];

export function BoardPreview() {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl bg-bg/60 p-3">
      {columns.map((col, ci) => (
        <div key={col.status} className="min-w-0">
          <div className="mb-2 flex items-center gap-2 px-1">
            <StatusIcon status={col.status} />
            <span className="text-xs font-medium text-muted">{col.title}</span>
            <span className="text-[10px] text-faint">{col.cards.length}</span>
          </div>
          <div className="space-y-2">
            {col.cards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + ci * 0.1 + i * 0.08 }}
                whileHover={{ y: -2 }}
                className="rounded-lg border border-border bg-surface-2 p-2.5 text-left shadow-sm"
              >
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-faint">
                    {card.id}
                  </span>
                </div>
                <p className="mb-2 text-xs leading-snug text-text">
                  {card.title}
                </p>
                <div className="flex items-center gap-2">
                  <PriorityIcon priority={card.priority} />
                  {card.tag && (
                    <span
                      className="rounded px-1.5 py-0.5 text-[9px] font-medium"
                      style={{
                        color: card.tag.color,
                        backgroundColor: `${card.tag.color}1a`,
                      }}
                    >
                      {card.tag.label}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
