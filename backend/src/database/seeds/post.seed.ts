import { Model } from 'mongoose';
import { Post, PostStatus } from '../../modules/blog/posts/schemas/post.schema';
import { Category } from '../../modules/blog/categories/schemas/category.schema';
import { Tag } from '../../modules/blog/tags/schemas/tag.schema';
import { User } from '../../modules/users/schemas/user.schema';

export const postsData = [
  {
    title:
      'كيف أبني منصة SaaS قابلة للتوسع؟ الدروس التي تعلمتها من بناء منتجات حقيقية',
    slug: 'how-to-build-scalable-saas-platform',
    summary:
      'دليل عملي لبناء منصات SaaS قابلة للتوسع اعتماداً على تجارب حقيقية في تطوير المنتجات الرقمية.',
    excerpt:
      'أخطاء شائعة ودروس مهمة في بناء منصات SaaS متعددة العملاء وإدارة النمو التقني للمنتج.',
    status: PostStatus.PUBLISHED,
    readTime: 15,
    isFeatured: true,
    allowIndexing: true,
    seo: {
      metaTitle: 'كيف تبني منصة SaaS قابلة للتوسع؟',
      metaDescription:
        'دليل شامل لبناء منصات SaaS احترافية متعددة العملاء وقابلة للنمو.',
    },
    categorySlug: 'saas',
    tagSlugs: [
      'typescript',
      'nestjs',
      'react',
      'docker',
      'saas',
      'multi-tenant',
      'scalability',
      'software-architecture',
    ],
    content: `# مقدمة\n\nعندما يبدأ معظم المطورين ببناء منصة SaaS فإن التركيز يكون على إطلاق المنتج بأسرع وقت ممكن. لكن بعد الحصول على أول العملاء تبدأ المشاكل الحقيقية بالظهور.\n\nكيف تتم إدارة الاشتراكات؟ كيف يتم فصل بيانات العملاء؟ كيف يتم التعامل مع التوسع؟ وكيف يتم بناء نظام يستطيع خدمة عشرات أو مئات العملاء دون الحاجة لإعادة بناء المشروع بالكامل؟\n\n## ما المقصود بمنصة SaaS؟\n\nمنصة SaaS أو Software as a Service هي نموذج يتيح للعملاء استخدام البرنامج عبر الإنترنت مقابل اشتراك دوري.\n\n## أهم المكونات الأساسية\n\n- إدارة المستخدمين\n- إدارة الاشتراكات\n- Multi-Tenant Architecture\n- إدارة الصلاحيات\n- الفوترة والمدفوعات\n- الإشعارات\n- التحليلات\n\n## لماذا يفشل الكثير من مشاريع SaaS؟\n\n1. بناء المنتج قبل فهم المشكلة.\n2. تجاهل قابلية التوسع.\n3. عدم وجود نموذج ربحي واضح.\n4. إهمال تجربة المستخدم.\n\n## الدروس التي تعلمتها من بناء منتجات حقيقية\n\nعند العمل على منتجات مثل كليم وقطعتي وTalentGate أصبح واضحاً أن التحدي الحقيقي ليس البرمجة فقط، بل تصميم المنتج بطريقة تسمح له بالنمو دون أن يصبح عبئاً تقنياً.\n\n## البنية التقنية المقترحة\n\n- NestJS للواجهة الخلفية.\n- React للواجهة الأمامية.\n- PostgreSQL أو MongoDB حسب طبيعة المشروع.\n- Docker للنشر.\n- Redis للتخزين المؤقت.\n\n## خاتمة\n\nبناء منصة SaaS ناجحة هو مزيج بين فهم السوق وتصميم المنتج والهندسة البرمجية القابلة للتوسع. وكل قرار معماري في البداية قد يوفر شهوراً من العمل مستقبلاً.`,
  },
  {
    title:
      'الذكاء الاصطناعي ليس بديلاً للمطورين: كيف أستخدم AI لبناء منتجات أفضل',
    slug: 'ai-for-building-better-products',
    summary:
      'رؤية عملية حول استخدام الذكاء الاصطناعي في تطوير المنتجات الرقمية بدلاً من اعتباره بديلاً للمبرمجين.',
    excerpt:
      'كيف يمكن للذكاء الاصطناعي أن يضاعف إنتاجية المطورين والشركات بدلاً من استبدالهم.',
    status: PostStatus.PUBLISHED,
    readTime: 12,
    isFeatured: true,
    allowIndexing: true,
    seo: {
      metaTitle: 'كيف أستخدم الذكاء الاصطناعي لبناء منتجات أفضل؟',
      metaDescription:
        'تجربة عملية في دمج الذكاء الاصطناعي داخل المنتجات الرقمية ومنصات SaaS.',
    },
    categorySlug: 'artificial-intelligence',
    tagSlugs: [
      'typescript',
      'nestjs',
      'react',
      'docker',
      'artificial-intelligence',
      'openai',
      'qdrant',
      'n8n',
      'automation',
    ],
    content: `# مقدمة\n\nمن أكثر الأسئلة التي تتكرر اليوم: هل سيستبدل الذكاء الاصطناعي المطورين؟\n\nمن وجهة نظري وتجربتي العملية، الإجابة لا.\n\n## أين تكمن قوة الذكاء الاصطناعي؟\n\nالذكاء الاصطناعي ممتاز في:\n\n- تحليل المعلومات.\n- توليد المحتوى.\n- البحث داخل البيانات.\n- أتمتة العمليات المتكررة.\n\nلكنه لا يفهم أهداف المنتج أو احتياجات العملاء كما يفعل الإنسان.\n\n## كيف يمكن دمجه داخل المنتجات؟\n\n### خدمة العملاء\n\nبناء مساعدين ذكيين متصلين بقواعد المعرفة.\n\n### البحث الدلالي\n\nاستخدام Vector Databases مثل Qdrant لتقديم نتائج أكثر دقة.\n\n### أتمتة العمليات\n\nاستخدام أدوات مثل n8n لتقليل المهام اليدوية.\n\n## أكبر خطأ ترتكبه الشركات\n\nالاعتماد على الذكاء الاصطناعي لمجرد أنه ترند دون وجود مشكلة حقيقية تحتاج إلى حل.\n\n## ما الذي أعمل عليه حالياً؟\n\nمن خلال مشروع كليم AI يتم التركيز على بناء مساعدين أذكياء يساعدون الشركات والمتاجر في خدمة العملاء وإدارة المعرفة وتحسين الكفاءة التشغيلية.\n\n## خاتمة\n\nالذكاء الاصطناعي ليس الهدف، بل وسيلة لبناء منتجات أكثر ذكاءً وقيمة للمستخدم النهائي.`,
  },
  {
    title: 'من فكرة إلى منتج: الرحلة الحقيقية لبناء مشروع تقني ناجح',
    slug: 'from-idea-to-product',
    summary:
      'خريطة طريق عملية لتحويل الأفكار إلى منتجات رقمية حقيقية قابلة للنمو.',
    excerpt: 'أهم المراحل التي يمر بها أي مشروع تقني من الفكرة وحتى الإطلاق.',
    status: PostStatus.PUBLISHED,
    readTime: 18,
    isFeatured: true,
    allowIndexing: true,
    seo: {
      metaTitle: 'من فكرة إلى منتج تقني ناجح',
      metaDescription:
        'دليل عملي لتحويل الأفكار إلى منتجات رقمية قابلة للنمو والاستثمار.',
    },
    categorySlug: 'product-development',
    tagSlugs: [
      'startup',
      'mvp',
      'product-management',
      'software-engineering',
      'clean-code',
      'performance',
      'scalability',
    ],
    content: `# مقدمة\n\nالكثير من الأفكار تبدو رائعة على الورق، لكن القليل منها يتحول إلى منتجات حقيقية يستخدمها الناس.\n\n## المرحلة الأولى: فهم المشكلة\n\nابدأ بالمشكلة وليس بالفكرة.\n\nاسأل دائماً:\n\n- من العميل؟\n- ما المشكلة؟\n- كم تكلفه هذه المشكلة؟\n\n## المرحلة الثانية: التحقق من السوق\n\nقبل كتابة أي سطر برمجي يجب التأكد من وجود طلب حقيقي.\n\n## المرحلة الثالثة: بناء MVP\n\nالهدف من MVP ليس بناء منتج كامل، بل اختبار الفرضيات بأقل تكلفة ممكنة.\n\n## المرحلة الرابعة: الحصول على أول العملاء\n\nهذه المرحلة أهم من البرمجة نفسها.\n\n## المرحلة الخامسة: التطوير المستمر\n\nبعد الحصول على المستخدمين تبدأ عملية التحسين المستمر بناءً على البيانات الحقيقية.\n\n## أخطاء شائعة\n\n- إضافة خصائص كثيرة مبكراً.\n- تجاهل آراء العملاء.\n- التركيز على التقنية أكثر من المشكلة.\n- تأجيل التسويق حتى الانتهاء من المنتج.\n\n## الدروس المستفادة\n\nخلال العمل على منتجات متعددة أصبح واضحاً أن نجاح المنتج يعتمد على فهم العميل أكثر من جودة الكود وحدها.\n\n## خاتمة\n\nالمنتجات الناجحة لا تبدأ بفكرة عظيمة، بل تبدأ بفهم عميق لمشكلة حقيقية ثم بناء حل بسيط وقابل للتطور.`,
  },
];

export async function seedPosts(
  postModel: Model<Post>,
  userModel: Model<User>,
  categoryModel: Model<Category>,
  tagModel: Model<Tag>,
) {
  // Find author (admin user)
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@mohd-morad.pro';
  const author = await userModel.findOne({ email: adminEmail });
  if (!author) {
    throw new Error(
      `Admin user not found with email: ${adminEmail}. Run seed first.`,
    );
  }

  for (const data of postsData) {
    // Resolve category
    const categoryDoc = await categoryModel.findOne({
      slug: data.categorySlug,
    });
    if (!categoryDoc) {
      console.warn(
        `Category with slug "${data.categorySlug}" not found! Skipping post.`,
      );
      continue;
    }

    // Resolve tags
    const tagDocs = await tagModel.find({ slug: { $in: data.tagSlugs } });
    const tagIds = tagDocs.map((t) => t._id);

    const postPayload: any = {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      excerpt: data.excerpt,
      content: data.content,
      status: data.status,
      readTime: data.readTime,
      isFeatured: data.isFeatured,
      allowIndexing: data.allowIndexing,
      seo: data.seo,
      category: categoryDoc._id,
      tags: tagIds,
      author: author._id,
    };

    const existing = await postModel.findOne({ slug: data.slug });
    if (existing) {
      console.log(`Post with slug "${data.slug}" already exists, updating...`);
      await postModel.updateOne({ slug: data.slug }, {
        $set: postPayload,
      } as any);
    } else {
      console.log(`Creating post: ${data.title}`);
      await postModel.create(postPayload);
    }
  }
  console.log('Posts seeding completed successfully!');
}
