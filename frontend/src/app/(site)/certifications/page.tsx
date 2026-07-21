import type { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { CertificationFilters } from "@/features/certifications/components/CertificationFilters";
import { CertificationGrid } from "@/features/certifications/components/CertificationGrid";
import { publicApi } from "@/lib/api/public";
import type { PaginationMeta } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "الشهادات المهنية",
  description: "الشهادات المهنية والدورات والاعتمادات التي توثق مساري في تطوير البرمجيات.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const value = (input: string | string[] | undefined) => Array.isArray(input) ? input[0] : input;
const emptyMeta: PaginationMeta = { total: 0, page: 1, limit: 12, totalPages: 0, hasNextPage: false, hasPreviousPage: false };

export default async function CertificationsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = { search: value(params.search), type: value(params.type), platform: value(params.platform), issuer: value(params.issuer), year: value(params.year) };
  const page = Math.max(1, Number(value(params.page) ?? 1) || 1);
  const result = await publicApi.certifications({ ...filters, page, limit: 12 }).catch(() => ({ items: [], meta: { ...emptyMeta, page } }));
  const query = new URLSearchParams();
  for (const [key, item] of Object.entries(filters)) if (item) query.set(key, item);
  const basePath = `/certifications${query.size ? `?${query}` : ""}`;

  return <><PageHeader title="الشهادات المهنية" description="دورات واعتمادات ورخص توثق التطور المهني والخبرات المكتسبة." eyebrow="Credentials" routeLabel="~/certifications" /><Container className="py-12"><CertificationFilters values={filters} /><CertificationGrid items={result.items} /><Pagination meta={result.meta} basePath={basePath} /></Container></>;
}
