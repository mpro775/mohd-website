import { LinkButton } from "./Button";
import type { PaginationMeta } from "@/lib/api/types";

export function Pagination({ meta, basePath }: { meta: PaginationMeta; basePath: string }) {
  if (meta.totalPages <= 1) return null;
  const pageHref = (page: number) => `${basePath}${basePath.includes("?") ? "&" : "?"}page=${page}`;
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
