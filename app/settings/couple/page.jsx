import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CoupleAccessCard } from "@/components/features/dashboard/DashboardContent";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function CoupleSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("id,user1_id,user2_id,start_date,couple_code,theme_name,couple_title,cover_image,status")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .maybeSingle();

  const coupleData = couple
    ? {
        id: couple.id,
        title: couple.couple_title || "Cặp đôi của bạn",
        code: couple.couple_code,
        startDate: couple.start_date ? String(couple.start_date) : null,
        themeName: couple.theme_name || "rose",
        coverImage: couple.cover_image || "",
        status: couple.status || "PENDING",
        totalDays: 0,
      }
    : null;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" className="mb-4 gap-2 px-0 text-muted-foreground hover:text-foreground">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </Button>
        <CoupleAccessCard couple={coupleData} lang="vi" />
      </div>
    </main>
  );
}
