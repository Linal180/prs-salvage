import type { FastifyReply, FastifyRequest } from "fastify";
import type { Role, UserStatus } from "@prisma/client";
import { AUTH_COOKIE, clearCookieOptions, verifyToken, type JwtPayload } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

export type AuthedRequest = FastifyRequest & {
  user: JwtPayload & { id: string };
};

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies[AUTH_COOKIE];
  if (!token) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token);
    const dbUser = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!dbUser) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    // Suspended accounts lose API access immediately (even with an old cookie).
    if (dbUser.status === "SUSPENDED" && dbUser.role !== "ADMIN") {
      reply.clearCookie(AUTH_COOKIE, clearCookieOptions());
      return reply.status(403).send({
        error: "Your account has been suspended. Contact support.",
        status: "SUSPENDED",
      });
    }

    (request as AuthedRequest).user = {
      id: dbUser.id,
      sub: dbUser.id,
      role: dbUser.role,
      status: dbUser.status,
    };
  } catch {
    return reply.status(401).send({ error: "Unauthorized" });
  }
}

export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);
    if (reply.sent) return;

    const user = (request as AuthedRequest).user;
    if (!roles.includes(user.role)) {
      return reply.status(403).send({ error: "Forbidden" });
    }
  };
}

export function requireStatus(...statuses: UserStatus[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);
    if (reply.sent) return;

    const user = (request as AuthedRequest).user;
    if (!statuses.includes(user.status)) {
      return reply.status(403).send({
        error: "Account not active",
        status: user.status,
      });
    }
  };
}
