"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";

export default function Home() {
    const { lang } = useLanguage();
    const copy =
        lang === "vi"
            ? {
                  title: "Count Love",
                  subtitle:
                      "Bắt đầu bằng cách tạo tài khoản với Supabase Auth.",
                  register: "Đăng ký",
                  login: "Đăng nhập",
              }
            : {
                  title: "Count Love",
                  subtitle:
                      "Start by creating your account with Supabase Auth.",
                  register: "Sign up",
                  login: "Sign in",
              };

    return (
        <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-rose-50 via-white to-pink-100 p-6">
            <Card className="w-full max-w-xl border-white/70 bg-white/85 shadow-xl backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-3xl">{copy.title}</CardTitle>
                    <CardDescription>{copy.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-3">
                    <Button asChild>
                        <Link href="/register">{copy.register}</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/login">{copy.login}</Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
