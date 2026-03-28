import assert from "node:assert/strict";
import { validateCoupleCode, validateOnboardingPayload, validateOauthInput, validateRegisterInput } from "../lib/auth/validation.js";
import {
  createCoupleRoom,
  forgotPassword,
  joinCoupleRoom,
  login,
  oauthLogin,
  patchOnboarding,
  register,
  resendVerifyEmail,
  resetPassword,
  verifyEmail,
} from "../lib/auth/service.js";
import { resetAuthStore } from "../lib/auth/store.js";

const tests = [
  function registerValidationRejectsWeakPassword() {
    const result = validateRegisterInput({ name: "A", email: "bad-email", password: "123", confirmPassword: "12" });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.name);
    assert.ok(result.errors.email);
    assert.ok(result.errors.password);
    assert.ok(result.errors.confirmPassword);
  },
  function oauthValidationRejectsUnknownProvider() {
    const result = validateOauthInput({ provider: "github", email: "a@example.com" });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.provider);
  },
  function coupleCodeValidationAccepts6Chars() {
    const result = validateCoupleCode({ code: "love42" });
    assert.equal(result.isValid, true);
    assert.equal(result.value.code, "LOVE42");
  },
  function onboardingValidationRejectsFutureDate() {
    const future = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const result = validateOnboardingPayload({ startDate: future, step: 4 });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.startDate);
  },
  function fullAuthFlow() {
    const reg = register({ name: "Alice", email: "alice@example.com", password: "Password123", confirmPassword: "Password123" });
    assert.equal(reg.ok, true);

    const beforeVerify = login({ email: "alice@example.com", password: "Password123", rememberMe: false });
    assert.equal(beforeVerify.code, "EMAIL_NOT_VERIFIED");

    const resent = resendVerifyEmail({ email: "alice@example.com" });
    assert.equal(resent.ok, true);
    assert.ok(resent.verifyToken);

    const verified = verifyEmail(reg.verifyToken);
    assert.equal(verified.ok, true);

    const signIn = login({ email: "alice@example.com", password: "Password123", rememberMe: true });
    assert.equal(signIn.ok, true);
    assert.ok(signIn.sessionToken);
  },
  function rateLimitLocksOnFifthBadAttempt() {
    const reg = register({ name: "Bob", email: "bob@example.com", password: "Password123", confirmPassword: "Password123" });
    verifyEmail(reg.verifyToken);

    for (let i = 0; i < 4; i += 1) {
      const attempt = login({ email: "bob@example.com", password: "Wrong1234", rememberMe: false });
      assert.equal(attempt.code, "WRONG_PASSWORD");
    }

    const locked = login({ email: "bob@example.com", password: "Wrong1234", rememberMe: false });
    assert.equal(locked.code, "ACCOUNT_LOCKED");

    const stillLocked = login({ email: "bob@example.com", password: "Password123", rememberMe: false });
    assert.equal(stillLocked.code, "ACCOUNT_LOCKED");
  },
  function forgotResetPasswordSingleUseToken() {
    const reg = register({ name: "Chris", email: "chris@example.com", password: "Password123", confirmPassword: "Password123" });
    verifyEmail(reg.verifyToken);

    const forgot = forgotPassword({ email: "chris@example.com" });
    assert.equal(forgot.ok, true);

    const reset = resetPassword({ token: forgot.resetToken, password: "Newpass123", confirmPassword: "Newpass123" });
    assert.equal(reset.ok, true);

    const reused = resetPassword({ token: forgot.resetToken, password: "Another123", confirmPassword: "Another123" });
    assert.equal(reused.code, "RESET_TOKEN_INVALID");
  },
  function oauthMergesWithExistingEmailPasswordAccount() {
    const reg = register({ name: "Merge Me", email: "merge@example.com", password: "Password123", confirmPassword: "Password123" });
    verifyEmail(reg.verifyToken);

    const oauth = oauthLogin({ provider: "google", email: "merge@example.com", providerAccountId: "google-merge-id" });
    assert.equal(oauth.ok, true);
    assert.equal(oauth.user.id, reg.user.id);
    assert.ok(oauth.user.oauthProviders.includes("google"));

    const pwdLogin = login({ email: "merge@example.com", password: "Password123", rememberMe: false });
    assert.equal(pwdLogin.ok, true);
  },
  function coupleAndOnboardingFlow() {
    const a = register({ name: "A User", email: "a1@example.com", password: "Password123", confirmPassword: "Password123" });
    const b = register({ name: "B User", email: "b1@example.com", password: "Password123", confirmPassword: "Password123" });

    verifyEmail(a.verifyToken);
    verifyEmail(b.verifyToken);

    const room = createCoupleRoom(a.user.id);
    assert.equal(room.ok, true);

    const join = joinCoupleRoom(b.user.id, { invitePayload: room.couple.qrCodePayload });
    assert.equal(join.ok, true);

    const onbStep2 = patchOnboarding(a.user.id, {
      step: 2,
      nickname: "A",
      birthDate: "2000-01-01",
      bio: "Bio",
    });
    assert.equal(onbStep2.ok, true);

    const onb = patchOnboarding(a.user.id, {
      step: 6,
      startDate: "2020-01-01",
      themeName: "ocean",
      coupleTitle: "A+B",
    });
    assert.equal(onb.ok, true);
    assert.equal(onb.user.onboardingCompleted, true);
  },
];

let failed = 0;
for (const fn of tests) {
  try {
    resetAuthStore();
    fn();
    console.log(`PASS ${fn.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${fn.name}`);
    console.error(error);
  }
}

if (failed > 0) {
  console.error(`\n${failed} tests failed.`);
  process.exit(1);
}

console.log(`\nAll ${tests.length} tests passed.`);
