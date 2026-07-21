import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink, FileText } from "lucide-react";
import { Container } from "@/components/common/Container";
import { JsonLd } from "@/components/common/JsonLd";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { PageHeader } from "@/components/common/PageHeader";
import { CertificationValidityBadge } from "@/features/certifications/components/CertificationValidityBadge";
import { publicApi } from "@/lib/api/public";
import { formatSafeDate } from "@/lib/date-input";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, certificationJsonLd } from "@/lib/seo/structured-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params; const item = await publicApi.certification(slug).catch(() => null);
  if (!item) return buildMetadata("الشهادة غير موجودة", undefined, undefined, true, `/certifications/${slug}`);
  return buildMetadata(item.title, item.description ?? `${item.title} من ${item.issuer}`, { ...item.seo, ogImage: item.seo?.ogImage ?? item.image ?? item.issuerLogo }, false, `/certifications/${item.slug}`);
}

export default async function CertificationDetailsPage({ params }: Props) {
  const { slug } = await params; const item = await publicApi.certification(slug).catch(() => null); if (!item) notFound();
  const breadcrumbs = [{ name: "الرئيسية", item: "/" }, { name: "الشهادات", item: "/certifications" }, { name: item.title, item: `/certifications/${item.slug}` }];
  return <><JsonLd data={certificationJsonLd(item)} /><JsonLd data={breadcrumbJsonLd(breadcrumbs)} /><PageHeader title={item.title} description={`${item.issuer}${item.platform ? ` عبر ${item.platform}` : ""}`} eyebrow="Certification" routeLabel={`~/certifications/${item.slug}`} />
    <Container className="py-12"><nav aria-label="مسار التنقل" className="mb-6 flex flex-wrap gap-2 text-xs text-muted-foreground"><Link href="/">الرئيسية</Link><span>/</span><Link href="/certifications">الشهادات</Link><span>/</span><span>{item.title}</span></nav>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"><article className="space-y-7"><div className="premium-card p-6"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{item.type}</span><CertificationValidityBadge status={item.validityStatus} /></div><dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">الجهة المانحة</dt><dd className="mt-1 font-bold">{item.issuer}</dd></div>{item.platform ? <div><dt className="text-muted-foreground">المنصة</dt><dd className="mt-1 font-bold">{item.platform}</dd></div> : null}<div><dt className="text-muted-foreground">تاريخ الإصدار</dt><dd className="mt-1 font-bold">{formatSafeDate(item.issuedAt)}</dd></div><div><dt className="text-muted-foreground">تاريخ الانتهاء</dt><dd className="mt-1 font-bold">{item.doesNotExpire ? "لا تنتهي" : formatSafeDate(item.expiresAt)}</dd></div>{item.credentialId ? <div className="sm:col-span-2"><dt className="text-muted-foreground">Credential ID</dt><dd dir="ltr" className="mt-1 break-all font-mono font-bold">{item.credentialId}</dd></div> : null}</dl></div>
        {item.description ? <div className="premium-card p-6"><h2 className="mb-4 text-xl font-bold">عن الشهادة</h2><MarkdownRenderer content={item.description} /></div> : null}
        {item.skills?.length ? <div className="premium-card p-6"><h2 className="mb-4 text-xl font-bold">المهارات</h2><div className="flex flex-wrap gap-2">{item.skills.map((skill) => <span key={skill.toLocaleLowerCase()} className="rounded-full border border-border px-3 py-1.5 text-xs">{skill}</span>)}</div></div> : null}
      </article><aside className="space-y-4">{item.image ? <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted/20"><Image src={item.image} alt={`صورة ${item.title}`} fill sizes="360px" className="object-contain p-4" /></div> : null}<div className="premium-card flex flex-col gap-2 p-5">{item.credentialUrl ? <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground">التحقق من الشهادة<ExternalLink className="h-4 w-4" /><span className="sr-only">يفتح نافذة جديدة</span></a> : null}{item.document ? <a href={item.document} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-bold"><FileText className="h-4 w-4" />فتح ملف PDF<span className="sr-only">يفتح نافذة جديدة</span></a> : null}{item.platformUrl ? <a href={item.platformUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-bold">زيارة المنصة<ExternalLink className="h-4 w-4" /><span className="sr-only">يفتح نافذة جديدة</span></a> : null}<Link href="/certifications" className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-primary"><ArrowRight className="h-4 w-4" />العودة إلى الشهادات</Link></div></aside></div>
    </Container></>;
}
