import { Model } from 'mongoose';
import {
  Project,
  ProjectStatus,
} from '../../modules/projects/schemas/project.schema';

export const projectsData = [
  {
    title: 'كليم ستورز',
    slug: 'kaleem-stores',
    shortDescription:
      'منصة SaaS متعددة المتاجر تتيح للتجار إنشاء وإدارة متاجرهم الإلكترونية بسهولة.',
    detailedDescription:
      'كليم ستورز هي منصة تجارة إلكترونية متعددة المستأجرين (Multi-Tenant SaaS) تتيح للتجار إنشاء متاجر إلكترونية احترافية وإدارة المنتجات والطلبات والمخزون والعملاء والشحن والمدفوعات من خلال لوحة تحكم متكاملة. تم تصميم المنصة لتكون قابلة للتوسع وتدعم الباقات والاشتراكات والنطاقات المخصصة.',
    technologies: ['NestJS', 'React', 'TypeScript', 'MongoDB', 'Docker'],
    status: ProjectStatus.IN_PROGRESS,
    category: 'SaaS Platform',
    featured: true,
    order: 1,
    role: 'Founder & Full Stack Engineer',
    problem:
      'الحاجة إلى منصة تجارة إلكترونية محلية تدعم احتياجات السوق اليمني.',
    solution:
      'تطوير منصة SaaS متكاملة تتيح للتجار إنشاء وإدارة متاجرهم بسهولة.',
    results: 'بناء بنية متعددة العملاء قابلة للتوسع والنمو.',
    views: 0,
  },
  {
    title: 'كليم AI',
    slug: 'kaleem-ai',
    shortDescription:
      'منصة ذكاء اصطناعي متعددة القنوات للشركات والمتاجر الإلكترونية.',
    detailedDescription:
      'منصة متخصصة في بناء المساعدات الذكية للشركات والمتاجر، تدعم إدارة قواعد المعرفة والبحث الدلالي وتكاملات واتساب وتليجرام والمواقع الإلكترونية، مع دعم النماذج اللغوية الحديثة وأتمتة العمليات التجارية.',
    technologies: ['NestJS', 'React', 'OpenAI', 'Qdrant', 'n8n', 'Docker'],
    status: ProjectStatus.IN_PROGRESS,
    category: 'Artificial Intelligence',
    featured: true,
    order: 2,
    role: 'Founder & AI Solutions Developer',
    problem: 'صعوبة تقديم دعم فوري ومتخصص للعملاء على مدار الساعة.',
    solution: 'تطوير مساعدين أذكياء مدعومين بالذكاء الاصطناعي وقواعد المعرفة.',
    results: 'منصة جاهزة لدعم الشركات والمتاجر عبر قنوات متعددة.',
    views: 0,
  },
  {
    title: 'نظام إدارة الصيانة',
    slug: 'maintenance-management-system',
    shortDescription:
      'نظام متكامل لإدارة طلبات الصيانة والأصول والصيانة الوقائية.',
    detailedDescription:
      'نظام مؤسسي متكامل لإدارة عمليات الصيانة والبلاغات والأصول والصيانة الوقائية، مع لوحات معلومات وتقارير متقدمة وصلاحيات متعددة وسجل تدقيق كامل وإمكانية تصدير البيانات إلى PDF وExcel.',
    technologies: ['NestJS', 'React', 'TypeScript', 'MongoDB', 'Docker'],
    status: ProjectStatus.COMPLETED,
    category: 'Enterprise System',
    featured: true,
    order: 3,
    role: 'Full Stack Engineer',
    problem: 'صعوبة إدارة أعمال الصيانة ومتابعة الأصول بشكل يدوي.',
    solution: 'إنشاء نظام رقمي مركزي لإدارة جميع عمليات الصيانة.',
    results: 'تحسين كفاءة المتابعة وإدارة العمليات بشكل مؤسسي.',
    views: 0,
  },
  {
    title: 'منصة الجمعية اليمنية لجراحة الأوعية الدموية',
    slug: 'yemeni-vascular-society-platform',
    shortDescription: 'منصة رقمية متكاملة لإدارة أعضاء وأنشطة الجمعية الطبية.',
    detailedDescription:
      'منصة متكاملة تشمل الموقع العام، وإدارة الأعضاء، والمؤتمرات والفعاليات، والتسجيل الإلكتروني، وإصدار الشهادات والتحقق منها، وإدارة المحتوى والنشرات البريدية ولوحة تحكم إدارية متقدمة.',
    technologies: ['NestJS', 'React', 'MongoDB', 'TypeScript'],
    status: ProjectStatus.COMPLETED,
    category: 'Digital Platform',
    featured: true,
    order: 4,
    role: 'Full Stack Engineer',
    problem: 'الحاجة إلى إدارة رقمية متكاملة لأنشطة وأعضاء الجمعية.',
    solution: 'بناء منصة موحدة لإدارة كافة العمليات والخدمات.',
    results: 'رقمنة عمليات الجمعية وتحسين تجربة الأعضاء.',
    views: 0,
  },
  {
    title: 'كتالوج المرحومي الرقمي',
    slug: 'alrhomi-digital-catalog',
    shortDescription: 'منصة احترافية لإدارة وعرض المنتجات بطريقة رقمية حديثة.',
    detailedDescription:
      'منصة رقمية متخصصة في إدارة وعرض المنتجات، تتضمن لوحة تحكم متقدمة ومكتبة وسائط ومعالجة تلقائية للصور وتحسين محركات البحث وتكامل مباشر مع واتساب للأعمال.',
    technologies: ['NestJS', 'React', 'MongoDB', 'TypeScript'],
    status: ProjectStatus.COMPLETED,
    category: 'Business Platform',
    featured: true,
    order: 5,
    role: 'Full Stack Engineer',
    problem: 'الحاجة إلى عرض المنتجات بطريقة احترافية وسهلة التحديث.',
    solution: 'إنشاء كتالوج رقمي متكامل لإدارة وعرض المنتجات.',
    results: 'تحسين الحضور الرقمي وسهولة الوصول للمنتجات.',
    views: 0,
  },
  {
    title: 'قطعتي',
    slug: 'qitati-platform',
    shortDescription: 'منصة SaaS للبحث عن توافق قطع الغيار وإدارة الاشتراكات.',
    detailedDescription:
      'منصة متخصصة في قطاع قطع الغيار تتيح البحث عن توافق القطع وإدارة الاشتراكات واستيراد البيانات من ملفات Excel مع لوحة تحكم متكاملة وإدارة المستخدمين والباقات.',
    technologies: ['NestJS', 'React', 'PostgreSQL', 'TypeScript'],
    status: ProjectStatus.COMPLETED,
    category: 'SaaS Platform',
    featured: true,
    order: 6,
    role: 'Founder & Full Stack Engineer',
    problem: 'صعوبة معرفة توافق قطع الغيار بين المركبات المختلفة.',
    solution:
      'إنشاء قاعدة بيانات ومنصة بحث متخصصة لربط المركبات بقطع الغيار المناسبة.',
    results: 'تسريع عملية البحث وتقليل الأخطاء في اختيار القطع.',
    views: 0,
  },
  {
    title: 'TalentGate',
    slug: 'talentgate',
    shortDescription:
      'منصة SaaS لإدارة الأكاديميات الرياضية واللاعبين والبطولات.',
    detailedDescription:
      'منصة متعددة العملاء لإدارة الأكاديميات الرياضية تشمل إدارة اللاعبين والمدربين والاشتراكات والمباريات والتقييمات والفعاليات والحضور والإعلانات من خلال بنية SaaS قابلة للتوسع.',
    technologies: ['NestJS', 'React', 'PostgreSQL', 'TypeScript'],
    status: ProjectStatus.COMPLETED,
    category: 'SaaS Platform',
    featured: true,
    order: 7,
    role: 'Founder & Full Stack Engineer',
    problem: 'عدم وجود نظام موحد لإدارة الأكاديميات الرياضية.',
    solution: 'تطوير منصة SaaS لإدارة جميع العمليات التشغيلية للأكاديميات.',
    results: 'رقمنة الإدارة التشغيلية للأكاديميات الرياضية.',
    views: 0,
  },
];

export async function seedProjects(projectModel: Model<Project>) {
  for (const data of projectsData) {
    const existing = await projectModel.findOne({ slug: data.slug });
    if (existing) {
      console.log(
        `Project with slug "${data.slug}" already exists, updating...`,
      );
      await projectModel.updateOne({ slug: data.slug }, { $set: data });
    } else {
      console.log(`Creating project: ${data.title}`);
      await projectModel.create({
        ...data,
        isPublished: true,
      });
    }
  }
  console.log('Projects seeding completed successfully!');
}
