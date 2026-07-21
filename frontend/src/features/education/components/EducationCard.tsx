"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Star } from "lucide-react";
import { useState } from "react";
import type { Education } from "@/lib/api/types";
import { toDateInputValue } from "@/lib/date-input";

const year = (value?: string) => toDateInputValue(value).slice(0, 4) || "غير محدد";

export function EducationCard({ education }: { education: Education }) {
  const [failed, setFailed] = useState(false);
  return <article className="premium-card grid gap-5 p-5 sm:grid-cols-[72px_1fr]">
    <div className="relative flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/20">{education.institutionLogo && !failed ? <Image src={education.institutionLogo} alt={`شعار ${education.institution}`} fill sizes="72px" className="object-contain p-2" onError={() => setFailed(true)} /> : <GraduationCap className="h-7 w-7 text-primary" />}</div>
    <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold">{education.degree}</h2>{education.isFeatured ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-500"><Star className="h-3 w-3 fill-current" />مميز</span> : null}</div><p className="mt-1 text-sm font-semibold text-primary">{education.institution}</p>{education.fieldOfStudy ? <p className="mt-1 text-sm text-muted-foreground">{education.fieldOfStudy}</p> : null}<p dir="ltr" className="mt-3 text-xs text-muted-foreground">{year(education.startDate)} — {education.isCurrent ? "حتى الآن" : year(education.endDate)}</p>{education.location ? <p className="mt-2 text-xs text-muted-foreground">{education.location}</p> : null}<Link href={`/education/${education.slug}`} className="mt-4 inline-flex text-xs font-bold text-primary hover:underline">عرض التفاصيل</Link></div>
  </article>;
}
