import { LinkButton } from "./Button";
import type { PaginationMeta } from "@/lib/api/types";

export function buildPaginationHref(basePath: string, page: number, query?: Record<string, string | number | undefined>) {
    const [path, existing = ""] = basePath.split("?");
    const params = new URLSearchParams(existing);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== "") params.set(key, String(value));
    }
    params.set("page", String(page));
    return `${path}?${params.toString()}`;
}

export function Pagination({ meta, basePath, query }: { meta: PaginationMeta; basePath: string; query?: Record<string, string | number | undefined> }) {
  if (meta.totalPages <= 1) return null;
  const pageHref = (page: number) => buildPaginationHref(basePath, page, query);
  return (
    <nav className="mt-8 flex items-center justify-between gap-3 text-sm">
      <LinkButton href={pageHref(Math.max(1, meta.page - 1))} variant="secondary" className={!meta.hasPreviousPage ? "pointer-events-none opacity-50" : ""}>
        السابق
      </LinkButton>
      <span className="text-muted-foreground">
        صفحة {meta.page} من {meta.totalPages}
      </span>
      <LinkButton href={pageHref(meta.page + 1)} variant="secondary" className={!meta.hasNextPage ? "pointer-events-none opacity-50" : ""}>
        التالي
      </LinkButton>
    </nav>
  );
}
