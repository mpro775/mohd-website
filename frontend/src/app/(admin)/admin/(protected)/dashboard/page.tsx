"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoadingSkeleton, ErrorState } from "@/components/common/State";
import { Button } from "@/components/common/Button";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [dashboard, setDashboard] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      // Both dashboard info and stats fetched from proxy
      const [dbRes, statsRes] = await Promise.all([
        fetch("/api/admin-proxy/admin/dashboard"),
        fetch("/api/admin-proxy/admin/dashboard/stats")
      ]);

      if (dbRes.status === 401 || statsRes.status === 401) {
        toast.error("انتهت الجلسة، الرجاء تسجيل الدخول مجدداً");
        router.push("/admin/login");
        return;
      }

      if (!dbRes.ok || !statsRes.ok) {
        throw new Error("فشل خادم الباك إند في الاستجابة");
      }

      const dbPayload = await dbRes.json();
      const statsPayload = await statsRes.json();

      setDashboard(dbPayload.data ?? dbPayload ?? {});
      setStats(statsPayload.data ?? statsPayload ?? {});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "تعذر تحميل إحصائيات لوحة التحكم");
      toast.error("تعذر جلب البيانات الخاصة بالوحة التحكم");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entries = Object.entries(stats ?? {})
    .filter(([, value]) => typeof value !== "object")
    .slice(0, 8);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-muted-foreground">نظرة سريعة على المحتوى والنشاط.</p>
        </div>
        <Button onClick={loadData} disabled={loading} variant="secondary" className="flex items-center gap-2 text-xs">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> تحديث البيانات
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton className="min-h-[250px]" />
      ) : error ? (
        <ErrorState title="فشل تحميل البيانات" description={error}>
          <Button onClick={loadData} className="mt-4 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> إعادة المحاولة
          </Button>
        </ErrorState>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {entries.map(([key, value]) => (
              <div key={key} className="rounded-lg border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm">
                <p className="text-sm text-muted-foreground font-semibold">{key}</p>
                <p className="mt-2 text-3xl font-bold text-primary">{String(value)}</p>
              </div>
            ))}
          </div>

          {!entries.length && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-bold text-sm mb-3">تفاصيل اللوحة</h3>
              <pre dir="ltr" className="overflow-auto rounded bg-muted/40 p-4 text-xs max-h-[300px] text-muted-foreground">
                {JSON.stringify(dashboard, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </section>
  );
}
