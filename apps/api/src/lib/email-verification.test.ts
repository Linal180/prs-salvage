import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createRawToken, hashToken } from "./email-verification.js";
import { verificationLink } from "./mail.js";

describe("email verification tokens", () => {
  it("createRawToken returns 64 hex chars", () => {
    const token = createRawToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("hashToken is stable sha256", () => {
    const raw = "abc123";
    expect(hashToken(raw)).toBe(
      createHash("sha256").update(raw).digest("hex"),
    );
    expect(hashToken(raw)).toBe(hashToken(raw));
  });

  it("different tokens produce different hashes", () => {
    expect(hashToken("a")).not.toBe(hashToken("b"));
  });
});

describe("verificationLink", () => {
  it("points at frontend confirm route with encoded token", () => {
    const link = verificationLink("tok&en");
    expect(link).toContain("/verify-email/confirm?token=");
    expect(link).toContain(encodeURIComponent("tok&en"));
  });
});
