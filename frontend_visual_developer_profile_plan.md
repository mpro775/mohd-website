# خطة تعديلات الواجهة الأمامية لتعكس هوية مبرمج محترف

## الهدف

تنفيذ تحسينات بصرية وعملية على واجهة الموقع الأمامية بحيث يظهر الموقع بوضوح كموقع شخصي/مهني لمبرمج Full-Stack، مع الحفاظ على بنية المشروع الحالية وعدم كسر الربط مع الـ API أو لوحة الإدارة.

المشروع الحالي مبني بـ:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS v4
- next-themes موجود في المشروع
- مكونات عامة داخل `src/components/common`
- صفحات الموقع العامة داخل `src/app/(site)`
- مكونات الميزات داخل `src/features`

## قواعد التنفيذ العامة

- نفّذ جميع البنود المذكورة في هذا الملف، ولا تتعامل معها كأولويات اختيارية.
- لا تغيّر بنية المشروع الأساسية.
- لا تغيّر أسماء الـ routes الحالية.
- لا تغيّر عقود البيانات القادمة من الـ API إلا إذا كان التغيير محليًا وآمنًا.
- استخدم الحقول الموجودة أصلًا في `src/lib/api/types.ts` قدر الإمكان.
- حافظ على اللغة العربية واتجاه RTL في المحتوى العام.
- استخدم `dir="ltr"` فقط في أجزاء الكود، التيرمنال، المسارات، وسطور الأوامر.
- حافظ على الثيم التقني الحالي: dark, grid, terminal, code, neon/green primary.
- لا تجعل الواجهة مزخرفة بشكل زائد؛ المطلوب احتراف ووضوح.
- بعد التنفيذ شغّل:

```bash
npm run lint
npm run typecheck
npm run build
```

---

# 1. إصلاح خطأ تأثير الكتابة في TerminalCard

## الملف

`src/components/common/TerminalCard.tsx`

## المشكلة

السطر الحالي يكرر النص بشكل خاطئ أثناء تأثير الكتابة:

```tsx
setCurrentText((prev) => prev + fullLine.slice(0, charIndex + 1));
```

هذا يجعل النص يتراكم بطريقة غير صحيحة.

## المطلوب

استبدله بـ:

```tsx
setCurrentText(fullLine.slice(0, charIndex + 1));
```

## تحسينات إضافية على نفس المكون

- اجعل عنوان النافذة قابلًا للتمرير من props اختياريًا مثل `title`، مع قيمة افتراضية.
- اجعل السطر النهائي قابلًا للتخصيص من props مثل `finalLine`، مع قيمة افتراضية:

```txt
ready_for_work = true
```

- حافظ على `dir="ltr"`.
- أضف تدرج أو border خفيف أعلى الكرت ليبدو أقرب لنافذة terminal احترافية.
- لا تكسر الاستخدام الحالي:

```tsx
<TerminalCard lines={[...]} />
```

---

# 2. تطوير الهوية البصرية العامة في CSS

## الملف

`src/app/globals.css`

## المطلوب

إضافة utilities عامة تساعد على توحيد شكل الموقع:

### إضافة class للكروت التقنية

```css
.tech-card {
  border: 1px solid var(--border);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--card) 94%, transparent), var(--card)),
    radial-gradient(circle at top left, color-mix(in srgb, var(--primary) 10%, transparent), transparent 38%);
  border-radius: var(--radius);
}
```

### إضافة class للأزرار أو العناصر التي تشبه terminal

```css
.terminal-surface {
  background: #071019;
  border: 1px solid color-mix(in srgb, var(--border) 80%, var(--primary));
  box-shadow: 0 20px 50px -30px rgba(55, 211, 153, 0.35);
}
```

### تحسين grid في الوضع الفاتح

الـ `tech-grid` الحالي مناسب للدارك، لكنه خفيف جدًا أو غير واضح في اللايت. اجعله يعتمد على `color-mix` بدل rgba الثابت:

```css
.tech-grid {
  background-image:
    linear-gradient(color-mix(in srgb, var(--foreground) 7%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--foreground) 7%, transparent) 1px, transparent 1px);
  background-size: 34px 34px;
}
```

### تحسين prose-tech

- أضف تنسيقًا للروابط داخل المقالات.
- أضف تنسيقًا للـ blockquote.
- أضف تنسيقًا للجداول.
- حافظ على `pre` و `code` بشكل مناسب للكود.

مثال مطلوب:

```css
.prose-tech a {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.prose-tech blockquote {
  border-inline-start: 3px solid var(--primary);
  background: color-mix(in srgb, var(--primary) 8%, transparent);
  padding: 1rem;
  border-radius: var(--radius);
  color: var(--muted-foreground);
}

.prose-tech table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border-radius: var(--radius);
}

.prose-tech th,
.prose-tech td {
  border: 1px solid var(--border);
  padding: 0.75rem;
}
```

---

# 3. تطوير PageHeader ليصبح Header تقني موحد

## الملف

`src/components/common/PageHeader.tsx`

## الوضع الحالي

المكون بسيط جدًا، وهذا يجعل صفحات مثل المشاريع والمدونة والتقنيات تظهر أقل احترافًا من الصفحة الرئيسية.

## المطلوب

حوّل `PageHeader` إلى رأس صفحة تقني يحتوي على:

- خلفية `tech-grid`.
- `ambient-glow` خفيف.
- eyebrow اختياري.
- route label اختياري مثل `~/projects`.
- title كبير.
- description.
- children اختياري لعرض أزرار أو badges.

## الشكل المقترح للـ props

```tsx
type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  routeLabel?: string;
  children?: React.ReactNode;
};
```

## سلوك مطلوب

- الاستخدام القديم يجب أن يستمر بدون تعديل إجباري:

```tsx
<PageHeader title="المشاريع" description="..." />
```

- عند وجود `routeLabel`، اعرضه بخط mono وباتجاه LTR.
- لا تجعل الهيدر عاليًا جدًا في الصفحات الداخلية.

---

# 4. تحسين SiteHeader

## الملف

`src/components/site/SiteHeader.tsx`

## المطلوب

### 4.1 تعديل الشعار

بدل النص الثابت:

```tsx
Mohd.dev
```

استخدم شكل أقرب لهوية مبرمج:

```tsx
<span dir="ltr" className="font-mono text-primary">&lt;Mohd.dev /&gt;</span>
```

أو:

```tsx
<span dir="ltr" className="font-mono text-primary">{'{ Mohd.dev }'}</span>
```

### 4.2 إصلاح active state

الحالة الحالية تعتمد على:

```tsx
pathname === item.href
```

المطلوب أن تبقى الصفحة الأم نشطة في التفاصيل مثل `/projects/my-project`.

استخدم:

```tsx
const isActive =
  item.href === "/"
    ? pathname === "/"
    : pathname.startsWith(item.href);
```

طبّق ذلك على desktop و mobile menu.

### 4.3 إضافة CTA في الهيدر

أضف زر واضح في الهيدر لصفحة التواصل:

```txt
ابدأ مشروعًا
```

ويربط إلى:

```txt
/contact
```

### 4.4 تحسين قائمة الموبايل

- عند فتح القائمة، اجعل الرابط النشط واضحًا.
- اجعل القائمة لها border وتباعد أفضل.
- أغلق القائمة عند الضغط على أي رابط.
- أضف زر التواصل داخل القائمة.

### 4.5 دعم زر الثيم

بعد إنشاء `ThemeToggle` في بند لاحق، أضفه في الهيدر.

---

# 5. تفعيل الثيم العام وإضافة ThemeToggle

## الملفات

`src/app/layout.tsx`

ملف جديد:

`src/components/common/ThemeToggle.tsx`

## المشكلة

الثيمات موجودة في CSS ويوجد `ThemeProvider` في المشروع، لكنه غير مفعّل في واجهة الموقع العامة.

## المطلوب في RootLayout

استورد `ThemeProvider`:

```tsx
import { ThemeProvider } from "@/providers/theme-provider";
```

ولفّ المحتوى:

```tsx
<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
  <NuqsAdapter>
    {children}
  </NuqsAdapter>
  <Toaster richColors position="top-center" />
</ThemeProvider>
```

## المطلوب في ThemeToggle

- مكون client.
- يستخدم `useTheme` من `next-themes`.
- زر صغير في الهيدر.
- يبدل بين `dark` و `light`.
- يستخدم أيقونات من `lucide-react` مثل `Sun` و `Moon`.
- يتجنب hydration mismatch باستخدام mounted state.

---

# 6. تحسين Button و LinkButton

## الملف

`src/components/common/Button.tsx`

## المطلوب

### 6.1 إضافة focus واضح

أضف إلى الأساس المشترك:

```tsx
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
```

### 6.2 إضافة variant جديد

أضف variant باسم `terminal`:

```tsx
terminal: "border border-primary/30 bg-[#071019] font-mono text-primary hover:bg-primary/10"
```

### 6.3 إضافة size اختياري

أضف sizes:

```tsx
sm: "h-9 px-3 text-xs"
md: "h-10 px-4 text-sm"
lg: "h-12 px-6 text-base"
```

مع جعل الافتراضي `md`.

### 6.4 لا تكسر الاستخدام الحالي

كل الاستخدامات القديمة مثل:

```tsx
<LinkButton href="/contact">تواصل معي</LinkButton>
```

يجب أن تعمل بدون تعديل.

---

# 7. تحسين StatusBadge

## الملف

`src/components/common/StatusBadge.tsx`

## المطلوب

بدل أن تكون كل الحالات بنفس اللون، اجعل لكل حالة لون بصري مناسب.

## الحالات المطلوبة

- `published`: أخضر/primary.
- `draft`: muted/gray.
- `scheduled`: warning.
- `archived`: gray.
- `completed`: success/primary.
- `in-progress`: secondary أو warning.
- `paused`: muted.
- `true`: success.
- `false`: muted/danger خفيف.
- مستويات التقنية:
  - `beginner`: muted.
  - `intermediate`: secondary.
  - `advanced`: primary.
  - `expert`: primary stronger.

## مطلوب أيضًا

- أضف `font-medium`.
- لا تجعل الألوان صارخة.
- حافظ على border خفيف.

---

# 8. تحسين TechStackBadge

## الملف

`src/components/common/TechStackBadge.tsx`

## المطلوب

اجعله يعكس stack تقني:

- `font-mono`
- `dir="ltr"`
- hover بسيط
- border primary عند hover

مثال:

```tsx
<span dir="ltr" className="inline-flex rounded-full border border-border bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground transition hover:border-primary/40 hover:text-primary">
  {name}
</span>
```

---

# 9. تحسين SectionHeader

## الملف

`src/components/common/SectionHeader.tsx`

## المطلوب

- اجعل `eyebrow` بخط mono عند الحاجة.
- أضف سطر زخرفي تقني صغير بجانبه مثل `/ /` أو `01` بدون مبالغة.
- حافظ على الاستخدام الحالي.
- اجعل الوصف أوضح بصريًا.

مثال توجّه:

```tsx
{eyebrow ? (
  <p dir="ltr" className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
    {eyebrow}
  </p>
) : null}
```

---

# 10. تطوير الصفحة الرئيسية

## الملف

`src/app/(site)/page.tsx`

## المطلوب

### 10.1 تحسين Hero

- اجعل الشارة الأولى تحمل طابعًا تقنيًا:

```txt
available_for_work = true
```

أو إذا غير متاح:

```txt
currently_building = true
```

- أضف سطر صغير فوق الاسم مثل:

```txt
Full-stack developer crafting reliable web products
```

- اجعل زري CTA أوضح:
  - `ابدأ مشروعًا`
  - `استعرض المشاريع`

- استخدم `variant="terminal"` لأحد الأزرار بعد إضافته.

### 10.2 تحسين TerminalCard lines

استخدم سطور تعكس مبرمج:

```tsx
<TerminalCard
  lines={[
    "pnpm build --profile",
    "tests: unit + e2e passed",
    "deploy --target production",
  ]}
/>
```

لا يلزم استخدام pnpm إذا المشروع يستخدم npm، يمكن استخدام:

```txt
npm run build
npm run typecheck
deploy --target production
```

### 10.3 إضافة قسم طريقة العمل

أضف قسمًا بعد الإحصائيات بعنوان:

```txt
طريقة عملي من الفكرة إلى الإطلاق
```

ويحتوي 4 كروت:

1. Discover
   - أفهم المشكلة، الجمهور، والهدف.
2. Architect
   - أحدد البنية، قاعدة البيانات، والـ API.
3. Build
   - أنفذ Frontend و Backend بكود قابل للصيانة.
4. Ship
   - أختبر، أحسن الأداء، وأنشر.

الشكل يجب أن يكون تقنيًا:

- رقم صغير `01`, `02`, `03`, `04`.
- عنوان mono/English مع وصف عربي.
- border و hover.

### 10.4 تحسين الإحصائيات

- اجعل الكروت تستخدم `tech-card` أو نفس الأسلوب.
- أضف `+` بعد القيم إن كانت أكبر من صفر.
- لا تظهر `0` بشكل سيئ إذا البيانات غير موجودة؛ يمكن عرض `—`.

### 10.5 تحسين أقسام الصفحة

لكل قسم في الصفحة الرئيسية:

- المشاريع
- الخدمات
- التقنيات
- المدونة
- الأسئلة

أضف رابط صغير في يمين/يسار العنوان حسب RTL:

```txt
عرض الكل
```

يربط للصفحة المناسبة.

---

# 11. تحسين ProjectCard

## الملف

`src/features/projects/components/ProjectCard.tsx`

## المطلوب

### 11.1 إظهار النتيجة إذا موجودة

إذا كان `project.results` موجودًا، أضف صندوق صغير داخل الكرت:

```tsx
{project.results ? (
  <p className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs leading-6 text-muted-foreground">
    النتيجة: {project.results}
  </p>
) : null}
```

### 11.2 تحسين الروابط

- اجعل GitHub و Live ظاهرين كأزرار صغيرة.
- استخدم `dir="ltr"` على GitHub و Live.
- أضف `rel="noreferrer"` للروابط الخارجية.

### 11.3 تحسين fallback عند عدم وجود صورة

بدل `case-study/slug` فقط، اجعل الخلفية كأنها ملف كود:

```txt
/projects/[slug]
status: completed
stack: Next.js
```

بشكل بصري بسيط.

### 11.4 تحسين hover

- overlay خفيف على الصورة.
- تكبير بسيط للصورة.
- ظهور سهم أو `View case study`.

---

# 12. تحسين صفحة قائمة المشاريع

## الملف

`src/app/(site)/projects/page.tsx`

## المطلوب

- استخدم `PageHeader` الجديد مع:
  - `eyebrow="Projects"`
  - `routeLabel="~/projects"`
- أضف شريط filters بصري بسيط حتى لو كانت الفلاتر عبر query params موجودة:
  - category
  - technology
- إن لم يتم تنفيذ فلترة كاملة، على الأقل أظهر chips توضح أن الصفحة تدعم عرض المشاريع حسب التصنيف والتقنية.
- حسّن EmptyState برسالة مناسبة:

```txt
لا توجد مشاريع منشورة حاليًا
أضف مشروعًا من لوحة التحكم ليظهر هنا كدراسة حالة.
```

---

# 13. تطوير صفحة تفاصيل المشروع

## الملف

`src/app/(site)/projects/[slug]/page.tsx`

## المطلوب

### 13.1 استخدام PageHeader الجديد

مرر:

```tsx
<PageHeader
  eyebrow={project.category ?? "Case Study"}
  routeLabel={`~/projects/${project.slug}`}
  title={project.title}
  description={project.shortDescription}
>
  {/* أزرار Live/GitHub أو status */}
</PageHeader>
```

### 13.2 عرض صورة الغلاف

إذا يوجد `project.coverImage`، اعرضها تحت الهيدر مباشرة:

- aspect-video
- rounded-lg
- border
- object-cover
- shadow خفيف

### 13.3 عرض gallery

إذا يوجد `project.gallery` أو `project.images`:

- اعرض شبكة صور.
- أول 4 صور تكفي.
- استخدم `Image` من Next.
- تأكد من alt واضح.

### 13.4 تحسين كروت المشكلة/الحل/النتيجة/الدور

بدل كروت عادية جدًا، اجعلها كروت تقنية:

- عنوان مع رقم أو icon.
- border primary خفيف.
- وصف واضح.

### 13.5 تحسين aside

في aside اعرض:

- StatusBadge
- category
- completionDate إن موجودة
- views إن موجودة
- technologies
- GitHub
- Live Demo

### 13.6 أزرار الروابط

- GitHub يستخدم variant `terminal` أو `secondary`.
- Live Demo يستخدم primary.
- الروابط الخارجية فيها `target="_blank"` و `rel="noreferrer"`.

### 13.7 تحسين MarkdownRenderer داخل الصفحة

ضعه داخل container/card مناسب إذا المحتوى طويل.

---

# 14. تحسين ServiceCard

## الملف

`src/features/services/components/ServiceCard.tsx`

## المطلوب

- أضف hover مثل ProjectCard.
- اجعل الأيقونة داخل مربع تقني.
- أظهر مدة الخدمة `duration` إن وجدت.
- اعرض أول 3 أو 4 deliverables بعلامة check بدل `-`.
- أضف CTA واضح:

```txt
تفاصيل الخدمة
```

- اجعل السعر داخل badge أو سطر قوي.

---

# 15. تحسين صفحة الخدمات

## الملف

`src/app/(site)/services/page.tsx`

## المطلوب

- استخدم `PageHeader` الجديد مع:
  - `eyebrow="Services"`
  - `routeLabel="~/services"`
- أضف مقدمة قصيرة قبل الكروت توضّح أن الخدمات عملية وليست عناوين فقط.
- حسّن EmptyState.

---

# 16. تطوير صفحة تفاصيل الخدمة

## الملف

`src/app/(site)/services/[slug]/page.tsx`

## المطلوب

### 16.1 تحسين Header

استخدم:

```tsx
<PageHeader
  eyebrow="Service"
  routeLabel={`~/services/${service.slug}`}
  title={service.name}
  description={service.shortDescription}
/>
```

### 16.2 تقسيم التفاصيل

بدل عرض `detailedDescription` فقط داخل كرت، اعرض:

- وصف الخدمة.
- ماذا سأبني لك؟ من `deliverables`.
- ماذا أحتاج منك؟ من `requirements`.
- طريقة التنفيذ باختصار.

### 16.3 تحسين aside

اعرض:

- السعر.
- المدة.
- CTA.
- ملاحظة أن السعر حسب النطاق إذا غير محدد.

### 16.4 تحسين UX

زر CTA يذهب إلى `service.ctaUrl ?? "/contact"` كما هو، لكن اجعله واضحًا وممتدًا.

---

# 17. تحسين TechnologyCard

## الملف

`src/features/technologies/components/TechnologyCard.tsx`

## المطلوب

- أضف `font-mono` لاسم التقنية أو badge صغير.
- اعرض `yearsOfExperience` إن موجودة.
- اعرض `category` أو `group` كبادج.
- اجعل hover أقوى قليلًا.
- إذا يوجد `technology.color` استخدمه بحذر شديد كـ inline border/accent فقط، أو تجاهله إذا سيكسر التصميم.
- لا تستخدم ألوان كثيرة.

---

# 18. تحسين صفحة التقنيات

## الملف

`src/app/(site)/technologies/page.tsx`

## المطلوب

- استخدم `PageHeader` الجديد مع:
  - `eyebrow="Stack"`
  - `routeLabel="~/stack"`
- قسم التقنيات حسب `category` أو `group` بدل شبكة واحدة إن أمكن.
- إن لم يتم التقسيم، أضف filter-like chips أعلى الصفحة.
- اجعل الصفحة تعطي إحساس "خبرة عملية" لا مجرد أيقونات.

---

# 19. تطوير صفحة تفاصيل التقنية

## الملف

`src/app/(site)/technologies/[slug]/page.tsx`

## المطلوب

بدل الكرت البسيط الحالي:

```tsx
<p>المستوى: ...</p>
<p>التصنيف: ...</p>
<p>سنوات الخبرة: ...</p>
```

نفذ تصميمًا أفضل يحتوي:

- Header تقني.
- بطاقة معلومات:
  - المستوى باستخدام `StatusBadge`.
  - التصنيف.
  - سنوات الخبرة.
  - highlighted إن موجود.
- وصف التقنية.
- زر للموقع الرسمي إن `officialUrl` موجود.
- صندوق بعنوان:

```txt
كيف أستخدم هذه التقنية عمليًا؟
```

محتوى الصندوق يمكن أن يكون عامًّا بدون بيانات جديدة:

```txt
أستخدم هذه التقنية ضمن مشاريع عملية لبناء واجهات، APIs، أو تحسين تجربة التطوير حسب طبيعة المشروع.
```

مع تخصيص النص حسب `technology.name`.

---

# 20. تحسين PostCard

## الملف

`src/features/blog/components/PostCard.tsx`

## المطلوب

- أضف hover واضح.
- أضف overlay خفيف للصورة.
- حسّن fallback عند عدم وجود صورة ليشبه ملف markdown:

```txt
/blog/post-slug.md
```

- أظهر الوسوم `tags` إن وجدت، أول 3 فقط.
- اجعل التاريخ ووقت القراءة أوضح.
- أضف `rel="noreferrer"` عند الحاجة للروابط الخارجية فقط، روابط Next الداخلية لا تحتاج.

---

# 21. تحسين صفحة المدونة

## الملف

`src/app/(site)/blog/page.tsx`

## المطلوب

- استخدم `PageHeader` الجديد مع:
  - `eyebrow="Blog"`
  - `routeLabel="~/blog"`
- الروابط الحالية للتصنيفات خاطئة غالبًا لأن المشروع لا يحتوي routes ظاهرة لـ `/blog/category/[slug]` و `/blog/tag/[slug]` حسب الملفات الحالية.
- بدل الروابط الحالية:

```tsx
href={`/blog/category/${category.slug}`}
href={`/blog/tag/${tag.slug}`}
```

استخدم query params المتوافقة مع الصفحة الحالية:

```tsx
href={`/blog?category=${category.slug}`}
href={`/blog?tag=${tag.slug}`}
```

- أظهر الرابط النشط حسب `params.category` و `params.tag`.
- أضف رابط لمسح الفلاتر:

```txt
الكل
```

يربط إلى `/blog`.

---

# 22. تطوير صفحة تفاصيل المقال

## الملف

`src/app/(site)/blog/[slug]/page.tsx`

## المطلوب

### 22.1 استخدام PageHeader الجديد

مرر:

- `eyebrow` من التصنيف إن وجد، أو `Article`.
- `routeLabel={`~/blog/${post.slug}.md`}`.
- `title` و `description`.

### 22.2 عرض بيانات المقال

أضف تحت الهيدر أو داخل article:

- تاريخ النشر `publishDate`.
- وقت القراءة `readTime`.
- التصنيف.
- الوسوم أول 5.
- المشاهدات إن موجودة.

استخدم `formatDate` من `src/lib/utils.ts`.

### 22.3 عرض صورة المقال

إذا يوجد:

```tsx
post.featuredImage ?? post.coverImage
```

اعرضها قبل المحتوى.

### 22.4 تحسين صندوق الكاتب

أضف صندوق author في نهاية المقال:

```txt
كتبه: اسم المبرمج
مقالات وتجارب عملية حول بناء منتجات ويب قابلة للصيانة.
```

يمكن جلب `profile` عبر `publicApi.profile().catch(() => null)` داخل الصفحة.

### 22.5 تحسين عرض المحتوى

- حافظ على `MarkdownRenderer`.
- ضع المحتوى داخل `max-w-3xl`.
- أضف aside اختياري في الشاشات الكبيرة يحتوي معلومات المقال أو CTA للتواصل.

---

# 23. تحسين صفحة من أنا

## الملف

`src/app/(site)/about/page.tsx`

## المطلوب

### 23.1 Header

استخدم:

```tsx
<PageHeader
  eyebrow="About"
  routeLabel="~/about"
  title="من أنا"
  description={profile?.headline ?? "نبذة مهنية عن طريقة عملي وخبرتي التقنية."}
/>
```

### 23.2 عرض صورة البروفايل

إذا يوجد `profile.profileImage`:

- اعرضها في aside أو أعلى الصفحة.
- استخدم `profile.profileImageAlt ?? profile.fullName`.

### 23.3 تحسين article

- أضف عنوانًا فرعيًا:

```txt
أبني منتجات ويب واضحة وقابلة للصيانة
```

- اجعل النص داخل كرت أجمل.
- أضف 3 كروت صغيرة:
  - Frontend
  - Backend
  - Performance

### 23.4 تحسين aside

- البريد كرابط mailto.
- CV كزر واضح.
- socialLinks إن وجدت.
- اللغات والشهادات بشكل badges أو cards.

---

# 24. تحسين صفحة التواصل

## الملفات

`src/app/(site)/contact/page.tsx`

`src/features/contact/components/ContactForm.tsx`

## المطلوب في صفحة التواصل

### 24.1 Header

استخدم:

```tsx
<PageHeader
  eyebrow="Contact"
  routeLabel="~/contact"
  title="التواصل"
  description="للتعاون المهني، بناء منتج، تحسين أداء، أو استشارة تقنية."
/>
```

### 24.2 تحسين aside

بدل عرض النصوص فقط:

- البريد كرابط:

```tsx
<a href={`mailto:${profile.email}`}>{profile.email}</a>
```

- الهاتف كرابط إن وجد:

```tsx
<a href={`tel:${profile.phone}`}>{profile.phone}</a>
```

- الموقع.
- حالة التوفر:

```txt
available_for_work = true/false
```

### 24.3 إضافة Terminal contact card

أضف كرت بجانب النموذج أو داخل aside:

```txt
$ contact --channel=email
status: available
response_time: within 24h
stack: Next.js / NestJS
```

### المطلوب في ContactForm

- أضف `aria-invalid` للحقول التي فيها أخطاء.
- أضف focus ring موحد.
- عند الإرسال، غير نص الزر إلى:

```txt
جارٍ الإرسال...
```

- لا تسمح بإرسال متكرر أثناء `isSubmitting`.
- أضف `autoComplete` مناسب:
  - name
  - email
  - tel
- حسّن رسائل الخطأ بصريًا.

---

# 25. تحسين صفحة الروابط

## الملفات

`src/app/(site)/links/page.tsx`

`src/features/links/components/TrackedLink.tsx`

## المطلوب

### LinksPage

- استخدم `PageHeader` الجديد مع:
  - `eyebrow="Links"`
  - `routeLabel="~/links"`
- إذا لا توجد روابط، أضف EmptyState بدل شبكة فارغة.

### TrackedLink

- حسّن hover.
- إذا الرابط `isFeatured` أضف badge صغير:

```txt
Featured
```

- اعرض `platform` أو `category` إن وجد.
- استخدم شكل link تقني.

---

# 26. تحسين صفحة الأسئلة الشائعة

## الملف

`src/app/(site)/faqs/page.tsx`

## المطلوب

- استخدم `PageHeader` الجديد مع:
  - `eyebrow="FAQ"`
  - `routeLabel="~/faqs"`
- إذا لا توجد أسئلة، أضف EmptyState.
- إن كانت الأسئلة فيها category، يمكن تجميعها حسب التصنيف إن كان سهلًا.

---

# 27. تحسين FaqList

## الملف

`src/features/faqs/components/FaqList.tsx`

## المطلوب

- افحص المكون وحسّنه بصريًا.
- اجعله كـ accordion إن كان حاليًا ليس accordion.
- أضف hover و border.
- اجعل السؤال واضحًا والإجابة بلون muted.
- حافظ على سهولة القراءة في RTL.

---

# 28. تحسين EmptyState و ErrorState

## الملف

`src/components/common/State.tsx`

## المطلوب

- اجعل EmptyState يعكس هوية تقنية:

```txt
No data found
```

لكن مع نص عربي واضح.

- أضف `children` يظهر أسفل الوصف بتباعد جيد.
- أضف إمكانية `icon` اختياري إن أمكن بدون كسر الاستخدام الحالي.
- حسّن ErrorState بحيث لا يكون أحمر صارخ جدًا.

---

# 29. تحسين MarkdownRenderer

## الملف

`src/components/common/MarkdownRenderer.tsx`

## المطلوب

- حافظ على `rehypeSanitize` و `remarkGfm`.
- لا تزيل الحماية.
- أضف دعمًا بصريًا أفضل عبر CSS فقط في `prose-tech`.
- إن احتجت تخصيص links داخل ReactMarkdown، اجعل الروابط الخارجية تفتح في tab جديد مع `rel="noreferrer"`.
- الكود يجب أن يبقى LTR.

---

# 30. تحسين SiteFooter

## الملف

`src/components/site/SiteFooter.tsx`

## المطلوب

- عدّل الشعار مثل الهيدر:

```txt
<Mohd.dev />
```

- أضف سطر تقني صغير:

```txt
Built with Next.js, TypeScript, and clean architecture.
```

- أضف روابط سريعة من `siteNav` بشكل مختصر.
- أضف socialLinks كما هي.
- أضف السنة الحالية:

```tsx
new Date().getFullYear()
```

- لا تجعل الفوتر ضخمًا.

---

# 31. إصلاح روابط تصنيفات ووسوم المدونة

## الملف

`src/app/(site)/blog/page.tsx`

## المشكلة

الصفحة تستخدم query params:

```tsx
publicApi.posts({ page: params.page ?? 1, categorySlug: params.category, tagSlug: params.tag })
```

لكن الروابط الحالية تذهب إلى routes غير موجودة ظاهريًا:

```tsx
/blog/category/${category.slug}
/blog/tag/${tag.slug}
```

## المطلوب

استبدالها بـ:

```tsx
/blog?category=${category.slug}
/blog?tag=${tag.slug}
```

وأضف رابط:

```tsx
<Link href="/blog">الكل</Link>
```

مع active state.

---

# 32. تحسين استخدام الصور

## الملفات المتأثرة

- `src/features/projects/components/ProjectCard.tsx`
- `src/app/(site)/projects/[slug]/page.tsx`
- `src/features/blog/components/PostCard.tsx`
- `src/app/(site)/blog/[slug]/page.tsx`
- `src/app/(site)/about/page.tsx`

## المطلوب

- استخدم `next/image`.
- أضف alt مناسب.
- لا تعرض صورة فارغة.
- إذا لا توجد صورة، استخدم fallback تقني جميل بدل مساحة فارغة.
- حافظ على aspect ratio.
- أضف border و rounded.

---

# 33. تحسين إمكانية الوصول Accessibility

## المطلوب في كل الواجهة

- كل الأزرار الأيقونية يجب أن تحتوي `aria-label`.
- حقول النماذج يجب أن تكون مرتبطة بـ label واضح.
- الروابط الخارجية يجب أن تحتوي `rel="noreferrer"` عند `target="_blank"`.
- focus-visible واضح في الأزرار والروابط.
- لا تعتمد على اللون وحده في الحالات status.
- لا تجعل النصوص الرمادية منخفضة التباين جدًا.

---

# 34. تحسين تجربة الهاتف Mobile UX

## المطلوب

- تأكد أن Hero لا يسبب overflow أفقي.
- TerminalCard و CodePreviewCard يجب أن يكونا بعرض مناسب على الشاشات الصغيرة.
- القوائم والكروت يجب أن تكون بتباعد جيد.
- أزرار CTA في Hero تكون full width أو wrap بشكل جميل على الهاتف.
- mobile menu في الهيدر يجب أن يظهر active state.

---

# 35. تحسين النصوص لتعكس هوية المبرمج

## المطلوب

راجع النصوص العامة، واجعلها أقرب لمبرمج محترف.

أمثلة:

بدل:

```txt
خدمات برمجية واضحة
```

يمكن:

```txt
خدمات برمجية من الفكرة إلى الإطلاق
```

بدل:

```txt
تقنيات أستخدمها عملياً
```

يمكن:

```txt
Stack أستخدمه لبناء منتجات قابلة للصيانة
```

بدل:

```txt
آخر المقالات التقنية
```

يمكن:

```txt
ملاحظات وتجارب من داخل التطوير
```

لا تبالغ في اللغة التسويقية، المهم أن يشعر الزائر أن صاحب الموقع مبرمج يعرف ماذا يفعل.

---

# 36. تحسين صفحة الإدارة ليس مطلوبًا هنا

## ملاحظة

هذه الخطة تخص واجهة الموقع العامة فقط داخل:

```txt
src/app/(site)
src/components/site
src/components/common
src/features/*/components
```

لا تعدّل لوحة الإدارة إلا إذا كان تعديل component عام يؤثر عليها مثل `Button` أو `StatusBadge`، وعندها تأكد ألا تكسر لوحة الإدارة.

---

# 37. ملفات يجب مراجعتها وتعديلها

نفذ التعديلات في هذه الملفات:

```txt
src/app/globals.css
src/app/layout.tsx
src/app/(site)/page.tsx
src/app/(site)/about/page.tsx
src/app/(site)/projects/page.tsx
src/app/(site)/projects/[slug]/page.tsx
src/app/(site)/services/page.tsx
src/app/(site)/services/[slug]/page.tsx
src/app/(site)/technologies/page.tsx
src/app/(site)/technologies/[slug]/page.tsx
src/app/(site)/blog/page.tsx
src/app/(site)/blog/[slug]/page.tsx
src/app/(site)/contact/page.tsx
src/app/(site)/links/page.tsx
src/app/(site)/faqs/page.tsx
src/components/site/SiteHeader.tsx
src/components/site/SiteFooter.tsx
src/components/common/Button.tsx
src/components/common/PageHeader.tsx
src/components/common/SectionHeader.tsx
src/components/common/StatusBadge.tsx
src/components/common/TechStackBadge.tsx
src/components/common/TerminalCard.tsx
src/components/common/ThemeToggle.tsx
src/components/common/MarkdownRenderer.tsx
src/components/common/State.tsx
src/features/projects/components/ProjectCard.tsx
src/features/services/components/ServiceCard.tsx
src/features/technologies/components/TechnologyCard.tsx
src/features/blog/components/PostCard.tsx
src/features/contact/components/ContactForm.tsx
src/features/links/components/TrackedLink.tsx
src/features/faqs/components/FaqList.tsx
```

---

# 38. معايير القبول النهائية

بعد تنفيذ الخطة يجب أن تتحقق النقاط التالية:

- الصفحة الرئيسية تعطي مباشرة انطباع أن الموقع لمبرمج محترف.
- كل الصفحات الداخلية تستخدم Header موحد بتصميم تقني.
- الهيدر يحتوي شعار تقني، active state صحيح، زر تواصل، وزر ثيم.
- TerminalCard يعمل بدون تكرار خاطئ للنص.
- كروت المشاريع تظهر الصورة أو fallback تقني جميل.
- تفاصيل المشروع تعرض الصورة، المشكلة، الحل، النتيجة، الدور، التقنيات، والروابط.
- صفحة المدونة تستخدم query params الصحيحة للتصنيفات والوسوم.
- صفحة تفاصيل المقال تعرض صورة المقال وبياناته وصندوق الكاتب.
- صفحة التقنيات تعكس خبرة عملية لا مجرد قائمة أسماء.
- صفحة التواصل تحتوي terminal contact card وروابط mailto/tel.
- جميع الروابط الخارجية تحتوي `rel="noreferrer"`.
- الأزرار والحقول لها focus واضح.
- التصميم يعمل على الجوال بدون overflow.
- `npm run lint` ينجح.
- `npm run typecheck` ينجح.
- `npm run build` ينجح.

---

# 39. ملاحظات تنفيذية مهمة

- إذا واجهت حقولًا غير موجودة في البيانات، استخدم شرطًا قبل العرض ولا تضف حقولًا جديدة إجبارية.
- إذا كان `profile` غير موجود، يجب أن تستمر الواجهة بعرض fallback محترم.
- لا تضع نصوصًا إنجليزية طويلة داخل الواجهة العربية، فقط المصطلحات التقنية القصيرة مثل:
  - Stack
  - Case Study
  - Build
  - Ship
  - Live Demo
  - GitHub
- لا تستخدم ألوان كثيرة؛ حافظ على primary green وsecondary blue فقط مع muted.
- اجعل كل شيء يبدو كواجهة مبرمج: terminal, code, routes, stack, case studies, clean cards.

