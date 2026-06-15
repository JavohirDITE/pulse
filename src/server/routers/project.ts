import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "@/server/trpc";
import { assertProjectAccess } from "@/server/access";
import { LABEL_COLORS } from "@/lib/constants";

export const projectRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: { members: { some: { userId: ctx.session.userId } } },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { tasks: true, members: true } },
        members: {
          take: 5,
          include: {
            user: { select: { id: true, name: true, avatarColor: true } },
          },
        },
      },
    });
    return projects;
  }),

  byId: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertProjectAccess(ctx.db, input.projectId, ctx.session.userId);
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        include: {
          labels: true,
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatarColor: true },
              },
            },
          },
        },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      return project;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(80),
        key: z
          .string()
          .min(2)
          .max(6)
          .regex(/^[A-Za-z]+$/, "Letters only")
          .transform((s) => s.toUpperCase()),
        description: z.string().max(500).optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          key: input.key,
          description: input.description,
          color: input.color ?? "#6366f1",
          ownerId: ctx.session.userId,
          members: {
            create: { userId: ctx.session.userId, role: "OWNER" },
          },
          labels: {
            create: [
              { name: "Bug", color: LABEL_COLORS[0] },
              { name: "Feature", color: LABEL_COLORS[3] },
              { name: "Design", color: LABEL_COLORS[6] },
            ],
          },
        },
      });
      return project;
    }),

  invite: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        email: z.string().email(),
        role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertProjectAccess(
        ctx.db,
        input.projectId,
        ctx.session.userId,
        "ADMIN",
      );
      const user = await ctx.db.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No Pulse user with that email yet.",
        });
      }
      return ctx.db.projectMember.upsert({
        where: {
          projectId_userId: { projectId: input.projectId, userId: user.id },
        },
        create: {
          projectId: input.projectId,
          userId: user.id,
          role: input.role,
        },
        update: { role: input.role },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertProjectAccess(
        ctx.db,
        input.projectId,
        ctx.session.userId,
        "OWNER",
      );
      await ctx.db.project.delete({ where: { id: input.projectId } });
      return { ok: true };
    }),
});
