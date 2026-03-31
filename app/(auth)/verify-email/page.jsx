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

export default function VerifyEmailPage() {
  const { lang } = useLanguage();
  const copy =
    lang === "vi"
      ? {
          title: "Xác minh email",
          subtitle: "Bảo mật tài khoản",
          goLogin: "Đi tới đăng nhập",
          note: "Kiểm tra hộp thư để xác minh email. Nếu chưa nhận được, bạn có thể gửi lại.",
          resendField: "Email để gửi lại xác minh",
          sending: "Đang gửi...",
          resend: "Gửi lại email xác minh",
          resent: "Đã gửi lại email xác minh.",
          connectError: "Không thể kết nối server.",
        }
      : {
          title: "Verify email",
          subtitle: "Account security",
          goLogin: "Go to sign in",
          note: "Check your inbox to verify your email. If you did not receive it, resend below.",
          resendField: "Email for resend",
          sending: "Sending...",
          resend: "Resend verification email",
          resent: "Verification email has been resent.",
          connectError: "Cannot connect to server.",
        };

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState(copy.note);
  const [email, setEmail] = useState("");
  const [resendError, setResendError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  async function resendVerifyLink(e) {
    e.preventDefault();
    setResendError("");
    setStatus("idle");
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        setResendError(error.message ?? "Cannot resend verify link.");
      } else {
        setStatus("success");
        setMessage(copy.resent);
      }
    } catch {
      setResendError(copy.connectError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={copy.title}
      subtitle={copy.subtitle}
      footer={<Link href="/login" className="text-primary">{copy.goLogin}</Link>}
    >
      <Alert>
        <AlertDescription>{message}</AlertDescription>
      </Alert>

      <form className="mt-4 space-y-3" onSubmit={resendVerifyLink} noValidate>
        <Label>
          {copy.resendField}
          <Input type="email" className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Label>
        <Button className="w-full" disabled={loading} type="submit">
          {loading ? copy.sending : copy.resend}
        </Button>
        <InlineError text={resendError} />
      </form>

      {status === "success" ? (
        <Alert className="mt-3">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
    </AuthShell>
  );
}
