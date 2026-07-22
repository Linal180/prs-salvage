import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../auth/AuthContext";
import { VerifyEmailConfirmPage } from "../pages/VerifyEmailConfirmPage";
import { VerifyEmailPage } from "../pages/VerifyEmailPage";
import { VerifyEmailSuccessPage } from "../pages/VerifyEmailSuccessPage";

vi.mock("../lib/api", async () => {
  const actual = await vi.importActual<typeof import("../lib/api")>("../lib/api");
  return {
    ...actual,
    api: {
      me: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn().mockResolvedValue({ ok: true }),
      verifyEmail: vi.fn(),
      resendVerification: vi.fn(),
      adminUsers: vi.fn(),
      adminUserAction: vi.fn(),
    },
  };
});

import { api, type User } from "../lib/api";

const verifiedUser: User = {
  id: "1",
  email: "v@test.com",
  role: "DEALER",
  status: "PENDING",
  displayName: "Verified Dealer",
  phone: null,
  taxNumber: "T1",
  location: null,
  policyAcceptedAt: null,
  emailVerifiedAt: new Date().toISOString(),
  emailVerified: true,
  approvedAt: null,
  createdAt: new Date().toISOString(),
};

const unverifiedUser: User = {
  ...verifiedUser,
  emailVerified: false,
  emailVerifiedAt: null,
  displayName: "Unverified",
};

function renderRoutes(initial: string, meUser: User | null) {
  if (meUser) {
    vi.mocked(api.me).mockResolvedValue({ user: meUser });
  } else {
    vi.mocked(api.me).mockRejectedValue({ error: "Unauthorized" });
  }

  return render(
    <MemoryRouter initialEntries={[initial]}>
      <AuthProvider>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-email/confirm" element={<VerifyEmailConfirmPage />} />
          <Route path="/verify-email/success" element={<VerifyEmailSuccessPage />} />
          <Route path="/pending" element={<div>Pending page</div>} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("VerifyEmailPage", () => {
  it("shows resend and can request a new email", async () => {
    const user = userEvent.setup();
    vi.mocked(api.resendVerification).mockResolvedValue({
      ok: true,
      message: "Verification email sent. Check your inbox.",
      emailVerificationSent: true,
      devVerificationUrl: "http://localhost:5173/verify-email/confirm?token=abc",
    });

    renderRoutes("/verify-email", unverifiedUser);

    expect(await screen.findByText(/verify your email/i)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /resend verification email/i }));
    expect(api.resendVerification).toHaveBeenCalled();
    expect(await screen.findByText(/verification email sent/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /verify email/i })).toBeTruthy();
  });
});

describe("VerifyEmailConfirmPage", () => {
  it("calls verify API and lands on success page", async () => {
    vi.mocked(api.verifyEmail).mockResolvedValue({
      user: verifiedUser,
      message: "Email verified successfully.",
    });
    vi.mocked(api.me).mockRejectedValue({ error: "Unauthorized" });

    render(
      <MemoryRouter initialEntries={["/verify-email/confirm?token=goodtoken"]}>
        <AuthProvider>
          <Routes>
            <Route path="/verify-email/confirm" element={<VerifyEmailConfirmPage />} />
            <Route path="/verify-email/success" element={<VerifyEmailSuccessPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(api.verifyEmail).toHaveBeenCalledWith("goodtoken");
    });
    expect(await screen.findByText(/email verified/i)).toBeTruthy();
  });

  it("shows error UI when token missing", async () => {
    vi.mocked(api.me).mockRejectedValue({ error: "Unauthorized" });
    render(
      <MemoryRouter initialEntries={["/verify-email/confirm"]}>
        <AuthProvider>
          <Routes>
            <Route path="/verify-email/confirm" element={<VerifyEmailConfirmPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/missing verification token/i)).toBeTruthy();
  });
});

describe("VerifyEmailSuccessPage", () => {
  it("offers continue to pending when still awaiting approval", async () => {
    renderRoutes("/verify-email/success", verifiedUser);
    expect(await screen.findByText(/email verified/i)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /continue to approval status/i }),
    ).toBeTruthy();
  });
});
