import { createClient } from "@/lib/supabase/server";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStrongPassword(value) {
  return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value);
}

export async function POST(request) {
  const supabase = await createClient();
  const body = await request.json();

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const confirmPassword = String(body?.confirmPassword ?? "");

  const details = {};

  if (!name) details.name = "Họ và tên là bắt buộc.";
  if (!isValidEmail(email)) details.email = "Email không đúng định dạng.";

  if (!isStrongPassword(password)) {
    details.password = "Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số.";
  }

  if (confirmPassword !== password) {
    details.confirmPassword = "Mật khẩu xác nhận không khớp.";
  }

  if (Object.keys(details).length > 0) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ.", details } },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    const message = error.message ?? "Đăng ký thất bại.";
    const lower = message.toLowerCase();

    if (lower.includes("already") || lower.includes("registered") || lower.includes("exists")) {
      return Response.json(
        { error: { code: "EMAIL_EXISTS", message: "Email đã được sử dụng.", details: { email: "Email đã được sử dụng." } } },
        { status: 409 },
      );
    }

    return Response.json({ error: { code: "REGISTER_FAILED", message } }, { status: 400 });
  }

  return Response.json(
    {
      message: "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.",
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
    },
    { status: 201 },
  );
}

