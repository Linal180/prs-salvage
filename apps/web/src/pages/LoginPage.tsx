import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ZodError } from "zod";
import { useAuth } from "../auth/AuthContext";
import {
  Alert,
  Field,
  Page,
  Shell,
  inputClass,
  inputErrorClass,
} from "../components/ui";
import { api, homePathFor, type ApiError } from "../lib/api";
import {
  detailsToFields,
  fieldErrorsFromZod,
  loginSchema,
} from "../lib/validation";

export function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    try {
      loginSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof ZodError) {
        setFieldErrors(fieldErrorsFromZod(err));
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== "/login" ? from : homePathFor(res.user), {
        replace: true,
      });
    } catch (err) {
      const apiErr = err as ApiError;
      const fields = detailsToFields(apiErr.details, apiErr.fields);
      if (Object.keys(fields).length) {
        setFieldErrors(fields);
      } else {
        setFormError(apiErr.error ?? "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <Page
        title="Login"
        subtitle="Access your PRS account. Suspended accounts cannot sign in."
      >
        <form
          onSubmit={onSubmit}
          noValidate
          className="mx-auto max-w-md space-y-4 rounded-xl border border-line bg-paper p-6"
        >
          {formError && <Alert>{formError}</Alert>}
          <Field label="Email" htmlFor="login-email" error={fieldErrors.email}>
            <input
              id="login-email"
              className={fieldErrors.email ? inputErrorClass : inputClass}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((f) => ({ ...f, email: "" }));
              }}
            />
          </Field>
          <Field
            label="Password"
            htmlFor="login-password"
            error={fieldErrors.password}
          >
            <input
              id="login-password"
              className={fieldErrors.password ? inputErrorClass : inputClass}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((f) => ({ ...f, password: "" }));
              }}
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-prs-600 px-4 py-2.5 font-medium text-white hover:bg-prs-700 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-center text-sm text-muted">
            New to PRS?{" "}
            <Link to="/register" className="font-medium text-prs-700">
              Create an account
            </Link>
          </p>
        </form>
      </Page>
    </Shell>
  );
}
