"use client";

import { useEffect, useState } from "react";
import { clientApiRequest } from "@/lib/api/admin-client";
import type { PaginationMeta } from "@/lib/api/types";

export type TaxonomyOption = { id: string; name: string; slug: string; color?: string };

export function useTaxonomyOptions(type: "category" | "tag", search: string) {
  const [items, setItems] = useState<TaxonomyOption[]>([]);
  const key = `${type}:${search}`;
  const [pagination, setPagination] = useState({ key, page: 1 });
  const page = pagination.key === key ? pagination.page : 1;
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const result = await clientApiRequest<TaxonomyOption[], PaginationMeta>("/blog/taxonomy/options", { query: { type, search: search || undefined, page, limit: 20 } });
        setItems((current) => page === 1 ? result.data : [...current, ...result.data.filter((next) => !current.some((item) => item.id === next.id))]);
        setHasMore(Boolean(result.meta?.hasNextPage));
      } finally { setLoading(false); }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [page, search, type]);
  return { items, loading, hasMore, loadMore: () => hasMore && !loading && setPagination({ key, page: page + 1 }) };
}
