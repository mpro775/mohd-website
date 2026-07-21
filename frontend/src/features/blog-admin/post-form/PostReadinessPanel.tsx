"use client";

import type { ReadinessResult } from "@/lib/api/types";

export function PostReadinessPanel({ result, loading, onRefresh }: { result: ReadinessResult | null; loading: boolean; onRefresh: () => void }) {
  return <section className="premium-card p-4"><div className="flex items-center justify-between"><h2 className="font-bold">جاهزية النشر</h2><button type="button" onClick={onRefresh} disabled={loading} className="rounded-lg border border-border px-2 py-1 text-xs">{loading ? "جارٍ الفحص…" : "فحص"}</button></div>{result ? <div className="mt-3 space-y-2 text-xs"><p className={result.ready ? "text-emerald-500" : "text-danger"}>{result.ready ? "المقال جاهز للنشر" : `${result.blockers.length} مانع للنشر`}</p>{result.blockers.map((item) => <p key={item.code} className="rounded bg-danger/10 p-2 text-danger">{item.message}</p>)}{result.warnings.map((item) => <p key={item.code} className="rounded bg-amber-500/10 p-2 text-amber-500">{item.message}</p>)}</div> : <p className="mt-2 text-xs text-muted-foreground">شغّل الفحص قبل النشر أو الجدولة.</p>}</section>;
}
