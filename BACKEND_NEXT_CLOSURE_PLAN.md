# خطة إغلاق المرحلة التالية للباك إند

**اسم الملف:** `BACKEND_NEXT_CLOSURE_PLAN.md`  
**نوع المشروع:** Backend لبورتفوليو/موقع مطوّر شخصي واحد  
**نطاق هذه المرحلة:** إغلاق Media + فصل Public/Admin + إكمال Content/Services/Technologies/Links + تفعيل Audit Logs  
**خارج نطاق هذه المرحلة:** الاختبارات، CI، Swagger Documentation، Multi-tenancy، Billing، Local Storage.

---

## 1. الهدف من هذه المرحلة

نريد إغلاقاً نهائياً وظيفياً لهذه النطاقات فقط:

1. Media Module باعتماد Cloudflare R2 فقط، بدون أي تخزين محلي أو fallback.
2. فصل كامل بين كل ما هو إداري وكل ما هو عام.
3. إكمال Content Models و Services و Technologies و Links حسب الحقول والقواعد المحددة.
4. تفعيل Audit Logs فعلياً داخل العمليات المهمة.

> ملاحظة مهمة: لا يعني إغلاق هذه المرحلة أن الباك إند كله أصبح Production-ready بنسبة 100%، لأن الاختبارات وCI وSwagger خارج نطاق هذه المرحلة حالياً. المقصود هنا هو إغلاق هذه النطاقات الأربعة وظيفياً وبنيوياً بنسبة 100%.

---

## 2. ممنوعات هذه المرحلة

لا تنفذ حالياً:

- Unit Tests
- E2E Tests
- CI / GitHub Actions
- Swagger decorators
- API Documentation التفصيلية
- Multi-tenancy
- Billing
- Team Management
- Complex RBAC
- Local Upload Storage
- أي fallback محلي للملفات

---

# المرحلة الأولى: إغلاق Media Module باعتماد R2 فقط

## الهدف

جعل Media Module يعمل بطريقة احترافية كاملة مع Cloudflare R2 فقط، بدون Local Storage وبدون fallback.

---

## 1. جعل R2 إلزامياً

يجب أن تفشل عملية تشغيل التطبيق إذا كانت إعدادات R2 غير موجودة أو ناقصة.

### متغيرات البيئة المطلوبة

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=
R2_REGION=auto
```

### المطلوب

- تحديث env validation.
- جعل إعدادات R2 إلزامية.
- منع تشغيل التطبيق إذا نقص أي متغير.
- عدم استخدام أي default production secret.

### معيار القبول

- إذا نقصت إعدادات R2، يفشل التطبيق عند startup برسالة واضحة.
- لا يوجد أي مسار تخزين محلي بديل.

---

## 2. إزالة أي Local Storage

يجب حذف أو تعطيل أي كود يعتمد على:

```txt
local
diskStorage
uploads/
public/uploads
fallback
local provider
```

### القاعدة

كل الملفات يجب أن ترفع إلى R2 فقط.

---

## 3. Media Schema النهائي

```ts
Media {
  filename: string;
  originalName: string;

  key: string;
  url: string;

  mimeType: string;
  size: number;

  provider: 'r2';

  folder: 'profile' | 'projects' | 'blog' | 'services' | 'technologies' | 'links' | 'cv' | 'misc';

  type: 'image' | 'document';

  width?: number;
  height?: number;

  alt?: string;
  usage?: string;

  uploadedBy?: ObjectId;

  isUsed: boolean;

  usedIn?: {
    resourceType: string;
    resourceId: string;
    field: string;
  }[];

  createdAt: Date;
  updatedAt: Date;
}
```

---

## 4. أنواع الملفات المسموحة

### الصور

```txt
image/jpeg
image/png
image/webp
```

### الوثائق

```txt
application/pdf
```

### ممنوع حالياً

```txt
image/gif
image/svg+xml
application/zip
application/x-msdownload
text/html
application/javascript
application/msword
application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

> لا تسمح بـ SVG حالياً لأنه قد يفتح باب XSS إذا لم يعالج بصرامة.

---

## 5. حدود الحجم

```txt
images: 5MB
pdf: 5MB
```

---

## 6. معالجة الصور

عند رفع صورة:

1. تحقق من MIME الحقيقي.
2. استخدم `sharp`.
3. استخرج:
   - width
   - height
4. حوّل الصورة إلى WebP إن أمكن.
5. ارفع النسخة النهائية إلى R2.
6. احفظ metadata في MongoDB.

### صيغة R2 key المقترحة

```txt
{folder}/{yyyy}/{mm}/{uuid}.webp
{folder}/{yyyy}/{mm}/{uuid}.pdf
```

### أمثلة

```txt
projects/2026/05/97c7e9f1.webp
cv/2026/05/8a1b2c3d.pdf
```

---

## 7. Media Endpoints

كل مسارات Media إدارية فقط.

```txt
POST   /api/admin/media/upload
GET    /api/admin/media
GET    /api/admin/media/:id
PATCH  /api/admin/media/:id
DELETE /api/admin/media/:id
```

---

## 8. Upload Endpoint

```txt
POST /api/admin/media/upload
```

### Form Data

```txt
file
folder
alt?
usage?
```

### القواعد

- يجب التحقق من وجود file.
- يجب التحقق من folder.
- يجب رفض folder غير معروف.
- يجب رفض MIME غير مسموح.
- يجب رفض الحجم الزائد.
- يجب رفع الملف إلى R2 فقط.
- يجب حفظ metadata في MongoDB.
- يجب تسجيل Audit Log عند نجاح الرفع.

---

## 9. List Endpoint

```txt
GET /api/admin/media
```

### Filters

```txt
page
limit
folder
type
mimeType
isUsed
search
sortBy
sortOrder
```

### Sort whitelist

```ts
createdAt
updatedAt
filename
size
mimeType
folder
type
```

---

## 10. Get by ID

```txt
GET /api/admin/media/:id
```

### القواعد

- يتحقق من ObjectId.
- يرجع 404 إذا لم يوجد.
- لا يرجع بيانات حساسة.

---

## 11. Update Metadata

```txt
PATCH /api/admin/media/:id
```

### يسمح بتعديل

```ts
alt
usage
folder
```

### لا يسمح بتعديل

```ts
key
url
size
mimeType
provider
uploadedBy
createdAt
```

### القواعد

- تحديث metadata فقط.
- تسجيل Audit Log قبل/بعد.

---

## 12. Delete Media

```txt
DELETE /api/admin/media/:id
```

### القواعد

- إذا `isUsed=true`، امنع الحذف.
- عند الحذف:
  - احذف الملف من R2.
  - احذف السجل من MongoDB.
  - سجل Audit Log.
- إذا فشل الحذف من R2، لا تحذف السجل من MongoDB إلا إذا كان هناك قرار واضح في الكود.

### سياسة الحذف المقترحة

لا تسمح بحذف media مستخدم حالياً.  
لا تضف `force=true` في هذه المرحلة إلا إذا كان ضرورياً.

---

## 13. ربط Media بالموديولات

عند استخدام media في:

- Profile
- Project
- Blog Post
- Service
- Technology
- Link

يجب تحديث Media:

```ts
isUsed = true
usedIn.push({
  resourceType,
  resourceId,
  field,
})
```

وعند إزالة الملف من المورد، يجب إزالة الرابط من `usedIn`.  
إذا أصبحت `usedIn` فارغة، اجعل:

```ts
isUsed = false
```

---

## 14. معيار إغلاق Media Module

- [ ] R2 إلزامي.
- [ ] لا يوجد local storage.
- [ ] لا يوجد fallback.
- [ ] upload يعمل للصور.
- [ ] upload يعمل للـ PDF.
- [ ] رفض الأنواع غير المسموحة.
- [ ] رفض الحجم الزائد.
- [ ] استخراج width/height للصور.
- [ ] تحويل الصور إلى WebP.
- [ ] حفظ metadata في MongoDB.
- [ ] `GET /api/admin/media` يعمل بفلاتر.
- [ ] `GET /api/admin/media/:id` يعمل.
- [ ] `PATCH /api/admin/media/:id` يعمل.
- [ ] `DELETE /api/admin/media/:id` يحذف من R2 وMongoDB.
- [ ] لا يتم حذف media مستخدم.
- [ ] كل مسارات Media محمية كـ Admin.
- [ ] Audit Logs تعمل مع upload/update/delete.

---

# المرحلة الثانية: فصل كل شيء إدارياً عن العامة

## الهدف

أي شيء يراه الزائر يكون تحت:

```txt
/api/public
```

وأي شيء يديره صاحب الموقع يكون تحت:

```txt
/api/admin
```

ولا يبقى endpoint مختلط.

---

## 1. قواعد Public APIs

Public APIs:

- لا تحتاج JWT.
- تعرض المنشور فقط.
- لا تعرض drafts.
- لا تعرض scheduled قبل وقته.
- لا تعرض archived.
- لا تقبل فلاتر إدارية.

### ممنوع في Public filters

```txt
isPublished=false
status=draft
status=archived
isActive=false
includeDrafts
includeArchived
```

---

## 2. قواعد Admin APIs

Admin APIs:

- تحتاج JWT.
- تعرض كل الحالات.
- تسمح بالإنشاء والتعديل والحذف.
- تسمح بالنشر وإلغاء النشر والأرشفة والترتيب.

---

## 3. المسارات النهائية المطلوبة

## Profile

```txt
GET /api/public/profile

GET /api/admin/profile
PUT /api/admin/profile
```

---

## Projects

```txt
GET /api/public/projects
GET /api/public/projects/:slug

GET    /api/admin/projects
GET    /api/admin/projects/:id
POST   /api/admin/projects
PUT    /api/admin/projects/:id
DELETE /api/admin/projects/:id
PATCH  /api/admin/projects/:id/publish
PATCH  /api/admin/projects/:id/unpublish
PATCH  /api/admin/projects/:id/archive
PATCH  /api/admin/projects/reorder
```

### Public rules

```ts
isPublished: true
isArchived: false
```

---

## Blog Posts

```txt
GET /api/public/blog/posts
GET /api/public/blog/posts/:slug

GET    /api/admin/blog/posts
GET    /api/admin/blog/posts/:id
POST   /api/admin/blog/posts
PUT    /api/admin/blog/posts/:id
DELETE /api/admin/blog/posts/:id
PATCH  /api/admin/blog/posts/:id/publish
PATCH  /api/admin/blog/posts/:id/unpublish
PATCH  /api/admin/blog/posts/:id/schedule
PATCH  /api/admin/blog/posts/:id/archive
```

### Public rules

```ts
status: 'published'
publishDate: { $lte: new Date() }
```

---

## Blog Categories

```txt
GET /api/public/blog/categories
GET /api/public/blog/categories/:slug

GET    /api/admin/blog/categories
GET    /api/admin/blog/categories/:id
POST   /api/admin/blog/categories
PUT    /api/admin/blog/categories/:id
DELETE /api/admin/blog/categories/:id
PATCH  /api/admin/blog/categories/:id/activate
PATCH  /api/admin/blog/categories/:id/deactivate
```

### Public rules

```ts
isActive: true
```

---

## Blog Tags

```txt
GET /api/public/blog/tags
GET /api/public/blog/tags/:slug

GET    /api/admin/blog/tags
GET    /api/admin/blog/tags/:id
POST   /api/admin/blog/tags
PUT    /api/admin/blog/tags/:id
DELETE /api/admin/blog/tags/:id
PATCH  /api/admin/blog/tags/:id/activate
PATCH  /api/admin/blog/tags/:id/deactivate
```

### Public rules

```ts
isActive: true
```

---

## Services

```txt
GET /api/public/services
GET /api/public/services/:slug

GET    /api/admin/services
GET    /api/admin/services/:id
POST   /api/admin/services
PUT    /api/admin/services/:id
DELETE /api/admin/services/:id
PATCH  /api/admin/services/:id/publish
PATCH  /api/admin/services/:id/unpublish
PATCH  /api/admin/services/reorder
```

### Public rules

```ts
isPublished: true
```

---

## Technologies

```txt
GET /api/public/technologies
GET /api/public/technologies/:slug

GET    /api/admin/technologies
GET    /api/admin/technologies/:id
POST   /api/admin/technologies
PUT    /api/admin/technologies/:id
DELETE /api/admin/technologies/:id
PATCH  /api/admin/technologies/:id/publish
PATCH  /api/admin/technologies/:id/unpublish
PATCH  /api/admin/technologies/reorder
```

### Public rules

```ts
isPublished: true
```

---

## Links

```txt
GET  /api/public/links
POST /api/public/links/:id/click

GET    /api/admin/links
GET    /api/admin/links/:id
POST   /api/admin/links
PUT    /api/admin/links/:id
DELETE /api/admin/links/:id
PATCH  /api/admin/links/:id/publish
PATCH  /api/admin/links/:id/unpublish
PATCH  /api/admin/links/reorder
```

### Public rules

```ts
isPublished: true
```

---

## Contact

```txt
POST /api/public/contact

GET    /api/admin/contact/messages
GET    /api/admin/contact/messages/:id
PATCH  /api/admin/contact/messages/:id/status
PATCH  /api/admin/contact/messages/:id/notes
DELETE /api/admin/contact/messages/:id
```

---

## Media

```txt
POST   /api/admin/media/upload
GET    /api/admin/media
GET    /api/admin/media/:id
PATCH  /api/admin/media/:id
DELETE /api/admin/media/:id
```

---

## Dashboard

```txt
GET /api/admin/dashboard
```

---

## Audit Logs

```txt
GET /api/admin/audit-logs
GET /api/admin/audit-logs/:id
```

---

## Health

يبقى عاماً:

```txt
GET /api/health
```

---

## 4. مصير المسارات القديمة

أي مسار قديم مثل:

```txt
/api/projects
/api/blog/posts
/api/services
/api/technologies
/api/links
```

يجب التعامل معه بإحدى طريقتين:

### الخيار المفضل

إزالته أو جعله يرجع:

```txt
410 Gone
```

مع رسالة:

```json
{
  "message": "This endpoint is deprecated. Use /api/public/... or /api/admin/..."
}
```

### الخيار المؤقت

إبقاؤه كـ alias للـ public فقط، بشرط ألا يعرض أي بيانات إدارية.

### القرار المفضل لهذه المرحلة

للإغلاق النهائي النظيف:  
افصل المسارات واحذف الاعتماد على القديمة قدر الإمكان.

---

## 5. معيار إغلاق الفصل

- [ ] كل Public routes تحت `/api/public`.
- [ ] كل Admin routes تحت `/api/admin`.
- [ ] كل Admin routes محمية بـ JWT.
- [ ] لا يوجد endpoint مختلط.
- [ ] Public لا يقبل فلاتر إدارية.
- [ ] Public لا يعرض draft.
- [ ] Public لا يعرض unpublished.
- [ ] Public لا يعرض archived.
- [ ] Public لا يعرض scheduled قبل وقته.
- [ ] Categories/Tags مفصولة.
- [ ] Contact public مفصول عن admin.
- [ ] Media admin فقط.
- [ ] Dashboard admin فقط.
- [ ] Audit Logs admin فقط.

---

# المرحلة الثالثة: إكمال Content / Services / Technologies / Links

---

## 1. Profile

### Profile Schema النهائي

```ts
Profile {
  fullName: string;
  title: string;
  headline?: string;
  bio?: string;
  about?: string;

  profileImage?: string;
  profileImageAlt?: string;
  cvFile?: string;

  email: string;
  phone?: string;
  location?: string;

  availableForWork: boolean;

  socialLinks: {
    platform: string;
    url: string;
    icon?: string;
    order?: number;
  }[];

  languages: {
    name: string;
    level?: string;
  }[];

  yearsOfExperience?: number;

  certificates: {
    title: string;
    issuer?: string;
    date?: Date;
    url?: string;
  }[];

  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}
```

### القواعد

- يوجد Profile واحد فقط.
- `PUT /api/admin/profile` يعمل upsert.
- Public يرجع فقط البيانات المناسبة للعرض.
- تحديث profileImage أو cvFile يجب أن يحدث Media usage.

### معيار الإغلاق

- [ ] Profile singleton.
- [ ] Public profile يعمل.
- [ ] Admin get/update يعمل.
- [ ] Media usage يتحدث عند تغيير الصور/السيرة.
- [ ] SEO fields موجودة.

---

## 2. Projects

### Project Schema النهائي

```ts
Project {
  title: string;
  slug: string;

  shortDescription: string;
  detailedDescription?: string;

  coverImage?: string;
  gallery: string[];

  technologies: string[];

  liveUrl?: string;
  githubUrl?: string;

  status: 'completed' | 'in-progress' | 'paused';

  category?: string;

  featured: boolean;
  isPublished: boolean;
  isArchived: boolean;

  caseStudy?: string;
  problem?: string;
  solution?: string;
  results?: string;
  role?: string;
  clientName?: string;

  startDate?: Date;
  endDate?: Date;
  completionDate?: Date;

  order: number;

  views: number;

  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}
```

### القواعد

- `slug` فريد.
- إذا لم يرسل slug، يولد من title.
- Public details by slug.
- Public يعرض:
  - `isPublished=true`
  - `isArchived=false`
- Admin يعرض الكل.
- `reorder` يقبل مصفوفة:

```ts
{
  items: {
    id: string;
    order: number;
  }[]
}
```

- تحديث coverImage/gallery يجب أن يحدث Media usage.
- `views` تزيد عند public details فقط.

### معيار الإغلاق

- [ ] slug فريد.
- [ ] publish/unpublish/archive موجود.
- [ ] reorder موجود.
- [ ] featured موجود.
- [ ] SEO موجود.
- [ ] views موجودة.
- [ ] Media usage مربوط.
- [ ] Public لا يعرض غير المنشور.

---

## 3. Blog Posts

### Post Schema النهائي

```ts
Post {
  title: string;
  slug: string;

  summary?: string;
  excerpt?: string;
  content: string;

  featuredImage?: string;
  coverImage?: string;

  category?: ObjectId;
  tags: ObjectId[];

  author?: ObjectId;

  status: 'published' | 'draft' | 'scheduled' | 'archived';

  publishDate?: Date;
  scheduledAt?: Date;
  lastPublishedAt?: Date;

  views: number;
  readTime: number;

  isFeatured: boolean;
  allowIndexing: boolean;

  canonicalUrl?: string;

  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}
```

### القواعد

- `slug` فريد.
- readTime يحسب تلقائياً.
- Public يعرض فقط:
  - `status=published`
  - `publishDate <= now`
- Draft لا يظهر للعامة.
- Scheduled لا يظهر قبل موعده.
- Archived لا يظهر للعامة.
- views تزيد فقط عند public details.
- publish endpoint يضبط:
  - `status=published`
  - `publishDate`
  - `lastPublishedAt`
- schedule endpoint يضبط:
  - `status=scheduled`
  - `scheduledAt`
- تحديث featuredImage/coverImage/seo.ogImage يجب أن يحدث Media usage.

### معيار الإغلاق

- [ ] draft لا يظهر للعامة.
- [ ] scheduled لا يظهر قبل وقته.
- [ ] archived لا يظهر للعامة.
- [ ] publish/unpublish/schedule/archive موجودة.
- [ ] readTime يعمل.
- [ ] views تعمل.
- [ ] SEO موجود.
- [ ] Media usage مربوط.

---

## 4. Blog Categories

### Category Schema النهائي

```ts
Category {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### القواعد

- `slug` فريد.
- Public يعرض active فقط.
- Admin يعرض الكل.
- لا تحذف category مستخدمة في posts إلا بقرار واضح.
- يمكن activate/deactivate.

### معيار الإغلاق

- [ ] public/admin مفصولان.
- [ ] slug فريد.
- [ ] active فقط في public.
- [ ] activate/deactivate موجودة.

---

## 5. Blog Tags

### Tag Schema النهائي

```ts
Tag {
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### القواعد

- `slug` فريد.
- Public يعرض active فقط.
- Admin يعرض الكل.
- يمكن activate/deactivate.

### معيار الإغلاق

- [ ] public/admin مفصولان.
- [ ] slug فريد.
- [ ] active فقط في public.
- [ ] activate/deactivate موجودة.

---

## 6. Services

### Service Schema النهائي

```ts
Service {
  name: string;
  slug: string;

  shortDescription: string;
  detailedDescription?: string;

  icon?: string;

  startingPrice?: number;
  currency?: string;

  price?: string;
  duration?: string;

  deliverables: string[];
  requirements: string[];

  ctaText?: string;
  ctaUrl?: string;

  isFeatured: boolean;
  isPublished: boolean;

  order: number;

  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}
```

### القواعد

- `slug` فريد.
- إذا لم يرسل slug، يولد من name.
- Public يعرض المنشور فقط.
- Admin يعرض الكل.
- يمكن ترتيب الخدمات.
- `startingPrice` رقم.
- `price` نص اختياري للعرض المرن.
- تحديث icon/seo.ogImage يجب أن يحدث Media usage.

### معيار الإغلاق

- [ ] slug موجود وفريد.
- [ ] deliverables موجودة.
- [ ] requirements موجودة.
- [ ] isFeatured موجود.
- [ ] SEO موجود.
- [ ] publish/unpublish موجود.
- [ ] reorder موجود.
- [ ] Media usage مربوط.

---

## 7. Technologies

### Technology Schema النهائي

```ts
Technology {
  name: string;
  slug: string;

  description?: string;
  icon?: string;

  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';

  category?: string;
  group?: string;

  officialUrl?: string;

  yearsOfExperience?: number;

  highlighted: boolean;
  isPublished: boolean;

  color?: string;

  order: number;

  createdAt: Date;
  updatedAt: Date;
}
```

### القواعد

- `slug` فريد.
- إذا لم يرسل slug، يولد من name.
- Public يعرض المنشور فقط.
- `highlighted` للمهارات المهمة.
- `group` للتقسيم مثل:
  - Backend
  - Frontend
  - Database
  - DevOps
  - Tools
- تحديث icon يجب أن يحدث Media usage.

### معيار الإغلاق

- [ ] slug موجود وفريد.
- [ ] officialUrl موجود.
- [ ] yearsOfExperience موجود.
- [ ] highlighted موجود.
- [ ] group موجود.
- [ ] color موجود.
- [ ] publish/unpublish موجود.
- [ ] reorder موجود.
- [ ] Media usage مربوط.

---

## 8. Links

### Link Schema النهائي

```ts
Link {
  title: string;
  slug: string;

  url: string;
  description?: string;

  icon?: string;
  platform?: string;
  category?: string;

  openInNewTab: boolean;

  isFeatured: boolean;
  isPublished: boolean;

  clicks: number;
  lastClickedAt?: Date;

  order: number;

  createdAt: Date;
  updatedAt: Date;
}
```

### القواعد

- `slug` فريد.
- إذا لم يرسل slug، يولد من title.
- Public يعرض المنشور فقط.
- `POST /api/public/links/:id/click` يزيد:
  - `clicks`
  - `lastClickedAt`
- click endpoint لا يحتاج JWT.
- تحقق من صحة URL عند create/update.
- `openInNewTab` افتراضياً true.
- تحديث icon يجب أن يحدث Media usage.

### معيار الإغلاق

- [ ] slug موجود وفريد.
- [ ] platform موجود.
- [ ] openInNewTab موجود.
- [ ] isFeatured موجود.
- [ ] click tracking يعمل.
- [ ] lastClickedAt يتحدث.
- [ ] publish/unpublish موجود.
- [ ] reorder موجود.
- [ ] Media usage مربوط.

---

## 9. قواعد عامة لكل Content Modules

### Pagination

كل list endpoint يجب أن يدعم:

```txt
page
limit
```

### Sort

كل list endpoint يجب أن يستخدم sort whitelist ولا يسمح بأي حقل عشوائي.

### Search

حيث يناسب:

```txt
search
```

### ObjectId validation

كل admin endpoint يعتمد على ID يجب أن يتحقق من ObjectId.

### Slug validation

كل public endpoint يعتمد على slug يجب أن يتحقق من slug بصيغة آمنة.

### Public response

لا ترجع حقولاً إدارية زائدة في public response إذا لم تكن لازمة.

---

# المرحلة الرابعة: تفعيل Audit Logs فعلياً

## الهدف

ليس المطلوب وجود موديول Audit فقط، بل استخدامه فعلياً داخل العمليات المهمة.

---

## 1. AuditLog Schema النهائي

```ts
AuditLog {
  actorId?: ObjectId;
  actorEmail?: string;

  action: string;

  resource: string;
  resourceId?: string;

  ipAddress?: string;
  userAgent?: string;

  before?: Record<string, any>;
  after?: Record<string, any>;

  metadata?: Record<string, any>;

  createdAt: Date;
}
```

---

## 2. لا تسجل هذه البيانات أبداً

```txt
password
currentPassword
newPassword
refreshToken
accessToken
authorization
resetToken
tokenHash
JWT secrets
SMTP password
R2 secret
R2 access key
R2 secret access key
```

يجب إنشاء sanitizer قبل حفظ `before` و `after`.

---

## 3. طريقة التطبيق المقترحة

أنشئ دالة مركزية:

```ts
AuditLogsService.log({
  actor,
  action,
  resource,
  resourceId,
  before,
  after,
  metadata,
  request,
});
```

ويفضل إنشاء helper لاستخراج:

```ts
actorId
actorEmail
ipAddress
userAgent
```

من request.

---

## 4. شرط مهم

فشل تسجيل Audit Log لا يجب أن يكسر العملية الأصلية.

مثال:

- إذا تم تحديث project بنجاح وفشل audit log، لا ترجع خطأ للمستخدم.
- سجل الخطأ في Logger فقط.

---

## 5. عمليات Auth التي يجب تسجيلها

```txt
auth.login.success
auth.login.failed
auth.logout
auth.password.changed
auth.password.reset.requested
auth.password.reset.completed
```

### ملاحظة

لا تسجل passwords ولا tokens.

---

## 6. عمليات Profile

```txt
profile.updated
```

---

## 7. عمليات Projects

```txt
project.created
project.updated
project.deleted
project.published
project.unpublished
project.archived
project.reordered
```

---

## 8. عمليات Blog

```txt
post.created
post.updated
post.deleted
post.published
post.unpublished
post.scheduled
post.archived

category.created
category.updated
category.deleted
category.activated
category.deactivated

tag.created
tag.updated
tag.deleted
tag.activated
tag.deactivated
```

---

## 9. عمليات Services

```txt
service.created
service.updated
service.deleted
service.published
service.unpublished
service.reordered
```

---

## 10. عمليات Technologies

```txt
technology.created
technology.updated
technology.deleted
technology.published
technology.unpublished
technology.reordered
```

---

## 11. عمليات Links

```txt
link.created
link.updated
link.deleted
link.published
link.unpublished
link.reordered
```

### ملاحظة

لا تسجل كل click في Audit Logs.  
النقرات تعتبر Analytics أو counter، وليست Audit.

---

## 12. عمليات Contact

```txt
contact.message.created
contact.message.status_changed
contact.message.notes_updated
contact.message.deleted
```

---

## 13. عمليات Media

```txt
media.uploaded
media.updated
media.deleted
media.delete_failed
```

---

## 14. Audit Logs Endpoints

```txt
GET /api/admin/audit-logs
GET /api/admin/audit-logs/:id
```

### Filters

```txt
page
limit
action
resource
actorId
resourceId
dateFrom
dateTo
sortBy
sortOrder
```

### Sort whitelist

```ts
createdAt
action
resource
actorEmail
```

---

## 15. معيار إغلاق Audit Logs

- [ ] Audit module موجود.
- [ ] Audit service مستخدم فعلياً.
- [ ] Auth actions تسجل.
- [ ] Profile update يسجل.
- [ ] Project actions تسجل.
- [ ] Blog actions تسجل.
- [ ] Category/Tag actions تسجل.
- [ ] Service actions تسجل.
- [ ] Technology actions تسجل.
- [ ] Link actions تسجل.
- [ ] Contact actions تسجل.
- [ ] Media actions تسجل.
- [ ] before/after موجودان في update/delete حيث يفيدان.
- [ ] لا يتم تسجيل passwords أو tokens.
- [ ] فشل audit لا يكسر العملية الأصلية.
- [ ] Audit routes admin فقط.
- [ ] Pagination يعمل.
- [ ] Filters تعمل.
- [ ] Sort whitelist مطبق.

---

# ترتيب التنفيذ العملي

## Sprint 1: Media R2 Finalization

### المهام

1. جعل R2 إلزامياً.
2. حذف local fallback.
3. إكمال Media schema.
4. ضبط file validation.
5. تنفيذ image processing.
6. تنفيذ upload إلى R2.
7. تنفيذ list.
8. تنفيذ get by id.
9. تنفيذ patch metadata.
10. تنفيذ delete من R2 وMongoDB.
11. منع حذف used media.
12. ربط media usage بالموديلات.
13. تسجيل audit logs للميديا.

### الناتج

Media Module مغلق وظيفياً.

---

## Sprint 2: Public/Admin Full Separation

### المهام

1. تثبيت route prefixes.
2. فصل Profile.
3. فصل Projects.
4. فصل Blog Posts.
5. فصل Categories.
6. فصل Tags.
7. فصل Services.
8. فصل Technologies.
9. فصل Links.
10. فصل Contact.
11. جعل Media/Admin فقط.
12. جعل Dashboard/Admin فقط.
13. جعل Audit/Admin فقط.
14. إزالة أو تعطيل المسارات القديمة المختلطة.

### الناتج

لا يوجد تداخل بين العام والإداري.

---

## Sprint 3: Content Models Completion

### المهام

1. إكمال Profile.
2. إكمال Projects.
3. إكمال Blog Posts.
4. إكمال Categories.
5. إكمال Tags.
6. إكمال Services.
7. إكمال Technologies.
8. إكمال Links.
9. إضافة Slug generation.
10. إضافة SEO fields.
11. إضافة publish/unpublish/archive حيث يلزم.
12. إضافة reorder endpoints.
13. إضافة sort whitelist.
14. إضافة pagination/filtering.
15. ربط media usage.

### الناتج

المحتوى والخدمات والتقنيات والروابط مكتملة حسب النطاق.

---

## Sprint 4: Audit Logs Activation

### المهام

1. إكمال AuditLog schema.
2. إنشاء sanitizer.
3. إنشاء log helper.
4. تفعيل audit في Auth.
5. تفعيل audit في Profile.
6. تفعيل audit في Projects.
7. تفعيل audit في Blog.
8. تفعيل audit في Categories/Tags.
9. تفعيل audit في Services.
10. تفعيل audit في Technologies.
11. تفعيل audit في Links.
12. تفعيل audit في Contact.
13. تفعيل audit في Media.
14. إكمال filters/pagination.
15. التأكد أن فشل audit لا يكسر العملية.

### الناتج

Audit Logs فعالة وليست شكلية.

---

# قائمة فحص التسليم النهائي لهذه المرحلة

## Media

- [ ] R2 فقط.
- [ ] لا يوجد local storage.
- [ ] لا يوجد fallback.
- [ ] الصور ترفع.
- [ ] PDF يرفع.
- [ ] WebP conversion يعمل.
- [ ] MIME validation يعمل.
- [ ] Size validation يعمل.
- [ ] metadata محفوظة.
- [ ] delete يحذف من R2.
- [ ] used media لا يحذف.
- [ ] Media usage مربوط بالموديلات.

## Public/Admin

- [ ] كل العام تحت `/api/public`.
- [ ] كل الإداري تحت `/api/admin`.
- [ ] admin محمي بـ JWT.
- [ ] public لا يعرض drafts.
- [ ] public لا يعرض unpublished.
- [ ] public لا يعرض archived.
- [ ] public لا يعرض scheduled قبل وقته.
- [ ] لا يوجد endpoint مختلط.

## Content

- [ ] Profile مكتمل.
- [ ] Projects مكتملة.
- [ ] Blog Posts مكتملة.
- [ ] Categories مفصولة.
- [ ] Tags مفصولة.
- [ ] Services مكتملة.
- [ ] Technologies مكتملة.
- [ ] Links مكتملة.
- [ ] slug موجود حيث يلزم.
- [ ] SEO موجود حيث يلزم.
- [ ] reorder موجود حيث يلزم.
- [ ] publish/unpublish/archive موجود حيث يلزم.

## Audit Logs

- [ ] Audit يعمل فعلياً.
- [ ] Auth events تسجل.
- [ ] Content events تسجل.
- [ ] Media events تسجل.
- [ ] Contact events تسجل.
- [ ] before/after موجودة عند الحاجة.
- [ ] لا يتم تسجيل أسرار.
- [ ] فشل audit لا يكسر العملية.
- [ ] Audit list يدعم filters/pagination.

---

# معيار القرار النهائي

بعد تنفيذ هذه المرحلة، لا تنتقل بعمق إلى الفرونت الإداري إلا إذا كانت الإجابة "نعم" على هذه الأسئلة:

| السؤال | المطلوب |
|---|---|
| هل كل media تذهب إلى R2 فقط؟ | نعم |
| هل لا يوجد local storage؟ | نعم |
| هل كل public endpoints مفصولة؟ | نعم |
| هل كل admin endpoints مفصولة ومحمية؟ | نعم |
| هل public لا يعرض غير المنشور؟ | نعم |
| هل Services مكتملة؟ | نعم |
| هل Technologies مكتملة؟ | نعم |
| هل Links مكتملة؟ | نعم |
| هل Blog Categories/Tags مفصولة؟ | نعم |
| هل Audit Logs تسجل فعلياً؟ | نعم |
| هل Audit Logs آمنة ولا تسجل secrets؟ | نعم |

---

# التوجيه النهائي لوكيل AI

نفّذ إغلاقاً نهائياً وظيفياً لهذه النطاقات فقط:

1. Media Module باعتماد Cloudflare R2 فقط، بدون أي local storage أو fallback.
2. فصل كامل بين `/api/public` و `/api/admin` لكل الموارد.
3. إكمال Content Models و Services و Technologies و Links حسب الحقول والقواعد المحددة في هذا الملف.
4. تفعيل Audit Logs فعلياً داخل العمليات المهمة.

لا تنفذ حالياً:

- tests
- CI
- Swagger documentation
- multi-tenancy
- billing
- local upload storage

التزم بأن:

- Public APIs لا تعرض drafts/unpublished/archived/scheduled-before-time.
- كل Admin APIs محمية بـ JWT.
- Audit Logs لا تحفظ passwords أو tokens أو secrets.
- Media تستخدم R2 فقط.
- فشل Audit Log لا يكسر العملية الأصلية.
