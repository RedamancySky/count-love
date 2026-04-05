"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-3xl border border-white/70 bg-white/85 p-8 text-center shadow-xl">
        <h1 className="text-2xl font-semibold">Không tải được dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Dữ liệu couple hoặc một widget đã gặp lỗi. Bạn có thể thử tải lại hoặc quay về dashboard sau.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => reset()}>Thử lại</Button>
          <Button asChild variant="outline">
            <Link href="/login">Về đăng nhập</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
