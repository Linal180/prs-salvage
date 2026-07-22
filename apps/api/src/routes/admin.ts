import type { FastifyPluginAsync } from "fastify";
import type { UserStatus } from "@prisma/client";
import { z } from "zod";
import { publicUser } from "../lib/auth.js";
import { parsePagination, resolvePagination } from "../lib/pagination.js";
import { prisma } from "../lib/prisma.js";
import { requireRole, type AuthedRequest } from "../plugins/auth-guard.js";

const statusFilter = z.enum(["PENDING", "APPROVED", "SUSPENDED", "ALL"]).default("ALL");
const actionSchema = z.object({
  action: z.enum(["approve", "suspend"]),
});

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireRole("ADMIN"));

  app.get("/users", async (request) => {
    const query = request.query as Record<string, unknown>;
    const status = statusFilter.parse(query.status ?? "ALL");
    const { page, pageSize } = parsePagination(query);

    const where = {
      role: { not: "ADMIN" as const },
      ...(status === "ALL" ? {} : { status: status as UserStatus }),
    };

    const total = await prisma.user.count({ where });
    const { meta: pagination, skip, take } = resolvePagination(total, page, pageSize);

    const [users, pending, approved, suspended] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip,
        take,
      }),
      prisma.user.count({
        where: { role: { not: "ADMIN" }, status: "PENDING" },
      }),
      prisma.user.count({
        where: { role: { not: "ADMIN" }, status: "APPROVED" },
      }),
      prisma.user.count({
        where: { role: { not: "ADMIN" }, status: "SUSPENDED" },
      }),
    ]);

    return {
      users: users.map(publicUser),
      pagination,
      counts: { pending, approved, suspended },
    };
  });

  app.patch("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = actionSchema.parse(request.body);
    const admin = (request as AuthedRequest).user;

    if (id === admin.id) {
      return reply.status(400).send({ error: "Cannot modify your own admin account this way" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role === "ADMIN") {
      return reply.status(404).send({ error: "User not found" });
    }

    const updated = await prisma.user.update({
      where: { id },
      data:
        body.action === "approve"
          ? {
              status: "APPROVED",
              approvedAt: new Date(),
              suspendedAt: null,
            }
          : {
              status: "SUSPENDED",
              suspendedAt: new Date(),
            },
    });

    return {
      user: publicUser(updated),
      message: body.action === "approve" ? "User approved" : "User suspended",
    };
  });
};
