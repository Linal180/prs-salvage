import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { homePathFor, roleLabel } from "../lib/api";

export function Shell({
  children,
  bare = false,
}: {
  children: ReactNode;
  bare?: boolean;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-paper/90 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-semibold tracking-tight text-prs-700">
              PRS
            </span>
            <span className="hidden text-xs uppercase tracking-[0.18em] text-muted sm:inline">
              Salvage Auctions
            </span>
          </Link>

          <nav className="flex items-center gap-2 text-sm md:gap-3">
            {!user && (
              <>
                <NavLink
                  to="/login"
                  className="rounded-md px-3 py-2 text-muted hover:text-ink"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-md bg-prs-600 px-3 py-2 font-medium text-white hover:bg-prs-700"
                >
                  Sign Up
                </NavLink>
              </>
            )}
            {user && (
              <>
                {!bare && (
                  <NavLink
                    to={homePathFor(user)}
                    className="rounded-md px-3 py-2 text-muted hover:text-ink"
                  >
                    {user.role === "ADMIN" ? "Admin" : "Dashboard"}
                  </NavLink>
                )}
                <span className="hidden text-muted md:inline">
                  {user.displayName}
                  <span className="text-prs-600"> · {roleLabel(user.role)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => void onLogout()}
                  className="rounded-md border border-line px-3 py-2 text-muted hover:border-prs-300 hover:text-ink"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export function Page({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">
            {title}
          </h1>
          {subtitle && <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
  error,
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  htmlFor?: string;
}) {
  return (
    <div className="block space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-line bg-paper px-3 py-2.5 text-ink outline-none transition focus:border-prs-500 focus:ring-2 focus:ring-prs-100";

export const inputErrorClass =
  "w-full rounded-md border border-red-400 bg-paper px-3 py-2.5 text-ink outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";

export function Alert({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: "error" | "info" | "success";
}) {
  const tones = {
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-prs-200 bg-prs-50 text-prs-800",
    success: "border-prs-300 bg-prs-100 text-prs-900",
  };
  return (
    <div className={`rounded-md border px-3 py-2.5 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}
