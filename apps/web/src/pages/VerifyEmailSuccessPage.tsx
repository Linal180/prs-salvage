import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Alert, Page, Shell } from "../components/ui";
import { homePathFor } from "../lib/api";

export function VerifyEmailSuccessPage() {
  const { user } = useAuth();
  const next = user ? homePathFor(user) : "/login";
  const nextLabel =
    !user
      ? "Go to login"
      : user.status === "PENDING"
        ? "Continue to approval status"
        : user.role === "ADMIN"
          ? "Go to admin"
          : "Go to dashboard";

  return (
    <Shell>
      <Page
        title="Email verified"
        subtitle="Your email address has been confirmed successfully."
      >
        <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-line bg-paper p-6">
          <Alert tone="success">
            <strong>{user?.email ?? "Your email"}</strong> is verified.
            {user?.status === "PENDING"
              ? " An administrator still needs to approve your account before you can use the dashboard."
              : " You can continue using PRS."}
          </Alert>

          <div className="flex flex-wrap gap-3">
            <Link
              to={next}
              className="rounded-md bg-prs-600 px-4 py-2 text-sm font-medium text-white hover:bg-prs-700"
            >
              {nextLabel}
            </Link>
            <Link to="/" className="text-sm font-medium text-prs-700">
              ← Back to home
            </Link>
          </div>
        </div>
      </Page>
    </Shell>
  );
}
