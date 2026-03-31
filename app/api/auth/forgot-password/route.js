import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase = await createClient();
  const body = await request.json();

  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email) {
    return Response.json({ error: { code: "VALIDATION_ERROR", message: "Email là bắt buộc." } }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return Response.json({ error: { code: "FORGOT_PASSWORD_FAILED", message: error.message } }, { status: 400 });
  }

  return Response.json({ message: "Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi." }, { status: 200 });
}
