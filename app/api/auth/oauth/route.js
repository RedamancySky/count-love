import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase = await createClient();
  const body = await request.json();

  const provider = String(body?.provider ?? "").trim().toLowerCase();
  if (!provider || !["google", "facebook"].includes(provider)) {
    return Response.json({ error: { code: "VALIDATION_ERROR", message: "Provider OAuth không hợp lệ." } }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=/dashboard`,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    return Response.json({ error: { code: "OAUTH_FAILED", message: error.message } }, { status: 400 });
  }

  return Response.json({
    message: "Khởi tạo OAuth thành công.",
    url: data?.url ?? null,
  });
}
