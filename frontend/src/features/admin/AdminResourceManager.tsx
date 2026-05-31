"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { EmptyState, LoadingSkeleton } from "@/components/common/State";

type FieldType = "text" | "url" | "textarea" | "number" | "date" | "checkbox" | "select" | "multiselect" | "array";
type FormValue = string | number | boolean | string[] | undefined;
type FormState = Record<string, FormValue>;
type SelectOption = { label: string; value: string };

export type ResourceField = {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  optionsEndpoint?: string;
  rows?: number;
};

type ResourceConfig = {
  title: string;
  endpoint: string;
  idField?: "id" | "_id";
  allowCreate?: boolean;
  allowDelete?: boolean;
  allowEdit?: boolean;
  actions?: Array<{ label: string; path: string; method: "PATCH" | "POST"; body?: Record<string, unknown> }>;
  starter?: Record<string, unknown>;
  fields?: ResourceField[];
};

function getId(item: Record<string, unknown>, idField?: "id" | "_id") {
  return String(item[idField ?? "id"] ?? item._id ?? "");
}

function pickValue(item: Record<string, unknown>, field: ResourceField): FormValue {
  const value = item[field.name];
  if (field.type === "checkbox") return Boolean(value);
  if (field.type === "array") return Array.isArray(value) ? value.map(String) : value ? [String(value)] : [];
  if (field.type === "multiselect") {
    if (!Array.isArray(value)) return [];
    return value.map((entry) => {
      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        return String(record.id ?? record._id ?? record.value ?? "");
      }
      return String(entry);
    }).filter(Boolean);
  }
  if (field.type === "select" && value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return String(record.id ?? record._id ?? record.value ?? "");
  }
  if (field.type === "date" && typeof value === "string") return value.slice(0, 10);
  if (typeof value === "number" || typeof value === "boolean") return value;
  return typeof value === "string" ? value : "";
}

function toPayload(fields: ResourceField[], form: FormState) {
  return fields.reduce<Record<string, unknown>>((payload, field) => {
    const value = form[field.name];
    if (field.type === "array") {
      payload[field.name] = Array.isArray(value)
        ? value
        : String(value ?? "")
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean);
      return payload;
    }
    if (field.type === "number") {
      payload[field.name] = value === "" || value === undefined ? undefined : Number(value);
      return payload;
    }
    if (field.type === "checkbox") {
      payload[field.name] = Boolean(value);
      return payload;
    }
    if (field.type === "multiselect") {
      payload[field.name] = Array.isArray(value) ? value.filter(Boolean) : [];
      return payload;
    }
    payload[field.name] = value === "" ? undefined : value;
    return payload;
  }, {});
}

export function AdminResourceManager({ config }: { config: ResourceConfig }) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [optionSets, setOptionSets] = useState<Record<string, SelectOption[]>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fields = useMemo(() => config.fields ?? [], [config.fields]);
  const currentId = useMemo(() => (selected ? getId(selected, config.idField) : ""), [selected, config.idField]);
  const canEdit = config.allowEdit !== false && fields.length > 0;

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

  useEffect(() => {
    const optionFields = fields.filter((field) => field.optionsEndpoint);
    if (!optionFields.length) return;
    optionFields.forEach((field) => {
      fetch(`/api/admin-proxy/${field.optionsEndpoint}`)
        .then((response) => response.json())
        .then((payload) => {
          const data = payload.data?.items ?? payload.data ?? [];
          const options = Array.isArray(data)
            ? data.map((entry: Record<string, unknown>) => ({
                label: String(entry.name ?? entry.title ?? entry.slug ?? entry.id ?? entry._id),
                value: String(entry.id ?? entry._id ?? ""),
              })).filter((entry: SelectOption) => entry.value)
            : [];
          setOptionSets((current) => ({ ...current, [field.name]: options }));
        })
        .catch(() => toast.error(`تعذر تحميل خيارات ${field.label}`));
    });
  }, [fields]);

  function edit(item?: Record<string, unknown>) {
    const source = item ?? config.starter ?? {};
    setSelected(item ?? null);
    setForm(Object.fromEntries(fields.map((field) => [field.name, pickValue(source, field)])));
    setFieldErrors({});
    setIsFormOpen(true);
  }

  async function save() {
    setFieldErrors({});
    const body = toPayload(fields, form);
    const isUpdate = Boolean(currentId);
    const endpoint = isUpdate ? `${config.endpoint}/${currentId}` : config.endpoint;
    const response = await fetch(`/api/admin-proxy/${endpoint}`, {
      method: isUpdate ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      const errors = Array.isArray(payload.errors) ? payload.errors : [];
      setFieldErrors(Object.fromEntries(errors.map((error: { field?: string; message?: string }) => [error.field ?? "_form", error.message ?? payload.message])));
      toast.error(response.status === 409 ? "هذا الرابط أو الاسم مستخدم مسبقا." : payload.message ?? "تعذر الحفظ");
      return;
    }
    toast.success("تم الحفظ");
    setSelected(null);
    setIsFormOpen(false);
    await load();
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

  async function action(item: Record<string, unknown>, path: string, method: "PATCH" | "POST", body?: Record<string, unknown>) {
    const id = getId(item, config.idField);
    const response = await fetch(`/api/admin-proxy/${config.endpoint}/${id}/${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      toast.error("تعذر تنفيذ العملية");
      return;
    }
    toast.success("تم تنفيذ العملية");
    await load();
  }

  function setValue(name: string, value: FormValue) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{config.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">إدارة مرتبطة بالباك إند عبر HttpOnly cookies وحقول DTO مباشرة.</p>
        </div>
        {config.allowCreate !== false && canEdit ? <Button onClick={() => edit()}>إضافة</Button> : null}
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
                  <td className="p-3">{String(item.title ?? item.name ?? item.question ?? item.fullName ?? item.originalName ?? item.email ?? "عنصر")}</td>
                  <td dir="ltr" className="p-3 text-left font-mono text-xs text-muted-foreground">{String(item.slug ?? getId(item, config.idField))}</td>
                  <td className="p-3 text-muted-foreground">{String(item.status ?? item.isPublished ?? item.isActive ?? item.isUsed ?? "")}</td>
                  <td className="space-x-2 space-x-reverse p-3">
                    {canEdit ? <button onClick={() => edit(item)} className="text-primary">تعديل</button> : null}
                    {config.actions?.map((entry) => (
                      <button key={entry.path} onClick={() => action(item, entry.path, entry.method, entry.body)} className="text-muted-foreground">{entry.label}</button>
                    ))}
                    {config.allowDelete !== false ? <button onClick={() => remove(item)} className="text-red-300">حذف</button> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {isFormOpen ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-4 font-semibold">{currentId ? "تعديل" : "إنشاء"} {config.title}</h2>
          {fieldErrors._form ? <p className="mb-3 text-sm text-red-300">{fieldErrors._form}</p> : null}
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => {
              const value = form[field.name];
              const error = fieldErrors[field.name];
              const shared = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
              return (
                <label key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                  <span className="mb-1 block text-sm text-muted-foreground">{field.label}{field.required ? " *" : ""}</span>
                  {field.type === "textarea" ? (
                    <textarea value={String(value ?? "")} onChange={(event) => setValue(field.name, event.target.value)} rows={field.rows ?? 5} className={shared} placeholder={field.placeholder} />
                  ) : field.type === "checkbox" ? (
                    <input type="checkbox" checked={Boolean(value)} onChange={(event) => setValue(field.name, event.target.checked)} className="h-5 w-5 accent-primary" />
                  ) : field.type === "select" ? (
                    <select value={String(value ?? "")} onChange={(event) => setValue(field.name, event.target.value)} className={shared}>
                      <option value="">اختر</option>
                      {(field.options ?? optionSets[field.name] ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  ) : field.type === "multiselect" ? (
                    <select multiple value={Array.isArray(value) ? value : []} onChange={(event) => setValue(field.name, Array.from(event.target.selectedOptions).map((option) => option.value))} className={`${shared} min-h-32`}>
                      {(field.options ?? optionSets[field.name] ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  ) : field.type === "array" ? (
                    <input value={Array.isArray(value) ? value.join(", ") : String(value ?? "")} onChange={(event) => setValue(field.name, event.target.value)} className={shared} placeholder={field.placeholder ?? "افصل القيم بفواصل"} />
                  ) : (
                    <input type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "url" ? "url" : "text"} value={String(value ?? "")} onChange={(event) => setValue(field.name, field.type === "number" ? event.target.valueAsNumber : event.target.value)} className={shared} placeholder={field.placeholder} />
                  )}
                  {error ? <span className="mt-1 block text-xs text-red-300">{error}</span> : null}
                </label>
              );
            })}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={save}>حفظ</Button>
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>إلغاء</Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
