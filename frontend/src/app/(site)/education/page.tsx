import type { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { EducationTimeline } from "@/features/education/components/EducationTimeline";
import { publicApi } from "@/lib/api/public";
import type { PaginationMeta } from "@/lib/api/types";

export const metadata: Metadata = { title: "المؤهلات الأكاديمية", description: "المسار الأكاديمي والمؤهلات والإنجازات التعليمية." };
const emptyMeta: PaginationMeta = { total: 0, page: 1, limit: 12, totalPages: 0, hasNextPage: false, hasPreviousPage: false };

export default async function EducationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams; const raw = Array.isArray(params.page) ? params.page[0] : params.page; const page = Math.max(1, Number(raw ?? 1) || 1);
  const result = await publicApi.education({ page, limit: 12 }).catch(() => ({ items: [], meta: { ...emptyMeta, page } }));
  return <><PageHeader title="المؤهلات الأكاديمية" description="المؤسسات والدرجات والتخصصات التي شكّلت الأساس الأكاديمي لمساري." eyebrow="Education" routeLabel="~/education" /><Container className="py-12"><EducationTimeline items={result.items} /><Pagination meta={result.meta} basePath="/education" /></Container></>;
}
