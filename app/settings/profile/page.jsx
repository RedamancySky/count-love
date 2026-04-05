import { ProfileEditor } from "@/components/features/dashboard/DashboardContent";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,full_name,nickname,bio,avatar_url,birth_date")
    .eq("id", user.id)
    .maybeSingle();

  const userData = {
    id: user.id,
    name: profile?.nickname || profile?.full_name || user.email || "Bạn",
    nickname: profile?.nickname || "",
    fullName: profile?.full_name || "",
    bio: profile?.bio || "",
    avatarUrl: profile?.avatar_url || "",
    birthDate: profile?.birth_date ? String(profile.birth_date).slice(0, 10) : "",
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" className="mb-4 gap-2 px-0 text-muted-foreground hover:text-foreground">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </Button>
        <ProfileEditor profile={userData} lang="vi" />
      </div>
    </main>
  );
}
