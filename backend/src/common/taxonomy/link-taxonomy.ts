export enum LinkCategory {
  SOCIAL = 'social',
  PROFESSIONAL = 'professional',
  CONTACT = 'contact',
  PORTFOLIO = 'portfolio',
  RESUME = 'resume',
  OTHER = 'other',
}

export const LINK_CATEGORIES_METADATA = [
  { value: LinkCategory.SOCIAL, labelAr: 'مواقع التواصل الاجتماعي', labelEn: 'Social Media' },
  { value: LinkCategory.PROFESSIONAL, labelAr: 'حسابات مهنية', labelEn: 'Professional Networks' },
  { value: LinkCategory.CONTACT, labelAr: 'وسائل اتصال مباشر', labelEn: 'Direct Contact' },
  { value: LinkCategory.PORTFOLIO, labelAr: 'معرض أعمال', labelEn: 'Portfolio Sites' },
  { value: LinkCategory.RESUME, labelAr: 'سيرة ذاتية', labelEn: 'Resume / CV' },
  { value: LinkCategory.OTHER, labelAr: 'أخرى', labelEn: 'Other' },
];

export enum LinkPlatform {
  GITHUB = 'github',
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter',
  X = 'x',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  WEBSITE = 'website',
  OTHER = 'other',
}

export const LINK_PLATFORMS_METADATA = [
  { value: LinkPlatform.GITHUB, labelAr: 'جيت هاب (GitHub)', labelEn: 'GitHub' },
  { value: LinkPlatform.LINKEDIN, labelAr: 'لينكد إن (LinkedIn)', labelEn: 'LinkedIn' },
  { value: LinkPlatform.TWITTER, labelAr: 'تويتر (Twitter)', labelEn: 'Twitter' },
  { value: LinkPlatform.X, labelAr: 'إكس (X)', labelEn: 'X' },
  { value: LinkPlatform.FACEBOOK, labelAr: 'فيسبوك (Facebook)', labelEn: 'Facebook' },
  { value: LinkPlatform.INSTAGRAM, labelAr: 'إنستغرام (Instagram)', labelEn: 'Instagram' },
  { value: LinkPlatform.WHATSAPP, labelAr: 'واتساب (WhatsApp)', labelEn: 'WhatsApp' },
  { value: LinkPlatform.TELEGRAM, labelAr: 'تيليجرام (Telegram)', labelEn: 'Telegram' },
  { value: LinkPlatform.EMAIL, labelAr: 'البريد الإلكتروني', labelEn: 'Email' },
  { value: LinkPlatform.WEBSITE, labelAr: 'موقع إلكتروني', labelEn: 'Website' },
  { value: LinkPlatform.OTHER, labelAr: 'أخرى', labelEn: 'Other' },
];
