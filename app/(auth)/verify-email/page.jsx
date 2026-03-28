"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell, InlineError } from "../_components";

function VerifyEmailContent() {
  const token = useSearchParams().get("token") ?? "";
  const [status, setStatus] = useState(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "Verifying email..." : "Missing verify token.");
  const [email, setEmail] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resendToken, setResendToken] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Verify failed");
        setStatus("success");
        setMessage("Email verified. You can login now.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error.message);
      });
  }, [token]);

  async function resendVerifyLink(e) {
    e.preventDefault();
    setResendError("");
    setResendMessage("");
    setResendToken("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/resend-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setResendError(data?.error?.message ?? "Cannot resend verify link.");
      } else {
        setResendMessage(data?.message ?? "Verification link sent.");
        setResendToken(data?.debug?.verifyToken ?? "");
      }
    } catch {
      setResendError("Khong the ket noi server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Verify email"
      subtitle="Account security"
      footer={<Link href="/login" className="text-rose-600">Go to login</Link>}
    >
      <p className={status === "success" ? "text-emerald-700" : status === "error" ? "text-red-600" : "text-slate-600"}>{message}</p>

      {status === "error" ? (
        <form className="mt-4 space-y-3" onSubmit={resendVerifyLink} noValidate>
          <label className="block text-sm text-slate-700">
            Email to resend verification
            <input
              type="email"
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button className="h-10 w-full rounded-lg bg-rose-600 text-white disabled:opacity-60" disabled={loading} type="submit">
            {loading ? "Sending..." : "Resend verify link"}
          </button>
          <InlineError text={resendError} />
          {resendMessage ? <p className="text-sm text-emerald-700">{resendMessage}</p> : null}
          {resendToken ? (
            <Link className="text-sm text-rose-600 underline" href={`/verify-email?token=${encodeURIComponent(resendToken)}`}>
              Open new verify link (debug)
            </Link>
          ) : null}
        </form>
      ) : null}
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthShell title="Verify email" subtitle="Loading..." />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
