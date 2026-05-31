# خطة تنفيذ إغلاق الفرونت 100% ومطابقته مع خطة V2 والباك إند النهائي

> هذا الملف موجّه لوكيل الذكاء الاصطناعي / المطوّر المسؤول عن إغلاق الفرونت.  
> الهدف ليس تحسين شكلي فقط، بل جعل الفرونت مطابقًا بالكامل لخطة المشروع ومتكاملًا مع الباك إند النهائي بدون ترقيعات أو Mock APIs أو بنية خاطئة.

---

## 0. الحكم التنفيذي قبل البدء

يجب اعتبار هذه الخطة **إلزامية بالكامل**. لا توجد أولويات اختيارية، ولا يسمح بترك أي بند “لاحقًا” باستثناء الاختبارات الآلية إن لم يطلبها صاحب المشروع الآن.

الهدف النهائي:

```txt
Personal Technical Portfolio + Blog + Admin CMS
```

الموقع يجب أن يكون:

- موقعًا شخصيًا تقنيًا لمبرمج / Software Engineer / Full‑Stack Developer.
- مبنيًا على Next.js App Router.
- SEO-first للصفحات العامة والمدونة والمشاريع.
- مرتبطًا بالباك إند الحقيقي فقط.
- يحتوي لوحة إدارة CMS حقيقية وليست JSON editor.
- مطابقًا لعقد API النهائي الموجود في الباك إند.

---

## 1. ملاحظة حاسمة عن حالة الفرونت الحالية

في الملفات التي تم فحصها سابقًا ظهرت حالتان محتملتان:

### الحالة A — المشروع ما زال Vite / React SPA

إذا كان المستودع الحالي يحتوي على:

```txt
vite.config.ts
index.html
src/main.tsx
src/App.tsx
src/pages/**
react-router-dom
VITE_API_URL
```

فهذا يعني أن الفرونت **غير مطابق للخطة** ويجب تحويله إلى Next.js App Router. لا يقبل إبقاء Vite SPA كحل نهائي.

### الحالة B — المشروع صار Next.js لكن يحتوي بقايا Vite

إذا كان المستودع يحتوي على `src/app/**` لكن ما زالت فيه بقايا مثل:

```txt
vite.config.ts
index.html
src/main.tsx
src/App.tsx
src/App.css
src/pages/**
react-router-dom
VITE_*
```

فيجب حذف هذه البقايا نهائيًا وتنظيف المشروع.

### القرار النهائي

بغض النظر عن الحالة الحالية، الناتج النهائي يجب أن يكون:

```txt
Next.js App Router فقط
```

ولا يسمح بوجود أي أثر لـ Vite أو React Router أو Hash Routing أو Express mock server أو بيانات وهمية كبديل عن الباك إند.

---

## 2. تعريف الإغلاق النهائي Definition of Done

لا يعتبر الفرونت مغلقًا إلا إذا تحققت كل الشروط التالية:

```txt
1. المشروع Next.js App Router فقط.
2. لا يوجد Vite ولا React Router ولا Hash Router.
3. لا يوجد Mock API أو Express server داخل الفرونت.
4. كل البيانات الحقيقية تأتي من الباك إند النهائي.
5. public pages تستخدم slug وليس id.
6. admin forms ترسل DTOs مطابقة للباك إند.
7. auth يستخدم HttpOnly cookies ولا يخزن token في localStorage.
8. لوحة الإدارة CMS حقيقية وليست JSON editor.
9. MediaPicker موجود ويستخدم مكتبة الوسائط من الباك إند.
10. المقالات تختار category/tags من الباك إند وترسل ObjectIds.
11. pagination يعتمد على meta القادم من الباك إند.
12. الصفحات العامة لديها metadata ديناميكية مناسبة.
13. الموقع يعكس هوية تقنية لمبرمج بوضوح.
14. npm run typecheck ينجح.
15. npm run build ينجح.
16. npm run lint لا يحتوي errors مانعة.
```

---

## 3. التقنية المعتمدة إجباريًا

يجب اعتماد الحزمة التقنية التالية:

```txt
Next.js App Router
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query للوحة الإدارة
React Hook Form
Zod
HttpOnly Cookies للـ Auth
Server Components للصفحات العامة قدر الإمكان
Route Handlers كـ BFF للـ Auth و Admin Proxy
```

### ممنوع نهائيًا

```txt
Vite
React Router
Hash Router
Express mock server داخل الفرونت
localStorage/sessionStorage لتخزين accessToken أو refreshToken
JSON editor كنموذج إدارة نهائي
hardcoded data في الصفحات الحقيقية
VITE_API_URL أو أي VITE_* env
admin requests مباشرة من المتصفح مع Bearer token مكشوف
```

---

## 4. إعدادات البيئة المطلوبة

أنشئ ملف:

```txt
.env.example
```

بالمحتوى التالي:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

وفي التطوير يستخدم:

```txt
.env.local
```

بنفس القيم أو القيم المناسبة للبيئة.

### قواعد مهمة

- لا تستخدم `VITE_API_URL`.
- لا تستخدم `/api/v1` لأن عقد الباك إند النهائي لا يحتوي `/v1`.
- Base API الصحيح:

```txt
http://localhost:3000/api
```

- SEO files في الباك إند موجودة على:

```txt
http://localhost:3000/sitemap.xml
http://localhost:3000/robots.txt
http://localhost:3000/rss.xml
http://localhost:3000/feed.xml
```

لكن فرونت Next يمكنه أيضًا توليد sitemap/robots إذا كان هو الموقع النهائي العام، بشرط ألا يتعارض مع الباك إند.

---

## 5. تنظيف أو تحويل بنية المشروع

## 5.1 إذا كان المشروع الحالي Vite

نفّذ تحويلًا كاملًا إلى Next.js مع الحفاظ فقط على المكونات المفيدة بصريًا إن أمكن.

احذف أو لا تنقل الملفات التالية:

```txt
index.html
vite.config.ts
src/main.tsx
src/App.tsx
src/App.css
src/pages/**
react-router-dom usage
react-helmet-async usage
VITE_* env usage
```

واستبدل `package.json` ليستخدم Next.js scripts:

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

> إذا كانت نسخة Next.js الحديثة لا تدعم `next lint` بالشكل المطلوب، استخدم ESLint config مناسبًا مع script بديل، لكن يجب أن يكون هناك أمر lint واضح وموثق.

## 5.2 إذا كان المشروع Next.js مع بقايا Vite

احذف نهائيًا:

```txt
index.html
vite.config.ts
src/main.tsx
src/App.tsx
src/App.css
src/pages/**
info.md إن كان ملفًا قديمًا لا يخدم المشروع
react-router-dom من package.json
@vitejs/plugin-react من devDependencies
vite من devDependencies
react-helmet-async إن لم يعد مستخدمًا
```

ثم تأكد أن `tsconfig.json` لا يلتقط ملفات قديمة محذوفة أو غير مستخدمة.

---

## 6. البنية النهائية المطلوبة للمشروع

اعتمد الهيكل التالي:

```txt
src/
  app/
    layout.tsx
    globals.css
    not-found.tsx
    sitemap.ts
    robots.ts
    manifest.ts
    opengraph-image.tsx

    (site)/
      layout.tsx
      page.tsx
      about/page.tsx
      projects/page.tsx
      projects/[slug]/page.tsx
      services/page.tsx
      services/[slug]/page.tsx
      technologies/page.tsx
      technologies/[slug]/page.tsx
      blog/page.tsx
      blog/[slug]/page.tsx
      blog/category/[slug]/page.tsx
      blog/tag/[slug]/page.tsx
      faqs/page.tsx
      links/page.tsx
      contact/page.tsx

    (admin)/
      admin/login/page.tsx
      admin/(protected)/layout.tsx
      admin/(protected)/dashboard/page.tsx
      admin/(protected)/profile/page.tsx
      admin/(protected)/projects/page.tsx
      admin/(protected)/projects/new/page.tsx
      admin/(protected)/projects/[id]/edit/page.tsx
      admin/(protected)/blog/posts/page.tsx
      admin/(protected)/blog/posts/new/page.tsx
      admin/(protected)/blog/posts/[id]/edit/page.tsx
      admin/(protected)/blog/categories/page.tsx
      admin/(protected)/blog/tags/page.tsx
      admin/(protected)/services/page.tsx
      admin/(protected)/services/new/page.tsx
      admin/(protected)/services/[id]/edit/page.tsx
      admin/(protected)/technologies/page.tsx
      admin/(protected)/links/page.tsx
      admin/(protected)/faqs/page.tsx
      admin/(protected)/media/page.tsx
      admin/(protected)/messages/page.tsx
      admin/(protected)/audit-logs/page.tsx

    api/
      auth/login/route.ts
      auth/refresh/route.ts
      auth/logout/route.ts
      auth/me/route.ts
      admin-proxy/[[...path]]/route.ts
      rss/route.ts إن احتجنا RSS من الفرونت

  components/
    site/
    admin/
    forms/
    media/
    seo/
    technical/
    ui/

  lib/
    api/
      public-client.ts
      admin-client.ts
      server-fetch.ts
      types.ts
      errors.ts
    auth/
      session.ts
      cookies.ts
    seo/
      metadata.ts
      structured-data.ts
    utils.ts

  schemas/
    project.schema.ts
    post.schema.ts
    category.schema.ts
    tag.schema.ts
    service.schema.ts
    technology.schema.ts
    link.schema.ts
    faq.schema.ts
    profile.schema.ts
    contact.schema.ts

  types/
    api.ts
    backend.ts
```

---

## 7. عقد الباك إند الذي يجب الالتزام به

Base URL:

```txt
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

شكل الرد العام:

```ts
{
  success: boolean;
  statusCode: number;
  message: string;
  data?: unknown;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  errors?: { field: string; message: string }[];
  timestamp: string;
  path: string;
}
```

يجب أن تتعامل كل طبقة API مع:

- `success`.
- `data`.
- `meta`.
- `errors`.
- رسائل الخطأ من `400`, `401`, `403`, `404`, `409`, `500`.

### ممنوع

لا تفترض أن القائمة ترجع array مباشرة. دائمًا افحص wrapper.

---

## 8. Auth المطلوب مطابقته

الباك إند يوفر:

```txt
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/change-password
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

الباك إند يتوقع في admin routes:

```txt
Authorization: Bearer <accessToken>
```

لكن الفرونت لا يجب أن يكشف التوكن للمتصفح. المطلوب:

## 8.1 Route Handlers في Next

أنشئ/ثبّت:

```txt
src/app/api/auth/login/route.ts
src/app/api/auth/refresh/route.ts
src/app/api/auth/logout/route.ts
src/app/api/auth/me/route.ts
```

### login

- يستقبل email/password من client.
- يرسلها للباك إند `/api/auth/login`.
- يأخذ `accessToken` و `refreshToken` من الرد.
- يخزنهما في HttpOnly cookies.
- لا يرجع التوكنات للمتصفح.
- يرجع فقط user/session safe data.

### refresh

- يقرأ `refreshToken` من HttpOnly cookie.
- يرسل:

```json
{
  "refreshToken": "..."
}
```

إلى:

```txt
POST /api/auth/refresh
```

- يحدّث cookies بالتوكنات الجديدة.

### logout

يجب ألا يمسح الكوكيز فقط.

يجب أن:

- يقرأ `refreshToken` من cookie.
- يرسل إلى الباك إند:

```txt
POST /api/auth/logout
```

مع body:

```json
{
  "refreshToken": "..."
}
```

- بعدها يمسح cookies محليًا.

## 8.2 Admin Proxy

يجب وجود:

```txt
src/app/api/admin-proxy/[[...path]]/route.ts
```

وظيفته:

- يستقبل طلبات لوحة الإدارة.
- يقرأ accessToken من HttpOnly cookie.
- يرسل الطلب للباك إند مع:

```txt
Authorization: Bearer <accessToken>
```

- إذا رجع `401` يحاول مرة واحدة refresh باستخدام refreshToken.
- يعيد الطلب الأصلي مرة واحدة بعد refresh.
- إذا فشل refresh يمسح cookies ويرجع 401 للفرونت.

### مهم

يجب أن يدعم proxy:

```txt
GET
POST
PATCH
PUT
DELETE
multipart/form-data
application/json
query params
```

---

## 9. طبقة Public API

أنشئ client server-friendly للصفحات العامة:

```txt
src/lib/api/public-client.ts
```

يستخدم `fetch` من السيرفر قدر الإمكان.

Endpoints العامة المطلوبة:

```txt
GET /api/public/profile
GET /api/public/projects?page=1&limit=10
GET /api/public/projects/:slug
GET /api/public/blog/posts?page=1&limit=10&categorySlug=...&tagSlug=...
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
GET /api/public/faqs?page=1&limit=10&category=general&featured=true
GET /api/public/faqs/:id
POST /api/public/contact
```

### قواعد مهمة

- صفحات public detail تستخدم `slug` فقط.
- blog filters العامة تستخدم `categorySlug` و `tagSlug`.
- لا تستخدم ObjectId في public URL.
- إذا رجع `meta.total = 0` اعرض empty state محترم.

---

## 10. DTOs والحقول المطابقة للباك إند

يجب بناء TypeScript types و Zod schemas مطابقة لهذه الحقول.

## 10.1 Projects

Admin create/update يجب أن يرسل:

```ts
type ProjectPayload = {
  title: string;
  slug?: string;
  shortDescription: string;
  detailedDescription: string;
  images?: string[];
  coverImage?: string;
  gallery?: string[];
  technologies?: string[];
  liveUrl?: string;
  githubUrl?: string;
  completionDate?: string;
  status?: 'planned' | 'in_progress' | 'completed' | string;
  category: string;
  order?: number;
  isPublished?: boolean;
  featured?: boolean;
  isArchived?: boolean;
  caseStudy?: string;
  problem?: string;
  solution?: string;
  results?: string;
  role?: string;
  clientName?: string;
  startDate?: string;
  endDate?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
}
```

### مهم

- لا تستخدم `description` بدل `detailedDescription`.
- المشاريع يجب أن تظهر كـ case studies في public site.

## 10.2 Blog Posts

Admin create/update يجب أن يرسل:

```ts
type PostPayload = {
  title: string;
  summary: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  coverImage?: string;
  category?: string; // Mongo ObjectId
  tags?: string[];   // Mongo ObjectIds
  publishDate?: string;
  scheduledAt?: string;
  status?: 'draft' | 'published' | 'scheduled' | 'archived' | string;
  readTime?: number;
  isFeatured?: boolean;
  allowIndexing?: boolean;
  canonicalUrl?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
}
```

### مهم جدًا

- لا ترسل `category` كـ slug في admin.
- لا ترسل `tags` كـ slugs في admin.
- يجب جلب categories/tags من الباك إند واختيارها من Select/MultiSelect، ثم إرسال ObjectIds.
- لا ترسل `readTime` كنص.
- لا تسمح للمستخدم بإدخال HTML خطير بدون تنبيه/معاينة آمنة.

## 10.3 Categories

```ts
type CategoryPayload = {
  name: string;
  description?: string;
  isActive?: boolean;
}
```

لا ترسل `slug` لأن الباك إند يولده.

## 10.4 Tags

```ts
type TagPayload = {
  name: string;
  isActive?: boolean;
}
```

لا ترسل `slug` لأن الباك إند يولده.

## 10.5 Services

```ts
type ServicePayload = {
  name: string;
  slug?: string;
  shortDescription: string;
  detailedDescription?: string;
  icon?: string;
  startingPrice?: number;
  currency?: string;
  price?: string;
  duration?: string;
  deliverables?: string[];
  requirements?: string[];
  ctaText?: string;
  ctaUrl?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  order?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
}
```

### مهم

- استخدم `isFeatured` وليس `featured`.

## 10.6 Technologies

```ts
type TechnologyPayload = {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category?: string;
  group?: string;
  officialUrl?: string;
  yearsOfExperience?: number;
  highlighted?: boolean;
  isPublished?: boolean;
  color?: string;
  order?: number;
}
```

### مهم

- استخدم `highlighted` وليس `featured`.
- `proficiencyLevel` enum وليس رقمًا.

## 10.7 Links

```ts
type LinkPayload = {
  title: string;
  slug?: string;
  url: string;
  description?: string;
  icon?: string;
  platform?: string;
  category?: string;
  openInNewTab?: boolean;
  isFeatured?: boolean;
  order?: number;
  isPublished?: boolean;
}
```

### مهم

- استخدم `isFeatured` وليس `featured`.

## 10.8 FAQs

```ts
type FaqPayload = {
  question: string;
  answer: string;
  category?: string;
  order?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}
```

Endpoints إدارية مطلوبة:

```txt
GET /api/admin/faqs
POST /api/admin/faqs
PATCH /api/admin/faqs/:id
PUT /api/admin/faqs/:id
DELETE /api/admin/faqs/:id
PATCH /api/admin/faqs/:id/publish
PATCH /api/admin/faqs/:id/unpublish
PATCH /api/admin/faqs/reorder
```

Reorder body:

```ts
{
  items: { id: string; order: number }[]
}
```

## 10.9 Profile

```ts
type ProfilePayload = {
  fullName?: string;
  title?: string;
  headline?: string;
  bio?: string;
  about?: string;
  profileImage?: string;
  profileImageAlt?: string;
  cvFile?: string;
  email?: string;
  phone?: string;
  location?: string;
  availableForWork?: boolean;
  socialLinks?: {
    platform: string;
    url: string;
    icon?: string;
    order?: number;
  }[];
  yearsOfExperience?: number;
  certificates?: {
    title: string;
    issuer?: string;
    date?: string;
    url?: string;
  }[];
  languages?: {
    name: string;
    level?: string;
  }[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
}
```

## 10.10 Contact

Public contact payload:

```ts
type ContactPayload = {
  website?: string; // honeypot يجب أن يبقى مخفيًا وفارغًا للمستخدمين الحقيقيين
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  turnstileToken?: string;
}
```

Admin status update:

```ts
type ContactStatusPayload = {
  status: 'new' | 'read' | 'replied' | 'archived' | string;
  notes?: string;
}
```

---

## 11. لوحة الإدارة CMS — المطلوب النهائي

لوحة الإدارة يجب أن تكون CMS حقيقية وليست JSON editor.

## 11.1 قواعد عامة لكل صفحات الإدارة

كل صفحة list يجب أن تحتوي:

```txt
- عنوان واضح
- وصف قصير
- بحث إن كان منطقيًا
- فلاتر حسب حالة النشر/التصنيف/النوع
- جدول أو cards مناسبة
- pagination يعتمد على meta
- loading state
- empty state
- error state
- create/edit/delete actions
- confirm dialog للحذف
- toast للنجاح/الفشل
```

كل صفحة form يجب أن تحتوي:

```txt
- React Hook Form
- Zod validation
- رسائل خطأ واضحة
- حفظ draft/published حسب المورد
- MediaPicker للصور والملفات
- SEO section منفصل
- Preview section عند الحاجة
- منع إرسال حقول غير موجودة في DTO
```

## 11.2 Dashboard

المطلوب:

```txt
/admin/dashboard
```

يقرأ من:

```txt
GET /api/admin/dashboard
```

ويعرض:

- عدد المشاريع.
- عدد المقالات.
- عدد الرسائل.
- عدد الوسائط.
- أحدث الرسائل.
- أحدث المقالات.
- مؤشرات المحتوى المنشور/المسودات إن كانت متاحة.
- روابط سريعة لإضافة مشروع/مقال/خدمة.

## 11.3 Profile CMS

```txt
/admin/profile
```

يجب أن يكون form متخصصًا للحقول التالية:

- Basic identity.
- Hero headline.
- Bio/About.
- Profile image باستخدام MediaPicker.
- CV file باستخدام MediaPicker.
- Contact info.
- Social links مع icon picker/media.
- Languages.
- Certificates.
- SEO metadata.

## 11.4 Projects CMS

المسارات:

```txt
/admin/projects
/admin/projects/new
/admin/projects/[id]/edit
```

يجب دعم:

- title.
- shortDescription.
- detailedDescription.
- category.
- technologies array.
- coverImage.
- images/gallery.
- liveUrl.
- githubUrl.
- status.
- featured.
- isPublished.
- caseStudy/problem/solution/results.
- role/clientName/startDate/endDate.
- SEO.

### Public presentation

المشاريع في الموقع العام يجب أن تعرض كـ Case Studies:

```txt
Problem → Solution → Tech Stack → Results → Links
```

وليس كروت عادية فقط.

## 11.5 Blog CMS

المسارات:

```txt
/admin/blog/posts
/admin/blog/posts/new
/admin/blog/posts/[id]/edit
/admin/blog/categories
/admin/blog/tags
```

المطلوب للمقالات:

- title.
- summary.
- excerpt.
- content editor.
- featuredImage/coverImage من MediaPicker.
- category Select من `/api/admin/blog/categories` وإرسال ObjectId.
- tags MultiSelect من `/api/admin/blog/tags` وإرسال ObjectIds.
- status: draft/published/scheduled/archived.
- publishDate/scheduledAt.
- readTime number.
- isFeatured.
- allowIndexing.
- canonicalUrl.
- SEO.

### ممنوع

- ممنوع إدخال category slug في admin post payload.
- ممنوع إدخال tags كنصوص عشوائية في payload.
- ممنوع JSON editor.

## 11.6 Categories/Tags CMS

يجب أن تكون صفحات بسيطة لكنها حقيقية:

```txt
/admin/blog/categories
/admin/blog/tags
```

- قائمة.
- إضافة.
- تعديل.
- حذف.
- isActive.
- لا ترسل slug.

## 11.7 Services CMS

```txt
/admin/services
/admin/services/new
/admin/services/[id]/edit
```

يجب دعم:

- name.
- shortDescription.
- detailedDescription.
- icon MediaPicker أو icon input.
- price/startingPrice/currency.
- duration.
- deliverables array editor.
- requirements array editor.
- CTA.
- isFeatured.
- isPublished.
- order.
- SEO.

## 11.8 Technologies CMS

```txt
/admin/technologies
```

يجب دعم:

- name.
- description.
- icon.
- proficiencyLevel enum.
- category.
- group.
- officialUrl.
- yearsOfExperience.
- highlighted.
- isPublished.
- color.
- order.

## 11.9 Links CMS

```txt
/admin/links
```

يجب دعم:

- title.
- url.
- description.
- icon.
- platform.
- category.
- openInNewTab.
- isFeatured.
- order.
- isPublished.

## 11.10 FAQs CMS

```txt
/admin/faqs
```

يجب دعم:

- إضافة/تعديل/حذف FAQ.
- publish/unpublish.
- isFeatured.
- category.
- order.
- reorder UI على الأقل بأسهم up/down أو drag-and-drop.
- استدعاء:

```txt
PATCH /api/admin/faqs/reorder
```

## 11.11 Media CMS

```txt
/admin/media
```

المطلوب:

- رفع ملف عبر:

```txt
POST /api/admin/media/upload
```

multipart:

```txt
file
folder
alt optional
usage optional
```

- يجب أن يرسل `folder` دائمًا، مثل:

```txt
profile
projects
blog
services
technologies
links
faqs
general
```

- عرض media list مع pagination.
- فلتر حسب type/folder إن كان مدعومًا.
- تعديل alt/metadata.
- حذف media مع confirm.
- عرض unused media عبر:

```txt
GET /api/admin/media/unused?olderThanDays=30
```

- تنفيذ cleanup الحقيقي فقط عبر:

```txt
POST /api/admin/media/cleanup-unused
```

body:

```json
{
  "olderThanDays": 30,
  "confirm": true
}
```

### ممنوع

- ممنوع تنفيذ حذف حقيقي عبر GET.
- ممنوع رفع file بدون folder.

## 11.12 Messages CMS

```txt
/admin/messages
```

يجب دعم:

- عرض الرسائل.
- فلترة حسب status.
- قراءة تفاصيل الرسالة.
- تحديث status.
- notes.
- أرشفة.

## 11.13 Audit Logs

```txt
/admin/audit-logs
```

يجب دعم:

- قائمة audit logs.
- pagination.
- فلترة إذا كانت مدعومة.
- عرض actor/action/resource/date.

---

## 12. MediaPicker إلزامي

يجب بناء مكون:

```txt
src/components/media/MediaPicker.tsx
```

يدعم:

```txt
- فتح Dialog/Sheet
- عرض الوسائط من /api/admin/media
- رفع ملف جديد داخل نفس النافذة
- تمرير folder حسب السياق
- اختيار صورة/ملف
- إرجاع URL أو media object حسب حاجة الحقل
- search/filter إن توفر
- loading/error/empty states
```

يجب استخدامه في:

```txt
Profile profileImage
Profile cvFile
Profile socialLinks.icon
Project coverImage
Project images
Project gallery
Project seo.ogImage
Post featuredImage
Post coverImage
Post seo.ogImage
Service icon
Service seo.ogImage
Technology icon
Link icon
```

---

## 13. الصفحات العامة المطلوبة

## 13.1 Site Layout

يجب أن يحتوي:

- Header تقني أنيق.
- Navigation واضح.
- Footer فيه روابط التواصل والتقنيات.
- Responsive mobile menu.
- دعم dark theme كهوية أساسية.

## 13.2 الصفحة الرئيسية `/`

يجب أن تكون تقنية لمبرمج وليست landing عامة.

تحتوي:

```txt
- Hero يوضح الاسم والدور التقني.
- Terminal/code visual.
- ملخص عن الخبرة.
- Featured projects.
- Featured blog posts.
- Tech stack.
- Services/what I build.
- CTA للتواصل أو GitHub.
```

## 13.3 About `/about`

تعرض:

- bio/about من profile.
- yearsOfExperience.
- languages.
- certificates.
- availableForWork.
- social links.
- CV download إن وجد.

## 13.4 Projects `/projects` و `/projects/[slug]`

- list مع pagination/filter إن أمكن.
- detail يعرض case study كامل.
- metadata ديناميكية.
- Open Graph.
- structured data إن أمكن.

## 13.5 Services `/services` و `/services/[slug]`

- عرض الخدمات البرمجية.
- تفاصيل كل خدمة.
- CTA واضح.
- metadata ديناميكية.

## 13.6 Technologies `/technologies` و `/technologies/[slug]`

- عرض التقنيات كمجموعات.
- إبراز highlighted.
- proficiencyLevel بشكل احترافي.
- سنوات الخبرة.

## 13.7 Blog `/blog`

يجب دعم:

- قائمة المقالات.
- pagination.
- categories.
- tags.
- featured posts.
- empty state.
- metadata عامة.

## 13.8 Blog detail `/blog/[slug]`

يجب دعم:

- عنوان.
- summary/excerpt.
- cover image.
- category.
- tags.
- publishDate.
- readTime.
- content renderer آمن.
- Table of contents إن أمكن.
- related posts إن أمكن.
- share links.
- metadata ديناميكية.
- canonical URL.
- allowIndexing handling.
- Article structured data.

## 13.9 Blog category/tag pages

```txt
/blog/category/[slug]
/blog/tag/[slug]
```

تستخدم:

```txt
categorySlug
tagSlug
```

مع public posts endpoint.

## 13.10 FAQs `/faqs`

- تستخدم public FAQ endpoint.
- تعرض published only.
- accordion.
- filter by category إن أمكن.
- FAQ structured data.

## 13.11 Links `/links`

- تعرض الروابط المنشورة.
- عند النقر على رابط، استدعِ:

```txt
POST /api/public/links/:id/click
```

ثم افتح الرابط.

## 13.12 Contact `/contact`

- form مطابق للباك إند.
- honeypot hidden field باسم `website`.
- دعم Turnstile اختياري إن كانت env موجودة.
- success/error states واضحة.

---

## 14. SEO المطلوب

يجب تنفيذ SEO حقيقي وليس Helmet فقط.

## 14.1 ممنوع

- ممنوع الاعتماد على `react-helmet-async` في Next.js.
- ممنوع metadata static لكل الصفحات.

## 14.2 المطلوب

استخدم Next.js Metadata API:

```txt
generateMetadata
metadata
```

لصفحات:

```txt
/
/about
/projects
/projects/[slug]
/services
/services/[slug]
/technologies
/technologies/[slug]
/blog
/blog/[slug]
/blog/category/[slug]
/blog/tag/[slug]
/faqs
/contact
/links
```

## 14.3 Metadata detail

لكل صفحة detail استخدم:

```txt
title
metaDescription
canonical
openGraph.title
openGraph.description
openGraph.images
twitter.card
twitter.title
twitter.description
robots index/noindex حسب allowIndexing للمقالات
```

## 14.4 Structured Data

أضف JSON-LD حيث مناسب:

```txt
Person للصفحة الرئيسية/About
BlogPosting للمقال
CreativeWork/SoftwareSourceCode أو Project للمشاريع إن مناسب
FAQPage للأسئلة الشائعة
BreadcrumbList لصفحات التفاصيل
```

---

## 15. الهوية التقنية والتصميم

الموقع يجب أن يبدو كموقع مبرمج محترف، لا قالب عام.

## 15.1 عناصر مطلوبة بصريًا

استخدم بشكل متوازن:

```txt
Terminal card
Code preview card
Tech badges
Subtle grid/dots background
Case study layout
GitHub/live demo actions
Command palette style touches إن مناسب
Micro-interactions خفيفة
```

## 15.2 ممنوع

- تصميم corporate عام.
- hero بلا هوية تقنية.
- مشاريع كصور فقط بدون problem/solution/results.
- مدونة كقائمة عادية بلا تجربة قراءة.
- ألوان كثيرة وغير منضبطة.

## 15.3 شرط قبول الهوية

لا يقبل الموقع إذا كان يمكن تغيير اسم صاحب الموقع فقط ويصبح مناسبًا لأي شخص غير مبرمج.

يجب أن تظهر الهوية التقنية في:

```txt
النصوص
Hero
المشاريع
المدونة
التقنيات
الخدمات
SEO titles/descriptions
```

---

## 16. إدارة الأخطاء وتجربة المستخدم

كل API operation يجب أن يعالج:

```txt
loading
success
validation errors
unauthorized
forbidden
not found
conflict duplicate slug
server error
empty state
```

## 16.1 Validation errors

إذا رجع الباك إند:

```ts
errors?: { field: string; message: string }[]
```

يجب ربط الأخطاء بالحقول في form إن أمكن.

## 16.2 Conflict 409

عند duplicate slug/title يجب عرض رسالة واضحة مثل:

```txt
هذا الرابط أو الاسم مستخدم مسبقًا.
```

لا تعرض رسالة عامة فقط.

---

## 17. TanStack Query للوحة الإدارة

يجب استخدام TanStack Query في صفحات الإدارة فقط أو حيث يفيد.

المطلوب:

```txt
query keys منظمة لكل مورد
invalidate بعد create/update/delete
optimistic UI فقط إذا آمن
retry مضبوط ولا يكرر عمليات write
```

أمثلة query keys:

```ts
['admin', 'projects', filters]
['admin', 'posts', filters]
['admin', 'media', filters]
['admin', 'faqs', filters]
['admin', 'dashboard']
```

---

## 18. الحماية والتنقل في لوحة الإدارة

## 18.1 Protected layout

```txt
src/app/(admin)/admin/(protected)/layout.tsx
```

يجب أن:

- يتحقق من session عبر route handler أو server function.
- يمنع الوصول عند عدم تسجيل الدخول.
- يعمل redirect إلى `/admin/login`.

## 18.2 Roles

الباك إند يدعم admin/editor.

الفرونت يجب أن:

- يعرض الصفحات حسب صلاحيات المستخدم إن كانت معلومات الدور متاحة.
- لا يعتمد على الحماية الفرونتية فقط؛ الحماية الأساسية من الباك إند.

## 18.3 Admin navigation

يجب أن يحتوي:

```txt
Dashboard
Profile
Projects
Blog Posts
Categories
Tags
Services
Technologies
Links
FAQs
Media
Messages
Audit Logs
Logout
```

---

## 19. توافق الروابط والمسارات

الموقع العام:

```txt
/
/about
/projects
/projects/:slug
/services
/services/:slug
/technologies
/technologies/:slug
/blog
/blog/:slug
/blog/category/:slug
/blog/tag/:slug
/faqs
/links
/contact
```

لوحة الإدارة:

```txt
/admin/login
/admin/dashboard
/admin/profile
/admin/projects
/admin/projects/new
/admin/projects/:id/edit
/admin/blog/posts
/admin/blog/posts/new
/admin/blog/posts/:id/edit
/admin/blog/categories
/admin/blog/tags
/admin/services
/admin/services/new
/admin/services/:id/edit
/admin/technologies
/admin/links
/admin/faqs
/admin/media
/admin/messages
/admin/audit-logs
```

### ممنوع

- hash routing مثل `/#/blog`.
- public details بـ id بدل slug.
- admin edit بالـ slug إذا كان الباك إند يحتاج id للإدارة.

---

## 20. README والتوثيق المطلوب

حدّث README بحيث يحتوي:

```txt
- وصف المشروع كموقع تقني لمبرمج + CMS
- المتطلبات
- طريقة تثبيت
- env setup
- dev commands
- build commands
- backend dependency
- قائمة المسارات
- ملاحظات Auth HttpOnly cookies
- عدم وجود Mock API
```

أضف قسم واضح:

```txt
This frontend expects the finalized backend API contract without /v1 prefix.
```

---

## 21. package.json النهائي

يجب أن يخلو من:

```txt
vite
@vitejs/plugin-react
react-router
react-router-dom
react-helmet-async إن لم يستخدم نهائيًا
```

ويحتوي على ما يلزم فقط.

مثال scripts مطلوب:

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 22. أوامر القبول قبل التسليم

يجب تشغيل الأوامر التالية وإصلاح أي خطأ:

```bash
npm install
npm run typecheck
npm run build
npm run lint
```

### القبول

- `typecheck` يجب أن ينجح بدون errors.
- `build` يجب أن ينجح.
- `lint` يجب ألا يحتوي errors مانعة.
- لا يلزم كتابة tests الآن إلا إذا طلب صاحب المشروع ذلك لاحقًا.

---

## 23. فحص يدوي إلزامي بعد التنفيذ

بعد التشغيل محليًا، افحص يدويًا:

## 23.1 الموقع العام

```txt
/ يفتح بدون أخطاء
/about يعرض profile
/projects يعرض المشاريع
/projects/[slug] يعرض تفاصيل case study
/blog يعرض المقالات مع pagination
/blog/[slug] يعرض المقال ومحتواه
/blog/category/[slug] يعمل
/blog/tag/[slug] يعمل
/services يعمل
/technologies يعمل
/faqs يعمل
/links يعمل ويسجل click
/contact يرسل رسالة
صفحة 404 تعمل
```

## 23.2 لوحة الإدارة

```txt
/admin/login يسجل الدخول
/admin/dashboard يجلب بيانات
/admin/profile يعدل البروفايل
/admin/projects ينشئ ويعدل مشروع
/admin/blog/posts ينشئ ويعدل مقال مع category/tags IDs
/admin/blog/categories يعمل
/admin/blog/tags يعمل
/admin/services يعمل
/admin/technologies يعمل
/admin/links يعمل
/admin/faqs publish/unpublish/reorder يعمل
/admin/media upload مع folder يعمل
/admin/media unused preview يعمل
/admin/media cleanup POST يعمل فقط مع confirm
/admin/messages status update يعمل
/admin/audit-logs يعرض السجلات
logout يرسل refreshToken للباك إند ثم يمسح cookies
```

---

## 24. قائمة أخطاء يجب التأكد أنها غير موجودة

قبل التسليم تأكد من عدم وجود:

```txt
VITE_API_URL
VITE_SITE_URL
vite.config.ts
index.html كمدخل Vite
src/main.tsx
src/App.tsx
src/pages القديم
react-router-dom imports
react-helmet-async imports
localStorage access_token
sessionStorage access_token
Express server mock
server.ts mock API
JSON editor كبديل عن forms
category slug في admin post payload
tags slugs في admin post payload
media upload بدون folder
GET يحذف media cleanup فعليًا
أي endpoint يحتوي /api/v1
```

---

## 25. تسلسل التنفيذ المقترح للوكيل

نفّذ بالترتيب التالي، ولا تنتقل للخطوة التالية إذا السابقة مكسورة:

```txt
1. تنظيف/تحويل المشروع إلى Next.js App Router فقط.
2. ضبط package.json و env و tsconfig.
3. بناء API clients و response wrapper handling.
4. بناء auth route handlers و admin proxy مع refresh retry.
5. بناء types و Zod schemas المطابقة للباك إند.
6. بناء site layout والصفحات العامة.
7. بناء SEO metadata و structured data.
8. بناء admin layout والحماية.
9. بناء MediaPicker.
10. بناء CMS forms لكل مورد بدل JSON editor.
11. إكمال FAQ/media/messages/audit logs.
12. تنظيف dependencies والملفات الميتة.
13. تشغيل typecheck/build/lint.
14. تنفيذ الفحص اليدوي.
15. تحديث README.
```

---

## 26. مخرجات التسليم المطلوبة

عند انتهاء التنفيذ يجب تسليم:

```txt
1. مشروع Next.js نظيف.
2. .env.example صحيح.
3. README محدث.
4. لا توجد بقايا Vite/React Router.
5. لا توجد Mock APIs.
6. كل صفحات الموقع العام تعمل.
7. كل صفحات لوحة الإدارة الأساسية تعمل.
8. build/typecheck/lint ناجحة.
9. تقرير مختصر يوضح الملفات الكبرى التي تم تعديلها.
10. قائمة بأي شيء لم يستطع الوكيل تنفيذه بصراحة، ولا يسمح بإخفاء النواقص.
```

---

## 27. الحكم النهائي المطلوب بعد تنفيذ هذه الخطة

بعد تنفيذ هذا الملف يجب أن يصبح الفرونت:

```txt
متوافقًا مع الخطة: 100%
متوافقًا مع الباك إند: 100%
مناسبًا لهوية مبرمج تقنية: 100%
جاهزًا للانتقال إلى مرحلة الاختبار والتحسين النهائي
```

ولا يقبل التسليم إذا بقيت أي بقايا من Vite/React Router أو بقيت لوحة الإدارة تعتمد JSON editor أو بقيت أي عملية create/update ترسل حقولًا مخالفة لعقد الباك إند.
