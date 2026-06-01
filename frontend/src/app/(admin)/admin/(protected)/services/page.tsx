import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminServicesPage() {
  return (
    <AdminResourceManager
      config={{
        title: "إدارة الخدمات",
        endpoint: "admin/services",
        actions: [
          { label: "نشر", path: "publish", method: "PATCH" },
          { label: "إلغاء النشر", path: "unpublish", method: "PATCH" },
        ],
        starter: { name: "", slug: "", shortDescription: "", detailedDescription: "", deliverables: [], requirements: [], isPublished: true, isFeatured: false },
        fields: [
          { name: "name", label: "اسم الخدمة", required: true },
          { name: "slug", label: "الرابط الفريد (اتركه فارغاً للتوليد التلقائي)" },
          { name: "shortDescription", label: "وصف قصير للخدمة", type: "textarea", required: true, rows: 3 },
          { name: "detailedDescription", label: "وصف تفصيلي كامل", type: "textarea", rows: 6 },
          { name: "icon", label: "أيقونة الخدمة / صورة رمزية", type: "image" },
          { name: "startingPrice", label: "السعر المبدئي (اختياري)", type: "number" },
          { name: "currency", label: "العملة (مثال: USD, SAR)", placeholder: "USD" },
          { name: "price", label: "العرض التسعيري (نصي)", placeholder: "مثال: تبدأ من $100" },
          { name: "duration", label: "مدة التسليم المتوقعة", placeholder: "مثال: 5 أيام عمل" },
          { name: "deliverables", label: "مخرجات الخدمة (افصل بفواصل)", type: "array" },
          { name: "requirements", label: "متطلبات العميل للبدء (افصل بفواصل)", type: "array" },
          { name: "ctaText", label: "نص زر Call to Action", placeholder: "طلب الخدمة الآن" },
          { name: "ctaUrl", label: "رابط زر CTA", type: "url" },
          { name: "isFeatured", label: "تمييز الخدمة في الرئيسية", type: "checkbox" },
          { name: "isPublished", label: "منشورة ومتاحة للعرض", type: "checkbox" },
          { name: "seo.metaTitle", label: "SEO Title", placeholder: "عنوان الخدمة لمحركات البحث" },
          { name: "seo.metaDescription", label: "SEO Description", type: "textarea", rows: 3, placeholder: "وصف الخدمة لمحركات البحث" },
          { name: "seo.ogImage", label: "SEO OgImage", type: "image", placeholder: "صورة المشاركة للخدمة" },
        ],
      }}
    />
  );
}
