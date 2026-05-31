# مواصفات الديزاين سيستم للفرونت

> الهدف: منع بناء واجهة عشوائية أو قالبية. هذا الملف يحدد أسلوب التصميم والمكونات والقواعد البصرية لموقع شخصي احترافي ومدونة ولوحة إدارة.


---

## 0) الهوية البصرية النهائية

هذا الديزاين سيستم مخصص لموقع **مبرمج / Software Engineer**. يجب أن يظهر الطابع التقني بوضوح لكن بشكل راقٍ وهادئ.

### الاتجاه المطلوب

- Developer portfolio عالي الجودة.
- Blog تقنية مريحة للقراءة.
- Cards للمشاريع تشبه case studies.
- لمسات code/terminal/grid/dots خفيفة.
- استخدام واضح للتقنيات والـ stack والروابط العملية.

### ممنوع

- شكل corporate landing page عام.
- شكل هاكر أو neon مبالغ فيه.
- زخرفة تقنية بلا معنى.
- استخدام تأثيرات تجعل النصوص صعبة القراءة.

---

## 1) الاتجاه البصري

المطلوب واجهة:

- هادئة.
- حديثة.
- احترافية.
- قابلة للقراءة.
- فيها لمسة شخصية وليست قالبًا مكررًا.

لا نريد:

- ألوان كثيرة.
- زخارف مبالغ فيها.
- gradients صاخبة.
- animations مزعجة.
- صفحات مليئة ببطاقات ضخمة بلا سبب.

---

## 2) الأسلوب العام

### Public Site

- Hero قوي بصريًا.
- أقسام واضحة ومتنفسة.
- Cards خفيفة.
- مسافات generous.
- خط واضح ومريح.
- صور مشاريع ومقالات تعطي إحساس حقيقي.
- Motion خفيف عند scroll أو hover.

### Admin CMS

- عملي أكثر من استعراضي.
- كثافة بيانات متوسطة.
- جداول واضحة.
- Drawers/Dialogs للنماذج القصيرة.
- Pages/Tabs للنماذج الطويلة.
- Feedback واضح لكل عملية.

---

## 3) Tokens

عرّف الألوان عبر CSS variables فقط:

```css
:root {
  --background: ...;
  --foreground: ...;
  --card: ...;
  --card-foreground: ...;
  --muted: ...;
  --muted-foreground: ...;
  --primary: ...;
  --primary-foreground: ...;
  --secondary: ...;
  --accent: ...;
  --border: ...;
  --success: ...;
  --warning: ...;
  --danger: ...;
}
```

لا تستخدم hex مباشر داخل كل component إلا لحالة ضرورية جدًا.

---

## 4) Typography

### Public

- H1 كبير وواضح.
- H2 للأقسام.
- Body line-height مريح.
- محتوى المقال يجب أن يكون `prose` أو مكون قراءة مخصص.

### Admin

- عناوين مختصرة.
- لا تجعل page header ضخمًا.
- استخدم وصف قصير عند الحاجة.

---

## 5) Spacing

- Container موحد.
- Section padding ثابت.
- Cards لا تكون كبيرة جدًا.
- لا تكدس العناصر.
- لا تجعل الصفحة الرئيسية طويلة بلا هدف.

---

## 6) المكونات المشتركة الإلزامية

```txt
Container
PageHeader
SectionHeader
EmptyState
ErrorState
LoadingSkeleton
Pagination
StatusBadge
ConfirmDialog
DataTable
MediaPicker
SEOFields
ArrayField
MarkdownRenderer
TechStackBadge
CodePreviewCard
TerminalCard
ProjectCaseStudyCard
```

كل صفحة يجب أن تستخدم هذه المكونات بدل إعادة اختراعها.

---

## 7) قواعد البطاقات

### ProjectCard

يجب أن تحتوي:

- صورة.
- title.
- shortDescription.
- category.
- technologies.
- روابط مختصرة.

لا تعرض كل الحقول في البطاقة.

### PostCard

يجب أن تحتوي:

- صورة.
- title.
- summary.
- category.
- publish date.
- read time.

### ServiceCard

يجب أن تحتوي:

- icon.
- name.
- shortDescription.
- price.
- deliverables مختصرة.
- CTA.

---

## 8) Animation

مسموح:

- fade/slide خفيف.
- hover lift بسيط.
- animated underline للروابط.
- stagger بسيط للبطاقات.

ممنوع:

- animation على كل شيء.
- delays طويلة.
- تأثيرات تشتت قراءة المقال.
- حركات ثقيلة داخل admin.

---

## 9) Responsive

كل الصفحات يجب أن تعمل على:

- mobile 360px.
- tablet.
- desktop.
- large desktop.

القواعد:

- Header يتحول إلى mobile nav.
- Project cards تتحول إلى عمود واحد.
- Tables في admin تستخدم horizontal scroll أو cards mobile.
- Forms لا تتجاوز الشاشة.
- Drawers لا تختفي خلف overlays.

---

## 10) Accessibility

- كل صورة لها alt.
- الأزرار لها labels واضحة.
- focus states موجودة.
- keyboard navigation يعمل.
- contrast مقبول.
- لا تستخدم div كزر.
- Dialogs/Sheets تغلق بـ Escape.

---

## 11) UX States

لكل صفحة أو component يجلب بيانات:

- loading.
- empty.
- error.
- success عند الحاجة.

لكل mutation:

- disabled أثناء الإرسال.
- loading indicator.
- toast success/error.
- لا ترسل مرتين.

---

## 12) Admin Tables

كل table يجب أن يدعم عند الحاجة:

- search.
- filters.
- pagination.
- row actions.
- status badge.
- created/updated dates.
- empty state.
- skeleton.

لا تستخدم جداول ضخمة بصريًا. الصفوف يجب أن تكون مريحة ومضغوطة بشكل معقول.

---

## 13) Forms

- الحقول الطويلة تقسم tabs/sections.
- كل form لديه save/cancel واضحين.
- errors تظهر تحت الحقول.
- slug field إما auto-generated أو editable بوضوح.
- SEO section في tab مستقل.
- media fields تستخدم MediaPicker وليس URL input فقط.

---

## 14) تجربة قراءة المقال

- عرض المحتوى بعرض قراءة مناسب، ليس full width.
- line-height مريح.
- headings واضحة.
- code blocks إن وجدت منسقة.
- images داخل المقال responsive.
- table of contents على desktop إن أمكن.
- share buttons لا تغطي المحتوى.

---

## 15) معيار القبول البصري

قبل التسليم يجب أن تحقق الواجهة:

- الصفحة الرئيسية تبدو مميزة.
- صفحات المقال مقروءة ومريحة.
- المشاريع تعرض بشكل قوي بصريًا.
- لوحة الإدارة عملية ونظيفة.
- لا توجد مساحات ضخمة بلا داعٍ.
- لا توجد عناصر متداخلة أو مكسورة في الجوال.
- لا توجد مكونات بأحجام عشوائية.
