"use client";

import Link from "next/link";

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg border border-rose-100">
        <div className="mb-5">
          <Link href="/" className="text-sm text-rose-600">
            Count Love
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 mt-2">{title}</h1>
          {subtitle ? <p className="text-sm text-slate-600 mt-1">{subtitle}</p> : null}
        </div>
        {children}
        {footer ? <div className="mt-5 text-sm text-slate-600">{footer}</div> : null}
      </div>
    </div>
  );
}

export function InlineError({ text }) {
  if (!text) return null;
  return (
    <p className="text-xs text-red-600 mt-1" role="alert">
      {text}
    </p>
  );
}

export function OAuthButtons({ onOAuth, loadingProvider }) {
  return (
    <div className="grid grid-cols-1 gap-2 mt-3" aria-label="oauth-signin-options">
      <button
        type="button"
        className="h-10 rounded-lg border border-slate-300 text-sm text-slate-700 disabled:opacity-50"
        onClick={() => onOAuth?.("google")}
        disabled={Boolean(loadingProvider)}
      >
        {loadingProvider === "google" ? "Dang ket noi Google..." : "Dang nhap voi Google"}
      </button>
      <button
        type="button"
        className="h-10 rounded-lg border border-slate-300 text-sm text-slate-700 disabled:opacity-50"
        onClick={() => onOAuth?.("facebook")}
        disabled={Boolean(loadingProvider)}
      >
        {loadingProvider === "facebook" ? "Dang ket noi Facebook..." : "Dang nhap voi Facebook"}
      </button>
    </div>
  );
}
