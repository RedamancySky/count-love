"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/components/language-provider";
import { AuthShell, InlineError } from "../_components";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const { lang } = useLanguage();

  const copy =
    lang === "vi"
      ? {
          title: "Quên mật khẩu",
          subtitle: "Yêu cầu liên kết đặt lại mật khẩu",
          back: "Quay lại đăng nhập",
          email: "Email",
          sending: "Đang gửi...",
          send: "Gửi liên kết",
          success: "Nếu email tồn tại, Supabase đã gửi liên kết đặt lại mật khẩu.",
          connectError: "Không thể kết nối server.",
        }
      : {
          title: "Forgot password",
          subtitle: "Request a password reset link",
          back: "Back to sign in",
          email: "Email",
          sending: "Sending...",
          send: "Send link",
          success: "If the email exists, Supabase has sent a reset link.",
          connectError: "Cannot connect to server.",
        };

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message ?? "Unexpected error.");
      } else {
        setMessage(copy.success);
      }
    } catch {
      setError(copy.connectError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title={copy.title} subtitle={copy.subtitle} footer={<span><Link href="/login" className="text-primary">{copy.back}</Link></span>}>
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <Label>
          {copy.email}
          <Input
            className="mt-1"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </Label>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? copy.sending : copy.send}
        </Button>

        <InlineError text={error} />

        {message ? (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
      </form>
    </AuthShell>
  );
}
