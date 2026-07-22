import { describe, expect, it } from "vitest";
import {
  fieldErrorsFromZod,
  loginSchema,
  registerDealerSchema,
  registerInsuranceSchema,
  registerPrivateSchema,
} from "./validators.js";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(loginSchema.parse({ email: "a@b.com", password: "x" })).toEqual({
      email: "a@b.com",
      password: "x",
    });
  });

  it("requires email and password with field messages", () => {
    const err = loginSchema.safeParse({ email: "", password: "" });
    expect(err.success).toBe(false);
    if (!err.success) {
      const fields = fieldErrorsFromZod(err.error);
      expect(fields.email).toMatch(/email/i);
      expect(fields.password).toMatch(/required/i);
    }
  });

  it("rejects invalid email format", () => {
    const err = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(err.success).toBe(false);
    if (!err.success) {
      expect(fieldErrorsFromZod(err.error).email).toMatch(/valid email/i);
    }
  });
});

describe("registerInsuranceSchema", () => {
  const valid = {
    role: "INSURANCE" as const,
    displayName: "EFU",
    email: "efu@test.com",
    password: "Password1",
    phone: "03001234567",
    taxNumber: "NTN123",
    location: "Karachi",
    policyAccepted: true as const,
  };

  it("accepts a complete insurance registration", () => {
    expect(registerInsuranceSchema.parse(valid).displayName).toBe("EFU");
  });

  it("returns per-field errors when empty", () => {
    const err = registerInsuranceSchema.safeParse({
      role: "INSURANCE",
      displayName: "",
      email: "",
      password: "",
      phone: "",
      taxNumber: "",
      location: "",
      policyAccepted: false,
    });
    expect(err.success).toBe(false);
    if (!err.success) {
      const f = fieldErrorsFromZod(err.error);
      expect(f.displayName).toBeTruthy();
      expect(f.email).toBeTruthy();
      expect(f.password).toBeTruthy();
      expect(f.phone).toBeTruthy();
      expect(f.taxNumber).toBeTruthy();
      expect(f.location).toBeTruthy();
      expect(f.policyAccepted).toMatch(/policy/i);
    }
  });

  it("rejects short password", () => {
    const err = registerInsuranceSchema.safeParse({ ...valid, password: "short" });
    expect(err.success).toBe(false);
    if (!err.success) {
      expect(fieldErrorsFromZod(err.error).password).toMatch(/8 characters/i);
    }
  });
});

describe("registerDealerSchema", () => {
  it("allows optional phone when empty", () => {
    const parsed = registerDealerSchema.parse({
      role: "DEALER",
      displayName: "Ali Motors",
      email: "ali@test.com",
      password: "Password1",
      taxNumber: "CNIC123",
      phone: "",
      location: "",
      policyAccepted: true,
    });
    expect(parsed.phone).toBeUndefined();
  });

  it("rejects short optional phone when provided", () => {
    const err = registerDealerSchema.safeParse({
      role: "DEALER",
      displayName: "Ali Motors",
      email: "ali@test.com",
      password: "Password1",
      taxNumber: "CNIC123",
      phone: "123",
      policyAccepted: true,
    });
    expect(err.success).toBe(false);
    if (!err.success) {
      expect(fieldErrorsFromZod(err.error).phone).toMatch(/7 characters/i);
    }
  });
});

describe("registerPrivateSchema", () => {
  it("requires phone and name", () => {
    const err = registerPrivateSchema.safeParse({
      role: "PRIVATE_SELLER",
      displayName: "A",
      email: "bad",
      password: "123",
      phone: "1",
      policyAccepted: false,
    });
    expect(err.success).toBe(false);
    if (!err.success) {
      const f = fieldErrorsFromZod(err.error);
      expect(f.displayName).toBeTruthy();
      expect(f.email).toBeTruthy();
      expect(f.password).toBeTruthy();
      expect(f.phone).toBeTruthy();
      expect(f.policyAccepted).toBeTruthy();
    }
  });
});
