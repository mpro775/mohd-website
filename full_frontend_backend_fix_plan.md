# خطة إصلاح شاملة لتوافق Frontend و Backend قبل النشر

> هذا الملف موجّه لوكيل ذكاء اصطناعي/مطور لتنفيذ جميع الإصلاحات كاملة بدون ترتيب أولويات. المطلوب تنفيذ كل البنود، ثم تشغيل الاختبارات والبناء، ثم التأكد أن لوحة التحكم والموقع العام يعملان بدون أخطاء API أو Validation أو Routing.

## نطاق العمل

المصادر الحالية:

- `backend/` — NestJS API.
- `frontend/` — Next.js Frontend + Admin Dashboard.

الهدف النهائي:

- جعل عقد API بين الفرونت والباك متطابقًا.
- إزالة تعارضات HTTP methods.
- إزالة الحقول التي يرفضها الباك أو دعمها رسميًا عند الحاجة.
- إصلاح عمليات لوحة التحكم: إنشاء، تعديل، حذف، نشر، إلغاء نشر، أرشفة، تفعيل، تعطيل، bulk actions.
- إصلاح pagination/search/filter في صفحات Admin لتتعامل مع السيرفر وليس البيانات المحلية فقط.
- إصلاح صفحات Contact Messages و Audit Logs و Dashboard لتطابق شكل بيانات الباك.
- إضافة ملفات env/docs الناقصة.
- إنهاء المشروع بجاهزية بناء ونشر.

---

## قواعد تنفيذ عامة

- لا تغيّر تصميم المشروع أو أسماء المجلدات إلا عند الضرورة.
- لا تعطل `forbidNonWhitelisted` في الباك كحل سريع. يجب أن يكون الـ payload صحيحًا.
- أي حقل يرسله الفرونت يجب أن يكون مقبولًا في DTO أو يتم حذفه/تنظيفه قبل الإرسال.
- أي endpoint يستخدمه الفرونت يجب أن يكون موجودًا في الباك بنفس المسار والطريقة والـ body المتوقع.
- أي تعديل في DTO يجب أن ينعكس في schema/types/form في الفرونت.
- أي تعديل في response shape في الباك يجب أن ينعكس في types/columns/components في الفرونت.
- لا تترك أزرارًا في الواجهة تستدعي endpoints غير موجودة.
- بعد كل إصلاح يجب تشغيل typecheck/lint/build للفرونت والباك.

---

# 1. توحيد Admin API Client في الفرونت

الملف المستهدف:

```txt
frontend/src/lib/api/admin-client.ts
```

## المطلوب

أضف دوال واضحة لكل HTTP method بدل استخدام `updateResource` لكل شيء:

```ts
patchResource: async <T>(resource: string, idOrPath: string, data?: unknown) => {
  const r = await clientApiRequest<T>(`/${resource}/${idOrPath}`, {
    method: "PATCH",
    body: data ?? {},
  });
  return r;
},
```

وأضف دالة عامة للمسارات المخصصة:

```ts
customRequest: async <T>(path: string, method: string, data?: unknown, query?: Query) => {
  const r = await clientApiRequest<T>(path, {
    method,
    body: data,
    query,
  });
  return r;
},
```

ثم تأكد من أن:

- `createResource` يستخدم `POST` فقط.
- `updateResource` يستخدم `PUT` فقط للتعديل الكامل/العادي عندما يكون الباك عنده `@Put(':id')`.
- `patchResource` يستخدم `PATCH` لكل publish/unpublish/archive/activate/deactivate/status/media metadata/reorder.
- `deleteResource` يستخدم `DELETE` فقط.

## معايير القبول

- لا يوجد أي استدعاء من نوع publish/unpublish/archive/activate/deactivate يستخدم `PUT`.
- لا يوجد أي route مركّب مثل `${id}/publish` يتم تمريره إلى `updateResource`.
- كل عمليات الحالة تستخدم `patchResource` أو `customRequest` مع `PATCH`.

---

# 2. إصلاح HTTP Method Mismatch في صفحات Admin

## الملفات المستهدفة

```txt
frontend/src/features/admin/resources/projects/page-client.tsx
frontend/src/features/admin/resources/posts/page-client.tsx
frontend/src/features/admin/resources/services/page-client.tsx
frontend/src/features/admin/resources/technologies/page-client.tsx
frontend/src/features/admin/resources/links/page-client.tsx
frontend/src/features/admin/resources/faqs/page-client.tsx
frontend/src/features/admin/resources/categories/page-client.tsx
frontend/src/features/admin/resources/tags/page-client.tsx
frontend/src/features/media/MediaAdmin.tsx
```

## استبدالات إلزامية

### Projects

الفرونت الحالي يستخدم `PUT` ضمنيًا عبر `updateResource` لمسارات action. يجب تغييره إلى:

```ts
adminClient.patchResource<Project>("projects", `${id}/${action}`)
```

المسارات الصحيحة في الباك:

```http
PATCH /api/admin/projects/:id/publish
PATCH /api/admin/projects/:id/unpublish
PATCH /api/admin/projects/:id/archive
```

### Blog Posts

```ts
adminClient.patchResource<Post>("blog/posts", `${id}/${action}`)
```

المسارات الصحيحة:

```http
PATCH /api/admin/blog/posts/:id/publish
PATCH /api/admin/blog/posts/:id/unpublish
PATCH /api/admin/blog/posts/:id/archive
PATCH /api/admin/blog/posts/:id/schedule
```

### Services

```ts
adminClient.patchResource<Service>("services", `${id}/${action}`)
```

المسارات الصحيحة:

```http
PATCH /api/admin/services/:id/publish
PATCH /api/admin/services/:id/unpublish
```

### Technologies

```ts
adminClient.patchResource<Technology>("technologies", `${id}/${action}`)
```

المسارات الصحيحة:

```http
PATCH /api/admin/technologies/:id/publish
PATCH /api/admin/technologies/:id/unpublish
```

### Links

```ts
adminClient.patchResource<LinkItem>("links", `${id}/${action}`)
```

المسارات الصحيحة:

```http
PATCH /api/admin/links/:id/publish
PATCH /api/admin/links/:id/unpublish
```

### FAQs

```ts
adminClient.patchResource<Faq>("faqs", `${id}/${action}`)
```

المسارات الصحيحة:

```http
PATCH /api/admin/faqs/:id/publish
PATCH /api/admin/faqs/:id/unpublish
PATCH /api/admin/faqs/:id
```

ملاحظة: الباك يدعم أيضًا:

```http
PUT /api/admin/faqs/:id
```

لكن عمليات publish/unpublish يجب أن تظل `PATCH`.

### Blog Categories

```ts
adminClient.patchResource<Category>("blog/categories", `${id}/${action}`)
```

المسارات الصحيحة:

```http
PATCH /api/admin/blog/categories/:id/activate
PATCH /api/admin/blog/categories/:id/deactivate
```

### Blog Tags

```ts
adminClient.patchResource<Tag>("blog/tags", `${id}/${action}`)
```

المسارات الصحيحة:

```http
PATCH /api/admin/blog/tags/:id/activate
PATCH /api/admin/blog/tags/:id/deactivate
```

### Media

تعديل media metadata يجب أن يستخدم:

```ts
adminClient.patchResource<MediaItem>("media", id, { alt, folder, usage })
```

المسار الصحيح:

```http
PATCH /api/admin/media/:id
```

## معايير القبول

- أزرار النشر وإلغاء النشر والأرشفة والتفعيل والتعطيل تعمل بدون 404/405.
- تعديل بيانات media يعمل بدون خطأ method.
- لا توجد رسائل `Cannot PUT` أو `Method Not Allowed` في المتصفح أو الباك.

---

# 3. تنظيف Payload قبل الإرسال بسبب forbidNonWhitelisted

الباك يستخدم ValidationPipe مع:

```ts
whitelist: true
forbidNonWhitelisted: true
```

لذلك يجب حذف أي حقل غير موجود في DTO قبل الإرسال، أو إضافته رسميًا للـ DTO والـ schema في الباك. المطلوب هنا اعتماد Contract واضح لكل مورد.

---

## 3.1 Blog Categories

الملفات:

```txt
frontend/src/features/admin/resources/categories/schema.ts
frontend/src/features/admin/resources/categories/form.tsx
frontend/src/features/admin/resources/categories/page-client.tsx
backend/src/modules/blog/categories/dto/create-category.dto.ts
backend/src/modules/blog/categories/dto/update-category.dto.ts
```

DTO الباك يقبل:

```ts
name
description
isActive
```

الفرونت يحتوي على:

```ts
name
slug
description
isActive
```

## المطلوب

اختر أحد المسارين ونفذه كاملًا:

### المسار المعتمد حاليًا: حذف slug من payload

- أبقِ عرض `slug` للقراءة فقط إن كان موجودًا في columns.
- لا ترسل `slug` عند create/update.
- في `page-client.tsx`:

```ts
const { slug, ...payload } = values;
```

ثم أرسل `payload` فقط.

### أو دعم slug يدويًا في الباك

لا تستخدم هذا الخيار إلا إذا كان مطلوبًا أن يتحكم الأدمن في slug. عندها أضف `slug?: string` إلى DTOs وتأكد من service لا يكسره.

## معايير القبول

- إنشاء/تعديل تصنيف لا يرجع 400 بسبب `property slug should not exist`.
- التصنيف يظهر في العام واللوحة بعد الحفظ.

---

## 3.2 Blog Tags

الملفات:

```txt
frontend/src/features/admin/resources/tags/schema.ts
frontend/src/features/admin/resources/tags/form.tsx
frontend/src/features/admin/resources/tags/page-client.tsx
backend/src/modules/blog/tags/dto/create-tag.dto.ts
backend/src/modules/blog/tags/dto/update-tag.dto.ts
backend/src/modules/blog/tags/schemas/tag.schema.ts
```

DTO الباك يقبل:

```ts
name
isActive
```

الفرونت يحتوي على:

```ts
name
slug
color
isActive
```

## المطلوب

نفذ واحدًا من الخيارين بشكل كامل، ويفضل الخيار الأول إذا لم تكن الألوان مطلوبة فعليًا.

### الخيار الأول: تنظيف payload

```ts
const { slug, color, ...payload } = values;
```

- لا ترسل `slug` ولا `color` إلى الباك.
- إن بقيت حقول slug/color في الفورم فاجعلها read-only أو احذفها من الفورم.

### الخيار الثاني: دعم color و slug رسميًا

إذا كانت ألوان الوسوم مطلوبة بصريًا:

- أضف `slug?: string` و `color?: string` إلى DTOs.
- أضف `color` إلى `tag.schema.ts`.
- تحقق من format اللون إذا كان Hex:

```ts
@Matches(/^#([0-9A-Fa-f]{3}){1,2}$/)
color?: string;
```

- حدّث service لإنشاء slug عند عدم إرساله.
- حدّث public/admin responses.

## معايير القبول

- إنشاء/تعديل tag لا يفشل بسبب slug/color.
- إذا تقرر دعم color، يجب أن يظهر اللون في columns وفي الموقع العام إن كان مستخدمًا.

---

## 3.3 Blog Posts

الملفات:

```txt
frontend/src/features/admin/resources/posts/schema.ts
frontend/src/features/admin/resources/posts/form.tsx
frontend/src/features/admin/resources/posts/page-client.tsx
backend/src/modules/blog/posts/dto/create-post.dto.ts
backend/src/modules/blog/posts/dto/update-post.dto.ts
backend/src/modules/blog/posts/schemas/post.schema.ts
```

DTO الباك يقبل:

```ts
title
summary
excerpt
content
featuredImage
coverImage
category
tags
publishDate
scheduledAt
status
readTime
isFeatured
allowIndexing
canonicalUrl
seo.metaTitle
seo.metaDescription
seo.ogImage
```

الفرونت يحتوي أيضًا على:

```ts
slug
```

## المطلوب

- لا ترسل `slug` إلى الباك إلا إذا أضفته رسميًا في DTO.
- الأفضل اعتماد توليد slug من العنوان داخل الباك.
- في `page-client.tsx`:

```ts
const { slug, ...cleanValues } = values;
const payload = {
  ...cleanValues,
  category: cleanValues.category || undefined,
  tags: cleanValues.tags || [],
  canonicalUrl: cleanValues.canonicalUrl || undefined,
  publishDate: cleanValues.publishDate || undefined,
  scheduledAt: cleanValues.scheduledAt || undefined,
};
```

## معايير القبول

- إنشاء/تعديل مقال لا يفشل بسبب `slug`.
- المقال المنشور يظهر في `/blog` وفي `/blog/[slug]`.
- المقال المجدول يمكن حفظه بدون كسر validation.

---

## 3.4 FAQs

الملفات:

```txt
frontend/src/features/admin/resources/faqs/schema.ts
frontend/src/features/admin/resources/faqs/form.tsx
frontend/src/features/admin/resources/faqs/page-client.tsx
backend/src/modules/faqs/dto/create-faq.dto.ts
backend/src/modules/faqs/dto/update-faq.dto.ts
```

DTO الباك يقبل داخل `seo`:

```ts
metaTitle
metaDescription
```

الفرونت يرسل أيضًا:

```ts
seo.ogImage
```

## المطلوب

نظّف payload قبل create/update:

```ts
const payload = {
  ...values,
  seo: values.seo
    ? {
        metaTitle: values.seo.metaTitle || undefined,
        metaDescription: values.seo.metaDescription || undefined,
      }
    : undefined,
};
```

أو أضف `ogImage` رسميًا إلى `FaqSeoDto` إذا كان مطلوبًا.

## معايير القبول

- إنشاء/تعديل FAQ لا يفشل بسبب `seo.ogImage`.
- FAQ تظهر في الموقع العام عند `isPublished=true`.

---

## 3.5 Services / Technologies / Links / Projects

هذه الموارد تقبل `slug` في الباك، لذلك لا تحذف `slug` منها.

لكن يجب تنظيف القيم الفارغة:

- أي رابط اختياري فارغ يجب تحويله إلى `undefined`.
- أي رقم فارغ يجب تحويله إلى `undefined` وليس `""`.
- أي مصفوفة من repeater objects يجب تحويلها إلى `string[]`.

### Services

تأكد من تحويل:

```ts
deliverables: string[]
requirements: string[]
ctaUrl?: string
startingPrice?: number
```

### Technologies

تأكد من تحويل:

```ts
yearsOfExperience?: number
officialUrl?: string
```

ولا ترسل `yearsOfExperience: ""`.

### Links

تأكد من تحويل:

```ts
icon?: string
platform?: string
category?: string
```

القيم الفارغة إلى `undefined` عند الحاجة.

### Projects

DTO الباك يقبل `slug`, `seo.ogImage`, `images`, `gallery`, `clientName`, `startDate`, `endDate`, `completionDate`.

المطلوب:

- لا تحذف `slug` من Project.
- أضف الحقول الناقصة في الفورم إن كانت غير موجودة: `clientName`, `startDate`, `endDate`, `completionDate`, `gallery/images`.
- نظف روابط `liveUrl`, `githubUrl` والقيم الاختيارية الفارغة.

---

# 4. توحيد Validation في Frontend Zod مع Backend DTOs

الملفات:

```txt
frontend/src/features/admin/resources/projects/schema.ts
frontend/src/features/admin/resources/posts/schema.ts
frontend/src/features/admin/resources/categories/schema.ts
frontend/src/features/admin/resources/tags/schema.ts
frontend/src/features/admin/resources/faqs/schema.ts
frontend/src/features/admin/resources/services/schema.ts
frontend/src/features/admin/resources/technologies/schema.ts
frontend/src/features/admin/resources/links/schema.ts
frontend/src/features/admin/resources/profile/schema.ts
```

## المطلوب

حدّث Zod schemas لتطابق أقل قيود الباك.

### Projects

```ts
title: min(3)
category: min(2)
shortDescription: min(10)
detailedDescription: min(20)
```

### Blog Posts

```ts
title: min(3)
summary: min(20)
content: min(50)
category: optional MongoId or empty handled as undefined
tags: string[]
canonicalUrl: valid URL or empty
```

### Blog Categories

```ts
name: min(2)
```

### Blog Tags

```ts
name: min(2)
```

### FAQs

```ts
question: min(3)
answer: min(3)
```

### Services

```ts
name: min(3)
shortDescription: min(10)
startingPrice: number >= 0 optional
ctaUrl: valid URL or empty
```

### Technologies

```ts
name: min(2)
yearsOfExperience: number optional
officialUrl: valid URL or empty
```

### Links

```ts
title: min(2)
url: valid URL required
```

## معايير القبول

- لا يستطيع المستخدم إرسال فورم يقبله الفرونت ثم يرفضه الباك بسبب minLength واضح.
- رسائل الخطأ تظهر في الفورم قبل إرسال الطلب.

---

# 5. تنفيذ أو إزالة Bulk Actions

الفرونت يستخدم:

```ts
adminClient.bulkAction("projects", action, ids)
adminClient.bulkAction("blog/posts", action, ids)
```

وهذا يرسل إلى:

```http
POST /api/admin/projects/bulk
POST /api/admin/blog/posts/bulk
```

هذه endpoints غير موجودة في الباك حاليًا.

## المطلوب

نفذ دعم bulk في الباك بدل حذف الواجهة، لأن الواجهة جاهزة وتفيد لوحة التحكم.

## Backend files

```txt
backend/src/modules/projects/projects.controller.ts
backend/src/modules/projects/projects.service.ts
backend/src/modules/blog/posts/posts.controller.ts
backend/src/modules/blog/posts/posts.service.ts
```

أضف DTO مشتركًا أو منفصلًا:

```ts
import { IsArray, IsEnum, IsMongoId, IsOptional, IsObject } from 'class-validator';

export enum BulkAction {
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  ARCHIVE = 'archive',
  DELETE = 'delete',
}

export class BulkActionDto {
  @IsEnum(BulkAction)
  action: BulkAction;

  @IsArray()
  @IsMongoId({ each: true })
  ids: string[];

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
```

## Projects endpoint

```ts
@Post('bulk')
async bulk(@Request() req, @Body() dto: BulkActionDto) {
  return {
    message: 'Bulk action completed successfully',
    data: await this.projectsService.bulkAction(dto, req),
  };
}
```

## Blog Posts endpoint

```ts
@Post('bulk')
async bulk(@Request() req, @Body() dto: BulkActionDto) {
  return {
    message: 'Bulk action completed successfully',
    data: await this.postsService.bulkAction(dto, req),
  };
}
```

## Service behavior

- `publish`: تعيين منشور/Published.
- `unpublish`: تعيين Draft أو غير منشور حسب المورد.
- `archive`: أرشفة/soft-delete حسب النظام الحالي.
- `delete`: حذف أو أرشفة حسب فلسفة المشروع، لكن يجب أن يكون واضحًا وثابتًا.
- أضف audit log لكل عملية bulk أو لكل عنصر حسب نظام التدقيق الحالي.

## معايير القبول

- اختيار عدة مشاريع ثم نشرها يعمل.
- اختيار عدة مقالات ثم أرشفتها يعمل.
- إذا أرسلت IDs غير صحيحة يرجع 400 واضح.
- إذا لم يحدد المستخدم عناصر لا يتم إرسال الطلب من الفرونت.

---

# 6. إصلاح Reorder Contract

في `admin-client.ts` يوجد:

```ts
reorderResource(resource, ids) => PUT /resource/reorder body { ids }
```

لكن الباك في أكثر من مورد يستخدم:

```http
PATCH /api/admin/projects/reorder
PATCH /api/admin/services/reorder
PATCH /api/admin/technologies/reorder
PATCH /api/admin/links/reorder
PATCH /api/admin/faqs/reorder
```

وبعضها يتوقع:

```ts
{ items: { id: string; order: number }[] }
```

## المطلوب

عدّل دالة reorder في الفرونت:

```ts
reorderResource: async (resource: string, items: { id: string; order: number }[]) => {
  const r = await clientApiRequest<unknown>(`/${resource}/reorder`, {
    method: "PATCH",
    body: { items },
  });
  return r;
}
```

ولو كان FAQ DTO يتوقع شكلًا مختلفًا، وحّده في الباك أو أضف adapter في الفرونت.

## معايير القبول

- أي drag/drop reorder أو زر حفظ ترتيب لا يفشل بسبب method/body mismatch.
- الباك يحدث حقل `order` فعلًا.

---

# 7. إصلاح Server-side Pagination/Search/Filters في DataTable

المشكلة الحالية أن `DataTable` يستخدم TanStack pagination/filtering محليًا على البيانات المحملة فقط، بينما الباك يرجع pagination meta.

الملفات:

```txt
frontend/src/components/admin/data-table/DataTable.tsx
frontend/src/components/admin/data-table/DataTablePagination.tsx
frontend/src/components/admin/data-table/DataTableToolbar.tsx
frontend/src/lib/api/admin-search-params.ts
frontend/src/features/admin/resources/*/page-client.tsx
```

## المطلوب

حوّل `DataTable` لدعم server mode.

أضف props:

```ts
serverSide?: boolean;
page?: number;
limit?: number;
total?: number;
totalPages?: number;
onPageChange?: (page: number) => void;
onLimitChange?: (limit: number) => void;
searchValue?: string;
onSearchChange?: (value: string) => void;
filtersValue?: Record<string, string>;
onFilterChange?: (key: string, value: string) => void;
```

## السلوك المطلوب

- البحث في صفحات admin يغير URL query param `search` عبر `nuqs` أو router.
- تغيير الفلتر يغير URL query param مثل `status`.
- تغيير الصفحة يغير `page`.
- تغيير limit يغير `limit` ويعيد `page=1`.
- لا يستخدم `getFilteredRowModel` للبحث السيرفري عندما `serverSide=true`.
- لا يستخدم `getPaginationRowModel` كأنه يمتلك كل البيانات في وضع السيرفر.
- عداد العناصر يعرض `meta.total` وليس عدد العناصر الحالية فقط.
- التصدير CSV يوضح أنه يصدر البيانات المعروضة فقط، أو أضف endpoint export لاحقًا إن أردت تصدير الكل.

## تطبيق في صفحات الموارد

في كل صفحة admin تمرير meta:

```tsx
<DataTable
  serverSide
  page={data?.meta.page ?? queryParams.page}
  limit={data?.meta.limit ?? queryParams.limit}
  total={data?.meta.total ?? 0}
  totalPages={data?.meta.totalPages ?? 1}
  searchValue={queryParams.search}
  onSearchChange={(value) => setQueryParams({ search: value, page: 1 })}
  filtersValue={{ status: queryParams.status }}
  onFilterChange={(key, value) => setQueryParams({ [key]: value, page: 1 })}
/>
```

## معايير القبول

- عندما يكون في الباك 100 عنصر وال limit=10، يظهر في الواجهة إجمالي 100 وليس 10.
- زر الصفحة التالية يجلب الصفحة الثانية من الباك.
- البحث يرسل request جديد للباك، وليس فلترة محلية فقط.
- الفلاتر ترسل request جديد للباك.

---

# 8. إصلاح Contact Messages

الملفات:

```txt
frontend/src/features/admin/resources/contact/page-client.tsx
frontend/src/features/admin/resources/contact/columns.tsx
backend/src/modules/contact/contact.controller.ts
backend/src/modules/contact/dto/update-status.dto.ts
backend/src/modules/contact/schemas/contact-message.schema.ts
```

## Backend statuses

الباك يستخدم:

```ts
new
read
replied
archived
spam
```

الفرونت يستخدم في بعض الأماكن:

```ts
pending
read
replied
```

## المطلوب

استبدل `pending` بـ `new` في:

- check عند فتح الرسالة.
- filter options.
- labels/badges.
- columns.
- types.

مثال:

```ts
if (id && msg.status === "new") {
  statusMutation.mutate({ id, status: "read" });
}
```

الفلاتر يجب أن تكون:

```ts
new
read
replied
archived
spam
```

## تحقق من المسار

الفرونت يستدعي:

```ts
clientApiRequest(`contact/messages/${id}/status`, {
  method: "PATCH",
  body: { status },
});
```

والباك الصحيح:

```http
PATCH /api/admin/contact/messages/:id/status
```

بما أن proxy يضيف `/admin`، فهذا صحيح إذا كان path النهائي `/contact/messages/:id/status`.

## معايير القبول

- الرسالة الجديدة تتحول تلقائيًا إلى read عند فتحها.
- يمكن تعليم الرسالة كـ replied.
- فلاتر الرسائل تعمل بكل الحالات.
- لا يوجد استخدام لكلمة pending في contact admin إلا إذا كان مجرد نص قديم يتم تغييره.

---

# 9. إصلاح Audit Logs Shape في الفرونت

الملفات:

```txt
frontend/src/features/admin/resources/audit-logs/columns.tsx
frontend/src/features/admin/resources/audit-logs/page-client.tsx
backend/src/modules/audit-logs/audit-logs.controller.ts
backend/src/modules/audit-logs/schemas/audit-log.schema.ts
```

## شكل الباك

الباك يستخدم حقولًا مثل:

```ts
actorId
actorEmail
action
resource
resourceId
ipAddress
userAgent
before
after
metadata
createdAt
```

وقد يكون `actorId` populated أحيانًا:

```ts
actorId: { name, email }
```

الفرونت يتوقع حاليًا:

```ts
user.fullName
user.email
payload
details
```

## المطلوب

عدّل Type في `columns.tsx`:

```ts
export interface AuditLog {
  id?: string;
  _id?: string;
  actorId?: string | { name?: string; fullName?: string; email?: string } | null;
  actorEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
  createdAt: string;
}
```

واستخدم mapper للفاعل:

```ts
const actor = row.original.actorId;
const actorName =
  typeof actor === "object" && actor
    ? actor.fullName || actor.name || actor.email
    : row.original.actorEmail || "عملية تلقائية / زائر";

const actorEmail =
  typeof actor === "object" && actor
    ? actor.email
    : row.original.actorEmail;
```

واعرض التفاصيل من:

```ts
before
after
metadata
```

بدل `payload/details`.

## معايير القبول

- صفحة Audit Logs لا تعرض المسؤول فارغًا إذا كان `actorEmail` موجودًا.
- يمكن رؤية before/after/metadata بطريقة منظمة.
- لا توجد أخطاء runtime بسبب `user.fullName` على undefined.

---

# 10. إصلاح Dashboard Data Mapping

الملف:

```txt
frontend/src/app/(admin)/admin/(protected)/dashboard/page.tsx
```

## المطلوب

راجع كل الحقول القادمة من:

```http
GET /api/admin/dashboard
GET /api/admin/dashboard/stats
```

وطابقها مع response الفعلي في:

```txt
backend/src/modules/dashboard/dashboard.controller.ts
backend/src/modules/dashboard/dashboard.service.ts
```

## نقاط يجب التحقق منها

- Contact recent messages تستخدم `fullName` وليس `name` إذا كان الباك يرجع `fullName`.
- Recent posts/projects/services تستخدم الحقول الفعلية الموجودة في schema.
- Counters لا تعتمد على أسماء غير موجودة.
- أي رابط في dashboard إلى صفحة مورد يستخدم route صحيح في Next admin.

## المطلوب عمليًا

- أضف types واضحة لـ Dashboard response.
- أضف mapper يحول response إلى شكل UI ثابت.
- لا تعرض `undefined` في الواجهة.
- أضف fallback نصي واضح عند غياب البيانات.

## معايير القبول

- Dashboard يفتح بدون أخطاء runtime.
- آخر الرسائل تعرض اسم المرسل وبريده وحالة الرسالة.
- الإحصائيات لا تظهر NaN أو undefined.

---

# 11. إصلاح Media Upload/Metadata/Usage

الملفات:

```txt
frontend/src/features/media/MediaAdmin.tsx
frontend/src/components/admin/forms/MediaField.tsx
frontend/src/components/admin/MediaPicker.tsx
frontend/src/lib/api/admin-client.ts
backend/src/modules/media/dto/upload-media.dto.ts
backend/src/modules/media/dto/update-media-metadata.dto.ts
backend/src/modules/media/media.controller.ts
```

## Backend contract

Upload:

```http
POST /api/admin/media/upload
multipart/form-data:
file
folder
alt?
usage?
```

Update:

```http
PATCH /api/admin/media/:id
body:
folder?
alt?
usage?
```

Allowed folders:

```txt
profile
projects
blog
services
technologies
links
cv
misc
```

## المطلوب

- عدّل `uploadMedia` لتقبل `usage` أيضًا:

```ts
uploadMedia: async <T>(file: File, folder: string, alt?: string, usage?: string) => {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("folder", folder);
  if (alt) formData.set("alt", alt);
  if (usage) formData.set("usage", usage);
  const r = await clientApiRequest<T>("/media/upload", { method: "POST", body: formData });
  return r.data;
}
```

- استخدم `PATCH` عند تعديل alt/folder/usage.
- تأكد أن كل MediaField يرسل folder مناسب حسب المورد:
  - profile image → `profile`
  - cv file → `cv`
  - project images → `projects`
  - blog images → `blog`
  - service icons/images → `services`
  - technology icons → `technologies`
  - links icons → `links`
  - غير ذلك → `misc`

## معايير القبول

- رفع صورة من أي فورم يعمل.
- تعديل alt/folder من صفحة media يعمل.
- لا يوجد خطأ invalid folder.
- الملفات المرفوعة تظهر في MediaPicker.

---

# 12. إكمال حقول Profile المتاحة في الباك

الملفات:

```txt
frontend/src/features/admin/resources/profile/schema.ts
frontend/src/features/admin/resources/profile/page-client.tsx
backend/src/modules/profile/dto/update-profile.dto.ts
backend/src/modules/profile/schemas/profile.schema.ts
```

## حقول يدعمها الباك ويجب أن تكون مدعومة في الفرونت

```ts
fullName
title
headline
bio
about
profileImage
profileImageAlt
cvFile
email
phone
location
availableForWork
socialLinks: { platform, url, icon?, order? }[]
yearsOfExperience
certificates: { title, issuer?, date?, url? }[]
languages: { name, level? }[]
seo: { metaTitle?, metaDescription?, ogImage? }
```

## المطلوب

- أضف `profileImageAlt` في schema/form إذا غير موجود.
- حدّث `socialLinks` في الفرونت لدعم `icon` و `order` أو نظّفهما حسب القرار.
- تأكد أن `yearsOfExperience` لا يرسل كـ `""`.
- تأكد من تنظيف الروابط الاختيارية الفارغة.
- تأكد أن `PUT /api/admin/profile` يعمل من صفحة البروفايل عبر proxy.

## معايير القبول

- تعديل البروفايل يحفظ كل الحقول بدون 400.
- الصورة والسيرة والروابط تظهر في الموقع العام.
- SEO profile يظهر في metadata إن كان مستخدمًا.

---

# 13. إصلاح Types العامة بين الفرونت والباك

الملفات:

```txt
frontend/src/lib/api/types.ts
frontend/src/lib/api/public.ts
frontend/src/lib/api/admin.ts
frontend/src/features/admin/resources/*/columns.tsx
frontend/src/features/admin/resources/*/page-client.tsx
```

## المطلوب

- راجع كل interface في الفرونت مقابل schema/DTO في الباك.
- أضف support لكل من `id` و `_id` عند التعامل مع MongoDB documents.
- لا تعتمد على حقل غير مضمون مثل `name` إذا schema يستخدم `fullName`.
- لا تستخدم status values غير موجودة في الباك.
- اجعل status enums في الفرونت مطابقة للباك:

### PostStatus

```ts
draft
published
scheduled
archived
```

### ProjectStatus

استخدم القيم الموجودة في `backend/src/modules/projects/schemas/project.schema.ts` فقط.

### Contact MessageStatus

```ts
new
read
replied
archived
spam
```

### ProficiencyLevel

استخدم القيم الموجودة في `backend/src/modules/technologies/schemas/technology.schema.ts` فقط.

## معايير القبول

- `npm run type-check` أو `npx tsc --noEmit` ينجح في الفرونت.
- لا توجد casts كثيرة من نوع `as any` إلا عند الضرورة ومع تعليق واضح.

---

# 14. إصلاح Admin Proxy والتحقق من Auth Flow

الملفات:

```txt
frontend/src/app/api/admin-proxy/[[...path]]/route.ts
frontend/src/app/api/auth/login/route.ts
frontend/src/app/api/auth/logout/route.ts
frontend/src/app/api/auth/me/route.ts
frontend/src/app/api/auth/refresh/route.ts
frontend/src/lib/auth/session.ts
backend/src/modules/auth/auth.controller.ts
```

## المطلوب

- تأكد أن `admin-proxy` يرسل الطلب إلى:

```txt
${NEXT_PUBLIC_API_URL أو API_URL}/admin/...
```

أو إلى backend base الصحيح بدون تكرار `/api/api`.

- تأكد أن cookies/session token تصل مع كل Admin request.
- عند 401 يعمل redirect إلى:

```txt
/admin/login?expired=true
```

- تأكد من refresh flow:

```http
POST /api/auth/refresh
```

- تأكد من me flow:

```http
GET /api/auth/me
```

- أضف واجهة أو روابط لاحقًا لـ:

```http
POST /api/auth/change-password
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

إذا كانت هذه الوظائف مطلوبة قبل النشر، أنشئ صفحاتها أو أخفِ روابطها إن لم تكن موجودة.

## معايير القبول

- تسجيل الدخول يعمل.
- تحديث الصفحة داخل لوحة التحكم لا يخرج المستخدم إذا التوكن صالح.
- عند انتهاء الجلسة يتم توجيه المستخدم بوضوح.
- لا توجد مشكلة CORS لأن كل Admin calls تمر عبر proxy.

---

# 15. إصلاح Public API Consistency

الملفات:

```txt
frontend/src/lib/api/public.ts
frontend/src/app/(site)/**/*.tsx
backend/src/modules/**/**.controller.ts
```

## المطلوب

راجع المسارات العامة التالية وتأكد من تطابقها:

```http
GET /api/public/profile
GET /api/public/projects
GET /api/public/projects/:slug
GET /api/public/blog/posts
GET /api/public/blog/posts/:slug
GET /api/public/blog/categories
GET /api/public/blog/categories/:slug
GET /api/public/blog/tags
GET /api/public/blog/tags/:slug
GET /api/public/services
GET /api/public/services/:slug
GET /api/public/technologies
GET /api/public/technologies/:slug
GET /api/public/links
GET /api/public/links/:slug
POST /api/public/links/:id/click
GET /api/public/faqs
POST /api/public/contact/messages أو POST /api/public/contact حسب الموجود فعليًا
```

## المطلوب عمليًا

- لا تستدعِ route عام غير موجود.
- لا تعتمد صفحات site على حقول admin-only غير مرجعة في public responses.
- تأكد من أن `sitemap.ts`, `robots.ts`, `rss.xml` تستخدم endpoints صحيحة.

## معايير القبول

- الصفحة الرئيسية تفتح بدون أخطاء fetch.
- صفحات blog/projects/services dynamic تعمل بالـ slug.
- contact form يرسل الرسالة ويعرض success.
- link tracking يعمل بدون كسر فتح الرابط.

---

# 16. إضافة ملفات البيئة الناقصة وتوحيدها

## Frontend

أضف الملف:

```txt
frontend/.env.example
```

بالمحتوى:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

إذا كان `admin-proxy` يحتاج server-only env، أضف:

```env
API_URL=http://localhost:3000/api
```

واستخدم `API_URL` في route handlers بدل `NEXT_PUBLIC_API_URL` إن كان الاستدعاء server-side.

## Backend

راجع:

```txt
backend/.env.example
```

وتأكد أنه يحتوي كل المطلوب للتشغيل والنشر:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
CORS_ORIGIN=http://localhost:3001
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_PUBLIC_URL=
```

عدّل الأسماء حسب config الفعلي في المشروع.

## معايير القبول

- يستطيع مطور جديد تشغيل المشروع من `.env.example` بدون تخمين أسماء المتغيرات.
- لا يوجد اعتماد على env غير موثق.

---

# 17. توثيق API Contract داخل المشروع

الملف الموجود:

```txt
backend/API_CONTRACT.md
```

## المطلوب

حدّثه ليشمل:

- كل public endpoints.
- كل admin endpoints.
- method لكل endpoint.
- body المطلوب لكل create/update/status/bulk/reorder.
- response shape القياسي:

```ts
{
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
}
```

أضف قسمًا خاصًا لـ pagination:

```ts
page
limit
search
sortBy
sortOrder
status
```

وأضف status enums لكل مورد.

## معايير القبول

- يمكن للفرونت الاعتماد على `API_CONTRACT.md` كمرجع.
- لا توجد endpoint مستخدمة في الفرونت وغير موثقة.

---

# 18. توحيد Response Normalization في الفرونت

الملفات:

```txt
frontend/src/lib/api/client.ts
frontend/src/lib/api/admin-client.ts
frontend/src/lib/api/public.ts
```

## المطلوب

- تأكد أن كل response من الباك يتم التعامل معه بالشكل:

```ts
data
meta
message
```

- `normalizeClientPaginated` يجب أن يدعم الحالتين:

```ts
{ data: items, meta }
```

و:

```ts
{ data: { items, meta } }
```

لكن لا تخفِ أخطاء العقد. إذا كان response غير متوقع في development، سجّل warning.

## معايير القبول

- كل صفحات list تعرض البيانات سواء كان meta في الجذر أو داخل data، حسب response الحالي.
- لا يوجد كسر عند empty arrays.

---

# 19. إصلاح Empty/Null Handling في Forms

## المطلوب

في كل page-client قبل إرسال payload:

- حوّل `""` إلى `undefined` للحقول الاختيارية.
- حوّل `null` إلى `undefined` إذا DTO لا يقبل null.
- لا ترسل arrays فيها عناصر فارغة.
- لا ترسل nested SEO فارغ بالكامل إذا كل حقوله فارغة، أو ارسله بقيم undefined حسب ما يقبل الباك.

أضف helper عام:

```ts
export function emptyToUndefined<T>(value: T): T | undefined {
  return value === "" || value === null ? undefined : value;
}

export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  ) as Partial<T>;
}
```

واستخدمه بحذر، ولا تحذف `false` أو `0`.

## معايير القبول

- الحقول الاختيارية الفارغة لا تسبب validation errors.
- القيم `false` و `0` لا يتم حذفها بالخطأ.

---

# 20. إصلاح Status Filters في كل Resource

## المطلوب

راجع كل filterOptions في صفحات admin وطابقها مع الباك.

### Projects

استخدم statuses الموجودة في schema فقط، بالإضافة إلى published/unpublished إذا كان الباك يدعم فلترها.

### Posts

```txt
draft
published
scheduled
archived
```

### Contact

```txt
new
read
replied
archived
spam
```

### Categories/Tags

إذا الباك يفلتر بـ `isActive` وليس `status`، عدّل query param في الفرونت أو أضف دعم `status` في الباك.

مثلاً بدل:

```ts
status: queryParams.status
```

استخدم:

```ts
isActive: queryParams.status === "active" ? true : queryParams.status === "inactive" ? false : undefined
```

أو اجعل الباك يقبل `status=active/inactive` ويحوّلها داخليًا.

### Services/Technologies/Links/FAQs

إذا الباك يستخدم `isPublished` وليس `status`، وحّد الفلتر:

```ts
isPublished: true/false
```

أو أضف mapping في backend filter DTO.

## معايير القبول

- كل filter يرسل query يفهمها الباك.
- لا توجد فلاتر شكلية لا تؤثر في النتائج.

---

# 21. اختبارات Frontend مطلوبة

أضف أو حدّث اختبارات:

```txt
frontend/src/lib/api/admin-client.test.ts
frontend/src/features/admin/resources/projects/schema.test.ts
```

وأضف اختبارات جديدة حسب الحاجة:

```txt
frontend/src/features/admin/resources/posts/schema.test.ts
frontend/src/features/admin/resources/categories/schema.test.ts
frontend/src/features/admin/resources/tags/schema.test.ts
frontend/src/features/admin/resources/faqs/schema.test.ts
frontend/src/lib/api/payload-cleaners.test.ts
```

## المطلوب اختباره

- `patchResource` يرسل PATCH.
- `updateResource` يرسل PUT.
- `reorderResource` يرسل PATCH و body `{ items }`.
- `bulkAction` يرسل POST إلى `/bulk`.
- Blog Category payload لا يحتوي slug.
- Blog Tag payload لا يحتوي slug/color إذا لم يتم دعمها في الباك.
- Blog Post payload لا يحتوي slug.
- FAQ seo لا يحتوي ogImage إذا لم يتم دعمه.
- Zod min lengths تطابق DTO.

## أوامر التحقق

```bash
cd frontend
npm test
npm run lint
npx tsc --noEmit
npm run build
```

إذا لم توجد scripts، أضفها أو استخدم المتاح في `package.json`.

---

# 22. اختبارات Backend مطلوبة

أضف أو حدّث اختبارات للـ controllers/services:

```txt
backend/src/modules/projects/projects.controller.spec.ts
backend/src/modules/blog/posts/posts.controller.spec.ts
backend/src/modules/contact/contact.controller.spec.ts
backend/src/modules/media/media.controller.spec.ts
```

## المطلوب اختباره

- `PATCH /admin/projects/:id/publish` يعمل.
- `PATCH /admin/blog/posts/:id/archive` يعمل.
- `POST /admin/projects/bulk` يعمل بعد إضافته.
- `POST /admin/blog/posts/bulk` يعمل بعد إضافته.
- `PATCH /admin/contact/messages/:id/status` يقبل `new/read/replied/archived/spam` حسب المنطق.
- `PATCH /admin/media/:id` يقبل `folder/alt/usage`.
- DTO validation يرفض extra fields غير المدعومة.

## أوامر التحقق

```bash
cd backend
npm test
npm run lint
npx tsc --noEmit
npm run build
```

---

# 23. فحص بناء ونشر محلي قبل Coolify/Production

## Backend

```bash
cd backend
npm install
npx tsc --noEmit
npm run build
npm run start:prod
```

اختبر:

```bash
curl http://localhost:3000/api/health
```

ثم اختبر endpoints أساسية.

## Frontend

```bash
cd frontend
npm install
npx tsc --noEmit
npm run build
npm run start
```

اختبر:

```txt
http://localhost:3001
http://localhost:3001/admin/login
http://localhost:3001/admin/dashboard
```

## Docker إن وجد

```bash
docker compose build --no-cache
docker compose up -d
```

ثم راقب logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

## معايير القبول

- لا توجد TypeScript errors.
- لا توجد ESLint errors تمنع البناء.
- لا توجد 404/405 من admin actions.
- لا توجد 400 بسبب extra fields في الفورمات.
- لا توجد runtime errors في Dashboard/DataTable.

---

# 24. سيناريوهات قبول نهائية قبل النشر

نفذ هذه السيناريوهات يدويًا بعد الإصلاح:

## Auth

- تسجيل دخول Admin.
- تحديث الصفحة داخل لوحة التحكم.
- تسجيل خروج.
- محاولة دخول dashboard بدون session تعيد إلى login.

## Profile

- تعديل الاسم، العنوان، bio، about.
- رفع صورة profile.
- تعديل social links.
- حفظ SEO.
- التأكد أن الموقع العام يعرض التغييرات.

## Projects

- إنشاء مشروع جديد.
- تعديل المشروع.
- نشر المشروع.
- إلغاء نشره.
- أرشفته.
- تجربة bulk publish/archive.
- التأكد من ظهوره/اختفائه في الموقع العام حسب `isPublished`.

## Blog

- إنشاء category.
- إنشاء tag.
- إنشاء post draft.
- نشر post.
- جدولة post إن كانت الواجهة تدعم ذلك.
- أرشفة post.
- تجربة bulk actions.
- فتح `/blog` و `/blog/[slug]`.

## Services

- إنشاء خدمة.
- تعديل خدمة.
- نشر/إلغاء نشر.
- ظهور الخدمة في الموقع العام.

## Technologies

- إنشاء تقنية.
- تعديل تقنية.
- نشر/إلغاء نشر.
- ظهورها في الموقع العام.

## Links

- إنشاء رابط.
- تعديل رابط.
- نشر/إلغاء نشر.
- الضغط على الرابط من الموقع العام وتسجيل click.

## FAQs

- إنشاء FAQ.
- تعديل FAQ.
- نشر/إلغاء نشر.
- ترتيب FAQs إن كانت الواجهة تدعم reorder.

## Contact

- إرسال رسالة من صفحة التواصل العامة.
- ظهور الرسالة في لوحة التحكم بحالة `new`.
- فتح الرسالة يحولها إلى `read`.
- تعليمها `replied`.
- فلترة الرسائل حسب الحالات.

## Media

- رفع صورة من Media Admin.
- تعديل alt/folder/usage.
- حذف media غير مستخدمة.
- اختيار صورة من MediaPicker داخل فورم.

## Audit Logs

- تنفيذ تعديل مورد.
- فتح Audit Logs.
- التأكد من ظهور actor/action/resource/before/after/metadata.

## Dashboard

- فتح Dashboard.
- التأكد من الإحصائيات.
- التأكد من recent messages/recent content.
- عدم ظهور undefined/NaN.

---

# 25. قائمة الملفات المتوقع تعديلها

## Frontend

```txt
frontend/.env.example
frontend/src/lib/api/admin-client.ts
frontend/src/lib/api/client.ts
frontend/src/lib/api/public.ts
frontend/src/lib/api/types.ts
frontend/src/lib/api/admin-search-params.ts
frontend/src/lib/utils.ts
frontend/src/components/admin/data-table/DataTable.tsx
frontend/src/components/admin/data-table/DataTablePagination.tsx
frontend/src/components/admin/data-table/DataTableToolbar.tsx
frontend/src/features/media/MediaAdmin.tsx
frontend/src/components/admin/forms/MediaField.tsx
frontend/src/components/admin/MediaPicker.tsx
frontend/src/features/admin/resources/projects/schema.ts
frontend/src/features/admin/resources/projects/form.tsx
frontend/src/features/admin/resources/projects/page-client.tsx
frontend/src/features/admin/resources/posts/schema.ts
frontend/src/features/admin/resources/posts/form.tsx
frontend/src/features/admin/resources/posts/page-client.tsx
frontend/src/features/admin/resources/categories/schema.ts
frontend/src/features/admin/resources/categories/form.tsx
frontend/src/features/admin/resources/categories/page-client.tsx
frontend/src/features/admin/resources/tags/schema.ts
frontend/src/features/admin/resources/tags/form.tsx
frontend/src/features/admin/resources/tags/page-client.tsx
frontend/src/features/admin/resources/faqs/schema.ts
frontend/src/features/admin/resources/faqs/form.tsx
frontend/src/features/admin/resources/faqs/page-client.tsx
frontend/src/features/admin/resources/services/schema.ts
frontend/src/features/admin/resources/services/form.tsx
frontend/src/features/admin/resources/services/page-client.tsx
frontend/src/features/admin/resources/technologies/schema.ts
frontend/src/features/admin/resources/technologies/form.tsx
frontend/src/features/admin/resources/technologies/page-client.tsx
frontend/src/features/admin/resources/links/schema.ts
frontend/src/features/admin/resources/links/form.tsx
frontend/src/features/admin/resources/links/page-client.tsx
frontend/src/features/admin/resources/contact/page-client.tsx
frontend/src/features/admin/resources/contact/columns.tsx
frontend/src/features/admin/resources/audit-logs/page-client.tsx
frontend/src/features/admin/resources/audit-logs/columns.tsx
frontend/src/features/admin/resources/profile/schema.ts
frontend/src/features/admin/resources/profile/page-client.tsx
frontend/src/app/(admin)/admin/(protected)/dashboard/page.tsx
```

## Backend

```txt
backend/API_CONTRACT.md
backend/src/modules/projects/projects.controller.ts
backend/src/modules/projects/projects.service.ts
backend/src/modules/projects/dto/create-project.dto.ts
backend/src/modules/projects/dto/update-project.dto.ts
backend/src/modules/blog/posts/posts.controller.ts
backend/src/modules/blog/posts/posts.service.ts
backend/src/modules/blog/posts/dto/create-post.dto.ts
backend/src/modules/blog/posts/dto/update-post.dto.ts
backend/src/modules/blog/categories/dto/create-category.dto.ts
backend/src/modules/blog/categories/dto/update-category.dto.ts
backend/src/modules/blog/tags/dto/create-tag.dto.ts
backend/src/modules/blog/tags/dto/update-tag.dto.ts
backend/src/modules/blog/tags/schemas/tag.schema.ts
backend/src/modules/faqs/dto/create-faq.dto.ts
backend/src/modules/faqs/dto/update-faq.dto.ts
backend/src/modules/media/media.controller.ts
backend/src/modules/media/dto/upload-media.dto.ts
backend/src/modules/media/dto/update-media-metadata.dto.ts
backend/src/modules/contact/contact.controller.ts
backend/src/modules/contact/dto/update-status.dto.ts
backend/src/modules/dashboard/dashboard.service.ts
backend/src/modules/audit-logs/audit-logs.controller.ts
backend/src/modules/audit-logs/schemas/audit-log.schema.ts
```

لا تعدّل كل الملفات لمجرد وجودها في القائمة؛ عدّل فقط ما يحتاج تعديلًا فعليًا لتنفيذ البنود. لكن يجب مراجعتها كلها.

---

# 26. النتيجة المطلوبة بعد التنفيذ

بعد تنفيذ كل البنود يجب أن تكون النتيجة:

- الموقع العام يعمل.
- لوحة التحكم تعمل.
- إنشاء/تعديل/حذف/نشر/أرشفة كل الموارد يعمل.
- لا توجد extra fields مرفوضة.
- لا توجد method mismatches.
- لا توجد bulk buttons مكسورة.
- pagination/search/filter تعمل مع الباك.
- contact messages تستخدم `new` بدل `pending`.
- audit logs تعرض شكل بيانات الباك الصحيح.
- media upload/update يعمل.
- env موثق.
- build ينجح في الفرونت والباك.
- المشروع جاهز للنشر على Coolify أو أي بيئة Production.

