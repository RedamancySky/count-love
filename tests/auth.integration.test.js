import test from "node:test";
import assert from "node:assert/strict";
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

test("full auth flow: register -> verify -> login", () => {
  resetAuthStore();

  const reg = register({
    name: "Alice",
    email: "alice@example.com",
    password: "Password123",
    confirmPassword: "Password123",
  });
  assert.equal(reg.ok, true);

  const beforeVerify = login({ email: "alice@example.com", password: "Password123", rememberMe: false });
  assert.equal(beforeVerify.ok, false);
  assert.equal(beforeVerify.code, "EMAIL_NOT_VERIFIED");

  const resent = resendVerifyEmail({ email: "alice@example.com" });
  assert.equal(resent.ok, true);
  assert.ok(resent.verifyToken);

  const verified = verifyEmail(reg.verifyToken);
  assert.equal(verified.ok, true);

  const signIn = login({ email: "alice@example.com", password: "Password123", rememberMe: true });
  assert.equal(signIn.ok, true);
  assert.ok(signIn.sessionToken);
});

test("rate limit locks on 5th invalid attempt", () => {
  resetAuthStore();

  const reg = register({
    name: "Bob",
    email: "bob@example.com",
    password: "Password123",
    confirmPassword: "Password123",
  });
  verifyEmail(reg.verifyToken);

  for (let i = 0; i < 4; i += 1) {
    const attempt = login({ email: "bob@example.com", password: "Wrong1234", rememberMe: false });
    assert.equal(attempt.code, "WRONG_PASSWORD");
  }

  const locked = login({ email: "bob@example.com", password: "Wrong1234", rememberMe: false });
  assert.equal(locked.code, "ACCOUNT_LOCKED");
});

test("forgot/reset password single-use token", () => {
  resetAuthStore();

  const reg = register({
    name: "Chris",
    email: "chris@example.com",
    password: "Password123",
    confirmPassword: "Password123",
  });
  verifyEmail(reg.verifyToken);

  const forgot = forgotPassword({ email: "chris@example.com" });
  assert.equal(forgot.ok, true);
  assert.ok(forgot.resetToken);

  const reset = resetPassword({ token: forgot.resetToken, password: "Newpass123", confirmPassword: "Newpass123" });
  assert.equal(reset.ok, true);

  const reused = resetPassword({ token: forgot.resetToken, password: "Another123", confirmPassword: "Another123" });
  assert.equal(reused.ok, false);
  assert.equal(reused.code, "RESET_TOKEN_INVALID");
});

test("oauth merges with email/password account", () => {
  resetAuthStore();

  const reg = register({
    name: "Merge",
    email: "merge@example.com",
    password: "Password123",
    confirmPassword: "Password123",
  });
  verifyEmail(reg.verifyToken);

  const oauth = oauthLogin({ provider: "google", email: "merge@example.com", providerAccountId: "google-merge" });
  assert.equal(oauth.ok, true);
  assert.equal(oauth.user.id, reg.user.id);

  const pwd = login({ email: "merge@example.com", password: "Password123", rememberMe: false });
  assert.equal(pwd.ok, true);
});

test("couple create/join and onboarding patch", () => {
  resetAuthStore();

  const a = register({ name: "A", email: "a1@example.com", password: "Password123", confirmPassword: "Password123" });
  const b = register({ name: "B", email: "b1@example.com", password: "Password123", confirmPassword: "Password123" });
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
});
