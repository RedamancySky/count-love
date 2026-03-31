"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/components/language-provider";
import { AuthShell, InlineError } from "../_components";

export default function ResetPasswordPage() {
  const { lang } = useLanguage();
  const copy =
    lang === "vi"
      ? {
          title: "Đặt lại mật khẩu",
          subtitle: "Liên kết này chỉ dùng được một lần",
          back: "Quay lại đăng nhập",
          newPassword: "Mật khẩu mới",
          confirmPassword: "Xác nhận mật khẩu",
          saving: "Đang lưu...",
          save: "Lưu mật khẩu",
          mismatch: "Mật khẩu xác nhận không khớp.",
          invalidLink: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.",
          success: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.",
          connectError: "Không thể kết nối server.",
        }
      : {
          title: "Reset password",
          subtitle: "This link can be used once",
          back: "Back to sign in",
          newPassword: "New password",
          confirmPassword: "Confirm password",
          saving: "Saving...",
          save: "Save password",
          mismatch: "Confirm password does not match.",
          invalidLink: "This reset link is invalid or expired. Please request a new one.",
          success: "Password reset successful. You can sign in now.",
          connectError: "Cannot connect to server.",
        };

  const invalidLinkText = copy.invalidLink;
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) {
        setReady(true);
        return;
      }
      setErrors({ form: invalidLinkText });
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [supabase, invalidLinkText]);

  async function onSubmit(e) {
    e.preventDefault();
    setErrors({});
    setMessage("");
    setLoading(true);

    try {
      if (form.password !== form.confirmPassword) {
        setErrors({ confirmPassword: copy.mismatch });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: form.password });
      if (error) {
        setErrors({ form: error.message ?? "Unexpected error." });
      } else {
        setMessage(copy.success);
      }
    } catch {
      setErrors({ form: copy.connectError });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={copy.title}
      subtitle={copy.subtitle}
      footer={<span><Link href="/login" className="text-primary">{copy.back}</Link></span>}
    >
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <Label>
          {copy.newPassword}
          <Input
            className="mt-1"
            type="password"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            autoComplete="new-password"
          />
          <InlineError text={errors.password} />
        </Label>

        <Label>
          {copy.confirmPassword}
          <Input
            className="mt-1"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))}
            autoComplete="new-password"
          />
          <InlineError text={errors.confirmPassword} />
        </Label>

        <Button type="submit" className="w-full" disabled={loading || !ready}>
          {loading ? copy.saving : copy.save}
        </Button>

        <InlineError text={errors.form} />
        {message ? (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
      </form>
    </AuthShell>
  );
}
