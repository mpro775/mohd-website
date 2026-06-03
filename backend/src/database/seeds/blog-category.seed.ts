import { Model } from 'mongoose';
import { Category } from '../../modules/blog/categories/schemas/category.schema';

export const categoriesData = [
  {
    name: 'هندسة البرمجيات',
    slug: 'software-engineering',
    description: 'مقالات حول هندسة البرمجيات، الأنماط المعمارية، أفضل الممارسات، وتصميم الأنظمة.',
    isActive: true
  },
  {
    name: 'تطوير الويب',
    slug: 'web-development',
    description: 'محتوى متخصص في تطوير تطبيقات الويب الحديثة وتقنيات الواجهة الأمامية والخلفية.',
    isActive: true
  },
  {
    name: 'منصات SaaS',
    slug: 'saas',
    description: 'تجارب وأفكار ودروس حول بناء وإدارة منصات البرمجيات كخدمة.',
    isActive: true
  },
  {
    name: 'الذكاء الاصطناعي',
    slug: 'artificial-intelligence',
    description: 'مقالات وأدلة عملية حول الذكاء الاصطناعي والمساعدات الذكية والنماذج اللغوية.',
    isActive: true
  },
  {
    name: 'بناء المنتجات الرقمية',
    slug: 'product-development',
    description: 'من الفكرة إلى الإطلاق: استراتيجيات بناء المنتجات الرقمية الناجحة.',
    isActive: true
  },
  {
    name: 'الشركات الناشئة',
    slug: 'startups',
    description: 'محتوى حول ريادة الأعمال التقنية وتأسيس الشركات الناشئة وإدارة النمو.',
    isActive: true
  },
  {
    name: 'دراسات حالة',
    slug: 'case-studies',
    description: 'تحليل وتوثيق المشاريع الحقيقية والتحديات التقنية والحلول المستخدمة.',
    isActive: true
  },
  {
    name: 'المسار المهني',
    slug: 'career',
    description: 'خبرات وتجارب مهنية ونصائح للمطورين والمهندسين التقنيين.',
    isActive: true
  },
  {
    name: 'التعلم والتطوير',
    slug: 'learning',
    description: 'ملخصات الدورات والشهادات وأفضل أساليب التعلم المستمر.',
    isActive: true
  },
  {
    name: 'آراء وأفكار',
    slug: 'thoughts',
    description: 'وجهات نظر شخصية حول التقنية والمستقبل والابتكار وريادة الأعمال.',
    isActive: true
  }
];

export async function seedBlogCategories(categoryModel: Model<Category>) {
  for (const data of categoriesData) {
    const existing = await categoryModel.findOne({ slug: data.slug });
    if (existing) {
      console.log(`Blog Category with slug "${data.slug}" already exists, updating...`);
      await categoryModel.updateOne({ slug: data.slug }, { $set: data });
    } else {
      console.log(`Creating Blog Category: ${data.name}`);
      await categoryModel.create(data);
    }
  }
  console.log('Blog Categories seeding completed successfully!');
}
