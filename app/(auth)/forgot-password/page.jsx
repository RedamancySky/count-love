"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell, InlineError } from "../_components";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetToken("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error?.message ?? "Unexpected error.");
      } else {
        setMessage(data?.message ?? "If email exists, reset link was sent.");
        setResetToken(data?.debug?.resetToken ?? "");
      }
    } catch {
      setError("Khong the ket noi server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Forgot password" subtitle="Request a reset link" footer={<span><Link href="/login" className="text-rose-600">Back to login</Link></span>}>
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <label className="block text-sm text-slate-700">
          Email
          <input
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <button type="submit" className="h-10 w-full rounded-lg bg-rose-600 text-white disabled:opacity-60" disabled={loading}>
          {loading ? "Sending..." : "Send link"}
        </button>

        <InlineError text={error} />

        {message ? (
          <div className="text-sm text-emerald-700 space-y-1">
            <p>{message}</p>
            {resetToken ? (
              <Link href={`/reset-password?token=${encodeURIComponent(resetToken)}`} className="text-rose-600 underline">
                Open reset page (debug link)
              </Link>
            ) : null}
          </div>
        ) : null}
      </form>
    </AuthShell>
  );
}
