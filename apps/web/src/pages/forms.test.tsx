import type { ReactElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../auth/AuthContext";
import { Shell } from "../components/ui";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";

vi.mock("../lib/api", async () => {
  const actual = await vi.importActual<typeof import("../lib/api")>("../lib/api");
  return {
    ...actual,
    api: {
      me: vi.fn().mockRejectedValue({ error: "Unauthorized" }),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn().mockResolvedValue({ ok: true }),
      adminUsers: vi.fn(),
      adminUserAction: vi.fn(),
    },
  };
});

import { api } from "../lib/api";

function renderAt(ui: ReactElement, route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LoginPage form validation", () => {
  it("shows field errors when submitting empty form", async () => {
    const user = userEvent.setup();
    renderAt(<LoginPage />, "/login");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Email is required")).toBeTruthy();
    expect(screen.getByText("Password is required")).toBeTruthy();
    expect(api.login).not.toHaveBeenCalled();
  });

  it("shows invalid email message", async () => {
    const user = userEvent.setup();
    renderAt(<LoginPage />, "/login");

    await user.type(screen.getByLabelText(/^email$/i), "not-email");
    await user.type(screen.getByLabelText(/^password$/i), "secret");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/valid email/i)).toBeTruthy();
    expect(api.login).not.toHaveBeenCalled();
  });
});

describe("RegisterPage form validation", () => {
  it("shows per-field errors for empty insurance form", async () => {
    const user = userEvent.setup();
    renderAt(<RegisterPage />, "/register?role=INSURANCE");

    await user.click(screen.getByRole("button", { name: /submit registration/i }));

    expect(await screen.findByText(/company name must be at least 2/i)).toBeTruthy();
    expect(screen.getByText("Email is required")).toBeTruthy();
    expect(screen.getByText(/password is required|password must be at least 8/i)).toBeTruthy();
    expect(screen.getByText(/phone must be at least 7/i)).toBeTruthy();
    expect(screen.getByText(/ntn \/ tax number must be at least 3/i)).toBeTruthy();
    expect(screen.getByText(/location must be at least 2/i)).toBeTruthy();
    expect(screen.getByText("You must accept the platform policy")).toBeTruthy();
    expect(api.register).not.toHaveBeenCalled();
  });

  it("role buttons switch context", async () => {
    const user = userEvent.setup();
    renderAt(<RegisterPage />, "/register");

    await user.click(screen.getByRole("button", { name: /salvage dealer/i }));
    expect(screen.getByLabelText(/company or personal name/i)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /private seller/i }));
    expect(screen.getByLabelText(/full name/i)).toBeTruthy();
  });
});

describe("Logout button", () => {
  it("calls api.logout and leaves authenticated chrome", async () => {
    const user = userEvent.setup();
    vi.mocked(api.me).mockResolvedValueOnce({
      user: {
        id: "1",
        email: "u@test.com",
        role: "INSURANCE",
        status: "APPROVED",
        displayName: "Test Co",
        phone: null,
        taxNumber: null,
        location: null,
        policyAcceptedAt: null,
        emailVerifiedAt: new Date().toISOString(),
        emailVerified: true,
        approvedAt: null,
        createdAt: new Date().toISOString(),
      },
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider>
          <Shell>
            <div>Dashboard body</div>
          </Shell>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText(/test co/i)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /logout/i }));
    expect(api.logout).toHaveBeenCalled();
    expect(await screen.findByRole("link", { name: /login/i })).toBeTruthy();
  });
});
