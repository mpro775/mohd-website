# تحليل وبناء تصور الفرونت من الصفر — الموقع الشخصي الاحترافي + المدونة

> الهدف: تحويل الباك إند الحالي إلى واجهة احترافية كاملة تشمل موقع عام سريع ومهيأ لمحركات البحث + لوحة إدارة محتوى بسيطة وفعّالة. هذا الملف ليس فحص كود، لأن الفرونت لم يُبنَ بعد، بل هو مواصفات المنتج والهيكل وتجربة الاستخدام التي يجب الالتزام بها أثناء التنفيذ.


---

## 0) فرضية مهمة قبل أي تنفيذ

هذه الخطة مبنية على أن إصلاحات الباك إند النهائية قد تم تنفيذها وإغلاقها، خصوصًا: `meta` للـ pagination، دعم `slug` في public filters، المقالات المجدولة، معالجة duplicate slugs، وتثبيت شكل `ApiResponse`.

لا يجوز بناء الفرونت على شكل الباك إند القديم أو عمل حلول التفافية لإصلاح عيوب يفترض أنها أغلقت في الباك إند.

## 0.1) الهوية النهائية للموقع

الموقع المطلوب هو **موقع شخصي تقني لمبرمج / Software Engineer / Full‑Stack Developer**، وليس موقعًا شخصيًا عامًا.

لذلك يجب أن تكون التجربة العامة تقنية واحترافية من أول شاشة:

- Hero يعرض التخصص التقني بوضوح.
- Projects تعرض المشكلة والحل والتقنيات والروابط.
- Blog تكون مدونة تقنية وليست مقالات عامة.
- Services تكون خدمات برمجية وتقنية.
- Technologies تظهر كخبرة عملية وليست مجرد أيقونات.
- التصميم يمكن أن يستخدم terminal/code/grid accents بشكل هادئ وراقي.

---

## 1) القرار النهائي للمنتج

سيتم بناء فرونت واحد يحتوي على منطقتين واضحتين:

1. **Public Website**: الموقع العام للزوار ومحركات البحث.
2. **Admin CMS**: لوحة إدارة المحتوى لصاحب الموقع.

لا يتم بناء الموقع كصفحات ثابتة فقط، لأن الباك إند يحتوي بالفعل على Admin APIs لإدارة الملف الشخصي، المشاريع، المقالات، الخدمات، التقنيات، الروابط، الرسائل، والوسائط. لذلك يجب أن يكون الفرونت قابلًا لإدارة المحتوى من اللوحة بدون تعديل الكود.

---

## 2) القرار التقني النهائي

### التقنية الأساسية

- **Next.js App Router + TypeScript**.
- **Tailwind CSS** كنظام تصميم Utility-first.
- **shadcn/ui** كمصدر مكونات قابلة للتخصيص وليست مكتبة مغلقة.
- **TanStack Query** فقط داخل لوحة الإدارة لإدارة server state والـ mutations والـ pagination.
- **React Hook Form + Zod** لكل نماذج الإدارة والتواصل.
- **Framer Motion** للحركات الدقيقة في الواجهة العامة فقط، بدون إفراط.
- **next/image** لكل الصور الخارجية والداخلية مع ضبط remote domains.
- **Route Handlers** عند الحاجة لعمل طبقة BFF بسيطة للـ auth cookies أو RSS أو proxy آمن.

### لماذا هذا القرار؟

الموقع الشخصي والمدونة يحتاجان SEO قوي، تحميل سريع، صفحات عامة قابلة للفهرسة، وتجربة إدارة محتوى. Next.js مناسب لهذه الحالة لأن الصفحات العامة يمكن أن تكون Server Components أو ISR، بينما لوحة الإدارة يمكن أن تكون Client Components مدعومة بـ TanStack Query.

---

## 3) شكل المشروع المقترح

```txt
src/
  app/
    (site)/
      layout.tsx
      page.tsx
      about/page.tsx
      projects/page.tsx
      projects/[slug]/page.tsx
      services/page.tsx
      blog/page.tsx
      blog/[slug]/page.tsx
      blog/category/[slug]/page.tsx
      blog/tag/[slug]/page.tsx
      contact/page.tsx
      links/page.tsx
      not-found.tsx
    (admin)/
      admin/layout.tsx
      admin/login/page.tsx
      admin/dashboard/page.tsx
      admin/profile/page.tsx
      admin/projects/page.tsx
      admin/projects/new/page.tsx
      admin/projects/[id]/edit/page.tsx
      admin/blog/posts/page.tsx
      admin/blog/posts/new/page.tsx
      admin/blog/posts/[id]/edit/page.tsx
      admin/blog/categories/page.tsx
      admin/blog/tags/page.tsx
      admin/services/page.tsx
      admin/services/new/page.tsx
      admin/services/[id]/edit/page.tsx
      admin/technologies/page.tsx
      admin/links/page.tsx
      admin/media/page.tsx
      admin/contact/page.tsx
      admin/audit-logs/page.tsx
    api/
      auth/
        login/route.ts
        logout/route.ts
        refresh/route.ts
      rss/route.ts
    sitemap.ts
    robots.ts
    manifest.ts
    opengraph-image.tsx
    layout.tsx
    globals.css
  components/
    site/
    admin/
    common/
    ui/
  config/
    site.ts
    nav.ts
    seo.ts
  features/
    profile/
    projects/
    blog/
    services/
    technologies/
    links/
    contact/
    media/
    dashboard/
    auth/
  lib/
    api/
      client.ts
      public.ts
      admin.ts
      types.ts
      errors.ts
      pagination.ts
    auth/
      session.ts
      guards.ts
    seo/
      metadata.ts
      structured-data.ts
    utils.ts
  hooks/
  styles/
  types/
public/
```

### قاعدة مهمة

لا تضع كل شيء داخل `components` فقط. أي منطق مرتبط بميزة معينة يوضع داخل `features/<feature>`. مثال:

```txt
features/blog/
  api.ts
  types.ts
  components/PostCard.tsx
  components/PostFilters.tsx
  components/PostEditor.tsx
  schemas.ts
```

---

## 4) صفحات الموقع العام المطلوبة

### 4.1 الصفحة الرئيسية `/`

الغرض: إعطاء انطباع قوي خلال أول 5 ثوانٍ.

الأقسام المطلوبة:

1. Hero احترافي:
   - الاسم.
   - اللقب المهني.
   - headline قصير.
   - صورة شخصية أو visual block.
   - CTA رئيسي: تواصل معي.
   - CTA ثانوي: شاهد أعمالي.
   - Badge لحالة `availableForWork`.

2. شريط ثقة سريع:
   - سنوات الخبرة.
   - عدد المشاريع المنشورة.
   - عدد المقالات.
   - عدد الخدمات/التقنيات البارزة.

3. Featured Projects:
   - 3 إلى 6 مشاريع مميزة.
   - بطاقة تحتوي: صورة، عنوان، وصف قصير، التقنيات، رابط التفاصيل.

4. Services Preview:
   - الخدمات المميزة فقط.
   - السعر أو النص البديل `price` إن وجد.
   - CTA لكل خدمة.

5. Technologies Preview:
   - التقنيات المميزة أو حسب الفئات.
   - لا تعرضها كقائمة طويلة مملة؛ استخدم clustering حسب category/group.

6. Latest Posts:
   - آخر 3 مقالات منشورة.
   - عنوان، ملخص، صورة، تاريخ، مدة قراءة، تصنيف.

7. Contact CTA:
   - دعوة واضحة للتواصل.
   - روابط اجتماعية مختارة.

### 4.2 من أنا `/about`

المصدر الأساسي: `GET /api/public/profile`.

الأقسام:

- نبذة طويلة `about`.
- اللغات.
- الشهادات.
- timeline خبرة إن أمكن من البيانات المتاحة.
- CV download إذا كان `cvFile` موجودًا.
- روابط اجتماعية.
- CTA للتواصل.

### 4.3 المشاريع `/projects`

المصدر: `GET /api/public/projects`.

الوظائف:

- Pagination.
- Search.
- Filter by category.
- Filter by technology.
- Sort.
- Empty state احترافي.
- Skeleton loading.

البطاقة:

- coverImage.
- title.
- shortDescription.
- category.
- technologies.
- status.
- liveUrl/githubUrl إن وجدا.
- رابط التفاصيل بالـ slug.

### 4.4 تفاصيل مشروع `/projects/[slug]`

المصدر: `GET /api/public/projects/:slug`.

الأقسام:

- Hero للمشروع.
- ملخص المشكلة `problem`.
- الحل `solution`.
- النتائج `results`.
- دور صاحب الموقع `role`.
- التقنيات.
- معرض صور gallery/images.
- روابط Live/GitHub.
- SEO metadata من `project.seo`.
- JSON-LD نوع `CreativeWork` أو `SoftwareSourceCode` حسب طبيعة المشروع.

### 4.5 الخدمات `/services`

المصدر: `GET /api/public/services`.

الأقسام:

- مقدمة توضّح نوع الخدمات.
- بطاقات خدمات مرتبة بـ `order`.
- السعر: استخدم `price` إن وجد، وإلا `startingPrice + currency`.
- deliverables.
- requirements في accordion أو dialog خفيف.
- CTA واضح.

ملاحظة: لا توجد صفحة تفاصيل خدمة في الباك إند public by slug حاليًا، لذلك لا تبنِ route `/services/[slug]` إلا إذا أضيف endpoint مناسب.

### 4.6 المدونة `/blog`

المصدر: `GET /api/public/blog/posts` + categories + tags.

الوظائف:

- مقالات مميزة.
- أحدث المقالات.
- فلترة بالتصنيف والوسم.
- بحث.
- Pagination.
- Cards واضحة للقراءة.

لا تستخدم infinite scroll كخيار أول؛ الـ pagination أفضل للمدونة وSEO.

### 4.7 تفاصيل مقال `/blog/[slug]`

المصدر: `GET /api/public/blog/posts/:slug`.

الأقسام:

- title.
- summary/excerpt.
- featuredImage أو coverImage.
- category.
- tags.
- publishDate.
- readTime.
- content.
- Table of Contents إذا كان المحتوى Markdown/HTML فيه headings.
- Share buttons.
- Related posts إن أمكن عبر category/tag.
- SEO metadata من `post.seo`.
- canonicalUrl عند وجوده.
- احترام `allowIndexing`.
- JSON-LD نوع `BlogPosting`.

### 4.8 تصنيف ووسم المدونة

- `/blog/category/[slug]`
- `/blog/tag/[slug]`

تستخدم public post list مع query:

```txt
category=<slug>
tag=<slug>
```

بعد إصلاح الباك إند، يجب أن يدعم public filtering بالـ slug لا ObjectId.

### 4.9 التواصل `/contact`

المصدر: `POST /api/public/contact`.

النموذج:

- fullName.
- email.
- phone اختياري.
- subject.
- message.

المطلوب UX:

- Validation client-side بـ Zod.
- عرض أخطاء الباك إند field errors إن وجدت.
- Submit loading state.
- Success state واضح.
- Rate-limit friendly message.
- لا تعرض endpoint error raw للمستخدم.

### 4.10 روابط `/links`

المصدر: `GET /api/public/links` + `POST /api/public/links/:id/click`.

الغرض: صفحة Link-in-bio بسيطة.

- روابط مميزة أولًا.
- grouping حسب category.
- عند الضغط على رابط، يتم تسجيل click ثم فتح الرابط.
- لا تعطل فتح الرابط لو فشل tracking.

---

## 5) لوحة الإدارة المطلوبة

### 5.1 تسجيل الدخول `/admin/login`

- POST إلى login route handler أو مباشرة للباك إند حسب قرار auth النهائي.
- لا تخزن refresh token في localStorage.
- الأفضل: Route Handler يحفظ tokens في HttpOnly cookies.
- بعد الدخول ينتقل إلى `/admin/dashboard`.

### 5.2 Layout الإدارة

- Sidebar واضحة.
- Header فيه اسم المستخدم، زر خروج، وbreadcrumb.
- Responsive: على الجوال sidebar drawer.
- كل صفحات الإدارة `noindex`.
- كل صفحة محمية قبل العرض.

### 5.3 Dashboard

المصدر: `/api/admin/dashboard` أو `/api/admin/dashboard/stats`.

يعرض:

- عدد المشاريع.
- عدد المقالات.
- عدد الرسائل الجديدة.
- عدد الوسائط.
- روابط سريعة.
- آخر الرسائل.
- آخر المقالات أو المشاريع.

### 5.4 Profile Management

- نموذج كبير مقسم tabs:
  - Basic.
  - About.
  - Contact.
  - Social links.
  - Languages.
  - Certificates.
  - SEO.
  - Media/CV.

### 5.5 Projects CMS

- جدول/بطاقات إدارة.
- Create/Edit form.
- Publish/unpublish.
- Archive.
- Reorder.
- Media picker للصور.
- SEO tab.
- Case study tab.

### 5.6 Blog CMS

أقسام:

- Posts.
- Categories.
- Tags.

Post editor يجب أن يدعم:

- title.
- summary/excerpt.
- content editor.
- category select.
- tags multi-select.
- featured/cover image.
- status.
- publish/schedule/archive.
- SEO.
- preview.

ملاحظة مهمة: لا تبنِ محرر غني معقد جدًا في الإصدار الأول إذا كان سيؤخر المشروع. استخدم Markdown editor جيد مع Preview، أو rich text بسيط بشرط أن يكون output متوافقًا مع الباك إند.

### 5.7 Services CMS

- CRUD.
- Reorder.
- Publish/unpublish.
- Featured.
- Deliverables/Requirements array fields.
- SEO.

### 5.8 Technologies CMS

- CRUD.
- Reorder.
- Publish/unpublish.
- category/group.
- proficiency.
- highlighted.
- color/icon.

### 5.9 Links CMS

- CRUD.
- Reorder.
- Publish/unpublish.
- clicks metrics.
- category/platform.

### 5.10 Media Library

- Upload.
- Grid/list view.
- Filter by folder/type/isUsed.
- Copy URL.
- Edit alt/usage.
- Delete with confirmation.
- Used/unused badge.

### 5.11 Contact Messages

- List with status filter.
- View details.
- Update status.
- Add notes.
- Delete/archive.
- Email link quick action.

### 5.12 Audit Logs

- Read-only table.
- Filter by action/resource/actor.
- Detail drawer for before/after.

---

## 6) الهوية البصرية المقترحة

### الاتجاه العام

- موقع شخصي تقني حديث.
- Minimal but memorable.
- لا يكون قالبًا عاديًا.
- التركيز على القراءة، الأعمال، والثقة.

### Design language

- خلفيات هادئة مع gradients خفيفة جدًا.
- Cards بزوايا 2xl وظلال ناعمة.
- Typography قوي للعنوان، مريح للمقالات.
- استخدام motion بسيط عند دخول الأقسام.
- لا تستخدم animations كثيرة في صفحات المقال.

### الألوان

يتم تعريف tokens وليس ألوان عشوائية داخل المكونات:

```css
--background
--foreground
--muted
--muted-foreground
--primary
--primary-foreground
--secondary
--accent
--border
--card
--card-foreground
--success
--warning
--danger
```

### المكونات المشتركة

- Container.
- SectionHeader.
- PageHeader.
- EmptyState.
- ErrorState.
- LoadingSkeleton.
- Pagination.
- SearchInput.
- FilterSelect.
- ConfirmDialog.
- MediaPicker.
- StatusBadge.
- SEOFields.
- ArrayField.
- MarkdownRenderer.
- ProjectCard.
- PostCard.
- ServiceCard.
- TechnologyCloud.

---

## 7) مبادئ UX إلزامية

1. لا توجد صفحة بدون loading state.
2. لا توجد قائمة بدون empty state.
3. لا توجد mutation بدون toast واضح.
4. لا توجد destructive action بدون confirmation.
5. لا توجد forms طويلة في صفحة واحدة بلا tabs أو sections.
6. لا تعرض أخطاء تقنية للمستخدم العام.
7. في الإدارة، اعرض الخطأ الفني بشكل مختصر ومفيد.
8. لا تضع أزرار غير عاملة أو placeholders.
9. لا تستخدم بيانات mock في production paths.
10. لا تستخدم hardcoded content بدل بيانات الباك إند إلا في copy ثابت مثل labels.

---

## 8) SEO المطلوب

- `generateMetadata` لكل صفحة عامة ديناميكية.
- metadata للصفحة الرئيسية من profile.seo.
- metadata للمشاريع من project.seo.
- metadata للمقالات من post.seo.
- canonical URLs.
- OpenGraph/Twitter cards.
- `sitemap.ts` يولد روابط:
  - الرئيسية.
  - about.
  - projects.
  - project details.
  - services.
  - blog.
  - post details.
  - category/tag pages.
- `robots.ts` يسمح للموقع العام ويمنع `/admin`.
- RSS feed للمدونة.
- JSON-LD للـ profile, projects, posts.

---

## 9) الأداء المطلوب

- استخدم Server Components للصفحات العامة قدر الإمكان.
- استخدم ISR/revalidate حسب نوع البيانات.
- استخدم dynamic rendering فقط عندما يلزم.
- استخدم `next/image` لكل الصور.
- لا تحمل مكتبات admin في الموقع العام.
- افصل admin components عن site components.
- Lazy-load للـ heavy editors داخل admin فقط.
- لا تستخدم client component على مستوى صفحة عامة إلا لجزء تفاعلي صغير.

---

## 10) شروط قبول المنتج بصريًا ووظيفيًا

قبل اعتبار الفرونت جاهزًا:

- الصفحة الرئيسية تبدو كموقع شخصي احترافي وليس template فارغ.
- كل public routes تعمل من بيانات الباك إند.
- كل admin routes الأساسية تعمل CRUD أو الإدارة المطلوبة.
- لا توجد console errors.
- لا توجد hydration errors.
- mobile responsive كامل.
- SEO metadata يعمل للصفحات الديناميكية.
- sitemap/robots/RSS موجودة.
- login/logout/refresh يعملون بدون تخزين refresh token في localStorage.
- كل forms تحتوي validation.
- كل pagination يستخدم `meta` من الباك إند.
- لا توجد بيانات mock متروكة.
