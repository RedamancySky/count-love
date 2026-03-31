import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Bạn chưa đăng nhập." } }, { status: 401 });
  }

  const { data: couple, error } = await supabase
    .from("couples")
    .select("id,user1_id,user2_id,couple_code,status,start_date,theme_name,couple_title")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .limit(1)
    .maybeSingle();

  if (error || !couple) {
    return Response.json({ error: { code: "COUPLE_NOT_FOUND", message: "Bạn chưa tạo/tham gia phòng." } }, { status: 404 });
  }

  return Response.json(
    {
      couple,
      waitingForPartner: !couple.user2_id,
    },
    { status: 200 },
  );
}
