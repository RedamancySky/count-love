"use client";

import { useCallback, useEffect, useState } from "react";

export interface DashboardActivity {
  id: string;
  type: string;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  title: string;
  description: string;
  targetUrl: string;
  thumbnail: string;
  createdAt: string;
}

export function useActivityFeed(initialActivities: DashboardActivity[], initialCursor: string | null) {
  const [activities, setActivities] = useState(initialActivities);
  const [cursor, setCursor] = useState(initialCursor);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setActivities(initialActivities);
    setCursor(initialCursor);
  }, [initialActivities, initialCursor]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);

    try {
      const response = await fetch(`/api/dashboard/activity-feed?limit=10&cursor=${encodeURIComponent(cursor)}`);
      const body = await response.json();
      if (!response.ok) return;
      setActivities((current) => [...current, ...(Array.isArray(body?.activities) ? body.activities : [])]);
      setCursor(body?.nextCursor ?? null);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore]);

  return { activities, cursor, loadingMore, loadMore, setActivities, setCursor };
}
