import test from "node:test";
import assert from "node:assert/strict";
import { validateCoupleCode, validateOnboardingPayload, validateOauthInput, validateRegisterInput } from "../lib/auth/validation.js";

test("register validation rejects weak password", () => {
  const result = validateRegisterInput({
    name: "A",
    email: "bad-email",
    password: "123",
    confirmPassword: "12",
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.email);
  assert.ok(result.errors.password);
  assert.ok(result.errors.confirmPassword);
});

test("couple code validation accepts 6 chars", () => {
  const result = validateCoupleCode({ code: "love42" });
  assert.equal(result.isValid, true);
  assert.equal(result.value.code, "LOVE42");
});

test("onboarding validation rejects future start date", () => {
  const future = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const result = validateOnboardingPayload({ startDate: future, step: 4 });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.startDate);
});

test("oauth validation rejects unsupported provider", () => {
  const result = validateOauthInput({ provider: "github", email: "test@example.com" });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.provider);
});
