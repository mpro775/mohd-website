# خطة تنفيذ صارمة لتحويل لوحة التحكم إلى لوحة احترافية جداً — Next.js Admin Dashboard

> النطاق: مصادر الفرونت إند المرفقة `frontend.zip`، وتحديداً لوحة الإدارة تحت `src/app/(admin)/admin` وما يرتبط بها من `src/components/admin` و`src/features/admin` و`src/features/media` و`src/lib/api`.

## 0) ملخص الفحص الحالي

المشروع حديث تقنياً من ناحية الإطار الأساسي، لكنه غير مكتمل كلوحة إدارة احترافية:

- المشروع يستخدم حالياً: `Next 16.2.6`، `React 19.2.4`، `Tailwind CSS 4`، `Zod 4`، `React Hook Form`، `Sonner`، و`@tanstack/react-query` موجود لكنه غير مستخدم فعلياً.
- لوحة الإدارة تحتوي تقريباً على 13 صفحة إدارية:
  - dashboard
  - profile
  - projects
  - blog/posts
  - blog/categories
  - blog/tags
  - services
  - technologies
  - links
  - faqs
  - media
  - contact
  - audit-logs
- أغلب الصفحات تعتمد على مكوّن عام واحد: `AdminResourceManager.tsx`.
- `AdminResourceManager` حجمه كبير ومركزي، ويخلط بين: جلب البيانات، الجدول، الفورم، الميديا، الحذف، الترتيب، الأخطاء، والتحكم بالجلسة.
- الجداول عامة جداً وتعرض أعمدة ثابتة لا تناسب كل صفحة.
- لا توجد فلاتر/بحث/فرز/ترقيم صفحات احترافي داخل لوحة الإدارة، ولا يوجد ربط واضح مع URL state.
- الفورمات مبنية يدوياً وليست مبنية على Zod schemas لكل Resource.
- بعض العمليات الخطرة تستخدم `window.confirm` بدلاً من Dialog احترافي قابل للتتبع.
- يوجد استخدام مباشر لـ `<img>` مع تعطيل قاعدة Next بدلاً من `next/image`.
- `next.config.ts` يسمح بصور من أي دومين عبر `hostname: "**"` وهذا يجب تضييقه أمنياً.
- لوحة التحكم الرئيسية تعرض JSON fallback عند عدم وجود stats بدلاً من تصميم تحليلي واضح.
- `@tanstack/react-query` مثبت لكنه غير مستخدم؛ كل الجلب يتم بـ `fetch` داخل `useEffect` غالباً.
- لا توجد طبقة تصميم منظمة للوحة الإدارة: Cards, DataTable, Drawer forms, Filters, Empty/Error states, Breadcrumbs, Command menu.

## 1) القرار المعماري النهائي

يمنع ترقيع `AdminResourceManager` فقط. المطلوب إعادة بناء لوحة التحكم على Architecture احترافية مع إبقاء الـ API contract الحالي.

### الهيكل المطلوب

```txt
src/
  app/
    (admin)/admin/
      (protected)/
        layout.tsx
        loading.tsx
        error.tsx
        dashboard/page.tsx
        profile/page.tsx
        projects/page.tsx
        blog/posts/page.tsx
        blog/categories/page.tsx
        blog/tags/page.tsx
        services/page.tsx
        technologies/page.tsx
        links/page.tsx
        faqs/page.tsx
        media/page.tsx
        contact/page.tsx
        audit-logs/page.tsx
  components/
    ui/                         # shadcn/ui primitives
    admin/
      shell/
      data-table/
      forms/
      resource/
      media/
      dashboard/
      feedback/
  features/
    admin/
      resources/
        projects/
          columns.tsx
          schema.ts
          form.tsx
          queries.ts
          page-client.tsx
        posts/
        categories/
        tags/
        services/
        technologies/
        links/
        faqs/
        profile/
        media/
        contact/
        audit-logs/
  lib/
    api/
      admin-client.ts
      admin-query-keys.ts
      admin-actions.ts
      admin-errors.ts
    auth/
    validators/
    utils/
  providers/
    query-provider.tsx
    theme-provider.tsx
```

## 2) اعتماد المكتبات الحديثة المناسبة لـ Next.js

### احتفظ بما هو موجود

- `next`, `react`, `react-dom` لأنها حديثة بالفعل.
- `tailwindcss@4` و`@tailwindcss/postcss`.
- `zod`.
- `react-hook-form`.
- `@tanstack/react-query` لكن يجب استخدامه فعلياً.
- `sonner`.
- `framer-motion` للأنميشن الخفيف.

### أضف المكتبات التالية

```bash
npm install @tanstack/react-table nuqs next-safe-action class-variance-authority
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-scroll-area @radix-ui/react-alert-dialog
npm install cmdk recharts @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities zustand next-themes react-dropzone
npm install -D vitest @testing-library/react @testing-library/user-event jsdom playwright
```

### shadcn/ui

استخدم shadcn/ui كطبقة UI قابلة للامتلاك والتعديل، وليس كمكتبة سوداء.

```bash
npx shadcn@latest init
npx shadcn@latest add button input textarea select checkbox switch dialog alert-dialog sheet drawer dropdown-menu popover tabs table badge card form command breadcrumb separator skeleton tooltip pagination scroll-area calendar sonner chart
```

> لا تنسَ أن المشروع Tailwind 4، لذلك يجب استخدام إعداد shadcn المتوافق مع Tailwind 4.

## 3) بناء Design System حقيقي للوحة الإدارة

### المطلوب

- إنشاء tokens واضحة في `globals.css`:
  - background
  - foreground
  - card
  - muted
  - border
  - primary
  - secondary
  - success
  - warning
  - danger
  - radius
  - shadow
- دعم Light/Dark بطريقة احترافية عبر `next-themes`.
- عدم استعمال ألوان عشوائية داخل الصفحات مثل `text-red-300` أو `bg-green-500` إلا من خلال tokens أو variant components.
- بناء مكونات مركزية:
  - `AdminPageHeader`
  - `StatsCard`
  - `DataTable`
  - `DataTableToolbar`
  - `DataTablePagination`
  - `StatusBadge`
  - `ConfirmDialog`
  - `ResourceFormDrawer`
  - `FormSection`
  - `SeoFieldsCard`
  - `MediaField`
  - `EmptyState`
  - `ErrorState`
  - `LoadingState`

### ممنوع

- ممنوع تكرار كلاساته طويلة في كل صفحة.
- ممنوع استخدام `confirm()`.
- ممنوع استخدام `<img>` داخل لوحة الإدارة إلا إذا كان هناك سبب قاهر؛ الأصل `next/image`.
- ممنوع أن تكون الجداول كلها بنفس الأعمدة.

## 4) إعادة بناء Admin Shell

### الملفات المستهدفة

- `src/components/admin/AdminShell.tsx`
- `src/config/nav.ts`
- `src/app/(admin)/admin/(protected)/layout.tsx`

### المطلوب

- Sidebar احترافي قابل للطي Collapse.
- Mobile drawer للسايدبار.
- Header يحتوي:
  - Breadcrumbs.
  - Global search / Command menu عبر `cmdk`.
  - Theme toggle.
  - User menu.
  - زر خروج واضح.
- تقسيم القائمة إلى مجموعات:
  - Overview
  - Content
  - Blog
  - Media
  - Communication
  - System
- إضافة active states صحيحة حتى مع nested routes.
- دعم RTL بشكل كامل.
- إضافة `loading.tsx` و`error.tsx` لكل admin protected segment.
- منع أي layout shift عند التحميل.

## 5) إعادة بناء طبقة البيانات Data Layer

### المشكلة الحالية

الجلب يتم مباشرة من المكونات عبر `fetch` و`useEffect`، وهذا يسبب تكرار منطق التحميل والأخطاء والجلسة.

### المطلوب

- إنشاء `QueryProvider` وربطه في admin layout أو root provider.
- إنشاء `adminClient` موحد:
  - `listResource`
  - `getResource`
  - `createResource`
  - `updateResource`
  - `deleteResource`
  - `bulkAction`
  - `reorderResource`
  - `uploadMedia`
- إنشاء query keys ثابتة:

```ts
export const adminQueryKeys = {
  dashboard: ['admin', 'dashboard'],
  resource: (name: string, params: unknown) => ['admin', name, params],
  detail: (name: string, id: string) => ['admin', name, 'detail', id],
};
```

- استخدام React Query في كل صفحات الإدارة:
  - `useQuery` للقوائم.
  - `useMutation` للحفظ والحذف والإجراءات.
  - optimistic update حيث يناسب، خصوصاً reorder/status.
  - invalidation واضح بعد كل mutation.
- استخدام `nuqs` لحفظ البحث والفلاتر والصفحة والفرز داخل URL.
- كل DataTable يجب أن يدعم server-side pagination/sort/filter عبر query params إن كان الباك إند يدعم ذلك، أو client-side مؤقتاً مع تجهيز contract للباك إند.

## 6) استبدال AdminResourceManager

### المطلوب

لا تحذف `AdminResourceManager` مباشرة في أول commit إذا كان سيكسر المشروع. نفذ التالي:

1. أنشئ مكونات جديدة عامة:
   - `ResourcePage`
   - `ResourceDataTable`
   - `ResourceFormDrawer`
   - `ResourceActionsMenu`
2. انقل كل Resource إلى مجلد مستقل يحتوي:
   - `schema.ts`
   - `columns.tsx`
   - `form.tsx`
   - `queries.ts`
   - `page-client.tsx`
3. ابدأ بالصفحات الأكثر تعقيداً:
   - `blog/posts`
   - `projects`
   - `media`
   - `profile`
4. بعد نجاحها، انقل باقي الصفحات.
5. بعد انتهاء كل الصفحات، احذف `AdminResourceManager` أو اتركه فقط كـ legacy غير مستخدم ثم احذفه في آخر commit.

### معيار القبول

- لا توجد أي صفحة مهمة تعتمد على CRUD generic بأعمدة عامة.
- كل صفحة لها أعمدة وفلاتر وفورم وسكيما مناسبة لطبيعة بياناتها.

## 7) DataTable احترافي لكل لوحة

### المكتبات

- `@tanstack/react-table`
- shadcn/ui Table, Dropdown, Checkbox, Badge, Pagination
- `nuqs` لحالة URL

### المزايا المطلوبة في كل جدول

- بحث نصي.
- فلاتر حسب الحالة/التصنيف/النشر/التاريخ حسب الصفحة.
- فرز أعمدة.
- Pagination.
- Column visibility.
- Row actions داخل Dropdown.
- Bulk select.
- Bulk publish/unpublish/archive/delete حيث يدعم الباك إند.
- Skeleton loading مطابق لشكل الجدول.
- Empty state واضح مع CTA مناسب.
- Error state مع Retry.
- Responsive card view على الشاشات الصغيرة.
- عرض التاريخ بصيغة عربية واضحة.
- عدم تداخل الإجراءات داخل صف الجدول.

## 8) Forms احترافية لكل Resource

### المطلوب

- كل صفحة لها Zod schema مستقل.
- React Hook Form + Zod resolver.
- استخدام shadcn Form primitives.
- عرض الأخطاء تحت الحقول وبشكل عربي واضح.
- تقسيم الفورم إلى أقسام:
  - البيانات الأساسية
  - المحتوى
  - الوسائط
  - إعدادات النشر
  - SEO
- فتح الإنشاء/التعديل داخل Drawer أو Sheet، وليس فورم طويل أسفل الجدول.
- إضافة Preview mode حيث يناسب:
  - المقالات Markdown preview.
  - المشاريع preview card.
  - الخدمات preview card.
  - FAQ preview accordion.
- دعم nested fields مثل `seo.metaTitle` بطريقة typed لا يدوية عشوائية.
- دعم arrays بمكوّن chips/repeater بدلاً من comma-separated input.
- دعم multiselect احترافي للتقنيات/tags.
- تعطيل زر الحفظ أثناء الإرسال ومنع double submit.
- عرض API field errors بجانب الحقول الصحيحة.

## 9) لوحة التحكم الرئيسية Dashboard

### المطلوب

استبدال الصفحة الحالية التي تعرض بطاقات عامة وربما JSON fallback بتصميم فعلي:

- Header مع آخر تحديث وزر Refresh.
- KPI cards:
  - إجمالي المشاريع.
  - المقالات المنشورة.
  - الرسائل الجديدة.
  - الوسائط المستخدمة/غير المستخدمة.
  - زيارات أو clicks إن كانت متاحة.
- Charts:
  - نشاط المحتوى حسب الشهر.
  - توزيع المقالات حسب الحالة.
  - clicks للروابط.
  - آخر الرسائل.
- Quick actions:
  - إضافة مقال.
  - إضافة مشروع.
  - رفع ملف.
  - تعديل البروفايل.
- Recent activity timeline من audit logs.
- Health/status cards للباك إند إن كان endpoint موجود.

### ممنوع

- ممنوع عرض `JSON.stringify` للمستخدم النهائي.
- ممنوع أسماء مفاتيح إنجليزية raw داخل البطاقات بدون mapping عربي.

## 10) صفحة Profile

### المطلوب

- تحويلها إلى صفحة إعدادات مقسمة Tabs:
  - البيانات الشخصية.
  - السيرة/about.
  - روابط التواصل.
  - اللغات.
  - الشهادات.
  - SEO.
- دعم repeater للروابط الاجتماعية والشهادات واللغات.
- صورة شخصية عبر MediaPicker.
- CV upload عبر MediaPicker/Upload.
- معاينة public profile card.
- حفظ جزئي أو حفظ واحد شامل حسب API المتاح.

## 11) صفحة Projects

### المطلوب

- جدول مخصص يعرض:
  - صورة الغلاف.
  - العنوان.
  - التصنيف.
  - الحالة.
  - النشر.
  - featured.
  - views إن وجدت.
  - updatedAt.
- فلاتر:
  - status.
  - category.
  - isPublished.
  - featured.
- فورم احترافي:
  - basic info.
  - descriptions.
  - media gallery.
  - technologies chips.
  - links.
  - case study sections.
  - SEO.
- Drag/drop reorder عبر `@dnd-kit/sortable` أو أزرار واضحة، لكن لا تستخدم swap بدائي غير مضمون.
- Preview card قبل الحفظ.

## 12) صفحة Blog Posts

### المطلوب

- جدول مخصص يعرض:
  - featured image.
  - title.
  - status.
  - category.
  - tags count.
  - publishDate/scheduledAt.
  - readTime.
  - views.
- فلاتر:
  - status.
  - category.
  - tag.
  - featured.
  - allowIndexing.
- Markdown editor أفضل من textarea فقط:
  - على الأقل split view editor/preview.
  - sanitize preview كما هو مستخدم في public renderer.
- إدارة category/tags داخل نفس سياق المقال إن أمكن.
- جدولة النشر بوضوح.
- SEO score بسيط:
  - طول العنوان.
  - طول الوصف.
  - وجود ogImage.
  - canonicalUrl.

## 13) Categories و Tags

### المطلوب

- جدول صغير سريع.
- فلاتر نشط/غير نشط.
- Slug preview.
- منع الحذف إذا كان مستخدماً إلا بعد تحذير واضح من الباك إند.
- Bulk activate/deactivate.
- عرض عدد المقالات المرتبطة إذا كان endpoint يدعم.

## 14) Services

### المطلوب

- جدول مخصص يعرض:
  - icon/image.
  - name.
  - price/start price.
  - duration.
  - published.
  - featured.
  - order.
- فورم مقسم:
  - basic.
  - pricing.
  - deliverables repeater.
  - requirements repeater.
  - CTA.
  - SEO.
- معاينة service card.

## 15) Technologies

### المطلوب

- جدول يعرض:
  - logo/icon.
  - name.
  - category/group.
  - proficiency.
  - years.
  - highlighted.
  - published.
- color picker بدلاً من text input للون.
- official URL validation.
- فلاتر category/proficiency/highlighted/published.

## 16) Links

### المطلوب

- جدول يعرض:
  - icon.
  - title.
  - platform.
  - category.
  - clicks.
  - featured.
  - published.
- URL validation.
- open in new tab preview.
- copy tracked/public URL.
- فلاتر platform/category/published/featured.

## 17) FAQs

### المطلوب

- جدول/Accordion preview.
- فلاتر category/published/featured.
- Reorder احترافي.
- answer editor أكبر مع preview.
- SEO fields في قسم منفصل.

## 18) Media Library

### المطلوب

- استبدال upload الحالي بـ Dropzone احترافي عبر `react-dropzone`.
- استخدام `next/image` للصور.
- Grid/List view.
- فلاتر:
  - folder.
  - type.
  - used/unused.
  - date.
- بحث بالاسم وalt.
- عرض metadata:
  - الحجم.
  - النوع.
  - الأبعاد إن وفرها الباك إند.
  - الاستخدام.
- أزرار:
  - copy URL.
  - edit alt/folder.
  - delete with AlertDialog.
- Cleanup unused:
  - يجب أن يكون على مرحلتين: preview ثم confirm بكتابة كلمة تأكيد مثل `DELETE`.
  - لا تستخدم confirm.
- MediaPicker يجب أن يدعم:
  - search.
  - folders.
  - upload inline.
  - selected state.
  - keyboard navigation.

## 19) Contact Messages

### المطلوب

- جدول مخصص:
  - sender.
  - email.
  - subject.
  - status.
  - receivedAt.
- فلاتر status/date/search.
- Details drawer لقراءة الرسالة كاملة.
- Actions:
  - mark as read.
  - mark as replied.
  - copy email.
  - mailto reply.
- عدم عرضها كـ CRUD عام.

## 20) Audit Logs

### المطلوب

- جدول read-only مخصص:
  - actor.
  - action.
  - resource.
  - resourceId.
  - ip/userAgent إن وجد.
  - createdAt.
- فلاتر:
  - action.
  - resource.
  - actor.
  - date range.
- Details drawer يعرض payload/changes بشكل منسق، وليس raw table فقط.
- Export CSV إذا كان مطلوباً ومسموحاً.

## 21) Auth, Security, Proxy

### المطلوب

- تحسين login page:
  - تصميم احترافي.
  - loading state.
  - error messages من API.
  - password visibility toggle.
  - redirect إذا كان مسجلاً بالفعل.
- حماية `/admin`:
  - server-side redirect كما هو موجود.
  - إضافة فحص `/api/auth/me` داخل AdminShell لعرض اسم المستخدم وصلاحياته.
- تحسين cookies:
  - `httpOnly` موجود ويجب الحفاظ عليه.
  - استخدم `sameSite: "strict"` إن لم يكسر تدفق الاستخدام.
  - `secure: true` في الإنتاج.
- تضييق `next.config.ts images.remotePatterns`:
  - لا تترك `hostname: "**"`.
  - استخدم دومينات الباك إند/Storage الفعلية فقط.
- Proxy route:
  - منع تمرير headers غير ضرورية.
  - التعامل مع non-json responses بشكل صحيح، خصوصاً تحميل الملفات إن وجد.
  - إضافة request id اختياري للتتبع.
  - توحيد رسائل 401/403.
- إذا استخدمت Server Actions عبر `next-safe-action`، يجب التحقق من authentication/authorization داخل كل action وعدم الاعتماد على UI فقط.

## 22) Performance و Next.js Patterns

### المطلوب

- تقليل عدد client components.
- الصفحات التي لا تحتاج interactivity تبدأ Server Component ثم تمرر data dehydrated إلى client إذا لزم.
- استخدم `Suspense` و`loading.tsx`.
- Lazy load للمكونات الثقيلة:
  - Markdown preview.
  - charts.
  - media picker.
  - long forms.
- استبدال `<img>` بـ `next/image`.
- منع fetch داخل loops أو useEffect متكرر بدون cache/query.
- استخدام `AbortController` ضمن admin client أو الاعتماد على React Query cancellation.
- التأكد من أن كل صفحة تعمل بدون Layout Shift واضح.

## 23) UX Micro-interactions

### المطلوب

- أنميشن بسيط غير مبالغ فيه:
  - ظهور drawer.
  - hover على cards.
  - table row focus.
  - skeleton transitions.
  - success/error feedback.
- استخدم `framer-motion` بحذر، ولا تجعل كل شيء animated.
- لا تنفذ أنميشن يبطئ الجداول أو يسبب lag.

## 24) Accessibility و RTL

### المطلوب

- كل Dialog/Sheet/Dropdown/Select مبني على Radix/shadcn.
- focus trap صحيح.
- keyboard navigation للجداول والقوائم.
- aria-label للأزرار الأيقونية.
- عدم الاعتماد على اللون فقط للحالة؛ استخدم نص + badge.
- RTL كامل:
  - اتجاه الجدول.
  - موضع الأيقونات.
  - breadcrumbs.
  - dropdown alignment.
  - date formatting.

## 25) Error Handling

### المطلوب

- بناء `AdminApiError` موحد.
- توحيد استخراج:
  - message.
  - field errors.
  - status code.
  - request id.
- أخطاء 401:
  - toast واضح.
  - redirect login.
  - clear cache.
- أخطاء 403:
  - صفحة Forbidden أو state واضح.
- أخطاء validation:
  - لا تكتفِ بـ toast؛ اعرضها داخل الفورم.
- أخطاء network:
  - Retry button.

## 26) اختبارات الجودة

### أضف

- `vitest` لاختبار:
  - admin client.
  - form schemas.
  - helpers.
- `@testing-library/react` لاختبار:
  - DataTable toolbar.
  - ResourceFormDrawer.
  - MediaPicker.
- `playwright` لاختبار e2e:
  - login.
  - create/edit/delete project.
  - create/edit post.
  - upload media.
  - mark contact read.

### أوامر يجب أن تنجح قبل التسليم

```bash
npm run typecheck
npm run lint
npm run build
npm test
npx playwright test
```

إذا لم تكن الاختبارات مضافة بعد، يجب أن تنجح الثلاثة الأولى على الأقل، ولا يعتبر العمل مغلقاً قبل إضافة الحد الأدنى من الاختبارات.

## 27) خطة التنفيذ العملية

### المرحلة 1 — تأسيس UI System

- إضافة shadcn/ui وتثبيت مكونات UI المطلوبة.
- إنشاء `components/ui`.
- بناء tokens والـ theme.
- بناء مكونات Admin المشتركة.
- تحديث AdminShell بالكامل.
- إضافة QueryProvider وThemeProvider.

### المرحلة 2 — Data Layer

- إنشاء admin client.
- إنشاء query keys.
- ربط React Query.
- إنشاء error normalization.
- ربط nuqs للبحث والفلاتر والترقيم.

### المرحلة 3 — DataTable Core

- بناء DataTable عام مبني على TanStack Table.
- دعم:
  - columns.
  - row actions.
  - bulk actions.
  - filters.
  - pagination.
  - sorting.
  - column visibility.
  - responsive cards.

### المرحلة 4 — Forms Core

- بناء ResourceFormDrawer.
- بناء FormSection.
- بناء Field components.
- بناء MediaField.
- بناء ArrayField/RepeaterField.
- بناء SeoFieldsCard.

### المرحلة 5 — نقل الصفحات المعقدة

نفذ بالترتيب:

1. Blog Posts.
2. Projects.
3. Media.
4. Profile.
5. Dashboard.

### المرحلة 6 — نقل الصفحات المتوسطة والبسيطة

نفذ:

1. Services.
2. Technologies.
3. Links.
4. FAQs.
5. Categories.
6. Tags.
7. Contact.
8. Audit Logs.

### المرحلة 7 — حذف القديم وتنظيف المشروع

- إزالة الاعتماد على `AdminResourceManager`.
- حذف الأكواد المكررة.
- حذف التعطيلات غير الضرورية مثل no-img-element.
- توحيد imports.
- إزالة أي مكتبة غير مستخدمة أو استخدام المكتبات المثبتة فعلياً.

### المرحلة 8 — الجودة النهائية

- تشغيل typecheck/lint/build.
- إضافة اختبارات أساسية.
- مراجعة responsive.
- مراجعة RTL.
- مراجعة الأخطاء.
- مراجعة security.
- مراجعة performance.

## 28) معايير الإغلاق النهائي

لا يعتبر العمل منتهياً إلا إذا تحقق التالي:

- كل صفحات لوحة الإدارة أصبحت بتصميم موحد واحترافي.
- لا توجد صفحة CRUD generic بأعمدة غير مناسبة.
- كل صفحة لها schema وcolumns وform خاصة بها.
- كل الجداول تدعم البحث/الفلترة/الفرز/الترقيم أو تظهر سبب عدم الدعم من API.
- كل عمليات الحذف والتنظيف تستخدم AlertDialog وليس confirm.
- كل الفورمات تستخدم React Hook Form + Zod.
- كل البيانات الإدارية تستخدم React Query أو Server Actions typed، وليس useEffect fetch عشوائي.
- كل الفلاتر المهمة محفوظة في URL عبر nuqs.
- لا يوجد `<img>` داخل admin بدون مبرر.
- `remotePatterns` للصور مقيدة بدومينات محددة.
- Dashboard لا تعرض JSON raw.
- Media Library احترافية وتدعم upload/preview/search/folders/cleanup confirmation.
- AdminShell responsive ويدعم mobile.
- `npm run typecheck` ينجح.
- `npm run lint` ينجح.
- `npm run build` ينجح.

## 29) تعليمات صارمة لوكيل الذكاء الاصطناعي

- لا تختصر الخطة.
- لا تترك صفحات قديمة بحجة أنها تعمل.
- لا تنفذ تغييرات شكلية فقط؛ المطلوب إعادة بناء منطقية وتصميمية.
- لا تكسر API contract الحالي.
- لا تضف mock data.
- لا تستخدم localStorage للتوكنات.
- لا تستخدم window.confirm.
- لا تستخدم any إلا عند ضرورة موثقة ومؤقتة.
- لا تنشئ components ضخمة تتجاوز 300 سطر إذا يمكن تقسيمها.
- لا تجعل كل شيء client component.
- لا تترك أخطاء lint أو typecheck.
- لا تغيّر مسارات الصفحات العامة إلا إذا كان ضرورياً.
- لا تنسَ RTL.
- لا تنسَ responsive.
- لا تنسَ accessibility.

## 30) ملاحظات نهائية

هذا المشروع أساسه التقني جيد لأن الإصدارات حديثة، لكن لوحة الإدارة تحتاج إعادة بناء تجربة ومنطق لا مجرد تحسين CSS. الهدف النهائي أن تصبح اللوحة قريبة من جودة لوحات SaaS احترافية: Data tables حقيقية، forms منظمة، media manager قوي، dashboard تحليلي، shell متقن، وطبقة بيانات آمنة وقابلة للصيانة.
