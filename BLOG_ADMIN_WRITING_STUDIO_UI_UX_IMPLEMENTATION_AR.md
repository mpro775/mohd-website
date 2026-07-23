# خطة تنفيذ إعادة تصميم صفحة المدونة ومحرر المقالات داخل لوحة التحكم

## 1. معلومات المهمة

- **المشروع:** `mohd-website`
- **النطاق:** واجهة إدارة المدونة فقط داخل `frontend`
- **الهدف:** تحويل صفحة المقالات ومحرر المقال من نموذج إداري تقليدي إلى **Blog Writing Studio** احترافي، سريع، واضح، ومناسب للمحتوى العربي والتقني.
- **المبدأ الأساسي:** الحفاظ على الباك إند الحالي، عقود الـ API الحالية، مخططات البيانات الحالية، ومعظم منطق الحفظ التلقائي والحفظ اليدوي والتعارض والجاهزية والنشر والجدولة كما هو.
- **نوع التغيير:** إعادة هيكلة UI/UX كبيرة في الفرونت إند مع إعادة استخدام المنطق الحالي، وليست إعادة بناء لنظام المدونة.

---

# 2. النتيجة النهائية المطلوبة

بعد تنفيذ هذه الخطة يجب أن تصبح لوحة المدونة مكوّنة من تجربتين واضحتين:

1. **صفحة إدارة المقالات**
   - ملخص سريع لحالة المحتوى.
   - بحث وفلاتر مفهومة بأسماء فعلية بدل المعرّفات التقنية.
   - قائمة مقالات منظمة وسهلة القراءة.
   - إجراءات فردية وجماعية احترافية دون `window.prompt` أو `window.confirm`.
   - تجربة هاتف مخصصة للمقالات.

2. **استوديو كتابة المقال**
   - مساحة كتابة واسعة ومريحة.
   - رأس ثابت يعرض حالة المقال والحفظ وأهم الإجراءات.
   - عنوان وملخص ومحتوى داخل تدفق كتابة واحد.
   - لوحة خصائص جانبية موحدة وقابلة للطي.
   - أوضاع واضحة: كتابة، Markdown، مقارنة، معاينة.
   - وضع تركيز يخفي مشتتات لوحة التحكم.
   - دعم RTL للمقال العربي وLTR للأكواد والروابط فقط.
   - تجربة نشر وجدولة ومراجعة أكثر وضوحًا دون تغيير منطقها الخلفي.

---

# 3. قيود إلزامية لا يجوز مخالفتها

## 3.1 ممنوعات الباك إند

لا يتم في هذه المهمة:

- تعديل مخططات MongoDB.
- تعديل DTOs.
- تغيير مسارات الـ API.
- تغيير أسماء الحقول أو شكل الاستجابات.
- إضافة أو حذف حالات المقال.
- تغيير قواعد الصلاحيات.
- تغيير قواعد الجاهزية للنشر.
- تغيير منطق الإصدارات أو التعارض أو الـ autosave.
- تغيير منطق النشر أو إلغاء النشر أو الجدولة أو الأرشفة.

## 3.2 منطق فرونت إند يجب الحفاظ عليه

يجب إعادة استخدام المنطق الموجود داخل:

- `frontend/src/features/blog-admin/post-form/PostEditorPage.tsx`
- `frontend/src/features/blog-admin/hooks/usePostAutosave.ts`
- `frontend/src/features/blog-admin/hooks/usePostConflict.ts`
- `frontend/src/features/blog-admin/hooks/usePostReadiness.ts`
- `frontend/src/features/blog-admin/hooks/useUnsavedChangesGuard.ts`
- `frontend/src/features/blog-admin/schemas/post-editor.schema.ts`
- `frontend/src/features/blog-admin/utils/editor-draft-storage.ts`
- `frontend/src/features/blog-admin/utils/post-date.ts`

يحظر نسخ منطق هذه الأدوات إلى مكونات جديدة. المطلوب نقل العرض فقط، وتمرير الحالة والدوال إلى المكونات الجديدة.

## 3.3 المحرر الحالي

- لا يتم استبدال `@mdxeditor/editor`.
- لا يتم حذف Mermaid أو Markdown import/export أو مكتبة الوسائط.
- لا يتم حذف Rich Text أو Source أو Diff.
- لا يتم تغيير صيغة Markdown المخزنة.

## 3.4 التصميم

- الواجهة عربية أولًا و`dir="rtl"`.
- الأكواد، الروابط، slug، canonical URL، وأسماء الملفات فقط تكون `dir="ltr"`.
- يجب دعم الوضعين الفاتح والداكن.
- يجب الالتزام بألوان المشروع الحالية ومتغيرات Tailwind الموجودة مثل:
  - `bg-background`
  - `bg-card`
  - `border-border`
  - `text-foreground`
  - `text-muted-foreground`
  - `bg-primary`
  - `text-danger`
- لا تضف مكتبة تصميم جديدة.
- استخدم المكتبات المتوفرة حاليًا:
  - Radix Dialog
  - Radix AlertDialog
  - Radix Tabs
  - Radix Popover
  - Radix DropdownMenu
  - Radix Select
  - `cmdk`
  - `lucide-react`
  - `sonner`
  - `framer-motion` عند الحاجة فقط

---

# 4. المشاكل الحالية المطلوب إغلاقها

## 4.1 محرر المقال

- الصفحة تبدو كنموذج إداري طويل وليست استوديو كتابة.
- مساحة المحرر ضيقة بسبب اللوحة الجانبية الثابتة بعرض `360px`.
- توجد تبويبات تحرير/معاينة خارجية، وأوضاع Rich Text/Source/Diff داخلية؛ أي يوجد تكرار مربك.
- المحرر بالكامل مضبوط حاليًا على `dir="ltr"`.
- العنوان والملخص والمقتطف موجودة في بطاقة منفصلة بعيدة عن تدفق الكتابة.
- اللوحة الجانبية تحتوي بطاقات كثيرة معروضة كلها مرة واحدة.
- حالة الحفظ موجودة أسفل المحرر بدل الرأس.
- لا يوجد وضع تركيز.
- لا توجد عدادات أحرف واضحة.
- لا توجد معاينة SEO احترافية.
- صورة الغلاف والصورة البارزة وصورة Open Graph منفصلة دون اختصارات لإعادة الاستخدام.
- توجد نوافذ `window.prompt` و`window.confirm` في عمليات مهمة.

## 4.2 صفحة المقالات

- فلاتر التصنيف والكاتب تستخدم Object IDs.
- أدوات الفلترة موزعة في صف مزدحم.
- لا يوجد ملخص أعداد المقالات حسب الحالة.
- ألوان حالات المقالات غير مميزة بما يكفي.
- توجد أزرار كثيرة داخل كل صف.
- تجربة الهاتف ناتجة عن DataTable عامة وليست بطاقة مقال مخصصة.
- إجراءات التعيين الجماعي تطلب IDs عبر prompt.
- لا توجد شرائح للفلاتر النشطة.
- الأدوات الثانوية مثل CSV وخيارات الأعمدة ظاهرة أكثر من اللازم.

---

# 5. هيكل الملفات المستهدف

## 5.1 مكونات جديدة لاستوديو الكتابة

أنشئ المجلد:

```text
frontend/src/features/blog-admin/writing-studio/
```

وأنشئ الملفات التالية:

```text
BlogWritingStudio.tsx
BlogEditorTopbar.tsx
BlogDocumentHeader.tsx
BlogEditorWorkspace.tsx
BlogEditorModeTabs.tsx
BlogEditorInspector.tsx
BlogEditorInspectorTabs.tsx
BlogEditorFocusButton.tsx
BlogSaveState.tsx
BlogWordMetrics.tsx
BlogPublishReadinessPopover.tsx
BlogPublishDialog.tsx
BlogScheduleDialog.tsx
BlogRequestChangesDialog.tsx
BlogArchiveDialog.tsx
BlogConflictDialog.tsx
BlogUnsavedChangesDialog.tsx
BlogSeoPreview.tsx
BlogMediaOverview.tsx
BlogOutlinePanel.tsx
blog-writing-studio.types.ts
```

لا يلزم أن تكون كل المكونات كبيرة. الهدف فصل مسؤوليات العرض عن `PostEditorPage.tsx`.

## 5.2 مكونات جديدة لصفحة المقالات

أنشئ المجلد:

```text
frontend/src/features/admin/resources/posts/components/
```

وأنشئ:

```text
PostStatsOverview.tsx
PostStatusTabs.tsx
PostFiltersBar.tsx
PostAdvancedFilters.tsx
PostActiveFilters.tsx
PostListTable.tsx
PostMobileCard.tsx
PostStatusBadge.tsx
PostActionsMenu.tsx
PostBulkActionsBar.tsx
PostBulkCategoryDialog.tsx
PostBulkTagDialog.tsx
PostDeleteDialog.tsx
PostPermanentDeleteDialog.tsx
PostEmptyState.tsx
PostRowReadiness.tsx
```

## 5.3 مكونات مشتركة جديدة أو مطورة

أنشئ عند الحاجة:

```text
frontend/src/components/admin/AdminLayoutModeContext.tsx
frontend/src/components/admin/forms/SearchableCombobox.tsx
frontend/src/components/admin/forms/CharacterCounter.tsx
frontend/src/components/admin/ResponsiveDialog.tsx
```

يمكن إعادة استخدام `ConfirmDialog.tsx` الحالي وتطويره بدل إنشاء مكون تأكيد جديد إذا كان مناسبًا.

---

# 6. المرحلة الأولى: تهيئة وضع استوديو داخل AdminShell

## 6.1 إنشاء سياق وضع التخطيط

أنشئ:

```text
frontend/src/components/admin/AdminLayoutModeContext.tsx
```

بالواجهة التالية:

```ts
export type AdminLayoutMode = "default" | "focus";

type AdminLayoutModeContextValue = {
  mode: AdminLayoutMode;
  setMode: (mode: AdminLayoutMode) => void;
};
```

يجب أن يوفّر Hook:

```ts
useAdminLayoutMode()
```

## 6.2 تعديل AdminShell

عدّل:

```text
frontend/src/components/admin/AdminShell.tsx
```

بحيث:

- يغلّف المحتوى بـ `AdminLayoutModeProvider`.
- عند `mode === "focus"`:
  - إخفاء sidebar على سطح المكتب.
  - إخفاء رأس لوحة التحكم العام.
  - إزالة padding الكبير من `<main>`.
  - استخدام مساحة الشاشة كاملة للمحرر.
  - منع فتح القائمة المتنقلة أثناء وضع التركيز.
- لا تغيّر التخطيط الافتراضي لبقية صفحات لوحة التحكم.

التصميم المقترح:

```tsx
<main
  className={cn(
    "flex-1 overflow-y-auto bg-background/50 custom-scrollbar",
    mode === "focus" ? "p-0" : "p-4 md:p-6 lg:p-8"
  )}
>
  {children}
</main>
```

## 6.3 الخروج من وضع التركيز

داخل استوديو الكتابة:

- زر واضح: `الخروج من وضع التركيز`.
- دعم مفتاح `Escape` للخروج.
- عند مغادرة صفحة المحرر يجب إعادة الوضع إلى `default` داخل cleanup effect.
- لا تحفظ وضع التركيز دائمًا في localStorage؛ هو خاص بجلسة التحرير الحالية.

### معيار القبول

- لا تتأثر أي صفحة أخرى في لوحة التحكم.
- عند فتح وضع التركيز تصبح مساحة المحرر بعرض الشاشة.
- عند الضغط على `Esc` يعود التخطيط الطبيعي.
- عند الانتقال إلى صفحة أخرى يعود التخطيط الطبيعي تلقائيًا.

---

# 7. المرحلة الثانية: إعادة هيكلة PostEditorPage دون تغيير المنطق

## 7.1 مسؤولية PostEditorPage بعد التعديل

يبقى الملف:

```text
frontend/src/features/blog-admin/post-form/PostEditorPage.tsx
```

هو المسؤول عن:

- تحميل المقال.
- `react-hook-form`.
- حفظ يدوي.
- حفظ تلقائي.
- التعارض.
- الحماية من مغادرة الصفحة.
- استدعاء readiness.
- تنفيذ actions الحالية.
- التنقل بعد إنشاء المقال.

لكن يجب أن يتوقف عن احتواء JSX ضخم ومتداخل.

يجب أن يعيد مكونًا مثل:

```tsx
<BlogWritingStudio
  post={post}
  form={form}
  values={values}
  loading={loading}
  busy={busy}
  savedMarkdown={savedMarkdown}
  scheduleValue={scheduleValue}
  autosave={autosave}
  readiness={readiness}
  conflict={conflict}
  guard={guard}
  onScheduleValueChange={setScheduleValue}
  onSave={...}
  onAction={...}
/>
```

## 7.2 عدم تغيير payloads

يجب إبقاء:

```ts
valuesFromPost()
editablePayload()
save()
action()
```

بنفس العقود الحالية، ويمكن نقلها إلى ملف مساعد فقط إذا لم يتغير سلوكها.

لا تغيّر:

- `expectedVersion`
- `saveReason`
- مسار `/autosave`
- مسار workflow actions
- قواعد تحويل التاريخ
- التعامل مع 409 conflict

## 7.3 منع إعادة render غير الضرورية

- استخدم `useWatch` بدل `form.watch()` الشامل داخل المكونات الصغيرة عندما يمكن.
- لا تمرر كائن form كاملًا إلى كل مكون إذا كان يحتاج حقلين فقط.
- استخدم `React.memo` للمكونات الثقيلة مثل المعاينة وSEO Preview عند الحاجة.
- لا تكسر تحديث MDXEditor.

---

# 8. المرحلة الثالثة: بناء رأس استوديو الكتابة

أنشئ:

```text
BlogEditorTopbar.tsx
```

## 8.1 محتوى الرأس

### الجانب الأيمن

- زر رجوع إلى المقالات.
- حالة المقال الحالية مع Badge ملون.
- عنوان قصير:
  - `مقال جديد`
  - أو عنوان المقال مقصوصًا عند الطول.

### الوسط

- حالة الحفظ:
  - لا تغييرات.
  - تغييرات غير محفوظة.
  - جارٍ الحفظ.
  - تم الحفظ.
  - فشل الحفظ.
- آخر وقت حفظ عند توفره.

### الجانب الأيسر

- زر وضع التركيز.
- زر معاينة.
- قائمة المزيد.
- زر حفظ المسودة/حفظ التغييرات.
- زر النشر الأساسي حسب الحالة.

## 8.2 زر الإجراء الأساسي حسب الحالة

استخدم الحالات الحالية فقط:

| الحالة | الإجراء الأساسي |
|---|---|
| مقال جديد | حفظ المسودة |
| draft | نشر الآن أو إرسال للمراجعة حسب الصلاحية والمنطق الحالي |
| changes_requested | حفظ التغييرات / إرسال للمراجعة |
| in_review | اعتماد أو طلب تعديل حسب الواجهة الحالية |
| approved | نشر الآن |
| scheduled | إدارة الجدولة |
| published | عرض المقال، مع إجراءات النشر داخل قائمة المزيد |
| archived | إعادة إلى المسودة |

لا تستنتج صلاحيات جديدة. استخدم نفس الأزرار التي يسمح بها `PostPublishingPanel` الحالي.

## 8.3 قائمة المزيد

تستخدم Radix DropdownMenu وتشمل بحسب الحالة:

- فتح المعاينة في تبويب جديد.
- سجل الإصدارات.
- استيراد Markdown.
- تصدير Markdown.
- إلغاء النشر.
- إلغاء الجدولة.
- أرشفة.

لا تضع كل الإجراءات الخطرة كأزرار دائمة في الرأس.

## 8.4 تصميم الرأس

- `sticky top-0 z-50`
- خلفية شفافة جزئيًا مع blur.
- ارتفاع تقريبي 64–72px.
- حدود سفلية واضحة.
- على الهاتف:
  - إخفاء النصوص الثانوية.
  - عرض زر حفظ وأزرار الأيقونات.
  - نقل العمليات الإضافية إلى Dropdown.

---

# 9. المرحلة الرابعة: تحويل معلومات المقال إلى تدفق كتابة طبيعي

أنشئ:

```text
BlogDocumentHeader.tsx
```

## 9.1 العنوان

بدل بطاقة `PostBasicsPanel` التقليدية، اجعل عنوان المقال داخل مساحة المستند:

```text
[ عنوان المقال الكبير ... ]
```

المواصفات:

- بدون border دائم.
- يظهر border أو background خفيف عند التركيز فقط.
- حجم كبير:
  - الهاتف: `text-3xl`
  - سطح المكتب: `text-4xl` أو `text-5xl`
- `font-bold`.
- `dir="auto"`.
- placeholder واضح: `اكتب عنوان المقال`.
- عداد أحرف صغير يظهر عند الاقتراب من الحد.

## 9.2 الملخص

أسفل العنوان مباشرة:

- textarea مرنة الارتفاع.
- placeholder: `اكتب ملخصًا واضحًا يساعد القارئ على فهم المقال...`
- لا تجعلها داخل بطاقة منفصلة.
- اعرض عداد `current / max`.

## 9.3 الرابط الدائم

اعرضه كسطر صغير:

```text
/blog/generated-slug        [تعديل]
```

عند الضغط على تعديل:

- يتحول إلى input LTR.
- يظهر زر توليد من العنوان.
- يظهر تنبيه إذا كان slug فارغًا.
- لا تعرض حقل slug الكبير دائمًا.

## 9.4 المقتطف

لا تعرض المقتطف دائمًا في رأس المقال.

انقله إلى:

- تبويب `SEO` أو `التنظيم` داخل Inspector.

أضف checkbox:

```text
استخدام الملخص كمقتطف
```

لا تضف حقلًا جديدًا إلى الباك إند؛ عند تفعيله انسخ `summary` إلى `excerpt` في form فقط.

## 9.5 صورة الغلاف

أسفل العنوان والملخص:

- مساحة Cover عريضة.
- إذا لا توجد صورة:
  - أيقونة صورة.
  - النص: `أضف صورة غلاف للمقال`.
  - زر اختيار من المكتبة.
- إذا توجد صورة:
  - عرض بنسبة مناسبة مثل 16:9.
  - أزرار تظهر عند hover:
    - تغيير.
    - إزالة.
    - استخدام كصورة بارزة.

يجب استخدام `MediaField` أو `MediaPicker` الحالي داخليًا وعدم إنشاء رفع جديد.

---

# 10. المرحلة الخامسة: إعادة تصميم مساحة المحرر

عدّل:

```text
frontend/src/features/blog-admin/editor/BlogMarkdownEditorClient.tsx
frontend/src/features/blog-admin/editor/BlogMarkdownEditor.tsx
frontend/src/features/blog-admin/editor/EditorPreview.tsx
frontend/src/features/blog-admin/editor/EditorStatusBar.tsx
```

## 10.1 إزالة التكرار في أوضاع العرض

لا تستخدم تبويب خارجي `edit/preview` في `PostEditorPage` مع Toggle داخلي منفصل.

يجب أن يكون هناك شريط وضع موحد:

```text
كتابة | Markdown | مقارنة | معاينة
```

### الربط الداخلي

- كتابة = `rich-text`
- Markdown = `source`
- مقارنة = `diff`
- معاينة = `MarkdownRendererClient`

يمكن إدارة الوضع عبر state في `BlogEditorWorkspace`.

إذا كان `DiffSourceToggleWrapper` لا يسمح بتحكم خارجي نظيف:

- لا تنشئ Toggle ثانيًا.
- صمّم toolbar الخارجي ليحتوي نفس Toggle ويوضع بصريًا ضمن شريط الاستوديو.
- الأهم ألا يرى المستخدم مجموعتين من التبويبات.

## 10.2 RTL/LTR

غيّر الحاوية الحالية من:

```tsx
dir="ltr"
```

إلى:

```tsx
dir="rtl"
```

واستخدم CSS داخل محتوى MDXEditor:

- الفقرات والعناوين والقوائم: RTL.
- `pre`, `code`, `.cm-editor`, `.cm-content`: LTR.
- الروابط الطويلة: LTR أو `unicode-bidi: plaintext`.
- الجداول تتبع لغة المحتوى.

أضف class مثل:

```text
blog-writing-editor
```

ثم قواعد CSS مركزية في ملف globals أو ملف CSS مناسب.

## 10.3 عرض المحرر

في الوضع الطبيعي:

- مساحة المستند الأساسية: `max-w-[900px]`.
- عرض القراءة الداخلي: بين `720px` و`820px`.
- المحرر في وسط الصفحة.
- حد أدنى للارتفاع: `calc(100vh - 260px)`.

في وضع التركيز:

- مساحة المستند تصل إلى `960px`.
- لا توجد بطاقة كبيرة ثقيلة حول كل المحتوى.
- خلفية المستند `bg-card` أو `bg-background` مع ظل خفيف جدًا فقط.

## 10.4 شريط الأدوات

أعد ترتيب الأدوات إلى مجموعات:

1. تراجع وإعادة.
2. نوع النص.
3. Bold/Italic/Underline/Inline code.
4. قوائم واقتباس.
5. رابط وصورة.
6. كود وجدول وMermaid.
7. تنبيه وفاصل.
8. قائمة المزيد.

لا تعرض أزرار الاستيراد والتصدير ومكتبة الوسائط في شريط منفصل أعلى المحرر؛ انقلها إلى:

- `المزيد`.
- أو قائمة في Topbar.

### الهواتف

- اجعل toolbar أفقيًا قابلًا للتمرير.
- لا تكدّس الأدوات في عدة أسطر كبيرة.
- استخدم Tooltip لكل أيقونة.

## 10.5 المعاينة

- استخدم `MarkdownRendererClient` الحالي.
- اجعل المعاينة داخل حاوية تماثل عرض صفحة المقال العامة.
- أضف خلفية واضحة تشير إلى أن الوضع معاينة.
- Mermaid وGIF والجداول يجب أن تظهر كما ستظهر في الموقع.

## 10.6 Split Preview

أضف خيارًا على الشاشات `2xl` فقط:

```text
المحرر + المعاينة
```

تنفيذ اختياري لكن مرغوب:

- عمودان متساويان.
- المعاينة sticky داخل العمود.
- لا تفعّل تلقائيًا على الشاشات الصغيرة.
- لا تجعلها الوضع الافتراضي.

## 10.7 الحالة السفلية

`EditorStatusBar` يعرض فقط:

- عدد الكلمات.
- عدد الأحرف.
- وقت القراءة المتوقع.
- عدد العناوين.

حالة الحفظ الأساسية تنتقل إلى Topbar.

---

# 11. المرحلة السادسة: لوحة الخصائص الموحدة Inspector

أنشئ:

```text
BlogEditorInspector.tsx
BlogEditorInspectorTabs.tsx
```

## 11.1 السلوك

- بعرض سطح المكتب: عمود قابل للطي بعرض 320–360px.
- يمكن إخفاؤه بزر واضح.
- يظل sticky تحت Topbar.
- في الشاشات المتوسطة والصغيرة: يتحول إلى Sheet/Dialog جانبي.
- آخر تبويب مفتوح يمكن حفظه في sessionStorage.

## 11.2 التبويبات

استخدم Radix Tabs، والتبويبات:

1. `النشر`
2. `التنظيم`
3. `الوسائط`
4. `SEO`
5. `الجودة`

لا تعرض جميع البطاقات دفعة واحدة.

---

# 12. تبويب النشر

أعد استخدام منطق:

```text
PostPublishingPanel.tsx
```

لكن غيّر عرضه إلى محتوى تبويب، وليس بطاقة مستقلة.

## 12.1 المحتوى

- Badge الحالة.
- تاريخ آخر تحديث.
- تاريخ النشر عند وجوده.
- تاريخ الجدولة عند وجوده.
- المنطقة الزمنية.
- الإجراءات المتاحة حسب الحالة.

## 12.2 الجدولة

لا تعرض input التاريخ دائمًا.

- زر `جدولة النشر` يفتح `BlogScheduleDialog`.
- داخل Dialog:
  - التاريخ.
  - الوقت.
  - المنطقة الزمنية الحالية.
  - ملخص موعد النشر النهائي.
  - زر تأكيد.
- استخدم نفس `scheduleValue` ونفس `datetimeLocalToUtc`.

## 12.3 طلب التعديلات

استبدل:

```ts
window.prompt(...)
```

بـ `BlogRequestChangesDialog` يحتوي:

- عنوان: `طلب تعديلات على المقال`.
- textarea إلزامية.
- عداد أحرف.
- زر إرسال.
- زر إلغاء.

ثم نفّذ نفس:

```ts
onAction("request-changes", { message })
```

## 12.4 الأرشفة والنشر والتحذيرات

استبدل جميع `window.confirm` بـ AlertDialog مخصص.

عند وجود readiness warnings قبل النشر:

- لا تستخدم confirm.
- افتح `BlogPublishDialog`.
- اعرض التحذيرات.
- زر `المتابعة والنشر`.
- الموانع blockers تمنع زر التأكيد.

---

# 13. تبويب التنظيم

ادمج داخله:

- التصنيف.
- الوسوم.
- المقال المميز.
- ترتيب المقال المميز.
- المقالات ذات الصلة.
- المقتطف.

## 13.1 التصنيف والوسوم

عدّل أو استبدل:

```text
PostTaxonomyPanel.tsx
```

المطلوب:

- Searchable Combobox.
- إظهار الاسم لا Object ID.
- selected chips.
- إمكانية إنشاء تصنيف/وسم داخل Dialog صغير، لا prompt.
- عند إنشاء عنصر جديد استخدم نفس API الحالي.
- دعم pagination الحالي في `useTaxonomyOptions`.

## 13.2 المقالات ذات الصلة

أعد استخدام:

```text
PostRelatedPanel.tsx
AsyncPostMultiSelect.tsx
```

لكن:

- عرض العناصر كقائمة صغيرة مع صورة وعنوان وحالة.
- دعم إعادة الترتيب إذا كان ترتيب `relatedPostIds` مهمًا في الواجهة الحالية.
- لا تغير الحقل أو API.

## 13.3 المقال المميز

استخدم Switch بصري واضح بدل checkbox عادي.

عند التفعيل يظهر `featuredOrder`.

---

# 14. تبويب الوسائط

أعد بناء عرض:

```text
PostMediaPanel.tsx
```

داخل `BlogMediaOverview.tsx`.

## 14.1 الصورة الرئيسية

استخدم مفهوم صورة رئيسية لتقليل التكرار:

- اعرض `coverImage` كصورة رئيسية إذا موجودة.
- إذا لا توجد، استخدم `featuredImage` كمعاينة مؤقتة فقط.

## 14.2 اختصارات إعادة الاستخدام

أضف أزرارًا تعمل على form فقط:

- `استخدام صورة الغلاف كصورة بارزة`.
- `استخدام الصورة البارزة كصورة الغلاف`.
- `استخدام الصورة البارزة كصورة Open Graph`.
- `استخدام صورة الغلاف كصورة Open Graph`.

هذه الأزرار تنسخ Media ID وURL إلى الحقول الموجودة، دون أي تعديل على الباك إند.

## 14.3 بطاقات الصور

كل صورة تظهر داخل بطاقة صغيرة بها:

- المعاينة.
- نوع الاستخدام.
- تغيير.
- إزالة.
- أبعاد أو نوع الملف إذا كانت متاحة من MediaPicker، وإلا لا تخترعها.

---

# 15. تبويب SEO

أعد تصميم:

```text
PostSeoPanel.tsx
```

## 15.1 الحقول

- عنوان SEO.
- وصف SEO.
- Canonical URL.
- السماح بالفهرسة.
- صورة Open Graph.
- المقتطف إذا تقرر وضعه هنا.

## 15.2 عدادات الأحرف

أضف `CharacterCounter` لكل حقل محدود:

- عنوان المقال: حسب Zod الحالي.
- الملخص: حسب Zod الحالي.
- المقتطف: حسب Zod الحالي.
- SEO title: حسب schema الحالي.
- SEO description: حسب schema الحالي.

يجب أخذ الحدود من schema أو constants مشتركة لتجنب أرقام مكررة.

## 15.3 معاينة Google

أنشئ `BlogSeoPreview.tsx` ويعرض:

```text
عنوان SEO أو عنوان المقال
https://domain.com/blog/slug
وصف SEO أو الملخص
```

- هذه معاينة بصرية فقط.
- لا تستخدم اتصالًا خارجيًا.
- إذا كان عنوان SEO فارغًا استخدم العنوان.
- إذا كان وصف SEO فارغًا استخدم الملخص.
- اعرض تنبيهًا إن كان النص يتجاوز الحد الموصى به.

## 15.4 معاينة Open Graph

اعرض بطاقة اجتماعية صغيرة:

- الصورة.
- العنوان.
- الوصف.
- النطاق.

---

# 16. تبويب الجودة والجاهزية

أعد استخدام:

```text
PostReadinessPanel.tsx
usePostReadiness.ts
```

## 16.1 الملخص

اعرض في أعلى التبويب:

```text
جاهزية النشر: 4 من 6 مكتملة
```

أو النسبة المتاحة من الاستجابة الحالية.

إذا API لا يعيد مجموعًا رقميًا، احسبه من arrays الحالية دون تغيير الباك إند.

## 16.2 القوائم

قسّم النتائج إلى:

- موانع النشر.
- تحذيرات.
- عناصر مكتملة.

## 16.3 الانتقال إلى الحقول

لكل ملاحظة معروفة، أضف mapping محليًا:

```ts
const readinessTargetMap = {
  title: "post-title",
  summary: "post-summary",
  category: "post-category",
  featuredImage: "post-featured-image",
  seoTitle: "post-seo-title",
};
```

عند الضغط:

- افتح Inspector tab المناسب.
- استخدم `scrollIntoView`.
- ركز الحقل.

لا تغيّر response من الباك إند.

## 16.4 التحديث

- زر `إعادة الفحص`.
- استخدم نفس `readiness.refresh()`.
- لا تنفذ readiness في كل ضغطة مفتاح؛ فقط يدويًا أو قبل النشر كما هو حاليًا.

---

# 17. مخطط المقال Outline

أنشئ:

```text
BlogOutlinePanel.tsx
```

## 17.1 المصدر

استخرج H2 وH3 من Markdown الحالي باستخدام utility آمن مشابه للأداة الحالية الخاصة بجدول المحتويات، مع تجاهل code fences.

لا تستخدم DOM غير متزامن إذا كان استخراج Markdown المباشر متاحًا.

## 17.2 العرض

- قائمة عناوين H2 وH3.
- الضغط على عنوان ينتقل إلى موضعه في المحرر إذا أمكن.
- إن لم يدعم MDXEditor الانتقال الدقيق، اكتفِ بعرض المخطط دون سلوك مزيف.
- اعرض تحذيرًا للعناوين المكررة.
- اعرض رسالة عند عدم وجود بنية واضحة.

## 17.3 الموقع

- يظهر كزر اختياري بجانب Inspector.
- يمكن عرضه داخل تبويب فرعي `المخطط` أو Popover.
- لا تعرضه دائمًا إذا كان يقلل مساحة الكتابة.

---

# 18. تحسين حالات الحفظ

أنشئ:

```text
BlogSaveState.tsx
```

## 18.1 الحالات

اربط مباشرة مع `autosave.state` الحالي:

| الحالة | العرض |
|---|---|
| idle | لا توجد تغييرات |
| pending/dirty إن كانت موجودة | تغييرات غير محفوظة |
| saving | جارٍ الحفظ… مع spinner |
| saved | تم الحفظ + الوقت |
| error | فشل الحفظ + زر إعادة المحاولة |

استخدم أسماء الحالات الفعلية في hook الحالي، ولا تفترض أسماء غير موجودة؛ أنشئ mapping بناءً على implementation الفعلي.

## 18.2 زر إعادة المحاولة

يستدعي نفس:

```ts
save("manual_save")
```

أو callback يمرره `PostEditorPage`.

## 18.3 لوحة الحالة السفلية

لا تكرر عبارة `تم الحفظ` في أعلى وأسفل الصفحة.

أسفل المحرر تعرض المقاييس فقط.

---

# 19. استبدال Dialogs الحالية

## 19.1 تعارض النسخة

انقل Modal الموجود داخل `PostEditorPage.tsx` إلى:

```text
BlogConflictDialog.tsx
```

المطلوب:

- عنوان واضح.
- تبويبان أو عمودان:
  - نسختي المحلية.
  - نسخة الخادم.
- زر نسخ النسخة المحلية.
- زر تحميل نسخة الخادم.
- زر إغلاق.
- إن كان `RevisionContentDiff` قابلًا لإعادة الاستخدام فاستخدمه بدل textarea فقط.
- لا تضف merge تلقائيًا في هذه المهمة.

## 19.2 تغييرات غير محفوظة

انقل Modal الحالي إلى:

```text
BlogUnsavedChangesDialog.tsx
```

الإجراءات تبقى:

- حفظ ومغادرة.
- مغادرة دون حفظ.
- البقاء.

استخدم Radix AlertDialog ودعم keyboard focus الصحيح.

## 19.3 كل confirm وprompt

يجب أن يكون البحث النهائي:

```bash
grep -R "window\.prompt\|window\.confirm" frontend/src/features/blog-admin frontend/src/features/admin/resources/posts
```

والنتيجة صفر داخل نطاق المدونة بعد التنفيذ.

---

# 20. إعادة تصميم صفحة إدارة المقالات

الملف الأساسي:

```text
frontend/src/features/admin/resources/posts/page-client.tsx
```

يجب أن يتحول إلى منسّق صغير يستخدم مكونات منفصلة.

## 20.1 الرأس

احتفظ بـ `AdminPageHeader` مع:

- العنوان: `إدارة المقالات`.
- وصف قصير.
- زر تحديث.
- زر `مقال جديد` كزر أساسي.

نقل CSV وخيارات الأعمدة إلى قائمة `المزيد` داخل DataTable أو PostListTable.

---

# 21. بطاقات الإحصائيات دون تعديل الباك إند

أنشئ:

```text
PostStatsOverview.tsx
```

## 21.1 البيانات

استخدم نفس endpoint الحالي:

```text
GET /blog/posts
```

بطلبات خفيفة `limit=1` وقراءة `meta.total` للحالات:

- جميع المقالات.
- draft.
- in_review + changes_requested إن أردت بطاقة مراجعة موحدة، أو بطاقة لكل حالة.
- scheduled.
- published.
- hasWarnings=true.

استخدم `useQueries` من React Query.

## 21.2 الأداء

- `staleTime` لا يقل عن 30 ثانية.
- لا تعِد الطلبات عند كل ضغط مفتاح بحث.
- استخدم query keys واضحة.
- لا ترسل أكثر من 5–6 طلبات.
- عند وجود error في بطاقة لا تُسقط الصفحة كاملة؛ اعرض `—`.

## 21.3 التفاعل

الضغط على البطاقة يغيّر query params الحالية:

- المسودات → `status=draft`.
- المجدولة → `status=scheduled`.
- المنشورة → `status=published`.
- تحتاج انتباه → `hasWarnings=true`.

لا تنشئ route جديدًا.

---

# 22. تبويبات الحالة

أنشئ:

```text
PostStatusTabs.tsx
```

التبويبات:

- الكل.
- مسودة.
- قيد المراجعة.
- مطلوب تعديل.
- مجدول.
- منشور.
- مؤرشف.
- السلة.

## السلوك

- تستخدم `nuqs` الحالية.
- تغيّر `status` أو `trash`.
- تعيد الصفحة إلى 1.
- على الهاتف تصبح horizontal scroll.
- لا تعرض dropdown حالة مكرر داخل DataTable إذا تم اعتماد التبويبات.

---

# 23. شريط البحث والفلاتر

أنشئ:

```text
PostFiltersBar.tsx
PostAdvancedFilters.tsx
PostActiveFilters.tsx
```

## 23.1 الشريط الأساسي

يحتوي:

- بحث بالعنوان أو المحتوى حسب دعم الـ endpoint الحالي.
- اختيار التصنيف بالاسم.
- زر الفلاتر المتقدمة.
- زر مسح الكل عند وجود فلتر.

## 23.2 فلتر التصنيف

استخدم `useTaxonomyOptions("category")` أو مكونًا مشتركًا مبنيًا عليه.

المستخدم يرى:

```text
التصنيف: البرمجة الخلفية
```

لكن query المرسلة تظل Object ID كما يتطلب الباك إند.

لا تعرض ID في الواجهة.

## 23.3 فلتر الكاتب

الباك إند الحالي يدعم `author` كـ ID لكنه لا يوفر endpoint إداريًا عامًا واضحًا لقائمة المستخدمين.

لذلك في هذه المهمة:

- **احذف حقل معرّف الكاتب من الواجهة.**
- لا تحذف `query.author` من schema أو request للحفاظ على التوافق المستقبلي.
- إذا وصل author في URL يدويًا، يمكن الاحتفاظ به داخليًا مع شريحة `كاتب محدد` دون إظهار ID كامل، أو مسحه عند Reset.
- لا تنشئ endpoint جديدًا.

## 23.4 الفلاتر المتقدمة

داخل Popover أو Sheet:

- مميز / غير مميز.
- بها تحذيرات.
- تاريخ من.
- تاريخ إلى.
- ترتيب النتائج.
- سلة المحذوفات إذا لم توضع كتبويب مستقل.

## 23.5 الشرائح النشطة

اعرض chips مثل:

```text
التصنيف: NestJS ×
مميز فقط ×
من: 2026-07-01 ×
إلى: 2026-07-31 ×
```

إزالة الشريحة تحدث query param المناسبة فقط.

---

# 24. تصميم جدول المقالات

يمكن الاستمرار باستخدام TanStack Table، لكن لا تعتمد على العرض العام الحالي بالكامل.

## 24.1 PostListTable

أنشئ wrapper متخصص:

```text
PostListTable.tsx
```

يمكنه إعادة استخدام:

```text
frontend/src/components/admin/data-table/DataTable.tsx
```

لكن إذا احتجت تخصيصًا، أضف إلى DataTable prop اختياريًا دون كسر باقي الصفحات:

```ts
renderMobileItem?: (row: TData) => React.ReactNode;
```

أو:

```ts
mobileCard?: React.ComponentType<{ item: TData }>;
```

إذا لم يمرر prop، يبقى السلوك القديم لكل الموارد الأخرى.

## 24.2 الأعمدة المقترحة

1. المقال.
2. الحالة والجودة.
3. التنظيم.
4. الأداء.
5. آخر تعديل.
6. الإجراءات.

## 24.3 عمود المقال

يعرض:

- صورة 72×48 تقريبًا.
- العنوان.
- slug صغير.
- excerpt قصير إذا كان متاحًا في list item؛ إذا غير متاح لا تضف طلب تفاصيل لكل صف.
- نجمة للمقال المميز.

## 24.4 الحالة

استخدم `PostStatusBadge` بألوان مميزة:

| الحالة | النمط المقترح |
|---|---|
| draft | رمادي |
| in_review | أزرق |
| changes_requested | برتقالي/أحمر |
| approved | أخضر فاتح |
| scheduled | بنفسجي |
| published | أخضر |
| archived | رمادي داكن |

يجب وجود نص وأيقونة/نقطة؛ لا تعتمد على اللون وحده.

## 24.5 الجودة

إذا `hasWarnings` أو بيانات readiness summary متاحة في list item:

- اعرض رمز تحذير.
- Tooltip يوضح أن المقال يحتاج انتباه.

إذا غير متاحة، لا تنفذ طلب readiness لكل صف.

## 24.6 التنظيم

- اسم التصنيف.
- حتى وسمين إذا كانت متاحة في list response.
- `+N` للبقية.

لا تعرض IDs.

## 24.7 الأداء

- المشاهدات.
- وقت القراءة.
- تاريخ النشر أو الجدولة.

استخدم البيانات الموجودة فقط في `AdminPostListItem`.

## 24.8 الإجراءات

لا تعرض ثلاثة أزرار دائمًا.

- الضغط على العنوان يفتح التحرير.
- زر معاينة سريع إن كان منشورًا أو توجد صفحة preview.
- Dropdown ثلاث نقاط يحتوي:
  - تحرير.
  - معاينة.
  - سجل الإصدارات.
  - نسخ الرابط إذا كان منشورًا.
  - استعادة عند المحذوف.
  - نقل للسلة.
  - حذف نهائي.

---

# 25. بطاقات الهاتف

أنشئ:

```text
PostMobileCard.tsx
```

وتستخدم عبر `renderMobileItem`.

## المحتوى

- صورة عريضة أو thumbnail.
- العنوان.
- الحالة.
- التصنيف.
- آخر تعديل.
- المشاهدات.
- زر تحرير واضح.
- Dropdown إجراءات.
- checkbox للتحديد الجماعي إذا كانت DataTable في وضع اختيار.

لا تستخدم قائمة key/value العامة الحالية للمقالات.

---

# 26. الإجراءات الجماعية

أنشئ:

```text
PostBulkActionsBar.tsx
PostBulkCategoryDialog.tsx
PostBulkTagDialog.tsx
```

## 26.1 السلوك

عند تحديد صفوف تظهر bar ثابتة أسفل أو أعلى القائمة:

```text
تم تحديد 4 مقالات
[إرسال للمراجعة] [تعيين تصنيف] [إضافة وسم] [أرشفة] [المزيد]
```

## 26.2 تعيين التصنيف

استبدل prompt بـ Dialog يحتوي Searchable Combobox.

عند التأكيد:

```ts
bulk.mutate({
  action: "set-category",
  ids,
  data: { categoryId },
});
```

## 26.3 إضافة وسم

نفس الفكرة مع tags.

## 26.4 العمليات الخطرة

- الأرشفة: AlertDialog.
- النقل للسلة: AlertDialog.
- الحذف النهائي: Dialog يطلب كتابة عنوان المقال كما هو حاليًا، لكن داخل input منظم.

## 26.5 الحالة بعد النجاح

- إلغاء تحديد الصفوف.
- invalidate query.
- toast واضحة.

---

# 27. حالات التحميل والفراغ والخطأ

## صفحة المقالات

- Skeleton لبطاقات الإحصائيات.
- Skeleton لصفوف المقالات.
- Empty state مختلف حسب الحالة:
  - لا توجد مقالات إطلاقًا → زر إنشاء مقال.
  - لا توجد نتائج للفلاتر → زر مسح الفلاتر.
  - السلة فارغة → رسالة مناسبة.
- Error state مع زر إعادة المحاولة.

## محرر المقال

- Skeleton كامل للرأس والمستند والـ inspector.
- لا تستخدم مجرد نص `جارٍ تحميل المحرر…`.
- عند فشل تحميل المقال:
  - رسالة خطأ.
  - زر إعادة المحاولة.
  - زر العودة للمقالات.

---

# 28. الوصول Accessibility

يجب الالتزام بـ:

- كل Dialog له Title وDescription.
- focus trap عبر Radix.
- إعادة focus إلى الزر بعد الإغلاق.
- كل زر أيقونة له `aria-label` وTooltip.
- tab order منطقي.
- `Escape` يغلق Dialog أو وضع التركيز حسب الأولوية.
- الحالات لا تعتمد على اللون وحده.
- contrast مناسب في الوضعين.
- inputs لها labels فعلية.
- رسائل الأخطاء مرتبطة بـ `aria-describedby`.
- live region لحالة الحفظ:

```tsx
aria-live="polite"
```

---

# 29. الاختصارات

احتفظ بـ:

- `Ctrl/Cmd + S` للحفظ.

أضف:

- `Ctrl/Cmd + Shift + P` للمعاينة أو فتح نشر، بشرط عدم التعارض.
- `Ctrl/Cmd + Shift + F` لوضع التركيز إن لم يتعارض مع المتصفح؛ الأفضل اختيار اختصار آمن مثل `Ctrl/Cmd + Alt + F`.
- `Escape` للخروج من التركيز.

اعرض الاختصار في Tooltip أو قائمة المزيد.

لا تمنع اختصارات المحرر الداخلية.

---

# 30. تحسين CSS الخاص بالمحرر

أضف قواعد مخصصة تحت class واضح، ولا تعدّل `.prose-tech` العامة بطريقة تكسر عرض المقال العام.

مثال هيكلي:

```css
.blog-writing-editor {
  direction: rtl;
  text-align: right;
}

.blog-writing-editor .mdxeditor-rich-text-editor {
  min-height: calc(100vh - 300px);
}

.blog-writing-editor pre,
.blog-writing-editor code,
.blog-writing-editor .cm-editor,
.blog-writing-editor .cm-content {
  direction: ltr;
  text-align: left;
}

.blog-writing-editor a,
.blog-writing-editor [data-url] {
  unicode-bidi: plaintext;
}
```

استخدم selectors الفعلية بعد فحص DOM الذي ينتجه MDXEditor، ولا تعتمد على أسماء غير موجودة دون اختبار.

---

# 31. المحافظة على الأداء

- لا تجعل المعاينة تعاد كل ضغطة بدون debounce إذا ثبت أنها ثقيلة.
- Mermaid قد تكون ثقيلة؛ استخدم lazy rendering الحالي إن أمكن.
- لا تستدعِ readiness تلقائيًا أثناء الكتابة.
- لا تطلب تفاصيل كل مقال في القائمة.
- لا تستدعِ إحصائيات الحالات عند كل تغيير بحث.
- استخدم `staleTime` وquery keys منفصلة للإحصائيات.
- لا تستخدم animation ثقيلة داخل المحرر.
- لا تستخدم `backdrop-blur` على مساحات كبيرة كثيرة.

---

# 32. ترتيب التنفيذ العملي

## الخطوة 1

- إنشاء `AdminLayoutModeContext`.
- تعديل `AdminShell` لوضع التركيز.
- إضافة اختبارات بسيطة للسلوك إن كانت بنية الاختبارات تسمح.

## الخطوة 2

- إنشاء types ومكونات Topbar وSaveState.
- إعادة هيكلة `PostEditorPage` لتمرير المنطق بدل عرض كل JSX.
- الحفاظ على save/action كما هي.

## الخطوة 3

- إنشاء `BlogDocumentHeader`.
- نقل title/summary/slug إلى مساحة المستند.
- إضافة counters.
- نقل excerpt للـ inspector.

## الخطوة 4

- إعادة تصميم `BlogMarkdownEditorClient`.
- إصلاح RTL/LTR.
- دمج أوضاع كتابة/Markdown/Diff/Preview.
- إعادة ترتيب toolbar.

## الخطوة 5

- إنشاء Inspector tabs.
- نقل النشر والتنظيم والوسائط وSEO والجاهزية إليها.
- الحفاظ على field names وform state.

## الخطوة 6

- استبدال جميع prompts/confirms داخل محرر المقال.
- نقل conflict والunsaved dialogs إلى مكونات مستقلة.

## الخطوة 7

- إعادة تصميم صفحة المقالات.
- إضافة stats/status tabs/filters.
- إزالة حقول IDs من الواجهة.

## الخطوة 8

- إعادة تصميم الأعمدة والإجراءات.
- إضافة بطاقة هاتف مخصصة.
- تطوير DataTable بـ prop اختياري لا يكسر باقي الموارد.

## الخطوة 9

- إعادة تصميم bulk actions والـ dialogs.
- إزالة كل prompts/confirms من صفحة المقالات.

## الخطوة 10

- اختبارات responsive/accessibility.
- Typecheck/lint/tests/build.

---

# 33. الملفات الحالية المتوقع تعديلها

## أساسية

```text
frontend/src/components/admin/AdminShell.tsx
frontend/src/features/blog-admin/post-form/PostEditorPage.tsx
frontend/src/features/blog-admin/editor/BlogMarkdownEditorClient.tsx
frontend/src/features/blog-admin/editor/BlogMarkdownEditor.tsx
frontend/src/features/blog-admin/editor/EditorPreview.tsx
frontend/src/features/blog-admin/editor/EditorStatusBar.tsx
frontend/src/features/blog-admin/post-form/PostBasicsPanel.tsx
frontend/src/features/blog-admin/post-form/PostPublishingPanel.tsx
frontend/src/features/blog-admin/post-form/PostTaxonomyPanel.tsx
frontend/src/features/blog-admin/post-form/PostMediaPanel.tsx
frontend/src/features/blog-admin/post-form/PostRelatedPanel.tsx
frontend/src/features/blog-admin/post-form/PostSeoPanel.tsx
frontend/src/features/blog-admin/post-form/PostReadinessPanel.tsx
frontend/src/features/admin/resources/posts/page-client.tsx
frontend/src/features/admin/resources/posts/columns.tsx
frontend/src/components/admin/data-table/DataTable.tsx
```

## قد تعدّل حسب الحاجة

```text
frontend/src/components/admin/ConfirmDialog.tsx
frontend/src/components/admin/forms/MediaField.tsx
frontend/src/components/admin/AdminPageHeader.tsx
frontend/src/app/globals.css
frontend/src/features/blog-admin/hooks/useTaxonomyOptions.ts
frontend/src/lib/api/admin-search-params.ts
```

لا تغيّر search params schema إلا لإضافة قيم UI حقيقية تحتاج إلى التخزين في URL. لا تحذف الحقول الحالية التي قد تكون مستخدمة بروابط محفوظة.

---

# 34. الاختبارات المطلوبة

## 34.1 Unit/Component Tests

أضف اختبارات على الأقل لـ:

### BlogSaveState

- يعرض جارٍ الحفظ.
- يعرض تم الحفظ.
- يعرض فشل الحفظ.

### BlogDocumentHeader

- يحدّث title وsummary.
- توليد slug يكتب في form.
- counters صحيحة.

### BlogEditorInspector

- تبديل التبويبات.
- فتح Sheet على الهاتف.

### PostStatusBadge

- كل حالة تظهر label الصحيح والنمط المناسب.

### PostFiltersBar

- اختيار التصنيف يرسل ID لا الاسم.
- إزالة الشريحة تمسح query param.
- reset يعيد الصفحة إلى 1.

### Bulk dialogs

- لا ينفذ mutation قبل اختيار عنصر.
- يرسل payload الحالي الصحيح.

### Dialogs

- طلب التعديل يرسل `{ message }`.
- الحذف النهائي يرفض عنوانًا غير مطابق.

## 34.2 Integration Tests

- إنشاء مقال جديد وحفظه.
- فتح مقال موجود وتعديله.
- autosave لا يتغير سلوكه.
- conflict 409 يفتح dialog.
- readiness يمنع النشر عند blockers.
- warnings تظهر قبل النشر.
- الجدولة ترسل نفس payload.
- التصنيف والوسوم تحفظ نفس IDs.
- الصور الثلاث تحفظ نفس الحقول الحالية.
- وضع التركيز لا يفقد البيانات.
- الانتقال الداخلي يعرض unsaved changes dialog.

## 34.3 E2E

باستخدام Playwright:

1. فتح صفحة المقالات.
2. البحث عن مقال.
3. اختيار تصنيف بالاسم.
4. فتح المقال.
5. تعديل العنوان والمحتوى.
6. التأكد من حالة unsaved.
7. الحفظ بـ Ctrl+S.
8. فتح المعاينة.
9. فتح Inspector وتعديل SEO.
10. تشغيل وضع التركيز والخروج منه.
11. فتح Dialog الجدولة ثم الإلغاء.
12. تجربة عرض الهاتف.

---

# 35. فحوصات يجب تشغيلها

من مجلد `frontend`:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

إذا كان المشروع يستخدم npm lock الحالي:

```bash
npm ci
```

ثم الفحوصات أعلاه.

يجب أيضًا البحث عن:

```bash
grep -R "window\.prompt\|window\.confirm" src/features/blog-admin src/features/admin/resources/posts
```

النتيجة المطلوبة: صفر.

وابحث عن عرض IDs للمستخدم:

```bash
grep -R "معرّف التصنيف\|معرّف الكاتب\|معرّف الوسم" src/features/admin/resources/posts src/features/blog-admin
```

النتيجة المطلوبة: صفر في النصوص المرئية.

---

# 36. معايير قبول صفحة المقالات

تعتبر صفحة المقالات مكتملة فقط عند تحقق الآتي:

- [ ] لا توجد حقول تطلب Object IDs.
- [ ] توجد بطاقات أعداد حسب الحالة باستخدام endpoint الحالي.
- [ ] توجد تبويبات حالات واضحة.
- [ ] يوجد بحث وفلاتر أساسية ومتقدمة.
- [ ] تظهر الفلاتر النشطة كشرائح قابلة للإزالة.
- [ ] الحالة لها Badge مميز مع نص وأيقونة أو نقطة.
- [ ] لا توجد أزرار كثيرة في الصف؛ الإجراءات داخل Dropdown.
- [ ] الهاتف يستخدم بطاقة مقال مخصصة.
- [ ] الإجراءات الجماعية تستخدم Dialogs وComboboxes.
- [ ] لا يوجد `window.prompt` أو `window.confirm`.
- [ ] Empty/Loading/Error states احترافية.
- [ ] Query params الحالية ما تزال تعمل.
- [ ] pagination وsorting وbulk selection لم تنكسر.

---

# 37. معايير قبول استوديو الكتابة

يعتبر المحرر مكتملًا فقط عند تحقق الآتي:

- [ ] مساحة الكتابة واسعة ومركزية.
- [ ] العنوان والملخص داخل تدفق المقال.
- [ ] slug قابل للتحرير دون حقل دائم مزعج.
- [ ] توجد Topbar ثابتة للحفظ والمعاينة والنشر.
- [ ] حالة الحفظ ظاهرة وواضحة.
- [ ] يوجد وضع تركيز يعمل مع AdminShell.
- [ ] يوجد مبدل موحد لكتابة/Markdown/Diff/Preview.
- [ ] لا يوجد تكرار لأوضاع التحرير.
- [ ] النص العربي RTL والأكواد LTR.
- [ ] toolbar منظم وقابل للتمرير على الهاتف.
- [ ] Inspector موحد بتبويبات.
- [ ] النشر والجدولة والمراجعة تستخدم نفس API والمنطق الحالي.
- [ ] لا توجد prompts/confirms.
- [ ] readiness ظاهرة وقابلة للتنقل إلى الحقول.
- [ ] الصور يمكن إعادة استخدامها بين cover/featured/OG.
- [ ] SEO Preview موجود.
- [ ] conflict dialog وunsaved dialog لا يفقدان الوظائف الحالية.
- [ ] autosave والحفظ اليدوي وCtrl+S تعمل كما قبل.
- [ ] استيراد وتصدير Markdown يعملان.
- [ ] Mermaid وGIF والمعاينة النهائية لم تنكسر.

---

# 38. Definition of Done

لا تُعلن المهمة منتهية إلا إذا:

1. تم تنفيذ إعادة التصميم على صفحة القائمة والمحرر معًا.
2. لم يتم تعديل الباك إند.
3. لم يتغير شكل payloads الحالية.
4. لم تُحذف أي وظيفة حالية.
5. اجتاز المشروع typecheck وlint والاختبارات والبناء.
6. تم اختبار سطح المكتب عند عروض تقريبية:
   - 1280px
   - 1440px
   - 1920px
7. تم اختبار الهاتف عند:
   - 375px
   - 430px
8. تم اختبار الوضع الفاتح والداكن.
9. تم اختبار المقال العربي والمقال المختلط عربي/إنجليزي.
10. تم اختبار مقال يحتوي:
    - عناوين.
    - قوائم.
    - جدول.
    - صورة.
    - GIF.
    - Mermaid.
    - كتلة كود.
11. لا توجد IDs تقنية في الواجهة.
12. لا توجد نوافذ browser prompt/confirm في نظام المدونة.
13. لا توجد أخطاء Console أثناء التحرير والمعاينة.
14. لا يحدث فقدان للمحتوى عند تبديل الأوضاع أو فتح Inspector أو وضع التركيز.

---

# 39. ملاحظات تنفيذية نهائية للوكيل

- ابدأ بفحص المكونات الحالية قبل الكتابة، ولا تنشئ مكونات مكررة لما هو موجود.
- استخدم Git diff باستمرار وتأكد أن التغييرات محصورة في الفرونت إند.
- نفّذ التغيير تدريجيًا مع إبقاء المشروع قابلًا للبناء بعد كل مرحلة.
- لا تحذف الملفات القديمة قبل التأكد أن جميع وظائفها انتقلت.
- يمكن إبقاء بعض الملفات القديمة كـ wrappers مؤقتة، ثم تنظيفها بعد اكتمال الربط.
- لا تحوّل المهمة إلى تغيير تصميم عام للوحة التحكم؛ النطاق هو المدونة فقط، باستثناء تعديل AdminShell الصغير لدعم وضع التركيز.
- لا تضف ميزات محتوى جديدة في هذه المهمة مثل KaTeX أو فيديو أو SVG.
- لا توسّع لغات الأكواد؛ هذا خارج النطاق حسب القرار الحالي.
- لا تضف endpoint إحصائيات؛ استخدم `meta.total` من endpoint الحالي مع React Query caching.
- لا تضف endpoint قائمة مستخدمين؛ أخفِ فلتر الكاتب التقني حاليًا مع الحفاظ على query compatibility.
- عند وجود تعارض بين الجمال والوضوح، قدّم الوضوح وسهولة الكتابة.
- حافظ على التصميم هادئًا؛ لا تستخدم gradients كثيرة أو animations مشتتة داخل مساحة الكتابة.

---

# 40. الشكل النهائي المتوقع باختصار

## صفحة المقالات

```text
إدارة المقالات                                      [تحديث] [+ مقال جديد]

[الكل 48] [المسودات 8] [المراجعة 3] [المجدولة 2] [المنشورة 35] [تحتاج انتباه 4]

الكل | مسودة | مراجعة | مطلوب تعديل | مجدول | منشور | مؤرشف | السلة

[ابحث في المقالات...] [التصنيف ▼] [فلاتر] [مسح]
[التصنيف: NestJS ×] [مميز فقط ×]

┌ المقال ─────────── الحالة ─── التنظيم ─── الأداء ─── آخر تعديل ─── ⋯ ┐
│ صورة  بناء API       منشور      Backend      1.2K       منذ ساعتين     │
│       /build-api                  NestJS      8 دقائق                   │
└────────────────────────────────────────────────────────────────────────┘
```

## محرر المقال

```text
[رجوع] مسودة   ● تم الحفظ 8:41       [تركيز] [معاينة] [حفظ] [نشر]

                 اكتب عنوان المقال
                 اكتب ملخصًا واضحًا...
                 /blog/article-slug  [تعديل]

                 [صورة الغلاف]

     كتابة | Markdown | مقارنة | معاينة                 [الخصائص]
     ─────────────────────────────────────────────────────────────
     شريط أدوات منظم

                 محتوى المقال...

                 1,280 كلمة · 7 دقائق قراءة

                    Inspector قابل للطي
          النشر | التنظيم | الوسائط | SEO | الجودة
```

بهذا التنفيذ تصبح المدونة داخل لوحة التحكم أداة كتابة حقيقية ومميزة، مع الحفاظ الكامل على البنية الخلفية ومنطق العمل الحالي.
