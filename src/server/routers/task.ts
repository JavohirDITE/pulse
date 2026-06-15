import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { router, protectedProcedure } from "@/server/trpc";
import { assertProjectAccess } from "@/server/access";

const statusEnum = z.enum([
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
]);
const priorityEnum = z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"]);

const taskInclude = {
  assignee: { select: { id: true, name: true, avatarColor: true } },
  labels: { include: { label: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.TaskInclude;

export const taskRouter = router({
  // Full board grouped by status, ready to render columns.
  board: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        assigneeId: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertProjectAccess(ctx.db, input.projectId, ctx.session.userId);
      const tasks = await ctx.db.task.findMany({
        where: {
          projectId: input.projectId,
          assigneeId: input.assigneeId,
          title: input.search
            ? { contains: input.search, mode: "insensitive" }
            : undefined,
        },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: taskInclude,
      });
      return tasks;
    }),

  byId: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({
        where: { id: input.taskId },
        include: {
          ...taskInclude,
          creator: { select: { id: true, name: true, avatarColor: true } },
          comments: {
            orderBy: { createdAt: "asc" },
            include: {
              author: { select: { id: true, name: true, avatarColor: true } },
            },
          },
        },
      });
      if (!task) throw new TRPCError({ code: "NOT_FOUND" });
      await assertProjectAccess(ctx.db, task.projectId, ctx.session.userId);
      return task;
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().min(1).max(200),
        description: z.string().max(5000).optional(),
        status: statusEnum.default("BACKLOG"),
        priority: priorityEnum.default("NONE"),
        assigneeId: z.string().optional(),
        labelIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertProjectAccess(ctx.db, input.projectId, ctx.session.userId);

      return ctx.db.$transaction(async (tx) => {
        const last = await tx.task.findFirst({
          where: { projectId: input.projectId },
          orderBy: { number: "desc" },
          select: { number: true },
        });
        const top = await tx.task.findFirst({
          where: { projectId: input.projectId, status: input.status },
          orderBy: { order: "asc" },
          select: { order: true },
        });

        const task = await tx.task.create({
          data: {
            projectId: input.projectId,
            number: (last?.number ?? 0) + 1,
            title: input.title,
            description: input.description,
            status: input.status,
            priority: input.priority,
            assigneeId: input.assigneeId,
            creatorId: ctx.session.userId,
            order: (top?.order ?? 2000) - 1000,
            labels: input.labelIds?.length
              ? { create: input.labelIds.map((labelId) => ({ labelId })) }
              : undefined,
          },
          include: taskInclude,
        });

        await tx.activity.create({
          data: {
            type: "created",
            meta: { title: task.title },
            projectId: input.projectId,
            taskId: task.id,
            actorId: ctx.session.userId,
          },
        });
        return task;
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(5000).nullable().optional(),
        priority: priorityEnum.optional(),
        assigneeId: z.string().nullable().optional(),
        dueDate: z.date().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.task.findUnique({
        where: { id: input.taskId },
        select: { projectId: true },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      await assertProjectAccess(
        ctx.db,
        existing.projectId,
        ctx.session.userId,
      );

      const { taskId, ...data } = input;
      const task = await ctx.db.task.update({
        where: { id: taskId },
        data,
        include: taskInclude,
      });

      if (input.assigneeId !== undefined) {
        await ctx.db.activity.create({
          data: {
            type: "assigned",
            meta: { assigneeId: input.assigneeId },
            projectId: existing.projectId,
            taskId,
            actorId: ctx.session.userId,
          },
        });
      }
      return task;
    }),

  // Drag-and-drop: change column and/or position via fractional ordering.
  move: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        status: statusEnum,
        order: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.task.findUnique({
        where: { id: input.taskId },
        select: { projectId: true, status: true },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      await assertProjectAccess(
        ctx.db,
        existing.projectId,
        ctx.session.userId,
      );

      const task = await ctx.db.task.update({
        where: { id: input.taskId },
        data: { status: input.status, order: input.order },
        include: taskInclude,
      });

      if (existing.status !== input.status) {
        await ctx.db.activity.create({
          data: {
            type: "moved",
            meta: { from: existing.status, to: input.status },
            projectId: existing.projectId,
            taskId: input.taskId,
            actorId: ctx.session.userId,
          },
        });
      }
      return task;
    }),

  delete: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.task.findUnique({
        where: { id: input.taskId },
        select: { projectId: true },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      await assertProjectAccess(
        ctx.db,
        existing.projectId,
        ctx.session.userId,
      );
      await ctx.db.task.delete({ where: { id: input.taskId } });
      return { ok: true };
    }),
});
