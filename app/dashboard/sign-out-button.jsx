"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const { lang } = useLanguage();
  const copy = lang === "vi" ? { label: "Đăng xuất", loading: "Đang đăng xuất..." } : { label: "Sign out", loading: "Signing out..." };

  async function onSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <Button variant="outline" onClick={onSignOut} disabled={loading}>
      {loading ? copy.loading : copy.label}
    </Button>
  );
}
