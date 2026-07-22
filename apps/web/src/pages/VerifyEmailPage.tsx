import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Alert, Page, Shell } from "../components/ui";
import { api, homePathFor, type ApiError } from "../lib/api";

export function VerifyEmailPage() {
  const { user, setUser, refresh } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user?.emailVerified) {
    return <Navigate to={homePathFor(user)} replace />;
  }

  async function resend() {
    setError(null);
    setMessage(null);
    setDevLink(null);
    setLoading(true);
    try {
      const res = await api.resendVerification();
      if (res.user) setUser(res.user);
      setMessage(res.message);
      if (res.devVerificationUrl) setDevLink(res.devVerificationUrl);
      await refresh();
    } catch (err) {
      setError((err as ApiError).error ?? "Could not resend verification email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <Page
        title="Verify your email"
        subtitle="We sent a verification link to your inbox. Open it to confirm your address before admin approval and dashboard access."
      >
        <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-line bg-paper p-6">
          <Alert tone="info">
            Check <strong>{user?.email}</strong> for an email from PRS. The link
            expires in 24 hours.
          </Alert>

          {message && <Alert tone="success">{message}</Alert>}
          {error && <Alert>{error}</Alert>}

          {devLink && (
            <Alert tone="info">
              Development mode — SMTP not configured. Open this link to verify:{" "}
              <a href={devLink} className="font-medium text-prs-700 underline">
                Verify email
              </a>
            </Alert>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => void resend()}
              className="rounded-md bg-prs-600 px-4 py-2 text-sm font-medium text-white hover:bg-prs-700 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Resend verification email"}
            </button>
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-md border border-line px-4 py-2 text-sm font-medium text-muted hover:border-prs-300 hover:text-ink"
            >
              I’ve verified — refresh
            </button>
            <Link to="/" className="text-sm font-medium text-prs-700">
              ← Back to home
            </Link>
          </div>
        </div>
      </Page>
    </Shell>
  );
}
