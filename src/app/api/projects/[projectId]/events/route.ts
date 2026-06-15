import { Client } from "pg";
import { getSession } from "@/lib/auth";
import { db } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Server-Sent Events stream for a project. Holds a dedicated Postgres
 * connection that LISTENs for `pulse_activity` notifications (emitted by a
 * trigger on the Activity table) and forwards matching ones to the client.
 * The browser's EventSource auto-reconnects when the function recycles.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.userId } },
    select: { id: true },
  });
  if (!member) return new Response("Forbidden", { status: 403 });

  const encoder = new TextEncoder();
  const pg = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: string) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));

      await pg.connect();
      await pg.query("LISTEN pulse_activity");
      send("ready", "ok");

      pg.on("notification", (msg) => {
        if (msg.payload === projectId) send("activity", Date.now().toString());
      });

      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 25_000);
    },
    async cancel() {
      if (heartbeat) clearInterval(heartbeat);
      await pg.end().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
