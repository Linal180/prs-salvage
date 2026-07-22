import { describe, expect, it } from "vitest";
import {
  detailsToFields,
  fieldErrorsFromZod,
  loginSchema,
  registerSchemaFor,
} from "./validation";

describe("frontend loginSchema", () => {
  it("shows email and password errors when empty", () => {
    const result = loginSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = fieldErrorsFromZod(result.error);
      expect(fields.email).toBe("Email is required");
      expect(fields.password).toBe("Password is required");
    }
  });

  it("shows invalid email message", () => {
    const result = loginSchema.safeParse({ email: "x", password: "y" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsFromZod(result.error).email).toMatch(/valid email/i);
    }
  });
});

describe("frontend registerSchemaFor", () => {
  it("insurance — all required fields produce messages", () => {
    const result = registerSchemaFor("INSURANCE").safeParse({
      role: "INSURANCE",
      displayName: "",
      email: "",
      password: "",
      phone: "",
      taxNumber: "",
      location: "",
      policyAccepted: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const f = fieldErrorsFromZod(result.error);
      for (const key of [
        "displayName",
        "email",
        "password",
        "phone",
        "taxNumber",
        "location",
        "policyAccepted",
      ]) {
        expect(f[key], `expected error for ${key}`).toBeTruthy();
      }
    }
  });

  it("dealer — tax required, phone optional", () => {
    const ok = registerSchemaFor("DEALER").safeParse({
      role: "DEALER",
      displayName: "Dealer",
      email: "d@test.com",
      password: "Password1",
      taxNumber: "TAX123",
      phone: "",
      location: "",
      policyAccepted: true,
    });
    expect(ok.success).toBe(true);

    const bad = registerSchemaFor("DEALER").safeParse({
      role: "DEALER",
      displayName: "Dealer",
      email: "d@test.com",
      password: "Password1",
      taxNumber: "",
      policyAccepted: true,
    });
    expect(bad.success).toBe(false);
    if (!bad.success) {
      expect(fieldErrorsFromZod(bad.error).taxNumber).toBeTruthy();
    }
  });

  it("private seller — phone required", () => {
    const bad = registerSchemaFor("PRIVATE_SELLER").safeParse({
      role: "PRIVATE_SELLER",
      displayName: "Sara",
      email: "s@test.com",
      password: "Password1",
      phone: "",
      policyAccepted: true,
    });
    expect(bad.success).toBe(false);
    if (!bad.success) {
      expect(fieldErrorsFromZod(bad.error).phone).toBeTruthy();
    }
  });
});

describe("detailsToFields", () => {
  it("prefers fields map from API", () => {
    expect(
      detailsToFields([{ path: "email", message: "a" }], { email: "b" }),
    ).toEqual({ email: "b" });
  });

  it("falls back to details array", () => {
    expect(detailsToFields([{ path: "phone", message: "Phone required" }])).toEqual({
      phone: "Phone required",
    });
  });
});
