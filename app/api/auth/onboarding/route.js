import { createClient } from "@/lib/supabase/server";

export async function PATCH(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Bạn chưa đăng nhập." } }, { status: 401 });
  }

  const body = await request.json();
  const profilePatch = {};

  if (body.nickname != null) profilePatch.nickname = String(body.nickname).trim() || null;
  if (body.birthDate != null) profilePatch.birth_date = body.birthDate || null;
  if (body.bio != null) profilePatch.bio = String(body.bio).slice(0, 150) || null;
  if (body.avatar != null) profilePatch.avatar_url = body.avatar || null;
  if (body.step != null) {
    const step = Number(body.step);
    if (!Number.isNaN(step)) {
      profilePatch.onboarding_step = Math.max(1, Math.min(6, step));
      profilePatch.onboarding_completed = step >= 6;
    }
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...profilePatch }, { onConflict: "id" });

  if (profileError) {
    return Response.json(
      { error: { code: "PROFILE_UPDATE_FAILED", message: profileError.message } },
      { status: 500 },
    );
  }

  const { data: couple } = await supabase
    .from("couples")
    .select("id,user1_id,user2_id")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .limit(1)
    .maybeSingle();

  let updatedCouple = null;
  if (couple && (body.startDate != null || body.themeName != null || body.coupleTitle != null)) {
    const couplePatch = {};
    if (body.startDate != null) couplePatch.start_date = body.startDate || null;
    if (body.themeName != null) couplePatch.theme_name = body.themeName || "rose";
    if (body.coupleTitle != null) couplePatch.couple_title = String(body.coupleTitle).trim() || null;

    const { data, error: coupleError } = await supabase
      .from("couples")
      .update(couplePatch)
      .eq("id", couple.id)
      .select("id,user1_id,user2_id,couple_code,status,start_date,theme_name,couple_title")
      .single();

    if (coupleError) {
      return Response.json(
        { error: { code: "COUPLE_UPDATE_FAILED", message: coupleError.message } },
        { status: 500 },
      );
    }
    updatedCouple = data;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,nickname,birth_date,bio,avatar_url,onboarding_step,onboarding_completed")
    .eq("id", user.id)
    .single();

  return Response.json(
    {
      message: "Lưu onboarding thành công.",
      user: {
        id: profile?.id,
        nickname: profile?.nickname,
        birthDate: profile?.birth_date,
        bio: profile?.bio,
        avatar: profile?.avatar_url,
        onboardingStep: profile?.onboarding_step,
        onboardingCompleted: profile?.onboarding_completed,
      },
      couple: updatedCouple,
    },
    { status: 200 },
  );
}
