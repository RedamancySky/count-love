"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";
import { SignOutButton } from "./sign-out-button";

export function DashboardContent({ email }) {
  const { lang } = useLanguage();
  const copy =
    lang === "vi"
      ? {
          title: "Bảng điều khiển",
          subtitle: "Được bảo vệ bằng phiên Supabase Auth.",
          signedInAs: "Đăng nhập với:",
        }
      : {
          title: "Dashboard",
          subtitle: "Protected by Supabase Auth session.",
          signedInAs: "Signed in as:",
        };

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle className="text-3xl">{copy.title}</CardTitle>
        <CardDescription>{copy.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {copy.signedInAs} {email}
        </p>
        <SignOutButton />
      </CardContent>
    </Card>
  );
}
