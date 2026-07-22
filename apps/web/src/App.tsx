import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { AdminPage } from "./pages/AdminPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { PendingPage } from "./pages/PendingPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyEmailConfirmPage } from "./pages/VerifyEmailConfirmPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { VerifyEmailSuccessPage } from "./pages/VerifyEmailSuccessPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email/confirm" element={<VerifyEmailConfirmPage />} />
          <Route path="/verify-email/success" element={<VerifyEmailSuccessPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/pending" element={<PendingPage />} />
          </Route>

          <Route
            element={
              <RequireAuth
                roles={["INSURANCE", "DEALER", "PRIVATE_SELLER"]}
                statuses={["APPROVED"]}
                requireEmailVerified
              />
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          <Route element={<RequireAuth roles={["ADMIN"]} statuses={["APPROVED"]} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
