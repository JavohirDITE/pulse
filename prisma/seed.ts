import { PrismaClient, type Status, type Priority } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const COLORS = ["#6366f1", "#06b6d4", "#22c55e", "#f97316", "#ec4899"];

async function main() {
  console.log("🌱 Seeding Pulse…");

  const passwordHash = await bcrypt.hash("password123", 12);

  const people = [
    { email: "demo@pulse.app", name: "Demo User" },
    { email: "maya@pulse.app", name: "Maya Chen" },
    { email: "leo@pulse.app", name: "Leo Garcia" },
  ];

  const users = [];
  for (const [i, p] of people.entries()) {
    const user = await db.user.upsert({
      where: { email: p.email },
      update: {},
      create: { ...p, passwordHash, avatarColor: COLORS[i % COLORS.length] },
    });
    users.push(user);
  }
  const [demo, maya, leo] = users;

  const project = await db.project.create({
    data: {
      name: "Pulse Web App",
      key: "PUL",
      description: "Building the Pulse issue tracker — dogfooding our own tool.",
      color: "#6366f1",
      ownerId: demo.id,
      members: {
        create: [
          { userId: demo.id, role: "OWNER" },
          { userId: maya.id, role: "ADMIN" },
          { userId: leo.id, role: "MEMBER" },
        ],
      },
      labels: {
        create: [
          { name: "Bug", color: "#ef4444" },
          { name: "Feature", color: "#22c55e" },
          { name: "Design", color: "#8b5cf6" },
        ],
      },
    },
    include: { labels: true, members: true },
  });

  const seedTasks: {
    title: string;
    status: Status;
    priority: Priority;
    assignee?: string;
    label?: string;
  }[] = [
    { title: "Set up tRPC + Prisma context", status: "DONE", priority: "HIGH", assignee: demo.id },
    { title: "Session auth with httpOnly cookies", status: "DONE", priority: "MEDIUM", assignee: maya.id, label: "Feature" },
    { title: "Optimistic drag-and-drop reorder", status: "IN_PROGRESS", priority: "HIGH", assignee: leo.id, label: "Feature" },
    { title: "Command palette fuzzy search", status: "IN_PROGRESS", priority: "URGENT", assignee: demo.id },
    { title: "Polish empty states for boards", status: "TODO", priority: "MEDIUM", assignee: maya.id, label: "Design" },
    { title: "Add keyboard shortcut hints", status: "TODO", priority: "LOW" },
    { title: "Investigate flicker on column switch", status: "IN_REVIEW", priority: "HIGH", assignee: leo.id, label: "Bug" },
    { title: "Write README and deploy notes", status: "BACKLOG", priority: "NONE", assignee: demo.id },
    { title: "Real-time presence indicators", status: "BACKLOG", priority: "LOW", label: "Feature" },
  ];

  const labelByName = Object.fromEntries(
    project.labels.map((l) => [l.name, l.id]),
  );

  let n = 0;
  for (const t of seedTasks) {
    n += 1;
    await db.task.create({
      data: {
        projectId: project.id,
        number: n,
        title: t.title,
        status: t.status,
        priority: t.priority,
        order: n * 1000,
        creatorId: demo.id,
        assigneeId: t.assignee,
        labels: t.label
          ? { create: [{ labelId: labelByName[t.label] }] }
          : undefined,
      },
    });
  }

  console.log(`✅ Seeded ${users.length} users, 1 project, ${n} tasks.`);
  console.log("→ Sign in with demo@pulse.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
