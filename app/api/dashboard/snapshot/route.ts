import { createClient } from "@/lib/supabase/server";

function toText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function toIsoDate(value: unknown) {
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function parseDateOnly(value: unknown) {
  if (!value) return null;
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toAvatar(profile: any, fallbackName: string) {
  const name = toText(profile?.nickname) || toText(profile?.full_name) || fallbackName;
  return {
    id: profile?.id ?? fallbackName,
    name,
    nickname: toText(profile?.nickname),
    fullName: toText(profile?.full_name),
    bio: toText(profile?.bio),
    avatarUrl: toText(profile?.avatar_url),
    birthDate: profile?.birth_date ? String(profile.birth_date).slice(0, 10) : "",
  };
}

function formatExcerpt(value: unknown) {
  if (!value) return "";
  const plain = String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!plain) return "";
  return plain.length > 96 ? `${plain.slice(0, 96).trimEnd()}…` : plain;
}

function combineActivities({ media = [], diaryEntries = [], bucketItems = [], achievements = [], actors = {} }: any) {
  const activities: any[] = [];

  for (const item of media) {
    const actor = actors[item.uploader_id] ?? {};
    activities.push({
      id: `media-${item.id}`,
      type: "PHOTO_UPLOAD",
      actorId: item.uploader_id,
      actorName: actor.name ?? "Người yêu",
      actorAvatar: actor.avatarUrl ?? "",
      title: item.caption ? "Đã đăng ảnh mới" : "Đã tải ảnh lên",
      description: item.caption ? `“${item.caption}”` : "Chia sẻ một khoảnh khắc mới.",
      targetUrl: "/album",
      thumbnail: item.url ?? "",
      createdAt: item.created_at,
    });
  }

  for (const item of diaryEntries) {
    const actor = actors[item.author_id] ?? {};
    activities.push({
      id: `diary-${item.id}`,
      type: "DIARY_ENTRY",
      actorId: item.author_id,
      actorName: actor.name ?? "Người yêu",
      actorAvatar: actor.avatarUrl ?? "",
      title: item.title ? "Viết nhật ký" : "Đã ghi nhật ký",
      description: item.title ? formatExcerpt(item.title) : formatExcerpt(item.content),
      targetUrl: "/diary",
      thumbnail: item.thumbnail ?? "",
      createdAt: item.created_at,
    });
  }

  for (const item of bucketItems) {
    const actor = actors[item.completed_by] ?? {};
    activities.push({
      id: `bucket-${item.id}`,
      type: "BUCKET_COMPLETED",
      actorId: item.completed_by,
      actorName: actor.name ?? "Người yêu",
      actorAvatar: actor.avatarUrl ?? "",
      title: "Hoàn thành bucket item",
      description: item.completed_note ? formatExcerpt(item.completed_note) : item.title,
      targetUrl: "/calendar",
      thumbnail: item.cover_image ?? "",
      createdAt: item.completed_at ?? item.created_at,
    });
  }

  for (const item of achievements) {
    activities.push({
      id: `achievement-${item.id}`,
      type: "ACHIEVEMENT",
      actorId: item.couple_id,
      actorName: "Hai bạn",
      actorAvatar: "",
      title: item.title ?? "Đạt thành tích",
      description: item.description ?? "Một milestone mới đã được mở khóa.",
      targetUrl: "/dashboard#milestones",
      thumbnail: item.icon_url ?? "",
      createdAt: item.unlocked_at,
    });
  }

  return activities
    .filter((item) => item.createdAt)
    .sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf());
}

function getNextAnniversary(startDate: string | null, now = new Date()) {
  if (!startDate) return null;

  const start = parseDateOnly(startDate);
  if (!start) return null;

  const thisYear = new Date(now.getFullYear(), start.getMonth(), start.getDate());
  let next = thisYear;

  if (thisYear < now) {
    next = new Date(now.getFullYear() + 1, start.getMonth(), start.getDate());
  }

  const diff = next.valueOf() - now.valueOf();
  return {
    id: `anniversary-${next.getFullYear()}`,
    title: `${next.getFullYear() - start.getFullYear()} năm bên nhau`,
    type: "ANNIVERSARY",
    date: next.toISOString(),
    daysUntil: Math.max(0, Math.ceil(diff / 86400000)),
    color: "#fb7185",
    isToday: diff < 86400000 && diff >= 0,
  };
}

function makeCursor(item: { createdAt?: string; id?: string } | null | undefined) {
  if (!item?.createdAt || !item.id) return null;
  return `${item.createdAt}|${item.id}`;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Bạn chưa đăng nhập." } }, { status: 401 });
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const [
    { data: profile },
    { data: couple },
  ] = await Promise.all([
    supabase.from("profiles").select("id,full_name,nickname,bio,avatar_url,birth_date").eq("id", user.id).maybeSingle(),
    supabase
      .from("couples")
      .select("id,user1_id,user2_id,start_date,couple_code,theme_name,couple_title,cover_image,status,created_at")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!couple) {
    return Response.json(
      {
        couple: null,
        nextEvent: null,
        activities: [],
        nextActivityCursor: null,
        unreadMessages: 0,
        partnerMood: null,
      },
      { status: 200 },
    );
  }

  const partnerId = couple.user1_id === user.id ? couple.user2_id : couple.user1_id;
  const coupleUserIds = [user.id, partnerId].filter(Boolean);

  const [
    { data: partnerProfile },
    { data: coupleAlbums },
    { data: futureEvents },
    { data: recentDiary },
    { data: recentBucket },
    { data: recentCoupleAchievements },
    { data: achievementRows },
    { data: unreadMessagesCount },
    { data: currentMoodEntry },
    { data: partnerMoodEntry },
  ] = await Promise.all([
    partnerId
      ? supabase.from("profiles").select("id,full_name,nickname,bio,avatar_url").eq("id", partnerId).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("albums").select("id,couple_id").eq("couple_id", couple.id),
    supabase
      .from("events")
      .select("id,title,type,date,color,cover_image,location,description")
      .eq("couple_id", couple.id)
      .gte("date", todayIso)
      .order("date", { ascending: true })
      .limit(5),
    supabase
      .from("diary_entries")
      .select("id,title,content,author_id,created_at,date,mood")
      .in("author_id", coupleUserIds)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("bucket_items")
      .select("id,title,description,cover_image,completed_at,completed_note,created_at,updated_at,completed_by")
      .eq("couple_id", couple.id)
      .eq("is_completed", true)
      .order("completed_at", { ascending: false })
      .limit(10),
    supabase
      .from("couple_achievements")
      .select("id,couple_id,achievement_id,unlocked_at")
      .order("unlocked_at", { ascending: false })
      .limit(10),
    supabase.from("achievements").select("id,code,title,description,icon_url,points").limit(50),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("couple_id", couple.id)
      .eq("is_read", false)
      .neq("sender_id", user.id),
    supabase
      .from("diary_entries")
      .select("id,mood,date,created_at,author_id")
      .eq("author_id", user.id)
      .eq("date", todayIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    partnerId
      ? supabase
          .from("diary_entries")
          .select("id,mood,date,created_at,author_id")
          .eq("author_id", partnerId)
          .eq("date", todayIso)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const achievementById = new Map((achievementRows ?? []).map((item) => [item.id, item]));
  const albumIds = (coupleAlbums ?? []).map((album) => album.id).filter(Boolean);
  const { data: recentMedia } = albumIds.length
    ? await supabase
        .from("media")
        .select("id,url,type,caption,created_at,uploader_id,taken_at,location,album_id")
        .in("album_id", albumIds)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };
  const activities = combineActivities({
    media: recentMedia ?? [],
    diaryEntries: recentDiary ?? [],
    bucketItems: recentBucket ?? [],
    achievements: (recentCoupleAchievements ?? []).map((item) => ({
      ...item,
      ...achievementById.get(item.achievement_id),
    })),
    actors: {
      [user.id]: toAvatar(profile, user.email ?? "Bạn"),
      ...(partnerProfile ? { [partnerProfile.id]: toAvatar(partnerProfile, "Người yêu") } : {}),
    },
  }).slice(0, 10);

  const events = futureEvents ?? [];
  const upcomingEvent = events[0] ?? getNextAnniversary(toIsoDate(couple.start_date));

  return Response.json(
    {
      couple: {
        id: couple.id,
        title: toText(couple.couple_title) || "Cặp đôi của bạn",
        code: couple.couple_code ?? null,
        startDate: toIsoDate(couple.start_date),
        themeName: toText(couple.theme_name) || "rose",
        coverImage: toText(couple.cover_image),
        status: couple.status ?? "PENDING",
        hasRoom: Boolean(couple),
        waitingForPartner: Boolean(couple && !couple.user2_id),
        totalDays: toIsoDate(couple.start_date) && parseDateOnly(couple.start_date)
          ? Math.floor((Date.now() - parseDateOnly(couple.start_date)!.valueOf()) / 86400000)
          : 0,
      },
      nextEvent: upcomingEvent,
      activities,
      nextActivityCursor: makeCursor(activities[activities.length - 1]),
      unreadMessages: unreadMessagesCount?.count ?? 0,
      currentMood: currentMoodEntry?.mood ?? null,
      partnerMood: partnerMoodEntry?.mood ?? null,
      user: toAvatar(profile, user.email ?? "Bạn"),
      partner: partnerProfile ? toAvatar(partnerProfile, "Người yêu") : null,
    },
    { status: 200 },
  );
}
