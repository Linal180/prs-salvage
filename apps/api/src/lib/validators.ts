import { z } from "zod";

const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters");

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

const emailField = z
  .string({ required_error: "Email is required" })
  .min(1, "Email is required")
  .email("Enter a valid email address");

const optionalPhone = z
  .string()
  .max(30, "Phone must be 30 characters or less")
  .optional()
  .or(z.literal(""))
  .transform((v) => v || undefined)
  .refine((v) => v === undefined || v.length >= 7, {
    message: "Phone must be at least 7 characters",
  });

export const registerInsuranceSchema = z.object({
  role: z.literal("INSURANCE"),
  email: emailField,
  password: passwordSchema,
  displayName: z
    .string({ required_error: "Company name is required" })
    .trim()
    .min(2, "Company name must be at least 2 characters"),
  phone: z
    .string({ required_error: "Phone is required" })
    .min(7, "Phone must be at least 7 characters")
    .max(30, "Phone must be 30 characters or less"),
  taxNumber: z
    .string({ required_error: "NTN / tax number is required" })
    .trim()
    .min(3, "NTN / tax number must be at least 3 characters"),
  location: z
    .string({ required_error: "Location is required" })
    .trim()
    .min(2, "Location must be at least 2 characters"),
  policyAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the platform policy" }),
  }),
});

export const registerDealerSchema = z.object({
  role: z.literal("DEALER"),
  email: emailField,
  password: passwordSchema,
  displayName: z
    .string({ required_error: "Name or company is required" })
    .trim()
    .min(2, "Name or company must be at least 2 characters"),
  taxNumber: z
    .string({ required_error: "Tax / ID number is required" })
    .trim()
    .min(3, "Tax / ID number must be at least 3 characters"),
  phone: optionalPhone,
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
  displayName: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(2, "Full name must be at least 2 characters"),
  phone: z
    .string({ required_error: "Contact phone is required" })
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

export const registerSchema = z.discriminatedUnion("role", [
  registerInsuranceSchema,
  registerDealerSchema,
  registerPrivateSchema,
]);

export type RegisterInput = z.infer<typeof registerSchema>;

export function fieldErrorsFromZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
