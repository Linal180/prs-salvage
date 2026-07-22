import type { FastifyPluginAsync } from "fastify";
import { ZodError } from "zod";
import { z } from "zod";
import {
  AUTH_COOKIE,
  clearCookieOptions,
  cookieOptions,
  hashPassword,
  publicUser,
  signToken,
  verifyPassword,
} from "../lib/auth.js";
import {
  consumeEmailVerificationToken,
  issueEmailVerification,
} from "../lib/email-verification.js";
import { prisma } from "../lib/prisma.js";
import { fieldErrorsFromZod, loginSchema, registerSchema } from "../lib/validators.js";
import { requireAuth, type AuthedRequest } from "../plugins/auth-guard.js";

function zodError(err: ZodError) {
  return {
    error: "Validation failed",
    details: err.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    })),
    fields: fieldErrorsFromZod(err),
  };
}

const verifySchema = z.object({
  token: z.string().min(20, "Verification token is required"),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/register", async (request, reply) => {
    try {
      const body = registerSchema.parse(request.body);
      const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
      if (existing) {
        return reply.status(409).send({
          error: "Email already registered",
          fields: { email: "Email already registered" },
          details: [{ path: "email", message: "Email already registered" }],
        });
      }

      const passwordHash = await hashPassword(body.password);
      const user = await prisma.user.create({
        data: {
          email: body.email.toLowerCase(),
          passwordHash,
          role: body.role,
          status: "PENDING",
          displayName: body.displayName,
          phone: "phone" in body ? body.phone ?? null : null,
          taxNumber: "taxNumber" in body ? body.taxNumber ?? null : null,
          location: "location" in body ? body.location ?? null : null,
          policyAcceptedAt: new Date(),
        },
      });

      const { mail } = await issueEmailVerification(user);

      const token = signToken({
        sub: user.id,
        role: user.role,
        status: user.status,
      });

      reply.setCookie(AUTH_COOKIE, token, cookieOptions());

      const payload: Record<string, unknown> = {
        user: publicUser(user),
        message:
          "Registration submitted. Please verify your email, then wait for admin approval.",
        emailVerificationSent: mail.delivered || mail.logged,
      };

      // Helps local demos when SMTP is not configured
      if (process.env.NODE_ENV !== "production" && mail.previewUrl) {
        payload.devVerificationUrl = mail.previewUrl;
      }

      return reply.status(201).send(payload);
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send(zodError(err));
      }
      throw err;
    }
  });

  app.post("/login", async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body);
      const user = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase() },
      });

      if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
        return reply.status(401).send({ error: "Invalid email or password" });
      }

      if (user.status === "SUSPENDED") {
        return reply.status(403).send({
          error: "Your account has been suspended. Contact support.",
          status: user.status,
        });
      }

      const token = signToken({
        sub: user.id,
        role: user.role,
        status: user.status,
      });
      reply.setCookie(AUTH_COOKIE, token, cookieOptions());

      let message = "Logged in successfully.";
      if (!user.emailVerifiedAt) {
        message = "Logged in. Please verify your email to continue.";
      } else if (user.status === "PENDING") {
        message = "Logged in. Your account is awaiting admin approval.";
      }

      return {
        user: publicUser(user),
        message,
      };
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send(zodError(err));
      }
      throw err;
    }
  });

  app.post("/logout", async (_request, reply) => {
    reply.clearCookie(AUTH_COOKIE, clearCookieOptions());
    return reply.send({ ok: true });
  });

  app.post("/verify-email", async (request, reply) => {
    try {
      const { token } = verifySchema.parse(request.body);
      const result = await consumeEmailVerificationToken(token);
      if (!result.ok) {
        return reply.status(400).send({ error: result.error });
      }

      const session = signToken({
        sub: result.user.id,
        role: result.user.role,
        status: result.user.status,
      });
      reply.setCookie(AUTH_COOKIE, session, cookieOptions());

      return {
        user: publicUser(result.user),
        message: "Email verified successfully.",
      };
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send(zodError(err));
      }
      throw err;
    }
  });

  app.post("/resend-verification", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = (request as AuthedRequest).user;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    if (user.emailVerifiedAt) {
      return reply.send({
        ok: true,
        alreadyVerified: true,
        message: "Email is already verified.",
        user: publicUser(user),
      });
    }

    const { mail } = await issueEmailVerification(user);
    const payload: Record<string, unknown> = {
      ok: true,
      message: "Verification email sent. Check your inbox.",
      emailVerificationSent: mail.delivered || mail.logged,
    };
    if (process.env.NODE_ENV !== "production" && mail.previewUrl) {
      payload.devVerificationUrl = mail.previewUrl;
    }
    return payload;
  });
};
