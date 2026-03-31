"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const themePalette = {
  rose: { bg: "#ffe4e6", accent: "#be123c", text: "#881337" },
  sunset: { bg: "#ffedd5", accent: "#c2410c", text: "#7c2d12" },
  forest: { bg: "#dcfce7", accent: "#15803d", text: "#14532d" },
  ocean: { bg: "#dbeafe", accent: "#1d4ed8", text: "#1e3a8a" },
  mint: { bg: "#ccfbf1", accent: "#0f766e", text: "#134e4a" },
  peach: { bg: "#fef3c7", accent: "#d97706", text: "#78350f" },
};

const themes = Object.keys(themePalette);

export default function OnboardingPage() {
  const { lang } = useLanguage();
  const supabase = useMemo(() => createClient(), []);
  const copy =
    lang === "vi"
      ? {
          title: "Thiết lập ban đầu",
          step: "Bước",
          welcomeTitle: "Chào mừng đến với Count Love",
          welcomeDesc: "6 bước nhanh để cá nhân hóa tài khoản và kết nối với người yêu.",
          profileTitle: "Hồ sơ cá nhân",
          avatar: "Ảnh đại diện",
          avatarHint: "Tải ảnh lên hoặc mở camera.",
          nickname: "Tên hiển thị *",
          birthDate: "Ngày sinh *",
          bio: "Giới thiệu (tối đa 150 ký tự)",
          connectTitle: "Kết nối người yêu",
          createRoom: "Tạo phòng",
          joinRoom: "Tham gia phòng",
          createRoomHint: "Nhấn Tiếp tục để tạo mã 6 ký tự và QR.",
          inviteCode: "Mã mời",
          waiting: "Đang chờ người yêu quét QR / nhập mã...",
          joined: "Đã kết nối thành công.",
          codeInput: "Mã 6 ký tự",
          payloadInput: "Hoặc dán QR payload (countlove://...)",
          dateTitle: "Ngày bắt đầu yêu",
          inLoveDays: "Hai bạn đã bên nhau",
          days: "ngày",
          themeTitle: "Chọn giao diện",
          coupleTitle: "Tên cặp đôi (không bắt buộc)",
          coupleTitlePh: "Ví dụ: Team Về Nhà",
          preview: "Xem trước",
          completeTitle: "Hoàn tất!",
          completeDesc: "Thiết lập tài khoản đã xong. Bắt đầu vào dashboard.",
          back: "Quay lại",
          next: "Tiếp tục",
          finish: "Vào dashboard",
          creatingRoom: "Tạo phòng",
          waitingLabel: "Tiếp tục khi sẵn sàng",
          loading: "Đang xử lý...",
          finishing: "Đang hoàn tất...",
          saveError: "Không thể lưu dữ liệu lúc này.",
          nicknameRequired: "Vui lòng nhập tên hiển thị.",
          birthDateRequired: "Vui lòng chọn ngày sinh.",
          dateRequired: "Vui lòng chọn ngày bắt đầu yêu.",
          roomRequired: "Nhập mã 6 ký tự hoặc QR payload để tham gia.",
          roomCreated: "Đã tạo phòng kết nối. Gửi mã cho người yêu để tham gia.",
          roomJoined: "Đã tham gia phòng thành công.",
          badImage: "Chỉ chấp nhận file ảnh.",
          progressDesc: "Hoàn thành từng bước để bắt đầu sử dụng ứng dụng.",
          yourCouple: "Cặp đôi của bạn",
        }
      : {
          title: "Onboarding",
          step: "Step",
          welcomeTitle: "Welcome to Count Love",
          welcomeDesc: "Six quick steps to personalize your account and connect with your partner.",
          profileTitle: "Create profile",
          avatar: "Avatar",
          avatarHint: "Upload an image or use camera.",
          nickname: "Display name *",
          birthDate: "Birth date *",
          bio: "Bio (max 150 chars)",
          connectTitle: "Connect partner",
          createRoom: "Create room",
          joinRoom: "Join room",
          createRoomHint: "Tap Continue to generate a 6-char code and QR.",
          inviteCode: "Invite code",
          waiting: "Waiting for your partner to scan QR or enter code...",
          joined: "Connected successfully.",
          codeInput: "6-char code",
          payloadInput: "Or paste QR payload (countlove://...)",
          dateTitle: "Relationship start date",
          inLoveDays: "You have been together for",
          days: "days",
          themeTitle: "Pick a theme",
          coupleTitle: "Couple title (optional)",
          coupleTitlePh: "e.g. Team Forever",
          preview: "Live preview",
          completeTitle: "All set!",
          completeDesc: "Your account setup is done. Enter your dashboard.",
          back: "Back",
          next: "Continue",
          finish: "Go to dashboard",
          creatingRoom: "Create room",
          waitingLabel: "Continue when ready",
          loading: "Processing...",
          finishing: "Finishing...",
          saveError: "Cannot save data right now.",
          nicknameRequired: "Display name is required.",
          birthDateRequired: "Birth date is required.",
          dateRequired: "Please choose relationship start date.",
          roomRequired: "Enter 6-char code or QR payload to join.",
          roomCreated: "Room created. Share code with your partner to join.",
          roomJoined: "Joined room successfully.",
          badImage: "Only image files are accepted.",
          progressDesc: "Complete each step to start using the app.",
          yourCouple: "Your Couple",
        };

  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    nickname: "",
    birthDate: "",
    bio: "",
    avatar: "",
    createRoom: true,
    code: "",
    invitePayload: "",
    startDate: "",
    themeName: "rose",
    coupleTitle: "",
  });
  const [room, setRoom] = useState(null);
  const [waitingForPartner, setWaitingForPartner] = useState(false);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const daysInLove = useMemo(() => {
    if (!data.startDate) return 0;
    const date = new Date(data.startDate);
    if (Number.isNaN(date.valueOf())) return 0;
    return Math.max(0, Math.floor((Date.now() - date.valueOf()) / 86400000));
  }, [data.startDate]);

  const selectedTheme = themePalette[data.themeName] ?? themePalette.rose;

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        window.location.href = "/login";
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!(step === 3 && data.createRoom && room && waitingForPartner)) return undefined;

    let active = true;

    async function pollStatus() {
      try {
        const response = await fetch("/api/auth/couple/status", { method: "GET" });
        const body = await response.json();
        if (!active || !response.ok) return;

        setWaitingForPartner(Boolean(body.waitingForPartner));
        if (!body.waitingForPartner) {
          setStatus(copy.roomJoined);
        }
      } catch {
        // Keep polling silently.
      }
    }

    const interval = setInterval(pollStatus, 2000);
    pollStatus();

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [step, data.createRoom, room, waitingForPartner, copy.roomJoined]);

  function validateCurrentStep() {
    const nextErrors = {};

    if (step === 2) {
      if (!data.nickname.trim()) nextErrors.nickname = copy.nicknameRequired;
      if (!data.birthDate) nextErrors.birthDate = copy.birthDateRequired;
    }

    if (step === 3 && !data.createRoom && !data.code.trim() && !data.invitePayload.trim()) {
      nextErrors.code = copy.roomRequired;
    }

    if (step === 4 && !data.startDate) {
      nextErrors.startDate = copy.dateRequired;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function patchOnboarding(values) {
    const response = await fetch("/api/auth/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await response.json();

    if (!response.ok) {
      throw new Error(body?.error?.message ?? copy.saveError);
    }
  }

  async function createCoupleRoom() {
    const response = await fetch("/api/auth/couple/create", { method: "POST" });
    const body = await response.json();

    if (!response.ok) {
      throw new Error(body?.error?.message ?? copy.saveError);
    }

    setRoom(body?.couple ?? null);
    setWaitingForPartner(true);
    setStatus(copy.roomCreated);
  }

  async function joinCoupleRoom() {
    const response = await fetch("/api/auth/couple/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: data.code, invitePayload: data.invitePayload }),
    });
    const body = await response.json();

    if (!response.ok) {
      throw new Error(body?.error?.message ?? copy.saveError);
    }

    setRoom({
      coupleCode: body?.couple?.couple_code ?? data.code.toUpperCase(),
      qrCodePayload: data.invitePayload || "",
      qrCodeUrl: "",
    });
    setWaitingForPartner(false);
    setStatus(copy.roomJoined);
  }

  async function saveDraft(targetStep) {
    await patchOnboarding({
      step: targetStep,
      nickname: data.nickname,
      birthDate: data.birthDate,
      bio: data.bio,
      avatar: data.avatar || undefined,
      startDate: data.startDate || undefined,
      themeName: data.themeName || undefined,
      coupleTitle: data.coupleTitle || undefined,
    });
  }

  async function onNext() {
    if (loading) return;
    setErrors({});
    setStatus("");

    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      if (step === 3 && data.createRoom && !room) {
        await createCoupleRoom();
        return;
      }

      if (step === 3 && data.createRoom && room && waitingForPartner) {
        await saveDraft(3);
        return;
      }

      if (step === 3 && !data.createRoom) {
        await joinCoupleRoom();
      }

      await saveDraft(Math.min(step + 1, 6));
      setStep((current) => Math.min(6, current + 1));
    } catch (error) {
      setErrors({
        form: error instanceof Error && error.message ? error.message : copy.saveError,
      });
    } finally {
      setLoading(false);
    }
  }

  async function completeOnboarding() {
    if (loading) return;
    setLoading(true);
    setErrors({});

    try {
      await saveDraft(6);
      window.location.href = "/dashboard";
    } catch (error) {
      setErrors({
        form: error instanceof Error && error.message ? error.message : copy.saveError,
      });
    } finally {
      setLoading(false);
    }
  }

  function onAvatarSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, avatar: copy.badImage }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setErrors((prev) => ({ ...prev, avatar: undefined }));
      setData((prev) => ({ ...prev, avatar: String(reader.result ?? "") }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="mx-auto w-full max-w-4xl p-4 md:p-8">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl">{copy.title}</CardTitle>
              <CardDescription>
                {copy.step} {step}/6 - {copy.progressDesc}
              </CardDescription>
            </div>
            <div className="h-2 w-full max-w-40 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary transition-all" style={{ width: `${(step / 6) * 100}%` }} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {step === 1 ? (
            <section className="onb-fade-up space-y-2 text-center">
              <p className="onb-float text-3xl" aria-hidden="true">💕</p>
              <h2 className="text-3xl font-semibold">{copy.welcomeTitle}</h2>
              <p className="text-muted-foreground">{copy.welcomeDesc}</p>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="grid gap-3">
              <h2 className="text-xl font-semibold">{copy.profileTitle}</h2>

              <Label>
                {copy.avatar}
                <Input className="mt-1" type="file" accept="image/*" capture="user" onChange={onAvatarSelected} />
                <span className="text-xs text-muted-foreground">{copy.avatarHint}</span>
              </Label>

              {data.avatar ? <Image src={data.avatar} alt="Avatar preview" width={96} height={96} unoptimized className="h-24 w-24 rounded-full object-cover" /> : null}
              {errors.avatar ? <p className="text-xs text-destructive">{errors.avatar}</p> : null}

              <Label>
                {copy.nickname}
                <Input className="mt-1" value={data.nickname} onChange={(e) => setData((s) => ({ ...s, nickname: e.target.value }))} />
              </Label>
              {errors.nickname ? <p className="text-xs text-destructive">{errors.nickname}</p> : null}

              <Label>
                {copy.birthDate}
                <Input
                  className="mt-1"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={data.birthDate}
                  onChange={(e) => setData((s) => ({ ...s, birthDate: e.target.value }))}
                />
              </Label>
              {errors.birthDate ? <p className="text-xs text-destructive">{errors.birthDate}</p> : null}

              <Label>
                {copy.bio}
                <Textarea className="mt-1" maxLength={150} value={data.bio} onChange={(e) => setData((s) => ({ ...s, bio: e.target.value }))} />
              </Label>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="grid gap-3">
              <h2 className="text-xl font-semibold">{copy.connectTitle}</h2>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={data.createRoom ? "default" : "outline"}
                  onClick={() => {
                    setData((s) => ({ ...s, createRoom: true }));
                    setRoom(null);
                    setWaitingForPartner(false);
                    setStatus("");
                  }}
                >
                  {copy.createRoom}
                </Button>
                <Button
                  type="button"
                  variant={!data.createRoom ? "default" : "outline"}
                  onClick={() => {
                    setData((s) => ({ ...s, createRoom: false }));
                    setRoom(null);
                    setWaitingForPartner(false);
                    setStatus("");
                  }}
                >
                  {copy.joinRoom}
                </Button>
              </div>

              {data.createRoom ? (
                <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                  {!room ? <p className="text-sm text-muted-foreground">{copy.createRoomHint}</p> : null}
                  {room ? (
                    <>
                      <p className="text-sm text-muted-foreground">{copy.inviteCode}</p>
                      <p className="text-3xl font-bold tracking-[0.2em]">{room.coupleCode}</p>
                      {room.qrCodeUrl ? <Image src={room.qrCodeUrl} alt="Couple room QR" width={220} height={220} unoptimized className="rounded-md border bg-white" /> : null}
                      <p className="break-all text-xs text-muted-foreground">{room.qrCodePayload}</p>
                      <p className="text-sm text-primary">{waitingForPartner ? copy.waiting : copy.roomJoined}</p>
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
                  <Label>
                    {copy.codeInput}
                    <Input className="mt-1 uppercase" value={data.code} onChange={(e) => setData((s) => ({ ...s, code: e.target.value.toUpperCase() }))} />
                  </Label>
                  <Label>
                    {copy.payloadInput}
                    <Textarea className="mt-1" value={data.invitePayload} onChange={(e) => setData((s) => ({ ...s, invitePayload: e.target.value }))} />
                  </Label>
                </div>
              )}

              {errors.code ? <p className="text-xs text-destructive">{errors.code}</p> : null}
            </section>
          ) : null}

          {step === 4 ? (
            <section className="grid gap-3">
              <h2 className="text-xl font-semibold">{copy.dateTitle}</h2>
              <Input
                type="date"
                value={data.startDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setData((s) => ({ ...s, startDate: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">
                {copy.inLoveDays} {daysInLove} {copy.days}.
              </p>
              {errors.startDate ? <p className="text-xs text-destructive">{errors.startDate}</p> : null}
            </section>
          ) : null}

          {step === 5 ? (
            <section className="grid gap-3">
              <h2 className="text-xl font-semibold">{copy.themeTitle}</h2>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {themes.map((theme) => (
                  <Button
                    key={theme}
                    type="button"
                    variant={data.themeName === theme ? "default" : "outline"}
                    className="capitalize"
                    onClick={() => setData((s) => ({ ...s, themeName: theme }))}
                  >
                    {theme}
                  </Button>
                ))}
              </div>

              <Label>
                {copy.coupleTitle}
                <Input
                  className="mt-1"
                  value={data.coupleTitle}
                  placeholder={copy.coupleTitlePh}
                  onChange={(e) => setData((s) => ({ ...s, coupleTitle: e.target.value }))}
                />
              </Label>

              <div
                className="rounded-lg border p-4"
                style={{
                  backgroundColor: selectedTheme.bg,
                  borderColor: selectedTheme.accent,
                  color: selectedTheme.text,
                }}
              >
                <p className="text-xs uppercase tracking-wide">{copy.preview}</p>
                <p className="mt-1 text-xl font-semibold">{data.coupleTitle || copy.yourCouple}</p>
                <p className="text-sm">Theme: {data.themeName}</p>
              </div>
            </section>
          ) : null}

          {step === 6 ? (
            <section className="onb-fade-up space-y-2 rounded-lg border bg-muted/30 p-6 text-center">
              <p className="onb-float text-3xl" aria-hidden="true">✨</p>
              <h2 className="text-3xl font-semibold">{copy.completeTitle}</h2>
              <p className="text-muted-foreground">{copy.completeDesc}</p>
            </section>
          ) : null}

          {errors.form ? (
            <Alert variant="destructive">
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          ) : null}

          {status ? (
            <Alert>
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1 || loading}>
              {copy.back}
            </Button>

            {step < 6 ? (
              <Button type="button" onClick={onNext} disabled={loading}>
                {loading
                  ? copy.loading
                  : step === 3 && data.createRoom && !room
                    ? copy.creatingRoom
                    : step === 3 && data.createRoom && room && waitingForPartner
                      ? copy.waitingLabel
                    : copy.next}
              </Button>
            ) : (
              <Button type="button" onClick={completeOnboarding} disabled={loading}>
                {loading ? copy.finishing : copy.finish}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
