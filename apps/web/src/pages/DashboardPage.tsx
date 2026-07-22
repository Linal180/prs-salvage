import { useAuth } from "../auth/AuthContext";
import { Page, Shell } from "../components/ui";
import { roleLabel } from "../lib/api";

export function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  const next =
    user.role === "INSURANCE"
      ? "In Phase 2 you will upload salvage vehicles, manage drafts, and publish auctions in your company folder."
      : user.role === "DEALER"
        ? "In Phase 2 you will browse insurance company folders and open vehicle listings."
        : "In Phase 2 you will list your accident vehicle and manage offers.";

  return (
    <Shell>
      <Page
        title={`Welcome, ${user.displayName}`}
        subtitle={`${roleLabel(user.role)} dashboard · account approved`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-paper p-6">
            <h2 className="font-display text-xl font-semibold text-prs-800">
              Phase 1 complete for your account
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{next}</p>
          </div>
          <div className="rounded-xl border border-line bg-prs-50 p-6">
            <h2 className="font-display text-xl font-semibold text-prs-800">
              Account
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Email: {user.email}</li>
              {user.phone && <li>Phone: {user.phone}</li>}
              {user.taxNumber && <li>Tax / ID: {user.taxNumber}</li>}
              {user.location && <li>Location: {user.location}</li>}
            </ul>
          </div>
        </div>
      </Page>
    </Shell>
  );
}
