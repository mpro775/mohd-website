import { Model } from 'mongoose';
import { Link } from '../../modules/links/schemas/link.schema';

export const linksData = [
  {
    title: 'لينكدإن',
    slug: 'linkedin',
    url: 'https://linkedin.com/in/your-profile',
    description: 'الملف المهني الذي يعرض الخبرات والمشاريع والشهادات المهنية.',
    icon: 'Linkedin',
    platform: 'LinkedIn',
    category: 'Social',
    openInNewTab: true,
    isFeatured: true,
    order: 1,
  },
  {
    title: 'جيت هب',
    slug: 'github',
    url: 'https://github.com/your-username',
    description: 'مستودعات الأكواد البرمجية والمشاريع مفتوحة المصدر.',
    icon: 'Github',
    platform: 'GitHub',
    category: 'Developer',
    openInNewTab: true,
    isFeatured: true,
    order: 2,
  },
  {
    title: 'السيرة الذاتية',
    slug: 'resume',
    url: '/files/mohamed-murad-cv.pdf',
    description: 'تحميل السيرة الذاتية الكاملة بصيغة PDF.',
    icon: 'FileText',
    platform: 'Website',
    category: 'Professional',
    openInNewTab: true,
    isFeatured: true,
    order: 3,
  },
  {
    title: 'بريد إلكتروني',
    slug: 'email',
    url: 'mailto:your@email.com',
    description: 'للتواصل المباشر بخصوص المشاريع والاستشارات التقنية.',
    icon: 'Mail',
    platform: 'Email',
    category: 'Contact',
    openInNewTab: false,
    isFeatured: true,
    order: 4,
  },
  {
    title: 'واتساب',
    slug: 'whatsapp',
    url: 'https://wa.me/967XXXXXXXXX',
    description: 'للتواصل السريع ومناقشة المشاريع والفرص المهنية.',
    icon: 'MessageCircle',
    platform: 'WhatsApp',
    category: 'Contact',
    openInNewTab: true,
    isFeatured: true,
    order: 5,
  },
  {
    title: 'تيك توك',
    slug: 'tiktok',
    url: 'https://tiktok.com/@your-account',
    description:
      'محتوى تقني وريادي حول البرمجة والذكاء الاصطناعي وريادة الأعمال.',
    icon: 'Music2',
    platform: 'TikTok',
    category: 'Content',
    openInNewTab: true,
    isFeatured: false,
    order: 6,
  },
  {
    title: 'سناب شات',
    slug: 'snapchat',
    url: 'https://snapchat.com/add/your-account',
    description: 'مشاركة يوميات العمل وصناعة المنتجات التقنية.',
    icon: 'Ghost',
    platform: 'Snapchat',
    category: 'Content',
    openInNewTab: true,
    isFeatured: false,
    order: 7,
  },
  {
    title: 'كليم',
    slug: 'kaleem',
    url: 'https://kaleem.sa',
    description:
      'منصة كليم لبناء المتاجر الإلكترونية وحلول الذكاء الاصطناعي للأعمال.',
    icon: 'Rocket',
    platform: 'Product',
    category: 'Startup',
    openInNewTab: true,
    isFeatured: true,
    order: 8,
  },
  {
    title: 'وكالة سمارت',
    slug: 'smart-agency',
    url: 'https://smartagency.com',
    description:
      'الوكالة المتخصصة في تطوير الأنظمة والمنصات الرقمية وحلول SaaS.',
    icon: 'Building2',
    platform: 'Company',
    category: 'Business',
    openInNewTab: true,
    isFeatured: false,
    order: 9,
  },
  {
    title: 'معرض المشاريع',
    slug: 'portfolio',
    url: '/projects',
    description: 'استعراض أبرز المشاريع والمنتجات الرقمية التي تم تطويرها.',
    icon: 'Briefcase',
    platform: 'Website',
    category: 'Portfolio',
    openInNewTab: false,
    isFeatured: true,
    order: 10,
  },
];

export async function seedLinks(linkModel: Model<Link>) {
  for (const data of linksData) {
    const existing = await linkModel.findOne({ slug: data.slug });
    if (existing) {
      console.log(`Link with slug "${data.slug}" already exists, updating...`);
      await linkModel.updateOne({ slug: data.slug }, { $set: data });
    } else {
      console.log(`Creating link: ${data.title}`);
      await linkModel.create({
        ...data,
        isPublished: true,
      });
    }
  }
  console.log('Links seeding completed successfully!');
}
