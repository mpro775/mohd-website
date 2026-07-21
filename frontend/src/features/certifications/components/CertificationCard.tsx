"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ExternalLink, Star } from "lucide-react";
import { useState } from "react";
import type { Certification } from "@/lib/api/types";
import { formatSafeDate } from "@/lib/date-input";
import { CertificationValidityBadge } from "./CertificationValidityBadge";

const typeLabels: Record<string, string> = { course: "دورة تدريبية", specialization: "تخصص", "professional-certificate": "شهادة مهنية", "professional-certification": "اعتماد مهني", license: "رخصة مهنية", bootcamp: "معسكر تدريبي", workshop: "ورشة عمل", attendance: "شهادة حضور", diploma: "دبلوم مهني", award: "جائزة", other: "أخرى" };

export function CertificationCard({ certification }: { certification: Certification }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = certification.image || certification.issuerLogo;
  return (
    <article className="premium-card flex h-full flex-col overflow-hidden">
      <div className="relative flex aspect-[16/10] items-center justify-center border-b border-border bg-muted/20 p-5">
        {image && !imageFailed ? <Image src={image} alt={`صورة شهادة ${certification.title}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain p-5" onError={() => setImageFailed(true)} /> : <BadgeCheck className="h-12 w-12 text-primary/50" aria-hidden="true" />}
        {certification.isFeatured ? <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-500"><Star className="h-3 w-3 fill-current" />مميزة</span> : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-[11px]"><span className="rounded-full bg-primary/10 px-2.5 py-1 font-bold text-primary">{typeLabels[certification.type] ?? certification.type}</span><CertificationValidityBadge status={certification.validityStatus} /></div>
        <h2 className="mt-4 text-lg font-bold leading-7 text-foreground">{certification.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{certification.issuer}{certification.platform ? ` • ${certification.platform}` : ""}</p>
        <p className="mt-2 text-xs text-muted-foreground">تاريخ الإصدار: {formatSafeDate(certification.issuedAt)}</p>
        {certification.skills?.length ? <div className="mt-4 flex flex-wrap gap-1.5">{certification.skills.slice(0, 3).map((skill) => <span key={skill.toLocaleLowerCase()} className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">{skill}</span>)}</div> : null}
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <Link href={`/certifications/${certification.slug}`} className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-xs font-bold text-primary-foreground">عرض التفاصيل</Link>
          {certification.credentialUrl ? <a href={certification.credentialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-bold text-foreground">التحقق<ExternalLink className="h-3.5 w-3.5" /><span className="sr-only">يفتح نافذة جديدة</span></a> : null}
        </div>
      </div>
    </article>
  );
}
