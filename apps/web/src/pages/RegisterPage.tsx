import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import {
  api,
  homePathFor,
  roleLabel,
  type ApiError,
  type Role,
} from "../lib/api";
import {
  detailsToFields,
  fieldErrorsFromZod,
  registerSchemaFor,
} from "../lib/validation";

type RegisterRole = Exclude<Role, "ADMIN">;

const roleOptions: { value: RegisterRole; blurb: string }[] = [
  {
    value: "INSURANCE",
    blurb: "List salvage vehicles and receive dealer bids in your company folder.",
  },
  {
    value: "DEALER",
    blurb: "Browse insurance folders and bid on salvage inventory.",
  },
  {
    value: "PRIVATE_SELLER",
    blurb: "List your accident vehicle and accept or reject offers.",
  },
];

export function RegisterPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = (params.get("role") as RegisterRole | null) ?? "INSURANCE";

  const [role, setRole] = useState<RegisterRole>(
    roleOptions.some((r) => r.value === initialRole) ? initialRole : "INSURANCE",
  );
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [location, setLocation] = useState("");
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nameLabel = useMemo(() => {
    if (role === "INSURANCE") return "Company name";
    if (role === "DEALER") return "Company or personal name";
    return "Full name";
  }, [role]);

  function clearField(name: string) {
    setFieldErrors((f) => {
      if (!f[name]) return f;
      const next = { ...f };
      delete next[name];
      return next;
    });
  }

  function buildBody() {
    const body: Record<string, unknown> = {
      role,
      displayName,
      email,
      password,
      policyAccepted,
      phone,
      taxNumber,
      location,
    };
    return body;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const body = buildBody();
    const schema = registerSchemaFor(role);

    try {
      schema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) {
        setFieldErrors(fieldErrorsFromZod(err));
        return;
      }
    }

    // Strip empty optionals before API (dealer/private)
    const payload: Record<string, unknown> = {
      role,
      displayName,
      email,
      password,
      policyAccepted,
    };
    if (role === "INSURANCE") {
      payload.phone = phone;
      payload.taxNumber = taxNumber;
      payload.location = location;
    } else if (role === "DEALER") {
      payload.taxNumber = taxNumber;
      if (phone.trim()) payload.phone = phone;
      if (location.trim()) payload.location = location;
    } else {
      payload.phone = phone;
      if (location.trim()) payload.location = location;
      if (taxNumber.trim()) payload.taxNumber = taxNumber;
    }

    setLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
      navigate(homePathFor(res.user), { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      const fields = detailsToFields(apiErr.details, apiErr.fields);
      if (Object.keys(fields).length) {
        setFieldErrors(fields);
      } else {
        setFormError(apiErr.error ?? "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }

  function inputCls(name: string) {
    return fieldErrors[name] ? inputErrorClass : inputClass;
  }

  return (
    <Shell>
      <Page
        title="Create your PRS account"
        subtitle="Choose your role, accept the platform policy, and submit for admin approval."
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {roleOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setRole(opt.value);
                  setFieldErrors({});
                  setFormError(null);
                }}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  role === opt.value
                    ? "border-prs-500 bg-prs-50"
                    : "border-line bg-paper hover:border-prs-300"
                }`}
              >
                <div className="font-semibold text-ink">{roleLabel(opt.value)}</div>
                <p className="mt-1 text-sm text-muted">{opt.blurb}</p>
              </button>
            ))}
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="space-y-4 rounded-xl border border-line bg-paper p-6"
          >
            {formError && <Alert>{formError}</Alert>}

            <Field
              label={nameLabel}
              htmlFor="reg-name"
              error={fieldErrors.displayName}
            >
              <input
                id="reg-name"
                className={inputCls("displayName")}
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  clearField("displayName");
                }}
              />
            </Field>

            <Field label="Email" htmlFor="reg-email" error={fieldErrors.email}>
              <input
                id="reg-email"
                className={inputCls("email")}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearField("email");
                }}
              />
            </Field>

            <Field
              label="Password"
              htmlFor="reg-password"
              hint="Minimum 8 characters"
              error={fieldErrors.password}
            >
              <input
                id="reg-password"
                className={inputCls("password")}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearField("password");
                }}
              />
            </Field>

            <Field
              label={role === "DEALER" ? "Phone (optional)" : "Phone"}
              htmlFor="reg-phone"
              error={fieldErrors.phone}
            >
              <input
                id="reg-phone"
                className={inputCls("phone")}
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearField("phone");
                }}
              />
            </Field>

            {(role === "INSURANCE" || role === "DEALER") && (
              <Field
                label={
                  role === "INSURANCE" ? "NTN / tax number" : "Tax / ID number"
                }
                htmlFor="reg-tax"
                error={fieldErrors.taxNumber}
              >
                <input
                  id="reg-tax"
                  className={inputCls("taxNumber")}
                  value={taxNumber}
                  onChange={(e) => {
                    setTaxNumber(e.target.value);
                    clearField("taxNumber");
                  }}
                />
              </Field>
            )}

            {role === "PRIVATE_SELLER" && (
              <Field
                label="Tax / ID (optional)"
                htmlFor="reg-tax"
                error={fieldErrors.taxNumber}
              >
                <input
                  id="reg-tax"
                  className={inputCls("taxNumber")}
                  value={taxNumber}
                  onChange={(e) => {
                    setTaxNumber(e.target.value);
                    clearField("taxNumber");
                  }}
                />
              </Field>
            )}

            <Field
              label={role === "INSURANCE" ? "Location" : "Location (optional)"}
              htmlFor="reg-location"
              error={fieldErrors.location}
            >
              <input
                id="reg-location"
                className={inputCls("location")}
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  clearField("location");
                }}
              />
            </Field>

            <div className="space-y-1.5">
              <label className="flex items-start gap-3 rounded-md border border-line bg-wash p-3 text-sm text-muted">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={policyAccepted}
                  onChange={(e) => {
                    setPolicyAccepted(e.target.checked);
                    clearField("policyAccepted");
                  }}
                />
                <span>
                  I accept the PRS platform policy, including that both seller and
                  winning buyer pay the agreed platform fee after a successful
                  transaction.
                </span>
              </label>
              {fieldErrors.policyAccepted && (
                <p className="text-xs font-medium text-red-700" role="alert">
                  {fieldErrors.policyAccepted}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-prs-600 px-4 py-2.5 font-medium text-white hover:bg-prs-700 disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit registration"}
            </button>

            <p className="text-center text-sm text-muted">
              Already registered?{" "}
              <Link to="/login" className="font-medium text-prs-700">
                Login
              </Link>
            </p>
          </form>
        </div>
      </Page>
    </Shell>
  );
}
