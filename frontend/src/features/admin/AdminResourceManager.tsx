"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/common/State";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { ArrowDown, ArrowUp, Image as ImageIcon, RefreshCw } from "lucide-react";

type FieldType = "text" | "url" | "image" | "file" | "textarea" | "number" | "date" | "checkbox" | "select" | "multiselect" | "array";
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
  noId?: boolean; // Don't append /:id on update mutations (e.g. single profile resource)
  actions?: Array<{ label: string; path: string; method: "PATCH" | "POST"; body?: Record<string, unknown> }>;
  starter?: Record<string, unknown>;
  fields?: ResourceField[];
};

function getId(item: Record<string, unknown>, idField?: "id" | "_id") {
  return String(item[idField ?? "id"] ?? item._id ?? "");
}

// Support dot-notation nested extraction
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

// Support dot-notation nested injection
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split('.');
  const last = parts.pop()!;
  const target = parts.reduce<Record<string, unknown>>((acc, part) => {
    if (!acc[part] || typeof acc[part] !== 'object') {
      acc[part] = {};
    }
    return acc[part] as Record<string, unknown>;
  }, obj);
  target[last] = value;
}

function pickValue(item: Record<string, unknown>, field: ResourceField): FormValue {
  const value = getNestedValue(item, field.name);
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

function toPayload(fields: ResourceField[], form: FormState, isCreate = false) {
  const payload: Record<string, unknown> = {};
  fields.forEach((field) => {
    // Strip slug on create requests if left empty
    if (field.name === "slug" && isCreate && !form[field.name]) {
      return;
    }
    
    const value = form[field.name];
    let resolvedValue: unknown = value === "" ? undefined : value;
    
    if (field.type === "array") {
      resolvedValue = Array.isArray(value)
        ? value
        : String(value ?? "")
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean);
    } else if (field.type === "number") {
      resolvedValue = value === "" || value === undefined || isNaN(Number(value)) ? undefined : Number(value);
    } else if (field.type === "checkbox") {
      resolvedValue = Boolean(value);
    } else if (field.type === "multiselect") {
      resolvedValue = Array.isArray(value) ? value.filter(Boolean) : [];
    }
    
    setNestedValue(payload, field.name, resolvedValue);
  });
  return payload;
}

export function AdminResourceManager({ config }: { config: ResourceConfig }) {
  const router = useRouter();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [optionSets, setOptionSets] = useState<Record<string, SelectOption[]>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // MediaPicker States
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activePickerField, setActivePickerField] = useState<string | null>(null);
  const [pickerType, setPickerType] = useState<"image" | "document">("image");

  const fields = useMemo(() => config.fields ?? [], [config.fields]);
  const currentId = useMemo(() => (selected ? getId(selected, config.idField) : ""), [selected, config.idField]);
  const canEdit = config.allowEdit !== false && fields.length > 0;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin-proxy/${config.endpoint}`);
      if (response.status === 401) {
        toast.error("انتهت الجلسة، الرجاء تسجيل الدخول مجدداً");
        router.push("/admin/login");
        router.refresh();
        return;
      }
      if (response.status === 404 && config.noId) {
        setItems([]);
        setLoading(false);
        return;
      }
      if (!response.ok) {
        throw new Error(`خطأ في خادم الباك إند: ${response.status}`);
      }
      const payload = await response.json();
      const data = payload.data?.items ?? payload.data ?? [];
      setItems(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "تعذر جلب البيانات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.endpoint]);

  useEffect(() => {
    const optionFields = fields.filter((field) => field.optionsEndpoint);
    if (!optionFields.length) return;
    optionFields.forEach((field) => {
      fetch(`/api/admin-proxy/${field.optionsEndpoint}`)
        .then((response) => {
          if (response.status === 401) {
            router.push("/admin/login");
            return null;
          }
          return response.json();
        })
        .then((payload) => {
          if (!payload) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const isCreate = !currentId;
    const body = toPayload(fields, form, isCreate);
    const isUpdate = Boolean(currentId);
    
    // For single item configuration (like profile) we don't append ID
    const endpoint = (isUpdate && !config.noId) ? `${config.endpoint}/${currentId}` : config.endpoint;
    
    const useMethod = config.noId ? "PUT" : (isUpdate ? "PUT" : "POST");
    
    try {
      const response = await fetch(`/api/admin-proxy/${endpoint}`, {
        method: useMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (response.status === 401) {
        toast.error("انتهت الجلسة، الرجاء تسجيل الدخول مجدداً");
        router.push("/admin/login");
        return;
      }
      
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) {
        const errors = Array.isArray(payload.errors) ? payload.errors : [];
        setFieldErrors(Object.fromEntries(errors.map((error: { field?: string; message?: string }) => [error.field ?? "_form", error.message ?? payload.message])));
        toast.error(response.status === 409 ? "هذا الرابط أو الاسم مستخدم مسبقا." : payload.message ?? "تعذر الحفظ");
        return;
      }
      
      toast.success("تم الحفظ بنجاح");
      setSelected(null);
      setIsFormOpen(false);
      await load();
    } catch {
      toast.error("فشل الاتصال بالخادم لحفظ البيانات");
    }
  }

  async function remove(item: Record<string, unknown>) {
    const id = getId(item, config.idField);
    if (!id || !confirm("هل أنت متأكد من تأكيد الحذف نهائياً؟")) return;
    try {
      const response = await fetch(`/api/admin-proxy/${config.endpoint}/${id}`, { method: "DELETE" });
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) {
        throw new Error();
      }
      toast.success("تم الحذف بنجاح");
      await load();
    } catch {
      toast.error("تعذر إتمام عملية الحذف.");
    }
  }

  async function action(item: Record<string, unknown>, path: string, method: "PATCH" | "POST", body?: Record<string, unknown>) {
    const id = getId(item, config.idField);
    try {
      const response = await fetch(`/api/admin-proxy/${config.endpoint}/${id}/${path}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) {
        throw new Error();
      }
      toast.success("تم تنفيذ العملية بنجاح");
      await load();
    } catch {
      toast.error("تعذر تنفيذ العملية.");
    }
  }

  async function reorder(item: Record<string, unknown>, direction: "up" | "down") {
    const currentIndex = items.findIndex((x) => getId(x) === getId(item));
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === items.length - 1) return;
    
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentItem = items[currentIndex];
    const targetItem = items[targetIndex];
    
    // Swap order values if they exist, or just use numeric indexes
    const currentOrder = Number(currentItem.order ?? currentItem.sortOrder ?? currentIndex);
    const targetOrder = Number(targetItem.order ?? targetItem.sortOrder ?? targetIndex);

    // Send single PUT updates for both or utilize Custom FAQ reorder endpoint if it is faqs endpoint
    const reorderEndpoints = [
      "admin/faqs",
      "admin/projects",
      "admin/services",
      "admin/technologies",
      "admin/links"
    ];

    if (reorderEndpoints.includes(config.endpoint)) {
      const reorderItems = items.map((x, idx) => {
        let newOrder = idx;
        if (idx === currentIndex) newOrder = targetIndex;
        else if (idx === targetIndex) newOrder = currentIndex;
        return {
          id: getId(x),
          order: newOrder,
        };
      });

      try {
        const response = await fetch(`/api/admin-proxy/${config.endpoint}/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: reorderItems }),
        });
        if (response.ok) {
          toast.success("تم تحديث الترتيب");
          await load();
        } else {
          toast.error("فشل حفظ الترتيب الجديد");
        }
      } catch {
        toast.error("فشل حفظ الترتيب الجديد");
      }
    } else {
      // Generic reorder by saving the updated order field for both swapped items
      try {
        await Promise.all([
          fetch(`/api/admin-proxy/${config.endpoint}/${getId(currentItem)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: targetOrder }),
          }),
          fetch(`/api/admin-proxy/${config.endpoint}/${getId(targetItem)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: currentOrder }),
          })
        ]);
        toast.success("تم تحديث الترتيب");
        await load();
      } catch {
        toast.error("فشل حفظ الترتيب");
      }
    }
  }

  function setValue(name: string, value: FormValue) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function openMediaPicker(fieldName: string, type: "image" | "document") {
    setActivePickerField(fieldName);
    setPickerType(type);
    setPickerOpen(true);
  }

  function handleMediaSelect(url: string) {
    if (activePickerField) {
      setValue(activePickerField, url);
    }
    setPickerOpen(false);
    setActivePickerField(null);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{config.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">لوحة إدارة CMS ديناميكية مع معالجة DTO حقيقية ومصادقة آمنة.</p>
        </div>
        {config.allowCreate !== false && canEdit ? <Button onClick={() => edit()}>إضافة</Button> : null}
      </div>

      {loading ? <LoadingSkeleton /> : null}
      
      {error ? (
        <ErrorState title="فشل في جلب البيانات من الخادم" description={error}>
          <Button onClick={load} className="mt-4 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> إعادة المحاولة
          </Button>
        </ErrorState>
      ) : null}

      {!loading && !error && !items.length ? (
        config.noId ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center space-y-4">
            <p className="text-muted-foreground font-semibold">لم يتم العثور على {config.title} في النظام.</p>
            <Button onClick={() => edit()} className="px-6">إنشاء {config.title} الآن</Button>
          </div>
        ) : (
          <EmptyState />
        )
      ) : null}
      
      {!loading && !error && items.length ? (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="p-3 text-right">العنوان / الاسم</th>
                <th className="p-3 text-right">المسار / معرف المعلم</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">الترتيب</th>
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={getId(item, config.idField)} className="border-t border-border hover:bg-muted/10">
                  <td className="p-3 font-semibold">{String(item.title ?? item.name ?? item.question ?? item.fullName ?? item.originalName ?? item.email ?? "عنصر")}</td>
                  <td dir="ltr" className="p-3 text-left font-mono text-xs text-muted-foreground">{String(item.slug ?? getId(item, config.idField))}</td>
                  <td className="p-3 text-muted-foreground">
                    {item.status ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{String(item.status)}</span>
                    ) : item.isPublished !== undefined || item.isActive !== undefined ? (
                      <span className={`inline-block h-2 w-2 rounded-full ${item.isPublished ?? item.isActive ? "bg-green-500" : "bg-red-500"}`} />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button disabled={idx === 0} onClick={() => reorder(item, "up")} className="p-1 hover:text-primary disabled:opacity-30">
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button disabled={idx === items.length - 1} onClick={() => reorder(item, "down")} className="p-1 hover:text-primary disabled:opacity-30">
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="space-x-2 space-x-reverse p-3">
                    {canEdit ? <button onClick={() => edit(item)} className="text-primary hover:underline">تعديل</button> : null}
                    {config.actions?.map((entry) => (
                      <button key={entry.path} onClick={() => action(item, entry.path, entry.method, entry.body)} className="text-muted-foreground hover:text-foreground">{entry.label}</button>
                    ))}
                    {config.allowDelete !== false ? <button onClick={() => remove(item)} className="text-red-400 hover:text-red-500 hover:underline">حذف</button> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {isFormOpen ? (
        <div className="rounded-lg border border-border bg-card p-6 shadow-md space-y-6">
          <h2 className="text-xl font-bold border-b border-border pb-3">{currentId ? "تعديل" : "إنشاء جديد"} {config.title}</h2>
          {fieldErrors._form ? <p className="p-3 rounded bg-red-500/10 text-red-400 text-sm font-semibold">{fieldErrors._form}</p> : null}
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map((field) => {
              const value = form[field.name];
              const error = fieldErrors[field.name];
              const shared = "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition";
              
              const isMediaField = field.type === "image" || field.type === "file";
              
              return (
                <div key={field.name} className={field.type === "textarea" ? "md:col-span-2 space-y-1.5" : "space-y-1.5"}>
                  <span className="block text-sm font-medium text-muted-foreground">{field.label}{field.required ? " *" : ""}</span>
                  
                  {field.type === "textarea" ? (
                    <textarea value={String(value ?? "")} onChange={(event) => setValue(field.name, event.target.value)} rows={field.rows ?? 5} className={shared} placeholder={field.placeholder} />
                  ) : field.type === "checkbox" ? (
                    <div className="flex h-11 items-center">
                      <input type="checkbox" checked={Boolean(value)} onChange={(event) => setValue(field.name, event.target.checked)} className="h-5 w-5 accent-primary rounded border-border" />
                    </div>
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
                    <input value={Array.isArray(value) ? value.join(", ") : String(value ?? "")} onChange={(event) => setValue(field.name, event.target.value)} className={shared} placeholder={field.placeholder ?? "افصل القيم بفواصل (مثال: react, nodejs)"} />
                  ) : isMediaField ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input type="text" value={String(value ?? "")} onChange={(event) => setValue(field.name, event.target.value)} className={shared} placeholder={field.placeholder ?? "أدخل الرابط أو اختر من المكتبة"} />
                        <Button type="button" variant="secondary" onClick={() => openMediaPicker(field.name, field.type as "image" | "document")} className="flex items-center gap-1.5 h-11 px-4 text-xs shrink-0">
                          <ImageIcon className="h-4 w-4" /> اختيار ملف
                        </Button>
                      </div>
                      {value && field.type === "image" && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={String(value)} alt="معاينة" className="h-20 max-w-full rounded border border-border object-contain bg-muted/20" />
                      )}
                    </div>
                  ) : (
                    <input type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "url" ? "url" : "text"} value={String(value ?? "")} onChange={(event) => setValue(field.name, field.type === "number" ? event.target.valueAsNumber : event.target.value)} className={shared} placeholder={field.placeholder} />
                  )}
                  {error ? <span className="block text-xs text-red-400 font-semibold">{error}</span> : null}
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex gap-2 border-t border-border pt-4">
            <Button onClick={save} className="px-6">حفظ التغييرات</Button>
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>إلغاء</Button>
          </div>
        </div>
      ) : null}

      {/* Media Picker Dialog */}
      <MediaPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleMediaSelect}
        allowedType={pickerType}
        defaultFolder={(() => {
          const endpoint = config.endpoint.toLowerCase();
          if (endpoint.includes("profile")) return "profile";
          if (endpoint.includes("projects")) return "projects";
          if (endpoint.includes("blog/posts") || endpoint.includes("blog")) return "blog";
          if (endpoint.includes("services")) return "services";
          if (endpoint.includes("technologies")) return "technologies";
          if (endpoint.includes("links")) return "links";
          return "misc";
        })()}
      />
    </section>
  );
}
