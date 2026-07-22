import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma.js";
import { sendVerificationEmail } from "./mail.js";

const TOKEN_TTL_HOURS = 24;

export function hashToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function createRawToken() {
  return randomBytes(32).toString("hex");
}

export async function issueEmailVerification(user: {
  id: string;
  email: string;
  displayName: string;
}) {
  const rawToken = createRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
  await prisma.emailVerificationToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const mail = await sendVerificationEmail({
    to: user.email,
    displayName: user.displayName,
    rawToken,
  });

  return { rawToken, mail };
}

export async function consumeEmailVerificationToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record) {
    return { ok: false as const, error: "Invalid or expired verification link" };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerificationToken.delete({ where: { id: record.id } });
    return { ok: false as const, error: "Verification link has expired. Request a new one." };
  }

  const user = await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerifiedAt: new Date() },
  });

  await prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } });

  return { ok: true as const, user };
}
