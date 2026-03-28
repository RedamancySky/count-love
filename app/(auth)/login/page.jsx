"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell, InlineError, OAuthButtons } from "../_components";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState("");

  function onLoginSuccess(user) {
    if (user?.id) {
      localStorage.setItem("countlove_user", user.id);
    }
    window.location.href = user?.onboardingCompleted ? "/dashboard" : "/onboarding";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors(data?.error?.details ?? { form: data?.error?.message ?? "Login failed." });
      } else {
        setMessage("Login success.");
        onLoginSuccess(data.user);
      }
    } catch {
      setErrors({ form: "Khong the ket noi server." });
    } finally {
      setLoading(false);
    }
  }

  async function onOAuth(provider) {
    setErrors({});
    setMessage("");
    setLoadingProvider(provider);

    try {
      const response = await fetch("/api/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          email: form.email || undefined,
          name: form.email ? form.email.split("@")[0] : undefined,
          rememberMe: form.rememberMe,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors(data?.error?.details ?? { form: data?.error?.message ?? `OAuth ${provider} failed.` });
      } else {
        setMessage(data?.message ?? "OAuth success.");
        onLoginSuccess(data.user);
      }
    } catch {
      setErrors({ form: "Khong the ket noi server." });
    } finally {
      setLoadingProvider("");
    }
  }

  return (
    <AuthShell
      title="Login"
      subtitle="Sign in to continue"
      footer={
        <span>
          No account yet? <Link href="/register" className="text-rose-600">Register</Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <label className="block text-sm text-slate-700">
          Email
          <input
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            autoComplete="email"
          />
          <InlineError text={errors.email} />
        </label>

        <label className="block text-sm text-slate-700">
          Password
          <input
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
            type="password"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            autoComplete="current-password"
          />
          <InlineError text={errors.password} />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.rememberMe}
            onChange={(e) => setForm((s) => ({ ...s, rememberMe: e.target.checked }))}
          />
          Remember me (30 days)
        </label>

        <button type="submit" className="h-10 w-full rounded-lg bg-rose-600 text-white disabled:opacity-60" disabled={loading || Boolean(loadingProvider)}>
          {loading ? "Processing..." : "Login"}
        </button>

        <InlineError text={errors.form} />
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      </form>

      <OAuthButtons onOAuth={onOAuth} loadingProvider={loadingProvider} />

      <div className="mt-3 text-right">
        <Link href="/forgot-password" className="text-sm text-rose-600">
          Forgot password?
        </Link>
      </div>
    </AuthShell>
  );
}
