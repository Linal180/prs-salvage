import type { FastifyPluginAsync } from "fastify";
import { publicUser } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../plugins/auth-guard.js";

export const meRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = (request as AuthedRequest).user;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
    return { user: publicUser(user) };
  });
};
