"use client";

import { useCallback, useState } from "react";
import { clientApiRequest } from "@/lib/api/admin-client";
import type { ReadinessResult } from "@/lib/api/types";

export function usePostReadiness(postId?: string, version?: number) {
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => {
    if (!postId) return null;
    setLoading(true);
    try {
      const response = await clientApiRequest<ReadinessResult>(`/blog/posts/${postId}/readiness`, { query: { expectedVersion: version } });
      setResult(response.data);
      return response.data;
    } finally { setLoading(false); }
  }, [postId, version]);
  return { result, loading, refresh };
}
