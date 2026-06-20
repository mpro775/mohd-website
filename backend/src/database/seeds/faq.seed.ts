import { Model } from 'mongoose';
import { Faq } from '../../modules/faqs/schemas/faq.schema';

export const faqsData = [
  {
    question: 'من هو محمد مراد؟',
    answer:
      'مهندس برمجيات ومتخصص في تطوير الأنظمة الرقمية ومنصات SaaS وحلول الذكاء الاصطناعي. يمتلك خبرة في تصميم وتطوير المنتجات الرقمية المتكاملة بدءاً من الفكرة وحتى الإطلاق والتشغيل.',
    category: 'عام',
    order: 1,
    isPublished: true,
    isFeatured: true,
  },
  {
    question: 'ما هي الخدمات التي تقدمها؟',
    answer:
      'أقدم خدمات تطوير الأنظمة المخصصة، ومنصات SaaS، والمساعدات الذكية المعتمدة على الذكاء الاصطناعي، وتطوير النماذج الأولية للشركات الناشئة، بالإضافة إلى الاستشارات التقنية وهندسة البرمجيات.',
    category: 'الخدمات',
    order: 2,
    isPublished: true,
    isFeatured: true,
  },
  {
    question: 'ما التقنيات التي تعمل بها؟',
    answer:
      'أعمل بشكل أساسي باستخدام TypeScript وNestJS وReact وMongoDB وPostgreSQL وDocker، بالإضافة إلى تقنيات الذكاء الاصطناعي وقواعد البيانات المتجهية وأدوات الأتمتة الحديثة.',
    category: 'التقنيات',
    order: 3,
    isPublished: true,
    isFeatured: true,
  },
  {
    question: 'هل يمكن تطوير مشروع من الصفر؟',
    answer:
      'نعم، يمكن إدارة دورة حياة المشروع كاملة بدءاً من تحليل الفكرة، وتصميم البنية التقنية، وتطوير المنتج، واختباره، ونشره، وتقديم الدعم والتطوير المستقبلي.',
    category: 'الخدمات',
    order: 4,
    isPublished: true,
    isFeatured: true,
  },
  {
    question: 'هل تقدم خدمات تطوير منصات SaaS؟',
    answer:
      'نعم، يعد تطوير منصات SaaS أحد أبرز مجالات التخصص، بما في ذلك الأنظمة متعددة العملاء، وإدارة الاشتراكات والباقات، وأنظمة الفوترة والصلاحيات ولوحات التحكم.',
    category: 'SaaS',
    order: 5,
    isPublished: true,
    isFeatured: true,
  },
  {
    question: 'هل تقدم حلول ذكاء اصطناعي مخصصة؟',
    answer:
      'نعم، يتم تطوير مساعدين أذكياء وحلول تعتمد على النماذج اللغوية الحديثة وقواعد المعرفة والبحث الدلالي والتكامل مع واتساب والمواقع الإلكترونية والأنظمة المختلفة.',
    category: 'الذكاء الاصطناعي',
    order: 6,
    isPublished: true,
    isFeatured: true,
  },
  {
    question: 'هل يمكن تطوير مشروع لشركة ناشئة؟',
    answer:
      'نعم، يتم بناء النماذج الأولية MVP والمنتجات القابلة للاختبار بسرعة بهدف التحقق من الفكرة وتقليل المخاطر قبل الاستثمار الكامل في المنتج.',
    category: 'الشركات الناشئة',
    order: 7,
    isPublished: true,
    isFeatured: false,
  },
  {
    question: 'هل يمكن تحديث أو إعادة بناء نظام موجود مسبقاً؟',
    answer:
      'نعم، يمكن تحليل الأنظمة الحالية وإعادة بنائها أو تطويرها باستخدام تقنيات حديثة لتحسين الأداء والأمان وتجربة المستخدم وقابلية التوسع.',
    category: 'الخدمات',
    order: 8,
    isPublished: true,
    isFeatured: false,
  },
  {
    question: 'هل توفر استشارات تقنية؟',
    answer:
      'نعم، تتوفر استشارات تقنية تشمل هندسة البرمجيات، واختيار التقنيات المناسبة، وتصميم البنية التقنية، وتخطيط المنتجات الرقمية، وتقييم المشاريع الحالية.',
    category: 'الاستشارات',
    order: 9,
    isPublished: true,
    isFeatured: false,
  },
  {
    question: 'هل تعمل مع عملاء من خارج اليمن؟',
    answer:
      'نعم، يمكن التعاون والعمل عن بعد مع الأفراد والشركات في مختلف الدول من خلال الاجتماعات الرقمية وأدوات إدارة المشاريع والتواصل الحديثة.',
    category: 'التعاون',
    order: 10,
    isPublished: true,
    isFeatured: false,
  },
  {
    question: 'كم تستغرق مدة تنفيذ المشاريع؟',
    answer:
      'تعتمد مدة التنفيذ على حجم المشروع وتعقيده، حيث قد تستغرق بعض المشاريع عدة أسابيع بينما تحتاج المنصات الكبيرة إلى عدة أشهر من التطوير والاختبار.',
    category: 'المشاريع',
    order: 11,
    isPublished: true,
    isFeatured: false,
  },
  {
    question: 'هل يمكن الاطلاع على أعمال سابقة؟',
    answer:
      'نعم، يمكن الاطلاع على مجموعة من المشاريع والمنصات التي تم تطويرها ضمن قسم المشاريع في الموقع، والتي تشمل أنظمة مؤسسية ومنصات SaaS وحلول ذكاء اصطناعي.',
    category: 'المشاريع',
    order: 12,
    isPublished: true,
    isFeatured: false,
  },
  {
    question: 'كيف يمكن التواصل لبدء مشروع جديد؟',
    answer:
      'يمكن التواصل عبر نموذج الاتصال في الموقع أو من خلال البريد الإلكتروني أو واتساب لمناقشة الفكرة والمتطلبات وتحديد الخطوات التالية.',
    category: 'التواصل',
    order: 13,
    isPublished: true,
    isFeatured: true,
  },
];

export async function seedFaqs(faqModel: Model<Faq>) {
  for (const data of faqsData) {
    const existing = await faqModel.findOne({ question: data.question });
    if (existing) {
      console.log(
        `FAQ with question "${data.question.substring(0, 30)}..." already exists, updating...`,
      );
      await faqModel.updateOne({ question: data.question }, { $set: data });
    } else {
      console.log(`Creating FAQ: ${data.question.substring(0, 30)}...`);
      await faqModel.create(data);
    }
  }
  console.log('FAQs seeding completed successfully!');
}
