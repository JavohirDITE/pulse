import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "@/server/trpc";
import { assertProjectAccess } from "@/server/access";

export const commentRouter = router({
  add: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        body: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({
        where: { id: input.taskId },
        select: { projectId: true },
      });
      if (!task) throw new TRPCError({ code: "NOT_FOUND" });
      await assertProjectAccess(ctx.db, task.projectId, ctx.session.userId);

      const comment = await ctx.db.comment.create({
        data: {
          body: input.body,
          taskId: input.taskId,
          authorId: ctx.session.userId,
        },
        include: {
          author: { select: { id: true, name: true, avatarColor: true } },
        },
      });

      await ctx.db.activity.create({
        data: {
          type: "commented",
          meta: { preview: input.body.slice(0, 80) },
          projectId: task.projectId,
          taskId: input.taskId,
          actorId: ctx.session.userId,
        },
      });
      return comment;
    }),

  remove: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.comment.findUnique({
        where: { id: input.commentId },
        select: { authorId: true },
      });
      if (!comment) throw new TRPCError({ code: "NOT_FOUND" });
      if (comment.authorId !== ctx.session.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own comments.",
        });
      }
      await ctx.db.comment.delete({ where: { id: input.commentId } });
      return { ok: true };
    }),
});
