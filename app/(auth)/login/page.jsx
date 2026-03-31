"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/components/language-provider";
import { AuthShell, InlineError } from "../_components";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { lang } = useLanguage();

  const copy =
    lang === "vi"
      ? {
          title: "Đăng nhập",
          subtitle: "Đăng nhập để tiếp tục",
          noAccount: "Chưa có tài khoản?",
          register: "Đăng ký",
          email: "Email",
          password: "Mật khẩu",
          remember: "Ghi nhớ đăng nhập (30 ngày)",
          processing: "Đang xử lý...",
          login: "Đăng nhập",
          success: "Đăng nhập thành công.",
          forgot: "Quên mật khẩu?",
          connectError: "Không thể kết nối server.",
        }
      : {
          title: "Sign in",
          subtitle: "Sign in to continue",
          noAccount: "No account yet?",
          register: "Register",
          email: "Email",
          password: "Password",
          remember: "Remember me (30 days)",
          processing: "Processing...",
          login: "Sign in",
          success: "Login successful.",
          forgot: "Forgot password?",
          connectError: "Cannot connect to server.",
        };

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          rememberMe: form.rememberMe,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        setErrors({ form: body?.error?.message ?? copy.connectError });
      } else {
        setMessage(copy.success);
        window.location.href = "/dashboard";
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
      footer={
        <span>
          {copy.noAccount}{" "}
          <Link href="/register" className="text-primary">
            {copy.register}
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <Label>
          {copy.email}
          <Input
            className="mt-2"
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            autoComplete="email"
          />
          <InlineError text={errors.email} />
        </Label>

        <Label>
          {copy.password}
          <Input
            className="mt-2"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((s) => ({ ...s, password: e.target.value }))
            }
            autoComplete="current-password"
          />
          <InlineError text={errors.password} />
        </Label>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="rememberMe"
              className="size-5 rounded-[5px]"
              checked={form.rememberMe}
              onCheckedChange={(checked) =>
                setForm((s) => ({ ...s, rememberMe: Boolean(checked) }))
              }
            />
            <Label
              htmlFor="rememberMe"
              className="cursor-pointer text-[15px] font-normal leading-none"
            >
              {copy.remember}
            </Label>
          </div>
          <Link href="/forgot-password" className="text-sm text-primary">
            {copy.forgot}
          </Link>
        </div>

        <Button type="submit" className="mt-4 w-full" disabled={loading}>
          {loading ? copy.processing : copy.login}
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
