# برومبت صارم لإغلاق الفرونت نهائيًا قبل اعتماد المشروع

## السياق

أنت تعمل على مشروع فرونت لموقع شخصي تقني لمبرمج + مدونة + لوحة إدارة CMS.
المشروع الحالي مبني بـ **Next.js App Router** ويجب الحفاظ على هذا القرار.
الباك إند مغلق نهائيًا ولا نريد تعديله الآن.
المطلوب منك هو إغلاق آخر مشاكل الفرونت فقط حتى يصبح قابلًا للاعتماد النهائي.

## الهدف النهائي

إصلاح العوائق المتبقية التي تمنع قبول الفرونت 100%، ثم التأكد أن أوامر التحقق تعمل بنجاح:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run lint
npm run typecheck
npm run build
```

إذا لم تنجح هذه الأوامر فلا تعتبر المهمة مكتملة.

---

# قواعد صارمة قبل التنفيذ

## ممنوعات

- ممنوع إعادة بناء المشروع من الصفر.
- ممنوع تحويل المشروع إلى Vite أو React Router أو SPA.
- ممنوع إضافة Mock API أو Express local server أو بيانات وهمية بديلة عن الباك إند.
- ممنوع تخزين access token أو refresh token في `localStorage` أو `sessionStorage`.
- ممنوع تعديل الباك إند.
- ممنوع تغيير عقد API من جهة الفرونت بطريقة تخالف الباك إند.
- ممنوع استخدام قيم media folders غير مدعومة من الباك إند.
- ممنوع اعتبار المهمة مكتملة إذا فشل `npm ci` أو `typecheck` أو `build`.

## المطلوب الحفاظ عليه

- Next.js App Router.
- HttpOnly Cookies للـ Auth.
- Admin Proxy لكل طلبات لوحة الإدارة.
- الاتصال بالباك إند الحقيقي عبر:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

- الهوية التقنية للموقع: موقع شخصي لمبرمج / Software Engineer / Full-Stack Developer.

---

# المهام المطلوبة للإغلاق النهائي

## 1. إصلاح مشكلة `npm ci` وملف `package-lock.json`

### المشكلة

`npm ci` يفشل لأن `package-lock.json` غير متزامن مع `package.json` وتظهر أخطاء مثل:

```txt
Missing: @emnapi/runtime@1.10.0 from lock file
Missing: @emnapi/core@1.10.0 from lock file
```

### المطلوب

- حدّث `package-lock.json` ليكون متزامنًا تمامًا مع `package.json`.
- لا تحذف dependencies مستخدمة فعليًا.
- لا تضف dependencies ضخمة أو غير ضرورية.
- استخدم `npm install` لتحديث lockfile عند الحاجة، ثم تأكد أن `npm ci` يعمل بعد ذلك.

### شرط القبول

يجب أن ينجح الأمر:

```bash
npm ci --ignore-scripts --no-audit --no-fund
```

بدون أخطاء.

---

## 2. إضافة ملف `.env.example`

### المشكلة

ملف `.env.example` غير موجود، رغم أن README يذكر المتغيرات.

### المطلوب

أنشئ ملفًا في جذر المشروع باسم:

```txt
.env.example
```

ويحتوي على الأقل:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### أضف تعليقات قصيرة داخل الملف توضّح:

- `NEXT_PUBLIC_API_URL` يجب أن يشير إلى الباك إند الحقيقي وينتهي بـ `/api`.
- `NEXT_PUBLIC_SITE_URL` هو رابط الفرونت العام.
- لا يوجد Mock API.
- لا يوجد Express server داخل الفرونت.

### شرط القبول

- الملف موجود في الجذر.
- القيم الافتراضية مطابقة لما سبق.
- لا توجد متغيرات قديمة تشير إلى Vite مثل `VITE_API_URL`.

---

## 3. إصلاح قيم Media Folders لتطابق الباك إند

### المشكلة

الفرونت يستخدم قيم folders غير مدعومة مثل:

```txt
uploads
images
posts
```

بينما الباك إند يقبل فقط:

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

أي قيمة خارج هذه القائمة قد تسبب فشل رفع الوسائط.

### المطلوب

- ابحث في المشروع كاملًا عن أي استخدام لقيم folder غير مدعومة.
- استبدلها بالقيم الرسمية التالية فقط:

```ts
export const MEDIA_FOLDERS = [
  'profile',
  'projects',
  'blog',
  'services',
  'technologies',
  'links',
  'cv',
  'misc',
] as const;
```

- اجعل `MediaPicker` و `MediaAdmin` يستخدمان هذه القائمة فقط.
- لا تسمح للمستخدم بإرسال folder حر أو نص غير مطابق.
- حدّد folder مناسب حسب السياق:
  - صورة البروفايل: `profile`
  - صور المشاريع: `projects`
  - صور المقالات: `blog`
  - صور الخدمات: `services`
  - أيقونات التقنيات: `technologies`
  - أيقونات الروابط: `links`
  - السيرة الذاتية: `cv`
  - غير ذلك: `misc`

### شرط القبول

- لا يوجد في الكود أي إرسال لـ `uploads` أو `images` أو `posts` كـ folder.
- كل عمليات رفع الوسائط ترسل folder من القائمة الرسمية فقط.
- `typecheck` لا يحتوي أخطاء متعلقة بـ folder types.

---

## 4. ضمان أن Dashboard يستخدم Admin Proxy و Refresh Retry

### المشكلة

بعض أجزاء Dashboard قد لا تمر عبر admin-proxy أو لا تستفيد من refresh retry عند 401.

### المطلوب

- راجع صفحة/مكونات Dashboard بالكامل.
- أي طلب إداري يجب أن يمر عبر:

```txt
/api/admin-proxy/...
```

وليس مباشرة إلى الباك إند من المتصفح.

- تأكد أن Dashboard يستخدم نفس admin API client المستخدم في باقي لوحة الإدارة.
- لا تستخدم fetch مباشر إلى `NEXT_PUBLIC_API_URL` من داخل مكونات client في لوحة الإدارة.
- تأكد أن refresh retry يعمل مرة واحدة عند 401 ثم يعيد الطلب.

### شرط القبول

- جميع طلبات Dashboard الإدارية تمر عبر admin-proxy.
- لا توجد token headers مبنية يدويًا من localStorage.
- عند انتهاء access token، يتم refresh ثم إعادة الطلب تلقائيًا مرة واحدة.

---

## 5. إصلاح Reorder للموارد غير FAQ

### المشكلة

FAQ reorder موجود، لكن موارد أخرى قد تستخدم تعديل `sortOrder` يدويًا بدل endpoint reorder الحقيقي.

### المطلوب

راجع الموارد التالية إن كانت موجودة في لوحة الإدارة:

- Projects
- Services
- Technologies
- Links
- FAQs
- Categories
- Tags

عند وجود دعم reorder في الباك إند، يجب استخدام endpoint reorder الرسمي بدل حلول محلية غير متطابقة.

### المطلوب تنفيذه

- أضف أزرار أو واجهة بسيطة للترتيب إذا لم تكن موجودة.
- ليس مطلوبًا drag/drop متقدم.
- يكفي:
  - زر رفع للأعلى.
  - زر إنزال للأسفل.
  - أو إعادة ترتيب قائمة ثم إرسال batch reorder.

### شرط القبول

- Reorder يستخدم endpoint الحقيقي للباك إند لكل مورد يدعمه.
- لا يتم الاعتماد فقط على تعديل item منفرد إذا كان endpoint reorder موجودًا.
- بعد إعادة الترتيب يتم تحديث القائمة وإظهار الترتيب الجديد.

---

## 6. إصلاح Profile عند عدم وجود Profile أولي

### المشكلة

صفحة Profile Admin قد تفترض أن profile موجود مسبقًا، وهذا قد يكسر الصفحة أو الحفظ في بيئة جديدة.

### المطلوب

- عند جلب profile من admin endpoint:
  - إذا رجع profile موجود، اعرضه للتعديل.
  - إذا لم يوجد profile، اعرض form فارغ بقيم آمنة.
- عند الحفظ، استخدم endpoint الصحيح في الباك إند.
- لا تستخدم endpoint فيه `:id` إذا كان الباك إند يعتمد endpoint بدون id.

### endpoint الصحيح المتوقع

```txt
GET /api/admin/profile
PUT /api/admin/profile
```

أو عبر الفرونت:

```txt
/api/admin-proxy/admin/profile
```

حسب نظام admin-proxy الموجود.

### شرط القبول

- صفحة البروفايل لا تنهار عند عدم وجود بيانات.
- يمكن إنشاء/تحديث profile من نفس الصفحة.
- لا يتم استخدام `PUT /admin/profile/:id` إن لم يكن موجودًا في الباك إند.

---

## 7. إكمال SEO الديناميكي للصفحات الناقصة

### المشكلة

SEO جيد جزئيًا، لكنه ناقص في بعض صفحات التفاصيل والتصنيفات.

### المطلوب

تأكد من وجود metadata ديناميكية مناسبة للصفحات التالية عند وجودها:

- `/projects/[slug]`
- `/services/[slug]` إن كانت موجودة
- `/technologies/[slug]` إن كانت موجودة
- `/blog/category/[slug]`
- `/blog/tag/[slug]`
- `/blog/[slug]`

### يجب أن تحتوي metadata على:

- `title`
- `description`
- `canonical`
- `openGraph`
- `twitter`
- صورة مناسبة عند توفرها

### Structured Data

أضف structured data مناسبًا عند الحاجة:

- Article schema لصفحات المقالات.
- CreativeWork أو SoftwareSourceCode أو Project-like schema للمشاريع إذا كان مناسبًا.
- BreadcrumbList للصفحات التفصيلية والتصنيفات.

### شرط القبول

- لا توجد صفحة detail مهمة بدون `generateMetadata` أو metadata ديناميكية مكافئة.
- روابط canonical تستخدم `NEXT_PUBLIC_SITE_URL`.
- لا توجد metadata hardcoded عامة لكل التفاصيل.

---

## 8. مراجعة RSS النهائي

### المطلوب

- تأكد أن `/rss.xml` موجود ويعمل.
- يجب أن يجلب المقالات المنشورة من الباك إند الحقيقي.
- لا يعتمد على بيانات وهمية.
- يجب أن يرجع XML صحيح.

### شرط القبول

فتح المسار:

```txt
/rss.xml
```

يرجع RSS XML صالحًا للمقالات المنشورة.

---

## 9. تنظيف نهائي لأي أثر قديم أو مخالف

### المطلوب

تأكد من عدم وجود الملفات التالية:

```txt
vite.config.ts
index.html
src/main.tsx
src/App.tsx
src/App.css
server.ts
data-store.json
```

وتأكد من عدم وجود dependency:

```txt
react-router-dom
```

وتأكد من عدم وجود env قديم:

```txt
VITE_API_URL
```

### شرط القبول

- المشروع Next.js فقط.
- لا يوجد mock server.
- لا يوجد Vite.
- لا يوجد React Router.

---

## 10. تشغيل أوامر القبول النهائية

بعد تنفيذ كل ما سبق، شغّل:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run lint
npm run typecheck
npm run build
```

إذا كان `typecheck` غير موجود في `package.json` أضفه:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

### شرط القبول النهائي

يجب أن تنجح كل الأوامر بدون errors.

Warnings غير الحرجة مقبولة مؤقتًا بشرط ألا تمنع build أو typecheck، لكن لا تترك warnings في الملفات التي عدّلتها إذا كان إصلاحها بسيطًا.

---

# مخرجات مطلوبة من وكيل التنفيذ

بعد الانتهاء، اكتب تقريرًا مختصرًا يحتوي على:

1. الملفات التي تم تعديلها.
2. كيف تم إصلاح `package-lock.json`.
3. أين تمت إضافة `.env.example`.
4. أين تم توحيد media folders.
5. كيف تم ضمان Dashboard عبر admin-proxy.
6. ما الموارد التي تم دعم reorder لها.
7. كيف تم إصلاح Profile empty state.
8. ما الصفحات التي تم تحسين SEO لها.
9. نتيجة الأوامر:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run lint
npm run typecheck
npm run build
```

---

# تعريف الإغلاق النهائي

لا تعتبر المهمة مكتملة إلا إذا تحقق كل ما يلي:

```txt
- npm ci يعمل.
- npm run lint يعمل.
- npm run typecheck يعمل.
- npm run build يعمل.
- .env.example موجود.
- Media folders مطابقة للباك إند فقط.
- Dashboard يستخدم admin-proxy.
- Profile يعمل حتى لو لا توجد بيانات أولية.
- Reorder يستخدم endpoints حقيقية عند توفرها.
- SEO الديناميكي مكتمل للصفحات المهمة.
- /rss.xml يعمل.
- لا توجد بقايا Vite أو React Router أو Mock API.
```

إذا تعارض أي جزء من هذا البرومبت مع الكود الحالي، اتبع هذا البرومبت لأنه يمثل قرار الإغلاق النهائي.
