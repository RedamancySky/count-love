"use client";

import { useEffect, useMemo, useState } from "react";

const themePalette = {
  rose: { bg: "#ffe4e6", accent: "#e11d48", text: "#881337" },
  sunset: { bg: "#ffedd5", accent: "#f97316", text: "#9a3412" },
  forest: { bg: "#dcfce7", accent: "#16a34a", text: "#14532d" },
  ocean: { bg: "#dbeafe", accent: "#2563eb", text: "#1e3a8a" },
  mint: { bg: "#ccfbf1", accent: "#0d9488", text: "#134e4a" },
  peach: { bg: "#ffedd5", accent: "#ea580c", text: "#7c2d12" },
};

const themes = Object.keys(themePalette);

function getUserId() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("countlove_user") || "";
}

export default function OnboardingPage() {
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

  const selectedTheme = themePalette[data.themeName] ?? themePalette.rose;

  const daysInLove = useMemo(() => {
    if (!data.startDate) return 0;
    const date = new Date(data.startDate);
    if (Number.isNaN(date.valueOf())) return 0;
    return Math.max(0, Math.floor((Date.now() - date.valueOf()) / 86400000));
  }, [data.startDate]);

  useEffect(() => {
    if (!getUserId()) {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    if (!(step === 3 && data.createRoom && room && waitingForPartner)) return undefined;

    let active = true;

    async function pollStatus() {
      try {
        const response = await fetch("/api/auth/couple/status", {
          method: "GET",
          headers: { "x-user-id": getUserId() },
        });
        const body = await response.json();
        if (!active || !response.ok) return;

        setWaitingForPartner(Boolean(body.waitingForPartner));
        if (!body.waitingForPartner) {
          setStatus("Partner da ket noi. Ban co the tiep tuc sang buoc tiep theo.");
        }
      } catch {
        // Keep polling silently in scaffold mode.
      }
    }

    const interval = setInterval(pollStatus, 2000);
    pollStatus();

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [step, data.createRoom, room, waitingForPartner]);

  async function patchOnboarding(values) {
    const response = await fetch("/api/auth/onboarding", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": getUserId(),
      },
      body: JSON.stringify(values),
    });
    const body = await response.json();

    if (!response.ok) {
      setErrors(body?.error?.details ?? { form: body?.error?.message ?? "Save failed." });
      throw new Error(body?.error?.message ?? "Save failed");
    }
  }

  async function createRoom() {
    const response = await fetch("/api/auth/couple/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": getUserId(),
      },
    });
    const body = await response.json();

    if (!response.ok) {
      setErrors(body?.error?.details ?? { form: body?.error?.message ?? "Create room failed." });
      throw new Error(body?.error?.message ?? "Create room failed");
    }

    setRoom(body?.couple ?? null);
    setWaitingForPartner(true);
    setStatus("Da tao phong ket noi. Hay gui ma/QR cho nguoi yeu va cho ho tham gia.");
  }

  async function joinRoom() {
    const response = await fetch("/api/auth/couple/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": getUserId(),
      },
      body: JSON.stringify({ code: data.code, invitePayload: data.invitePayload }),
    });
    const body = await response.json();

    if (!response.ok) {
      setErrors(body?.error?.details ?? { form: body?.error?.message ?? "Join room failed." });
      throw new Error(body?.error?.message ?? "Join room failed");
    }
  }

  function validateCurrentStep() {
    const nextErrors = {};

    if (step === 2) {
      if (!data.nickname.trim()) nextErrors.nickname = "Display name is required.";
      if (!data.birthDate) nextErrors.birthDate = "Birth date is required.";
    }

    if (step === 3 && !data.createRoom && !data.code.trim() && !data.invitePayload.trim()) {
      nextErrors.code = "Nhap ma 6 ky tu hoac QR payload de tham gia.";
    }

    if (step === 4 && !data.startDate) {
      nextErrors.startDate = "Please choose relationship start date.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onNext() {
    if (loading) return;
    setStatus("");
    setErrors({});

    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      if (step === 2) {
        await patchOnboarding({
          step: 2,
          nickname: data.nickname,
          birthDate: data.birthDate,
          bio: data.bio,
          avatar: data.avatar || undefined,
        });
      }

      if (step === 3) {
        if (data.createRoom) {
          if (!room) {
            await createRoom();
            setLoading(false);
            return;
          }
        } else {
          await joinRoom();
          setWaitingForPartner(false);
          setStatus("Tham gia phong thanh cong.");
        }
      }

      if (step === 4) {
        await patchOnboarding({ step: 4, startDate: data.startDate });
      }

      if (step === 5) {
        await patchOnboarding({ step: 5, themeName: data.themeName, coupleTitle: data.coupleTitle || undefined });
      }

      setStep((current) => Math.min(6, current + 1));
    } catch {
      // Error state already set above.
    } finally {
      setLoading(false);
    }
  }

  async function completeOnboarding() {
    if (loading) return;
    setLoading(true);
    setStatus("");
    setErrors({});

    try {
      await patchOnboarding({ step: 6 });
      window.location.href = "/dashboard";
    } catch {
      // Error state already set above.
    } finally {
      setLoading(false);
    }
  }

  async function onAvatarSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, avatar: "Chi nhan file hinh anh." }));
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
    <main className="mx-auto max-w-4xl p-4 md:p-8">
      <section className="rounded-3xl bg-white/90 p-6 shadow-xl border border-rose-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-600">Step {step}/6</div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 mt-1">Onboarding</h1>
          </div>
          <div className="h-2 w-32 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-rose-500 transition-all" style={{ width: `${(step / 6) * 100}%` }} />
          </div>
        </div>

        {step === 1 ? (
          <div className="mt-6 text-center">
            <div className="mx-auto relative h-28 w-28">
              <div className="absolute inset-0 rounded-full bg-rose-200 animate-ping-slow" />
              <div className="absolute inset-3 rounded-full bg-white border border-rose-300 flex items-center justify-center text-3xl">??</div>
            </div>
            <h2 className="mt-5 text-3xl font-semibold text-slate-900">Welcome to Count Love</h2>
            <p className="mt-2 text-slate-600">Six quick steps to secure your account and connect with your partner.</p>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-4 grid gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">Create profile</h2>

            <label className="text-sm text-slate-700">
              Avatar (upload or camera)
              <input
                className="mt-1 block w-full text-sm"
                type="file"
                accept="image/*"
                capture="user"
                onChange={onAvatarSelected}
              />
            </label>

            {data.avatar ? (
              <img src={data.avatar} alt="Avatar preview" className="h-24 w-24 rounded-full object-cover border border-slate-300" />
            ) : null}
            {errors.avatar ? <p className="text-xs text-red-600">{errors.avatar}</p> : null}

            <label className="text-sm text-slate-700">
              Display name *
              <input
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
                value={data.nickname}
                onChange={(e) => setData((s) => ({ ...s, nickname: e.target.value }))}
              />
            </label>
            {errors.nickname ? <p className="text-xs text-red-600">{errors.nickname}</p> : null}

            <label className="text-sm text-slate-700">
              Birth date *
              <input
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={data.birthDate}
                onChange={(e) => setData((s) => ({ ...s, birthDate: e.target.value }))}
              />
            </label>
            {errors.birthDate ? <p className="text-xs text-red-600">{errors.birthDate}</p> : null}

            <label className="text-sm text-slate-700">
              Bio (max 150)
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                maxLength={150}
                value={data.bio}
                onChange={(e) => setData((s) => ({ ...s, bio: e.target.value }))}
              />
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-4 grid gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">Connect partner</h2>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={data.createRoom}
                onChange={() => {
                  setData((s) => ({ ...s, createRoom: true }));
                  setRoom(null);
                  setWaitingForPartner(false);
                  setStatus("");
                }}
              />
              Create room
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!data.createRoom}
                onChange={() => {
                  setData((s) => ({ ...s, createRoom: false }));
                  setRoom(null);
                  setWaitingForPartner(false);
                  setStatus("");
                }}
              />
              Join room
            </label>

            {data.createRoom ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                {!room ? <p className="text-sm text-slate-600">Tap Continue to generate 6-char code and QR.</p> : null}

                {room ? (
                  <>
                    <p className="text-sm text-slate-700">Invite code</p>
                    <p className="text-3xl font-bold tracking-[0.2em] text-slate-900">{room.coupleCode}</p>
                    <img src={room.qrCodeUrl} alt="Couple room QR" className="h-44 w-44 rounded-lg border border-slate-300 bg-white" />
                    <p className="text-xs text-slate-500 break-all">{room.qrCodePayload}</p>

                    {waitingForPartner ? (
                      <div className="flex items-center gap-2 text-amber-700 text-sm">
                        <span className="inline-flex h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                        Dang cho nguoi yeu quet QR / nhap ma...
                      </div>
                    ) : (
                      <p className="text-sm text-emerald-700">Partner da vao phong.</p>
                    )}
                  </>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="text-sm text-slate-700">
                  6-char code
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 uppercase"
                    value={data.code}
                    onChange={(e) => setData((s) => ({ ...s, code: e.target.value.toUpperCase() }))}
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Or paste QR payload (countlove://...)
                  <textarea
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={data.invitePayload}
                    onChange={(e) => setData((s) => ({ ...s, invitePayload: e.target.value }))}
                  />
                </label>
              </div>
            )}

            {errors.code ? <p className="text-xs text-red-600">{errors.code}</p> : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mt-4 grid gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">Relationship start date</h2>
            <input
              className="h-10 rounded-lg border border-slate-300 px-3"
              type="date"
              value={data.startDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setData((s) => ({ ...s, startDate: e.target.value }))}
            />
            <p className="text-slate-700">You have been together for {daysInLove} days.</p>
            {errors.startDate ? <p className="text-xs text-red-600">{errors.startDate}</p> : null}
          </div>
        ) : null}

        {step === 5 ? (
          <div className="mt-4 grid gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">Pick a theme</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  className={`h-10 rounded-lg border text-sm capitalize ${data.themeName === theme ? "border-rose-600 bg-rose-50" : "border-slate-300"}`}
                  onClick={() => setData((s) => ({ ...s, themeName: theme }))}
                >
                  {theme}
                </button>
              ))}
            </div>

            <label className="text-sm text-slate-700">
              Couple title (optional)
              <input
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
                value={data.coupleTitle}
                onChange={(e) => setData((s) => ({ ...s, coupleTitle: e.target.value }))}
                placeholder="e.g. Team Forever"
              />
            </label>

            <div
              className="rounded-xl border p-4 transition-all"
              style={{
                backgroundColor: selectedTheme.bg,
                borderColor: selectedTheme.accent,
                color: selectedTheme.text,
              }}
            >
              <p className="text-sm uppercase tracking-wide">Live preview</p>
              <p className="text-xl font-semibold mt-1">{data.coupleTitle || "Your Couple"}</p>
              <p className="text-sm mt-1">Theme: {data.themeName}</p>
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="mt-6 text-center relative overflow-hidden rounded-2xl border border-rose-200 bg-rose-50 p-8">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <span className="confetti-dot confetti-a" />
              <span className="confetti-dot confetti-b" />
              <span className="confetti-dot confetti-c" />
            </div>
            <h2 className="text-3xl font-semibold text-slate-900">Congrats! ?</h2>
            <p className="text-slate-700 mt-2">Your account setup is complete. Let&apos;s explore the dashboard.</p>
          </div>
        ) : null}

        {errors.form ? <p className="text-sm text-red-600 mt-4">{errors.form}</p> : null}
        {status ? <p className="text-sm text-slate-700 mt-4">{status}</p> : null}

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            className="h-10 px-4 rounded-lg border border-slate-300 disabled:opacity-50"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || loading}
          >
            Back
          </button>

          {step < 6 ? (
            <button type="button" className="h-10 px-4 rounded-lg bg-rose-600 text-white disabled:opacity-50" onClick={onNext} disabled={loading}>
              {loading
                ? "Processing..."
                : step === 3 && data.createRoom && !room
                  ? "Create room"
                  : step === 3 && data.createRoom && room && waitingForPartner
                    ? "Continue while waiting"
                    : "Continue"}
            </button>
          ) : (
            <button type="button" className="h-10 px-4 rounded-lg bg-rose-600 text-white disabled:opacity-50" onClick={completeOnboarding} disabled={loading}>
              {loading ? "Finishing..." : "Explore now"}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
