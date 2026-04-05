import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE_DEFAULT = 10;
const PAGE_SIZE_MAX = 20;

function toText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
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

function combineActivities({
  media = [],
  diaryEntries = [],
  bucketItems = [],
  achievements = [],
  actors = {},
}: {
  media?: any[];
  diaryEntries?: any[];
  bucketItems?: any[];
  achievements?: any[];
  actors?: Record<string, any>;
}) {
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

function parseCursor(cursor: string | null) {
  if (!cursor) return null;
  const [createdAt, id] = cursor.split("|");
  if (!createdAt || !id) return null;
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.valueOf())) return null;
  return { createdAt: parsed, id };
}

function makeCursor(item: { createdAt?: string; id?: string } | null | undefined) {
  if (!item?.createdAt || !item.id) return null;
  return `${item.createdAt}|${item.id}`;
}

function isOlderThanCursor(itemDate: string, itemId: string, cursor: { createdAt: Date; id: string }) {
  const current = new Date(itemDate);
  if (Number.isNaN(current.valueOf())) return false;
  if (current.valueOf() < cursor.createdAt.valueOf()) return true;
  return current.valueOf() === cursor.createdAt.valueOf() && itemId < cursor.id;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Bạn chưa đăng nhập." } }, { status: 401 });
  }

  const url = new URL(request.url);
  const pageSize = Math.min(Math.max(Number(url.searchParams.get("limit") ?? PAGE_SIZE_DEFAULT), 1), PAGE_SIZE_MAX);
  const cursor = parseCursor(url.searchParams.get("cursor"));

  const { data: couple } = await supabase
    .from("couples")
    .select("id,user1_id,user2_id")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!couple) {
    return Response.json({ activities: [], nextCursor: null }, { status: 200 });
  }

  const partnerId = couple.user1_id === user.id ? couple.user2_id : couple.user1_id;
  const coupleUserIds = [user.id, partnerId].filter(Boolean);

  const [profileResult, partnerResult, albumsResult, diaryResult, bucketResult, achievementsResult, achievementRowsResult] = await Promise.all([
      supabase.from("profiles").select("id,full_name,nickname,bio,avatar_url,birth_date").eq("id", user.id).maybeSingle(),
      partnerId
        ? supabase.from("profiles").select("id,full_name,nickname,bio,avatar_url").eq("id", partnerId).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from("albums").select("id,couple_id").eq("couple_id", couple.id),
      supabase
        .from("diary_entries")
        .select("id,title,content,author_id,created_at,date,mood")
        .in("author_id", coupleUserIds)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("bucket_items")
        .select("id,title,description,cover_image,completed_at,completed_note,created_at,updated_at,completed_by")
        .eq("couple_id", couple.id)
        .eq("is_completed", true)
        .order("completed_at", { ascending: false })
        .limit(50),
      supabase
        .from("couple_achievements")
        .select("id,couple_id,achievement_id,unlocked_at")
        .order("unlocked_at", { ascending: false })
        .limit(50),
      supabase.from("achievements").select("id,code,title,description,icon_url,points").limit(50),
    ]);

  const albumIds = (albumsResult.data ?? []).map((album) => album.id).filter(Boolean);
  const mediaQuery = albumIds.length
    ? supabase
        .from("media")
        .select("id,url,type,caption,created_at,uploader_id,taken_at,location,album_id")
        .in("album_id", albumIds)
        .order("created_at", { ascending: false })
        .limit(50)
    : Promise.resolve({ data: [] });

  const [mediaByAlbumResult] = await Promise.all([mediaQuery]);
  const achievementById = new Map((achievementRowsResult.data ?? []).map((item) => [item.id, item]));

  const media = (mediaByAlbumResult.data ?? []).filter((item) =>
    !cursor || isOlderThanCursor(item.created_at, `media-${item.id}`, cursor),
  );
  const diaryEntries = (diaryResult.data ?? []).filter((item) =>
    !cursor || isOlderThanCursor(item.created_at, `diary-${item.id}`, cursor),
  );
  const bucketItems = (bucketResult.data ?? []).filter((item) =>
    !cursor || isOlderThanCursor(item.completed_at ?? item.created_at, `bucket-${item.id}`, cursor),
  );
  const achievements = (achievementsResult.data ?? [])
    .map((item) => ({
      ...item,
      ...achievementById.get(item.achievement_id),
    }))
    .filter((item) => !cursor || isOlderThanCursor(item.unlocked_at, `achievement-${item.id}`, cursor));

  const activities = combineActivities({
    media,
    diaryEntries,
    bucketItems,
    achievements,
    actors: {
      [user.id]: toAvatar(profileResult.data, user.email ?? "Bạn"),
      ...(partnerResult.data ? { [partnerResult.data.id]: toAvatar(partnerResult.data, "Người yêu") } : {}),
    },
  }).slice(0, pageSize);

  return Response.json(
    {
      activities,
      nextCursor: activities.length === pageSize ? makeCursor(activities[activities.length - 1]) : null,
    },
    { status: 200 },
  );
}
