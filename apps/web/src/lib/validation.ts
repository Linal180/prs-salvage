import { z } from "zod";

/** Client-side schemas — keep messages aligned with API validators. */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters");

const emailField = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const registerInsuranceSchema = z.object({
  role: z.literal("INSURANCE"),
  email: emailField,
  password: passwordSchema,
  displayName: z.string().trim().min(2, "Company name must be at least 2 characters"),
  phone: z
    .string()
    .min(7, "Phone must be at least 7 characters")
    .max(30, "Phone must be 30 characters or less"),
  taxNumber: z.string().trim().min(3, "NTN / tax number must be at least 3 characters"),
  location: z.string().trim().min(2, "Location must be at least 2 characters"),
  policyAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the platform policy" }),
  }),
});

export const registerDealerSchema = z.object({
  role: z.literal("DEALER"),
  email: emailField,
  password: passwordSchema,
  displayName: z
    .string()
    .trim()
    .min(2, "Name or company must be at least 2 characters"),
  taxNumber: z.string().trim().min(3, "Tax / ID number must be at least 3 characters"),
  phone: z
    .string()
    .max(30, "Phone must be 30 characters or less")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined)
    .refine((v) => v === undefined || v.length >= 7, {
      message: "Phone must be at least 7 characters",
    }),
  location: z
    .string()
    .max(200, "Location must be 200 characters or less")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  policyAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the platform policy" }),
  }),
});

export const registerPrivateSchema = z.object({
  role: z.literal("PRIVATE_SELLER"),
  email: emailField,
  password: passwordSchema,
  displayName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .min(7, "Contact phone must be at least 7 characters")
    .max(30, "Contact phone must be 30 characters or less"),
  location: z
    .string()
    .max(200, "Location must be 200 characters or less")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  taxNumber: z
    .string()
    .max(50, "Tax / ID must be 50 characters or less")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  policyAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the platform policy" }),
  }),
});

export function registerSchemaFor(role: "INSURANCE" | "DEALER" | "PRIVATE_SELLER") {
  if (role === "INSURANCE") return registerInsuranceSchema;
  if (role === "DEALER") return registerDealerSchema;
  return registerPrivateSchema;
}

export function fieldErrorsFromZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function detailsToFields(
  details?: { path: string; message: string }[],
  fields?: Record<string, string>,
): Record<string, string> {
  if (fields && Object.keys(fields).length) return fields;
  const out: Record<string, string> = {};
  for (const d of details ?? []) {
    if (d.path && !out[d.path]) out[d.path] = d.message;
  }
  return out;
}
