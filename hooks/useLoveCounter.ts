"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateLoveDuration, type LoveDuration } from "@/lib/love-counter";

function parseDateOnly(value: string | null | undefined) {
  if (!value) return null;
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function useLoveCounter(startDate: string | null | undefined) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return useMemo<LoveDuration | null>(() => {
    const parsed = parseDateOnly(startDate);
    if (!parsed) return null;
    return calculateLoveDuration(parsed, now);
  }, [now, startDate]);
}
