"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell, InlineError } from "../_components";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErrors({});
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...form }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrors(data?.error?.details ?? { form: data?.error?.message ?? "Unexpected error." });
      } else {
        setMessage("Password reset success. You can login now.");
      }
    } catch {
      setErrors({ form: "Khong the ket noi server." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="This link can be used once"
      footer={<span><Link href="/login" className="text-rose-600">Back to login</Link></span>}
    >
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <label className="block text-sm text-slate-700">
          New password
          <input
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
            type="password"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            autoComplete="new-password"
          />
          <InlineError text={errors.password} />
        </label>

        <label className="block text-sm text-slate-700">
          Confirm password
          <input
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))}
            autoComplete="new-password"
          />
          <InlineError text={errors.confirmPassword} />
        </label>

        <button type="submit" className="h-10 w-full rounded-lg bg-rose-600 text-white disabled:opacity-60" disabled={loading}>
          {loading ? "Saving..." : "Save password"}
        </button>

        <InlineError text={errors.form || errors.token} />
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthShell title="Reset password" subtitle="Loading..." />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
