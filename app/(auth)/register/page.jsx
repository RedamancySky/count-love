"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/components/language-provider";
import { AuthShell, InlineError } from "../_components";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStrongPassword(value) {
  return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value);
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { lang } = useLanguage();

  const copy =
    lang === "vi"
      ? {
          title: "Đăng ký",
          subtitle: "Tạo tài khoản Count Love",
          hasAccount: "Đã có tài khoản?",
          login: "Đăng nhập",
          fullName: "Họ và tên",
          email: "Email",
          password: "Mật khẩu",
          confirmPassword: "Xác nhận mật khẩu",
          processing: "Đang xử lý...",
          register: "Đăng ký",
          nameRequired: "Họ và tên là bắt buộc.",
          emailInvalid: "Email không đúng định dạng.",
          passwordRule: "Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số.",
          passwordMismatch: "Mật khẩu xác nhận không khớp.",
          success: "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.",
          connectError: "Không thể kết nối server.",
        }
      : {
          title: "Register",
          subtitle: "Create your Count Love account",
          hasAccount: "Already have an account?",
          login: "Sign in",
          fullName: "Full name",
          email: "Email",
          password: "Password",
          confirmPassword: "Confirm password",
          processing: "Processing...",
          register: "Register",
          nameRequired: "Full name is required.",
          emailInvalid: "Invalid email format.",
          passwordRule: "Password must be at least 8 chars and include uppercase, lowercase, and a number.",
          passwordMismatch: "Confirm password does not match.",
          success: "Registration successful. Please check your email to verify.",
          connectError: "Cannot connect to server.",
        };

  function validateForm() {
    const nextErrors = {};
    const email = form.email.trim();

    if (!form.name.trim()) nextErrors.name = copy.nameRequired;
    if (!isValidEmail(email)) nextErrors.email = copy.emailInvalid;
    if (!isStrongPassword(form.password)) nextErrors.password = copy.passwordRule;
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = copy.passwordMismatch;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        const details = body?.error?.details;
        if (details && typeof details === "object") {
          setErrors((prev) => ({ ...prev, ...details }));
        }
        setErrors((prev) => ({ ...prev, form: body?.error?.message ?? copy.connectError }));
      } else {
        setErrors({});
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
      footer={
        <span>
          {copy.hasAccount} <Link href="/login" className="text-primary">{copy.login}</Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <Label>
          {copy.fullName}
          <Input
            className="mt-1"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            autoComplete="name"
          />
          <InlineError text={errors.name} />
        </Label>

        <Label>
          {copy.email}
          <Input
            className="mt-1"
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

        <Button type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? copy.processing : copy.register}
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

