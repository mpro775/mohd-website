# تقرير تنفيذ محرر Markdown المتقدم للمدونة

## الملخص

أصبح محرر المقالات يدعم من واجهة Rich Text:

- اتجاهًا مستقلًا لكل فقرة: تلقائي، RTL، وLTR.
- محاذاة Start وCenter وEnd وJustify.
- أحجامًا دلالية آمنة: `sm` و`base` و`lg` و`xl` و`lead`.
- تمييز النص، Strikethrough، Inline Code، وكتابة مفاتيح لوحة المفاتيح.
- إعدادات Code Block للغة، واسم الملف، والحد الأقصى للارتفاع، والتفاف الأسطر، وأرقام الأسطر، والطي، والحالة الابتدائية، والأسطر المميزة.
- نفس العرض في المعاينة وصفحة المقال العامة من خلال Pipeline واحدة.

بقي Markdown هو مصدر الحقيقة الوحيد. لم تتغير قاعدة البيانات أو DTOs أو API أو مسارات الحفظ والنشر وAutosave والإصدارات.

## التغييرات المعمارية

### عقد Markdown

أضيف عقد مركزي يحتوي الأنواع، والقيم الافتراضية، وقوائم السماح، والتسميات العربية، ودوال التحقق والتطبيع.

الصيغة الجديدة للفقرة:

```md
:::text{dir="rtl" align="justify" size="lead"}
هذه مقدمة عربية منسقة.
:::
```

الصيغة الجديدة للنص المحدد:

```md
:text[تنبيه مهم]{mark="true" size="lg"}
```

صيغة مفتاح لوحة المفاتيح:

```md
:kbd[Ctrl + K]
```

صيغة Code Block:

````md
```tsx title="components/UserCard.tsx" maxHeight="320" wrap="true" lineNumbers="true" collapsible="true" collapsed="false" highlight="2,4-6"
export function UserCard() {
  return <article>User</article>;
}
```
````

Serializer الخاص بالكود يثبت ترتيب الخصائص ويحذف القيم الافتراضية غير الضرورية.

### Directives

- نقل منطق Directives إلى Transformer مستقل.
- استمرار دعم Callout وFigure دون تغيير العقد القديم.
- إضافة `:::text` و`:text` و`:kbd`.
- خفض Directive غير المعروف إلى محتوى آمن مع إبقاء النص.
- تمرير خصائص Allowlist فقط إلى HAST.

### Code metadata

- Tokenizer يدعم القيم المقتبسة والمسافات والعلامات المهربة.
- رفض أو تجاهل المفاتيح المكررة والمجهولة والقيم غير المسموحة.
- تقييد العنوان إلى 100 حرف.
- تقييد الارتفاعات إلى القيم المعتمدة.
- تقييد Highlight إلى 50 جزءًا و10000 سطر كحد أعلى.
- تحويل الإعدادات الآمنة إلى خصائص Shiki دون تمرير Attributes حرة.

### Renderer

- إضافة مكونات للنص الموجه، والنص Inline، و`kbd`.
- إضافة Code Block متقدم يدعم Header ثابتًا، والنسخ، والطي، والتمرير، والالتفاف، والأرقام، والإبراز.
- إبقاء Mermaid خارج واجهة Code Block المعتادة.
- توحيد Server وClient Preview على الإعدادات والمكونات نفسها.

### Editor extensions

- Descriptors رسمية لـMDXEditor لكل Directive جديد.
- Custom Code Block Editor Descriptor يستخدم CodeMirror الحالي و`setMeta` و`setLanguage` الرسميتين.
- أوامر التنسيق تعمل عبر Lexical وواجهات MDXEditor الرسمية، دون تعديل DOM.
- إعادة تنظيم Toolbar إلى مجموعات History وInline وParagraph وStructure وTechnical.

## الملفات الجديدة

- `BLOG_ADVANCED_MARKDOWN_EDITOR_IMPLEMENTATION_REPORT_AR.md`

### عقد Markdown والـParsers

- `frontend/src/features/blog/markdown/blog-format-contract.ts`
- `frontend/src/features/blog/markdown/blog-code-meta.ts`
- `frontend/src/features/blog/markdown/blog-code-languages.ts`
- `frontend/src/features/blog/markdown/blog-directives.ts`
- `frontend/src/features/blog/markdown/blog-markdown-types.ts`
- `frontend/src/features/blog/markdown/blog-format-contract.test.ts`
- `frontend/src/features/blog/markdown/blog-code-meta.test.ts`
- `frontend/src/features/blog/markdown/blog-directives.test.ts`

### مكونات العرض

- `frontend/src/features/blog/components/BlogTextBlock.tsx`
- `frontend/src/features/blog/components/BlogInlineText.tsx`
- `frontend/src/features/blog/components/BlogKeyboardKey.tsx`
- `frontend/src/features/blog/components/EnhancedCodeBlock.tsx`
- `frontend/src/features/blog/components/blog-format-components.test.tsx`

### امتدادات المحرر

- `frontend/src/features/blog-admin/editor/extensions/BlogTextDirectiveDescriptor.tsx`
- `frontend/src/features/blog-admin/editor/extensions/BlogInlineTextDirectiveDescriptor.tsx`
- `frontend/src/features/blog-admin/editor/extensions/BlogKbdDirectiveDescriptor.tsx`
- `frontend/src/features/blog-admin/editor/extensions/BlogCodeBlockEditor.tsx`
- `frontend/src/features/blog-admin/editor/extensions/blog-editor-commands.ts`

### Toolbar

- `frontend/src/features/blog-admin/editor/toolbar/BlogDirectionControls.tsx`
- `frontend/src/features/blog-admin/editor/toolbar/BlogAlignmentControls.tsx`
- `frontend/src/features/blog-admin/editor/toolbar/BlogTextSizeControls.tsx`
- `frontend/src/features/blog-admin/editor/toolbar/BlogInlineFormatControls.tsx`
- `frontend/src/features/blog-admin/editor/toolbar/BlogClearFormattingButton.tsx`
- `frontend/src/features/blog-admin/editor/toolbar/BlogToolbarSeparator.tsx`

## الملفات المعدلة

- `frontend/src/features/blog-admin/editor/BlogMarkdownEditorClient.tsx`: دمج Descriptors وCode Editor وToolbar الجديدة.
- `frontend/src/components/common/markdown-config.tsx`: تجميع Pipeline الآمنة وربط المكونات الجديدة.
- `frontend/src/components/common/markdown-config.test.ts`: اختبار Fixture كامل وSanitize وShiki وMermaid.
- `frontend/src/features/blog/components/CodeBlock.tsx`: معالجة نجاح وفشل Clipboard داخل Header الجديد.
- `frontend/src/features/blog/utils/blog-markdown.ts`: إضافة `remarkDirective` لاستخراج العناوين داخل `:::text`.
- `frontend/src/features/blog/utils/blog-markdown.test.ts`: اختبارات TOC داخل Directives واستبعاد Code fences.
- `frontend/src/app/globals.css`: Tokens ثنائية اللغة وتنسيق المحرر والمعاينة وCode Block والوضعين الفاتح والداكن.
- `frontend/e2e/blog-cms.spec.ts`: سيناريو حفظ وإعادة تحميل Directives وCode metadata.
- `frontend/package.json` و`frontend/package-lock.json`: إعلان اعتمادي Gurx وLexical المستخدمين عبر واجهات MDXEditor الرسمية.
- `frontend/eslint.config.mjs`: استثناء محصور لملف WebGL المورد `SplashCursor.tsx` حتى يعمل فحص المشروع دون تعديل مصدره المورد.
- `backend/src/common/utils/markdown-content.util.spec.ts`: Regression test يثبت حفظ Directives وCode metadata كما هي.
- `backend/src/modules/seo/seo.service.spec.ts`: تحديث Mock قديم ليتوافق مع Pipeline التجميع الحالية.
- `backend/src/modules/blog/posts/post-views.service.spec.ts`: تزويد اختبار قديم بإعداد `ANALYTICS_HASH_SALT` الذي تتطلبه الخدمة الحالية.

## التوافق

- المقالات القديمة لا تحتاج Migration وتستمر كـMarkdown عادي.
- الباك إند ما زال يوحد نهايات الأسطر فقط ولا يحلل التنسيقات الجديدة.
- Payload وDTO وSchema لم تتغير.
- Autosave وConflict handling وRevisions تستقبل النص نفسه دون مسار خاص.
- Import وExport ما زالا يتعاملان مع ملفات Markdown فقط.
- Preview والمقال العام يستخدمان Pipeline واحدة.
- Callout وFigure وMermaid والجداول والصور والروابط ما زالت ضمن المسار المشترك.
- TOC يستخرج H2 وH3 العادية والموجودة داخل `:::text` ولا يستخرج العناوين داخل Code fences.

## الأمان

- لم تتم إضافة `rehypeRaw`.
- لا يقبل العقد `style` أو `class` أو `className` أو Event handlers من Markdown.
- الاتجاه والمحاذاة والحجم والارتفاعات قيم Allowlist فقط.
- عنوان الكود يعرض كنص ويخضع لحد الطول ومحارف التحكم.
- Metadata غير الصالحة لا تكسر Renderer وتعود إلى قيم آمنة.
- Highlight محدود ولا يسمح بتوسعة Range غير مقيدة.
- بروتوكولات الروابط والصور لم تتوسع.
- اختبارات XSS تغطي `javascript:` و`onclick` والعناوين التي تشبه HTML.

## الاختبارات

| Command | Result | Notes |
| --- | --- | --- |
| `frontend: npm install` | ناجح | الاعتماديات محدثة في Lockfile. |
| `frontend: npm run lint` | ناجح | دون أخطاء. |
| `frontend: npm run typecheck` | ناجح | دون أخطاء TypeScript. |
| `frontend: npm run test` | ناجح | 23 ملفًا، 78 اختبارًا. |
| `frontend: npm run build` | ناجح | Next.js 16.2.6، 44 صفحة مولدة بنجاح. |
| `frontend: npm run test:e2e` | متخطى وفق الإعداد | أضيف اختباران؛ يحتاجان `E2E_TEST_DB_CONFIRMED=true` وبيانات دخول وقاعدة اختبار معزولة. |
| `backend: npm install` | ناجح | لا تغيير في اعتماديات الخادم. |
| `backend: npm run lint` | ناجح | دون أخطاء؛ بقيت تحذيرات TypeScript قديمة خارج نطاق Markdown. |
| `backend: npm run test` | ناجح | 17 مجموعة، 45 اختبارًا. |
| `backend: npm run build` | ناجح | Nest build اكتمل. |
| `git diff --check` | ناجح | لا أخطاء Whitespace. |

## ملاحظات متبقية

- التشغيل الفعلي لسيناريو Playwright الموثق يحتاج قاعدة اختبار معزولة وبيانات دخول E2E؛ لم تكن هذه المتغيرات متاحة في بيئة التنفيذ الحالية، ولذلك ظهر الاختباران بحالة `skipped` بدل تشغيلهما على بيانات حقيقية.
