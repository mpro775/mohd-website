"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Star, ShieldCheck, ArrowUpLeft } from "lucide-react";
import { useState } from "react";
import type { Certification } from "@/lib/api/types";
import { CertificationValidityBadge } from "./CertificationValidityBadge";

const typeLabels: Record<string, string> = { course: "دورة تدريبية", specialization: "تخصص", "professional-certificate": "شهادة مهنية", "professional-certification": "اعتماد مهني", license: "رخصة مهنية", bootcamp: "معسكر تدريبي", workshop: "ورشة عمل", attendance: "شهادة حضور", diploma: "دبلوم مهني", award: "جائزة", other: "أخرى" };

export function HomeCertificateCard({ certification }: { certification: Certification }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = certification.image || certification.issuerLogo;
  const visibleSkills = certification.skills?.slice(0, 2) || [];
  const extraSkillsCount = (certification.skills?.length || 0) - visibleSkills.length;
  const dateStr = certification.issuedAt ? new Date(certification.issuedAt).getFullYear().toString() : "";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      {/* Image / Preview Area */}
      <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden border-b border-border bg-gradient-to-b from-muted/30 to-muted/10 p-5">
        {image && !imageFailed ? (
          <Image 
            src={image} 
            alt={`صورة شهادة ${certification.title}`} 
            fill 
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.02]" 
            onError={() => setImageFailed(true)} 
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-primary/30">
            <BadgeCheck className="mb-2 h-10 w-10" aria-hidden="true" />
            <span className="font-mono text-xs font-medium uppercase tracking-wider">{certification.issuer}</span>
          </div>
        )}
        
        {certification.isFeatured ? (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/80 px-2.5 py-1 text-[10px] font-bold text-amber-500 backdrop-blur-md">
            <Star className="h-3 w-3 fill-amber-500" />
            مميزة
          </span>
        ) : null}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-5">
        {/* Issuer & Date */}
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-1.5 font-medium">
            <span className="text-foreground">{certification.issuer}</span>
            {certification.platform ? (
              <>
                <span className="opacity-50">•</span>
                <span>{certification.platform}</span>
              </>
            ) : null}
          </div>
          {dateStr && <span className="font-mono text-[10px] opacity-70" dir="ltr">{dateStr}</span>}
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          <Link href={`/certifications/${certification.slug}`} className="before:absolute before:inset-0">
            {certification.title}
          </Link>
        </h3>

        {/* Metadata: Type & Validity */}
        <div className="mt-3 flex items-center gap-3 text-[11px]">
          <span className="font-medium text-muted-foreground">
            {typeLabels[certification.type] ?? certification.type}
          </span>
          <span className="opacity-40">•</span>
          <CertificationValidityBadge status={certification.validityStatus} />
        </div>

        {/* Skills */}
        {visibleSkills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5 relative z-10">
            {visibleSkills.map((skill) => (
              <span key={skill.toLocaleLowerCase()} className="rounded-md bg-muted/50 px-2 py-1 text-[10px] text-muted-foreground">
                {skill}
              </span>
            ))}
            {extraSkillsCount > 0 ? (
              <span className="rounded-md bg-muted/50 px-2 py-1 font-mono text-[10px] text-muted-foreground" dir="ltr">
                +{extraSkillsCount}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between border-t border-border/50 pt-4 text-xs font-semibold">
            {certification.credentialUrl ? (
              <a href={certification.credentialUrl} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex items-center gap-1.5 text-emerald-500 hover:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>موثقة</span>
                <span className="sr-only">يفتح نافذة جديدة</span>
              </a>
            ) : (
              <span />
            )}
            <span className="relative z-10 inline-flex items-center gap-1 text-muted-foreground transition-colors group-hover:text-primary">
              التفاصيل
              <ArrowUpLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
