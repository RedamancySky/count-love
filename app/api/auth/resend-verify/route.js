import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase = await createClient();
  const body = await request.json();

  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email) {
    return Response.json({ error: { code: "VALIDATION_ERROR", message: "Email là bắt buộc." } }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return Response.json({ error: { code: "RESEND_VERIFY_FAILED", message: error.message } }, { status: 400 });
  }

  return Response.json({ message: "Đã gửi lại email xác minh." }, { status: 200 });
}
