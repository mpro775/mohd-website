export enum ServiceCategory {
  WEB_DEVELOPMENT = 'web-development',
  MOBILE_DEVELOPMENT = 'mobile-development',
  BACKEND_API = 'backend-api',
  UI_UX = 'ui-ux',
  AUTOMATION = 'automation',
  CONSULTING = 'consulting',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

export const SERVICE_CATEGORIES_METADATA = [
  { value: ServiceCategory.WEB_DEVELOPMENT, labelAr: 'تطوير الويب', labelEn: 'Web Development' },
  { value: ServiceCategory.MOBILE_DEVELOPMENT, labelAr: 'تطوير تطبيقات الجوال', labelEn: 'Mobile Development' },
  { value: ServiceCategory.BACKEND_API, labelAr: 'تطوير الباك إند والواجهات البرمجية', labelEn: 'Backend & APIs' },
  { value: ServiceCategory.UI_UX, labelAr: 'تصميم واجهات المستخدم', labelEn: 'UI/UX Design' },
  { value: ServiceCategory.AUTOMATION, labelAr: 'الأتمتة والسكربتات', labelEn: 'Automation & Scripting' },
  { value: ServiceCategory.CONSULTING, labelAr: 'الاستشارات التقنية', labelEn: 'Technical Consulting' },
  { value: ServiceCategory.MAINTENANCE, labelAr: 'الدعم والصيانة', labelEn: 'Support & Maintenance' },
  { value: ServiceCategory.OTHER, labelAr: 'أخرى', labelEn: 'Other' },
];
