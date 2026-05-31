# خطة تنفيذ الفرونت من الصفر — موقع شخصي احترافي + مدونة + لوحة إدارة

> هذا الملف موجّه لوكيل ذكاء اصطناعي لينفّذ الفرونت كاملًا بناءً على الباك إند الحالي بعد إغلاق إصلاحاته. لا تتعامل معه كاقتراحات اختيارية؛ المطلوب تنفيذ كل البنود حتى يصبح المشروع جاهزًا للربط والتطوير النهائي.


---

## -1) تعريف المنتج قبل التنفيذ

نفّذ الفرونت على أنه **موقع شخصي تقني لمبرمج** مع مدونة تقنية ولوحة إدارة محتوى، وليس قالب portfolio عام.

### الهوية المطلوبة

- Professional Software Engineer / Full‑Stack Developer identity.
- واجهة حديثة، تقنية، هادئة، وقابلة للقراءة.
- إبراز المشاريع كـ case studies وليس كبطاقات صور فقط.
- إبراز التقنيات كخبرة عملية مرتبطة بالمشاريع والمقالات.
- مدونة تقنية قابلة للفهرسة والقراءة الطويلة.
- لوحة إدارة تساعد صاحب الموقع على تحديث المحتوى دون تعديل الكود.

### افتراض الباك إند

ابدأ التنفيذ على أساس أن الباك إند أُغلق نهائيًا حسب خطة الإصلاح السابقة. لا تبنِ حلولًا لعيوب قديمة مثل غياب `meta` أو استخدام ObjectId في public filters.

---

## 0) قواعد إلزامية قبل التنفيذ

### ممنوعات

- ممنوع بناء صفحات mock وتتركها كأنها نهائية.
- ممنوع استخدام بيانات hardcoded بدل API إلا في النصوص الثابتة.
- ممنوع تخزين refresh token في localStorage أو sessionStorage.
- ممنوع جعل الموقع العام كله Client Components.
- ممنوع تجاهل SEO للصفحات العامة.
- ممنوع بناء admin forms بدون validation.
- ممنوع ترك زر أو فلتر أو تبويب لا يعمل.
- ممنوع ترك TODO داخل الكود النهائي.
- ممنوع تكرار API calls بدون client موحد.
- ممنوع بناء pagination بدون `meta` من الباك إند.

### أوامر يجب أن تنجح في النهاية

```bash
npm run lint
npm run typecheck
npm run build
```

إن لم يكن `typecheck` موجودًا، أضفه:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 1) إنشاء المشروع والإعدادات الأساسية

### المطلوب

أنشئ مشروع Next.js حديث بالـ App Router و TypeScript.

### الحزم المطلوبة

```bash
npm install @tanstack/react-query zod react-hook-form @hookform/resolvers framer-motion lucide-react date-fns clsx tailwind-merge
```

أضف shadcn/ui حسب طريقة المشروع، ثم أضف المكونات الأساسية:

```bash
npx shadcn@latest add button card input textarea select dialog dropdown-menu sheet tabs badge table skeleton toast sonner form label separator tooltip command popover calendar
```

> إن تغير اسم CLI أو طريقة shadcn، استخدم الطريقة الرسمية الحالية، لكن لا تستبدل shadcn بمكتبة UI مغلقة.

### ملفات env

أضف:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### شروط القبول

- المشروع يعمل.
- Tailwind يعمل.
- shadcn/ui يعمل.
- TypeScript strict مفعل.
- يوجد `src/` structure.
- يوجد app router وليس pages router.

---

## 2) بناء نظام التصميم الأساسي

### الملفات

```txt
src/app/globals.css
src/components/common/Container.tsx
src/components/common/SectionHeader.tsx
src/components/common/PageHeader.tsx
src/components/common/EmptyState.tsx
src/components/common/ErrorState.tsx
src/components/common/LoadingSkeleton.tsx
src/components/common/Pagination.tsx
src/components/common/StatusBadge.tsx
src/lib/utils.ts
```

### المطلوب

- عرّف CSS variables للألوان.
- ابنِ Container موحد.
- ابنِ PageHeader/SectionHeader.
- ابنِ Empty/Error/Loading states.
- ابنِ Pagination يأخذ `PaginationMeta` فقط.
- جهّز dark mode إن كان سهلًا، لكن لا تجعله يعرقل التنفيذ.

### شروط القبول

- لا توجد ألوان عشوائية كثيرة داخل المكونات.
- كل الصفحات تستخدم Container وHeaders مشتركة.
- كل القوائم تستخدم EmptyState عند عدم وجود بيانات.

---

## 3) بناء API Layer

### الملفات

```txt
src/lib/api/types.ts
src/lib/api/client.ts
src/lib/api/errors.ts
src/lib/api/pagination.ts
src/features/profile/api.ts
src/features/projects/api.ts
src/features/blog/api.ts
src/features/services/api.ts
src/features/technologies/api.ts
src/features/links/api.ts
src/features/contact/api.ts
src/features/dashboard/api.ts
src/features/media/api.ts
src/features/auth/api.ts
```

### المطلوب

1. تعريف `ApiResponse`, `PaginationMeta`, `ApiError`.
2. بناء fetch wrapper.
3. بناء public API functions.
4. بناء admin API functions.
5. دعم upload بـ FormData.
6. دعم query params بشكل آمن.
7. دعم error normalization.

### شروط القبول

- لا توجد fetch calls مباشرة من الصفحات إلا عبر API layer.
- أخطاء 400/401/403/404/409 تظهر بشكل موحد.
- pagination يرجع `{ items, meta }` أو response واضح.

---

## 4) بناء Auth للوحة الإدارة

### الملفات

```txt
src/app/api/auth/login/route.ts
src/app/api/auth/logout/route.ts
src/app/api/auth/refresh/route.ts
src/lib/auth/session.ts
src/lib/auth/guards.ts
src/features/auth/components/LoginForm.tsx
src/app/(admin)/admin/login/page.tsx
```

### المطلوب

- Login form بـ React Hook Form + Zod.
- route handler يحفظ tokens في HttpOnly cookies.
- logout يمسح cookies ويستدعي backend logout إن أمكن.
- admin layout يتحقق من الجلسة.
- redirect غير المسجل إلى `/admin/login`.
- redirect المسجل من login إلى `/admin/dashboard`.

### شروط القبول

- لا يوجد refresh token في localStorage/sessionStorage.
- admin routes لا تظهر بدون login.
- logout يعمل.
- 401 من API يعيد المستخدم إلى login أو يحاول refresh ثم يعيد الطلب.

---

## 5) بناء Layout الموقع العام

### الملفات

```txt
src/app/layout.tsx
src/app/(site)/layout.tsx
src/components/site/SiteHeader.tsx
src/components/site/SiteFooter.tsx
src/components/site/MobileNav.tsx
src/config/nav.ts
src/config/site.ts
```

### المطلوب

- Header بسيط واحترافي.
- Footer يأخذ بيانات profile/socialLinks عند الإمكان.
- Navigation:
  - الرئيسية.
  - من أنا.
  - المشاريع.
  - الخدمات.
  - المدونة.
  - التواصل.
- mobile menu.
- active route state.

### شروط القبول

- header لا يغطي المحتوى.
- mobile nav يعمل.
- footer لا يعتمد على hardcoded social links إذا كانت موجودة من API.

---

## 6) الصفحة الرئيسية

### الملفات

```txt
src/app/(site)/page.tsx
src/components/site/home/HeroSection.tsx
src/components/site/home/StatsStrip.tsx
src/components/site/home/FeaturedProjects.tsx
src/components/site/home/ServicesPreview.tsx
src/components/site/home/TechnologiesPreview.tsx
src/components/site/home/LatestPosts.tsx
src/components/site/home/ContactCTA.tsx
```

### البيانات

- profile.
- featured projects.
- featured services.
- highlighted technologies.
- latest posts.

### متطلبات الهوية التقنية في الصفحة الرئيسية

- Hero يحتوي على لقب تقني واضح مثل Software Engineer / Full‑Stack Developer.
- إضافة visual تقني راقٍ مثل terminal card أو code card أو architecture card.
- Stats يجب أن تخدم الهوية التقنية: projects, articles, years of experience, technologies.
- Featured projects يجب أن تعرض stack التقني وروابط GitHub/live demo إن وجدت.
- Latest posts يجب أن تظهر كمدونة تقنية.


### شروط القبول

- الصفحة لا تبدو قالبًا فارغًا.
- تعرض محتوى حقيقي من API.
- فيها CTA واضح.
- responsive ممتاز.
- metadata من profile.seo.

---

## 7) صفحة من أنا

### الملفات

```txt
src/app/(site)/about/page.tsx
src/components/site/about/AboutIntro.tsx
src/components/site/about/LanguagesSection.tsx
src/components/site/about/CertificatesSection.tsx
src/components/site/about/ProfileContactCard.tsx
```

### شروط القبول

- تعرض about/bio.
- تعرض languages.
- تعرض certificates.
- تعرض CV download عند وجود cvFile.
- تعرض availableForWork.

---

## 8) المشاريع العامة

### الملفات

```txt
src/app/(site)/projects/page.tsx
src/app/(site)/projects/[slug]/page.tsx
src/features/projects/components/ProjectCard.tsx
src/features/projects/components/ProjectFilters.tsx
src/features/projects/components/ProjectGallery.tsx
src/features/projects/components/ProjectCaseStudy.tsx
```

### المطلوب

- Listing مع search/filter/pagination.
- Details by slug.
- زيادة views تحدث من backend عند التفاصيل ولا تحتاج منطق فرونت.
- Gallery من images/gallery.
- SEO من project.seo.

### شروط القبول

- `/projects` يعمل بدون query.
- search يعمل.
- pagination يعمل.
- `/projects/[slug]` يعمل.
- 404 عند slug غير موجود.
- live/github links لا تظهر إذا غير موجودة.

---

## 9) الخدمات العامة

### الملفات

```txt
src/app/(site)/services/page.tsx
src/features/services/components/ServiceCard.tsx
src/features/services/components/ServiceDeliverables.tsx
```

### المطلوب

- عرض الخدمات المنشورة مرتبة.
- إبراز featured services.
- عرض price/startingPrice.
- عرض deliverables/requirements.
- CTA لكل خدمة.

### شروط القبول

- لا تنشئ صفحة تفاصيل خدمة بالـ slug قبل دعم الباك إند لها.
- لا تظهر أسعار فارغة بشكل قبيح.

---

## 10) المدونة العامة

### الملفات

```txt
src/app/(site)/blog/page.tsx
src/app/(site)/blog/[slug]/page.tsx
src/app/(site)/blog/category/[slug]/page.tsx
src/app/(site)/blog/tag/[slug]/page.tsx
src/features/blog/components/PostCard.tsx
src/features/blog/components/PostFilters.tsx
src/features/blog/components/PostContent.tsx
src/features/blog/components/TableOfContents.tsx
src/features/blog/components/ShareButtons.tsx
src/features/blog/components/RelatedPosts.tsx
```

### المطلوب

- Listing مع categories/tags/search/pagination.
- Details by slug.
- Markdown/HTML renderer آمن.
- Table of contents إن أمكن.
- Share buttons.
- SEO من post.seo.
- canonicalUrl.
- احترام allowIndexing.

### شروط القبول

- `/blog` يعمل.
- `/blog/[slug]` يعمل.
- category/tag pages تعمل.
- المقالات غير المنشورة لا تظهر.
- `allowIndexing=false` ينتج noindex.
- لا توجد أخطاء hydration في محتوى المقال.

---

## 11) صفحة التواصل

### الملفات

```txt
src/app/(site)/contact/page.tsx
src/features/contact/components/ContactForm.tsx
src/features/contact/schemas.ts
```

### المطلوب

- form بـ Zod.
- POST /public/contact.
- success state.
- error state.
- عرض معلومات التواصل من profile.

### شروط القبول

- لا يرسل النموذج إلا بعد validation.
- يعرض رسالة نجاح واضحة.
- يعالج أخطاء rate limit/validation.

---

## 12) صفحة الروابط

### الملفات

```txt
src/app/(site)/links/page.tsx
src/features/links/components/LinksGrid.tsx
src/features/links/components/LinkCard.tsx
```

### المطلوب

- عرض links grouped by category.
- featured links أولًا.
- عند الضغط:
  - حاول `POST /public/links/:id/click`.
  - افتح الرابط حتى لو فشل التتبع.

### شروط القبول

- الروابط تفتح بشكل صحيح.
- external link attributes صحيحة.
- لا يتعطل الرابط إذا فشل tracking.

---

## 13) SEO وملفات الفهرسة

### الملفات

```txt
src/app/sitemap.ts
src/app/robots.ts
src/app/manifest.ts
src/app/opengraph-image.tsx
src/app/api/rss/route.ts
src/lib/seo/metadata.ts
src/lib/seo/structured-data.ts
```

### المطلوب

- sitemap ديناميكي من public APIs.
- robots يمنع `/admin`.
- RSS للمقالات المنشورة.
- helper لتوليد metadata.
- JSON-LD:
  - Person.
  - BlogPosting.
  - CreativeWork/SoftwareSourceCode للمشاريع.

### شروط القبول

- `/sitemap.xml` يعمل.
- `/robots.txt` يعمل.
- `/api/rss` يعمل أو `/rss.xml` حسب التنفيذ.
- metadata لكل صفحة public.
- admin noindex.

---

## 14) Admin Layout

### الملفات

```txt
src/app/(admin)/admin/layout.tsx
src/components/admin/AdminSidebar.tsx
src/components/admin/AdminHeader.tsx
src/components/admin/AdminBreadcrumbs.tsx
src/components/admin/AdminPageShell.tsx
src/components/admin/AdminDataTable.tsx
src/components/admin/ConfirmDeleteDialog.tsx
src/components/admin/ReorderControls.tsx
```

### المطلوب

- Sidebar منظمة.
- Header.
- Breadcrumb.
- Responsive drawer.
- حماية auth.
- TanStack Query provider.
- Toaster.

### شروط القبول

- كل صفحات admin تحت layout واحد.
- mobile admin usable.
- لا يتم تحميل admin shell في public layout.

---

## 15) Admin Dashboard

### الملفات

```txt
src/app/(admin)/admin/dashboard/page.tsx
src/features/dashboard/components/DashboardStats.tsx
src/features/dashboard/components/QuickActions.tsx
src/features/dashboard/components/RecentActivity.tsx
```

### المطلوب

- استخدام `/admin/dashboard` أو `/admin/dashboard/stats`.
- Cards صغيرة وواضحة.
- روابط سريعة:
  - مقال جديد.
  - مشروع جديد.
  - رفع وسائط.
  - عرض الرسائل.

### شروط القبول

- لا توجد أرقام mock.
- loading/error states.

---

## 16) Admin Profile

### الملفات

```txt
src/app/(admin)/admin/profile/page.tsx
src/features/profile/components/ProfileForm.tsx
src/features/profile/schemas.ts
```

### المطلوب

Tabs:

- Basic.
- About.
- Contact.
- Social links.
- Languages.
- Certificates.
- SEO.
- Media/CV.

### شروط القبول

- PUT يعمل.
- array fields تعمل إضافة/حذف/ترتيب.
- media picker يعمل للصور وCV.
- validation مطابق للباك إند.

---

## 17) Admin Projects

### الملفات

```txt
src/app/(admin)/admin/projects/page.tsx
src/app/(admin)/admin/projects/new/page.tsx
src/app/(admin)/admin/projects/[id]/edit/page.tsx
src/features/projects/components/admin/ProjectsTable.tsx
src/features/projects/components/admin/ProjectForm.tsx
src/features/projects/schemas.ts
```

### المطلوب

- list مع pagination/search/filter.
- create/edit.
- publish/unpublish.
- archive/delete.
- reorder.
- SEO tab.
- case study tab.
- media picker.

### شروط القبول

- كل أزرار الإدارة تعمل.
- archive/delete confirmation.
- duplicate slug يظهر كخطأ واضح.
- reorder لا يكسر القائمة.

---

## 18) Admin Blog

### الملفات

```txt
src/app/(admin)/admin/blog/posts/page.tsx
src/app/(admin)/admin/blog/posts/new/page.tsx
src/app/(admin)/admin/blog/posts/[id]/edit/page.tsx
src/app/(admin)/admin/blog/categories/page.tsx
src/app/(admin)/admin/blog/tags/page.tsx
src/features/blog/components/admin/PostsTable.tsx
src/features/blog/components/admin/PostEditor.tsx
src/features/blog/components/admin/CategoriesManager.tsx
src/features/blog/components/admin/TagsManager.tsx
src/features/blog/schemas.ts
```

### المطلوب

- إدارة المقالات.
- محرر محتوى Markdown أو rich text بسيط.
- preview.
- category select.
- tags multi-select.
- publish/unpublish/archive/schedule.
- SEO tab.
- إدارة التصنيفات والوسوم.

### شروط القبول

- المقال يمكن إنشاؤه كمسودة.
- يمكن نشر المقال.
- يمكن جدولة المقال.
- category/tag relations تعمل بالـ IDs داخل admin.
- public يعرض بالـ slug.

---

## 19) Admin Services

### الملفات

```txt
src/app/(admin)/admin/services/page.tsx
src/app/(admin)/admin/services/new/page.tsx
src/app/(admin)/admin/services/[id]/edit/page.tsx
src/features/services/components/admin/ServicesTable.tsx
src/features/services/components/admin/ServiceForm.tsx
src/features/services/schemas.ts
```

### المطلوب

- CRUD.
- publish/unpublish.
- reorder.
- featured.
- deliverables/requirements arrays.
- SEO.

### شروط القبول

- كل خدمة يمكن تعديلها بالكامل.
- لا تظهر حقول السعر بشكل متضارب.
- `price` النصي له أولوية عرض في public.

---

## 20) Admin Technologies

### الملفات

```txt
src/app/(admin)/admin/technologies/page.tsx
src/features/technologies/components/admin/TechnologiesTable.tsx
src/features/technologies/components/admin/TechnologyForm.tsx
src/features/technologies/schemas.ts
```

### المطلوب

- CRUD في نفس الصفحة عبر dialog/drawer.
- category/group.
- proficiencyLevel.
- highlighted.
- publish/unpublish.
- reorder.

### شروط القبول

- التقنية تظهر في public إذا isPublished.
- highlighted تظهر في home.
- color/icon لا يكسر التصميم إن لم يوجد.

---

## 21) Admin Links

### الملفات

```txt
src/app/(admin)/admin/links/page.tsx
src/features/links/components/admin/LinksTable.tsx
src/features/links/components/admin/LinkForm.tsx
src/features/links/schemas.ts
```

### المطلوب

- CRUD.
- publish/unpublish.
- reorder.
- clicks display.
- category/platform.

### شروط القبول

- لا تفقد clicks عند التعديل.
- link URL validation.

---

## 22) Admin Media

### الملفات

```txt
src/app/(admin)/admin/media/page.tsx
src/features/media/components/MediaLibrary.tsx
src/features/media/components/MediaUploader.tsx
src/features/media/components/MediaPicker.tsx
src/features/media/components/MediaDetailsDrawer.tsx
src/features/media/schemas.ts
```

### المطلوب

- upload.
- grid/list.
- filters.
- edit alt/usage.
- copy URL.
- delete confirmation.
- picker reusable داخل forms.

### شروط القبول

- Upload يستخدم field name `file`.
- يعرض الصور والملفات.
- يمنع حذف الملف المستخدم أو يعرض تحذير واضح حسب رد الباك إند.
- pagination يعمل.

---

## 23) Admin Contact Messages

### الملفات

```txt
src/app/(admin)/admin/contact/page.tsx
src/features/contact/components/admin/MessagesTable.tsx
src/features/contact/components/admin/MessageDetailsDrawer.tsx
```

### المطلوب

- list.
- status filter.
- details drawer.
- update status.
- notes.
- delete confirmation.

### شروط القبول

- الرسائل الجديدة واضحة.
- تحديث status يعمل.
- notes تحفظ.

---

## 24) Admin Audit Logs

### الملفات

```txt
src/app/(admin)/admin/audit-logs/page.tsx
src/features/audit/components/AuditLogsTable.tsx
src/features/audit/components/AuditDetailsDrawer.tsx
```

### المطلوب

- read-only table.
- filters إن دعمها الباك.
- عرض before/after formatted JSON.

### شروط القبول

- لا يوجد تعديل أو حذف audit logs من الواجهة.
- البيانات الطويلة لا تكسر التصميم.

---

## 25) الاختبارات والجودة

### المطلوب

أضف على الأقل:

- ESLint.
- TypeScript strict.
- basic component tests إن كان وقت التنفيذ يسمح.
- Playwright smoke tests للصفحات الأساسية إن أمكن.

### Smoke test يدوي إلزامي

اختبر:

1. فتح الرئيسية.
2. فتح المشاريع.
3. فتح مشروع بالـ slug.
4. فتح المدونة.
5. فتح مقال بالـ slug.
6. إرسال رسالة تواصل.
7. تسجيل دخول admin.
8. إنشاء مشروع ونشره.
9. إنشاء مقال ونشره.
10. رفع صورة واستخدامها.
11. تغيير profile ورؤية التغيير في public.
12. logout.

---

## 26) معايير الإغلاق النهائي

لا يعتبر الفرونت منتهيًا إلا إذا تحقق التالي:

- كل public pages مربوطة بالباك إند.
- كل admin pages الأساسية تعمل.
- لا توجد بيانات mock.
- لا توجد console errors.
- لا توجد hydration errors.
- mobile responsive.
- SEO موجود.
- sitemap/robots/RSS يعملون.
- auth آمن.
- pagination صحيح.
- media upload/selection يعمل.
- forms validation يعمل.
- build ينجح.
- README يشرح التشغيل والمتغيرات.
