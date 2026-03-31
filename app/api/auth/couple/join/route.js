import { createClient } from "@/lib/supabase/server";

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

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Bạn chưa đăng nhập." } }, { status: 401 });
  }

  const payload = await request.json();
  const code = String(payload?.code ?? parseCodeFromInvitePayload(payload?.invitePayload) ?? "")
    .trim()
    .toUpperCase();

  if (!/^[A-Z0-9]{6}$/.test(code)) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: "Mã kết nối phải gồm đúng 6 ký tự chữ/số." } },
      { status: 400 },
    );
  }

  const { data: existed } = await supabase
    .from("couples")
    .select("id")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .limit(1)
    .maybeSingle();

  if (existed) {
    return Response.json({ error: { code: "COUPLE_EXISTS", message: "Bạn đã có cặp đôi." } }, { status: 409 });
  }

  const { data: couple, error: coupleError } = await supabase
    .from("couples")
    .select("id,user1_id,user2_id,couple_code,expires_at")
    .eq("couple_code", code)
    .maybeSingle();

  if (coupleError || !couple) {
    return Response.json({ error: { code: "COUPLE_NOT_FOUND", message: "Mã kết nối không tồn tại." } }, { status: 404 });
  }

  if (couple.user1_id === user.id) {
    return Response.json(
      { error: { code: "INVALID_SELF_JOIN", message: "Bạn không thể tự tham gia phòng của chính mình." } },
      { status: 400 },
    );
  }

  if (couple.user2_id) {
    return Response.json({ error: { code: "COUPLE_FULL", message: "Phòng kết nối đã đủ 2 người." } }, { status: 409 });
  }

  if (couple.expires_at && new Date(couple.expires_at).valueOf() < Date.now()) {
    return Response.json({ error: { code: "COUPLE_CODE_EXPIRED", message: "Mã kết nối đã hết hạn." } }, { status: 400 });
  }

  const { data: updated, error: updateError } = await supabase
    .from("couples")
    .update({ user2_id: user.id, status: "ACTIVE" })
    .eq("id", couple.id)
    .is("user2_id", null)
    .select("id,user1_id,user2_id,couple_code,status,start_date,theme_name,couple_title")
    .single();

  if (updateError || !updated) {
    return Response.json(
      { error: { code: "JOIN_FAILED", message: updateError?.message ?? "Không thể tham gia phòng." } },
      { status: 500 },
    );
  }

  return Response.json({ couple: updated }, { status: 200 });
}
