import { adminGet } from "@/lib/api/admin";

export default async function DashboardPage() {
  const dashboard = await adminGet<Record<string, unknown>>("/admin/dashboard").catch(() => ({}));
  const stats = await adminGet<Record<string, unknown>>("/admin/dashboard/stats").catch(() => dashboard);
  const entries = Object.entries(stats ?? {}).filter(([, value]) => typeof value !== "object").slice(0, 8);
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-muted-foreground">نظرة سريعة على المحتوى والنشاط.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {entries.map(([key, value]) => (
          <div key={key} className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{key}</p>
            <p className="mt-2 text-3xl font-bold">{String(value)}</p>
          </div>
        ))}
      </div>
      {!entries.length ? <pre dir="ltr" className="overflow-auto rounded-lg border border-border bg-card p-4 text-sm">{JSON.stringify(dashboard, null, 2)}</pre> : null}
    </section>
  );
}
