"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="fixed right-4 top-4 z-50 rounded-lg border bg-background/90 p-1 shadow-sm backdrop-blur">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant={lang === "vi" ? "default" : "ghost"}
          className={cn("h-7 px-2 text-xs", lang === "vi" ? "" : "text-muted-foreground")}
          onClick={() => setLang("vi")}
        >
          VI
        </Button>
        <Button
          type="button"
          size="sm"
          variant={lang === "en" ? "default" : "ghost"}
          className={cn("h-7 px-2 text-xs", lang === "en" ? "" : "text-muted-foreground")}
          onClick={() => setLang("en")}
        >
          EN
        </Button>
      </div>
    </div>
  );
}
