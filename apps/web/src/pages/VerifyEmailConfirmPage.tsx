import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Alert, Page, Shell } from "../components/ui";
import { api, type ApiError } from "../lib/api";

/**
 * Public page opened from the email link.
 * Runs verification once, then routes to the success screen.
 */
export function VerifyEmailConfirmPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!token) {
      setError("Missing verification token. Open the link from your email again.");
      return;
    }

    // React Strict Mode mounts twice — guard so the one-time token is not burned.
    if (started.current) return;
    started.current = true;

    void (async () => {
      try {
        const res = await api.verifyEmail(token);
        setUser(res.user);
        navigate("/verify-email/success", { replace: true });
      } catch (err) {
        // Token may already be used (e.g. double-click). If session is verified, succeed.
        try {
          const me = await api.me();
          if (me.user.emailVerified) {
            setUser(me.user);
            navigate("/verify-email/success", { replace: true });
            return;
          }
        } catch {
          // not logged in
        }
        setError((err as ApiError).error ?? "Verification failed");
      }
    })();
  }, [token, setUser, navigate]);

  return (
    <Shell>
      <Page
        title="Verifying email"
        subtitle="Please wait while we confirm your address."
      >
        <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-line bg-paper p-6">
          {!error && <Alert tone="info">Confirming your email…</Alert>}
          {error && (
            <>
              <Alert>{error}</Alert>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/verify-email"
                  className="rounded-md bg-prs-600 px-4 py-2 text-sm font-medium text-white hover:bg-prs-700"
                >
                  Request a new link
                </Link>
                <Link to="/login" className="text-sm font-medium text-prs-700">
                  Login
                </Link>
              </div>
            </>
          )}
        </div>
      </Page>
    </Shell>
  );
}
