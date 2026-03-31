import { createClient } from "@/lib/supabase/server";

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Bạn chưa đăng nhập." } }, { status: 401 });
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

  let inserted = null;
  let lastError = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const coupleCode = randomCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("couples")
      .insert({
        user1_id: user.id,
        user2_id: null,
        couple_code: coupleCode,
        status: "PENDING",
        theme_name: "rose",
        expires_at: expiresAt,
      })
      .select("id,couple_code")
      .single();

    if (!error) {
      inserted = data;
      break;
    }
    lastError = error;
  }

  if (!inserted) {
    return Response.json(
      { error: { code: "CREATE_FAILED", message: lastError?.message ?? "Không thể tạo phòng kết nối." } },
      { status: 500 },
    );
  }

  const qrCodePayload = `countlove://couple/join?code=${inserted.couple_code}`;
  return Response.json(
    {
      couple: {
        id: inserted.id,
        coupleCode: inserted.couple_code,
        qrCodePayload,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrCodePayload)}`,
      },
    },
    { status: 201 },
  );
}
