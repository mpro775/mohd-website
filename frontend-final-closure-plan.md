# خطة الإغلاق النهائي للفرونت — توافق 100% مع خطة V2 والباك إند النهائي

## الهدف

إغلاق الفرونت الحالي نهائيًا بدون إعادة بناء من الصفر، وتحويله إلى نسخة متوافقة 100% مع:

- خطة الفرونت V2.
- الباك إند النهائي.
- موقع شخصي تقني لمبرمج.
- مدونة تقنية احترافية.
- لوحة إدارة محتوى CMS حقيقية.
- SEO قوي ومناسب للفهرسة.

هذه الخطة مخصصة لوكيل AI أو المطور المنفذ، ويجب تنفيذها كاملة بدون انتقاء أو تأجيل، باستثناء الاختبارات الموسعة إذا تقرر تأجيلها لاحقًا.

---

## القرار التنفيذي النهائي

لا تعيد بناء المشروع من الصفر.

النسخة الحالية أصبحت في الاتجاه الصحيح لأنها:

- مبنية على Next.js App Router.
- لا تحتوي على Vite.
- لا تحتوي على React Router.
- لا تحتوي على Mock API أو Express server.
- تحتوي على هوية تقنية مناسبة لموقع مبرمج.
- تحتوي على لوحة إدارة مبدئية.

المطلوب الآن هو إغلاق المشاكل المانعة فقط، وتنظيف المشروع، وإكمال التكامل مع الباك إند.

---

## ممنوعات نهائية

يمنع تمامًا:

- الرجوع إلى Vite.
- استخدام React Router.
- إنشاء Mock API أو Express server داخل الفرونت.
- تخزين accessToken أو refreshToken في localStorage.
- استخدام JSON Editor كحل نهائي لإدارة المحتوى.
- إرسال حقول غير موجودة في DTOs الخاصة بالباك إند.
- تنفيذ حذف حقيقي عبر GET.
- تجاهل MediaPicker والاكتفاء بإدخال روابط يدويًا.
- إرسال `slug` من لوحة الإدارة إذا كان الباك إند يولده تلقائيًا.
- اعتبار المشروع مغلقًا قبل نجاح `lint/typecheck/build`.

---

# 1. إصلاح طبقة الاتصال بالباك إند

## المشكلة

يوجد خطأ في بناء روابط API يجعل المسارات العامة تذهب إلى رابط خاطئ إذا كانت قيمة:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

مثال الخطأ:

```txt
/public/profile
```

قد تتحول إلى:

```txt
http://localhost:3000/public/profile
```

بدل:

```txt
http://localhost:3000/api/public/profile
```

## المطلوب

تعديل `src/lib/api/client.ts` أو أي API client مكافئ بحيث يحافظ دائمًا على `/api` الموجودة في `NEXT_PUBLIC_API_URL`.

## القاعدة النهائية

إذا كان:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

فإن:

```txt
/public/profile
```

يجب أن يذهب إلى:

```txt
http://localhost:3000/api/public/profile
```

و:

```txt
/admin/profile
```

يجب أن يذهب إلى:

```txt
http://localhost:3000/api/admin/profile
```

## شروط القبول

- لا يتم حذف `/api` من base URL.
- كل public calls تعمل مع `NEXT_PUBLIC_API_URL` الذي يحتوي `/api`.
- كل admin calls تمر عبر proxy داخلي عند الحاجة ولا تتصل مباشرة من المتصفح بالباك إند مع التوكن.

---

# 2. إضافة ملف `.env.example`

## المطلوب

إضافة ملف في جذر المشروع:

```txt
.env.example
```

ويحتوي على الأقل:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

## يجب توضيح التالي داخل الملف أو README

- `NEXT_PUBLIC_API_URL` يجب أن يشير إلى الباك إند الحقيقي.
- لا يوجد Mock API.
- لا يوجد Express server محلي.
- في الإنتاج يتم تغيير `NEXT_PUBLIC_SITE_URL` إلى دومين الموقع الحقيقي.

## شروط القبول

- يستطيع أي مطور نسخ `.env.example` إلى `.env.local` وتشغيل المشروع مباشرة.
- لا توجد متغيرات مستخدمة في الكود وغير موثقة.

---

# 3. إغلاق Auth و Admin Proxy

## الوضع المطلوب

يجب أن يكون نظام المصادقة كالتالي:

- `accessToken` في HttpOnly cookie.
- `refreshToken` في HttpOnly cookie.
- لا يوجد تخزين للتوكنات في localStorage أو sessionStorage.
- كل طلبات لوحة الإدارة تمر عبر `/api/admin-proxy` أو route handlers آمنة.
- عند `401` يتم تنفيذ refresh مرة واحدة ثم إعادة الطلب الأصلي.

## المطلوب إصلاحه

### Logout

حاليًا قد يتم حذف الكوكيز فقط من الفرونت بدون إلغاء الجلسة في الباك إند.

يجب تعديل route مثل:

```txt
/api/auth/logout
```

ليعمل كالتالي:

1. قراءة `refreshToken` من HttpOnly cookie.
2. إرسال:

```txt
POST /api/auth/logout
```

إلى الباك إند مع `refreshToken` في body.

3. حذف cookies بعد نجاح أو فشل الطلب.
4. إعادة response واضح للفرونت.

## شروط القبول

- لا يوجد أي استخدام لـ localStorage للتوكنات.
- logout يلغي refresh token في الباك إند.
- refresh retry يحدث مرة واحدة فقط لتجنب infinite loop.
- عند فشل refresh يتم إخراج المستخدم إلى login.

---

# 4. إصلاح إدارة Profile

## المشكلة

الفرونت يستخدم أو قد يستخدم:

```txt
PUT /admin/profile/:id
```

بينما الباك إند النهائي يعتمد:

```txt
GET /api/admin/profile
PUT /api/admin/profile
```

بدون `id`.

## المطلوب

تعديل صفحة إدارة البروفايل لاستخدام endpoints الصحيحة:

```txt
GET /admin/profile
PUT /admin/profile
```

من خلال admin proxy.

## يجب دعم تعديل

- الاسم.
- العنوان الوظيفي.
- السيرة المختصرة.
- السيرة الطويلة.
- الصورة الشخصية.
- روابط التواصل.
- بيانات SEO.
- صورة Open Graph.

## شروط القبول

- حفظ البروفايل يعمل بدون 404.
- لا يتم إرسال id في endpoint.
- لا يتم إرسال حقول غير مدعومة من الباك إند.

---

# 5. مطابقة DTOs مع الباك إند النهائي

يجب مراجعة كل forms و API payloads والتأكد أنها تطابق DTOs في الباك إند حرفيًا.

الباك إند يستخدم validation صارم، وأي حقل زائد قد يسبب `400 Bad Request`.

---

## 5.1 المقالات Posts

### ممنوع إرسال

```txt
slug
```

من لوحة الإدارة إذا كان الباك إند يولده تلقائيًا.

### يجب إرسال

```txt
title
excerpt
content
coverImage
category
tags
status
isFeatured
readTime
seo
publishedAt
```

حسب DTO الحقيقي في الباك إند.

### قواعد مهمة

- `category` يجب أن يكون ObjectId.
- `tags` يجب أن تكون ObjectId array.
- `readTime` يجب أن يكون رقمًا وليس نصًا.
- `status` يجب أن يطابق enum الباك إند.
- `content` يجب أن يكون HTML/Markdown حسب ما يعتمده الباك إند، بدون حقول زائدة.

### شروط القبول

- إنشاء مقال جديد ينجح.
- تعديل مقال ينجح.
- اختيار التصنيف يتم من قائمة تصنيفات قادمة من الباك إند.
- اختيار الوسوم يتم من قائمة وسوم قادمة من الباك إند.
- لا يحتاج المدير إلى كتابة ObjectId يدويًا.

---

## 5.2 التصنيفات Categories

### ممنوع إرسال

```txt
slug
```

إذا كان الباك إند يولده تلقائيًا.

### المطلوب

مطابقة payload مع DTO الحقيقي، مثل:

```txt
name
description
isActive
sortOrder
seo
```

فقط إذا كانت هذه الحقول مدعومة.

### شروط القبول

- إنشاء تصنيف يعمل.
- تعديل تصنيف يعمل.
- لا توجد حقول غير مدعومة.

---

## 5.3 الوسوم Tags

### ممنوع إرسال حقول غير مدعومة مثل

```txt
slug
color
description
```

إلا إذا كانت موجودة فعلًا في DTO الباك إند.

### المطلوب

إرسال الحقول المدعومة فقط، غالبًا:

```txt
name
isActive
sortOrder
```

حسب DTO الحقيقي.

### شروط القبول

- إنشاء وسم يعمل.
- تعديل وسم يعمل.
- لا توجد أخطاء validation بسبب حقول زائدة.

---

## 5.4 المشاريع Projects

يجب التأكد من استخدام الحقول الصحيحة:

```txt
title
shortDescription
detailedDescription
images
technologies
projectUrl
githubUrl
status
isFeatured
sortOrder
seo
```

حسب DTO الحقيقي.

### ممنوع

- الاعتماد على `description` بدل `detailedDescription`.
- إرسال `featured` بدل `isFeatured`.
- إرسال slug من لوحة الإدارة إذا لم يكن مدعومًا.

### شروط القبول

- إنشاء مشروع يعمل.
- تعديل مشروع يعمل.
- الصور يتم اختيارها عبر MediaPicker.
- التقنيات يتم إدخالها/اختيارها بشكل مطابق للباك إند.

---

## 5.5 الخدمات Services

يجب استخدام:

```txt
detailedDescription
isFeatured
```

وليس:

```txt
description
featured
```

إلا إذا كانت DTOs تقول غير ذلك.

### شروط القبول

- إنشاء خدمة يعمل.
- تعديل خدمة يعمل.
- الخدمات العامة تظهر في صفحة الخدمات.

---

## 5.6 التقنيات Technologies

يجب استخدام enum الباك إند:

```txt
beginner
intermediate
advanced
expert
```

وليس:

```txt
Beginner
Intermediate
Advanced
Expert
```

ويجب التأكد من اسم حقل التمييز:

```txt
highlighted
```

وليس:

```txt
featured
```

إذا كان هذا هو الاسم في الباك إند.

### شروط القبول

- إنشاء تقنية يعمل.
- تعديل تقنية يعمل.
- proficiencyLevel يرسل بالقيم الصحيحة.

---

## 5.7 الروابط Links

يجب استخدام:

```txt
isFeatured
```

وليس:

```txt
featured
```

حسب DTO الحقيقي.

### شروط القبول

- إنشاء رابط يعمل.
- تعديل رابط يعمل.
- الروابط العامة تظهر بشكل صحيح.

---

# 6. إلغاء أو إصلاح `search` غير المدعوم

## المشكلة

الفرونت يرسل `search` في بعض القوائم، بينما الباك إند لا يدعمه في كل DTOs.

## القرار النهائي

لا ترسل أي query param غير موجود في `API_CONTRACT.md`.

## الحلول المقبولة

استخدم أحد الحلول التالية:

1. إزالة search UI مؤقتًا من الموارد غير المدعومة.
2. تنفيذ البحث محليًا بعد جلب البيانات.
3. ترك حقل البحث فقط للموارد التي يدعمها الباك إند رسميًا.

## شروط القبول

- لا يوجد request يرسل:

```txt
?search=
```

إلا إذا كان endpoint يدعمه رسميًا.

---

# 7. بناء MediaPicker حقيقي

## الهدف

لا يجوز إجبار المدير على نسخ روابط الصور يدويًا.

يجب بناء مكون موحد:

```txt
MediaPicker
```

## يستخدم في

- Profile avatar.
- Profile SEO image.
- Project cover/images.
- Post cover image.
- Service icon/image إذا كانت مدعومة.
- Technology icon إذا كانت مدعومة.
- Social link icon إذا كانت مدعومة.

## يجب أن يدعم

- فتح مكتبة الوسائط في Dialog أو Drawer.
- عرض الملفات من الباك إند.
- Pagination حسب `meta`.
- فلترة حسب النوع أو المجلد إن كان مدعومًا.
- رفع ملف جديد.
- إرسال `folder` عند الرفع.
- إرسال `alt` إن كان مدعومًا.
- اختيار صورة موجودة.
- معاينة الصورة المختارة.
- حذف الاختيار.
- نسخ URL.

## قواعد الرفع

عند رفع الوسائط يجب إرسال:

```txt
file
folder
alt
```

حسب DTO/endpoint الباك إند.

## شروط القبول

- يمكن اختيار صورة مقال بدون كتابة URL يدويًا.
- يمكن اختيار صور مشروع بدون كتابة URL يدويًا.
- يمكن رفع صورة جديدة من داخل MediaPicker.
- MediaPicker يستخدم endpoints الحقيقية للباك إند.

---

# 8. إضافة واجهة Media Cleanup

## الباك إند يدعم

```txt
GET /api/admin/media/unused
POST /api/admin/media/cleanup-unused
```

## المطلوب في لوحة الإدارة

داخل صفحة Media أو صفحة فرعية:

- زر: فحص الملفات غير المستخدمة.
- عرض قائمة الملفات غير المستخدمة.
- عرض الحجم/النوع/الرابط إن توفر.
- زر حذف نهائي.
- Dialog تأكيد قبل الحذف.
- الحذف يستخدم POST فقط.

## ممنوع

- ممنوع حذف ملفات عبر GET.

## شروط القبول

- `GET /media/unused` للمعاينة فقط.
- `POST /media/cleanup-unused` للحذف الحقيقي فقط.
- يوجد تأكيد قبل الحذف.

---

# 9. إضافة واجهات Reorder

## الموارد المطلوبة

إضافة تحكم ترتيب للموارد التي يدعمها الباك إند:

- Projects.
- Services.
- Technologies.
- Links.
- FAQs.
- Categories/Tags إذا كانت reorder مدعومة.

## الحل المقبول

ليس شرطًا تنفيذ drag/drop الآن.

يمكن استخدام:

- أزرار أعلى/أسفل.
- حقل `sortOrder` واضح.
- صفحة ترتيب بسيطة.

لكن يجب استخدام endpoint reorder الحقيقي عند وجوده.

## شروط القبول

- يستطيع المدير ترتيب العناصر المهمة.
- الترتيب يظهر في public pages.
- لا يتم ترتيب الواجهة فقط بدون حفظ في الباك إند.

---

# 10. إكمال FAQ Admin

## المطلوب

بما أن FAQ أصبح جزءًا من الباك إند، يجب أن تكون إدارته كاملة.

يجب توفير:

- قائمة FAQs.
- إنشاء FAQ.
- تعديل FAQ.
- حذف FAQ.
- Publish.
- Unpublish.
- Reorder.

## شروط القبول

- كل endpoints الخاصة بـ FAQ ممثلة في لوحة الإدارة.
- الأسئلة المنشورة تظهر في public site.
- الأسئلة غير المنشورة لا تظهر في public site.

---

# 11. استبدال JSON Editor بنماذج CMS حقيقية

## المشكلة

أي صفحة إدارة تعتمد على JSON خام لا تعتبر CMS احترافي.

## المطلوب

تحويل الموارد الأساسية إلى forms واضحة:

- Profile form.
- Project form.
- Post form.
- Category form.
- Tag form.
- Service form.
- Technology form.
- Link form.
- FAQ form.

## التقنيات المطلوبة

استخدم:

```txt
React Hook Form
Zod
shadcn/ui
```

أو نظام مكافئ موجود في المشروع، بشرط ألا يكون JSON editor هو الحل النهائي.

## شروط القبول

- المدير لا يكتب JSON يدويًا.
- كل form فيه validation واضح.
- كل form يرسل payload مطابق للباك إند.
- تظهر رسائل خطأ واضحة عند فشل الحفظ.

---

# 12. إكمال SEO الديناميكي

## الهدف

الموقع تقني لمبرمج، والمدونة والمشاريع يجب أن تكون قابلة للفهرسة باحتراف.

## المطلوب إضافة metadata ديناميكية لـ

- `/`
- `/about`
- `/projects`
- `/projects/[slug]`
- `/services`
- `/services/[slug]` إذا كانت موجودة.
- `/technologies`
- `/blog`
- `/blog/[slug]`
- `/blog/category/[slug]`
- `/blog/tag/[slug]`
- `/contact`

## كل صفحة يجب أن تحتوي

- title.
- description.
- canonical.
- Open Graph.
- Twitter Card.
- image.
- structured data عند الحاجة.

## Structured Data المطلوب

- BlogPosting للمقالات.
- Person للبروفايل.
- CreativeWork أو SoftwareSourceCode للمشاريع حسب الأنسب.
- BreadcrumbList لصفحات التفاصيل.

## شروط القبول

- صفحات التفاصيل لا تستخدم metadata عامة فقط.
- كل مقال له metadata من بيانات المقال.
- كل مشروع له metadata من بيانات المشروع.
- canonical صحيح ويستخدم `NEXT_PUBLIC_SITE_URL`.

---

# 13. إصلاح RSS Route

## المشكلة

RSS موجود حاليًا أو قد يكون موجودًا في:

```txt
/api/rss
```

لكن المطلوب النهائي:

```txt
/rss.xml
```

## المطلوب

إضافة route:

```txt
/rss.xml
```

يرجع XML صحيح للمقالات المنشورة.

## شروط القبول

- فتح `/rss.xml` يرجع XML.
- لا يرجع JSON.
- يحتوي على المقالات المنشورة فقط.
- يستخدم روابط الموقع من `NEXT_PUBLIC_SITE_URL`.

---

# 14. تحسين صفحات التفاصيل العامة

## 14.1 صفحة تفاصيل المشروع

يجب أن تعرض المشروع كـ case study تقني، وليس بطاقة عادية.

### يجب أن تحتوي

- عنوان المشروع.
- وصف مختصر.
- المشكلة أو السياق.
- الحل.
- التقنيات المستخدمة.
- الصور.
- رابط Live Demo إن وجد.
- رابط GitHub إن وجد.
- حالة المشروع.
- SEO.
- مشاريع ذات صلة إن أمكن.

## 14.2 صفحة تفاصيل المقال

يجب أن تكون تجربة قراءة احترافية.

### يجب أن تحتوي

- عنوان المقال.
- التصنيف.
- الوسوم.
- مدة القراءة.
- تاريخ النشر.
- صورة الغلاف.
- المحتوى.
- جدول محتويات إن أمكن.
- مقالات ذات صلة إن أمكن.
- أزرار مشاركة.

## 14.3 صفحة الخدمات

إذا كان الباك إند يدعم slug للخدمات، يمكن بناء صفحة تفاصيل خدمة.

إذا لم يكن ذلك ضمن العقد الحالي، تبقى الخدمات في صفحة واحدة بشكل احترافي.

## شروط القبول

- صفحات التفاصيل لا تكون مجرد JSON أو عرض خام.
- الهوية التقنية للمبرمج واضحة.
- المحتوى قابل للقراءة على الجوال.

---

# 15. تحسين حالات Loading / Empty / Error

كل صفحة عامة وإدارية يجب أن تحتوي على:

- Loading state.
- Empty state.
- Error state.
- Retry action عند فشل الطلب.
- رسالة واضحة عند عدم وجود بيانات.

## ممنوع

- صفحة بيضاء عند الخطأ.
- جدول فارغ بدون رسالة.
- Button حفظ بدون حالة loading.
- تجاهل أخطاء API.

## شروط القبول

- كل request مهم له حالة loading/error.
- رسائل الخطأ مفهومة.
- المستخدم يستطيع إعادة المحاولة.

---

# 16. تنظيف المشروع نهائيًا

## يجب التأكد من عدم وجود

```txt
vite.config.ts
index.html
src/main.tsx
src/App.tsx
src/App.css
react-router-dom
mock server
server.ts
data-store.json
info.md
```

إلا إذا كان الملف له سبب واضح وليس من بقايا النسخ القديمة.

## يجب أيضًا

- حذف imports غير مستخدمة.
- حذف components قديمة غير مستخدمة.
- حذف API clients قديمة.
- توحيد أسماء الملفات والمسارات.
- تحديث README.

## شروط القبول

- لا توجد بقايا Vite/React Router.
- لا توجد API mock.
- لا توجد مسارات قديمة متروكة.

---

# 17. أوامر القبول النهائية

يجب أن تنجح هذه الأوامر قبل التسليم:

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

إذا لم يكن `typecheck` موجودًا، يجب إضافته في `package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

## شروط القبول

- `npm run lint` بدون errors.
- `npm run typecheck` بدون errors.
- `npm run build` ناجح.
- لا يتم تعطيل TypeScript أو ESLint للهروب من الأخطاء.

---

# ترتيب التنفيذ الإجباري

يجب تنفيذ الخطة بهذا الترتيب:

```txt
1. إصلاح API client و env.
2. إصلاح Auth / logout / refresh.
3. إصلاح DTO mappings.
4. إصلاح Profile endpoint.
5. بناء MediaPicker.
6. بناء CMS forms بدل JSON editor.
7. إضافة Media cleanup و Reorder.
8. إكمال FAQ admin.
9. إكمال SEO و RSS.
10. تحسين صفحات التفاصيل والحالات.
11. تنظيف المشروع.
12. تشغيل lint/typecheck/build.
```

لا تبدأ بتجميل الواجهة قبل إصلاح العقد والتكامل.

---

# قائمة التحقق النهائية

لا يعتبر الفرونت مغلقًا 100% إلا إذا تحقق التالي:

```txt
[ ] المشروع Next.js App Router فقط.
[ ] لا توجد بقايا Vite.
[ ] لا يوجد React Router.
[ ] لا يوجد Mock API.
[ ] NEXT_PUBLIC_API_URL يحافظ على /api.
[ ] يوجد .env.example.
[ ] كل public pages تجلب بيانات من الباك إند الحقيقي.
[ ] كل admin pages تمر عبر admin-proxy.
[ ] لا يوجد localStorage للتوكنات.
[ ] logout يلغي refresh token في الباك إند.
[ ] refresh retry يعمل مرة واحدة عند 401.
[ ] Profile يستخدم /admin/profile بدون id.
[ ] كل create/update يرسل DTO مطابق للباك إند.
[ ] لا يتم إرسال slug من admin forms إذا كان غير مدعوم.
[ ] category/tags في المقالات ترسل ObjectIds.
[ ] readTime رقم.
[ ] proficiencyLevel يستخدم enum الصحيح.
[ ] لا يوجد JSON editor كحل نهائي.
[ ] يوجد MediaPicker مستخدم فعليًا.
[ ] رفع الوسائط يرسل folder.
[ ] توجد واجهة media cleanup.
[ ] الحذف الحقيقي للوسائط يتم عبر POST فقط.
[ ] توجد واجهات reorder للموارد المدعومة.
[ ] FAQ admin كامل.
[ ] SEO ديناميكي لصفحات التفاصيل.
[ ] /rss.xml يعمل.
[ ] loading/empty/error states موجودة.
[ ] README محدث.
[ ] npm run lint ينجح.
[ ] npm run typecheck ينجح.
[ ] npm run build ينجح.
```

---

# النتيجة المتوقعة بعد التنفيذ

بعد تنفيذ هذه الخطة، يصبح الفرونت:

- مطابقًا لخطة V2.
- متوافقًا مع الباك إند النهائي.
- مناسبًا لموقع شخصي تقني لمبرمج.
- مناسبًا لمدونة تقنية قابلة للفهرسة.
- يحتوي على CMS حقيقي.
- جاهزًا للفحص النهائي ثم مرحلة المحتوى واللمسات البصرية.

