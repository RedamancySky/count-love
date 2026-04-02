import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  if (!tokenHash || !type) {
    return Response.json(
      { error: { code: "VERIFY_TOKEN_INVALID", message: "Thiếu token xác minh email hợp lệ." } },
      { status: 400 },
    );
  }

  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) {
    return Response.json({ error: { code: "VERIFY_FAILED", message: error.message } }, { status: 400 });
  }

  return Response.json({ message: "Xác minh email thành công." }, { status: 200 });
}
