"use client";

import { use } from "react";
import { BoardView } from "@/components/board/board-view";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  return <BoardView projectId={projectId} />;
}
