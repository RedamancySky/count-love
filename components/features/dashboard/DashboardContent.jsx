"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Copy,
  ImagePlus,
  Heart,
  MessageCircle,
  NotebookPen,
  Send,
  Sparkles,
  ThumbsUp,
  CloudSun,
  Share2,
  X,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { calculateLoveDuration } from "@/lib/love-counter";

const themeStyles = {
  rose: "from-rose-500/20 via-pink-500/10 to-white",
  blush: "from-pink-500/20 via-rose-500/10 to-white",
  cherry: "from-red-500/20 via-rose-500/10 to-white",
  coral: "from-orange-400/20 via-rose-500/10 to-white",
  strawberry: "from-rose-500/20 via-red-500/10 to-white",
  champagne: "from-amber-400/20 via-rose-500/10 to-white",
};

const moodOptions = [
  { key: "HAPPY", emoji: "😄", label: "Vui" },
  { key: "LOVED", emoji: "🥰", label: "Được yêu" },
  { key: "EXCITED", emoji: "🤩", label: "Phấn khích" },
  { key: "CALM", emoji: "😌", label: "Bình yên" },
  { key: "NOSTALGIC", emoji: "🥺", label: "Hoài niệm" },
  { key: "SAD", emoji: "😢", label: "Buồn" },
  { key: "MISSING", emoji: "🥹", label: "Nhớ" },
  { key: "GRATEFUL", emoji: "🙏", label: "Biết ơn" },
  { key: "ROMANTIC", emoji: "🌹", label: "Lãng mạn" },
  { key: "SILLY", emoji: "😜", label: "Tinh nghịch" },
];

const quoteOpeners = [
  "Tình yêu không cần ồn ào, chỉ cần có mặt đúng lúc.",
  "Mỗi ngày bên nhau là một lần học cách dịu dàng hơn.",
  "Điều đẹp nhất của tình yêu là được kể tiếp câu chuyện của hai người.",
  "Một cái nắm tay đủ để ngày dài trở nên nhẹ hơn.",
  "Bình yên thường bắt đầu từ một tin nhắn rất nhỏ.",
  "Không phải lúc nào cũng hoàn hảo, nhưng luôn là thật lòng.",
  "Tình yêu bền nhất là thứ vẫn ấm dù đã đi qua nhiều mùa.",
  "Những điều nhỏ xíu cũng có thể làm tim mình đầy lên.",
  "Cảm xúc đẹp nhất là khi được ai đó nhớ tới ngay cả lúc bận rộn.",
  "Hạnh phúc đôi khi chỉ là cùng nhau đi qua một ngày bình thường.",
  "Một nụ cười đúng lúc có thể làm dịu cả thế giới.",
  "Tình yêu tốt là thứ khiến mình muốn trở thành phiên bản tử tế hơn.",
  "Có những ngày chẳng cần gì nhiều ngoài sự hiện diện của nhau.",
  "Một kỷ niệm đẹp thường bắt đầu bằng một khoảnh khắc rất ngẫu nhiên.",
  "Yêu nhau là cùng giữ cho những điều bé nhỏ luôn có ý nghĩa.",
  "Chăm chút cho nhau là một cách nói 'mình ở đây'.",
  "Mỗi lần nhớ nhau là một lần trái tim học cách chờ đợi.",
  "Sự dịu dàng là ngôn ngữ riêng của hai người thương nhau.",
  "Tình yêu đẹp không cần phải giống ai khác.",
  "Dành cho nhau thời gian là cách yêu chân thành nhất.",
];

const quoteEndings = [
  "Hôm nay, hãy nói một câu ấm áp trước khi ngủ.",
  "Và đừng quên ôm nhau lâu hơn một chút.",
  "Rồi để mọi chuyện nhỏ lại trước một nụ cười.",
  "Ngay cả một lời hỏi thăm cũng đủ làm tim ấm lên.",
  "Nếu được, hãy hẹn nhau một buổi tối thật chậm.",
  "Chỉ cần vậy thôi, ngày hôm nay đã đáng nhớ hơn rồi.",
  "Đừng giữ im lặng quá lâu khi mình có thể nói nhớ.",
  "Hãy để một kỷ niệm mới đi vào cuốn album chung.",
  "Vì những điều giản dị luôn là thứ bền nhất.",
  "Một tin nhắn ngắn cũng có thể thành niềm vui lớn.",
  "Hãy cùng nhau tạo thêm một khoảnh khắc đáng nhớ nhé.",
  "Yêu nhau là cùng nhau đi chậm mà vẫn đi xa.",
  "Nên cứ từ tốn, vì điều đẹp thường nở rất chậm.",
  "Và nhắc nhau rằng mình vẫn luôn là nhà của nhau.",
  "Bởi một ngày tốt là ngày hai người không quên nhau.",
  "Thế là đủ để biến hôm nay thành một ngày dịu dàng.",
  "Hãy giữ cho trái tim luôn có chỗ cho sự tử tế.",
  "Rồi mọi thứ sẽ nhẹ hơn rất nhiều.",
  "Một cái chạm tay đúng lúc luôn có phép màu riêng.",
  "Hãy để tình yêu đi cùng những thói quen nhỏ tốt lành.",
];

function seedFromDate(date = new Date()) {
  const key = date.toISOString().slice(0, 10).replaceAll("-", "");
  return Number(key);
}

function parseDateOnly(value) {
  if (!value) return null;
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatRelativeTime(dateString, lang) {
  if (!dateString) return lang === "vi" ? "Vừa xong" : "Just now";
  const diff = Date.now() - new Date(dateString).valueOf();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return lang === "vi" ? "Vừa xong" : "Just now";
  if (minutes < 60) return lang === "vi" ? `${minutes} phút trước` : `${minutes}m ago`;
  if (hours < 24) return lang === "vi" ? `${hours} giờ trước` : `${hours}h ago`;
  return lang === "vi" ? `${days} ngày trước` : `${days}d ago`;
}

function formatCountdown(dateString, lang) {
  if (!dateString) return lang === "vi" ? "Chưa có sự kiện" : "No event yet";
  const diff = new Date(dateString).valueOf() - Date.now();
  if (diff <= 0 && diff > -86400000) {
    return lang === "vi" ? "Hôm nay" : "Today";
  }
  const days = Math.max(0, Math.ceil(diff / 86400000));
  return lang === "vi" ? `Còn ${days} ngày` : `${days} days left`;
}

function getWeatherSuggestion(code, temperature, lang) {
  const hot = temperature >= 30;
  const cold = temperature <= 18;

  if (code === 0) {
    return lang === "vi"
      ? hot
        ? "Trời đẹp nhưng hơi nóng, đi dạo buổi tối nhé?"
        : "Trời đẹp, đi dạo nhé?"
      : hot
        ? "Clear, but a bit warm. Try an evening walk."
        : "Clear skies. Perfect for a walk.";
  }

  if ([1, 2, 3].includes(code)) {
    return lang === "vi"
      ? "Mây nhẹ thôi, rất hợp cho một buổi hẹn chậm rãi."
      : "A little cloud cover, perfect for a slow date.";
  }

  if ([45, 48].includes(code)) {
    return lang === "vi"
      ? "Có sương, ở cạnh nhau một chút sẽ ấm hơn."
      : "Foggy. Stay close and keep it cozy.";
  }

  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return lang === "vi"
      ? "Mưa rồi, hẹn nhau một ly đồ ấm nhé."
      : "Rainy weather. Hot drinks sound right.";
  }

  if ([71, 73, 75, 77].includes(code)) {
    return lang === "vi"
      ? "Thời tiết lạnh, ở nhà ôm nhau sẽ hợp hơn."
      : "Cold weather. A cozy night in works best.";
  }

  if ([95, 96, 99].includes(code)) {
    return lang === "vi"
      ? "Có giông, hôm nay ưu tiên bình an và yên tĩnh."
      : "Stormy weather. Keep today calm and safe.";
  }

  return lang === "vi"
    ? cold
      ? "Trời khá lạnh, một chỗ ngồi ấm sẽ hợp hơn."
      : "Hôm nay cứ chọn một plan thật nhẹ nhàng."
    : cold
      ? "Quite cold. A warm indoor plan makes sense."
      : "Keep today simple and gentle.";
}

function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌦️";
}

function getMilestone(totalDays) {
  const milestones = [
    { threshold: 0, label: "Mới bắt đầu", icon: "💞" },
    { threshold: 30, label: "1 tháng", icon: "💌" },
    { threshold: 100, label: "100 ngày", icon: "🏅" },
    { threshold: 365, label: "1 năm", icon: "👑" },
    { threshold: 730, label: "2 năm", icon: "💎" },
    { threshold: 1000, label: "1.000 ngày", icon: "🌟" },
  ];

  let active = milestones[0];
  for (const milestone of milestones) {
    if (totalDays >= milestone.threshold) {
      active = milestone;
    }
  }

  return active;
}

function avatarFallback(name) {
  return (name || "?")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function unitLabel(unit, lang) {
  if (lang === "vi") return unit;
  const map = {
    năm: "yr",
    tháng: "mo",
    ngày: "day",
    giờ: "hr",
    phút: "min",
    giây: "sec",
  };
  return map[unit] ?? unit;
}

function CounterTile({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
      <div key={value} className="dash-flip text-2xl font-semibold tabular-nums md:text-4xl">
        {value.toString().padStart(2, "0")}
      </div>
      <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground md:text-xs">{label}</div>
    </div>
  );
}

function CounterCompact({ duration, lang }) {
  return (
    <div className="grid grid-cols-3 gap-2 md:hidden">
      <CounterTile value={duration.years} label={unitLabel("năm", lang)} />
      <CounterTile value={duration.months} label={unitLabel("tháng", lang)} />
      <CounterTile value={duration.days} label={unitLabel("ngày", lang)} />
    </div>
  );
}

function CounterFull({ duration, lang }) {
  const items = [
    [duration.years, unitLabel("năm", lang)],
    [duration.months, unitLabel("tháng", lang)],
    [duration.days, unitLabel("ngày", lang)],
    [duration.hours, unitLabel("giờ", lang)],
    [duration.minutes, unitLabel("phút", lang)],
    [duration.seconds, unitLabel("giây", lang)],
  ];

  return (
    <div className="hidden gap-2 md:grid md:grid-cols-3 xl:grid-cols-6">
      {items.map(([value, label]) => (
        <CounterTile key={label} value={value} label={label} />
      ))}
    </div>
  );
}

function LoveCounter({ startDate, lang }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const duration = useMemo(() => {
    if (!startDate) return null;
    const parsed = parseDateOnly(startDate);
    if (!parsed) return null;
    if (Number.isNaN(parsed.valueOf())) return null;
    return calculateLoveDuration(parsed, now);
  }, [now, startDate]);

  if (!duration) {
    return (
      <Card className="border-white/70 bg-white/80 shadow-xl backdrop-blur">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          {lang === "vi"
            ? "Chưa có couple để đếm. Tạo phòng hoặc nhập mã ở khung bên cạnh để bắt đầu."
            : "No couple yet. Create a room or enter a code in the panel beside this one."}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/70 bg-white/80 shadow-xl backdrop-blur">
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-rose-500" />
          {lang === "vi" ? "Bộ đếm tình yêu realtime" : "Realtime love counter"}
        </CardDescription>
        <CardTitle className="text-2xl md:text-3xl">
          {duration.totalDays.toLocaleString("vi-VN")}{" "}
          {lang === "vi" ? "ngày bên nhau" : "days together"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CounterCompact duration={duration} lang={lang} />
        <CounterFull duration={duration} lang={lang} />
        <p className="text-sm text-muted-foreground">
          {lang === "vi"
            ? `${duration.years} năm ${duration.months} tháng ${duration.days} ngày · ${duration.hours} giờ ${duration.minutes} phút ${duration.seconds} giây`
            : `${duration.years} years ${duration.months} months ${duration.days} days · ${duration.hours}h ${duration.minutes}m ${duration.seconds}s`}
        </p>
      </CardContent>
    </Card>
  );
}

function DashboardHeader({ couple, user, partner, lang }) {
  const totalDays = couple?.totalDays ?? 0;
  const milestone = getMilestone(totalDays);
  const themeClass = themeStyles[couple?.themeName] ?? themeStyles.rose;
  const showInviteCodeCard = Boolean(couple?.hasRoom) && Boolean(couple?.waitingForPartner) && Boolean(couple?.code);
  const showCreateRoomCard = !couple?.hasRoom;

  async function copyCoupleCode() {
    if (!couple?.code) return;
    try {
      await navigator.clipboard.writeText(couple.code);
    } catch {
      // Ignore clipboard failures.
    }
  }

  return (
    <Card className={cn("overflow-hidden border-white/70 bg-gradient-to-br shadow-2xl backdrop-blur", themeClass)}>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="relative min-h-[220px] p-6 md:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-rose-200/40" />
          {couple?.coverImage ? (
            <img
              src={couple.coverImage}
              alt={couple.title || "Couple cover"}
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
          ) : null}
          <div className="relative flex h-full flex-col justify-between gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium shadow-sm">
                {lang === "vi" ? "Dashboard của hai bạn" : "Your couple dashboard"}
              </span>
              <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                {milestone.icon} {milestone.label}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <AvatarCard person={user} />
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/85 text-2xl shadow-lg">
                  <Heart className="h-6 w-6 fill-rose-500 text-rose-500" />
                </div>
                <AvatarCard person={partner ?? { name: lang === "vi" ? "Người yêu" : "Partner" }} />
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                  {couple?.title || (lang === "vi" ? "Cặp đôi của bạn" : "Your couple")}
                </h1>
                <p className="max-w-2xl text-sm text-foreground/80 md:text-base">
                  {lang === "vi"
                    ? "Ảnh bìa, avatar, mốc yêu nhau, hoạt động gần đây và mọi thứ hai bạn cần xem trong một màn hình."
                    : "Cover, avatars, milestones, recent activity, and everything you need on one screen."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 bg-white/20 p-6 backdrop-blur-sm">
          <InfoPill
            label={lang === "vi" ? "Ngày bắt đầu" : "Start date"}
            value={couple?.startDate ? parseDateOnly(couple.startDate)?.toLocaleDateString("vi-VN") ?? "—" : "—"}
          />
          {showInviteCodeCard ? (
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
              <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                {lang === "vi" ? "Mã phòng" : "Room code"}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="text-3xl font-semibold tracking-[0.3em] text-rose-700">{couple?.code}</div>
                <Button variant="outline" size="sm" onClick={copyCoupleCode}>
                  <Copy className="h-4 w-4" />
                  {lang === "vi" ? "Copy" : "Copy"}
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "vi"
                  ? "Mã đã tạo, đang chờ người kia tham gia."
                  : "The code is ready and waiting for your partner."}
              </p>
            </div>
          ) : showCreateRoomCard ? (
            <div className="rounded-2xl border border-dashed border-white/70 bg-white/75 p-4 shadow-sm">
              <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                {lang === "vi" ? "Chưa có phòng" : "No room yet"}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "vi"
                  ? "Tạo phòng để có mã mời, sau đó copy mã này cho người kia."
                  : "Create a room to generate an invite code, then copy it for your partner."}
              </p>
              <Button asChild className="mt-3 w-full">
                <Link href="/settings/couple">
                  {lang === "vi" ? "Tạo mã phòng" : "Create invite code"}
                </Link>
              </Button>
            </div>
          ) : null}
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
            <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              {lang === "vi" ? "Badge kỷ lục" : "Milestone badge"}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-lg text-white">
                {milestone.icon}
              </div>
              <div>
                <p className="font-semibold">{milestone.label}</p>
                <p className="text-sm text-muted-foreground">
                  {totalDays.toLocaleString("vi-VN")} {lang === "vi" ? "ngày bên nhau" : "days together"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function AvatarCard({ person }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/85 px-3 py-2 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-rose-100 text-sm font-semibold text-rose-700">
        {person?.avatarUrl ? (
          <img src={person.avatarUrl} alt={person.name} className="h-full w-full object-cover" />
        ) : (
          avatarFallback(person?.name)
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold">{person?.name}</p>
        <p className="truncate text-xs text-muted-foreground">{person?.bio || ""}</p>
      </div>
    </div>
  );
}

function AccountMenu({ user, lang }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onPointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div ref={menuRef} className="relative z-20">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-2 py-2 shadow-sm transition hover:shadow-md"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-rose-100 text-sm font-semibold text-rose-700">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            avatarFallback(user?.name)
          )}
        </div>
        <div className="hidden text-left md:block">
          <p className="text-sm font-semibold leading-none">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{lang === "vi" ? "Tài khoản" : "Account"}</p>
        </div>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-2 shadow-xl backdrop-blur"
        >
          <Link
            href="/settings/profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-rose-50"
          >
            <Heart className="h-4 w-4 text-rose-500" />
            {lang === "vi" ? "Chỉnh profile" : "Edit profile"}
          </Link>
          <Link
            href="/settings/couple"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-rose-50"
          >
            <MessageCircle className="h-4 w-4 text-rose-500" />
            {lang === "vi" ? "Couple / Solo mode" : "Couple / Solo mode"}
          </Link>
          <div className="my-2 h-px bg-border" />
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-destructive transition hover:bg-rose-50"
          >
            <X className="h-4 w-4" />
            {lang === "vi" ? "Đăng xuất" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function normalizeCouple(value) {
  if (!value) return null;
  return {
    id: value.id ?? null,
    title: value.title ?? value.couple_title ?? "Cặp đôi của bạn",
    code: value.code ?? value.couple_code ?? null,
    startDate: value.startDate ?? (value.start_date ? String(value.start_date) : null),
    themeName: value.themeName ?? value.theme_name ?? "rose",
    coverImage: value.coverImage ?? value.cover_image ?? "",
    status: value.status ?? "PENDING",
    hasRoom: Boolean(value.hasRoom ?? true),
    waitingForPartner: Boolean(value.waitingForPartner ?? !value.user2_id),
    totalDays: value.totalDays ?? 0,
  };
}

export function ProfileEditor({ profile, lang }) {
  const [form, setForm] = useState({
    nickname: profile?.nickname ?? "",
    bio: profile?.bio ?? "",
    avatar: profile?.avatarUrl ?? "",
    birthDate: profile?.birthDate ? String(profile.birthDate).slice(0, 10) : "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      nickname: profile?.nickname ?? "",
      bio: profile?.bio ?? "",
      avatar: profile?.avatarUrl ?? "",
      birthDate: profile?.birthDate ? String(profile.birthDate).slice(0, 10) : "",
    });
  }, [profile?.avatarUrl, profile?.bio, profile?.birthDate, profile?.nickname]);

  async function onSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: form.nickname,
          bio: form.bio,
          avatar: form.avatar,
          birthDate: form.birthDate,
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.error?.message || (lang === "vi" ? "Không thể lưu profile." : "Could not save profile."));
      }

      setMessage(lang === "vi" ? "Đã lưu profile." : "Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : lang === "vi" ? "Không thể lưu profile." : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-white/70 bg-white/85 shadow-lg backdrop-blur">
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-500" />
          {lang === "vi" ? "Profile cá nhân" : "Personal profile"}
        </CardDescription>
        <CardTitle className="text-xl">{lang === "vi" ? "Chỉnh sửa hồ sơ" : "Edit your profile"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSave}>
          <div className="space-y-2">
            <Label htmlFor="nickname">{lang === "vi" ? "Tên hiển thị" : "Display name"}</Label>
            <Input
              id="nickname"
              value={form.nickname}
              onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">{lang === "vi" ? "Avatar URL" : "Avatar URL"}</Label>
            <Input
              id="avatar"
              value={form.avatar}
              onChange={(event) => setForm((current) => ({ ...current, avatar: event.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">{lang === "vi" ? "Ngày sinh" : "Birth date"}</Label>
            <Input
              id="birthDate"
              type="date"
              value={form.birthDate}
              onChange={(event) => setForm((current) => ({ ...current, birthDate: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">{lang === "vi" ? "Giới thiệu" : "Bio"}</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              maxLength={150}
              rows={4}
            />
          </div>
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={saving}>
            {saving ? (lang === "vi" ? "Đang lưu..." : "Saving...") : lang === "vi" ? "Lưu profile" : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function CoupleAccessCard({ couple, lang }) {
  const [mode, setMode] = useState("create");
  const [activeCouple, setActiveCouple] = useState(couple ?? null);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [rotationUrl, setRotationUrl] = useState("");

  useEffect(() => {
    setActiveCouple(couple ?? null);
  }, [couple]);

  function buildInviteAssets(code) {
    if (!code) return { qrCodePayload: "", qrCodeUrl: "" };
    const qrCodePayload = `countlove://couple/join?code=${code}`;
    return {
      qrCodePayload,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrCodePayload)}`,
    };
  }

  const inviteCode = activeCouple?.code ?? "";
  const inviteAssets = activeCouple?.qrCodePayload && activeCouple?.qrCodeUrl ? activeCouple : buildInviteAssets(inviteCode);
  const hasCouple = Boolean(inviteCode);

  async function createRoom() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/couple/create", { method: "POST" });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error?.message || (lang === "vi" ? "Không thể tạo phòng." : "Could not create a room."));
      }
      const nextCode = body?.couple?.coupleCode ?? "";
      setActiveCouple({
        id: body?.couple?.id ?? "",
        code: nextCode,
        ...buildInviteAssets(nextCode),
      });
      setMode("create");
      setMessage(
        body?.message ||
          (lang === "vi"
            ? "Đã tạo mã kết nối. Mã và QR đã hiển thị bên dưới."
            : "Invite code created. The code and QR are shown below."),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : lang === "vi" ? "Không thể tạo phòng." : "Could not create a room.");
    } finally {
      setLoading(false);
    }
  }

  async function joinRoom(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/couple/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error?.message || (lang === "vi" ? "Không thể tham gia phòng." : "Could not join the room."));
      }
      const nextCode = body?.couple?.couple_code ?? joinCode;
      setActiveCouple({
        id: body?.couple?.id ?? "",
        code: nextCode,
        ...buildInviteAssets(nextCode),
      });
      setMessage(lang === "vi" ? "Đã kết nối couple. Mã đã hiển thị bên dưới." : "Couple connected. The code is shown below.");
    } catch (err) {
      setError(err instanceof Error ? err.message : lang === "vi" ? "Không thể tham gia phòng." : "Could not join the room.");
    } finally {
      setLoading(false);
    }
  }

  async function copyInviteCode() {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setMessage(lang === "vi" ? "Đã copy mã." : "Invite code copied.");
    } catch {
      // Ignore clipboard failures.
    }
  }

  async function requestRotation() {
    setRotating(true);
    setError("");
    setMessage("");
    setRotationUrl("");
    try {
      const response = await fetch("/api/auth/couple/rotate/request", {
        method: "POST",
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.error?.message || (lang === "vi" ? "Không thể tạo yêu cầu đổi mã." : "Could not request code rotation."));
      }

      setMessage(
        lang === "vi"
          ? "Đã gửi email xác nhận. Sau khi mở mail, mã mới sẽ được kích hoạt."
          : "Confirmation email sent. Open the email to activate the new code.",
      );
      setRotationUrl(body?.rotation?.confirmUrl ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : lang === "vi" ? "Không thể tạo yêu cầu đổi mã." : "Could not request code rotation.");
    } finally {
      setRotating(false);
    }
  }

  return (
    <Card className="border-white/70 bg-white/85 shadow-lg backdrop-blur">
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-rose-500" />
          {lang === "vi" ? "Kết nối couple" : "Couple connection"}
        </CardDescription>
        <CardTitle className="text-xl">
          {couple ? (lang === "vi" ? "Mã kết nối hiện tại" : "Current invite code") : lang === "vi" ? "Dùng app một mình trước" : "Use the app solo first"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {couple
            ? lang === "vi"
              ? "Bạn có thể copy mã này để mời người yêu. Khi muốn đổi mã, hệ thống sẽ gửi email xác thực trước."
              : "Copy this code to invite your partner. When you regenerate it, the app will send a verification email first."
            : lang === "vi"
              ? "Bạn vẫn có thể dùng app trước, rồi tạo phòng hoặc nhập mã của người yêu sau."
              : "You can still use the app now, then create a room or join your partner later."}
        </p>

        {hasCouple ? (
          <div className="rounded-2xl border bg-rose-50 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              {lang === "vi" ? "Mã phòng" : "Invite code"}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[0.3em] text-rose-700">{inviteCode || "------"}</p>
            {inviteAssets.qrCodeUrl ? (
              <img
                src={inviteAssets.qrCodeUrl}
                alt="Couple room QR"
                className="mt-4 h-[220px] w-[220px] rounded-xl border bg-white"
              />
            ) : null}
            {inviteAssets.qrCodePayload ? (
              <p className="mt-3 break-all text-xs text-muted-foreground">{inviteAssets.qrCodePayload}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={copyInviteCode}>
                <Copy className="h-4 w-4" />
                {lang === "vi" ? "Copy mã" : "Copy"}
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                {lang === "vi" ? "Tải lại trạng thái" : "Refresh status"}
              </Button>
              <Button onClick={requestRotation} disabled={rotating}>
                {rotating ? (lang === "vi" ? "Đang tạo..." : "Creating...") : lang === "vi" ? "Gen mã mới" : "Generate new code"}
              </Button>
            </div>
            {rotationUrl ? (
              <p className="mt-3 text-xs text-muted-foreground">
                {lang === "vi"
                  ? "Sau khi mở link trong email, trang xác nhận sẽ hiện ở đây:"
                  : "After opening the email link, the confirmation page will be:"}{" "}
                <span className="break-all">{rotationUrl}</span>
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={mode === "create" ? "default" : "outline"} onClick={() => setMode("create")}>
                {lang === "vi" ? "Tạo phòng" : "Create room"}
              </Button>
              <Button type="button" variant={mode === "join" ? "default" : "outline"} onClick={() => setMode("join")}>
                {lang === "vi" ? "Nhập mã" : "Join with code"}
              </Button>
            </div>

            {mode === "create" ? (
              <div className="space-y-3 rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">
                  {lang === "vi"
                    ? "Tạo mã mời để dùng app một mình trước rồi mời người yêu sau."
                    : "Create an invite code now and bring your partner in later."}
                </p>
                <Button onClick={createRoom} disabled={loading}>
                  {loading ? (lang === "vi" ? "Đang tạo..." : "Creating...") : lang === "vi" ? "Tạo mã kết nối" : "Create invite code"}
                </Button>
              </div>
            ) : (
              <form className="space-y-3 rounded-2xl border bg-muted/20 p-4" onSubmit={joinRoom}>
                <div className="space-y-2">
                  <Label htmlFor="joinCode">{lang === "vi" ? "Mã 6 ký tự" : "6-char code"}</Label>
                  <Input id="joinCode" value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? (lang === "vi" ? "Đang kết nối..." : "Connecting...") : lang === "vi" ? "Tham gia" : "Join"}
                </Button>
              </form>
            )}
          </>
        )}

        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
      <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}

function EventCountdown({ event, lang }) {
  if (!event) return null;
  const isToday = Boolean(event.isToday);

  return (
    <Card className="border-white/70 bg-white/85 shadow-lg backdrop-blur">
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-rose-500" />
          {lang === "vi" ? "Sự kiện sắp tới" : "Upcoming event"}
        </CardDescription>
        <CardTitle className="text-xl">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{formatCountdown(event.date, lang)}</p>
            <p className="text-lg font-semibold">
              {isToday ? (lang === "vi" ? "Hôm nay có sự kiện" : "Event is today") : `${event.daysUntil} ${lang === "vi" ? "ngày" : "days"}`}
            </p>
          </div>
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl text-2xl", isToday ? "animate-bounce bg-rose-500 text-white" : "bg-rose-100")}>
            {isToday ? "🎉" : "📅"}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {event.location || (lang === "vi" ? "Một điểm hẹn đáng nhớ đang chờ." : "A date worth preparing for.")}
        </p>
        <Button asChild className="w-full">
          <Link href="/calendar">
            {lang === "vi" ? "Mở Calendar" : "Open Calendar"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function DailyQuote() {
  const { lang } = useLanguage();
  const fallbackQuotes = useMemo(() => {
    const list = [];
    for (let i = 0; i < quoteOpeners.length; i += 1) {
      for (let j = 0; j < quoteEndings.length; j += 1) {
        list.push(`${quoteOpeners[i]} ${quoteEndings[j]}`);
      }
    }
    return list;
  }, []);

  const [todayKey, setTodayKey] = useState(() => new Date().toISOString().slice(0, 10));
  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const timeout = window.setTimeout(() => {
      setTodayKey(new Date().toISOString().slice(0, 10));
    }, Math.max(1000, nextMidnight.valueOf() - now.valueOf() + 1000));

    return () => window.clearTimeout(timeout);
  }, [todayKey]);
  const cacheKey = `countlove:quotes:${todayKey}`;
  const indexKey = `countlove:quote:index:${todayKey}`;
  const [quotes, setQuotes] = useState(fallbackQuotes);
  const [quoteIndex, setQuoteIndex] = useState(() => seedFromDate() % fallbackQuotes.length);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadQuotes() {
      try {
        try {
          const cachedRaw = window.localStorage.getItem(cacheKey);
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (cached?.date === todayKey && Array.isArray(cached.quotes) && cached.quotes.length) {
              if (!active) return;
              setQuotes(cached.quotes);
              const savedIndex = Number(window.localStorage.getItem(indexKey));
              const nextIndex = Number.isFinite(savedIndex) ? savedIndex : seedFromDate() % cached.quotes.length;
              setQuoteIndex(nextIndex % cached.quotes.length);
              setLoading(false);
              return;
            }
          }
        } catch {
          // Ignore cache read failures and fall back to the network.
        }

        const response = await fetch("/api/dashboard/quote");
        const body = await response.json();
        const nextQuotes = Array.isArray(body?.quotes) && body.quotes.length ? body.quotes : fallbackQuotes;
        if (!active) return;
        setQuotes(nextQuotes);
        let savedIndex = NaN;
        try {
          savedIndex = Number(window.localStorage.getItem(indexKey));
        } catch {
          savedIndex = NaN;
        }
        const nextIndex = Number.isFinite(savedIndex) ? savedIndex : seedFromDate() % nextQuotes.length;
        setQuoteIndex(nextIndex % nextQuotes.length);
        try {
          window.localStorage.setItem(cacheKey, JSON.stringify({ date: todayKey, quotes: nextQuotes }));
          window.localStorage.setItem(indexKey, String(nextIndex % nextQuotes.length));
        } catch {
          // Ignore storage failures.
        }
      } catch {
        if (!active) return;
        setQuotes(fallbackQuotes);
        setQuoteIndex(seedFromDate() % fallbackQuotes.length);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadQuotes();

    return () => {
      active = false;
    };
  }, [cacheKey, fallbackQuotes, indexKey, todayKey]);

  useEffect(() => {
    if (!quotes.length) return;
    try {
      window.localStorage.setItem(indexKey, String(quoteIndex % quotes.length));
    } catch {
      // Ignore storage failures.
    }
  }, [indexKey, quoteIndex, quotes.length]);

  const quote = quotes[quoteIndex % quotes.length] ?? "";

  async function copyQuote() {
    try {
      await navigator.clipboard.writeText(quote);
    } catch {
      // Ignore clipboard failures.
    }
  }

  async function shareQuote() {
    const text = `“${quote}”`;
    try {
      if (navigator.share) {
        await navigator.share({ title: lang === "vi" ? "Quote tình yêu" : "Love quote", text });
        return;
      }
      await navigator.clipboard.writeText(text);
    } catch {
      // Ignore share failures.
    }
  }

  return (
    <Card className="border-white/70 bg-white/85 shadow-lg backdrop-blur">
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-rose-500" />
          {lang === "vi" ? "Quote tình yêu hôm nay" : "Daily love quote"}
        </CardDescription>
        <CardTitle className="text-xl">{lang === "vi" ? "Một câu cho hôm nay" : "One line for today"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg leading-8 text-balance">{loading ? "..." : `“${quote}”`}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setQuoteIndex((value) => (value + 1) % quotes.length)}>
            <Send className="h-4 w-4" />
            {lang === "vi" ? "Đổi quote" : "Shuffle"}
          </Button>
          <Button variant="outline" onClick={shareQuote}>
            <Share2 className="h-4 w-4" />
            {lang === "vi" ? "Chia sẻ" : "Share"}
          </Button>
          <Button variant="outline" onClick={copyQuote}>
            <Copy className="h-4 w-4" />
            {lang === "vi" ? "Copy" : "Copy"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityFeed({ initialActivities, initialCursor, lang }) {
  const [activities, setActivities] = useState(initialActivities);
  const [cursor, setCursor] = useState(initialCursor);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setActivities(initialActivities);
    setCursor(initialCursor);
  }, [initialActivities, initialCursor]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await fetch(`/api/dashboard/activity-feed?limit=10&cursor=${encodeURIComponent(cursor)}`);
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error?.message || "Could not load more activities.");
      }
      const nextActivities = Array.isArray(body?.activities) ? body.activities : [];
      setActivities((current) => [...current, ...nextActivities]);
      setCursor(body?.nextCursor ?? null);
    } catch {
      // Keep existing items when pagination fails.
    } finally {
      setLoadingMore(false);
    }
  }

  const visibleActivities = activities;
  const hasMore = Boolean(cursor);

  return (
    <Card className="border-white/70 bg-white/85 shadow-lg backdrop-blur">
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-rose-500" />
          {lang === "vi" ? "Hoạt động gần đây" : "Recent activity"}
        </CardDescription>
        <CardTitle className="text-xl">
          {lang === "vi" ? "Feed của hai bạn" : "Your couple feed"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleActivities.length ? (
          visibleActivities.map((item) => <ActivityItem key={item.id} item={item} lang={lang} />)
        ) : (
          <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
            {lang === "vi" ? "Chưa có hoạt động nào để hiển thị." : "No activities to show yet."}
          </div>
        )}
        {hasMore ? (
          <Button variant="outline" className="w-full" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? (lang === "vi" ? "Đang tải..." : "Loading...") : lang === "vi" ? "Xem thêm" : "Load more"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ActivityItem({ item, lang }) {
  const href = item.targetUrl || "/dashboard";

  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-2xl border border-transparent bg-muted/25 p-3 transition hover:border-rose-200 hover:bg-rose-50/70"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-100 font-semibold text-rose-700">
        {item.actorAvatar ? (
          <img src={item.actorAvatar} alt={item.actorName} className="h-full w-full object-cover" />
        ) : (
          avatarFallback(item.actorName)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold">{item.actorName}</p>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(item.createdAt, lang)}</span>
        </div>
        <p className="text-sm text-muted-foreground">{item.title}</p>
        <p className="text-sm">{item.description}</p>
        {item.thumbnail ? (
          <div className="mt-2 overflow-hidden rounded-xl border bg-white">
            <img src={item.thumbnail} alt="" className="h-36 w-full object-cover" />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function WeatherWidget({ lang }) {
  const [state, setState] = useState({ status: "idle" });

  function getCacheKey(latitude, longitude) {
    return `countlove:weather:${latitude.toFixed(2)}:${longitude.toFixed(2)}`;
  }

  async function detectWeather() {
    if (!navigator.geolocation) {
      setState({ status: "denied" });
      return;
    }

    setState({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const cacheKey = getCacheKey(latitude, longitude);
          try {
            const cachedRaw = window.localStorage.getItem(cacheKey);
            if (cachedRaw) {
              const cached = JSON.parse(cachedRaw);
              if (cached?.savedAt && Date.now() - cached.savedAt < 30 * 60 * 1000 && cached?.data) {
                setState({ status: "ready", ...cached.data });
                return;
              }
            }
          } catch {
            // Ignore cache read failures.
          }

          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`
          );
          const body = await response.json();
          const current = body?.current;
          const nextState = {
            status: "ready",
            temperature: current?.temperature_2m ?? null,
            code: current?.weather_code ?? null,
            suggestion: getWeatherSuggestion(current?.weather_code ?? 0, current?.temperature_2m ?? 0, lang),
          };
          setState(nextState);
          try {
            window.localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), data: nextState }));
          } catch {
            // Ignore cache write failures.
          }
        } catch {
          setState({ status: "error" });
        }
      },
      (error) => {
        if (error?.code === 1) {
          setState({ status: "denied" });
        } else {
          setState({ status: "error" });
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 1800000 }
    );
  }

  if (state.status === "denied") return null;

  return (
    <Card className="border-white/70 bg-white/85 shadow-lg backdrop-blur">
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2">
          <CloudSun className="h-4 w-4 text-rose-500" />
          {lang === "vi" ? "Thời tiết hôm nay" : "Today weather"}
        </CardDescription>
        <CardTitle className="text-xl">{lang === "vi" ? "Gợi ý hẹn hò theo thời tiết" : "Weather-based date idea"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.status === "ready" ? (
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-3xl">
              {getWeatherIcon(state.code)}
            </div>
            <div>
              <p className="text-2xl font-semibold">{Math.round(state.temperature)}°C</p>
              <p className="text-sm text-muted-foreground">
                {lang === "vi" ? "Thời tiết hiện tại" : "Current conditions"}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
            {lang === "vi"
              ? "Bật vị trí để xem thời tiết hiện tại và gợi ý hẹn hò."
              : "Enable location to load current weather and a date suggestion."}
          </div>
        )}

        {state.status === "ready" ? (
          <p className="rounded-2xl bg-muted/30 p-4 text-sm leading-6">{state.suggestion}</p>
        ) : null}

        <Button variant={state.status === "ready" ? "outline" : "default"} className="w-full" onClick={detectWeather} disabled={state.status === "loading"}>
          {state.status === "loading"
            ? lang === "vi"
              ? "Đang lấy vị trí..."
              : "Fetching location..."
            : lang === "vi"
              ? "Bật vị trí"
              : "Use my location"}
        </Button>
      </CardContent>
    </Card>
  );
}

function MoodCheckIn({ partnerMood, initialMood, onMoodChange, lang }) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `countlove:mood:${todayKey}`;
  const [selectedMood, setSelectedMood] = useState(initialMood ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const cachedMood = window.localStorage.getItem(storageKey);
      setSelectedMood(cachedMood || initialMood || null);
    } catch {
      setSelectedMood(initialMood ?? null);
    }
  }, [initialMood, storageKey]);

  async function chooseMood(moodKey) {
    setSaving(true);
    try {
      const response = await fetch("/api/dashboard/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: moodKey }),
      });
      if (!response.ok) {
        throw new Error("Could not save mood");
      }
      setSelectedMood(moodKey);
      onMoodChange?.(moodKey);
      try {
        window.localStorage.setItem(storageKey, moodKey);
      } catch {
        // Ignore storage failures.
      }
    } catch {
      // Keep the optimistic UI even if the save fails locally.
      setSelectedMood(moodKey);
    } finally {
      setSaving(false);
    }
  }

  const currentMood = moodOptions.find((item) => item.key === selectedMood);
  const partnerMoodItem = moodOptions.find((item) => item.key === partnerMood);

  return (
    <Card className="border-white/70 bg-white/85 shadow-lg backdrop-blur">
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2">
          <ThumbsUp className="h-4 w-4 text-rose-500" />
          {lang === "vi" ? "Mood check-in" : "Mood check-in"}
        </CardDescription>
        <CardTitle className="text-xl">{lang === "vi" ? "Hôm nay bạn cảm thấy thế nào?" : "How are you feeling today?"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentMood ? (
          <div className="rounded-2xl bg-rose-50 p-4">
            <p className="text-sm text-muted-foreground">{lang === "vi" ? "Mood của bạn hôm nay" : "Your mood today"}</p>
            <p className="mt-1 text-2xl font-semibold">
              {currentMood.emoji} {currentMood.label}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {partnerMoodItem
                ? `${lang === "vi" ? "Người yêu cũng đang thấy" : "Partner feels"} ${partnerMoodItem.emoji} ${partnerMoodItem.label}`
                : lang === "vi"
                  ? "Người yêu chưa check-in hôm nay."
                  : "Partner has not checked in yet."}
            </p>
          </div>
        ) : null}

        <div className="rounded-2xl border border-dashed bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            {currentMood
              ? lang === "vi"
                ? "Bạn có thể đổi mood bất cứ lúc nào bằng một emoji khác."
                : "You can change your mood anytime with another emoji."
              : lang === "vi"
                ? "Chọn một emoji để lưu mood hôm nay."
                : "Pick one emoji to save today's mood."}
          </p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {moodOptions.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => chooseMood(item.key)}
                disabled={saving}
                className="rounded-2xl border bg-white p-2 text-center transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-2xl">{item.emoji}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{item.label}</div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActions({ unreadMessages, lang }) {
  const [open, setOpen] = useState(false);

  const actions = [
    { href: "/chat", icon: MessageCircle, label: lang === "vi" ? "Nhắn tin" : "Message", badge: unreadMessages },
    { href: "/album", icon: ImagePlus, label: lang === "vi" ? "Thêm ảnh" : "Add photo" },
    { href: "/diary", icon: NotebookPen, label: lang === "vi" ? "Viết nhật ký" : "Write diary" },
    { href: "/calendar", icon: CalendarDays, label: lang === "vi" ? "Thêm sự kiện" : "Add event" },
  ];

  return (
    <>
      <div className="hidden grid-cols-4 gap-3 md:grid">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button key={action.href} asChild variant="outline" className="h-auto justify-start rounded-2xl p-4 text-left">
              <Link href={action.href}>
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {action.badge > 0 ? (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                      {action.badge > 9 ? "9+" : action.badge}
                    </span>
                  ) : null}
                </div>
                <span>{action.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-2xl shadow-rose-500/30"
        >
          {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
          {unreadMessages > 0 && !open ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-rose-600 shadow">
              {unreadMessages > 9 ? "9+" : unreadMessages}
            </span>
          ) : null}
        </button>

        {open ? (
          <div className="fixed inset-x-4 bottom-24 z-40 space-y-2 rounded-3xl border border-white/70 bg-white/95 p-3 shadow-2xl backdrop-blur">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button key={action.href} asChild variant="outline" className="h-12 w-full justify-start rounded-2xl">
                  <Link href={action.href} onClick={() => setOpen(false)}>
                    <div className="relative">
                      <Icon className="h-4 w-4" />
                      {action.badge > 0 ? (
                        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
                          {action.badge > 9 ? "9+" : action.badge}
                        </span>
                      ) : null}
                    </div>
                    <span>{action.label}</span>
                  </Link>
                </Button>
              );
            })}
            <div className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-muted-foreground">
              {lang === "vi"
                ? `Tin nhắn chưa đọc: ${unreadMessages}`
                : `Unread messages: ${unreadMessages}`}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

function MilestoneCelebration({ totalDays, lang }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const milestones = [30, 100, 365, 730, 1000];
    if (!milestones.includes(totalDays)) {
      setVisible(false);
      return;
    }

    const storageKey = `countlove:milestone:${totalDays}`;
    try {
      if (window.localStorage.getItem(storageKey) === "seen") {
        return;
      }
      window.localStorage.setItem(storageKey, "seen");
    } catch {
      // Ignore storage failures.
    }

    setVisible(true);
  }, [totalDays]);

  async function shareMilestone() {
    const text =
      lang === "vi"
        ? `Chúng mình đã bên nhau ${totalDays.toLocaleString("vi-VN")} ngày.`
        : `We have been together for ${totalDays.toLocaleString("vi-VN")} days.`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "Count Love", text });
        return;
      }
      await navigator.clipboard.writeText(text);
    } catch {
      // Ignore share failures.
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${(index * 13) % 100}%`,
              top: `${(index * 7) % 90}%`,
              animationDelay: `${index * 0.12}s`,
            }}
          >
            ✨
          </span>
        ))}
      </div>
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-3xl text-white shadow-lg">
          🎉
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">{lang === "vi" ? "Milestone" : "Milestone"}</p>
        <h2 className="mt-2 text-3xl font-semibold">
          {totalDays.toLocaleString("vi-VN")} {lang === "vi" ? "ngày bên nhau" : "days together"}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {lang === "vi"
            ? "Một cột mốc mới vừa được mở khóa. Hãy lưu lại ngày hôm nay."
            : "A new milestone has been unlocked. Save this day."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={shareMilestone}>
            <Share2 className="h-4 w-4" />
            {lang === "vi" ? "Chia sẻ" : "Share"}
          </Button>
          <Button onClick={() => setVisible(false)}>
            <X className="h-4 w-4" />
            {lang === "vi" ? "Đóng" : "Close"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DashboardContent({ user, partner, couple, nextEvent, activities, initialActivityCursor, unreadMessages, currentMood, partnerMood }) {
  const { lang } = useLanguage();
  const [liveCouple, setLiveCouple] = useState(() => normalizeCouple(couple));
  const [nextEventState, setNextEventState] = useState(nextEvent);
  const [activityState, setActivityState] = useState({
    items: activities,
    cursor: initialActivityCursor,
  });
  const [unreadMessagesState, setUnreadMessagesState] = useState(unreadMessages);
  const [partnerMoodState, setPartnerMoodState] = useState(partnerMood);
  const [currentMoodState, setCurrentMoodState] = useState(currentMood);

  useEffect(() => {
    setLiveCouple(normalizeCouple(couple));
  }, [couple]);

  useEffect(() => {
    setNextEventState(nextEvent);
    setActivityState({
      items: activities,
      cursor: initialActivityCursor,
    });
    setUnreadMessagesState(unreadMessages);
    setPartnerMoodState(partnerMood);
    setCurrentMoodState(currentMood);
  }, [activities, currentMood, initialActivityCursor, nextEvent, partnerMood, unreadMessages]);

  const refreshSnapshot = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/snapshot");
      const body = await response.json();
      if (!response.ok || !body) return;

      if (body?.couple) {
        setLiveCouple(normalizeCouple(body.couple));
      }
      setNextEventState(body?.nextEvent ?? null);
      setActivityState({
        items: Array.isArray(body?.activities) ? body.activities : [],
        cursor: body?.nextActivityCursor ?? null,
      });
      setUnreadMessagesState(Number(body?.unreadMessages ?? 0));
      setPartnerMoodState(body?.partnerMood ?? null);
      setCurrentMoodState(body?.currentMood ?? null);
    } catch {
      // Keep the last known state when refresh fails.
    }
  }, []);

  useEffect(() => {
    refreshSnapshot();
  }, [refreshSnapshot]);

  useEffect(() => {
    if (!liveCouple?.id) return undefined;

    const supabase = createClient();
    const channel = supabase.channel(`dashboard-${liveCouple.id}`);
    const shouldRefreshForDiary = (payload) => {
      const actorId = payload?.new?.author_id ?? payload?.old?.author_id;
      return Boolean(actorId && (actorId === user.id || actorId === partner?.id));
    };

    channel
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `couple_id=eq.${liveCouple.id}` }, refreshSnapshot)
      .on("postgres_changes", { event: "*", schema: "public", table: "events", filter: `couple_id=eq.${liveCouple.id}` }, refreshSnapshot)
      .on("postgres_changes", { event: "*", schema: "public", table: "bucket_items", filter: `couple_id=eq.${liveCouple.id}` }, refreshSnapshot)
      .on("postgres_changes", { event: "*", schema: "public", table: "couples", filter: `id=eq.${liveCouple.id}` }, refreshSnapshot)
      .on("postgres_changes", { event: "*", schema: "public", table: "couple_achievements", filter: `couple_id=eq.${liveCouple.id}` }, refreshSnapshot)
      .on("postgres_changes", { event: "*", schema: "public", table: "media" }, refreshSnapshot)
      .on("postgres_changes", { event: "*", schema: "public", table: "diary_entries" }, (payload) => {
        if (shouldRefreshForDiary(payload)) {
          refreshSnapshot();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [liveCouple?.id, partner?.id, refreshSnapshot, user.id]);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4">
      <div className="flex justify-end">
        <AccountMenu user={user} lang={lang} />
      </div>

      <DashboardHeader couple={liveCouple} user={user} partner={partner} lang={lang} />
      <MilestoneCelebration totalDays={liveCouple?.totalDays ?? 0} lang={lang} />

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <LoveCounter startDate={liveCouple?.startDate} lang={lang} />
        <EventCountdown event={nextEventState} lang={lang} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <MoodCheckIn partnerMood={partnerMoodState} initialMood={currentMoodState} onMoodChange={setCurrentMoodState} lang={lang} />
        <DailyQuote />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <ActivityFeed initialActivities={activityState.items} initialCursor={activityState.cursor} lang={lang} />
        <div className="space-y-4">
          <WeatherWidget lang={lang} />
          <Card className="border-white/70 bg-white/85 shadow-lg backdrop-blur">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Send className="h-4 w-4 text-rose-500" />
                {lang === "vi" ? "Lối tắt nhanh" : "Quick actions"}
              </CardDescription>
              <CardTitle className="text-xl">
                {lang === "vi" ? "Thực hiện ngay" : "Jump in"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-rose-50 p-4 text-sm text-muted-foreground">
                {lang === "vi"
                  ? `Tin nhắn chưa đọc: ${unreadMessagesState}`
                  : `Unread messages: ${unreadMessagesState}`}
              </div>
              <QuickActions unreadMessages={unreadMessagesState} lang={lang} />
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-2 bg-white/70" />
    </div>
  );
}
