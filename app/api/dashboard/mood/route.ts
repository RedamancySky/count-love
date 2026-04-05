import { createClient } from "@/lib/supabase/server";

const ALLOWED_MOODS = new Set([
  "HAPPY",
  "LOVED",
  "EXCITED",
  "CALM",
  "NOSTALGIC",
  "SAD",
  "MISSING",
  "GRATEFUL",
  "ROMANTIC",
  "SILLY",
]);

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, response: Response.json({ error: { code: "UNAUTHORIZED", message: "Bạn chưa đăng nhập." } }, { status: 401 }) };
  }

  return { supabase, user, response: null };
}

export async function GET() {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { data: entry } = await supabase
    .from("diary_entries")
    .select("id,mood,date,created_at,updated_at")
    .eq("author_id", user.id)
    .eq("date", todayIso())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return Response.json({ mood: entry?.mood ?? null, entry: entry ?? null }, { status: 200 });
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await request.json().catch(() => ({}));
  const mood = typeof body?.mood === "string" ? body.mood : "";

  if (!ALLOWED_MOODS.has(mood)) {
    return Response.json({ error: { code: "INVALID_MOOD", message: "Mood không hợp lệ." } }, { status: 400 });
  }

  const date = todayIso();
  const content = `Mood check-in: ${mood}`;
  const title = "Mood check-in";

  const { data: existing } = await supabase
    .from("diary_entries")
    .select("id")
    .eq("author_id", user.id)
    .eq("date", date)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("diary_entries")
      .update({ mood, title, content, is_shared: true })
      .eq("id", existing.id);

    if (error) {
      return Response.json({ error: { code: "MOOD_SAVE_FAILED", message: error.message } }, { status: 500 });
    }
  } else {
    const { error } = await supabase.from("diary_entries").insert({
      author_id: user.id,
      title,
      content,
      mood,
      date,
      is_shared: true,
      is_private: false,
    });

    if (error) {
      return Response.json({ error: { code: "MOOD_SAVE_FAILED", message: error.message } }, { status: 500 });
    }
  }

  return Response.json({ ok: true, mood, date }, { status: 200 });
}
