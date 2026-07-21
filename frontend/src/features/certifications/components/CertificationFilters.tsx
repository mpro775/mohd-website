import Link from "next/link";

type Values = { search?: string; type?: string; platform?: string; issuer?: string; year?: string };

export function CertificationFilters({ values }: { values: Values }) {
  return <form method="get" action="/certifications" className="premium-card mb-8 grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-6" aria-label="تصفية الشهادات">
    <label className="lg:col-span-2"><span className="mb-1 block text-xs font-bold">البحث</span><input name="search" defaultValue={values.search} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm" placeholder="العنوان أو الجهة أو المهارة" /></label>
    <label><span className="mb-1 block text-xs font-bold">النوع</span><select name="type" defaultValue={values.type ?? ""} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm"><option value="">الكل</option><option value="course">دورة</option><option value="specialization">تخصص</option><option value="professional-certificate">شهادة مهنية</option><option value="professional-certification">اعتماد مهني</option><option value="license">رخصة</option><option value="bootcamp">معسكر</option><option value="workshop">ورشة</option><option value="attendance">حضور</option><option value="diploma">دبلوم</option><option value="award">جائزة</option><option value="other">أخرى</option></select></label>
    <label><span className="mb-1 block text-xs font-bold">المنصة</span><input name="platform" defaultValue={values.platform} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm" /></label>
    <label><span className="mb-1 block text-xs font-bold">الجهة</span><input name="issuer" defaultValue={values.issuer} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm" /></label>
    <label><span className="mb-1 block text-xs font-bold">سنة الإصدار</span><input name="year" defaultValue={values.year} type="number" min="1900" max="2200" dir="ltr" className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm" /></label>
    <div className="flex gap-2 md:col-span-2 lg:col-span-6"><button type="submit" className="h-10 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground">تطبيق الفلاتر</button><Link href="/certifications" className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm font-bold">مسح</Link></div>
  </form>;
}
