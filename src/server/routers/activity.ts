import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { assertProjectAccess } from "@/server/access";

export const activityRouter = router({
  feed: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertProjectAccess(ctx.db, input.projectId, ctx.session.userId);
      return ctx.db.activity.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        include: {
          actor: { select: { id: true, name: true, avatarColor: true } },
          task: { select: { id: true, number: true, title: true } },
        },
      });
    }),
});
