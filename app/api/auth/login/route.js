import { createClient } from "@/lib/supabase/server";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map();

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getAttemptRecord(email) {
  const current = loginAttempts.get(email);
  if (!current) {
    const created = { failedAttempts: 0, lockUntil: 0 };
    loginAttempts.set(email, created);
    return created;
  }
  return current;
}

function lockMessage(lockedMs) {
  const minutes = Math.max(1, Math.ceil(lockedMs / 60000));
  return `Tài khoản tạm khóa do nhập sai quá nhiều lần. Vui lòng thử lại sau ${minutes} phút.`;
}

export async function POST(request) {
  const body = await request.json();

  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const rememberMe = Boolean(body?.rememberMe);

  if (!isValidEmail(email) || !password) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: "Email và mật khẩu là bắt buộc." } },
      { status: 400 },
    );
  }

  const attemptRecord = getAttemptRecord(email);
  if (attemptRecord.lockUntil > Date.now()) {
    return Response.json(
      { error: { code: "ACCOUNT_LOCKED", message: lockMessage(attemptRecord.lockUntil - Date.now()) } },
      { status: 429 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    attemptRecord.failedAttempts += 1;

    if (attemptRecord.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      attemptRecord.failedAttempts = 0;
      attemptRecord.lockUntil = Date.now() + LOCK_WINDOW_MS;

      return Response.json(
        { error: { code: "ACCOUNT_LOCKED", message: lockMessage(LOCK_WINDOW_MS) } },
        { status: 429 },
      );
    }

    const raw = (error.message ?? "").toLowerCase();
    const message = raw.includes("not confirmed")
      ? "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư trước khi đăng nhập."
      : "Email hoặc mật khẩu không đúng.";

    return Response.json({ error: { code: "LOGIN_FAILED", message } }, { status: 401 });
  }

  loginAttempts.delete(email);

  const response = Response.json(
    {
      message: "Đăng nhập thành công.",
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      session: data.session ? { expiresAt: data.session.expires_at, rememberMe } : null,
    },
    { status: 200 },
  );

  response.headers.append(
    "Set-Cookie",
    `countlove_remember_me=${rememberMe ? "1" : "0"}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${rememberMe ? 2592000 : 86400}`,
  );

  return response;
}
