import { beforeAll, describe, expect, it } from "vitest";
import "dotenv/config";

const API = process.env.TEST_API_URL ?? "http://localhost:4000";

type Jar = Map<string, string>;

async function api(
  path: string,
  opts: { method?: string; body?: unknown; jar?: Jar } = {},
) {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.jar?.size) {
    headers.Cookie = [...opts.jar.entries()]
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
  const res = await fetch(`${API}${path}`, {
    method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const jar = opts.jar ?? new Map<string, string>();
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const eq = pair.indexOf("=");
    if (eq > 0) {
      const name = pair.slice(0, eq);
      const value = pair.slice(eq + 1);
      if (c.toLowerCase().includes("max-age=0") || value === "") jar.delete(name);
      else jar.set(name, value);
    }
  }
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, jar };
}

function tokenFromDevUrl(url: string) {
  return new URL(url).searchParams.get("token")!;
}

const ts = Date.now();

describe("Email verification API", () => {
  beforeAll(async () => {
    const health = await fetch(`${API}/health`);
    if (!health.ok) throw new Error("API not reachable — npm run dev:api");
  });

  it("register → verify → resend says already verified", async () => {
    const email = `ev${ts}@test.com`;
    const reg = await api("/api/auth/register", {
      body: {
        role: "PRIVATE_SELLER",
        displayName: "Email Verify User",
        email,
        password: "Password1",
        phone: "03001112222",
        policyAccepted: true,
      },
    });
    expect(reg.status).toBe(201);
    expect(reg.data.user.emailVerified).toBe(false);
    expect(reg.data.devVerificationUrl || reg.data.emailVerificationSent).toBeTruthy();

    const token = tokenFromDevUrl(reg.data.devVerificationUrl);
    const verify = await api("/api/auth/verify-email", { body: { token } });
    expect(verify.status).toBe(200);
    expect(verify.data.user.emailVerified).toBe(true);

    const resend = await api("/api/auth/resend-verification", {
      method: "POST",
      jar: verify.jar,
    });
    expect(resend.status).toBe(200);
    expect(resend.data.alreadyVerified).toBe(true);
  });

  it("resend without JSON body succeeds (no empty-body error)", async () => {
    const email = `resend${ts}@test.com`;
    const reg = await api("/api/auth/register", {
      body: {
        role: "DEALER",
        displayName: "Resend User",
        email,
        password: "Password1",
        taxNumber: "TAX-RS",
        policyAccepted: true,
      },
    });
    expect(reg.status).toBe(201);

    // Intentionally no Content-Type / no body — mirrors fixed frontend client
    const res = await fetch(`${API}/api/auth/resend-verification`, {
      method: "POST",
      headers: {
        Cookie: [...reg.jar.entries()].map(([k, v]) => `${k}=${v}`).join("; "),
      },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("invalid and expired-style tokens are rejected", async () => {
    const bad = await api("/api/auth/verify-email", {
      body: { token: "a".repeat(40) },
    });
    expect(bad.status).toBe(400);
    expect(bad.data.error).toMatch(/invalid|expired/i);
  });

  it("verify token cannot be reused", async () => {
    const email = `once${ts}@test.com`;
    const reg = await api("/api/auth/register", {
      body: {
        role: "INSURANCE",
        displayName: "Once Co",
        email,
        password: "Password1",
        phone: "03003334444",
        taxNumber: "NTN-ONCE",
        location: "Lahore",
        policyAccepted: true,
      },
    });
    const token = tokenFromDevUrl(reg.data.devVerificationUrl);
    expect((await api("/api/auth/verify-email", { body: { token } })).status).toBe(
      200,
    );
    expect((await api("/api/auth/verify-email", { body: { token } })).status).toBe(
      400,
    );
  });

  it("full gate: verify then admin approve", async () => {
    const email = `gate${ts}@test.com`;
    const reg = await api("/api/auth/register", {
      body: {
        role: "DEALER",
        displayName: "Gate Dealer",
        email,
        password: "Password1",
        taxNumber: "TAX-GATE",
        policyAccepted: true,
      },
    });
    const token = tokenFromDevUrl(reg.data.devVerificationUrl);
    const verified = await api("/api/auth/verify-email", { body: { token } });
    expect(verified.data.user.emailVerified).toBe(true);
    expect(verified.data.user.status).toBe("PENDING");

    const admin = await api("/api/auth/login", {
      body: { email: "admin@prs.local", password: "Admin@12345" },
    });
    const approve = await api(`/api/admin/users/${verified.data.user.id}`, {
      method: "PATCH",
      body: { action: "approve" },
      jar: admin.jar,
    });
    expect(approve.status).toBe(200);
    expect(approve.data.user.status).toBe("APPROVED");
    expect(approve.data.user.emailVerified).toBe(true);
  });
});
