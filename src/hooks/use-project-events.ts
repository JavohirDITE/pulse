"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Subscribes to a project's server-sent event stream. On each activity event
 * it refreshes the board and activity feed, giving live multi-client sync.
 * Returns the live connection state for a presence indicator.
 */
export function useProjectEvents(projectId: string) {
  const utils = trpc.useUtils();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    const source = new EventSource(`/api/projects/${projectId}/events`);

    source.addEventListener("ready", () => setConnected(true));
    source.addEventListener("activity", () => {
      utils.task.board.invalidate({ projectId });
      utils.activity.feed.invalidate({ projectId });
    });
    source.onerror = () => setConnected(false);

    return () => source.close();
  }, [projectId, utils]);

  return { connected };
}
