import { afterAll, beforeAll, describe, expect, it } from "vitest";
import "dotenv/config";

const API = process.env.TEST_API_URL ?? "http://localhost:4000";

type Jar = Map<string, string>;

async function api(
  path: string,
  opts: {
    method?: string;
    body?: unknown;
    jar?: Jar;
  } = {},
) {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.jar?.size) {
    headers.Cookie = [...opts.jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  const res = await fetch(`${API}${path}`, {
    method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const setCookie = res.headers.getSetCookie?.() ?? [];
  const jar = opts.jar ?? new Map<string, string>();
  for (const c of setCookie) {
    const [pair] = c.split(";");
    const eq = pair.indexOf("=");
    if (eq > 0) {
      const name = pair.slice(0, eq);
      const value = pair.slice(eq + 1);
      if (c.toLowerCase().includes("max-age=0") || value === "") {
        jar.delete(name);
      } else {
        jar.set(name, value);
      }
    }
  }

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, jar };
}

const ts = Date.now();

describe("Phase 1 API flows", () => {
  beforeAll(async () => {
    const health = await fetch(`${API}/health`);
    if (!health.ok) {
      throw new Error(`API not reachable at ${API}. Start with npm run dev:api`);
    }
  });

  it("GET /health", async () => {
    const { status, data } = await api("/health");
    expect(status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("POST /api/auth/login — validation field errors", async () => {
    const { status, data } = await api("/api/auth/login", {
      body: { email: "", password: "" },
    });
    expect(status).toBe(400);
    expect(data.fields.email).toBeTruthy();
    expect(data.fields.password).toBeTruthy();
  });

  it("POST /api/auth/login — bad credentials", async () => {
    const { status, data } = await api("/api/auth/login", {
      body: { email: "admin@prs.local", password: "wrong-password" },
    });
    expect(status).toBe(401);
    expect(data.error).toMatch(/invalid/i);
  });

  it("admin login → me → logout clears session", async () => {
    const login = await api("/api/auth/login", {
      body: { email: "admin@prs.local", password: "Admin@12345" },
    });
    expect(login.status).toBe(200);
    expect(login.data.user.role).toBe("ADMIN");
    expect(login.jar.has("prs_token")).toBe(true);

    const me = await api("/api/me", { jar: login.jar });
    expect(me.status).toBe(200);
    expect(me.data.user.email).toBe("admin@prs.local");

    const logout = await api("/api/auth/logout", {
      method: "POST",
      jar: login.jar,
    });
    expect(logout.status).toBe(200);
    expect(logout.data.ok).toBe(true);

    // After clear, cookie should be gone from jar tracking OR /me fails
    const meAfter = await api("/api/me", { jar: logout.jar });
    expect(meAfter.status).toBe(401);
  });

  it("register insurance — per-field validation", async () => {
    const { status, data } = await api("/api/auth/register", {
      body: {
        role: "INSURANCE",
        displayName: "",
        email: "bad",
        password: "1",
        phone: "1",
        taxNumber: "x",
        location: "",
        policyAccepted: false,
      },
    });
    expect(status).toBe(400);
    expect(data.fields.displayName).toBeTruthy();
    expect(data.fields.email).toBeTruthy();
    expect(data.fields.password).toBeTruthy();
    expect(data.fields.phone).toBeTruthy();
    expect(data.fields.taxNumber).toBeTruthy();
    expect(data.fields.location).toBeTruthy();
    expect(data.fields.policyAccepted).toBeTruthy();
  });

  it("admin list users is paginated", async () => {
    const admin = await api("/api/auth/login", {
      body: { email: "admin@prs.local", password: "Admin@12345" },
    });
    expect(admin.status).toBe(200);

    const page1 = await api("/api/admin/users?status=ALL&page=1&pageSize=5", {
      jar: admin.jar,
    });
    expect(page1.status).toBe(200);
    expect(page1.data.pagination).toMatchObject({
      page: 1,
      pageSize: 5,
    });
    expect(page1.data.users.length).toBeLessThanOrEqual(5);
    expect(page1.data.pagination.total).toBeGreaterThanOrEqual(
      page1.data.users.length,
    );

    if (page1.data.pagination.hasNext) {
      const page2 = await api("/api/admin/users?status=ALL&page=2&pageSize=5", {
        jar: admin.jar,
      });
      expect(page2.status).toBe(200);
      expect(page2.data.pagination.page).toBe(2);
      expect(page2.data.users[0]?.id).not.toBe(page1.data.users[0]?.id);
    }
  });

  it("register sends verification and token verifies email", async () => {
    const email = `verify${ts}@test.com`;
    const reg = await api("/api/auth/register", {
      body: {
        role: "DEALER",
        displayName: "Verify Dealer",
        email,
        password: "Password1",
        taxNumber: "TAX-VER",
        policyAccepted: true,
      },
    });
    expect(reg.status).toBe(201);
    expect(reg.data.user.emailVerified).toBe(false);
    expect(reg.data.devVerificationUrl).toBeTruthy();

    const url = new URL(reg.data.devVerificationUrl);
    const token = url.searchParams.get("token");
    expect(token).toBeTruthy();

    const verify = await api("/api/auth/verify-email", {
      body: { token },
    });
    expect(verify.status).toBe(200);
    expect(verify.data.user.emailVerified).toBe(true);

    const again = await api("/api/auth/verify-email", {
      body: { token },
    });
    expect(again.status).toBe(400);
  });

  it("full register → pending → admin approve → dashboard access path", async () => {
    const email = `flow${ts}@test.com`;
    const reg = await api("/api/auth/register", {
      body: {
        role: "INSURANCE",
        displayName: "Flow Insurance",
        email,
        password: "Password1",
        phone: "03001112222",
        taxNumber: "NTN-FLOW",
        location: "Islamabad",
        policyAccepted: true,
      },
    });
    expect(reg.status).toBe(201);
    expect(reg.data.user.status).toBe("PENDING");
    const userId = reg.data.user.id;

    const admin = await api("/api/auth/login", {
      body: { email: "admin@prs.local", password: "Admin@12345" },
    });
    expect(admin.status).toBe(200);

    const pending = await api("/api/admin/users?status=PENDING", {
      jar: admin.jar,
    });
    expect(pending.status).toBe(200);
    expect(pending.data.users.some((u: { id: string }) => u.id === userId)).toBe(
      true,
    );

    const approve = await api(`/api/admin/users/${userId}`, {
      method: "PATCH",
      body: { action: "approve" },
      jar: admin.jar,
    });
    expect(approve.status).toBe(200);
    expect(approve.data.user.status).toBe("APPROVED");

    const me = await api("/api/me", { jar: reg.jar });
    expect(me.status).toBe(200);
    expect(me.data.user.status).toBe("APPROVED");
  });

  it("dealer register + suspend blocks login and live session", async () => {
    const email = `susflow${ts}@test.com`;
    const reg = await api("/api/auth/register", {
      body: {
        role: "DEALER",
        displayName: "Suspend Flow",
        email,
        password: "Password1",
        taxNumber: "TAX-SUS",
        policyAccepted: true,
      },
    });
    expect(reg.status).toBe(201);
    const userId = reg.data.user.id;

    const admin = await api("/api/auth/login", {
      body: { email: "admin@prs.local", password: "Admin@12345" },
    });
    await api(`/api/admin/users/${userId}`, {
      method: "PATCH",
      body: { action: "approve" },
      jar: admin.jar,
    });

    const login = await api("/api/auth/login", {
      body: { email, password: "Password1" },
    });
    expect(login.status).toBe(200);

    await api(`/api/admin/users/${userId}`, {
      method: "PATCH",
      body: { action: "suspend" },
      jar: admin.jar,
    });

    const me = await api("/api/me", { jar: login.jar });
    expect(me.status).toBe(403);
    expect(me.data.status).toBe("SUSPENDED");

    const blocked = await api("/api/auth/login", {
      body: { email, password: "Password1" },
    });
    expect(blocked.status).toBe(403);
  });

  it("duplicate email returns email field error", async () => {
    const { status, data } = await api("/api/auth/register", {
      body: {
        role: "PRIVATE_SELLER",
        displayName: "Dup User",
        email: "admin@prs.local",
        password: "Password1",
        phone: "03009998888",
        policyAccepted: true,
      },
    });
    expect(status).toBe(409);
    expect(data.fields.email).toMatch(/already registered/i);
  });

  it("non-admin cannot access admin routes", async () => {
    const email = `noadmin${ts}@test.com`;
    const reg = await api("/api/auth/register", {
      body: {
        role: "PRIVATE_SELLER",
        displayName: "No Admin",
        email,
        password: "Password1",
        phone: "03005556666",
        policyAccepted: true,
      },
    });
    const { status } = await api("/api/admin/users", { jar: reg.jar });
    expect(status).toBe(403);
  });

  it("private seller + dealer registration happy paths", async () => {
    const priv = await api("/api/auth/register", {
      body: {
        role: "PRIVATE_SELLER",
        displayName: "Sara Private",
        email: `priv${ts}@test.com`,
        password: "Password1",
        phone: "03007778888",
        policyAccepted: true,
      },
    });
    expect(priv.status).toBe(201);

    const dealer = await api("/api/auth/register", {
      body: {
        role: "DEALER",
        displayName: "Dealer Co",
        email: `deal${ts}@test.com`,
        password: "Password1",
        taxNumber: "ID-9999",
        policyAccepted: true,
      },
    });
    expect(dealer.status).toBe(201);
  });
});

afterAll(() => {
  // no-op — live server
});
