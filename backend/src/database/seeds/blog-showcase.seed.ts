import 'reflect-metadata';
import 'dotenv/config';
import * as mongoose from 'mongoose';
import { Model, Types } from 'mongoose';
import {
  calculateContentHash,
  calculateMarkdownReadTime,
} from '../../common/utils/markdown-content.util';
import { Category, CategorySchema } from '../../modules/blog/categories/schemas/category.schema';
import { Post, PostSchema, PostStatus } from '../../modules/blog/posts/schemas/post.schema';
import { Tag, TagSchema } from '../../modules/blog/tags/schemas/tag.schema';
import { Media, MediaSchema } from '../../modules/media/schemas/media.schema';
import { User, UserSchema } from '../../modules/users/schemas/user.schema';
import { seedBlogCategories } from './blog-category.seed';
import { seedBlogTags } from './blog-tag.seed';

type ShowcaseArticle = {
  title: string;
  slug: string;
  summary: string;
  excerpt: string;
  categorySlug: string;
  tagSlugs: string[];
  isFeatured: boolean;
  featuredOrder?: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  content: (figure: string) => string;
};

function figure(url: string | undefined, alt: string, caption: string): string {
  if (!url) return '';
  return `\n:::figure{src="${url}" alt="${alt}"}\n${caption}\n:::\n`;
}

const articles: ShowcaseArticle[] = [
  {
    title: 'كيف أبني منصة SaaS قابلة للتوسع؟ من الفكرة إلى بنية Multi-Tenant حقيقية',
    slug: 'how-to-build-scalable-saas-platform',
    summary:
      'دليل هندسي عملي يشرح كيف أحول فكرة SaaS إلى نظام متعدد العملاء قابل للتوسع، مع قرارات المعمارية والبيانات والطوابير والمراقبة.',
    excerpt:
      'من العزل بين العملاء إلى Redis وBullMQ والمراقبة: خريطة عملية لبناء SaaS لا ينهار عند أول موجة نمو.',
    categorySlug: 'saas',
    tagSlugs: [
      'saas',
      'multi-tenant',
      'nestjs',
      'typescript',
      'postgresql',
      'docker',
      'scalability',
      'software-architecture',
    ],
    isFeatured: true,
    featuredOrder: 1,
    seo: {
      metaTitle: 'بناء SaaS قابل للتوسع: دليل Multi-Tenant عملي',
      metaDescription:
        'دليل عملي لبناء منصة SaaS متعددة العملاء باستخدام NestJS وPostgreSQL وRedis مع العزل والمراقبة والتوسع.',
    },
    content: (figureBlock) => `
:::text{dir="rtl" align="justify" size="lead"}
بناء SaaS ناجح لا يبدأ باختيار Framework، بل يبدأ بتحديد **حدود النظام**: من هو العميل؟ ما الذي يجب عزله؟ وما الذي يمكن مشاركته؟ في هذا الدليل سأحوّل هذه الأسئلة إلى قرارات معمارية قابلة للتنفيذ.
:::

${figureBlock}

## 1. ابدأ بالعقد وليس بالكود

قبل إنشاء أول Module، أكتب عقدًا صغيرًا يحدد:

- كيف نعرّف الـ Tenant؟
- كيف نمنع تسرب البيانات بين العملاء؟
- ما العمليات التي يجب أن تكون Idempotent؟
- ما الذي يحدث عند تعطل خدمة خارجية؟

:::tip
في SaaS، **العزل بين العملاء هو جزء من صحة النظام** وليس ميزة أمنية إضافية يمكن تأجيلها.
:::

يمكن اعتبار :text[حدود الـ Tenant]{mark="true" size="lg"} أول قرار معماري يجب تثبيته.

## 2. بنية مقترحة قابلة للنمو

\`\`\`mermaid
graph TD
  UI[Next.js / React] --> API[NestJS API]
  API --> DB[(PostgreSQL)]
  API --> REDIS[(Redis)]
  API --> Q[BullMQ]
  Q --> WORKER[Background Worker]
  API --> OBS[Metrics / Logs]
  WORKER --> OBS
\`\`\`

هذه البنية تفصل الطلبات التفاعلية عن الأعمال الثقيلة، وتسمح بتوسيع الـ API والـ Worker كلٌ على حدة.

## 3. عزل البيانات: لا تعتمد على الانضباط اليدوي

| الأسلوب | القوة | الملاحظة |
|---|---:|---|
| قاعدة لكل Tenant | عزل مرتفع | تشغيل وصيانة أعقد |
| Schema لكل Tenant | جيد | يصبح مرهقًا مع أعداد كبيرة |
| جداول مشتركة + tenantId | مرن | يحتاج Enforcement قوي |
| PostgreSQL RLS | قوي جدًا | ممتاز عندما يطبق بعقد واضح |

:::warning
وجود \`tenantId\` في الجداول لا يعني أن النظام Multi-Tenant آمن. يجب أن يكون العزل مفروضًا في طبقة لا يمكن للمطور تجاوزها بسهولة.
:::

## 4. مثال NestJS لخدمة واعية بالـ Tenant

\`\`\`ts title="tenant-orders.service.ts" lineNumbers="true" highlight="6-10" maxHeight="420"
@Injectable()
export class TenantOrdersService {
  constructor(private readonly repo: OrdersRepository) {}

  async list(ctx: TenantContext) {
    return this.repo.findMany({
      tenantId: ctx.tenantId,
      deletedAt: null,
    });
  }
}
\`\`\`

:::text{dir="ltr" align="start" size="sm"}
Rule of thumb: tenant context should be explicit, immutable during the request, and verified before any repository call.
:::

## 5. الأعمال الخلفية والطوابير

لا تجعل إرسال البريد أو معالجة ملف كبير جزءًا من زمن استجابة المستخدم. استخدم Queue عندما تكون العملية:

1. قابلة لإعادة المحاولة.
2. لا يحتاج المستخدم نتيجتها فورًا.
3. قد تفشل بسبب طرف خارجي.
4. تحتاج Rate Limiting أو جدولة.

\`\`\`ts title="billing.queue.ts" lineNumbers="true" collapsible="true" collapsed="true" maxHeight="320"
await billingQueue.add(
  'generate-invoice',
  { tenantId, invoiceId },
  {
    jobId: 'invoice:' + invoiceId,
    attempts: 5,
    backoff: { type: 'exponential', delay: 1_000 },
  },
);
\`\`\`

## 6. Checklist قبل الإطلاق

- [x] Tenant isolation واضح ومختبر
- [x] Idempotency للعمليات المالية والحساسة
- [x] Jobs منفصلة عن HTTP request path
- [ ] Load test على أكثر المسارات استخدامًا
- [ ] Runbook للحوادث والنسخ الاحتياطي

> أفضل Architecture ليست الأكثر تعقيدًا، بل التي تجعل الخطأ الصعب **صعب الحدوث**.

*البساطة هنا قرار هندسي*؛ الهدف ليس ~~إضافة أكبر عدد من الخدمات~~ بل بناء حدود واضحة يمكن اختبارها وتشغيلها.

---

## 7. ماذا بعد؟

راجع [المشاريع](/projects) لرؤية تطبيق هذه المبادئ على منتجات فعلية، أو انتقل إلى [الخدمات](/services) إذا كنت تريد بناء MVP أو SaaS ببنية قابلة للنمو.

:::note
داخل المحرر يمكنك استخدام :kbd[Ctrl + K] لإضافة رابط بسرعة، ثم متابعة الكتابة دون مغادرة السياق.
:::
`,
  },
  {
    title: 'الذكاء الاصطناعي ليس بديلاً للمطور: كيف أبني RAG ومساعدات AI تخدم المنتج فعلًا',
    slug: 'ai-for-building-better-products',
    summary:
      'دليل عملي لدمج الذكاء الاصطناعي داخل المنتجات عبر RAG وVector Database والأتمتة، مع التركيز على القيمة والقياس بدل إضافة AI لمجرد الترند.',
    excerpt:
      'كيف تتحول ميزات AI من Demo مبهر إلى جزء موثوق من المنتج: RAG، التقييم، الحماية، والمراقبة.',
    categorySlug: 'artificial-intelligence',
    tagSlugs: [
      'artificial-intelligence',
      'llm',
      'rag',
      'vector-database',
      'qdrant',
      'openai',
      'automation',
      'nestjs',
    ],
    isFeatured: true,
    featuredOrder: 2,
    seo: {
      metaTitle: 'بناء RAG ومساعدات AI داخل المنتجات بشكل عملي',
      metaDescription:
        'شرح عملي لبناء RAG ومساعدات ذكاء اصطناعي موثوقة داخل المنتجات باستخدام LLM وVector Database مع التقييم والمراقبة.',
    },
    content: (figureBlock) => `
:::text{dir="rtl" align="justify" size="lead"}
الميزة الذكية الجيدة لا تبدأ من السؤال: **أي نموذج سنستخدم؟** بل من السؤال: ما القرار أو المهمة التي سيصبح المستخدم قادرًا على إنجازها بشكل أسرع أو أدق؟
:::

${figureBlock}

## من Chatbot إلى نظام معرفة

عندما يحتاج المساعد إلى الإجابة من بيانات الشركة، يصبح RAG نمطًا عمليًا لفصل **المعرفة المتغيرة** عن النموذج نفسه.

\`\`\`mermaid
sequenceDiagram
  participant U as User
  participant A as API
  participant V as Vector DB
  participant L as LLM
  U->>A: Question
  A->>V: Semantic search
  V-->>A: Relevant chunks
  A->>L: Prompt + context
  L-->>A: Grounded answer
  A-->>U: Answer + sources
\`\`\`

:::note
RAG لا يعني أن كل إجابة صحيحة تلقائيًا؛ هو يقلل مساحة التخمين عندما تكون عملية الاسترجاع والتقييم مصممتين جيدًا.
:::

## طبقات الجودة الأربع

| الطبقة | السؤال الذي تجيب عنه |
|---|---|
| Retrieval | هل جلبنا السياق الصحيح؟ |
| Generation | هل صاغ النموذج إجابة سليمة؟ |
| Guardrails | هل منعنا المحتوى أو الأفعال غير المسموحة؟ |
| Evaluation | هل نستطيع قياس الجودة مع الزمن؟ |

## API بسيط لاسترجاع السياق

\`\`\`ts title="rag.service.ts" lineNumbers="true" highlight="7-13" wrap="true" maxHeight="420"
async answer(question: string) {
  const embedding = await this.embedding.create(question);

  const chunks = await this.vectorStore.search({
    vector: embedding,
    limit: 6,
    scoreThreshold: 0.72,
  });

  return this.llm.generate({
    question,
    context: chunks,
  });
}
\`\`\`

## ما الذي يجب تسجيله؟

\`\`\`json title="ai-observability-event.json" lineNumbers="true" collapsible="true" collapsed="true"
{
  "requestId": "req_01",
  "model": "configured-model",
  "retrievedChunks": 6,
  "latencyMs": 842,
  "grounded": true,
  "userFeedback": null
}
\`\`\`

:::danger
لا تسجل أسرار المستخدمين أو البيانات الحساسة في Prompts أو Logs دون سياسة واضحة للاحتفاظ والتنقيح والصلاحيات.
:::

## تجربة المنتج أهم من النموذج

:::text{dir="rtl" align="center" size="xl"}
:text[AI الجيد يختصر خطوة]{mark="true" size="xl"}، لا يضيف شاشة جديدة فقط.
:::

قيّم الميزة بمؤشرات مرتبطة بالمنتج مثل زمن إنجاز المهمة، نسبة التصحيح اليدوي، ونسبة الإجابات التي تحتاج تصعيدًا بشريًا.

## Checklist للإطلاق

- [x] Dataset تقييم واقعي
- [x] مصادر واضحة للإجابة
- [x] Fallback عندما تكون الثقة منخفضة
- [ ] Feedback loop من المستخدمين
- [ ] Cost budget وLatency budget

يمكنك قراءة المزيد من [الملاحظات الهندسية](/blog) أو استعراض [المشاريع](/projects) التي تجمع بين AI والبنية الخلفية.
`,
  },
  {
    title: 'من فكرة إلى منتج: كيف أبني MVP يختبر السوق بدل أن يستهلك الميزانية',
    slug: 'from-idea-to-product',
    summary:
      'خريطة طريق عملية لتحويل الفكرة إلى MVP قابل للقياس، مع تحديد النطاق، العقود، مراحل الإطلاق، ومتى نؤجل الميزة بدل بنائها.',
    excerpt:
      'الـ MVP ليس نسخة رديئة من المنتج النهائي؛ هو أصغر نظام يستطيع اختبار فرضية تجارية حقيقية.',
    categorySlug: 'product-development',
    tagSlugs: [
      'mvp',
      'startup',
      'product-management',
      'software-engineering',
      'clean-code',
      'performance',
      'scalability',
    ],
    isFeatured: true,
    featuredOrder: 3,
    seo: {
      metaTitle: 'من الفكرة إلى MVP: دليل بناء منتج يختبر السوق',
      metaDescription:
        'منهج عملي لبناء MVP يختبر الفرضية الأساسية بأقل نطاق ممكن مع قرارات تقنية تساعد على التطوير بعد التحقق من السوق.',
    },
    content: (figureBlock) => `
:::text{dir="rtl" align="justify" size="lead"}
أكثر ما يبطئ المنتجات في البداية ليس نقص الموارد، بل محاولة حل **كل شيء** قبل أن نعرف إن كان المستخدم يريد الحل أصلًا.
:::

${figureBlock}

## MVP = فرضية قابلة للقياس

ابدأ بجملة واحدة:

> نعتقد أن **فئة محددة من المستخدمين** ستستخدم **حلًا محددًا** لإنجاز **مهمة محددة**، وسنعتبر ذلك صحيحًا عندما نرى **إشارة قابلة للقياس**.

:::tip
كل Feature لا تساعدك على اختبار الفرضية الأساسية هي مرشح قوي للتأجيل.
:::

## مصفوفة تحديد النطاق

| الميزة | ضرورية للإطلاق؟ | سبب القرار |
|---|:---:|---|
| تسجيل المستخدم | نعم | بوابة الدخول للنظام |
| التدفق الأساسي للمنتج | نعم | يختبر القيمة الأساسية |
| Dashboard متقدم | لا | يمكن تأجيل التحليلات المتقدمة |
| 6 أنواع إشعارات | لا | ابدأ بقناة واحدة مهمة |
| Audit للأحداث الحساسة | نعم | مهم للتشخيص والثقة |

## من الفكرة إلى أول Release

\`\`\`mermaid
flowchart LR
  A[Problem] --> B[Hypothesis]
  B --> C[Prototype]
  C --> D[MVP]
  D --> E[Measure]
  E --> F{Signal?}
  F -->|Yes| G[Iterate & Scale]
  F -->|No| H[Change assumption]
  H --> B
\`\`\`

## مثال لعقد Feature قبل التنفيذ

\`\`\`yaml title="feature-contract.yaml" lineNumbers="true" maxHeight="320"
feature: create-service-request
actor: customer
preconditions:
  - authenticated
success:
  - request-created
  - audit-event-written
failure:
  - validation-error-is-field-specific
metrics:
  - completion-rate
  - median-time-to-submit
\`\`\`

هذا النوع من العقود يقلل الخلاف بين Frontend وBackend وQA ويجعل نتيجة العمل قابلة للاختبار.

## كيف أقرر ما أبنيه الآن؟

1. هل الميزة شرط لاستخدام التدفق الأساسي؟
2. هل غيابها يمنعنا من قياس الفرضية؟
3. هل يمكن تنفيذها يدويًا مؤقتًا؟
4. هل تكلفة بنائها الآن أقل فعلًا من تكلفة تأجيلها؟

:::warning
عبارة «سنحتاجها لاحقًا» ليست سببًا كافيًا لبناء Feature اليوم.
:::

## Definition of Done صغيرة وواضحة

- [x] Happy path يعمل
- [x] أخطاء Validation مفهومة
- [x] الصلاحيات مختبرة
- [x] Analytics للحدث الأساسي
- [ ] تحسينات Nice-to-have بعد أول Feedback

:::text{dir="ltr" align="center" size="lg"}
Build → Measure → Learn → Repeat.
:::

شاهد [الخدمات](/services) إذا كنت تخطط لبناء MVP، أو [المشاريع](/projects) لرؤية كيف تتحول المتطلبات إلى أنظمة فعلية.
`,
  },
  {
    title: 'NestJS + Redis + BullMQ: تصميم Background Jobs موثوقة وقابلة لإعادة المحاولة',
    slug: 'nestjs-redis-bullmq-reliable-background-jobs',
    summary:
      'شرح تطبيقي لبناء مهام خلفية موثوقة في NestJS باستخدام Redis وBullMQ، مع Idempotency وRetries وDead-letter thinking ومراقبة التنفيذ.',
    excerpt:
      'لا ترسل كل شيء داخل HTTP request: افصل الأعمال الثقيلة في Jobs، ثم صممها بحيث تكون آمنة عند التكرار والفشل.',
    categorySlug: 'software-engineering',
    tagSlugs: [
      'nestjs',
      'typescript',
      'nodejs',
      'software-engineering',
      'scalability',
      'performance',
      'api',
      'docker',
    ],
    isFeatured: false,
    seo: {
      metaTitle: 'NestJS وBullMQ: بناء Background Jobs موثوقة',
      metaDescription:
        'دليل عملي لتصميم Background Jobs في NestJS مع Redis وBullMQ وRetries وIdempotency والمراقبة ومنع التكرار.',
    },
    content: (figureBlock) => `
:::text{dir="rtl" align="justify" size="lead"}
عندما تصبح عملية ما أبطأ من أن تبقى داخل HTTP request، لا يكفي نقلها إلى Queue فقط؛ يجب تصميمها لتتحمل التكرار والانقطاع وإعادة المحاولة.
:::

${figureBlock}

## متى أستخدم Background Job؟

استخدم Job عندما تكون العملية مثل:

- إرسال بريد أو Push Notification.
- توليد تقرير أو PDF.
- معالجة صور أو ملفات.
- مزامنة بيانات مع نظام خارجي.
- تنفيذ مهمة مجدولة.

## مسار التنفيذ

\`\`\`mermaid
graph LR
  API[API] -->|enqueue| R[(Redis)]
  R --> W1[Worker 1]
  R --> W2[Worker 2]
  W1 --> DB[(Database)]
  W2 --> EXT[External API]
  W1 --> MET[Metrics]
  W2 --> MET
\`\`\`

## Producer واضح وصغير

\`\`\`ts title="notifications.producer.ts" lineNumbers="true" highlight="8-15" maxHeight="420"
@Injectable()
export class NotificationsProducer {
  constructor(
    @InjectQueue('notifications')
    private readonly queue: Queue,
  ) {}

  enqueueWelcome(userId: string) {
    return this.queue.add('welcome-email', { userId }, {
      jobId: 'welcome:' + userId,
      attempts: 4,
      backoff: { type: 'exponential', delay: 2_000 },
      removeOnComplete: 500,
    });
  }
}
\`\`\`

:::note
\`jobId\` يساعد على منع إدخال نفس المهمة أكثر من مرة، لكنه لا يغني عن جعل التنفيذ نفسه Idempotent.
:::

## Worker آمن عند التكرار

\`\`\`ts title="notifications.processor.ts" lineNumbers="true" wrap="true" collapsible="true" maxHeight="560"
@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  async process(job: Job<{ userId: string }>) {
    const key = 'welcome-email:' + job.data.userId;

    const alreadySent = await this.deliveryRepo.exists(key);
    if (alreadySent) return { skipped: true };

    await this.mailer.sendWelcome(job.data.userId);
    await this.deliveryRepo.markDelivered(key);

    return { delivered: true };
  }
}
\`\`\`

## Retry ليس حلًا لكل خطأ

| الخطأ | الإجراء المناسب |
|---|---|
| Timeout مؤقت | Retry مع Backoff |
| 429 Rate limit | Retry بعد تأخير |
| Validation داخلي | Fail بدون Retry |
| Resource deleted | تعامل كحالة نهائية |
| External outage | Retry + Alert بعد حد معين |

:::danger
Retry غير المحدود يمكن أن يحول خطأ واحدًا إلى ضغط دائم على قاعدة البيانات أو خدمة خارجية.
:::

## مراقبة الطابور

- [x] عدد Jobs المنتظرة
- [x] عدد Failed jobs
- [x] مدة التنفيذ p95
- [x] Retry count
- [ ] Alert عندما يتجاوز Queue lag حدًا تشغيليًا

يمكن دمج هذا النمط مع بنية [SaaS قابلة للتوسع](/blog/how-to-build-scalable-saas-platform) بدل إبقاء العمليات الثقيلة داخل الـ API.

:::text{dir="rtl" align="end" size="sm"}
الهدف ليس «استخدام Queue»، بل جعل الفشل متوقعًا وقابلًا للاسترداد.
:::
`,
  },
  {
    title: 'من Docker إلى المراقبة: Runbook عملي لنشر تطبيقات Node.js بثقة',
    slug: 'nodejs-docker-observability-production-runbook',
    summary:
      'Runbook هندسي مختصر لنشر تطبيق Node.js/NestJS: بناء Image، Health checks، متغيرات البيئة، Logs، Metrics، النسخ الاحتياطي، وخطة Rollback.',
    excerpt:
      'النشر الاحترافي لا ينتهي عند نجاح الـ build؛ يبدأ عندما تستطيع معرفة أن النظام تعطل، لماذا، وكيف تعيده بأمان.',
    categorySlug: 'web-development',
    tagSlugs: [
      'nodejs',
      'nestjs',
      'docker',
      'performance',
      'scalability',
      'software-engineering',
      'api',
    ],
    isFeatured: false,
    seo: {
      metaTitle: 'Runbook نشر Node.js: Docker والمراقبة والـ Rollback',
      metaDescription:
        'قائمة عملية لنشر تطبيقات Node.js وNestJS باستخدام Docker مع Health checks وLogs وMetrics وBackup وRollback.',
    },
    content: (figureBlock) => `
:::text{dir="rtl" align="justify" size="lead"}
الـ Deployment الناجح ليس الذي يظهر فيه زر أخضر فقط؛ الناجح هو الذي تستطيع **مراقبته وتشخيصه والتراجع عنه** بدون تخمين.
:::

${figureBlock}

## 1. Image قابلة للتكرار

\`\`\`dockerfile title="Dockerfile" lineNumbers="true" highlight="1-4,12-15" maxHeight="420"
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]
\`\`\`

:::tip
اجعل Build Artifact نفسه هو الذي ينتقل بين البيئات؛ لا تعِد البناء باختلاف البيئة إذا كنت تريد Rollback يمكن الوثوق به.
:::

## 2. Health ليس مجرد 200

افصل بين:

- **Liveness:** العملية نفسها حية.
- **Readiness:** التطبيق جاهز لاستقبال Traffic.
- **Dependency status:** قاعدة البيانات أو Redis أو خدمات أساسية.

\`\`\`bash title="health-check.sh" lineNumbers="true" maxHeight="240"
curl --fail --silent http://127.0.0.1:3000/health/ready \
  || exit 1
\`\`\`

## 3. ماذا أراقب؟

| Signal | مثال |
|---|---|
| Latency | p50 / p95 / p99 |
| Traffic | requests per minute |
| Errors | 5xx + domain failures |
| Saturation | CPU / memory / DB pool |
| Jobs | queue lag / failed jobs |

\`\`\`mermaid
flowchart LR
  APP[Application] --> LOGS[Structured Logs]
  APP --> METRICS[Metrics]
  APP --> TRACES[Traces]
  LOGS --> ALERT[Alert / Investigation]
  METRICS --> ALERT
  TRACES --> ALERT
\`\`\`

## 4. Checklist قبل الضغط على Deploy

- [x] Migration backward-compatible
- [x] Secrets خارج Image
- [x] Health endpoints جاهزة
- [x] Backup حديث ويمكن استعادته
- [x] Rollback command معروف
- [ ] Smoke test بعد النشر

:::warning
Backup لم يتم اختبار استعادته هو افتراض، وليس خطة تعافٍ.
:::

## 5. Rollback يجب أن يكون إجراءً معروفًا

\`\`\`powershell title="rollback-example.ps1" lineNumbers="true" collapsible="true" collapsed="true" maxHeight="320"
$release = "previous-known-good-release"
Write-Host "Rolling back to $release"
# Use your deployment platform's rollback command here.
\`\`\`

:::text{dir="ltr" align="center" size="lg"}
Deployments should be boring. Incidents should be diagnosable.
:::

بعد تجهيز Runbook، اربطه بقرارات [هندسة المنتج](/blog/from-idea-to-product) وبنية [SaaS](/blog/how-to-build-scalable-saas-platform) حتى يصبح التشغيل جزءًا من التصميم منذ البداية.
`,
  },
];

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function syncMediaUsage(
  mediaModel: Model<Media>,
  mediaIds: Types.ObjectId[],
  resourceId: string,
  field: string,
) {
  const cleanIds = [...new Set(mediaIds.map((id) => id.toString()))];

  const currentMedia = await mediaModel.find({
    'usedIn.resourceType': 'Post',
    'usedIn.resourceId': resourceId,
    'usedIn.field': field,
  });

  for (const media of currentMedia) {
    if (!cleanIds.includes(media._id.toString())) {
      media.usedIn = media.usedIn.filter(
        (item) =>
          !(
            item.resourceType === 'Post' &&
            item.resourceId === resourceId &&
            item.field === field
          ),
      );
      media.isUsed = media.usedIn.length > 0;
      await media.save();
    }
  }

  for (const id of cleanIds) {
    const media = await mediaModel.findById(id);
    if (!media) continue;
    const exists = media.usedIn.some(
      (item) =>
        item.resourceType === 'Post' &&
        item.resourceId === resourceId &&
        item.field === field,
    );
    if (!exists) {
      media.usedIn.push({ resourceType: 'Post', resourceId, field });
      media.isUsed = true;
      await media.save();
    }
  }
}

async function seedShowcasePosts(
  postModel: Model<Post>,
  userModel: Model<User>,
  categoryModel: Model<Category>,
  tagModel: Model<Tag>,
  mediaModel: Model<Media>,
) {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@mohd-morad.pro';
  const author = await userModel.findOne({ email: adminEmail });
  if (!author) {
    throw new Error(
      `Admin user not found with email: ${adminEmail}. Create the admin first.`,
    );
  }

  const images = await mediaModel
    .find({ type: 'image', folder: 'blog' })
    .sort({ isUsed: 1, createdAt: -1 })
    .limit(20);

  if (images.length === 0) {
    console.warn(
      'No blog image media found. Existing post images are preserved; otherwise cards use the frontend fallback image.',
    );
  }

  const seeded = new Map<string, Post>();

  for (let index = 0; index < articles.length; index += 1) {
    const article = articles[index];
    const category = await categoryModel.findOne({
      slug: article.categorySlug,
      isActive: true,
      deletedAt: { $exists: false },
    });
    if (!category) {
      throw new Error(`Missing category: ${article.categorySlug}`);
    }

    const tagDocs = await tagModel.find({
      slug: { $in: article.tagSlugs },
      isActive: true,
      deletedAt: { $exists: false },
    });
    const foundTags = new Set(tagDocs.map((tag) => tag.slug));
    const missingTags = article.tagSlugs.filter((slug) => !foundTags.has(slug));
    if (missingTags.length) {
      throw new Error(`Missing tags for ${article.slug}: ${missingTags.join(', ')}`);
    }

    const existingPost = await postModel.findOne({ slug: article.slug });
    const existingMediaId =
      existingPost?.featuredImageMediaId ??
      existingPost?.coverImageMediaId ??
      existingPost?.seo?.ogImageMediaId;
    const existingMedia = existingMediaId
      ? await mediaModel.findById(existingMediaId)
      : null;
    const selectedMedia =
      existingMedia ?? (images.length ? images[index % images.length] : undefined);

    const figureBlock = figure(
      selectedMedia?.url,
      article.title,
      'لقطة بصرية مرتبطة بموضوع المقال من مكتبة الوسائط.',
    );
    const content = article.content(figureBlock).trim();
    const publishedAt = daysAgo(index + 1);
    const tagIds = tagDocs.map((tag) => tag._id);
    const selectedId = selectedMedia?._id;

    const editable = {
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      excerpt: article.excerpt,
      content,
      featuredImageMediaId: selectedId?.toString(),
      coverImageMediaId: selectedId?.toString(),
      category: category._id.toString(),
      tags: tagIds.map((id) => id.toString()),
      relatedPostIds: [],
      isFeatured: article.isFeatured,
      featuredOrder: article.isFeatured ? article.featuredOrder ?? 0 : undefined,
      allowIndexing: true,
      canonicalUrl: undefined,
      seo: {
        ...article.seo,
        ...(selectedId ? { ogImageMediaId: selectedId.toString() } : {}),
      },
    };

    const $set: Record<string, unknown> = {
      ...editable,
      contentFormat: 'markdown',
      contentVersion: (existingPost?.contentVersion ?? 0) + 1,
      version: (existingPost?.version ?? 0) + 1,
      contentHash: calculateContentHash(editable),
      contentMediaIds: selectedId ? [selectedId] : [],
      author: author._id,
      publisher: author._id,
      status: PostStatus.PUBLISHED,
      statusChangedAt: publishedAt,
      statusChangedBy: author._id,
      firstPublishedAt: existingPost?.firstPublishedAt ?? publishedAt,
      publishedAt,
      lastPublishedAt: publishedAt,
      readTime: calculateMarkdownReadTime(content),
      viewCount: existingPost?.viewCount ?? 0,
      uniqueViewCount: existingPost?.uniqueViewCount ?? 0,
      previousSlugs: existingPost?.previousSlugs ?? [],
    };

    const $unset: Record<string, 1> = {
      scheduledAt: 1,
      deletedAt: 1,
      deletedBy: 1,
    };
    if (!selectedId) {
      delete $set.featuredImageMediaId;
      delete $set.coverImageMediaId;
      $unset.featuredImageMediaId = 1;
      $unset.coverImageMediaId = 1;
    }

    const post = await postModel.findOneAndUpdate(
      { slug: article.slug },
      { $set, $unset },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    seeded.set(article.slug, post);
    console.log(`Seeded public post: ${article.slug}`);
  }

  // Connect the five showcase posts to demonstrate Related Posts with deterministic links.
  for (let index = 0; index < articles.length; index += 1) {
    const article = articles[index];
    const post = seeded.get(article.slug);
    if (!post) continue;

    const related = [1, 2]
      .map((offset) => articles[(index + offset) % articles.length])
      .map((candidate) => seeded.get(candidate.slug))
      .filter((candidate): candidate is Post => Boolean(candidate));

    const relatedIds = related.map((candidate) => candidate._id);
    const selectedMediaId = post.featuredImageMediaId as Types.ObjectId | undefined;
    const editable = {
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      excerpt: post.excerpt,
      content: post.content,
      featuredImageMediaId: selectedMediaId?.toString(),
      coverImageMediaId: post.coverImageMediaId?.toString(),
      category: post.category?.toString(),
      tags: (post.tags ?? []).map((id) => id.toString()),
      relatedPostIds: relatedIds.map((id) => id.toString()),
      isFeatured: post.isFeatured,
      featuredOrder: post.isFeatured ? post.featuredOrder ?? 0 : undefined,
      allowIndexing: post.allowIndexing !== false,
      canonicalUrl: post.canonicalUrl || undefined,
      seo: post.seo ?? {},
    };

    post.relatedPostIds = relatedIds;
    post.contentHash = calculateContentHash(editable);
    await post.save();

    const resourceId = post._id.toString();
    await syncMediaUsage(
      mediaModel,
      selectedMediaId ? [selectedMediaId] : [],
      resourceId,
      'featuredImage',
    );
    await syncMediaUsage(
      mediaModel,
      post.coverImageMediaId ? [post.coverImageMediaId] : [],
      resourceId,
      'coverImage',
    );
    await syncMediaUsage(
      mediaModel,
      post.seo?.ogImageMediaId ? [post.seo.ogImageMediaId] : [],
      resourceId,
      'seo.ogImage',
    );
    await syncMediaUsage(
      mediaModel,
      post.contentMediaIds ?? [],
      resourceId,
      'content',
    );
  }

  console.log(`Blog showcase seeding completed: ${articles.length} posts.`);
}

async function revalidateFrontend() {
  const url = process.env.FRONTEND_REVALIDATE_URL;
  const secret = process.env.FRONTEND_REVALIDATE_SECRET;
  if (!url || !secret) {
    console.warn(
      'Frontend revalidation env is not configured. Public blog fetches have a 120-second revalidate policy.',
    );
    return;
  }

  const tags = new Set<string>([
    'blog',
    'blog:list',
    'blog:featured',
    'blog:sitemap',
    'blog:rss',
  ]);
  for (const article of articles) {
    tags.add(`blog:post:${article.slug}`);
    tags.add(`blog:category:${article.categorySlug}`);
    for (const tag of article.tagSlugs) tags.add(`blog:tag:${tag}`);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-revalidation-secret': secret,
    },
    body: JSON.stringify({
      tags: [...tags],
      paths: ['/', '/blog', '/sitemap.xml', '/rss.xml'],
    }),
  });

  if (!response.ok) {
    throw new Error(`Frontend revalidation failed with HTTP ${response.status}`);
  }
  console.log('Frontend blog cache revalidated successfully.');
}

async function bootstrap() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is required to seed the blog');

  await mongoose.connect(mongoUri);
  try {
    const userModel = mongoose.model<User>(User.name, UserSchema);
    const categoryModel = mongoose.model<Category>(Category.name, CategorySchema);
    const tagModel = mongoose.model<Tag>(Tag.name, TagSchema);
    const postModel = mongoose.model<Post>(Post.name, PostSchema);
    const mediaModel = mongoose.model<Media>(Media.name, MediaSchema);

    // Safe/idempotent prerequisites: only blog taxonomy is touched here.
    await seedBlogCategories(categoryModel);
    await seedBlogTags(tagModel);
    await seedShowcasePosts(
      postModel,
      userModel,
      categoryModel,
      tagModel,
      mediaModel,
    );
    await revalidateFrontend();
  } finally {
    await mongoose.disconnect();
  }
}

bootstrap().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
