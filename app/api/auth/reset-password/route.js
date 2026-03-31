import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase = await createClient();
  const body = await request.json();
  const password = String(body?.password ?? "");
  const confirmPassword = String(body?.confirmPassword ?? "");

  if (!password) {
    return Response.json({ error: { code: "VALIDATION_ERROR", message: "Mật khẩu mới là bắt buộc." } }, { status: 400 });
  }
  if (confirmPassword && confirmPassword !== password) {
    return Response.json({ error: { code: "VALIDATION_ERROR", message: "Mật khẩu xác nhận không khớp." } }, { status: 400 });
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return Response.json(
      { error: { code: "RESET_TOKEN_INVALID", message: "Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." } },
      { status: 400 },
    );
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return Response.json({ error: { code: "RESET_PASSWORD_FAILED", message: error.message } }, { status: 400 });
  }

  return Response.json({ message: "Đặt lại mật khẩu thành công." }, { status: 200 });
}
