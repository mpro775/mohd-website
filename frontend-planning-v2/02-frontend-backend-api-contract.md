# عقد التكامل بين الفرونت والباك إند

> الهدف: تثبيت طريقة تعامل الفرونت مع الباك إند حتى لا يتم بناء واجهة على افتراضات خاطئة. هذا الملف يُستخدم كمرجع إلزامي لوكيل التنفيذ عند بناء API client والصفحات.


---

## 0) افتراض إغلاق الباك إند

هذا العقد يعتمد على النسخة النهائية من الباك إند بعد إغلاق إصلاحات ما قبل الفرونت. يجب عدم دعم شكلين مختلفين للردود أو بناء compatibility layer للعيوب القديمة.

الفرونت يعتمد إلزاميًا على:

- وجود `meta` عند كل paginated list.
- استخدام `slug` في صفحات وتفاصيل الموقع العام.
- استخدام `id` في لوحة الإدارة.
- أن المقالات المجدولة لا تظهر في public إلا بعد نشرها فعليًا.
- أن duplicate slug يرجع `409 Conflict` مفهوم.
- أن الحقول الخاصة بالـ SEO والوسائط مستقرة.

إذا خالف الباك إند هذا العقد، يجب فتح إصلاح في الباك إند، لا إضافة ترقيع داخل الفرونت.

---

## 1) معلومات عامة

- Base URL من env:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_SITE_URL=https://your-site-domain.com
```

- كل مسارات الباك إند تحت `/api`.
- public endpoints لا تحتاج token.
- admin endpoints تحتاج access token.
- الردود يجب أن تكون بعد إغلاق الباك إند بالشكل التالي:

```ts
export type ApiResponse<T, M = unknown> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: M;
  errors?: ApiFieldError[] | unknown[];
  timestamp: string;
  path: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
```

---

## 2) قاعدة API Client إلزامية

يجب بناء API client واحد لاستخدامه في كل المشروع.

### المطلوب من `lib/api/client.ts`

1. يقرأ `NEXT_PUBLIC_API_URL`.
2. يرسل JSON افتراضيًا.
3. يدعم upload بـ FormData.
4. يلتقط أخطاء الباك إند ويرمي `ApiError` موحد.
5. لا يرجع response raw للصفحات؛ يرجع `data` و `meta` بشكل واضح.
6. يدعم request من server components للـ public endpoints.
7. يدعم request من admin client components عبر BFF/cookies أو auth wrapper.

### ApiError

```ts
export class ApiError extends Error {
  statusCode: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;
  raw?: unknown;
}
```

---

## 3) Auth Contract

### Endpoints

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /auth/me`
- `POST /auth/change-password`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### قرار التخزين النهائي

ممنوع تخزين refresh token في `localStorage`.

التنفيذ المفضل:

1. صفحة login ترسل البيانات إلى Next.js route handler:

```txt
POST /api/auth/login
```

2. Route handler يستدعي الباك إند:

```txt
POST {BACKEND_URL}/auth/login
```

3. يخزن:
   - access token في HttpOnly cookie قصير العمر أو session cookie.
   - refresh token في HttpOnly secure cookie.

4. كل admin request إما:
   - يمر عبر route handler يضيف Authorization header، أو
   - يستخدم server action/server fetch يقرأ cookie.

إذا تم استخدام client-side fetch مباشرة للباك إند، يجب ألا يتم تعريض refresh token إطلاقًا.

---

## 4) Public API Usage

### Profile

```txt
GET /public/profile
```

استخدامه في:

- home.
- about.
- layout/footer.
- SEO defaults.
- contact page.

الحقول المهمة:

```ts
type Profile = {
  fullName: string;
  title: string;
  headline?: string;
  bio: string;
  about?: string;
  profileImage?: string;
  profileImageAlt?: string;
  cvFile?: string;
  email: string;
  phone?: string;
  location?: string;
  availableForWork: boolean;
  socialLinks: { platform: string; url: string; icon?: string; order?: number }[];
  languages: { name: string; level?: string }[];
  yearsOfExperience?: number;
  certificates: { title: string; issuer?: string; date?: string; url?: string }[];
  seo?: SeoFields;
};
```

### Projects

```txt
GET /public/projects?page=&limit=&search=&category=&technology=&sortBy=&sortOrder=
GET /public/projects/:slug
```

استخدامه في:

- home featured projects.
- projects listing.
- project details.
- sitemap.

ملاحظات:

- public details تستخدم `slug` فقط.
- listing يجب أن يعتمد `meta` للـ pagination.
- لا تعرض archived/unpublished لأنها لا ترجع من public أصلًا.

### Blog Posts

```txt
GET /public/blog/posts?page=&limit=&search=&category=&tag=&sortBy=&sortOrder=
GET /public/blog/posts/:slug
```

استخدامه في:

- home latest posts.
- blog listing.
- category/tag pages.
- post details.
- sitemap.
- RSS.

ملاحظات:

- public filters يجب أن تعتمد slug بعد إصلاح الباك إند.
- يجب احترام `allowIndexing` في metadata.

### Blog Categories

```txt
GET /public/blog/categories
GET /public/blog/categories/:slug
```

استخدامه في:

- blog filters.
- category page metadata.
- navigation إن احتجنا.

### Blog Tags

```txt
GET /public/blog/tags
GET /public/blog/tags/:slug
```

استخدامه في:

- blog filters.
- post details.
- tag pages.

### Services

```txt
GET /public/services
GET /public/services/:id
```

ملاحظة:

الباك إند الحالي يستخدم public service detail by `id` وليس slug. لذلك لا تبنِ route عام لتفاصيل الخدمة بالـ slug إلا إذا تم تعديل الباك إند. في الإصدار الأول تكفي صفحة `/services`.

### Technologies

```txt
GET /public/technologies?category=
GET /public/technologies/:id
```

استخدامه في:

- home.
- about.
- technology section.

### Links

```txt
GET /public/links?category=
GET /public/links/:id
POST /public/links/:id/click
```

استخدامه في:

- footer/social.
- links page.
- click tracking.

### Contact

```txt
POST /public/contact
```

Payload:

```ts
type ContactPayload = {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};
```

---

## 5) Admin API Usage

كل admin endpoint يحتاج auth.

### Dashboard

```txt
GET /admin/dashboard
GET /admin/dashboard/stats
```

### Profile

```txt
GET /admin/profile
PUT /admin/profile
```

### Projects

```txt
GET /admin/projects?page=&limit=&search=&category=&technology=&status=&isPublished=
GET /admin/projects/:id
POST /admin/projects
PUT /admin/projects/:id
PATCH /admin/projects/:id/publish
PATCH /admin/projects/:id/unpublish
PATCH /admin/projects/reorder
PATCH /admin/projects/:id/archive
DELETE /admin/projects/:id
```

### Blog Posts

```txt
GET /admin/blog/posts?page=&limit=&search=&category=&tag=&status=
GET /admin/blog/posts/:id
POST /admin/blog/posts
PUT /admin/blog/posts/:id
PATCH /admin/blog/posts/:id/publish
PATCH /admin/blog/posts/:id/unpublish
PATCH /admin/blog/posts/:id/archive
PATCH /admin/blog/posts/:id/schedule
DELETE /admin/blog/posts/:id
```

### Categories/Tags

```txt
GET /admin/blog/categories
GET /admin/blog/categories/:id
POST /admin/blog/categories
PUT /admin/blog/categories/:id
PATCH /admin/blog/categories/:id/activate
PATCH /admin/blog/categories/:id/deactivate
DELETE /admin/blog/categories/:id

GET /admin/blog/tags
GET /admin/blog/tags/:id
POST /admin/blog/tags
PUT /admin/blog/tags/:id
PATCH /admin/blog/tags/:id/activate
PATCH /admin/blog/tags/:id/deactivate
DELETE /admin/blog/tags/:id
```

### Services

```txt
GET /admin/services
GET /admin/services/:id
POST /admin/services
PUT /admin/services/:id
PATCH /admin/services/:id/publish
PATCH /admin/services/:id/unpublish
PATCH /admin/services/reorder
DELETE /admin/services/:id
```

### Technologies

```txt
GET /admin/technologies?category=
GET /admin/technologies/:id
POST /admin/technologies
PUT /admin/technologies/:id
PATCH /admin/technologies/:id/publish
PATCH /admin/technologies/:id/unpublish
PATCH /admin/technologies/reorder
DELETE /admin/technologies/:id
```

### Links

```txt
GET /admin/links?category=
GET /admin/links/:id
POST /admin/links
PUT /admin/links/:id
PATCH /admin/links/:id/publish
PATCH /admin/links/:id/unpublish
PATCH /admin/links/reorder
DELETE /admin/links/:id
```

### Media

```txt
POST /admin/media/upload
GET /admin/media?page=&limit=&folder=&type=&mimeType=&isUsed=
GET /admin/media/:id
PATCH /admin/media/:id
DELETE /admin/media/:id
```

Upload field name:

```txt
file
```

### Contact Messages

```txt
GET /admin/contact/messages?page=&limit=&status=
GET /admin/contact/messages/:id
PATCH /admin/contact/messages/:id/status
DELETE /admin/contact/messages/:id
```

### Audit Logs

```txt
GET /admin/audit-logs?page=&limit=&action=&resource=&actor=
GET /admin/audit-logs/:id
```

---

## 6) Pagination Contract

كل list endpoint فيه pagination يجب التعامل معه هكذا:

```ts
type Paginated<T> = {
  items: T[];
  meta: PaginationMeta;
};
```

يمنع في الفرونت:

- حساب totalPages يدويًا إذا كان `meta.totalPages` موجودًا.
- تجاهل `hasNextPage` و `hasPrevPage`.
- بناء pagination على طول المصفوفة فقط.

---

## 7) SEO Contract

### SeoFields

```ts
type SeoFields = {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
};
```

### قواعد العنوان

- إذا وجد `seo.metaTitle` استخدمه.
- إن لم يوجد، استخدم title/name + site name.

### قواعد الوصف

- إذا وجد `seo.metaDescription` استخدمه.
- إن لم يوجد، استخدم summary/shortDescription/bio.

### قواعد الصورة

- إذا وجد `seo.ogImage` استخدمه.
- إن لم يوجد، استخدم coverImage/featuredImage/profileImage.
- إن لم يوجد، استخدم generated OG image.

---

## 8) Image Contract

- كل صورة لها `alt` meaningful.
- profileImage يستخدم `profileImageAlt` إن وجد.
- project cover يستخدم title كـ fallback alt.
- post cover يستخدم title كـ fallback alt.
- media picker في الإدارة يجب أن يعرض alt والاسم والحجم والنوع.

---

## 9) Validation Contract

يجب تعريف Zod schemas مطابقة للباك إند لكل forms:

- Login.
- Contact.
- Profile.
- Project.
- Post.
- Category.
- Tag.
- Service.
- Technology.
- Link.
- Media metadata.
- Contact status update.

أي خطأ backend `fieldErrors` يجب تحويله إلى form errors.

---

## 10) Error Handling Contract

### Public site

- 404 عند عدم وجود slug.
- Error page لطيف عند فشل الشبكة.
- لا تعرض stack trace.
- لا تعرض JSON raw.

### Admin

- Toast للأخطاء العامة.
- Form field errors للحقول.
- Unauthorized يعيد إلى `/admin/login`.
- Forbidden يعرض صفحة صلاحية غير كافية.
- Duplicate slug يعرض رسالة واضحة قرب حقل slug/title.

---

## 11) Cache/Revalidation Contract

### Public

- profile: revalidate 5-15 minutes.
- projects listing: revalidate 1-5 minutes.
- project details: revalidate 5-15 minutes.
- blog listing: revalidate 1-5 minutes.
- post details: revalidate 5-15 minutes.
- categories/tags: revalidate 10-30 minutes.

### Admin

- لا تعتمد ISR.
- استخدم TanStack Query.
- invalidate queries بعد create/update/delete/publish/reorder.

---

## 12) ممنوعات تكامل

- ممنوع استخدام mock data داخل routes النهائية.
- ممنوع بناء public details بالـ id للمشاريع أو المقالات.
- ممنوع تجاهل `allowIndexing` للمقالات.
- ممنوع تجاهل `meta` في pagination.
- ممنوع تخزين refresh token في localStorage.
- ممنوع استخدام admin APIs في الصفحات العامة.
- ممنوع جعل كل صفحات الموقع Client Components.
