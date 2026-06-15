"use client";

import { useState } from "react";
import { Activity, Search, UserPlus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useProjectEvents } from "@/hooks/use-project-events";
import { AvatarStack } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Board } from "./board";
import { TaskDetail } from "./task-detail";
import { ActivityFeed } from "./activity-feed";
import { InviteModal } from "./invite-modal";

export function BoardView({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = trpc.project.byId.useQuery({ projectId });
  const { connected } = useProjectEvents(projectId);
  const [openTask, setOpenTask] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [feedOpen, setFeedOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  if (isLoading || !project) {
    return (
      <div className="flex h-full flex-col">
        <div className="h-[57px] border-b border-border" />
        <div className="flex-1 p-6">
          <div className="h-6 w-40 rounded skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-border px-6 py-3">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
          style={{ backgroundColor: project.color }}
        >
          {project.key.slice(0, 2)}
        </span>
        <div className="mr-2">
          <h1 className="text-sm font-semibold leading-tight">
            {project.name}
          </h1>
          <span className="font-mono text-[11px] text-faint">
            {project.key}
          </span>
        </div>

        <div className="relative ml-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter issues…"
            className="h-8 w-48 rounded-lg border border-border bg-bg/40 pl-8 pr-3 text-sm outline-none transition-colors focus:border-brand focus:w-60 focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span
            className="flex items-center gap-1.5 text-xs text-faint"
            title={connected ? "Live updates connected" : "Reconnecting…"}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connected
                  ? "bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/60"
                  : "bg-faint"
              }`}
            />
            {connected ? "Live" : "Offline"}
          </span>
          <AvatarStack users={project.members.map((m) => m.user)} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus className="h-3.5 w-3.5" /> Invite
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFeedOpen(true)}
            aria-label="Activity"
          >
            <Activity className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <Board
          projectId={projectId}
          projectKey={project.key}
          search={search}
          onOpenTask={setOpenTask}
        />
      </div>

      <TaskDetail
        taskId={openTask}
        projectKey={project.key}
        members={project.members}
        onClose={() => setOpenTask(null)}
      />
      <ActivityFeed
        projectId={projectId}
        open={feedOpen}
        onClose={() => setFeedOpen(false)}
      />
      <InviteModal
        projectId={projectId}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
}
