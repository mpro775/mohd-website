import { Model } from 'mongoose';
import {
  Technology,
  TechnologyCategory,
  TechnologyGroup,
  ProficiencyLevel,
} from '../../modules/technologies/schemas/technology.schema';

type TechnologySeed = {
  name: string;
  slug: string;
  description: string;
  proficiencyLevel: ProficiencyLevel;
  category: TechnologyCategory;
  group: TechnologyGroup;
  officialUrl?: string;
  yearsOfExperience?: number;
  highlighted?: boolean;
  color?: string;
  order: number;
  /** Used only when the record is created for the first time. */
  publishOnCreate?: boolean;
};

export const technologiesData: TechnologySeed[] = [
  // Programming languages
  {
    name: 'TypeScript', slug: 'typescript',
    description: 'اللغة الأساسية التي أستخدمها لبناء تطبيقات ويب قابلة للصيانة على الواجهة الأمامية والخلفية مع نظام أنواع قوي.',
    proficiencyLevel: ProficiencyLevel.EXPERT,
    category: TechnologyCategory.LANGUAGES, group: TechnologyGroup.LANGUAGE,
    officialUrl: 'https://www.typescriptlang.org', yearsOfExperience: 4,
    highlighted: true, color: '#3178C6', order: 10,
  },
  {
    name: 'JavaScript', slug: 'javascript',
    description: 'لغة البرمجة الأساسية لتطوير تطبيقات الويب الحديثة وبناء الواجهات والخدمات الخلفية.',
    proficiencyLevel: ProficiencyLevel.EXPERT,
    category: TechnologyCategory.LANGUAGES, group: TechnologyGroup.LANGUAGE,
    officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', yearsOfExperience: 5,
    highlighted: false, color: '#F7DF1E', order: 20,
  },

  // Backend
  {
    name: 'NestJS', slug: 'nestjs',
    description: 'إطار العمل الأساسي لبناء APIs وأنظمة خلفية منظمة وقابلة للتوسع باستخدام TypeScript.',
    proficiencyLevel: ProficiencyLevel.EXPERT,
    category: TechnologyCategory.BACKEND, group: TechnologyGroup.FRAMEWORK,
    officialUrl: 'https://nestjs.com', yearsOfExperience: 3,
    highlighted: true, color: '#E0234E', order: 100,
  },
  {
    name: 'Node.js', slug: 'nodejs',
    description: 'بيئة التشغيل المستخدمة لبناء الخدمات الخلفية وواجهات API والمهام غير المتزامنة.',
    proficiencyLevel: ProficiencyLevel.EXPERT,
    category: TechnologyCategory.BACKEND, group: TechnologyGroup.RUNTIME,
    officialUrl: 'https://nodejs.org', yearsOfExperience: 4,
    highlighted: true, color: '#339933', order: 110,
  },
  {
    name: 'REST API', slug: 'rest-api',
    description: 'تصميم وتنفيذ واجهات REST واضحة وآمنة وقابلة للتوسع مع عقود API مستقرة.',
    proficiencyLevel: ProficiencyLevel.EXPERT,
    category: TechnologyCategory.BACKEND, group: TechnologyGroup.PROTOCOL,
    highlighted: false, color: '#2563EB', order: 120,
  },
  {
    name: 'BullMQ', slug: 'bullmq',
    description: 'إدارة Background Jobs والطوابير والمهام المؤجلة والمتكررة المبنية على Redis في تطبيقات Node.js وNestJS.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.BACKEND, group: TechnologyGroup.QUEUE,
    officialUrl: 'https://bullmq.io', highlighted: false, color: '#E11D48', order: 130,
  },
  {
    name: 'TypeORM', slug: 'typeorm',
    description: 'ORM لتصميم طبقة البيانات والمستودعات وإدارة العلاقات والترحيلات في تطبيقات TypeScript وNestJS.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.BACKEND, group: TechnologyGroup.ORM,
    officialUrl: 'https://typeorm.io', highlighted: false, color: '#E83524', order: 140,
  },
  {
    name: 'Prisma ORM', slug: 'prisma',
    description: 'ORM حديث لـTypeScript يوفر نمذجة قوية للبيانات وعميلًا typed للتعامل مع قواعد البيانات.',
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    category: TechnologyCategory.BACKEND, group: TechnologyGroup.ORM,
    officialUrl: 'https://www.prisma.io', highlighted: false, color: '#2D3748', order: 150,
    publishOnCreate: false,
  },
  {
    name: 'WebSocket', slug: 'websocket',
    description: 'اتصالات ثنائية الاتجاه في الزمن الحقيقي للميزات التي تحتاج تحديثات فورية بين العميل والخادم.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.BACKEND, group: TechnologyGroup.PROTOCOL,
    highlighted: false, color: '#334155', order: 160,
  },
  {
    name: 'Socket.IO', slug: 'socket-io',
    description: 'بناء قنوات Real-Time موثوقة للمحادثات والإشعارات والأحداث الفورية في تطبيقات الويب.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.BACKEND, group: TechnologyGroup.LIBRARY,
    officialUrl: 'https://socket.io', highlighted: false, color: '#010101', order: 170,
  },

  // Frontend
  {
    name: 'React', slug: 'react',
    description: 'مكتبة لبناء واجهات مستخدم تفاعلية ومكونات قابلة لإعادة الاستخدام.',
    proficiencyLevel: ProficiencyLevel.EXPERT,
    category: TechnologyCategory.FRONTEND, group: TechnologyGroup.LIBRARY,
    officialUrl: 'https://react.dev', yearsOfExperience: 4,
    highlighted: true, color: '#61DAFB', order: 200,
  },
  {
    name: 'Next.js', slug: 'nextjs',
    description: 'إطار React لبناء تطبيقات ويب حديثة مع Rendering متقدم وتحسين SEO والأداء.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.FRONTEND, group: TechnologyGroup.FRAMEWORK,
    officialUrl: 'https://nextjs.org', yearsOfExperience: 2,
    highlighted: true, color: '#000000', order: 210,
  },
  {
    name: 'Tailwind CSS', slug: 'tailwind-css',
    description: 'بناء أنظمة واجهات سريعة ومتجاوبة باستخدام Utility-First CSS وتصميم قابل للتوحيد.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.FRONTEND, group: TechnologyGroup.FRAMEWORK,
    officialUrl: 'https://tailwindcss.com', highlighted: false, color: '#06B6D4', order: 220,
  },
  {
    name: 'shadcn/ui', slug: 'shadcn-ui',
    description: 'مكونات واجهات قابلة للتخصيص لبناء لوحات تحكم وتجارب احترافية فوق React وTailwind CSS.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.FRONTEND, group: TechnologyGroup.LIBRARY,
    officialUrl: 'https://ui.shadcn.com', highlighted: false, color: '#18181B', order: 230,
  },
  {
    name: 'TanStack Query', slug: 'tanstack-query',
    description: 'إدارة Server State والجلب والكاش وإعادة المزامنة للبيانات في تطبيقات React.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.FRONTEND, group: TechnologyGroup.LIBRARY,
    officialUrl: 'https://tanstack.com/query', highlighted: false, color: '#FF4154', order: 240,
  },
  {
    name: 'React Router', slug: 'react-router',
    description: 'إدارة التنقل والمسارات وبنية الصفحات في تطبيقات React أحادية الصفحة.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.FRONTEND, group: TechnologyGroup.LIBRARY,
    officialUrl: 'https://reactrouter.com', highlighted: false, color: '#CA4245', order: 250,
  },
  {
    name: 'Zustand', slug: 'zustand',
    description: 'إدارة حالة خفيفة ومرنة لتطبيقات React مع تقليل التعقيد في الحالات المشتركة.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.FRONTEND, group: TechnologyGroup.LIBRARY,
    officialUrl: 'https://zustand.docs.pmnd.rs', highlighted: false, color: '#433E38', order: 260,
  },

  // Databases & data infrastructure
  {
    name: 'PostgreSQL', slug: 'postgresql',
    description: 'قاعدة بيانات علائقية قوية للأنظمة المؤسسية ومنصات SaaS والبيانات ذات العلاقات المعقدة.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.DATABASE, group: TechnologyGroup.DATABASE,
    officialUrl: 'https://www.postgresql.org', yearsOfExperience: 3,
    highlighted: true, color: '#4169E1', order: 300,
  },
  {
    name: 'MongoDB', slug: 'mongodb',
    description: 'قاعدة بيانات وثائقية مرنة لبناء APIs ومنتجات ويب تحتاج نماذج بيانات قابلة للتطور.',
    proficiencyLevel: ProficiencyLevel.EXPERT,
    category: TechnologyCategory.DATABASE, group: TechnologyGroup.DATABASE,
    officialUrl: 'https://www.mongodb.com', yearsOfExperience: 4,
    highlighted: false, color: '#47A248', order: 310,
  },
  {
    name: 'Redis', slug: 'redis',
    description: 'مخزن بيانات سريع في الذاكرة للكاش والجلسات والطوابير والأقفال والعمليات عالية الأداء.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.DATABASE, group: TechnologyGroup.CACHE,
    officialUrl: 'https://redis.io', highlighted: true, color: '#FF4438', order: 320,
  },
  {
    name: 'Elasticsearch', slug: 'elasticsearch',
    description: 'محرك بحث وفهرسة موزع للبحث النصي والتحليلات وحالات الاستخدام التي تحتاج استعلامات بحث متقدمة.',
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    category: TechnologyCategory.DATABASE, group: TechnologyGroup.SEARCH,
    officialUrl: 'https://www.elastic.co/elasticsearch', highlighted: false, color: '#FEC514', order: 330,
    publishOnCreate: false,
  },
  {
    name: 'Qdrant', slug: 'qdrant',
    description: 'قاعدة بيانات متجهية لبناء البحث الدلالي وRAG وتخزين واسترجاع Embeddings.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.DATABASE, group: TechnologyGroup.DATABASE,
    officialUrl: 'https://qdrant.tech', highlighted: false, color: '#DC244C', order: 340,
  },

  // Security & identity
  {
    name: 'JWT Authentication', slug: 'jwt-authentication',
    description: 'تصميم تدفقات المصادقة المعتمدة على JSON Web Token للجلسات وواجهات API مع إدارة الصلاحية والتجديد.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.SECURITY, group: TechnologyGroup.AUTH,
    highlighted: false, color: '#D63AFF', order: 400,
  },
  {
    name: 'OAuth 2.0', slug: 'oauth-2',
    description: 'تكامل تسجيل الدخول والتفويض عبر مزودي الهوية الخارجيين وبناء تدفقات Authorization آمنة.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.SECURITY, group: TechnologyGroup.AUTH,
    officialUrl: 'https://oauth.net/2/', highlighted: false, color: '#3B82F6', order: 410,
  },

  // DevOps & observability
  {
    name: 'Docker', slug: 'docker',
    description: 'حاويات برمجية لتوحيد بيئات التطوير والنشر وتشغيل الخدمات بصورة قابلة للتكرار.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.DEVOPS, group: TechnologyGroup.PLATFORM,
    officialUrl: 'https://www.docker.com', yearsOfExperience: 3,
    highlighted: true, color: '#2496ED', order: 500,
  },
  {
    name: 'Docker Compose', slug: 'docker-compose',
    description: 'تعريف وتشغيل التطبيقات متعددة الخدمات محليًا وعلى الخوادم ضمن ملفات بيئة قابلة للإدارة.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.DEVOPS, group: TechnologyGroup.PLATFORM,
    officialUrl: 'https://docs.docker.com/compose/', highlighted: false, color: '#2496ED', order: 510,
  },
  {
    name: 'Linux', slug: 'linux',
    description: 'إدارة وتشغيل خوادم Linux ونشر التطبيقات ومتابعة الخدمات والسجلات والعمليات التشغيلية.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.DEVOPS, group: TechnologyGroup.PLATFORM,
    officialUrl: 'https://www.kernel.org', highlighted: false, color: '#FCC624', order: 520,
  },
  {
    name: 'Nginx', slug: 'nginx',
    description: 'Reverse Proxy وتوجيه حركة المرور وإنهاء TLS وخدمة التطبيقات في بيئات الإنتاج.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.DEVOPS, group: TechnologyGroup.PLATFORM,
    officialUrl: 'https://nginx.org', highlighted: false, color: '#009639', order: 530,
  },
  {
    name: 'Coolify', slug: 'coolify',
    description: 'منصة Self-Hosted لنشر وإدارة التطبيقات وقواعد البيانات والخدمات فوق الخوادم الخاصة.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.DEVOPS, group: TechnologyGroup.PLATFORM,
    officialUrl: 'https://coolify.io', highlighted: false, color: '#6B5CFF', order: 540,
  },
  {
    name: 'GitHub Actions', slug: 'github-actions',
    description: 'بناء مسارات CI/CD لتشغيل الاختبارات والتحقق من الجودة والبناء والنشر تلقائيًا.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.DEVOPS, group: TechnologyGroup.CI_CD,
    officialUrl: 'https://github.com/features/actions', highlighted: false, color: '#2088FF', order: 550,
  },
  {
    name: 'CI/CD', slug: 'ci-cd',
    description: 'تصميم خطوط التكامل والتسليم المستمر لأتمتة الاختبارات والبناء وإطلاق الإصدارات بصورة آمنة.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.DEVOPS, group: TechnologyGroup.CI_CD,
    highlighted: false, color: '#0EA5E9', order: 560,
  },
  {
    name: 'Prometheus', slug: 'prometheus',
    description: 'جمع Metrics ومراقبة التطبيقات والخدمات وبناء أساس للرصد والتنبيه التشغيلي.',
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    category: TechnologyCategory.DEVOPS, group: TechnologyGroup.OBSERVABILITY,
    officialUrl: 'https://prometheus.io', highlighted: false, color: '#E6522C', order: 570,
  },
  {
    name: 'Grafana', slug: 'grafana',
    description: 'إنشاء لوحات مراقبة تشغيلية لعرض المقاييس ومتابعة صحة الأنظمة والخدمات.',
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    category: TechnologyCategory.DEVOPS, group: TechnologyGroup.OBSERVABILITY,
    officialUrl: 'https://grafana.com', highlighted: false, color: '#F46800', order: 580,
  },
  {
    name: 'PM2', slug: 'pm2',
    description: 'إدارة عمليات Node.js في بيئات الإنتاج ومراقبة التشغيل وإعادة التشغيل وإدارة أكثر من Process.',
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    category: TechnologyCategory.DEVOPS, group: TechnologyGroup.PLATFORM,
    officialUrl: 'https://pm2.keymetrics.io', highlighted: false, color: '#2B037A', order: 590,
  },
  {
    name: 'Duplicati', slug: 'duplicati',
    description: 'إدارة النسخ الاحتياطية المشفرة والمجدولة للبيانات والخوادم إلى وجهات تخزين خارجية.',
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    category: TechnologyCategory.DEVOPS, group: TechnologyGroup.AUTOMATION,
    officialUrl: 'https://duplicati.com', highlighted: false, color: '#1F6FEB', order: 600,
  },

  // Cloud
  {
    name: 'Cloudflare', slug: 'cloudflare',
    description: 'إدارة DNS وTLS والحماية والشبكات وخدمات Edge المرتبطة بتشغيل المواقع والتطبيقات.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.CLOUD, group: TechnologyGroup.CLOUD,
    officialUrl: 'https://www.cloudflare.com', highlighted: false, color: '#F38020', order: 700,
  },
  {
    name: 'AWS', slug: 'aws',
    description: 'فهم واستخدام مفاهيم وخدمات البنية السحابية والتخزين والشبكات وتشغيل التطبيقات على AWS.',
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    category: TechnologyCategory.CLOUD, group: TechnologyGroup.CLOUD,
    officialUrl: 'https://aws.amazon.com', highlighted: false, color: '#FF9900', order: 710,
  },
  {
    name: 'IBM Cloud', slug: 'ibm-cloud',
    description: 'معرفة بخدمات ومفاهيم IBM Cloud والبنية السحابية وإدارة الموارد.',
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    category: TechnologyCategory.CLOUD, group: TechnologyGroup.CLOUD,
    officialUrl: 'https://www.ibm.com/cloud', highlighted: false, color: '#0F62FE', order: 720,
    publishOnCreate: false,
  },

  // AI engineering
  {
    name: 'OpenAI', slug: 'openai',
    description: 'بناء ميزات ومنتجات تعتمد على النماذج اللغوية وواجهات الذكاء الاصطناعي التوليدي.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.AI, group: TechnologyGroup.PLATFORM,
    officialUrl: 'https://openai.com', yearsOfExperience: 2,
    highlighted: false, color: '#10A37F', order: 800,
  },
  {
    name: 'RAG', slug: 'rag',
    description: 'تصميم Retrieval-Augmented Generation لربط النماذج اللغوية بمصادر معرفة خاصة مع استرجاع سياق مناسب.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.AI, group: TechnologyGroup.ARCHITECTURE,
    highlighted: false, color: '#7C3AED', order: 810,
  },
  {
    name: 'Embeddings', slug: 'embeddings',
    description: 'استخدام التمثيلات المتجهية لبناء البحث الدلالي والمطابقة واسترجاع المعرفة في تطبيقات AI.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.AI, group: TechnologyGroup.OTHER,
    highlighted: false, color: '#8B5CF6', order: 820,
  },
  {
    name: 'AI Agents', slug: 'ai-agents',
    description: 'تصميم وكلاء ذكاء اصطناعي يستخدمون الأدوات والسياق وسير العمل لتنفيذ مهام متعددة الخطوات.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.AI, group: TechnologyGroup.ARCHITECTURE,
    highlighted: false, color: '#A855F7', order: 830,
  },
  {
    name: 'MCP', slug: 'mcp',
    description: 'استخدام Model Context Protocol لربط تطبيقات ووكلاء الذكاء الاصطناعي بالأدوات ومصادر السياق بطريقة معيارية.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.AI, group: TechnologyGroup.PROTOCOL,
    officialUrl: 'https://modelcontextprotocol.io', highlighted: false, color: '#6366F1', order: 840,
  },
  {
    name: 'OpenRouter', slug: 'openrouter',
    description: 'تكامل تطبيقات AI مع نماذج متعددة من خلال طبقة API موحدة واختيار مزود النموذج حسب الحاجة.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.AI, group: TechnologyGroup.PLATFORM,
    officialUrl: 'https://openrouter.ai', highlighted: false, color: '#111827', order: 850,
  },
  {
    name: 'Anthropic Claude', slug: 'anthropic-claude',
    description: 'استخدام نماذج Claude ضمن سير عمل التطوير وبناء الحلول المعتمدة على النماذج اللغوية.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.AI, group: TechnologyGroup.PLATFORM,
    officialUrl: 'https://www.anthropic.com/claude', highlighted: false, color: '#D97757', order: 860,
  },
  {
    name: 'Google Gemini', slug: 'google-gemini',
    description: 'استخدام نماذج Gemini وواجهاتها ضمن حلول الذكاء الاصطناعي متعددة الاستخدامات.',
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    category: TechnologyCategory.AI, group: TechnologyGroup.PLATFORM,
    officialUrl: 'https://ai.google.dev', highlighted: false, color: '#4285F4', order: 870,
  },
  {
    name: 'LangChain', slug: 'langchain',
    description: 'إطار لبناء تطبيقات LLM التي تجمع النماذج والأدوات والاسترجاع وسلاسل المعالجة.',
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    category: TechnologyCategory.AI, group: TechnologyGroup.FRAMEWORK,
    officialUrl: 'https://www.langchain.com', highlighted: false, color: '#1C3C3C', order: 880,
    publishOnCreate: false,
  },
  {
    name: 'LangGraph', slug: 'langgraph',
    description: 'بناء تدفقات Agents ذات حالة ومسارات متعددة للتحكم في سير تنفيذ الوكلاء والمهام.',
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    category: TechnologyCategory.AI, group: TechnologyGroup.FRAMEWORK,
    highlighted: false, color: '#1C3C3C', order: 890,
    publishOnCreate: false,
  },

  // Automation
  {
    name: 'n8n', slug: 'n8n',
    description: 'منصة أتمتة سير العمل وربط الأنظمة والخدمات وتنفيذ التكاملات متعددة الخطوات.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.AUTOMATION, group: TechnologyGroup.AUTOMATION,
    officialUrl: 'https://n8n.io', yearsOfExperience: 2,
    highlighted: false, color: '#EA4B71', order: 900,
  },

  // Developer tools
  {
    name: 'Git', slug: 'git',
    description: 'إدارة الإصدارات والفروع والمراجعات وتتبع التغييرات في المشاريع البرمجية.',
    proficiencyLevel: ProficiencyLevel.EXPERT,
    category: TechnologyCategory.TOOLS, group: TechnologyGroup.OTHER,
    officialUrl: 'https://git-scm.com', yearsOfExperience: 5,
    highlighted: false, color: '#F05032', order: 1000,
  },
  {
    name: 'GitHub', slug: 'github',
    description: 'إدارة المستودعات وPull Requests وIssues والتعاون البرمجي وربط عمليات CI/CD.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.TOOLS, group: TechnologyGroup.PLATFORM,
    officialUrl: 'https://github.com', highlighted: false, color: '#181717', order: 1010,
  },
  {
    name: 'Postman', slug: 'postman',
    description: 'اختبار وتوثيق واستكشاف واجهات API وإدارة Collections وبيئات الاختبار.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.TOOLS, group: TechnologyGroup.TESTING,
    officialUrl: 'https://www.postman.com', highlighted: false, color: '#FF6C37', order: 1020,
  },
  {
    name: 'Bruno', slug: 'bruno',
    description: 'عميل API قائم على الملفات مناسب لاختبار واجهات API وإدارة الطلبات داخل المستودع.',
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    category: TechnologyCategory.TOOLS, group: TechnologyGroup.TESTING,
    officialUrl: 'https://www.usebruno.com', highlighted: false, color: '#F97316', order: 1030,
    publishOnCreate: false,
  },
  {
    name: 'Visual Studio Code', slug: 'visual-studio-code',
    description: 'بيئة التطوير الأساسية لكتابة وإدارة وفحص الأكواد والمشاريع متعددة التقنيات.',
    proficiencyLevel: ProficiencyLevel.EXPERT,
    category: TechnologyCategory.TOOLS, group: TechnologyGroup.OTHER,
    officialUrl: 'https://code.visualstudio.com', highlighted: false, color: '#007ACC', order: 1040,
  },
  {
    name: 'OpenAPI / Swagger', slug: 'openapi-swagger',
    description: 'تعريف وتوثيق عقود APIs وتوليد توثيق قابل للاستهلاك واختبار الواجهات بصورة منظمة.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.TOOLS, group: TechnologyGroup.PROTOCOL,
    officialUrl: 'https://swagger.io/specification/', highlighted: false, color: '#85EA2D', order: 1050,
  },

  // Architecture
  {
    name: 'Microservices', slug: 'microservices',
    description: 'تصميم الأنظمة كخدمات مستقلة ذات حدود واضحة وتكاملات قابلة للتوسع والتشغيل المنفصل.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.ARCHITECTURE, group: TechnologyGroup.ARCHITECTURE,
    highlighted: false, color: '#0F766E', order: 1100,
  },
  {
    name: 'Clean Architecture', slug: 'clean-architecture',
    description: 'فصل منطق الأعمال عن تفاصيل الأطر والبنية التحتية لتقليل الاقتران وتحسين قابلية الاختبار والصيانة.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.ARCHITECTURE, group: TechnologyGroup.ARCHITECTURE,
    highlighted: false, color: '#0D9488', order: 1110,
  },
  {
    name: 'Domain-Driven Design (DDD)', slug: 'domain-driven-design',
    description: 'نمذجة البرمجيات حول مجال العمل وحدوده ومفاهيمه لتقليل التعقيد في الأنظمة الكبيرة.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.ARCHITECTURE, group: TechnologyGroup.ARCHITECTURE,
    highlighted: false, color: '#14B8A6', order: 1120,
  },
  {
    name: 'Event-Driven Architecture', slug: 'event-driven-architecture',
    description: 'تصميم الأنظمة حول الأحداث والمعالجة غير المتزامنة لفصل المكونات وتحسين المرونة وقابلية التوسع.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.ARCHITECTURE, group: TechnologyGroup.ARCHITECTURE,
    highlighted: false, color: '#0EA5E9', order: 1130,
  },
  {
    name: 'Monorepo Architecture', slug: 'monorepo-architecture',
    description: 'إدارة تطبيقات وحزم متعددة داخل مستودع موحد مع عقود مشتركة وأدوات بناء واختبار موحدة.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.ARCHITECTURE, group: TechnologyGroup.ARCHITECTURE,
    highlighted: false, color: '#0284C7', order: 1140,
  },
  {
    name: 'Multi-Tenant Architecture', slug: 'multi-tenant-architecture',
    description: 'تصميم منصات متعددة المستأجرين مع عزل البيانات والسياق والصلاحيات والعمليات لكل Tenant.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.ARCHITECTURE, group: TechnologyGroup.ARCHITECTURE,
    highlighted: false, color: '#2563EB', order: 1150,
  },

  // SaaS engineering
  {
    name: 'SaaS Architecture', slug: 'saas-architecture',
    description: 'تصميم منتجات SaaS قابلة للتوسع تشمل الهوية والعزل والتشغيل والاشتراكات وإدارة دورة حياة العميل.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.SAAS, group: TechnologyGroup.ARCHITECTURE,
    highlighted: false, color: '#4F46E5', order: 1200,
  },
  {
    name: 'Subscription Systems', slug: 'subscription-systems',
    description: 'تصميم منطق الخطط والاشتراكات والدورات والحالات والاستحقاقات المرتبطة بالمنتجات البرمجية.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.SAAS, group: TechnologyGroup.ARCHITECTURE,
    highlighted: false, color: '#6366F1', order: 1210,
  },
  {
    name: 'Payment Integration', slug: 'payment-integration',
    description: 'تكامل تدفقات الدفع والتحقق والاسترداد وربط حالة الدفع بحالة الطلب أو الاشتراك بصورة موثوقة.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.SAAS, group: TechnologyGroup.ARCHITECTURE,
    highlighted: false, color: '#7C3AED', order: 1220,
  },
  {
    name: 'RBAC', slug: 'rbac',
    description: 'تصميم Role-Based Access Control لإدارة الأدوار والصلاحيات وحماية الموارد والعمليات الحساسة.',
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    category: TechnologyCategory.SAAS, group: TechnologyGroup.AUTH,
    highlighted: false, color: '#8B5CF6', order: 1230,
  },
  {
    name: 'Feature Flags', slug: 'feature-flags',
    description: 'فصل إطلاق الميزات عن النشر ودعم التفعيل التدريجي أو حسب العميل والخطة والبيئة.',
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    category: TechnologyCategory.SAAS, group: TechnologyGroup.ARCHITECTURE,
    highlighted: false, color: '#A855F7', order: 1240,
  },
];

export async function seedTechnologies(technologyModel: Model<Technology>) {
  for (const data of technologiesData) {
    const { publishOnCreate = true, ...persistedData } = data;
    const existing = await technologyModel.findOne({ slug: data.slug });

    if (existing) {
      console.log(`Technology with slug "${data.slug}" already exists, updating...`);
      await technologyModel.updateOne(
        { slug: data.slug },
        { $set: persistedData },
        { runValidators: true },
      );
      continue;
    }

    console.log(`Creating technology: ${data.name}`);
    await technologyModel.create({
      ...persistedData,
      isPublished: publishOnCreate,
    });
  }

  console.log('Technologies seeding completed successfully!');
}
