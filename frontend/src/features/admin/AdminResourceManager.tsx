"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { EmptyState, LoadingSkeleton } from "@/components/common/State";

type ResourceConfig = {
  title: string;
  endpoint: string;
  idField?: "id" | "_id";
  allowCreate?: boolean;
  allowDelete?: boolean;
  actions?: Array<{ label: string; path: string; method: "PATCH" | "POST" }>;
  starter?: Record<string, unknown>;
};

function getId(item: Record<string, unknown>, idField?: "id" | "_id") {
  return String(item[idField ?? "id"] ?? item._id ?? "");
}

export function AdminResourceManager({ config }: { config: ResourceConfig }) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(true);

  const currentId = useMemo(() => (selected ? getId(selected, config.idField) : ""), [selected, config.idField]);

  async function load() {
    setLoading(true);
    const response = await fetch(`/api/admin-proxy/${config.endpoint}`);
    const payload = await response.json();
    const data = payload.data?.items ?? payload.data ?? [];
    setItems(Array.isArray(data) ? data : data ? [data] : []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => {
      toast.error("تعذر تحميل البيانات");
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.endpoint]);

  function edit(item?: Record<string, unknown>) {
    const value = item ?? config.starter ?? {};
    setSelected(item ?? null);
    setJson(JSON.stringify(value, null, 2));
  }

  async function save() {
    try {
      const body = JSON.parse(json);
      const isUpdate = Boolean(currentId);
      const endpoint = isUpdate ? `${config.endpoint}/${currentId}` : config.endpoint;
      const response = await fetch(`/api/admin-proxy/${endpoint}`, {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("save failed");
      toast.success("تم الحفظ");
      setSelected(null);
      setJson("");
      await load();
    } catch {
      toast.error("تحقق من JSON أو بيانات الباك إند");
    }
  }

  async function remove(item: Record<string, unknown>) {
    const id = getId(item, config.idField);
    if (!id || !confirm("تأكيد الحذف؟")) return;
    const response = await fetch(`/api/admin-proxy/${config.endpoint}/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("تعذر الحذف");
      return;
    }
    toast.success("تم الحذف");
    await load();
  }

  async function action(item: Record<string, unknown>, path: string, method: "PATCH" | "POST") {
    const id = getId(item, config.idField);
    const response = await fetch(`/api/admin-proxy/${config.endpoint}/${id}/${path}`, { method });
    if (!response.ok) {
      toast.error("تعذر تنفيذ العملية");
      return;
    }
    toast.success("تم تنفيذ العملية");
    await load();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{config.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">إدارة مباشرة مرتبطة بالباك إند عبر HttpOnly cookies.</p>
        </div>
        {config.allowCreate !== false ? <Button onClick={() => edit()}>إضافة</Button> : null}
      </div>
      {loading ? <LoadingSkeleton /> : null}
      {!loading && !items.length ? <EmptyState /> : null}
      {items.length ? (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="p-3 text-right">العنوان</th>
                <th className="p-3 text-right">Slug/ID</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={getId(item, config.idField)} className="border-t border-border">
                  <td className="p-3">{String(item.title ?? item.name ?? item.question ?? item.fullName ?? item.originalName ?? "عنصر")}</td>
                  <td dir="ltr" className="p-3 text-left font-mono text-xs text-muted-foreground">{String(item.slug ?? getId(item, config.idField))}</td>
                  <td className="p-3 text-muted-foreground">{String(item.status ?? item.isPublished ?? item.isActive ?? item.isUsed ?? "")}</td>
                  <td className="space-x-2 space-x-reverse p-3">
                    <button onClick={() => edit(item)} className="text-primary">تعديل</button>
                    {config.actions?.map((entry) => (
                      <button key={entry.path} onClick={() => action(item, entry.path, entry.method)} className="text-muted-foreground">{entry.label}</button>
                    ))}
                    {config.allowDelete !== false ? <button onClick={() => remove(item)} className="text-red-300">حذف</button> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {json ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 font-semibold">{currentId ? "تعديل JSON" : "إنشاء JSON"}</h2>
          <textarea dir="ltr" value={json} onChange={(event) => setJson(event.target.value)} rows={16} className="w-full rounded-md border border-border bg-background p-3 font-mono text-sm outline-none focus:border-primary" />
          <div className="mt-3 flex gap-2">
            <Button onClick={save}>حفظ</Button>
            <Button variant="secondary" onClick={() => setJson("")}>إلغاء</Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
