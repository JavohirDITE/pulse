import { TRPCError } from "@trpc/server";
import type { PrismaClient, Role } from "@prisma/client";

const ROLE_RANK: Record<Role, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

/**
 * Asserts the user is a member of the project and (optionally) has at least
 * the required role. Returns the membership role so callers can branch.
 */
export async function assertProjectAccess(
  db: PrismaClient,
  projectId: string,
  userId: string,
  minRole: Role = "MEMBER",
): Promise<Role> {
  const membership = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { role: true },
  });

  if (!membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You don't have access to this project.",
    });
  }

  if (ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Requires ${minRole} role or higher.`,
    });
  }

  return membership.role;
}
