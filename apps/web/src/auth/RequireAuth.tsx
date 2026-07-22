import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role, UserStatus } from "../lib/api";

export function RequireAuth({
  roles,
  statuses,
  requireEmailVerified = false,
}: {
  roles?: Role[];
  statuses?: UserStatus[];
  requireEmailVerified?: boolean;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-muted">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.status === "SUSPENDED") {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (requireEmailVerified && !user.emailVerified && user.role !== "ADMIN") {
    return <Navigate to="/verify-email" replace />;
  }

  if (statuses && !statuses.includes(user.status)) {
    if (!user.emailVerified) {
      return <Navigate to="/verify-email" replace />;
    }
    if (user.status === "PENDING") {
      return <Navigate to="/pending" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
