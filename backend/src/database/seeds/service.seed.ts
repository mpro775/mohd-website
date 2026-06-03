import { Model } from 'mongoose';
import { Service } from '../../modules/services/schemas/service.schema';

export const servicesData = [
  {
    name: 'تطوير تطبيقات الويب المتكاملة',
    slug: 'full-stack-web-development',
    shortDescription: 'تصميم وتطوير تطبيقات ويب متكاملة وقابلة للتوسع باستخدام أحدث التقنيات.',
    detailedDescription: 'تطوير أنظمة وتطبيقات ويب احترافية تشمل الواجهة الأمامية والخلفية وقواعد البيانات ولوحات التحكم وأنظمة الصلاحيات والتقارير والتكاملات المختلفة، مع التركيز على الأداء والأمان وقابلية التوسع.',
    icon: 'Code2',
    price: 'حسب متطلبات المشروع',
    duration: '4 - 16 أسبوع',
    deliverables: [
      'واجهة مستخدم احترافية',
      'نظام خلفي متكامل',
      'تصميم قواعد البيانات',
      'نظام صلاحيات ومستخدمين',
      'لوحة تحكم إدارية',
      'رفع المشروع على الخادم'
    ],
    requirements: [
      'وصف المشروع',
      'المتطلبات الوظيفية',
      'الهوية البصرية إن وجدت',
      'المحتوى والبيانات'
    ],
    ctaText: 'ابدأ مشروعك',
    ctaUrl: '/contact',
    isFeatured: true,
    order: 1
  },
  {
    name: 'تطوير منصات SaaS',
    slug: 'saas-development',
    shortDescription: 'تحويل الأفكار إلى منصات SaaS جاهزة للنمو والتوسع.',
    detailedDescription: 'تصميم وتطوير منصات البرمجيات كخدمة (SaaS) متعددة العملاء مع أنظمة الاشتراكات والفوترة والصلاحيات ولوحات التحكم والبنية التقنية القابلة للتوسع والنمو المستقبلي.',
    icon: 'Layers3',
    price: 'حسب متطلبات المشروع',
    duration: '6 - 24 أسبوع',
    deliverables: [
      'منصة SaaS متكاملة',
      'إدارة الاشتراكات والباقات',
      'لوحات تحكم متعددة',
      'أنظمة صلاحيات متقدمة',
      'واجهات برمجية API',
      'خطة نشر وتشغيل'
    ],
    requirements: [
      'فكرة المشروع',
      'نموذج العمل',
      'المتطلبات الأساسية'
    ],
    ctaText: 'ابنِ منصتك',
    ctaUrl: '/contact',
    isFeatured: true,
    order: 2
  },
  {
    name: 'تطوير المساعدات الذكية والذكاء الاصطناعي',
    slug: 'ai-solutions-development',
    shortDescription: 'بناء مساعدين أذكياء وحلول ذكاء اصطناعي مخصصة للأعمال.',
    detailedDescription: 'تصميم وتطوير مساعدين ذكيين مدعومين بالذكاء الاصطناعي مع قواعد معرفة، وربط بقنوات التواصل المختلفة مثل واتساب وتليجرام والمواقع الإلكترونية، بالإضافة إلى أتمتة العمليات وتحسين خدمة العملاء.',
    icon: 'Bot',
    price: 'حسب متطلبات المشروع',
    duration: '2 - 10 أسابيع',
    deliverables: [
      'مساعد ذكي مخصص',
      'قاعدة معرفة',
      'تكامل مع واتساب',
      'تكامل مع الموقع الإلكتروني',
      'لوحة تحكم وإدارة',
      'تقارير وإحصائيات'
    ],
    requirements: [
      'بيانات العمل',
      'مصادر المعرفة',
      'متطلبات التكامل'
    ],
    ctaText: 'ابنِ مساعدك الذكي',
    ctaUrl: '/contact',
    isFeatured: true,
    order: 3
  },
  {
    name: 'تطوير النماذج الأولية للشركات الناشئة',
    slug: 'mvp-development',
    shortDescription: 'تحويل الأفكار إلى منتجات قابلة للاختبار خلال فترة قصيرة.',
    detailedDescription: 'تطوير نسخة أولية MVP للشركات الناشئة ورواد الأعمال بهدف اختبار السوق والتحقق من الفكرة قبل الاستثمار الكامل في المنتج.',
    icon: 'Rocket',
    price: 'حسب متطلبات المشروع',
    duration: '4 - 8 أسابيع',
    deliverables: [
      'منتج أولي قابل للاستخدام',
      'أهم الخصائص الأساسية',
      'لوحة تحكم',
      'رفع وتشغيل المنتج',
      'توثيق تقني'
    ],
    requirements: [
      'وصف الفكرة',
      'الفئة المستهدفة',
      'الخصائص المطلوبة'
    ],
    ctaText: 'أطلق فكرتك',
    ctaUrl: '/contact',
    isFeatured: true,
    order: 4
  },
  {
    name: 'الاستشارات التقنية وتحليل المشاريع',
    slug: 'technical-consulting',
    shortDescription: 'استشارات تقنية لمساعدتك على اتخاذ القرارات الصحيحة لمشروعك.',
    detailedDescription: 'تقديم استشارات احترافية في هندسة البرمجيات، وبناء المنتجات الرقمية، واختيار التقنيات المناسبة، وتصميم البنية التقنية، وتخطيط مراحل التطوير والنمو.',
    icon: 'Lightbulb',
    price: 'بالساعة أو حسب المشروع',
    duration: 'مرن',
    deliverables: [
      'تحليل المشروع',
      'توصيات تقنية',
      'مراجعة البنية التقنية',
      'خطة تنفيذ وتطوير'
    ],
    requirements: [
      'وصف المشروع',
      'الأهداف التجارية'
    ],
    ctaText: 'احجز استشارة',
    ctaUrl: '/contact',
    isFeatured: false,
    order: 5
  },
  {
    name: 'تحديث وتطوير الأنظمة القائمة',
    slug: 'system-modernization',
    shortDescription: 'تحديث الأنظمة القديمة وتحسين أدائها وتجربة استخدامها.',
    detailedDescription: 'إعادة بناء أو تطوير الأنظمة الحالية باستخدام تقنيات حديثة لرفع الأداء والأمان وتحسين تجربة المستخدم وتقليل التكاليف المستقبلية للصيانة.',
    icon: 'RefreshCw',
    price: 'حسب نطاق العمل',
    duration: 'بحسب حجم النظام',
    deliverables: [
      'تحليل النظام الحالي',
      'خطة التحديث',
      'نظام مطور ومحدث',
      'تحسين الأداء والأمان'
    ],
    requirements: [
      'الوصول للنظام الحالي',
      'الوثائق التقنية المتوفرة'
    ],
    ctaText: 'طوّر نظامك',
    ctaUrl: '/contact',
    isFeatured: false,
    order: 6
  },
  {
    name: 'التدريب والإرشاد التقني',
    slug: 'technical-training',
    shortDescription: 'برامج تدريبية وإرشادية في البرمجة والتقنيات الحديثة.',
    detailedDescription: 'تقديم برامج تدريبية متخصصة في تطوير الويب، وهندسة البرمجيات، وتطوير منصات SaaS، والذكاء الاصطناعي، بالإضافة إلى الإرشاد المهني للمطورين والفرق التقنية.',
    icon: 'GraduationCap',
    price: 'حسب البرنامج',
    duration: 'مرن',
    deliverables: [
      'جلسات تدريبية',
      'مواد تعليمية',
      'مشاريع عملية',
      'متابعة وإرشاد'
    ],
    requirements: [
      'تحديد الأهداف التعليمية',
      'المستوى الحالي للمتدربين'
    ],
    ctaText: 'اطلب برنامجاً تدريبياً',
    ctaUrl: '/contact',
    isFeatured: false,
    order: 7
  }
];

export async function seedServices(serviceModel: Model<Service>) {
  for (const data of servicesData) {
    const existing = await serviceModel.findOne({ slug: data.slug });
    if (existing) {
      console.log(`Service with slug "${data.slug}" already exists, updating...`);
      await serviceModel.updateOne({ slug: data.slug }, { $set: data });
    } else {
      console.log(`Creating service: ${data.name}`);
      await serviceModel.create({
        ...data,
        isPublished: true,
      });
    }
  }
  console.log('Services seeding completed successfully!');
}
