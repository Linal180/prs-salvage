import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Alert, Page, Shell } from "../components/ui";
import { homePathFor, roleLabel } from "../lib/api";

export function PendingPage() {
  const { user, refresh } = useAuth();

  if (user && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (user && user.status !== "PENDING") {
    return <Navigate to={homePathFor(user)} replace />;
  }

  return (
    <Shell>
      <Page
        title="Awaiting approval"
        subtitle="Your email is verified. An administrator must approve your account before you can use the dashboard."
      >
        <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-line bg-paper p-6">
          <Alert tone="success">Email verified</Alert>
          <Alert tone="info">
            Status: <strong>Pending</strong>. You can log out and return later —
            once approved, use “Check status” or login again to open your
            dashboard.
          </Alert>
          {user && (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-line py-2">
                <dt className="text-muted">Name</dt>
                <dd className="font-medium">{user.displayName}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line py-2">
                <dt className="text-muted">Email</dt>
                <dd className="font-medium">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-muted">Role</dt>
                <dd className="font-medium">{roleLabel(user.role)}</dd>
              </div>
            </dl>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-md bg-prs-600 px-4 py-2 text-sm font-medium text-white hover:bg-prs-700"
            >
              Check status
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
