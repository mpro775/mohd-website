# خطة الإغلاق الجذرية لتعارضات الباك إند والفرونت

> المشروع: موقع شخصي للمبرمجين — Backend NestJS + MongoDB/Mongoose + Frontend Next.js Admin/Public.  
> الهدف: تنفيذ كل الإصلاحات المذكورة أدناه بالكامل بدون حلول مؤقتة، وبدون إبقاء مصادر بيانات مزدوجة أو حقول مكررة أو فلاتر غير مرتبطة بالاسكيما.

---

## 0) قواعد التنفيذ العامة

هذه الخطة لا تحتوي على أولويات أو مؤجلات. المطلوب تنفيذ كل البنود حتى يصبح المشروع مغلقاً معمارياً.

يجب أن يكون الباك إند هو مصدر الحقيقة لـ:

- الوسائط Media.
- الفئات Categories/Options.
- التقنيات Technologies.
- الروابط Links.
- الـ slug وقواعد توليده والتحقق منه.

ويجب أن يكون الفرونت مجرد مستهلك لهذه المصادر، ولا يعرّف خيارات ثابتة تخالف الباك إند.

ممنوع بعد التنفيذ أن يبقى أي من التالي:

- حقل في DTO غير موجود في schema أو العكس بدون سبب واضح.
- حقل في الفرونت يتم عرضه ثم حذفه قبل الإرسال مثل `slug` في التصنيفات والتاجات.
- حقل فلترة في السيرفس غير موجود في schema مثل `Service.category` حالياً.
- تخزين روابط صور وملفات كنصوص حرة داخل الموديولات بدل مرجع رسمي إلى Media.
- وجود مصدرين لروابط السوشيال ميديا: `Profile.socialLinks` و `Links`.
- وجود `images` و `gallery` معاً في المشاريع.
- تخزين تقنيات المشروع كنصوص عشوائية غير مرتبطة بمودل Technologies.

---

## 1) القرار المعماري النهائي للوسائط Media

### القرار

اعتماد `mediaId` كمرجع رسمي داخلي لكل الصور والملفات والأيقونات، وليس URL نصي.

يبقى `Media.key` هو مرجع التخزين داخل Cloudflare R2، لكن باقي الموديولات لا تخزن `url` ولا `key` مباشرة. هي تخزن `ObjectId` يشير إلى وثيقة `Media`.

### لماذا `mediaId` وليس `mediaKey`؟

لأن `mediaId` يربط المورد بوثيقة Media كاملة تحتوي:

- `url`
- `key`
- `alt`
- `mimeType`
- `folder`
- `type`
- `isUsed`
- `usedIn`
- metadata مستقبلية

أما `mediaKey` فهو متعلق بالتخزين فقط، وليس كياناً كافياً لإدارة الاستخدام والحذف والـ metadata.

### قاعدة التوافق مع الفرونت العام

داخلياً وإدارياً:

```ts
profileImageMediaId
coverImageMediaId
iconMediaId
galleryMediaIds
```

في Public API يتم إرجاع الحقول القديمة كروابط جاهزة حتى لا تنكسر صفحات الموقع العامة:

```ts
coverImage: media.url
icon: media.url
profileImage: media.url
gallery: mediaItems.map(item => item.url)
```

وفي Admin API يتم إرجاع الاثنين:

```ts
coverImageMediaId: "..."
coverImage: "https://..."
coverImageMedia: { id, url, alt, type, folder }
```

---

## 2) تعديل Media Module

### الملفات المطلوبة

- `backend/src/modules/media/schemas/media.schema.ts`
- `backend/src/modules/media/media.service.ts`
- `backend/src/modules/media/dto/*.ts`
- إضافة helper جديد مثلاً:
  - `backend/src/modules/media/media-resolver.service.ts`
  - أو داخل `MediaService` إذا أردتم إبقاء الموديول صغيراً.

### المطلوب تنفيذه

أضف دوال رسمية لإدارة المراجع بدلاً من `syncUsage` المعتمد على URL:

```ts
async assertMediaExists(mediaId: string, options?: { type?: 'image' | 'document'; folder?: string | string[] }): Promise<Media>

async assertManyMediaExist(mediaIds: string[], options?: { type?: 'image' | 'document'; folder?: string | string[] }): Promise<Media[]>

async syncUsageByIds(mediaIds: string[], resourceType: string, resourceId: string, field: string): Promise<void>

async resolveMediaUrl(mediaId?: string | Types.ObjectId): Promise<string | undefined>

async resolveManyMediaUrls(mediaIds?: Array<string | Types.ObjectId>): Promise<string[]>

async resolveMediaObject(mediaId?: string | Types.ObjectId): Promise<ResolvedMedia | undefined>

async resolveManyMediaObjects(mediaIds?: Array<string | Types.ObjectId>): Promise<ResolvedMedia[]>
```

شكل `ResolvedMedia`:

```ts
export type ResolvedMedia = {
  id: string;
  key: string;
  url: string;
  alt?: string;
  type: 'image' | 'document';
  folder: string;
  mimeType: string;
  width?: number;
  height?: number;
};
```

### تعديل آلية الاستخدام

حالياً `syncUsage` تبحث بالـ URL. المطلوب استبدالها تدريجياً بـ `syncUsageByIds`.

عند حفظ أي مورد:

- اجمع كل mediaIds المستخدمة داخل المورد.
- نفّذ `syncUsageByIds` لكل حقل.
- عند حذف/أرشفة المورد نفّذ `removeUsageForEntity`.
- عند تغيير mediaId في حقل، يجب إزالة الاستخدام القديم وإضافة الجديد.

### منع الحذف

يبقى المنع الحالي لحذف الوسائط المستخدمة:

```ts
if (media.isUsed) throw BadRequestException
```

لكن يصبح مبنياً على `mediaId` وليس URL matching.

### Migration helper

أضف سكربت migration داخلي:

```txt
backend/src/database/migrations/manual/migrate-media-url-fields.ts
```

وظيفته:

- يقرأ الحقول القديمة التي تحتوي URL.
- يبحث في Media بواسطة:
  - `url`
  - أو استخراج `key` من URL ثم البحث بـ `key`
- يملأ حقول `*MediaId` الجديدة.
- يسجل أي روابط خارجية أو غير مطابقة في تقرير JSON.
- لا يحذف الحقول القديمة إلا بعد التأكد من نجاح التحويل.

ملف التقرير المقترح:

```txt
backend/media-migration-report.json
```

---

## 3) تعديل Profile Module

### الملفات المطلوبة

- `backend/src/modules/profile/schemas/profile.schema.ts`
- `backend/src/modules/profile/dto/update-profile.dto.ts`
- `backend/src/modules/profile/profile.service.ts`
- `frontend/src/features/admin/resources/profile/*`
- `frontend/src/lib/api/types.ts`
- `frontend/src/components/site/SiteFooter.tsx`

### المطلوب في الباك

احذف `SocialLink` sub-schema من Profile.

احذف من Profile:

```ts
socialLinks: SocialLink[]
profileImage?: string
cvFile?: string
seo.ogImage?: string
```

واستبدلها بـ:

```ts
profileImageMediaId?: Types.ObjectId
cvMediaId?: Types.ObjectId
seo?: {
  metaTitle?: string;
  metaDescription?: string;
  ogImageMediaId?: Types.ObjectId;
}
```

لا تضف `githubUrl` أو `liveUrl` إلى Profile. هذه روابط خاصة بكل مشروع وتبقى في `Project`.

### المطلوب في السيرفس

- عند `updateProfile` تحقق أن:
  - `profileImageMediaId` صورة.
  - `cvMediaId` مستند PDF.
  - `seo.ogImageMediaId` صورة.
- استبدل `syncMedia(profile)` القديم الذي يستخدم URL بـ `syncUsageByIds`.
- احذف الـ sync المكرر للحقل الوهمي `avatar` لأنه لا يوجد `avatar` في schema.
- أعد Profile في Public API وفيه روابط resolved:

```ts
profileImage: resolved.profileImageMedia?.url
cvFile: resolved.cvMedia?.url
seo: {
  ...seo,
  ogImage: resolved.ogImageMedia?.url
}
```

### المطلوب في الفرونت

- صفحة Profile Admin لا تدير socialLinks نهائياً.
- تبويب روابط التواصل الاجتماعي ينقل إلى صفحة Links أو يتم حذفه من Profile.
- `MediaField` في Profile يستخدم `mediaId` وليس URL.
- Public About/Header يستخدم `profile.profileImage` العائد من Public API كرابط فقط.
- Footer لا يقرأ `profile.socialLinks`، بل يقرأ `publicApi.links({ category: 'social' })` أو `publicApi.links()` ثم يفلتر `category === 'social'`.

---

## 4) توحيد Links كمصدر وحيد للروابط

### الملفات المطلوبة

- `backend/src/modules/links/schemas/link.schema.ts`
- `backend/src/modules/links/dto/create-link.dto.ts`
- `backend/src/modules/links/dto/update-link.dto.ts`
- `backend/src/modules/links/links.service.ts`
- `frontend/src/features/admin/resources/links/*`
- `frontend/src/features/links/components/TrackedLink.tsx`
- `frontend/src/components/site/SiteFooter.tsx`

### المطلوب في الباك

استبدل:

```ts
icon?: string
```

بـ:

```ts
iconMediaId?: Types.ObjectId
```

مع إرجاع `icon` كرابط resolved في Public/Admin response.

ثبت قيم `category` من الباك:

```ts
export enum LinkCategory {
  SOCIAL = 'social',
  PROFESSIONAL = 'professional',
  CONTACT = 'contact',
  PORTFOLIO = 'portfolio',
  RESUME = 'resume',
  OTHER = 'other',
}
```

ثبت `platform` أيضاً أو اجعله optional مع قائمة خيارات:

```ts
export enum LinkPlatform {
  GITHUB = 'github',
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter',
  X = 'x',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  WEBSITE = 'website',
  OTHER = 'other',
}
```

### المطلوب في الفرونت

- `MediaPicker` يرجع `MediaItem` أو `mediaId`، وليس URL فقط.
- فورم Links يحفظ `iconMediaId`.
- Footer يأخذ social links من Links فقط.
- صفحة `/links` تبقى تستخدم Links module.

---

## 5) تعديل Projects Module

### الملفات المطلوبة

- `backend/src/modules/projects/schemas/project.schema.ts`
- `backend/src/modules/projects/dto/create-project.dto.ts`
- `backend/src/modules/projects/dto/update-project.dto.ts`
- `backend/src/modules/projects/dto/filter-project.dto.ts`
- `backend/src/modules/projects/projects.service.ts`
- `frontend/src/features/admin/resources/projects/*`
- `frontend/src/features/projects/components/*`
- `frontend/src/app/(site)/projects/*`
- `frontend/src/lib/api/types.ts`

### المطلوب في الاسكيما

احذف:

```ts
images: string[]
coverImage?: string
gallery: string[]
technologies: string[] // كنصوص عشوائية
category: string // كنص عشوائي
seo.ogImage?: string
```

واستبدلها بـ:

```ts
coverImageMediaId?: Types.ObjectId

galleryMediaIds: Types.ObjectId[]

technologySlugs: string[]

category: ProjectCategory

seo?: {
  metaTitle?: string;
  metaDescription?: string;
  ogImageMediaId?: Types.ObjectId;
}
```

تبقى هذه الحقول كما هي لأنها صحيحة داخل المشروع:

```ts
liveUrl?: string
githubUrl?: string
```

### ProjectCategory

عرّف enum مركزي في الباك مثلاً:

```txt
backend/src/common/taxonomy/project-categories.ts
```

مثال:

```ts
export enum ProjectCategory {
  WEB_APP = 'web-app',
  MOBILE_APP = 'mobile-app',
  DASHBOARD = 'dashboard',
  API_BACKEND = 'api-backend',
  SAAS = 'saas',
  AI = 'ai',
  AUTOMATION = 'automation',
  UI_UX = 'ui-ux',
  OTHER = 'other',
}
```

لا تستخدم القيم الحالية المتضاربة مثل `web` في الفرونت و `SaaS Platform` في seed.

### ربط التقنيات

لا تخزن التقنيات كنصوص مفتوحة.

الخيار المعتمد:

```ts
technologySlugs: string[]
```

ثم عند الإنشاء والتحديث:

- تحقق أن كل slug موجود في `Technology`.
- لا تقبل slug غير موجود.
- احذف التكرار.
- طبّع القيم إلى lowercase slug.

في Public response أرجع:

```ts
technologies: TechnologySummary[]
technologySlugs: string[]
```

شكل `TechnologySummary`:

```ts
{
  name: string;
  slug: string;
  icon?: string;
  iconMediaId?: string;
  category?: string;
  group?: string;
  color?: string;
}
```

### إلغاء تكرار images/gallery

اعتمد فقط:

```ts
galleryMediaIds
```

وفي Public response:

```ts
gallery: resolvedUrls
```

لا يبقى `images` في أي DTO أو TypeScript type أو فورم أو صفحة عامة.

### Migration

سكربت التحويل يجب أن يعمل التالي:

```ts
coverImage -> coverImageMediaId
gallery + images -> galleryMediaIds unique
seo.ogImage -> seo.ogImageMediaId
technologies النصية -> technologySlugs بعد مطابقة Technology.name أو Technology.slug
category القديمة -> ProjectCategory جديدة حسب map واضح
```

ملف mapping مطلوب:

```txt
backend/src/database/migrations/manual/project-taxonomy-map.ts
```

مثال:

```ts
export const PROJECT_CATEGORY_LEGACY_MAP = {
  web: 'web-app',
  'web-development': 'web-app',
  mobile: 'mobile-app',
  'SaaS Platform': 'saas',
  'Artificial Intelligence': 'ai',
  'Enterprise System': 'dashboard',
  'Digital Platform': 'web-app',
  'Business Platform': 'saas',
};
```

---

## 6) تعديل Technologies Module

### الملفات المطلوبة

- `backend/src/modules/technologies/schemas/technology.schema.ts`
- `backend/src/modules/technologies/dto/create-technology.dto.ts`
- `backend/src/modules/technologies/dto/update-technology.dto.ts`
- `backend/src/modules/technologies/technologies.service.ts`
- `frontend/src/features/admin/resources/technologies/*`
- `frontend/src/app/(site)/technologies/*`
- `frontend/src/features/technologies/components/TechnologyCard.tsx`

### المطلوب في الاسكيما

استبدل:

```ts
icon?: string
category?: string
group?: string
```

بـ:

```ts
iconMediaId?: Types.ObjectId
category: TechnologyCategory
group: TechnologyGroup
```

يبقى:

```ts
officialUrl?: string
```

لأنه يعني الرابط الرسمي للتقنية أو التوثيق الرسمي.

### التصنيفات الثابتة

```ts
export enum TechnologyCategory {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  DATABASE = 'database',
  DEVOPS = 'devops',
  CLOUD = 'cloud',
  MOBILE = 'mobile',
  DESIGN = 'design',
  TESTING = 'testing',
  AI = 'ai',
  TOOLS = 'tools',
  OTHER = 'other',
}
```

```ts
export enum TechnologyGroup {
  LANGUAGE = 'language',
  FRAMEWORK = 'framework',
  LIBRARY = 'library',
  RUNTIME = 'runtime',
  DATABASE = 'database',
  ORM = 'orm',
  CMS = 'cms',
  CLOUD = 'cloud',
  STORAGE = 'storage',
  QUEUE = 'queue',
  TESTING = 'testing',
  DESIGN_TOOL = 'design-tool',
  AUTOMATION = 'automation',
  OTHER = 'other',
}
```

### المطلوب في السيرفس

- تحقق uniqueness لـ `slug`.
- اجعل `slug` إما يدوي أو من الاسم.
- تحقق أن `iconMediaId` صورة من Media.
- أرجع `icon` كرابط resolved في Public API.
- أضف دالة لاستخدامها من Projects:

```ts
async assertSlugsExist(slugs: string[]): Promise<Technology[]>
```

### المطلوب في الفرونت

- فورم Technology يستخدم Select من `/admin/options` للفئة والمجموعة.
- أيقونة التقنية تختار من Media وتخزن `iconMediaId`.
- صفحة Project Form تستخدم MultiSelect للتقنيات من Technology API وليس إدخال chips حر.

---

## 7) تعديل Services Module

### الملفات المطلوبة

- `backend/src/modules/services/schemas/service.schema.ts`
- `backend/src/modules/services/dto/create-service.dto.ts`
- `backend/src/modules/services/dto/update-service.dto.ts`
- `backend/src/modules/services/dto/filter-service.dto.ts`
- `backend/src/modules/services/services.service.ts`
- `frontend/src/features/admin/resources/services/*`
- `frontend/src/app/(site)/services/*`
- `frontend/src/features/services/components/ServiceCard.tsx`

### المشكلة الحالية

يوجد فلتر `category` في `FilterServiceDto` والسيرفس، لكن `ServiceSchema` لا يحتوي `category`.

### الحل

أضف إلى Service schema:

```ts
category: ServiceCategory
iconMediaId?: Types.ObjectId
seo?: {
  metaTitle?: string;
  metaDescription?: string;
  ogImageMediaId?: Types.ObjectId;
}
```

واحذف الاعتماد على:

```ts
icon?: string
seo.ogImage?: string
```

في Public response أرجع:

```ts
icon: resolvedIconUrl
seo.ogImage: resolvedSeoImageUrl
```

### ServiceCategory

```ts
export enum ServiceCategory {
  WEB_DEVELOPMENT = 'web-development',
  MOBILE_DEVELOPMENT = 'mobile-development',
  BACKEND_API = 'backend-api',
  UI_UX = 'ui-ux',
  AUTOMATION = 'automation',
  CONSULTING = 'consulting',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}
```

### المطلوب في الفرونت

- أضف حقل category في فورم الخدمات.
- استخدم Select من `/admin/options`.
- عدّل الأعمدة والفلاتر لتستخدم category الحقيقي.
- `MediaField` يحفظ `iconMediaId` بدلاً من URL.

---

## 8) تعديل Blog Categories و Tags

### الملفات المطلوبة

- `backend/src/modules/blog/categories/*`
- `backend/src/modules/blog/tags/*`
- `frontend/src/features/admin/resources/categories/*`
- `frontend/src/features/admin/resources/tags/*`
- `frontend/src/lib/api/types.ts`

### المشكلة الحالية

`slug` مطلوب في schema لكنه غير موجود في Create DTO، والفرونت يعرضه ثم يحذفه قبل الإرسال.

في Tags يوجد `color` في الفرونت Type/Form لكنه غير موجود في schema.

### الحل

أضف إلى `CreateCategoryDto` و `UpdateCategoryDto`:

```ts
@IsOptional()
@IsString()
slug?: string;
```

أضف إلى `CreateTagDto` و `UpdateTagDto`:

```ts
@IsOptional()
@IsString()
slug?: string;

@IsOptional()
@Matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
color?: string;
```

أضف إلى `TagSchema`:

```ts
@Prop({ default: '#3b82f6', trim: true })
color: string;
```

### سياسة الـ slug

اعمل helper موحد:

```txt
backend/src/common/utils/slug.util.ts
```

يقبل:

- slug يدوي إن أُرسل.
- أو يولّد من الاسم.
- يسمح بالعربية والإنجليزية.
- يمنع slug فارغ.
- يزيل الرموز الخطرة.
- عند التكرار يرجع خطأ واضح ولا يولّد suffix صامت إلا إذا تم اعتماد هذه السياسة بشكل صريح.

قرار مقترح للإدارة:

- في لوحة التحكم اجعل slug اختيارياً.
- إن كان الاسم عربي، اعرض تنبيه أن slug الإنجليزي اليدوي أفضل للروابط وSEO.
- لا تحذف slug من payload.

### المطلوب في الفرونت

في `categories/page-client.tsx` احذف:

```ts
const { slug, ...payload } = values;
```

وأرسل:

```ts
slug: values.slug || undefined
```

في `tags/page-client.tsx` لا تحذف `slug` ولا `color`.

أرسل:

```ts
slug: values.slug || undefined,
color: values.color || undefined,
```

---

## 9) تعديل Blog Posts

### الملفات المطلوبة

- `backend/src/modules/blog/posts/schemas/post.schema.ts`
- `backend/src/modules/blog/posts/dto/create-post.dto.ts`
- `backend/src/modules/blog/posts/dto/update-post.dto.ts`
- `backend/src/modules/blog/posts/posts.service.ts`
- `frontend/src/features/admin/resources/posts/*`
- `frontend/src/features/blog/components/PostCard.tsx`
- `frontend/src/app/(site)/blog/*`

### المطلوب

استبدل حقول الصور النصية:

```ts
featuredImage?: string
coverImage?: string
seo.ogImage?: string
```

بـ:

```ts
featuredImageMediaId?: Types.ObjectId
coverImageMediaId?: Types.ObjectId
seo?: {
  metaTitle?: string;
  metaDescription?: string;
  ogImageMediaId?: Types.ObjectId;
}
```

في Public response أرجع:

```ts
featuredImage: resolvedUrl
coverImage: resolvedUrl
seo.ogImage: resolvedUrl
```

### Slug

نفس سياسة التصنيفات:

- أضف `slug?: string` في DTO إن لم يكن موجوداً أو كان الفرونت يحذفه.
- لا يحذف الفرونت slug من payload.
- إذا لم يُرسل slug يولّده الباك من title.

### الصور داخل المحتوى

حالياً قد توجد صور داخل markdown/content كروابط. لا يلزم تحويل كل Markdown images إلى mediaId فوراً، لكن يجب تنفيذ أحد الخيارين:

1. ترك صور المحتوى كروابط داخل المحتوى، مع توثيق أنها content-embedded وليست حقول موارد.
2. أو إضافة مرفقات محتوى:

```ts
contentMediaIds: Types.ObjectId[]
```

ثم جعل المحرر يدرج الصور من Media ويضيفها إلى `contentMediaIds`.

القرار الجذري الأفضل:

- الحقول النظامية تكون mediaId.
- الصور داخل المقال تكون من Media أيضاً، ويتم استخراجها/تسجيلها في `contentMediaIds` عند الحفظ.

---

## 10) إنشاء Options/Taxonomy Module

### الهدف

إلغاء الفئات العشوائية والـ hardcoded options المتضاربة بين الباك والفرونت.

### الملفات الجديدة

```txt
backend/src/modules/options/options.module.ts
backend/src/modules/options/options.controller.ts
backend/src/modules/options/options.service.ts
backend/src/common/taxonomy/project-categories.ts
backend/src/common/taxonomy/service-categories.ts
backend/src/common/taxonomy/technology-taxonomy.ts
backend/src/common/taxonomy/link-taxonomy.ts
backend/src/common/taxonomy/currency-options.ts
```

### Endpoints

```txt
GET /public/options
GET /admin/options
```

### Response shape

```ts
{
  projectCategories: Array<{ value: string; labelAr: string; labelEn: string }>;
  serviceCategories: Array<{ value: string; labelAr: string; labelEn: string }>;
  technologyCategories: Array<{ value: string; labelAr: string; labelEn: string }>;
  technologyGroups: Array<{ value: string; labelAr: string; labelEn: string }>;
  linkCategories: Array<{ value: string; labelAr: string; labelEn: string }>;
  linkPlatforms: Array<{ value: string; labelAr: string; labelEn: string }>;
  currencies: Array<{ value: string; label: string }>;
  projectStatuses: Array<{ value: string; labelAr: string; labelEn: string }>;
  proficiencyLevels: Array<{ value: string; labelAr: string; labelEn: string }>;
}
```

### استخدامه في الفرونت

- Project Form: category/status من options.
- Service Form: category/currency من options.
- Technology Form: category/group/proficiency من options.
- Links Form: category/platform من options.
- فلاتر الجداول تستخدم نفس options.

لا تترك arrays ثابتة داخل ملفات الفورم إلا كـ fallback مؤقت أثناء التحميل، ويجب أن تكون مطابقة لقيم الباك.

---

## 11) تعديل Frontend Media Components

### الملفات المطلوبة

- `frontend/src/components/admin/MediaPicker.tsx`
- `frontend/src/components/admin/forms/MediaField.tsx`
- `frontend/src/components/admin/forms/SeoFieldsCard.tsx`
- `frontend/src/lib/api/types.ts`

### المشكلة الحالية

`MediaPicker` يعيد URL:

```ts
onSelect: (url: string) => void
```

وهذا يرسخ تخزين URL في باقي الموديولات.

### الحل

اجعل `MediaPicker` يعيد MediaItem:

```ts
onSelect: (media: MediaItem) => void
```

وعدّل `MediaField` إلى:

```ts
type MediaFieldProps = {
  label: string;
  valueId?: string | null;
  valueUrl?: string | null;
  onChange: (mediaId: string | null, media?: MediaItem) => void;
  allowedType?: 'image' | 'document' | 'all';
  defaultFolder?: string;
}
```

### طريقة العرض

- إذا توفر `valueUrl` اعرض preview منه.
- إذا توفر `valueId` فقط، اجلب media بالـ id أو استخدم media object القادم من API.
- عند الاختيار خزّن `media.id || media._id`.
- عند الحذف أرسل `null`.

### تحديث Types

أضف:

```ts
export type ResolvedMedia = {
  id: string;
  key?: string;
  url: string;
  alt?: string;
  type: 'image' | 'document';
  folder: string;
  mimeType: string;
  width?: number;
  height?: number;
};
```

ثم عدّل الكيانات:

```ts
profileImageMediaId?: string;
profileImage?: string;
profileImageMedia?: ResolvedMedia;

coverImageMediaId?: string;
coverImage?: string;
coverImageMedia?: ResolvedMedia;

galleryMediaIds?: string[];
gallery?: string[];
galleryMedia?: ResolvedMedia[];

iconMediaId?: string;
icon?: string;
iconMedia?: ResolvedMedia;
```

---

## 12) تعديل Frontend Admin Forms

### Categories

- لا تحذف `slug` قبل الإرسال.
- أرسل `slug || undefined`.
- اعرض slug في الجدول.

### Tags

- لا تحذف `slug` ولا `color`.
- أرسل الاثنين.
- اعرض color في الجدول.

### Profile

- احذف `socialLinks` من schema/form/types.
- استبدل `profileImage` بـ `profileImageMediaId`.
- استبدل `cvFile` بـ `cvMediaId`.
- استبدل `seo.ogImage` بـ `seo.ogImageMediaId`.
- أضف رابط واضح داخل Profile يقول: إدارة روابط التواصل تتم من صفحة Links.

### Links

- استبدل `icon` بـ `iconMediaId` في الفورم.
- category/platform من `/admin/options`.

### Projects

- استبدل `coverImage` بـ `coverImageMediaId`.
- احذف `images` بالكامل.
- استبدل `gallery` بـ `galleryMediaIds` مع multi media picker.
- استبدل `technologies` بـ `technologySlugs` من MultiSelect مربوط بـ Technologies API.
- category من `/admin/options`.
- `seo.ogImage` يصبح `seo.ogImageMediaId`.

### Services

- أضف `category` Select.
- استبدل `icon` بـ `iconMediaId`.
- `seo.ogImage` يصبح `seo.ogImageMediaId`.

### Technologies

- استبدل `icon` بـ `iconMediaId`.
- category/group من `/admin/options`.

### Posts

- لا تحذف `slug` قبل الإرسال.
- `featuredImage` يصبح `featuredImageMediaId`.
- `coverImage` يصبح `coverImageMediaId`.
- `seo.ogImage` يصبح `seo.ogImageMediaId`.

---

## 13) تعديل Public Frontend Pages

Public pages لا يجب أن تعرف شيئاً عن `mediaId` إلا إذا احتاجت. هي تستخدم الروابط resolved من Public API.

### المطلوب

- `ProjectCard` يستخدم `project.coverImage` كـ URL.
- `ProjectGallery` يستخدم `project.gallery` كـ URLs.
- `TechnologyCard` يستخدم `technology.icon`.
- `ServiceCard` يستخدم `service.icon`.
- `PostCard` يستخدم `post.featuredImage`.
- `SiteFooter` يستخدم Links module وليس Profile.socialLinks.
- Blog category/tag filters تستمر بالـ slug.

إذا احتاجت الصفحة تفاصيل Media مثل `alt`، استخدم:

```ts
project.coverImageMedia?.alt
technology.iconMedia?.alt
```

---

## 14) API Response Mapping / Serializers

### الهدف

عدم تسريب شكل قاعدة البيانات الخام للفرونت.

### المطلوب

أنشئ mappers لكل مودل:

```txt
backend/src/modules/projects/mappers/project.mapper.ts
backend/src/modules/profile/mappers/profile.mapper.ts
backend/src/modules/services/mappers/service.mapper.ts
backend/src/modules/technologies/mappers/technology.mapper.ts
backend/src/modules/links/mappers/link.mapper.ts
backend/src/modules/blog/posts/mappers/post.mapper.ts
```

### مثال Project mapper

```ts
export async function mapProjectForPublic(project: Project, mediaService: MediaService, techService: TechnologiesService) {
  const coverImageMedia = await mediaService.resolveMediaObject(project.coverImageMediaId);
  const galleryMedia = await mediaService.resolveManyMediaObjects(project.galleryMediaIds);
  const technologies = await techService.findSummariesBySlugs(project.technologySlugs);

  return {
    id: project._id.toString(),
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    detailedDescription: project.detailedDescription,
    category: project.category,
    coverImageMediaId: project.coverImageMediaId?.toString(),
    coverImage: coverImageMedia?.url,
    coverImageMedia,
    galleryMediaIds: project.galleryMediaIds?.map(String) ?? [],
    gallery: galleryMedia.map(item => item.url),
    galleryMedia,
    technologySlugs: project.technologySlugs ?? [],
    technologies,
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
    seo: {
      ...project.seo,
      ogImage: resolvedSeoOgImage?.url,
      ogImageMediaId: project.seo?.ogImageMediaId?.toString(),
    },
  };
}
```

### ممنوع

لا ترجع Mongoose Document كما هو في Public API بعد هذه التعديلات.

---

## 15) سياسة الـ Slug الموحدة

### الملفات المطلوبة

- `backend/src/common/utils/slug.util.ts`
- كل services التي تولد slug:
  - CategoriesService
  - TagsService
  - PostsService
  - ProjectsService
  - ServicesService
  - TechnologiesService
  - LinksService

### المطلوب

استخدم دالة واحدة:

```ts
export function normalizeSlug(input: string): string
```

وقاعدة واحدة:

```ts
const slug = normalizeSlug(dto.slug || dto.name || dto.title);
```

مع اختلاف source field حسب المودل.

### تحقق التكرار

أضف helper لكل service:

```ts
async assertSlugIsAvailable(slug: string, excludeId?: string)
```

في create:

- إذا مكرر: `409 Conflict` مع رسالة واضحة.

في update:

- إذا slug لم يتغير لا مشكلة.
- إذا تغير، تحقق أنه غير مستخدم.

### اللغة العربية

يسمح النظام بالـ Arabic slug، لكن واجهة الإدارة تعرض توصية:

```txt
يفضل كتابة slug إنجليزي قصير عند استخدام اسم عربي لتحسين شكل الرابط والمشاركة.
```

---

## 16) Seed Data وتوحيد البيانات الأولية

### الملفات المطلوبة

- `backend/src/database/seeds/seed.ts`
- أي seed فرعية موجودة.

### المطلوب

- حدّث التصنيفات لتستخدم enums الجديدة.
- حدّث technologies لتستخدم:
  - `category` من `TechnologyCategory`
  - `group` من `TechnologyGroup`
  - `officialUrl` إن وجد.
- حدّث projects لتستخدم:
  - `category` من `ProjectCategory`
  - `technologySlugs` بدل `technologies` النصية.
  - `coverImageMediaId` فقط إذا كانت Media موجودة، أو اتركه فارغاً.
- حدّث services لتستخدم `category`.
- لا تزرع روابط صور وهمية في حقول mediaId.

---

## 17) Cache / Revalidation

### الوضع الحالي

- لا يوجد backend cache حقيقي.
- يوجد Next.js revalidate في public API مثل 120/300 ثانية.
- Admin API يستخدم `no-store`.

### الحل الجذري المقترح

لا تضف Redis أو backend cache حالياً لأن المشروع صغير ومشكلته ليست أداء الباك؛ المشكلة أن Public pages قد تتأخر في التحديث بعد تعديلات الإدارة.

نفّذ cache invalidation في الفرونت بـ Next tags.

### المطلوب في الفرونت

في `frontend/src/lib/api/public.ts` أضف tags:

```ts
next: { revalidate: 300, tags: ['profile'] }
next: { revalidate: 120, tags: ['projects'] }
next: { revalidate: 300, tags: ['services'] }
next: { revalidate: 300, tags: ['technologies'] }
next: { revalidate: 300, tags: ['links'] }
next: { revalidate: 120, tags: ['blog'] }
next: { revalidate: 300, tags: ['faqs'] }
```

أضف route:

```txt
frontend/src/app/api/revalidate/route.ts
```

يقبل:

```ts
POST { secret: string, tags: string[] }
```

ويستدعي:

```ts
revalidateTag(tag)
```

أضف env:

```txt
REVALIDATE_SECRET=
NEXT_PUBLIC_SITE_URL=
```

بعد نجاح أي admin mutation، نفّذ revalidate للـ tag المناسب:

- Profile => `profile`, `links` إذا كان الفوتر يعتمد على روابط.
- Projects => `projects`, `home` إن كانت الصفحة الرئيسية تعرض مشاريع.
- Services => `services`, `home`.
- Technologies => `technologies`, `projects`, `home`.
- Links => `links`, `profile`, `home`.
- Blog posts/categories/tags => `blog`.
- FAQs => `faqs`.

### ملاحظة

إذا كان الباك والفرونت مفصولين تماماً في الدومينات، يمكن جعل Admin frontend هو من يستدعي `/api/revalidate` بعد mutations، وهذا يكفي.

---

## 18) تحديث API Contract

### الملف المطلوب

- `backend/API_CONTRACT.md`
- وربما إضافة:
  - `frontend/AGENTS.md`

### المطلوب توثيقه

وثّق كل الحقول الجديدة:

- `profileImageMediaId`
- `cvMediaId`
- `iconMediaId`
- `coverImageMediaId`
- `galleryMediaIds`
- `featuredImageMediaId`
- `coverImageMediaId`
- `seo.ogImageMediaId`
- `technologySlugs`
- categories/options endpoints

وضّح الفرق بين:

- Admin request shape.
- Admin response shape.
- Public response shape.

مثال:

```md
Admin Create Project Request:
- coverImageMediaId: string
- galleryMediaIds: string[]
- technologySlugs: string[]

Public Project Response:
- coverImage: string URL
- gallery: string[] URLs
- technologies: TechnologySummary[]
```

---

## 19) اختبارات الباك إند المطلوبة

أضف أو حدّث الاختبارات التالية:

### Media

- يمنع حذف Media مستخدمة.
- يسمح بحذف Media غير مستخدمة.
- `syncUsageByIds` يضيف الاستخدام الصحيح.
- `syncUsageByIds` يزيل الاستخدام القديم عند تغيير الحقل.
- `assertMediaExists` يفشل مع id غير صالح أو غير موجود.
- `assertMediaExists` يفشل إذا النوع غير مطابق: صورة مطلوبة وتم تمرير PDF.

### Categories/Tags

- create مع slug يدوي.
- create بدون slug يولّد من الاسم.
- duplicate slug يرجع Conflict.
- tag color يحفظ ويرجع.

### Services

- create مع category صحيح.
- filter by category يعمل فعلاً.
- iconMediaId يجب أن يكون صورة.

### Technologies

- category/group من enum.
- officialUrl يجب أن يكون URL صالح.
- iconMediaId يجب أن يكون صورة.
- assertSlugsExist يعمل.

### Projects

- create يرفض technologySlug غير موجود.
- create يرفض category غير معروف.
- coverImageMediaId يجب أن يكون صورة.
- galleryMediaIds يجب أن تكون صور.
- لا يوجد images في response.
- Public response يرجع `coverImage` و `gallery` كروابط.

### Profile

- لا يقبل socialLinks في DTO.
- profileImageMediaId صورة.
- cvMediaId PDF.
- Public profile يرجع `profileImage` و `cvFile` resolved URLs.

### Links

- iconMediaId صورة.
- category/platform من options.
- public links تعمل للفوتر وصفحة links.

---

## 20) اختبارات الفرونت المطلوبة

### Typecheck

يجب أن ينجح:

```bash
npm run typecheck
```

### Build

يجب أن ينجح:

```bash
npm run build
```

### Unit/UI tests

حدّث الاختبارات الموجودة وأضف اختبارات عند الحاجة لـ:

- `MediaField` يعيد mediaId وليس URL.
- Project form يرسل `coverImageMediaId`, `galleryMediaIds`, `technologySlugs`.
- Category/Tag forms لا تحذف slug.
- Tag form يرسل color.
- Service form يرسل category.
- Profile form لا يرسل socialLinks.
- Footer يقرأ links وليس profile.socialLinks.

---

## 21) Migration تنفيذية للبيانات الحالية

أضف سكربت واحد جامع:

```txt
backend/src/database/migrations/manual/normalize-content-model.ts
```

### خطوات السكربت

#### Media fields

- Profile:
  - `profileImage` -> `profileImageMediaId`
  - `cvFile` -> `cvMediaId`
  - `seo.ogImage` -> `seo.ogImageMediaId`
- Links:
  - `icon` -> `iconMediaId`
- Projects:
  - `coverImage` -> `coverImageMediaId`
  - `gallery + images` -> `galleryMediaIds`
  - `seo.ogImage` -> `seo.ogImageMediaId`
- Services:
  - `icon` -> `iconMediaId`
  - `seo.ogImage` -> `seo.ogImageMediaId`
- Technologies:
  - `icon` -> `iconMediaId`
- Posts:
  - `featuredImage` -> `featuredImageMediaId`
  - `coverImage` -> `coverImageMediaId`
  - `seo.ogImage` -> `seo.ogImageMediaId`

#### Links/Profile

- حوّل `profile.socialLinks` إلى وثائق داخل Links إن لم تكن موجودة.
- category = `social`.
- platform = platform القديمة normalized.
- title = platform أو label مناسب.
- url = الرابط القديم.
- iconMediaId = icon media إذا تطابق.
- بعد التحويل احذف `socialLinks` من Profile.

#### Projects

- دمج `images` و `gallery` بدون تكرار.
- تحويل technologies النصية إلى `technologySlugs`:
  - ابحث أولاً عن slug مطابق.
  - ثم name مطابق case-insensitive.
  - إذا غير موجود، إمّا أنشئ Technology جديدة بقيمة category `tools` و group `other`، أو سجلها في report. القرار الأفضل للموقع الشخصي: أنشئ Technology إذا كانت من بيانات المشروع الحالية.

#### Categories

- طبّق mapping للقيم القديمة إلى enums.
- أي قيمة غير معروفة تتحول إلى `other` وتُسجل في التقرير.

#### Sync Media Usage

بعد اكتمال التحويل:

- نظّف `usedIn` لكل Media.
- أعد بناء كل usage من الموارد الحالية.
- حدّث `isUsed` بناءً على `usedIn.length`.

### تقرير migration

يجب أن ينتج JSON فيه:

```json
{
  "converted": {},
  "createdTechnologies": [],
  "createdLinksFromProfile": [],
  "unmatchedMediaUrls": [],
  "unknownCategoriesMappedToOther": [],
  "errors": []
}
```

---

## 22) تنظيف الحقول القديمة بعد الهجرة

بعد نجاح migration والبناء والاختبارات:

احذف من الاسكيمات والـ DTO والفرونت types:

```ts
profileImage
cvFile
socialLinks
icon
coverImage
gallery // كحقل إدخال داخلي URL
images
featuredImage
seo.ogImage // كحقل إدخال داخلي URL
technologies // كنصوص داخل Project
```

لكن يمكن إبقاء أسماء الروابط في Public response فقط:

```ts
profileImage
cvFile
icon
coverImage
gallery
featuredImage
seo.ogImage
```

أي أن هذه الأسماء تكون ناتجة من mapper وليست مخزنة في قاعدة البيانات.

---

## 23) تحديث أسماء ومسارات الـ DTO

### نمط موحد

داخل Admin DTOs:

```ts
iconMediaId?: string
coverImageMediaId?: string
galleryMediaIds?: string[]
seo?: {
  ogImageMediaId?: string
}
```

داخل Public responses:

```ts
icon?: string
coverImage?: string
gallery?: string[]
seo?: {
  ogImage?: string
}
```

لا تخلط بين request DTO و public response DTO.

---

## 24) أوامر التحقق النهائية

### Backend

من مجلد الباك:

```bash
npm install
npm run build
npm run test
npm run lint
```

ثم شغّل seed/migration حسب الحاجة:

```bash
npm run seed
```

وإذا أضفت سكربت migration:

```bash
npx ts-node src/database/migrations/manual/normalize-content-model.ts
```

### Frontend

من مجلد الفرونت:

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run lint
```

---

## 25) شروط القبول النهائية

يُعتبر التنفيذ مكتملاً فقط إذا تحقق كل التالي:

- لا يوجد `Profile.socialLinks` في الباك أو الفرونت.
- Footer يعرض السوشيال من Links فقط.
- كل الصور والأيقونات والملفات في الموارد تخزن `mediaId` وليس URL.
- Media deletion protection يعمل بناءً على الاستخدام الحقيقي.
- لا يوجد `Project.images`.
- Project gallery مصدره الوحيد `galleryMediaIds`.
- Project technologies مصدرها `technologySlugs` المرتبطة بـ Technologies.
- Services لديها category فعلي في schema وDTO والفرونت والفلاتر.
- Categories وTags يرسلان slug من الفرونت ولا يحذفانه.
- Tags لديها color في الباك والفرونت.
- كل فئات المشاريع والخدمات والتقنيات والروابط تأتي من Options API.
- لا توجد قيم category متضاربة بين seed والفرونت.
- Public API يرجع URLs جاهزة للعرض.
- Admin API يرجع mediaId وmedia object عند الحاجة.
- Next cache يتم تحديثه بعد عمليات الإدارة عبر revalidate tags.
- `npm run build` للباك ينجح.
- `npm run typecheck` و `npm run build` للفرونت ينجحان.
- لا توجد حلول مؤقتة أو fallback يخفي أخطاء البيانات.

---

## 26) ملخص التنفيذ المطلوب للوكيل

نفّذ إعادة تنظيم شاملة لعلاقات البيانات بين الباك والفرونت بحيث يصبح:

- Media هو المصدر الرسمي لكل الصور والملفات والأيقونات عبر `mediaId`.
- Links هو المصدر الرسمي الوحيد لكل روابط السوشيال والروابط الخارجية العامة.
- Technologies هو المصدر الرسمي لتقنيات المشاريع عبر `technologySlugs`.
- Options API هو المصدر الرسمي لكل الفئات والقوائم الثابتة.
- Public API يرجع حقول URL جاهزة للعرض، بينما Admin API يستخدم `mediaId` وكيانات resolved.
- يتم حذف كل الحقول المكررة أو المتعارضة مثل `Project.images` و `Profile.socialLinks`.
- يتم إصلاح slug في Categories/Tags/Posts بحيث لا يحذفه الفرونت ولا يخالف schema.
- يتم إضافة service category فعلياً لأن السيرفس يفلتر عليه حالياً بدون وجوده في schema.
- يتم إضافة migration/normalization للبيانات الحالية وتقرير واضح بنتائج التحويل.

لا تترك أي بند من الخطة بدون تنفيذ.
