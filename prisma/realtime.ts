/**
 * Installs a Postgres trigger that emits a NOTIFY on every Activity insert.
 * The SSE endpoint (/api/projects/[projectId]/events) LISTENs on this channel
 * and pushes changes to connected clients — real-time without any external
 * pub/sub service. Idempotent; safe to re-run.
 *
 *   npm run db:realtime
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const STATEMENTS = [
  `CREATE OR REPLACE FUNCTION notify_pulse_activity() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('pulse_activity', NEW."projectId");
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`,
  `DROP TRIGGER IF EXISTS pulse_activity_notify ON "Activity";`,
  `CREATE TRIGGER pulse_activity_notify
AFTER INSERT ON "Activity"
FOR EACH ROW EXECUTE FUNCTION notify_pulse_activity();`,
];

async function main() {
  for (const stmt of STATEMENTS) {
    await db.$executeRawUnsafe(stmt);
  }
  console.log("✅ Realtime NOTIFY trigger installed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
