# خطة تنفيذ إغلاق الباك إند قبل الانتقال للفرونت

> الهدف: إغلاق مشاكل الباك إند الحالية بشكل نهائي وتحويله إلى API ثابت واحترافي يصلح لموقع شخصي احترافي + مدونة + لوحة إدارة محتوى، بحيث يستطيع الفرونت الاعتماد عليه بدون ترقيعات لاحقة.

---

## 0) قواعد تنفيذ إلزامية لوكيل الذكاء الاصطناعي

هذه الخطة يجب تنفيذها كاملة، ولا يوجد فيها أولويات اختيارية. لا تترك أي بند بنصف تنفيذ، ولا تكتفي بتعديل شكلي أو TODO.

### ممنوعات

- ممنوع حذف أي Module موجودة بدون سبب واضح.
- ممنوع كسر المسارات الحالية إلا إذا كان البند يطلب ذلك صراحة.
- ممنوع ترك endpoint يرجع pagination بدون `meta`.
- ممنوع ترك `500 Internal Server Error` لأخطاء معروفة مثل duplicate slug أو invalid ObjectId أو CastError.
- ممنوع ترك ميزة مذكورة في README أو IMPLEMENTATION_SUMMARY وهي غير موجودة فعليًا.
- ممنوع بناء الفرونت قبل تنفيذ اختبارات القبول الموجودة في آخر الملف.

### قواعد عامة

- كل response يجب أن يلتزم بالشكل:

```ts
{
  success: boolean;
  statusCode: number;
  message: string;
  data?: unknown;
  meta?: PaginationMeta | Record<string, unknown>;
  errors?: unknown[];
  timestamp: string;
  path: string;
}
```

- كل public list endpoint يجب أن يدعم pagination/filters بطريقة ثابتة وواضحة.
- Admin APIs تعتمد `id` عند العلاقات.
- Public APIs تعتمد `slug` عند الفلترة والعرض العام.
- كل تعديل على content يجب أن ينعكس على Swagger و README عند الحاجة.
- أضف أو حدّث unit/e2e tests لكل بند مهم.
- بعد كل تنفيذ شغّل:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

---

## 1) إصلاح Response Wrapper وتمرير `meta`

### المشكلة

`TransformInterceptor` الموجود في:

```txt
src/common/interceptors/transform.interceptor.ts
```

يسقط `meta` من ردود الـ controllers. هذا يكسر pagination في المشاريع، المقالات، الوسائط، رسائل التواصل، وسجل التدقيق.

### المطلوب

حدّث:

```txt
src/common/interfaces/response.interface.ts
src/common/interceptors/transform.interceptor.ts
```

بحيث:

1. يمرر `meta` إذا كان موجودًا في رد controller.
2. يمرر أي حقول قياسية مستقبلية مثل `links` إن وُجدت.
3. لا يغلف الرد مرتين إذا كان الرد أصلًا بصيغة موحدة.
4. لا يحول `null` إلى object غريب؛ يبقى `data: null` كما هو.

### شكل التنفيذ المقترح

- أضف `meta?: Record<string, any>` إلى `IResponse`.
- داخل `TransformInterceptor`:
  - إذا كان `data` يحتوي `message/data/meta`، خذها بشكل صريح.
  - إذا كان `data` لا يحتوي `data`، اجعله هو قيمة `data`.
  - مرر `meta` فقط عند وجوده.

### شروط القبول

- `GET /api/public/projects?page=1&limit=10` يرجع `meta`.
- `GET /api/public/blog/posts?page=1&limit=10` يرجع `meta`.
- `GET /api/admin/media?page=1&limit=10` يرجع `meta`.
- `GET /api/admin/contact/messages?page=1&limit=10` يرجع `meta`.
- لا يوجد endpoint list يرجع `data` فقط بدون `meta` إذا كان فيه pagination.

---

## 2) توحيد معالجة أخطاء MongoDB والـ Validation

### المشكلة

بعض أخطاء Mongo مثل duplicate key `E11000` قد تظهر كـ `500` بدل `409 Conflict`. وهذا سيجعل الفرونت غير قادر على عرض رسالة واضحة عند تكرار slug أو email.

### الملفات المستهدفة

```txt
src/common/filters/http-exception.filter.ts
src/common/interfaces/response.interface.ts
```

### المطلوب

1. عالج Mongo duplicate key error code `11000` وأعد:

```json
{
  "success": false,
  "statusCode": 409,
  "message": "القيمة مستخدمة مسبقًا",
  "errors": [{ "field": "slug", "message": "slug مستخدم مسبقًا" }]
}
```

2. عالج `CastError` كـ `400 Bad Request` برسالة مفهومة.
3. عالج `ValidationError` القادم من Mongoose كـ `400` وليس `500`.
4. حافظ على رسائل class-validator الموجودة.
5. لا تكشف stack trace في production.

### شروط القبول

- إنشاء project بعنوان ينتج نفس slug الموجود يرجع `409`.
- إنشاء post بعنوان ينتج نفس slug الموجود يرجع `409`.
- إنشاء category/tag بنفس slug يرجع `409` أو `BadRequest` واضح، والأفضل `409`.
- تمرير ObjectId غير صالح في admin route يرجع `400` وليس `500`.

---

## 3) إصلاح إدارة الـ Slug في كل المحتوى

### المشكلة

بعض الخدمات تعتمد على unique index فقط، وبعضها يفحص التكرار يدويًا. المطلوب توحيد المنطق حتى لا تظهر أخطاء خام من Mongo.

### الملفات المستهدفة

```txt
src/modules/projects/projects.service.ts
src/modules/blog/posts/posts.service.ts
src/modules/blog/categories/categories.service.ts
src/modules/blog/tags/tags.service.ts
src/modules/services/services.service.ts
src/modules/technologies/technologies.service.ts
src/modules/links/links.service.ts
```

### المطلوب

1. أضف helper مشترك أو private method داخل كل service:

```ts
private generateSlug(titleOrName: string): string
private async assertSlugIsAvailable(slug: string, excludeId?: string): Promise<void>
```

2. عند create:
   - ولّد slug.
   - افحص التكرار قبل save.
   - إذا مكرر أعد `ConflictException` برسالة عربية واضحة.

3. عند update:
   - لا تغيّر slug تلقائيًا إلا إذا تغير العنوان/الاسم.
   - عند تغييره، افحص التكرار مع استثناء نفس الوثيقة.

4. لا تسمح بتغيير slug إلى قيمة فارغة.
5. يجب أن يكون slug lower-case وخالٍ من المسافات والرموز غير المناسبة.

### شروط القبول

- لا توجد عملية duplicate slug ترجع `500`.
- تحديث عنصر بدون تغيير العنوان لا يعيد توليد slug بلا داعٍ.
- تحديث عنوان إلى عنوان عنصر آخر يرجع `409`.
- Swagger يوضح أن slug generated من السيرفر وليس مطلوبًا من الفرونت، إلا إذا قررت دعم slug يدويًا بوضوح.

---

## 4) إصلاح عقد التصنيفات والوسوم في المقالات

### المشكلة

`Post.category` و `Post.tags` مخزنة كـ ObjectId، لكن DTO تقبل string عام. Public filter قد يرسل slug بينما الاستعلام الحالي يتعامل مع ObjectId. هذا يسبب فلاتر مكسورة أو CastError.

### القرار النهائي

- Admin APIs تستخدم IDs فقط للعلاقات.
- Public APIs تستخدم slugs فقط للفلاتر.
- لا تعتمد الواجهة العامة على ObjectId.

### الملفات المستهدفة

```txt
src/modules/blog/posts/dto/create-post.dto.ts
src/modules/blog/posts/dto/update-post.dto.ts
src/modules/blog/posts/dto/filter-post.dto.ts
src/modules/blog/posts/posts.service.ts
src/modules/blog/posts/posts.module.ts
src/modules/blog/categories/schemas/category.schema.ts
src/modules/blog/tags/schemas/tag.schema.ts
```

### المطلوب

#### Admin create/update

1. في `CreatePostDto` و `UpdatePostDto`:
   - `category?: string` يجب أن يكون MongoId عند الإرسال.
   - `tags?: string[]` يجب أن تكون MongoId[] عند الإرسال.
   - استخدم `@IsMongoId()`.

2. في `PostsService`:
   - قبل create/update، تحقق أن category موجودة وفعّالة أو موجودة إداريًا حسب القرار.
   - تحقق أن كل tag IDs موجودة.
   - لو category/tag غير موجود: `BadRequestException` برسالة واضحة.

#### Public filters

1. عدّل `FilterPostDto`:

```ts
categorySlug?: string;
tagSlug?: string;
```

2. لدعم عدم كسر أي استخدام حالي، يمكن إبقاء:

```ts
category?: string;
tag?: string;
```

لكن يجب تفسيرها كـ slug في public، وليس ObjectId.

3. في `findAllPublic`:
   - إذا وصل `categorySlug` أو `category`: ابحث عن category بالـ slug ثم استخدم `_id` في query.
   - إذا وصل `tagSlug` أو `tag`: ابحث عن tag بالـ slug ثم استخدم `_id` في query.
   - إذا slug غير موجود، أعد قائمة فارغة مع meta صحيح، ولا ترجع 500.

4. في `findAllAdmin`:
   - إذا استقبل filter `category` أو `tag` في admin، تعامل معها كـ ObjectId فقط.

### شروط القبول

- `GET /api/public/blog/posts?categorySlug=backend` يعمل.
- `GET /api/public/blog/posts?tagSlug=nestjs` يعمل.
- slug غير موجود يرجع `data: []` و `meta.total: 0`.
- `POST /api/admin/blog/posts` مع category ID غير موجود يرجع `400`.
- `POST /api/admin/blog/posts` مع tag ID غير موجود يرجع `400`.
- لا يوجد CastError عند إرسال slug في public filters.

---

## 5) تفعيل النشر التلقائي للمقالات المجدولة

### المشكلة

يوجد `scheduled` status و endpoint للجدولة، لكن لا يوجد Cron ينشر المقالات تلقائيًا.

### المطلوب

أضف dependency:

```bash
npm install @nestjs/schedule
```

ثم عدّل:

```txt
src/app.module.ts
src/modules/blog/posts/posts.module.ts
src/modules/blog/posts/posts.service.ts
```

وأضف ملفًا جديدًا:

```txt
src/modules/blog/posts/posts.scheduler.ts
```

### التنفيذ المطلوب

1. أضف `ScheduleModule.forRoot()` في `AppModule`.
2. أنشئ `PostsScheduler` يحتوي Cron يعمل كل دقيقة.
3. الـ Cron يبحث عن:

```ts
status: PostStatus.SCHEDULED,
publishDate أو scheduledAt <= now
```

4. يحدثها إلى:

```ts
status: PostStatus.PUBLISHED,
lastPublishedAt: now,
publishDate: publishDate || scheduledAt || now
```

5. يجب أن يكون التحديث idempotent، أي إذا اشتغل مرتين لا ينشر نفس المقال مرتين.
6. أضف audit log بنمط `post.auto_published` أو سجل batch مختصر.
7. أضف method عام في service مثل:

```ts
publishDueScheduledPosts(now = new Date()): Promise<{ matched: number; modified: number }>
```

8. أضف endpoint إداري اختياري آمن للتشغيل اليدوي إذا رغبت:

```txt
POST /api/admin/blog/posts/publish-due
```

لكن لا تعتمد عليه بدل Cron.

### شروط القبول

- مقال scheduled ووقته في الماضي يتحول تلقائيًا إلى published.
- مقال scheduled ووقته في المستقبل لا يظهر public ولا يتحول.
- public posts لا تعرض scheduled قبل موعدها.
- cron لا يكسر build/test.
- يوجد test يغطي `publishDueScheduledPosts`.

---

## 6) إضافة FAQs Module فعليًا بدل تركها مذكورة فقط

### المشكلة

`IMPLEMENTATION_SUMMARY.md` يذكر FAQs Module لكنها غير موجودة فعليًا. للموقع الشخصي الاحترافي وجود FAQ مفيد للخدمات والصفحة الرئيسية.

### القرار النهائي

نضيف FAQs Module فعليًا بدل حذفها من التوثيق.

### الملفات الجديدة

```txt
src/modules/faqs/faqs.module.ts
src/modules/faqs/faqs.controller.ts
src/modules/faqs/faqs.service.ts
src/modules/faqs/schemas/faq.schema.ts
src/modules/faqs/dto/create-faq.dto.ts
src/modules/faqs/dto/update-faq.dto.ts
src/modules/faqs/dto/filter-faq.dto.ts
```

ثم أضفها في:

```txt
src/app.module.ts
```

### Schema المقترح

```ts
question: string;
answer: string;
category?: string;
order: number;
isPublished: boolean;
isFeatured: boolean;
seo?: {
  metaTitle?: string;
  metaDescription?: string;
};
createdAt;
updatedAt;
```

### APIs المطلوبة

#### Public

```txt
GET /api/public/faqs
GET /api/public/faqs/:id
```

- تعرض فقط `isPublished: true`.
- تدعم `category` و `featured` و pagination أو على الأقل ordering واضح.

#### Admin

```txt
GET /api/admin/faqs
GET /api/admin/faqs/:id
POST /api/admin/faqs
PUT /api/admin/faqs/:id
PATCH /api/admin/faqs/:id/publish
PATCH /api/admin/faqs/:id/unpublish
PATCH /api/admin/faqs/reorder
DELETE /api/admin/faqs/:id
```

### الربط مع Dashboard

أضف عدادات:

```ts
totalFaqs
publishedFaqs
```

في:

```txt
src/modules/dashboard/dashboard.service.ts
```

### Audit Logs

كل create/update/delete/publish/unpublish/reorder يجب أن يسجل audit log.

### شروط القبول

- FAQs Module موجودة فعليًا.
- Swagger يظهر FAQ endpoints.
- Dashboard يرجع عدادات FAQ.
- README و IMPLEMENTATION_SUMMARY لا يذكران ميزة غير موجودة.

---

## 7) إضافة SEO Endpoints الأساسية

### المشكلة

توجد حقول SEO داخل المحتوى، لكن لا توجد endpoints مهمة لمحركات البحث: sitemap، robots، RSS.

### المطلوب

أضف Module جديد:

```txt
src/modules/seo/seo.module.ts
src/modules/seo/seo.controller.ts
src/modules/seo/seo.service.ts
```

ثم أضفه في:

```txt
src/app.module.ts
```

### متغيرات البيئة المطلوبة

حدّث:

```txt
.env.example
src/config/app.config.ts
src/app.module.ts validationSchema
```

وأضف:

```env
PUBLIC_SITE_URL=https://example.com
SEO_ROBOTS_ALLOW=true
RSS_FEED_TITLE=Personal Blog
RSS_FEED_DESCRIPTION=Latest articles and updates
```

### المسارات المطلوبة

يفضل أن تكون في الجذر وليس تحت `/api`:

```txt
/sitemap.xml
/robots.txt
/rss.xml
/feed.xml
```

لذلك عدّل `app.setGlobalPrefix('api')` في `src/main.ts` ليستثني هذه المسارات من prefix.

مثال القرار:

```ts
app.setGlobalPrefix('api', {
  exclude: ['sitemap.xml', 'robots.txt', 'rss.xml', 'feed.xml'],
});
```

### sitemap.xml يجب أن يتضمن

- الصفحة الرئيسية.
- صفحة المشاريع.
- كل مشروع منشور وغير مؤرشف.
- صفحة المدونة.
- كل مقال منشور و `publishDate <= now` و `allowIndexing !== false`.
- صفحة الخدمات.
- كل خدمة منشورة.
- يمكن لاحقًا إضافة technologies/links إذا لها صفحات عامة.

### robots.txt

- يعتمد على `PUBLIC_SITE_URL`.
- إذا `SEO_ROBOTS_ALLOW=true`:

```txt
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml
```

- إذا false:

```txt
User-agent: *
Disallow: /
```

### RSS

- يعرض أحدث المقالات المنشورة فقط.
- يستخدم `title`, `summary/excerpt`, `slug`, `publishDate`, `updatedAt`.
- لا يعرض drafts/scheduled/archived.

### شروط القبول

- `/sitemap.xml` يرجع XML صحيح.
- `/robots.txt` يرجع text/plain صحيح.
- `/rss.xml` و `/feed.xml` يرجعان RSS XML صحيح.
- لا تظهر مقالات draft/scheduled/archived في sitemap أو RSS.
- `allowIndexing=false` يمنع ظهور المقال في sitemap.
- لا تكون هذه المسارات تحت `/api`.

---

## 8) إصلاح THROTTLE env وربطه بالإعدادات فعليًا

### المشكلة

`app.config.ts` يقرأ `THROTTLE_TTL` و `THROTTLE_LIMIT`، لكن `ThrottlerModule` يستخدم أرقام hardcoded.

### الملفات المستهدفة

```txt
src/app.module.ts
src/config/app.config.ts
.env.example
```

### المطلوب

استخدم `ThrottlerModule.forRootAsync` مع `ConfigService`.

يجب الانتباه أن مكتبة `@nestjs/throttler` v6 تتعامل مع `ttl` بالميلي ثانية في بعض الإعدادات الحالية؛ وحاليًا القيمة hardcoded هي `60000`. اجعل السلوك واضحًا:

- إما تسمّي env:

```env
THROTTLE_TTL_MS=60000
```

- أو تبقي `THROTTLE_TTL=60` بالثواني وتحوله إلى milliseconds داخل module.

اختر حلًا واحدًا فقط ووثقه في `.env.example`.

### شروط القبول

- تغيير `THROTTLE_LIMIT` في env يغير behavior فعليًا.
- تغيير `THROTTLE_TTL` أو `THROTTLE_TTL_MS` يغير behavior فعليًا.
- README يوضح الوحدة المستخدمة: seconds أو milliseconds.

---

## 9) تحسين Health Check ليشمل التخزين والبريد اختياريًا

### المشكلة

Health check الحالي سطحي ويقول إن storage configured بدون فحص فعلي.

### الملفات المستهدفة

```txt
src/modules/health/health.service.ts
src/modules/health/health.controller.ts
src/modules/media/media.service.ts
src/modules/mail/mail.service.ts
```

### المطلوب

1. Database:
   - افحص حالة اتصال Mongoose.
2. Storage:
   - أضف method في MediaService أو StorageService مثل `checkStorageHealth()`.
   - استخدم S3 `HeadBucketCommand` أو عملية آمنة لا تعدل ملفات المستخدم.
3. Mail:
   - إن كانت إعدادات SMTP موجودة، يمكن اختبار `transporter.verify()`.
   - إذا SMTP غير مفعّل، لا ترجع failure، بل `disabled`.
4. Health response يجب أن يكون واضحًا:

```json
{
  "status": "ok" | "degraded" | "error",
  "checks": {
    "database": { "status": "ok" },
    "storage": { "status": "ok" | "error" | "disabled" },
    "mail": { "status": "ok" | "error" | "disabled" }
  }
}
```

### شروط القبول

- إذا Mongo down يرجع health error/degraded.
- إذا R2 credentials خطأ يظهر storage error.
- إذا SMTP غير معد، لا يفشل health كاملًا.
- لا يكشف health secrets.

---

## 10) إكمال Media Usage Tracking

### المشكلة

تتبع استخدام الوسائط غير كامل. بعض الصور المستخدمة فعليًا لا يتم تسجيلها في `usedIn`.

### الملفات المستهدفة

```txt
src/modules/media/media.service.ts
src/modules/profile/profile.service.ts
src/modules/projects/projects.service.ts
src/modules/blog/posts/posts.service.ts
src/modules/services/services.service.ts
src/modules/technologies/technologies.service.ts
src/modules/links/links.service.ts
src/modules/media/schemas/media.schema.ts
```

### المطلوب

#### 10.1 تتبع الحقول الناقصة

أضف sync للحقول التالية:

- `Profile.socialLinks[].icon`
- `Project.images[]`
- كل عناصر `Project.gallery[]`
- `Project.coverImage`
- `Project.seo.ogImage`
- `Post.featuredImage`
- `Post.coverImage`
- `Post.seo.ogImage`
- الصور داخل `Post.content` إذا كانت URL من R2/public storage.
- `Service.icon`
- `Service.seo.ogImage`
- `Technology.icon`
- `Link.icon`

#### 10.2 استخراج الصور من محتوى المقال

أضف helper في MediaService أو utility:

```ts
extractMediaUrlsFromHtmlOrMarkdown(content: string): string[]
```

يدعم:

- Markdown images: `![alt](url)`
- HTML images: `<img src="url" />`
- URLs المباشرة من `R2_PUBLIC_URL`

#### 10.3 تنظيف المراجع القديمة

`syncUsage` يجب أن:

- تضيف المراجع الجديدة.
- تزيل مرجع الحقل القديم إذا الصورة لم تعد مستخدمة في نفس resource/field.
- لا تزيل استخدامات نفس الملف من موارد أخرى.
- تحدّث `isUsed` بناءً على طول `usedIn`.

#### 10.4 تنظيف الملفات غير المستخدمة

أضف endpoint إداري آمن:

```txt
GET /api/admin/media/unused?olderThanDays=30
POST /api/admin/media/cleanup-unused
```

سلوك cleanup:

- يدعم `dryRun: true` افتراضيًا.
- لا يحذف أي ملف `isUsed=true`.
- لا يحذف ملفات أحدث من `olderThanDays`.
- يسجل audit log.

### شروط القبول

- رفع صورة واستخدامها في `Project.images` يجعل `isUsed=true`.
- إزالة الصورة من المشروع تزيل مرجع استخدامها.
- صورة داخل محتوى مقال يتم تتبعها.
- حذف media مستخدم ما زال ممنوعًا.
- cleanup dry-run يرجع count بدون حذف.
- cleanup الحقيقي يحذف فقط غير المستخدم والقديم.

---

## 11) حماية محتوى المقال من XSS

### المشكلة

`Post.content` نص حر، وإذا عُرض كـ HTML في الفرونت فقد يحدث stored XSS.

### القرار النهائي

أضف sanitization على السيرفر لأي HTML مخزن في `Post.content`. إذا قرر المشروع استخدام Markdown فقط، يجب توثيق ذلك ومنع HTML الخطر أو تنظيفه.

### المطلوب

أضف dependency:

```bash
npm install sanitize-html
npm install -D @types/sanitize-html
```

أضف خدمة/utility:

```txt
src/common/utils/sanitize-content.util.ts
```

### قواعد التنظيف

- اسمح بعناصر المقال الطبيعية:
  - `p`, `br`, `strong`, `em`, `blockquote`, `ul`, `ol`, `li`, `pre`, `code`, `h2`, `h3`, `h4`, `a`, `img`, `table`, `thead`, `tbody`, `tr`, `th`, `td`
- امنع:
  - `script`, `style`, `iframe` إلا إذا قررت دعمه بقائمة بيضاء واضحة.
  - أي attributes تبدأ بـ `on` مثل `onclick`.
  - روابط `javascript:`.
- للروابط اسمح بـ `http`, `https`, `mailto`.
- للصور اسمح بـ `src`, `alt`, `title`, `width`, `height`.

### أماكن التطبيق

```txt
src/modules/blog/posts/posts.service.ts
```

- عند create.
- عند update إذا تغير content.
- احسب readTime بعد التنظيف أو قبلها بشكل ثابت، واختر واحدًا ووثقه.

### شروط القبول

- إرسال `<script>alert(1)</script>` لا يتم تخزينه.
- إرسال `<img src=x onerror=alert(1)>` يخزن بدون `onerror`.
- إرسال رابط `javascript:alert(1)` لا يبقى كرابط فعال.
- المحتوى الطبيعي للمقالات لا يتكسر.

---

## 12) تقوية نموذج التواصل ضد السبام

### المشكلة

نموذج التواصل لديه rate limit فقط. هذا غير كافٍ لموقع عام.

### الملفات المستهدفة

```txt
src/modules/contact/dto/create-message.dto.ts
src/modules/contact/contact.service.ts
src/modules/contact/contact.controller.ts
src/modules/contact/schemas/contact-message.schema.ts
src/config/app.config.ts
.env.example
src/app.module.ts validationSchema
```

### المطلوب

#### 12.1 Honeypot

أضف حقل اختياري في DTO:

```ts
website?: string;
```

إذا وصل وفيه قيمة، لا تحفظ الرسالة. أعد response نجاح وهمي بدون إرسال بريد:

```json
{ "message": "Message received successfully", "data": null }
```

#### 12.2 Turnstile اختياري

أضف env:

```env
CONTACT_TURNSTILE_ENABLED=false
TURNSTILE_SECRET_KEY=
```

إذا مفعّل، يجب أن يستقبل DTO:

```ts
turnstileToken?: string;
```

ثم تحقق منه عبر Cloudflare Turnstile server-side.

#### 12.3 Spam scoring بسيط

أضف فحصًا بسيطًا:

- عدد الروابط في الرسالة.
- كلمات spam شائعة يمكن ضبطها من env أو config.
- تكرار نفس البريد أو IP خلال مدة قصيرة.

لا تبالغ في التعقيد، لكن لا تترك الباب مفتوحًا.

#### 12.4 تخزين معلومات مساعدة

وسع schema بحقول اختيارية:

```ts
userAgent?: string;
spamScore?: number;
spamReason?: string;
isSpam?: boolean;
```

### شروط القبول

- الرسائل الطبيعية تُحفظ وترسل بريدًا إن كان البريد مفعّلًا.
- honeypot بقيمة لا يحفظ ولا يرسل بريدًا لكنه يرجع نجاحًا وهميًا.
- إذا Turnstile مفعّل و token غائب يرجع `400`.
- إذا Turnstile غير مفعّل لا يطلب token.
- Dashboard لا يحسب spam ضمن unreadMessages إلا إذا قررت عرضه في قسم منفصل.

---

## 13) حسم Legacy Routes والتوثيق

### المشكلة

README يقول إن legacy routes موجودة للتوافق، لكن `DeprecatedController` يرجع `410 Gone`. هذا تناقض.

### الملفات المستهدفة

```txt
src/common/controllers/deprecated.controller.ts
README.md
IMPLEMENTATION_SUMMARY.md
```

### القرار النهائي

اعتمد أحد خيارين فقط، ولا تترك التناقض:

#### الخيار المعتمد لهذه النسخة: لا يوجد Legacy Compatibility

- اترك `DeprecatedController` يرجع `410 Gone`.
- عدّل README و IMPLEMENTATION_SUMMARY ليقولا بوضوح:
  - المسارات القديمة غير مدعومة.
  - استخدم `/api/public/...` و `/api/admin/...` فقط.

### شروط القبول

- لا توجد عبارة تقول إن legacy routes مدعومة وهي ترجع 410.
- Swagger/README يعرضان المسارات الرسمية فقط.

---

## 14) إصلاح Seed ليكون آمنًا وواضحًا

### المشكلة

الـ seed يستخدم كلمة مرور افتراضية ثابتة ويقلع AppModule كاملًا، وقد يفشل بسبب R2 رغم أن المطلوب إنشاء admin فقط.

### الملفات المستهدفة

```txt
src/database/seeds/seed.ts
src/database/seeds/user.seed.ts
.env.example
README.md
package.json
```

### المطلوب

1. استخدم env للـ admin الافتراضي:

```env
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_NAME=Admin
SEED_ADMIN_PASSWORD=
```

2. إذا `SEED_ADMIN_PASSWORD` غير موجود:
   - في development فقط يمكن توليد password عشوائي وطباعته مرة واحدة.
   - في production/provision يجب إيقاف seed برسالة واضحة.

3. لا تطبع كلمة المرور في production.
4. لا تقلع AppModule كاملًا إذا ذلك يجبر R2/SMTP. أنشئ seed module بسيط أو اتصل بقاعدة البيانات مباشرة مع User model.
5. أضف script واضح:

```json
"seed:admin": "ts-node src/database/seeds/seed.ts"
```

### شروط القبول

- seed يعمل حتى لو R2 غير مضبوط في بيئة provisioning.
- لا توجد كلمة مرور ثابتة داخل الكود.
- تشغيل seed مرتين لا ينشئ مستخدمًا مكررًا.
- README يوضح طريقة إنشاء admin.

---

## 15) حسم دور Editor أو تفعيله فعليًا

### المشكلة

`UserRole.EDITOR` موجود لكنه غير مستخدم. كل مسارات الإدارة تتطلب admin فقط.

### القرار النهائي

فعّل دور Editor بدل حذفه، لأنه مفيد لموقع شخصي فيه إدارة محتوى.

### الملفات المستهدفة

```txt
src/modules/users/schemas/user.schema.ts
src/common/decorators/roles.decorator.ts
src/common/guards/roles.guard.ts
كل admin controllers
README.md
```

### الصلاحيات المطلوبة

#### Admin

كل شيء.

#### Editor

يسمح له بـ:

- إدارة المقالات.
- إدارة التصنيفات والوسوم.
- إدارة المشاريع.
- إدارة الخدمات.
- إدارة التقنيات.
- إدارة الروابط.
- رفع الوسائط وتعديل metadata.

لا يسمح له بـ:

- قراءة audit logs الحساسة إذا كانت تحتوي before/after كامل.
- تغيير profile الرئيسي إلا إذا قررت السماح له صراحة.
- إدارة users أو sessions مستقبلًا.
- تشغيل cleanup حقيقي للوسائط، فقط dryRun إن رغبت.
- تعديل إعدادات النظام أو health/diagnostics الحساسة.

### المطلوب تقنيًا

عدّل decorators في controllers. مثال:

```ts
@Roles(UserRole.ADMIN, UserRole.EDITOR)
```

على مسارات المحتوى فقط.

### شروط القبول

- مستخدم editor يستطيع إنشاء post.
- مستخدم editor لا يستطيع قراءة audit logs.
- مستخدم editor لا يستطيع تعديل profile إذا قررت إبقاءها admin فقط.
- README يوضح الفرق بين admin و editor.

---

## 16) توسيع Dashboard ليكون مناسبًا للفرونت

### المشكلة

Dashboard الحالي مجرد عدادات بسيطة. قبل الفرونت نحتاج عقد واضح لعرض لوحة احترافية.

### الملفات المستهدفة

```txt
src/modules/dashboard/dashboard.service.ts
src/modules/dashboard/dashboard.controller.ts
```

### المطلوب

أبقِ endpoints الحالية، لكن اجعل `GET /api/admin/dashboard` يرجع بنية منظمة:

```ts
{
  content: {
    projects: { total, published, draftOrUnpublished, archived, featured },
    posts: { total, published, draft, scheduled, archived, featured },
    services: { total, published, featured },
    technologies: { total, published, highlighted },
    links: { total, published, featured },
    faqs: { total, published, featured }
  },
  engagement: {
    projectViews,
    postViews,
    linkClicks
  },
  contact: {
    total,
    unread,
    replied,
    archived,
    spam
  },
  media: {
    total,
    used,
    unused,
    totalSize
  },
  recent: {
    messages: [],
    posts: [],
    projects: []
  }
}
```

### شروط القبول

- الفرونت يستطيع بناء dashboard بدون طلب 10 endpoints.
- لا تكشف بيانات حساسة.
- كل الأرقام صحيحة حسب الحالات الحالية.

---

## 17) توثيق API Contract قبل الفرونت

### المطلوب

أضف ملف جديد:

```txt
API_CONTRACT.md
```

يحتوي:

1. Base URL.
2. Auth flow.
3. Response shape الموحد.
4. Error shape الموحد.
5. Public endpoints.
6. Admin endpoints.
7. Pagination meta shape.
8. Blog filters النهائية.
9. Media upload contract.
10. SEO endpoints.
11. Roles وصلاحيات admin/editor.

### قرار versioning

لهذه النسخة لا تضف `/api/v1` إذا لم يكن موجودًا؛ ثبّت العقد الحالي:

```txt
/api/public/...
/api/admin/...
/api/auth/...
```

لكن اكتب في `API_CONTRACT.md` أن هذا هو Contract v1 حتى لو لم يظهر في URL. لا تغيّر global prefix إلى `/api/v1` الآن حتى لا تزيد نطاق التعديل قبل الفرونت.

### شروط القبول

- أي مطور فرونت يستطيع بناء الواجهة من `API_CONTRACT.md` بدون فتح الكود.
- لا توجد endpoints موثقة وغير موجودة.
- لا توجد endpoints موجودة ومهمة وغير موثقة.

---

## 18) تحديث Swagger والـ README والـ IMPLEMENTATION_SUMMARY

### الملفات المستهدفة

```txt
README.md
IMPLEMENTATION_SUMMARY.md
API_CONTRACT.md
```

### المطلوب

1. حدّث README ليعكس الحقيقة الحالية.
2. أزل أي ذكر لميزات غير موجودة أو نفّذها فعليًا.
3. أضف طريقة تشغيل:
   - dev
   - build
   - seed admin
   - test
   - Docker
4. أضف env كامل ومفسّر.
5. أضف شرح SEO endpoints.
6. أضف شرح scheduled posts.
7. أضف شرح roles.

### شروط القبول

- README لا يحتوي معلومات متناقضة.
- IMPLEMENTATION_SUMMARY مطابق للكود بعد التنفيذ.
- Swagger يعمل تحت `/api/docs`.

---

## 19) اختبارات إلزامية قبل اعتبار الباك إند مغلقًا

### Unit Tests مطلوبة

أضف/حدّث tests للآتي:

```txt
src/common/interceptors/transform.interceptor.spec.ts
src/common/filters/http-exception.filter.spec.ts
src/modules/blog/posts/posts.service.spec.ts
src/modules/media/media.service.spec.ts
src/modules/contact/contact.service.spec.ts
src/modules/seo/seo.service.spec.ts
src/modules/faqs/faqs.service.spec.ts
```

### E2E Tests مطلوبة

حدّث أو أضف:

```txt
test/app.e2e-spec.ts
```

ليغطي:

1. Health endpoint.
2. Login auth flow.
3. Public projects list returns meta.
4. Public blog posts list returns meta.
5. Duplicate slug returns 409.
6. Public categorySlug/tagSlug filters لا تكسر.
7. Scheduled post auto publish service method.
8. Sitemap returns XML.
9. Robots returns text.
10. Contact honeypot fake success.
11. Editor role permission checks.
12. Admin-only audit logs rejection for editor.

### أوامر القبول النهائية

يجب أن تنجح كلها:

```bash
npm run format
npm run lint
npm run test
npm run test:e2e
npm run build
```

---

## 20) قائمة تحقق نهائية قبل الانتقال للفرونت

لا تنتقل للفرونت حتى تكون كل العلامات التالية مكتملة:

- [ ] كل list endpoint يرجع `meta` صحيح.
- [ ] كل duplicate slug يرجع `409` واضح.
- [ ] public blog filters تعمل بالـ slug.
- [ ] admin post relations تعمل بالـ ObjectId فقط.
- [ ] scheduled posts تنشر تلقائيًا.
- [ ] FAQs Module موجودة فعليًا ومربوطة بالـ Dashboard.
- [ ] sitemap.xml يعمل.
- [ ] robots.txt يعمل.
- [ ] rss.xml/feed.xml يعملان.
- [ ] THROTTLE env مستخدم فعليًا.
- [ ] health يفحص database و storage بوضوح.
- [ ] media usage tracking يغطي الحقول الناقصة.
- [ ] media cleanup dry-run موجود وآمن.
- [ ] Post content يتم تنظيفه من XSS.
- [ ] Contact form فيه honeypot و Turnstile اختياري.
- [ ] Legacy routes موثقة كـ غير مدعومة أو مدعومة فعليًا، بدون تناقض.
- [ ] Seed آمن ولا يحتوي كلمة مرور ثابتة.
- [ ] Editor role مفعّل أو محذوف؛ القرار هنا: مفعّل.
- [ ] Dashboard يرجع بنية مناسبة للفرونت.
- [ ] API_CONTRACT.md موجود ومطابق للكود.
- [ ] README و IMPLEMENTATION_SUMMARY مطابقان للكود.
- [ ] جميع أوامر الاختبار والبناء تنجح.

---

## 21) مخرجات التسليم المطلوبة من وكيل التنفيذ

بعد تنفيذ الخطة، يجب أن يسلّم الوكيل الآتي:

1. ملخص الملفات التي تم تعديلها.
2. قائمة endpoints الجديدة.
3. صور أو نصوص من نتائج:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

4. أمثلة responses لـ:

```txt
GET /api/public/projects?page=1&limit=10
GET /api/public/blog/posts?categorySlug=backend
GET /sitemap.xml
GET /robots.txt
GET /rss.xml
GET /api/admin/dashboard
```

5. توضيح أي قرار معماري تم اتخاذه، لكن بدون ترك أي بند من هذه الخطة غير منفذ.

---

## 22) النتيجة المطلوبة بعد التنفيذ

بعد إغلاق هذه الخطة، يجب أن يصبح الباك إند جاهزًا للفرونت من حيث:

- API contract ثابت.
- SEO جاهز.
- Blog workflow مكتمل.
- Media workflow آمن.
- Admin/editor permissions واضحة.
- Dashboard قابل للاستخدام مباشرة.
- Errors مفهومة للفرونت.
- Pagination صالح لكل الجداول.
- Documentation مطابقة للكود.

عندها فقط نبدأ تحليل وتصميم الفرونت بثقة.
