"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell, InlineError } from "../_components";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");
    setVerifyToken("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrors(data?.error?.details ?? { form: data?.error?.message ?? "Register failed." });
      } else {
        setMessage("Dang ky thanh cong. Vui long xac nhan email truoc khi dang nhap.");
        setVerifyToken(data?.debug?.verifyToken ?? "");
      }
    } catch {
      setErrors({ form: "Khong the ket noi server." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Register"
      subtitle="Create your Count Love account"
      footer={
        <span>
          Already have account? <Link href="/login" className="text-rose-600">Login</Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <label className="block text-sm text-slate-700">
          Full name
          <input
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            autoComplete="name"
          />
          <InlineError text={errors.name} />
        </label>

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
          {loading ? "Processing..." : "Register"}
        </button>

        <InlineError text={errors.form} />

        {message ? (
          <div className="text-sm text-emerald-700 space-y-1">
            <p>{message}</p>
            {verifyToken ? (
              <Link href={`/verify-email?token=${encodeURIComponent(verifyToken)}`} className="text-rose-600 underline">
                Verify now (debug link)
              </Link>
            ) : null}
          </div>
        ) : null}
      </form>
    </AuthShell>
  );
}
