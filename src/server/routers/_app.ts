import { router } from "@/server/trpc";
import { authRouter } from "./auth";
import { projectRouter } from "./project";
import { taskRouter } from "./task";
import { commentRouter } from "./comment";
import { activityRouter } from "./activity";

export const appRouter = router({
  auth: authRouter,
  project: projectRouter,
  task: taskRouter,
  comment: commentRouter,
  activity: activityRouter,
});

export type AppRouter = typeof appRouter;
