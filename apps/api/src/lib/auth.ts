import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Role, UserStatus } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-insecure-secret-change-me";
export const AUTH_COOKIE = "prs_token";
const TOKEN_DAYS = 7;

export type JwtPayload = {
  sub: string;
  role: Role;
  status: UserStatus;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${TOKEN_DAYS}d` });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function cookieOptions(maxAgeSeconds = TOKEN_DAYS * 24 * 60 * 60) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Must mirror cookieOptions fields so browsers actually clear the session cookie. */
export function clearCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
  };
}

export function publicUser<T extends {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  displayName: string;
  phone: string | null;
  taxNumber: string | null;
  location: string | null;
  policyAcceptedAt: Date | null;
  emailVerifiedAt: Date | null;
  approvedAt: Date | null;
  createdAt: Date;
}>(user: T) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    displayName: user.displayName,
    phone: user.phone,
    taxNumber: user.taxNumber,
    location: user.location,
    policyAcceptedAt: user.policyAcceptedAt,
    emailVerifiedAt: user.emailVerifiedAt,
    emailVerified: Boolean(user.emailVerifiedAt),
    approvedAt: user.approvedAt,
    createdAt: user.createdAt,
  };
}
