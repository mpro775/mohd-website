export enum ProjectCategory {
  WEB_APP = 'web-app',
  MOBILE_APP = 'mobile-app',
  DASHBOARD = 'dashboard',
  API_BACKEND = 'api-backend',
  SAAS = 'saas',
  AI = 'ai',
  AUTOMATION = 'automation',
  UI_UX = 'ui-ux',
  OTHER = 'other',
}

export const PROJECT_CATEGORIES_METADATA = [
  { value: ProjectCategory.WEB_APP, labelAr: 'تطبيق ويب', labelEn: 'Web Application' },
  { value: ProjectCategory.MOBILE_APP, labelAr: 'تطبيق جوال', labelEn: 'Mobile Application' },
  { value: ProjectCategory.DASHBOARD, labelAr: 'لوحة تحكم', labelEn: 'Dashboard / Portal' },
  { value: ProjectCategory.API_BACKEND, labelAr: 'واجهة برمجية / باك إند', labelEn: 'API / Backend' },
  { value: ProjectCategory.SAAS, labelAr: 'برمجيات كخدمة (SaaS)', labelEn: 'Software as a Service (SaaS)' },
  { value: ProjectCategory.AI, labelAr: 'ذكاء اصطناعي', labelEn: 'Artificial Intelligence' },
  { value: ProjectCategory.AUTOMATION, labelAr: 'أتمتة عمليات', labelEn: 'Automation / Scripting' },
  { value: ProjectCategory.UI_UX, labelAr: 'تصميم تجربة وواجهة المستخدم', labelEn: 'UI/UX Design' },
  { value: ProjectCategory.OTHER, labelAr: 'أخرى', labelEn: 'Other' },
];

export enum ProjectStatus {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in-progress',
  PAUSED = 'paused',
}

export const PROJECT_STATUSES_METADATA = [
  { value: ProjectStatus.COMPLETED, labelAr: 'مكتمل', labelEn: 'Completed' },
  { value: ProjectStatus.IN_PROGRESS, labelAr: 'قيد التنفيذ', labelEn: 'In Progress' },
  { value: ProjectStatus.PAUSED, labelAr: 'متوقف مؤقتاً', labelEn: 'Paused' },
];
