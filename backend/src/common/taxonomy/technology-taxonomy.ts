export enum TechnologyCategory {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  DATABASE = 'database',
  DEVOPS = 'devops',
  CLOUD = 'cloud',
  MOBILE = 'mobile',
  DESIGN = 'design',
  TESTING = 'testing',
  AI = 'ai',
  TOOLS = 'tools',
  OTHER = 'other',
}

export const TECHNOLOGY_CATEGORIES_METADATA = [
  {
    value: TechnologyCategory.FRONTEND,
    labelAr: 'واجهة أمامية',
    labelEn: 'Frontend',
  },
  {
    value: TechnologyCategory.BACKEND,
    labelAr: 'واجهة خلفية',
    labelEn: 'Backend',
  },
  {
    value: TechnologyCategory.DATABASE,
    labelAr: 'قواعد بيانات',
    labelEn: 'Database',
  },
  { value: TechnologyCategory.DEVOPS, labelAr: 'ديف أوبس', labelEn: 'DevOps' },
  { value: TechnologyCategory.CLOUD, labelAr: 'سحابي', labelEn: 'Cloud' },
  { value: TechnologyCategory.MOBILE, labelAr: 'جوال', labelEn: 'Mobile' },
  { value: TechnologyCategory.DESIGN, labelAr: 'تصميم', labelEn: 'Design' },
  {
    value: TechnologyCategory.TESTING,
    labelAr: 'اختبارات',
    labelEn: 'Testing',
  },
  { value: TechnologyCategory.AI, labelAr: 'ذكاء اصطناعي', labelEn: 'AI' },
  { value: TechnologyCategory.TOOLS, labelAr: 'أدوات', labelEn: 'Tools' },
  { value: TechnologyCategory.OTHER, labelAr: 'أخرى', labelEn: 'Other' },
];

export enum TechnologyGroup {
  LANGUAGE = 'language',
  FRAMEWORK = 'framework',
  LIBRARY = 'library',
  RUNTIME = 'runtime',
  DATABASE = 'database',
  ORM = 'orm',
  CMS = 'cms',
  CLOUD = 'cloud',
  STORAGE = 'storage',
  QUEUE = 'queue',
  TESTING = 'testing',
  DESIGN_TOOL = 'design-tool',
  AUTOMATION = 'automation',
  OTHER = 'other',
}

export const TECHNOLOGY_GROUPS_METADATA = [
  {
    value: TechnologyGroup.LANGUAGE,
    labelAr: 'لغة برمجة',
    labelEn: 'Programming Language',
  },
  {
    value: TechnologyGroup.FRAMEWORK,
    labelAr: 'إطار عمل',
    labelEn: 'Framework',
  },
  {
    value: TechnologyGroup.LIBRARY,
    labelAr: 'مكتبة برمجة',
    labelEn: 'Library',
  },
  {
    value: TechnologyGroup.RUNTIME,
    labelAr: 'بيئة تشغيل',
    labelEn: 'Runtime Environment',
  },
  {
    value: TechnologyGroup.DATABASE,
    labelAr: 'قاعدة بيانات',
    labelEn: 'Database',
  },
  { value: TechnologyGroup.ORM, labelAr: 'ORM / ODM', labelEn: 'ORM / ODM' },
  { value: TechnologyGroup.CMS, labelAr: 'نظام إدارة محتوى', labelEn: 'CMS' },
  {
    value: TechnologyGroup.CLOUD,
    labelAr: 'خدمة سحابية',
    labelEn: 'Cloud Service',
  },
  {
    value: TechnologyGroup.STORAGE,
    labelAr: 'تخزين ملفات',
    labelEn: 'Storage',
  },
  {
    value: TechnologyGroup.QUEUE,
    labelAr: 'طابور مهام',
    labelEn: 'Message Queue',
  },
  {
    value: TechnologyGroup.TESTING,
    labelAr: 'إطار اختبار',
    labelEn: 'Testing Framework',
  },
  {
    value: TechnologyGroup.DESIGN_TOOL,
    labelAr: 'أداة تصميم',
    labelEn: 'Design Tool',
  },
  {
    value: TechnologyGroup.AUTOMATION,
    labelAr: 'أداة أتمتة',
    labelEn: 'Automation Tool',
  },
  { value: TechnologyGroup.OTHER, labelAr: 'أخرى', labelEn: 'Other' },
];

export enum ProficiencyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export const PROFICIENCY_LEVELS_METADATA = [
  { value: ProficiencyLevel.BEGINNER, labelAr: 'مبتدئ', labelEn: 'Beginner' },
  {
    value: ProficiencyLevel.INTERMEDIATE,
    labelAr: 'متوسط',
    labelEn: 'Intermediate',
  },
  { value: ProficiencyLevel.ADVANCED, labelAr: 'متقدم', labelEn: 'Advanced' },
  { value: ProficiencyLevel.EXPERT, labelAr: 'خبير', labelEn: 'Expert' },
];
