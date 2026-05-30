# خطة إغلاق وإصلاح باك إند البورتفوليو الشخصي

**اسم الملف:** `BACKEND_CLOSURE_AND_EXECUTION_PLAN.md`  
**نوع المشروع:** Backend لموقع/بورتفوليو مطوّر شخصي واحد  
**التقنيات الحالية:** NestJS + TypeScript + MongoDB/Mongoose + JWT + Swagger  
**درجة الأولوية:** عالية  
**الهدف:** إغلاق الباك إند إلى نسخة احترافية آمنة وقابلة للنشر والإدارة، دون تحويله إلى SaaS أو نظام متعدد الحسابات.

---

## 1. التوجيه العام لوكيل AI المنفّذ

أنت تعمل على مشروع Backend مخصص لشخص واحد، وليس SaaS متعدد المستخدمين.

### لا تضف هذه الأشياء الآن

- Multi-tenancy
- Workspaces
- Subscriptions
- Billing
- Plans
- Teams
- نظام صلاحيات معقد جداً
- حسابات مطورين متعددة
- لوحة Super Admin

### ركّز على هذه الأشياء

- الأمان
- فصل واجهات Public عن Admin
- منع تسريب المسودات وغير المنشور
- رفع الملفات والصور
- رسائل التواصل والبريد
- توثيق Swagger
- اختبارات أساسية
- تجهيز Production
- تنظيف الاسم والوثائق

---

## 2. تعريف الإغلاق النهائي

يُعتبر الباك إند مغلقاً بنسبة ممتازة عندما تتحقق الشروط التالية:

| البند | الحالة المطلوبة |
|---|---|
| لا يوجد `.env` داخل Git | إلزامي |
| يوجد `.env.example` كامل وواضح | إلزامي |
| تحقق صارم من متغيرات البيئة عند التشغيل | إلزامي |
| Refresh Tokens لا تُخزن كنص صريح | إلزامي |
| Public APIs لا تعرض drafts أو unpublished | إلزامي |
| Admin APIs محمية بـ JWT | إلزامي |
| الحقول الحساسة لا تظهر في responses | إلزامي |
| Upload/Media Module يعمل | إلزامي |
| Contact Message يرسل إشعاراً بالبريد | مهم |
| Forgot/Reset Password موجود | مهم |
| Dashboard Stats موجود | مهم |
| Swagger موثق بوضوح | مهم |
| Unit/E2E Tests أساسية موجودة | مهم |
| Docker/Health Check جاهز | مهم |
| README مطابق للكود | مهم |
| اسم المشروع محدث وليس باسم قديم مثل Eman | مهم |

---

## 3. الحالة الحالية المختصرة

المشروع يحتوي تقريباً على هذه الموديولات:

- Auth
- Users
- Profile
- Projects
- Blog
- Technologies
- Services
- Contact
- Links

وموجود فيه:

- JWT Auth
- MongoDB/Mongoose
- ValidationPipe
- Exception Filter
- Response Interceptor
- Helmet
- CORS
- Throttling
- Swagger setup

لكن توجد نواقص ومخاطر:

- احتمال عرض محتوى غير منشور أو مسودات عبر Public APIs.
- Refresh Tokens محفوظة بصورة غير مثالية.
- لا يوجد Upload Module مكتمل.
- لا يوجد Email Notifications.
- لا يوجد Forgot/Reset Password.
- Swagger غير مفصل بما يكفي.
- لا توجد اختبارات كافية.
- الوثائق لا تطابق التنفيذ في بعض المواضع.
- الاسم القديم للمشروع ما زال ظاهراً في بعض الملفات.

---

# المرحلة الأولى: إغلاق الأمن وفصل Public/Admin

## الهدف

جعل النظام آمناً قبل إضافة أي ميزات جديدة.

## 1. إزالة الأسرار من المشروع

### المطلوب

1. حذف أي ملف `.env` من Git.
2. التأكد من وجود `.env.example`.
3. التأكد من `.gitignore`.

### يجب أن يحتوي `.gitignore` على:

```gitignore
.env
.env.*
!.env.example
node_modules
dist
coverage
```

### معايير القبول

- لا يظهر `.env` في `git status`.
- لا يظهر `.env` في `git ls-files`.
- يوجد `.env.example` بقيم وهمية فقط.

---

## 2. إضافة Environment Validation

### المطلوب

استخدام `joi` أو `zod` للتحقق من متغيرات البيئة عند التشغيل.

### متغيرات يجب التحقق منها

```env
NODE_ENV=
PORT=
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRATION=
JWT_REFRESH_EXPIRATION=
CORS_ORIGINS=
THROTTLE_TTL=
THROTTLE_LIMIT=
```

إذا تم تنفيذ البريد والرفع:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=
```

### معايير القبول

- التطبيق يفشل عند نقص متغير إلزامي.
- رسالة الخطأ واضحة للمطور.
- لا يستخدم التطبيق قيمة production افتراضية حساسة.

---

## 3. إصلاح Refresh Tokens

### المشكلة

لا يجوز حفظ Refresh Tokens كنص صريح.

### المطلوب

الخيار الأبسط:

- حفظ hash للـ refresh token داخل User.
- المقارنة عبر bcrypt أو argon2.
- حذف token hash عند logout.

الخيار الأفضل:

إنشاء Schema:

```ts
Session {
  userId: ObjectId;
  refreshTokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
}
```

### العمليات المطلوبة

- Login ينشئ Session.
- Refresh يتحقق من Session غير ملغية وغير منتهية.
- Logout يلغي Session الحالية.
- Change Password يلغي كل Sessions السابقة.

### معايير القبول

- لا يوجد refresh token خام في قاعدة البيانات.
- logout يمنع استخدام نفس refresh token مرة أخرى.
- change password يبطل الجلسات القديمة.

---

## 4. حماية تسجيل الدخول

### المطلوب

تطبيق Rate Limit خاص على:

```txt
POST /api/auth/login
POST /api/auth/refresh
POST /api/contact
```

### إعداد مقترح

- login: 5 محاولات كل 15 دقيقة.
- refresh: 20 محاولة كل 15 دقيقة.
- contact: 3 رسائل كل ساعة.

### معايير القبول

- محاولات login المتكررة ترجع 429.
- Rate limit للـ contact لا يؤثر على قراءة المحتوى العام.

---

## 5. منع إرجاع الحقول الحساسة

### الحقول الممنوعة في responses

- `password`
- `refreshTokens`
- `refreshTokenHash`
- `__v` إن لم يكن له حاجة
- أي secrets

### المطلوب

- ضبط Mongoose schema transform.
- أو استخدام serialization DTO.
- أو تنظيف responses داخل service.

### معايير القبول

- `/auth/me` لا يرجع password أو refresh tokens.
- أي endpoint خاص بالمستخدم لا يرجع بيانات حساسة.

---

## 6. فصل Public APIs عن Admin APIs

### المشكلة

المسارات العامة قد تعرض draft أو unpublished إذا لم تكن محمية من السيرفر.

### المطلوب

إحدى طريقتين:

#### الطريقة المفضلة

إنشاء مسارات واضحة:

```txt
/api/public/profile
/api/public/projects
/api/public/blog/posts
/api/public/services
/api/public/technologies
/api/public/links
/api/public/contact

/api/admin/profile
/api/admin/projects
/api/admin/blog/posts
/api/admin/services
/api/admin/technologies
/api/admin/links
/api/admin/contact/messages
```

#### الطريقة الأقل تغييراً

- إبقاء المسارات العامة الحالية.
- إضافة مسارات إدارية جديدة.
- منع الفلاتر الإدارية من المسارات العامة.

### قواعد Public APIs

#### Projects

```ts
isPublished: true
```

#### Services

```ts
isPublished: true
```

#### Technologies

```ts
isPublished: true
```

#### Links

```ts
isPublished: true
```

#### Blog Posts

```ts
status: 'published'
publishDate <= new Date()
```

### معايير القبول

- لا يمكن للزائر رؤية draft post.
- لا يمكن للزائر رؤية scheduled post قبل وقته.
- لا يمكن للزائر رؤية project غير منشور.
- Admin يستطيع رؤية كل الحالات بعد تسجيل الدخول.

---

## 7. تفعيل حماية Admin

### المطلوب

كل مسارات Admin يجب أن تكون محمية بـ JWT.

```ts
@UseGuards(JwtAuthGuard)
```

إن بقيت الأدوار:

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
```

### ملاحظة

لأنه مشروع شخص واحد، يكفي Admin واحد. لا تضف RBAC معقد إلا إذا كان موجوداً بالفعل وتحتاج ترتيبه.

### معايير القبول

- أي طلب إلى `/api/admin/*` بدون token يرجع 401.
- token غير صالح يرجع 401.
- المستخدم المعطل لا يستطيع الدخول.

---

## 8. ObjectId Validation

### المطلوب

إضافة Pipe للتحقق من Mongo ObjectId.

مثال:

```ts
@Get(':id')
findOne(@Param('id', ParseObjectIdPipe) id: string) {}
```

### معايير القبول

- ID غير صالح يرجع 400 وليس 500.
- لا تظهر stack traces في response.

---

## 9. Sort Whitelist

### المشكلة

لا تترك `sortBy` مفتوحاً لأي قيمة.

### المطلوب

لكل مورد قائمة حقول مسموحة.

مثال Projects:

```ts
const allowedSortFields = [
  'createdAt',
  'updatedAt',
  'order',
  'completionDate',
  'title',
];
```

### معايير القبول

- `sortBy=password` أو أي حقل غير مسموح يرجع 400.
- الترتيب يعمل فقط على الحقول المحددة.

---

# المرحلة الثانية: إكمال وتنظيف نماذج المحتوى

## الهدف

جعل محتوى البورتفوليو احترافياً ومنظماً وقابلاً للعرض العام.

---

## 1. Profile Module

### المطلوب

تأكيد أن النظام يدير Profile واحد فقط.

### الحقول المقترحة

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
socialLinks[]
languages[]
yearsOfExperience
certificates[]
seo {
  metaTitle
  metaDescription
  ogImage
}
```

### العمليات المطلوبة

#### Public

```txt
GET /api/public/profile
```

#### Admin

```txt
GET /api/admin/profile
PUT /api/admin/profile
```

### معايير القبول

- يوجد Profile واحد فقط.
- update يعمل كـ upsert إذا لم يوجد profile.
- Public response لا يحتوي حقول داخلية غير لازمة.

---

## 2. Projects Module

### الحقول الحالية جيدة كبداية، لكن أضف

```ts
slug
featured
caseStudy
problem
solution
results
role
clientName
startDate
endDate
coverImage
gallery[]
seo {
  metaTitle
  metaDescription
  ogImage
}
isArchived
```

### Public Endpoints

```txt
GET /api/public/projects
GET /api/public/projects/:slug
```

### Admin Endpoints

```txt
GET /api/admin/projects
GET /api/admin/projects/:id
POST /api/admin/projects
PUT /api/admin/projects/:id
DELETE /api/admin/projects/:id
PATCH /api/admin/projects/:id/publish
PATCH /api/admin/projects/:id/unpublish
PATCH /api/admin/projects/reorder
```

### قواعد مهمة

- `slug` فريد.
- public by slug وليس id أفضل.
- غير المنشور لا يظهر للعامة.
- `featured` للعرض في الصفحة الرئيسية.
- `order` للترتيب اليدوي.

### معايير القبول

- إنشاء مشروع يولد slug عند عدم إرساله.
- لا يمكن تكرار slug.
- public list تعرض published فقط.
- admin list تعرض الكل مع filters.

---

## 3. Blog Module

### المطلوب إصلاحه

- منع عرض drafts للعامة.
- منع عرض scheduled قبل وقت النشر.
- تحسين SEO.
- تحسين إدارة التصنيفات والوسوم.

### حقول مقترحة للـ Post

```ts
title
slug
summary
excerpt
content
featuredImage
coverImage
category
tags[]
author
status // published, draft, scheduled
publishDate
scheduledAt
lastPublishedAt
views
readTime
isFeatured
allowIndexing
canonicalUrl
seo {
  metaTitle
  metaDescription
  ogImage
}
```

### Public Endpoints

```txt
GET /api/public/blog/posts
GET /api/public/blog/posts/:slug
GET /api/public/blog/categories
GET /api/public/blog/tags
```

### Admin Endpoints

```txt
GET /api/admin/blog/posts
GET /api/admin/blog/posts/:id
POST /api/admin/blog/posts
PUT /api/admin/blog/posts/:id
DELETE /api/admin/blog/posts/:id
PATCH /api/admin/blog/posts/:id/publish
PATCH /api/admin/blog/posts/:id/unpublish
PATCH /api/admin/blog/posts/:id/schedule
```

### قواعد مهمة

- زيادة views فقط عند قراءة مقال منشور من Public API.
- readTime يُحسب تلقائياً.
- slug يُولد تلقائياً.
- scheduled لا يظهر إلا بعد موعد النشر.
- draft لا يظهر للعامة أبداً.

### تحسين أمني مهم

إذا كان المحتوى HTML:

- استخدم HTML sanitization.
- امنع scripts.
- امنع inline event handlers.

إذا كان Markdown:

- حدد آلية render آمنة في الواجهة.
- لا ترجع HTML غير موثوق إن لم يكن ضرورياً.

### معايير القبول

- draft لا يظهر في public list ولا public details.
- scheduled لا يظهر قبل موعده.
- publish endpoint يغير الحالة ويثبت تاريخ النشر.
- views تزيد فقط للمحتوى العام المنشور.

---

## 4. Technologies Module

### أضف

```ts
slug
officialUrl
yearsOfExperience
highlighted
color
group
```

### Public Endpoints

```txt
GET /api/public/technologies
GET /api/public/technologies/:slug
```

### Admin Endpoints

```txt
GET /api/admin/technologies
GET /api/admin/technologies/:id
POST /api/admin/technologies
PUT /api/admin/technologies/:id
DELETE /api/admin/technologies/:id
PATCH /api/admin/technologies/reorder
```

### معايير القبول

- public يعرض `isPublished=true` فقط.
- يمكن ترتيب التقنيات.
- يمكن تمييز تقنية كـ highlighted.

---

## 5. Services Module

### أضف

```ts
slug
startingPrice
currency
deliverables[]
requirements[]
isFeatured
ctaText
ctaUrl
seo {
  metaTitle
  metaDescription
  ogImage
}
```

### Public Endpoints

```txt
GET /api/public/services
GET /api/public/services/:slug
```

### Admin Endpoints

```txt
GET /api/admin/services
GET /api/admin/services/:id
POST /api/admin/services
PUT /api/admin/services/:id
DELETE /api/admin/services/:id
PATCH /api/admin/services/reorder
```

### معايير القبول

- public يعرض الخدمات المنشورة فقط.
- الخدمة لها slug فريد.
- يمكن ترتيب الخدمات.

---

## 6. Links Module

### أضف

```ts
slug
platform
clicks
lastClickedAt
openInNewTab
isFeatured
```

### Public Endpoints

```txt
GET /api/public/links
POST /api/public/links/:id/click
```

### Admin Endpoints

```txt
GET /api/admin/links
GET /api/admin/links/:id
POST /api/admin/links
PUT /api/admin/links/:id
DELETE /api/admin/links/:id
PATCH /api/admin/links/reorder
```

### معايير القبول

- public يعرض links المنشورة فقط.
- click endpoint يزيد clicks.
- admin يستطيع معرفة عدد النقرات.

---

## 7. Contact Module

### أضف

```ts
source
serviceId
priority
notes
repliedAt
archivedAt
userAgent
spamScore
isSpam
```

### الحالات المقترحة

```ts
new
read
replied
archived
spam
```

### Public Endpoint

```txt
POST /api/public/contact
```

### Admin Endpoints

```txt
GET /api/admin/contact/messages
GET /api/admin/contact/messages/:id
PATCH /api/admin/contact/messages/:id/status
PATCH /api/admin/contact/messages/:id/notes
DELETE /api/admin/contact/messages/:id
```

### قواعد مهمة

- تسجيل IP و User Agent.
- Rate limit.
- منع الرسائل الفارغة أو القصيرة جداً.
- تنظيف النص من مدخلات ضارة.
- إرسال إشعار بريد لصاحب الموقع.

### معايير القبول

- الزائر يستطيع إرسال رسالة.
- Admin يستطيع تغيير الحالة.
- الرسالة الجديدة ترسل إشعاراً بالبريد.
- الرسائل لا تنشئ أخطاء عند فشل البريد، لكن يتم تسجيل الخطأ.

---

# المرحلة الثالثة: Media + Email + Dashboard + Audit Logs

## 1. Media Module

### الهدف

إضافة رفع صور وملفات بطريقة منظمة وآمنة.

### Schema

```ts
Media {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  key: string;
  provider: 'local' | 'r2';
  folder: string;
  alt?: string;
  usage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Endpoints

```txt
POST /api/admin/media/upload
GET /api/admin/media
GET /api/admin/media/:id
PATCH /api/admin/media/:id
DELETE /api/admin/media/:id
```

### أنواع الملفات المسموحة

للصور:

```txt
jpg
jpeg
png
webp
```

للسيرة الذاتية:

```txt
pdf
```

### حدود مقترحة

- الصور: 5MB
- PDF: 5MB

### معالجة الصور

- استخدام sharp.
- تحويل نسخة WebP إن أمكن.
- استخراج width و height.
- إنشاء thumbnails إن أمكن:
  - small
  - medium
  - large

### Storage

ابدأ بدعم provider واحد حسب الإعداد الحالي:

- Cloudflare R2 إن كانت متغيراته جاهزة.
- أو Local Storage كمرحلة أولى.

### معايير القبول

- رفع صورة يعمل.
- رفع PDF للسيرة يعمل.
- رفض الملفات غير المسموحة.
- رفض الحجم الزائد.
- حذف media يحذف الملف من التخزين.
- metadata محفوظة في MongoDB.

---

## 2. Email / Notifications Module

### الهدف

إرسال رسائل بريد مهمة.

### Services

```txt
MailService
NotificationService
```

### الرسائل المطلوبة

1. إشعار لصاحب الموقع عند وصول Contact Message.
2. تأكيد للزائر أن رسالته وصلت.
3. رابط إعادة تعيين كلمة المرور.
4. إشعار عند تغيير كلمة المرور.
5. إشعار عند تسجيل دخول جديد، اختياري.

### قوالب البريد

ابدأ بقوالب نصية بسيطة، ثم يمكن تطويرها لاحقاً.

### معايير القبول

- Contact message ترسل إشعاراً.
- فشل البريد لا يسقط request.
- يتم تسجيل خطأ البريد في logs.
- reset password يرسل رابطاً مؤقتاً.

---

## 3. Forgot / Reset Password

### Endpoints

```txt
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Schema مقترح

```ts
PasswordResetToken {
  userId: ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}
```

### قواعد مهمة

- لا تحفظ reset token الخام.
- token صالح لمدة قصيرة، مثل 15 أو 30 دقيقة.
- عند نجاح reset:
  - تحديث password.
  - إلغاء reset token.
  - إلغاء refresh sessions.
  - إرسال إشعار.

### معايير القبول

- forgot password لا يكشف هل البريد موجود أم لا.
- reset password يعمل مرة واحدة فقط.
- token المنتهي يرفض.

---

## 4. Dashboard Stats Module

### Endpoint

```txt
GET /api/admin/dashboard
```

### يرجع

```ts
{
  projects: {
    total,
    published,
    unpublished,
    featured
  },
  posts: {
    total,
    published,
    drafts,
    scheduled
  },
  contactMessages: {
    total,
    new,
    replied,
    archived
  },
  services: {
    total,
    published
  },
  technologies: {
    total,
    published
  },
  links: {
    total,
    published,
    totalClicks
  },
  recentMessages: [],
  topPosts: [],
  topProjects: [],
  topLinks: []
}
```

### معايير القبول

- endpoint محمي.
- يرجع أرقام صحيحة.
- لا يسبب ضغط زائد على قاعدة البيانات.

---

## 5. Audit Logs Module

### Schema

```ts
AuditLog {
  actorId?: ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  before?: object;
  after?: object;
  createdAt: Date;
}
```

### Endpoints

```txt
GET /api/admin/audit-logs
GET /api/admin/audit-logs/:id
```

### العمليات التي يجب تسجيلها

- login
- logout
- password change
- profile update
- project create/update/delete
- post create/update/delete/publish
- service create/update/delete
- media upload/delete
- contact status update

### معايير القبول

- العمليات المهمة تسجل.
- لا يتم حفظ password أو tokens داخل audit logs.
- يمكن فلترة logs حسب resource/action/date.

---

# المرحلة الرابعة: جودة الإنتاج والتوثيق والاختبارات

## 1. Swagger Documentation

### المطلوب

إضافة decorators حقيقية:

```ts
@ApiTags()
@ApiOperation()
@ApiResponse()
@ApiBearerAuth()
@ApiProperty()
@ApiPropertyOptional()
```

### يجب توثيق

- جميع DTOs.
- جميع Public endpoints.
- جميع Admin endpoints.
- أمثلة للطلبات.
- أمثلة للردود.
- أخطاء 400/401/404/429.

### معايير القبول

- `/api/docs` يعرض وثائق مفهومة.
- يمكن لمطور Frontend فهم كل endpoint من Swagger.
- كل protected endpoint عليه Bearer Auth واضح.

---

## 2. Tests

### Unit Tests

اختبر:

- AuthService
- ProfileService
- ProjectsService
- PostsService
- ContactService
- MediaService
- MailService

### E2E Tests

اختبر السيناريوهات التالية:

1. login صحيح.
2. login خاطئ.
3. refresh token صحيح.
4. refresh token ملغى.
5. منع admin route بدون token.
6. إنشاء مشروع.
7. عدم ظهور مشروع غير منشور للعامة.
8. إنشاء blog draft.
9. عدم ظهور draft للعامة.
10. scheduled post لا يظهر قبل موعده.
11. إرسال contact message.
12. تغيير حالة contact message.
13. رفع صورة.
14. رفض ملف غير مسموح.
15. reset password.

### معايير القبول

- الاختبارات الأساسية تمر.
- لا يوجد test يتطلب أسرار production.
- يمكن تشغيل:

```bash
npm run test
npm run test:e2e
```

---

## 3. Health Check

### Endpoint

```txt
GET /api/health
```

### يرجع

```ts
{
  status: "ok",
  uptime: number,
  timestamp: string,
  database: "ok",
  storage?: "ok",
  version: string
}
```

### معايير القبول

- health endpoint لا يحتاج token.
- يفحص اتصال MongoDB.
- لا يكشف أسرار.

---

## 4. Logging

### المطلوب

إضافة logging منظم للطلبات والأخطاء.

يجب تسجيل:

- method
- path
- statusCode
- response time
- request id
- ip
- user id إن وجد

### لا تسجل

- password
- tokens
- authorization header
- secrets

### معايير القبول

- كل خطأ مهم يظهر في logs.
- لا توجد بيانات حساسة في logs.

---

## 5. Docker

### المطلوب

إضافة:

```txt
Dockerfile
docker-compose.yml
.dockerignore
```

### docker-compose يشمل

- app
- mongodb

اختياري:

- mongo-express للتطوير فقط

### معايير القبول

يمكن تشغيل المشروع عبر:

```bash
docker compose up --build
```

---

## 6. CI Pipeline

### إن كان المشروع على GitHub

أضف GitHub Actions:

```txt
.github/workflows/ci.yml
```

### الخطوات

```txt
install
lint
test
build
```

### معايير القبول

- أي Pull Request يفشل إذا فشل lint/test/build.
- لا يحتاج CI أسرار production.

---

## 7. README وتوثيق التشغيل

### المطلوب تحديث README

يجب أن يحتوي:

- وصف المشروع الحقيقي.
- التقنيات.
- طريقة التشغيل محلياً.
- متغيرات البيئة.
- أوامر التطوير.
- أوامر الاختبار.
- طريقة seed.
- طريقة بناء production.
- روابط Swagger.
- شرح Public/Admin APIs.
- ملاحظات الأمان.

### معايير القبول

- README لا يذكر موديولات غير موجودة.
- README لا يبالغ في المنجز.
- الاسم القديم للمشروع يتم استبداله.

---

# 4. ترتيب التنفيذ المقترح لوكيل AI

اتبع هذا الترتيب حرفياً قدر الإمكان.

## Sprint 1: Security Foundation

### المهام

1. حذف `.env` من Git.
2. تحديث `.gitignore`.
3. إنشاء/تنظيف `.env.example`.
4. إضافة env validation.
5. إصلاح refresh token storage.
6. منع الحقول الحساسة في responses.
7. إضافة ObjectId validation pipe.
8. إضافة sort whitelist.
9. حماية login وcontact بالـ rate limit.
10. التأكد من `isActive` في login/refresh.

### مخرجات Sprint 1

- Auth أكثر أماناً.
- لا توجد أسرار داخل Git.
- لا توجد responses حساسة.
- أخطاء IDs غير الصحيحة منظمة.

---

## Sprint 2: Public/Admin Separation

### المهام

1. إنشاء أو تنظيم routes العامة والإدارية.
2. Public projects تعرض المنشور فقط.
3. Public blog تعرض published فقط.
4. Public services تعرض المنشور فقط.
5. Public technologies تعرض المنشور فقط.
6. Public links تعرض المنشور فقط.
7. Admin routes تعرض الكل بعد JWT.
8. تعديل DTOs للفلاتر بحيث لا تقبل public filters إدارية.
9. إضافة tests لسلوك عدم تسريب المحتوى.

### مخرجات Sprint 2

- الزائر لا يرى أي مسودة أو غير منشور.
- Admin يستطيع إدارة كل المحتوى.
- بنية API أوضح.

---

## Sprint 3: Content Model Completion

### المهام

1. تحسين Profile schema وDTOs.
2. تحسين Projects schema وDTOs.
3. إضافة slug وSEO للمشاريع.
4. تحسين Blog schema وDTOs.
5. إصلاح publish/schedule logic.
6. تحسين Technologies.
7. تحسين Services.
8. تحسين Links.
9. تحسين Contact Messages.
10. إضافة reorder endpoints حيث يلزم.

### مخرجات Sprint 3

- المحتوى أصبح مناسباً لبورتفوليو شخصي احترافي.
- يوجد SEO fields.
- يوجد slug للموارد العامة.
- ترتيب يدوي للمحتوى المهم.

---

## Sprint 4: Media and Email

### المهام

1. إنشاء MediaModule.
2. تنفيذ upload endpoint.
3. دعم الصور وPDF.
4. دعم R2 أو Local Storage.
5. معالجة الصور بـ sharp.
6. ربط الصور بالمشاريع والبروفايل والمدونة.
7. إنشاء MailService.
8. إرسال إشعار عند contact.
9. إضافة forgot/reset password.
10. إضافة قوالب بريد بسيطة.

### مخرجات Sprint 4

- يمكن رفع الصور والـ CV.
- رسائل التواصل ترسل إشعاراً.
- يمكن استعادة كلمة المرور.

---

## Sprint 5: Admin Utilities

### المهام

1. Dashboard stats.
2. Audit logs.
3. تحسين filters.
4. تحسين pagination الموحد.
5. تحسين error responses.
6. تحسين logging.

### مخرجات Sprint 5

- لوحة الإدارة لديها ملخص مفيد.
- توجد سجلات للعمليات الحساسة.
- الأخطاء واللوجات أوضح.

---

## Sprint 6: Production Readiness

### المهام

1. Swagger documentation.
2. Unit tests.
3. E2E tests.
4. Dockerfile.
5. docker-compose.
6. Health check.
7. GitHub Actions CI.
8. تحديث README.
9. تنظيف أسماء المشروع القديمة.
10. مراجعة نهائية.

### مخرجات Sprint 6

- المشروع قابل للنشر.
- موثق.
- مختبر.
- واضح للمطور القادم.

---

# 5. قائمة فحص نهائية قبل التسليم

## Security

- [ ] `.env` غير موجود في Git.
- [ ] `.env.example` موجود.
- [ ] Env validation يعمل.
- [ ] JWT secrets قوية.
- [ ] Refresh tokens hashed.
- [ ] Logout يبطل الجلسة.
- [ ] Change password يبطل الجلسات.
- [ ] Login عليه rate limit.
- [ ] Contact عليه rate limit.
- [ ] لا توجد حقول حساسة في responses.
- [ ] لا توجد أسرار في logs.

## Public/Admin

- [ ] كل `/api/admin/*` محمي.
- [ ] Public projects تعرض المنشور فقط.
- [ ] Public posts تعرض published فقط.
- [ ] Scheduled posts لا تظهر مبكراً.
- [ ] Drafts لا تظهر للعامة.
- [ ] Unpublished لا يظهر للعامة.
- [ ] Admin يرى الكل.

## Content

- [ ] Profile مكتمل.
- [ ] Projects لها slug وSEO.
- [ ] Blog posts لها slug وSEO.
- [ ] Services لها slug وSEO.
- [ ] Technologies منظمة.
- [ ] Links فيها click tracking.
- [ ] Contact messages فيها status/notes.

## Media

- [ ] رفع الصور يعمل.
- [ ] رفع PDF يعمل.
- [ ] رفض الملفات غير المسموحة.
- [ ] رفض الحجم الزائد.
- [ ] حذف media يحذف الملف.
- [ ] metadata محفوظة.

## Email

- [ ] إشعار contact يعمل.
- [ ] تأكيد للزائر اختياري.
- [ ] forgot password يعمل.
- [ ] reset password يعمل.
- [ ] فشل البريد لا يسقط الطلب.

## Admin

- [ ] Dashboard endpoint موجود.
- [ ] Audit logs موجود.
- [ ] Pagination موحد.
- [ ] Filters واضحة.
- [ ] Sort whitelist مطبق.

## Production

- [ ] Swagger كامل.
- [ ] Unit tests موجودة.
- [ ] E2E tests موجودة.
- [ ] Dockerfile موجود.
- [ ] docker-compose موجود.
- [ ] Health check موجود.
- [ ] CI موجود.
- [ ] README محدث.
- [ ] لا توجد أسماء قديمة للمشروع.
- [ ] `npm run build` يعمل.
- [ ] `npm run test` يعمل.
- [ ] `npm run test:e2e` يعمل.

---

# 6. قواعد تنفيذ مهمة

## لا تكسر التوافق بلا حاجة

إذا كانت الواجهة الأمامية موجودة وتستخدم endpoints حالية، افعل أحد التالي:

1. أضف endpoints جديدة واترك القديمة مؤقتاً.
2. أو عدّل الواجهة بالتوازي.
3. أو وثّق breaking changes بوضوح.

## لا تضف تعقيداً بلا فائدة

لأن المشروع شخصي:

- Admin واحد يكفي.
- لا تضف SaaS.
- لا تضف Billing.
- لا تضف Teams.
- لا تضف Permissions matrix كبيرة.

## لا تعتمد على الواجهة لحماية البيانات

كل قواعد النشر والمسودات يجب أن تكون في الباك إند.

## لا تخزن أسراراً

أي secret يجب أن يكون في env فقط.

## لا تسجل بيانات حساسة

لا tokens ولا passwords في logs أو audit logs.

## لا تستخدم delete القاسي دائماً

في المحتوى المهم، يمكن اعتماد soft delete أو archive، خصوصاً للمقالات والمشاريع.

---

# 7. نموذج هيكلة نهائية مقترحة

```txt
src/
  common/
    decorators/
    filters/
    guards/
    interceptors/
    pipes/
    dto/
    utils/
  config/
  database/
  modules/
    auth/
    users/
    profile/
    projects/
    blog/
      posts/
      categories/
      tags/
    technologies/
    services/
    links/
    contact/
    media/
    mail/
    dashboard/
    audit-logs/
    health/
```

---

# 8. الأوامر المتوقع دعمها

```bash
npm run start:dev
npm run build
npm run start:prod
npm run lint
npm run test
npm run test:e2e
```

اختياري:

```bash
npm run seed
npm run test:cov
```

---

# 9. المخرجات النهائية المطلوبة من وكيل AI

عند الانتهاء يجب تسليم:

1. كود معدل ومنظم.
2. قائمة بالملفات التي تم تعديلها.
3. شرح مختصر لما تم إصلاحه.
4. أي breaking changes.
5. طريقة التشغيل.
6. طريقة الاختبار.
7. المتغيرات الجديدة في `.env.example`.
8. نتيجة:
   - build
   - test
   - e2e test إن وجد
9. نقاط مؤجلة إن تعذر تنفيذ شيء.

---

# 10. معيار القرار النهائي

إذا اختلفت الخيارات أثناء التنفيذ، اختر حسب هذا الترتيب:

1. الأمان أولاً.
2. عدم تسريب محتوى غير منشور.
3. بساطة مناسبة لمشروع شخص واحد.
4. قابلية الصيانة.
5. وضوح التوثيق.
6. الأداء.

---

## الخلاصة

هذه الخطة لا تهدف إلى تضخيم المشروع، بل إلى إغلاقه كباك إند شخصي احترافي:

- آمن.
- واضح.
- قابل للنشر.
- قابل للإدارة.
- مناسب لبورتفوليو مطور شخصي.
- غير مثقل بتعقيدات SaaS غير مطلوبة الآن.

ابدأ بالمرحلة الأولى، ولا تنتقل للميزات قبل إغلاق الأمن وفصل Public/Admin.
