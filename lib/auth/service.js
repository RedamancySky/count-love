import crypto from "node:crypto";
import { authStore, nextId } from "./store.js";
import {
  validateCoupleCode,
  validateForgotPasswordInput,
  validateLoginInput,
  validateOauthInput,
  validateOnboardingPayload,
  validateRegisterInput,
  validateResetPasswordInput,
} from "./validation.js";
import { resetPasswordTemplate, verifyEmailTemplate, welcomeTemplate } from "./email-templates.js";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const LOCK_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

function hashPassword(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function newToken(prefix) {
  return `${prefix}_${crypto.randomBytes(16).toString("hex")}`;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    onboardingStep: user.onboardingStep,
    onboardingCompleted: user.onboardingCompleted,
    coupleId: user.coupleId,
    nickname: user.nickname,
    birthDate: user.birthDate,
    bio: user.bio,
    avatar: user.avatar,
    oauthProviders: user.oauthProviders ?? [],
  };
}

function buildValidationError(details) {
  return {
    ok: false,
    status: 400,
    code: "VALIDATION_ERROR",
    details,
  };
}

function createSession(store, user, rememberMe) {
  const sessionToken = newToken("session");
  const expiresAt = Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000;
  store.sessionsByToken.set(sessionToken, { token: sessionToken, userId: user.id, expiresAt });
  return { sessionToken, expiresAt };
}

function issueVerifyToken(store, userId) {
  const token = newToken("verify");
  store.verifyTokens.set(token, {
    token,
    userId,
    expiresAt: Date.now() + VERIFY_TTL_MS,
    used: false,
  });
  return token;
}

function defaultUserShape({ id, name, email, passwordHash }) {
  return {
    id,
    name,
    email,
    passwordHash,
    emailVerified: null,
    failedAttempts: 0,
    lockUntil: null,
    onboardingStep: 1,
    onboardingCompleted: false,
    coupleId: null,
    nickname: null,
    birthDate: null,
    bio: null,
    avatar: null,
    oauthProviders: [],
  };
}

function generateCoupleCode(store) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < 20; i += 1) {
    let code = "";
    for (let x = 0; x < 6; x += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    if (!store.couplesByCode.has(code)) return code;
  }
  throw new Error("Khong the tao ma ket noi.");
}

function parseCodeFromInvitePayload(invitePayload) {
  if (!invitePayload) return "";
  const raw = String(invitePayload).trim();
  if (!raw) return "";

  const queryMatch = raw.match(/[?&]code=([A-Z0-9]{6})/i);
  if (queryMatch) return queryMatch[1].toUpperCase();

  const directMatch = raw.match(/\b([A-Z0-9]{6})\b/i);
  if (directMatch) return directMatch[1].toUpperCase();

  return "";
}

function normalizeOauthEmail({ provider, providerAccountId, email }) {
  if (email) return email;
  const normalizedAccount = providerAccountId.replace(/[^a-z0-9]/gi, "").toLowerCase() || "user";
  return `${normalizedAccount}@${provider}.oauth.local`;
}

export function register(payload) {
  const checked = validateRegisterInput(payload);
  if (!checked.isValid) return buildValidationError(checked.errors);

  const store = authStore();
  if (store.usersByEmail.has(checked.value.email)) {
    return { ok: false, status: 409, code: "EMAIL_EXISTS", message: "Email da duoc su dung." };
  }

  const user = defaultUserShape({
    id: nextId("usr"),
    name: checked.value.name,
    email: checked.value.email,
    passwordHash: hashPassword(checked.value.password),
  });

  store.users.set(user.id, user);
  store.usersByEmail.set(user.email, user.id);

  const token = issueVerifyToken(store, user.id);
  const verifyLink = `/verify-email?token=${token}`;

  return {
    ok: true,
    status: 201,
    user: sanitizeUser(user),
    verifyToken: token,
    emailPreview: verifyEmailTemplate(verifyLink),
    message: "Dang ky thanh cong. Vui long kiem tra email de xac nhan.",
  };
}

export function resendVerifyEmail(payload) {
  const checked = validateForgotPasswordInput(payload);
  if (!checked.isValid) return buildValidationError(checked.errors);

  const store = authStore();
  const userId = store.usersByEmail.get(checked.value.email);
  if (!userId) {
    return {
      ok: true,
      status: 200,
      message: "Neu email ton tai, chung toi da gui lai link xac nhan.",
    };
  }

  const user = store.users.get(userId);
  if (!user) {
    return {
      ok: true,
      status: 200,
      message: "Neu email ton tai, chung toi da gui lai link xac nhan.",
    };
  }

  if (user.emailVerified) {
    return {
      ok: true,
      status: 200,
      message: "Email nay da duoc xac nhan truoc do.",
    };
  }

  const token = issueVerifyToken(store, user.id);
  const verifyLink = `/verify-email?token=${token}`;
  return {
    ok: true,
    status: 200,
    verifyToken: token,
    emailPreview: verifyEmailTemplate(verifyLink),
    message: "Da gui lai link xac nhan email.",
  };
}

export function verifyEmail(token) {
  const store = authStore();
  const record = store.verifyTokens.get(String(token ?? ""));
  if (!record || record.used || record.expiresAt < Date.now()) {
    return { ok: false, status: 400, code: "VERIFY_TOKEN_INVALID", message: "Link xac nhan khong hop le hoac da het han." };
  }

  const user = store.users.get(record.userId);
  if (!user) return { ok: false, status: 404, code: "USER_NOT_FOUND", message: "Khong tim thay tai khoan." };

  record.used = true;
  user.emailVerified = new Date().toISOString();

  return {
    ok: true,
    status: 200,
    user: sanitizeUser(user),
    emailPreview: welcomeTemplate(),
    message: "Xac nhan email thanh cong.",
  };
}

export function login(payload) {
  const checked = validateLoginInput(payload);
  if (!checked.isValid) return buildValidationError(checked.errors);

  const store = authStore();
  const userId = store.usersByEmail.get(checked.value.email);
  if (!userId) {
    return { ok: false, status: 404, code: "EMAIL_NOT_FOUND", message: "Email khong ton tai." };
  }

  const user = store.users.get(userId);
  if (!user) return { ok: false, status: 404, code: "USER_NOT_FOUND", message: "Khong tim thay tai khoan." };

  if (user.lockUntil && user.lockUntil > Date.now()) {
    return { ok: false, status: 429, code: "ACCOUNT_LOCKED", message: "Tai khoan dang bi khoa tam thoi do dang nhap sai qua nhieu lan." };
  }
  if (!user.emailVerified) {
    return { ok: false, status: 403, code: "EMAIL_NOT_VERIFIED", message: "Vui long xac nhan email truoc khi dang nhap." };
  }
  if (!user.passwordHash) {
    return {
      ok: false,
      status: 400,
      code: "PASSWORD_LOGIN_DISABLED",
      message: "Tai khoan nay duoc tao qua OAuth. Vui long dang nhap bang Google/Facebook.",
    };
  }

  if (user.passwordHash !== hashPassword(checked.value.password)) {
    user.failedAttempts += 1;

    if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = Date.now() + LOCK_WINDOW_MS;
      user.failedAttempts = 0;
      return {
        ok: false,
        status: 429,
        code: "ACCOUNT_LOCKED",
        message: "Tai khoan da bi khoa 15 phut sau 5 lan dang nhap sai lien tiep.",
      };
    }

    return { ok: false, status: 401, code: "WRONG_PASSWORD", message: "Mat khau khong chinh xac." };
  }

  user.failedAttempts = 0;
  user.lockUntil = null;

  const session = createSession(store, user, checked.value.rememberMe);
  return {
    ok: true,
    status: 200,
    sessionToken: session.sessionToken,
    expiresAt: session.expiresAt,
    user: sanitizeUser(user),
    message: "Dang nhap thanh cong.",
  };
}

export function oauthLogin(payload) {
  const checked = validateOauthInput(payload);
  if (!checked.isValid) return buildValidationError(checked.errors);

  const { provider, email, name, providerAccountId, rememberMe } = checked.value;
  const oauthKey = `${provider}:${providerAccountId}`;
  const store = authStore();

  let user = null;
  const linkedUserId = store.oauthAccounts.get(oauthKey);
  if (linkedUserId) {
    user = store.users.get(linkedUserId) ?? null;
  }

  if (!user && email) {
    const existingByEmail = store.usersByEmail.get(email);
    if (existingByEmail) {
      user = store.users.get(existingByEmail) ?? null;
    }
  }

  if (!user) {
    const normalizedEmail = normalizeOauthEmail({ provider, providerAccountId, email });
    user = defaultUserShape({
      id: nextId("usr"),
      name: name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      passwordHash: null,
    });
    user.emailVerified = new Date().toISOString();

    store.users.set(user.id, user);
    store.usersByEmail.set(user.email, user.id);
  }

  if (!Array.isArray(user.oauthProviders)) {
    user.oauthProviders = [];
  }
  if (!user.oauthProviders.includes(provider)) {
    user.oauthProviders.push(provider);
  }
  if (!user.emailVerified) {
    user.emailVerified = new Date().toISOString();
  }
  if (!user.name && name) {
    user.name = name;
  }

  store.oauthAccounts.set(oauthKey, user.id);

  const session = createSession(store, user, rememberMe);
  return {
    ok: true,
    status: 200,
    sessionToken: session.sessionToken,
    expiresAt: session.expiresAt,
    user: sanitizeUser(user),
    message: `Dang nhap ${provider} thanh cong.`,
  };
}

export function forgotPassword(payload) {
  const checked = validateForgotPasswordInput(payload);
  if (!checked.isValid) return buildValidationError(checked.errors);

  const store = authStore();
  const userId = store.usersByEmail.get(checked.value.email);
  if (!userId) {
    return { ok: true, status: 200, message: "Neu email ton tai, chung toi da gui link dat lai mat khau." };
  }

  const token = newToken("reset");
  store.resetTokens.set(token, {
    token,
    userId,
    used: false,
    expiresAt: Date.now() + RESET_TTL_MS,
  });

  const resetLink = `/reset-password?token=${token}`;
  return {
    ok: true,
    status: 200,
    resetToken: token,
    emailPreview: resetPasswordTemplate(resetLink),
    message: "Neu email ton tai, chung toi da gui link dat lai mat khau.",
  };
}

export function resetPassword(payload) {
  const checked = validateResetPasswordInput(payload);
  if (!checked.isValid) return buildValidationError(checked.errors);

  const store = authStore();
  const tokenRecord = store.resetTokens.get(checked.value.token);
  if (!tokenRecord || tokenRecord.used || tokenRecord.expiresAt < Date.now()) {
    return { ok: false, status: 400, code: "RESET_TOKEN_INVALID", message: "Link dat lai mat khau khong hop le hoac da het han." };
  }

  const user = store.users.get(tokenRecord.userId);
  if (!user) return { ok: false, status: 404, code: "USER_NOT_FOUND", message: "Khong tim thay tai khoan." };

  tokenRecord.used = true;
  user.passwordHash = hashPassword(checked.value.password);
  user.failedAttempts = 0;
  user.lockUntil = null;

  return { ok: true, status: 200, message: "Dat lai mat khau thanh cong." };
}

export function createCoupleRoom(userId) {
  const store = authStore();
  const user = store.users.get(String(userId ?? ""));
  if (!user) return { ok: false, status: 401, code: "UNAUTHORIZED", message: "Ban chua dang nhap." };
  if (user.coupleId) return { ok: false, status: 409, code: "COUPLE_EXISTS", message: "Ban da co cap doi." };

  const code = generateCoupleCode(store);
  const qrCodePayload = `countlove://couple/join?code=${code}`;

  const couple = {
    id: nextId("cpl"),
    user1Id: user.id,
    user2Id: null,
    startDate: null,
    themeName: "rose",
    coupleTitle: null,
    coupleCode: code,
    status: "PENDING",
    expiresAt: Date.now() + VERIFY_TTL_MS,
  };

  user.coupleId = couple.id;
  store.couplesById.set(couple.id, couple);
  store.couplesByCode.set(couple.coupleCode, couple.id);

  return {
    ok: true,
    status: 201,
    couple: {
      id: couple.id,
      coupleCode: code,
      qrCodePayload,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrCodePayload)}`,
    },
  };
}

export function joinCoupleRoom(userId, payload) {
  const normalizedPayload = {
    ...payload,
    code: payload?.code || parseCodeFromInvitePayload(payload?.invitePayload),
  };

  const checked = validateCoupleCode(normalizedPayload);
  if (!checked.isValid) return buildValidationError(checked.errors);

  const store = authStore();
  const user = store.users.get(String(userId ?? ""));
  if (!user) return { ok: false, status: 401, code: "UNAUTHORIZED", message: "Ban chua dang nhap." };
  if (user.coupleId) return { ok: false, status: 409, code: "COUPLE_EXISTS", message: "Ban da co cap doi." };

  const coupleId = store.couplesByCode.get(checked.value.code);
  if (!coupleId) return { ok: false, status: 404, code: "COUPLE_NOT_FOUND", message: "Ma ket noi khong ton tai." };

  const couple = store.couplesById.get(coupleId);
  if (!couple || couple.expiresAt < Date.now()) {
    return { ok: false, status: 400, code: "COUPLE_CODE_EXPIRED", message: "Ma ket noi da het han." };
  }
  if (couple.user2Id) {
    return { ok: false, status: 409, code: "COUPLE_FULL", message: "Phong ket noi da du 2 nguoi." };
  }
  if (couple.user1Id === user.id) {
    return { ok: false, status: 400, code: "INVALID_SELF_JOIN", message: "Ban khong the tu tham gia phong cua chinh minh." };
  }

  couple.user2Id = user.id;
  couple.status = "ACTIVE";
  user.coupleId = couple.id;

  return { ok: true, status: 200, couple };
}

export function getCoupleStatus(userId) {
  const store = authStore();
  const user = store.users.get(String(userId ?? ""));
  if (!user) return { ok: false, status: 401, code: "UNAUTHORIZED", message: "Ban chua dang nhap." };
  if (!user.coupleId) return { ok: false, status: 404, code: "COUPLE_NOT_FOUND", message: "Ban chua tao/tham gia phong." };

  const couple = store.couplesById.get(user.coupleId);
  if (!couple) return { ok: false, status: 404, code: "COUPLE_NOT_FOUND", message: "Khong tim thay phong." };

  return {
    ok: true,
    status: 200,
    couple,
    waitingForPartner: !couple.user2Id,
  };
}

export function patchOnboarding(userId, payload) {
  const checked = validateOnboardingPayload(payload);
  if (!checked.isValid) return buildValidationError(checked.errors);

  const store = authStore();
  const user = store.users.get(String(userId ?? ""));
  if (!user) return { ok: false, status: 401, code: "UNAUTHORIZED", message: "Ban chua dang nhap." };

  const { nickname, birthDate, bio, avatar, startDate, themeName, coupleTitle, step } = checked.value;

  const nicknameAfterPatch = nickname ?? user.nickname;
  const birthDateAfterPatch = birthDate ? birthDate.toISOString() : user.birthDate;

  if (step != null && step >= 2) {
    const details = {};
    if (!nicknameAfterPatch) details.nickname = "Ten hien thi la bat buoc.";
    if (!birthDateAfterPatch) details.birthDate = "Ngay sinh la bat buoc.";
    if (Object.keys(details).length > 0) return buildValidationError(details);
  }

  if (nickname != null) user.nickname = nickname;
  if (birthDate != null) user.birthDate = birthDate.toISOString();
  if (bio != null) user.bio = bio;
  if (avatar != null) user.avatar = avatar;

  if (step != null) {
    user.onboardingStep = Math.max(user.onboardingStep ?? 1, step);
    user.onboardingCompleted = step >= 6;
  }

  let couple = null;
  if (user.coupleId) {
    couple = store.couplesById.get(user.coupleId) ?? null;
    if (couple && startDate != null) couple.startDate = startDate.toISOString();
    if (couple && themeName != null) couple.themeName = themeName;
    if (couple && coupleTitle != null) couple.coupleTitle = coupleTitle;
  }

  return {
    ok: true,
    status: 200,
    user: sanitizeUser(user),
    couple,
    message: "Luu onboarding thanh cong.",
  };
}

export function oauthNotReady(provider) {
  return {
    ok: false,
    status: 501,
    code: "OAUTH_NOT_CONFIGURED",
    message: `OAuth provider '${provider}' chua duoc cau hinh trong moi truong hien tai.`,
  };
}

export function getUserBySessionToken(token) {
  const store = authStore();
  const session = store.sessionsByToken.get(String(token ?? ""));
  if (!session || session.expiresAt < Date.now()) return null;
  return store.users.get(session.userId) ?? null;
}
