import { describe, expect, it } from "vitest";
import { homePathFor, paginationQuery, type User } from "./api";

function user(partial: Partial<User>): User {
  return {
    id: "1",
    email: "u@test.com",
    role: "DEALER",
    status: "PENDING",
    displayName: "U",
    phone: null,
    taxNumber: null,
    location: null,
    policyAcceptedAt: null,
    emailVerifiedAt: null,
    emailVerified: false,
    approvedAt: null,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe("homePathFor routing gates", () => {
  it("sends admin to /admin", () => {
    expect(
      homePathFor(
        user({ role: "ADMIN", status: "APPROVED", emailVerified: true }),
      ),
    ).toBe("/admin");
  });

  it("sends unverified users to /verify-email before pending", () => {
    expect(
      homePathFor(user({ status: "PENDING", emailVerified: false })),
    ).toBe("/verify-email");
    expect(
      homePathFor(user({ status: "APPROVED", emailVerified: false })),
    ).toBe("/verify-email");
  });

  it("sends verified pending to /pending", () => {
    expect(
      homePathFor(user({ status: "PENDING", emailVerified: true })),
    ).toBe("/pending");
  });

  it("sends approved verified dealers to /dashboard", () => {
    expect(
      homePathFor(
        user({ role: "INSURANCE", status: "APPROVED", emailVerified: true }),
      ),
    ).toBe("/dashboard");
  });

  it("sends suspended to /login", () => {
    expect(
      homePathFor(user({ status: "SUSPENDED", emailVerified: true })),
    ).toBe("/login");
  });
});

describe("paginationQuery", () => {
  it("builds query string", () => {
    expect(paginationQuery(2, 20)).toBe("page=2&pageSize=20");
  });
});
