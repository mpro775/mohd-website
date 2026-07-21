export enum CertificationType {
  COURSE = 'course',
  SPECIALIZATION = 'specialization',
  PROFESSIONAL_CERTIFICATE = 'professional-certificate',
  PROFESSIONAL_CERTIFICATION = 'professional-certification',
  LICENSE = 'license',
  BOOTCAMP = 'bootcamp',
  WORKSHOP = 'workshop',
  ATTENDANCE = 'attendance',
  DIPLOMA = 'diploma',
  AWARD = 'award',
  OTHER = 'other',
}

export enum EducationDegreeType {
  HIGH_SCHOOL = 'high-school',
  DIPLOMA = 'diploma',
  ASSOCIATE = 'associate',
  BACHELOR = 'bachelor',
  MASTER = 'master',
  DOCTORATE = 'doctorate',
  POSTGRADUATE = 'postgraduate',
  PROFESSIONAL_DEGREE = 'professional-degree',
  OTHER = 'other',
}

type CredentialOption<T extends string> = {
  value: T;
  label: string;
  labelAr: string;
  labelEn: string;
};

function option<T extends string>(
  value: T,
  label: string,
  labelEn: string,
): CredentialOption<T> {
  return { value, label, labelAr: label, labelEn };
}

export const CERTIFICATION_TYPES_METADATA = [
  option(CertificationType.COURSE, 'دورة تدريبية', 'Course'),
  option(CertificationType.SPECIALIZATION, 'تخصص', 'Specialization'),
  option(
    CertificationType.PROFESSIONAL_CERTIFICATE,
    'شهادة مهنية متعددة الدورات',
    'Professional Certificate',
  ),
  option(
    CertificationType.PROFESSIONAL_CERTIFICATION,
    'اعتماد مهني',
    'Professional Certification',
  ),
  option(CertificationType.LICENSE, 'رخصة مهنية', 'License'),
  option(CertificationType.BOOTCAMP, 'معسكر تدريبي', 'Bootcamp'),
  option(CertificationType.WORKSHOP, 'ورشة عمل', 'Workshop'),
  option(CertificationType.ATTENDANCE, 'شهادة حضور', 'Attendance'),
  option(CertificationType.DIPLOMA, 'دبلوم مهني', 'Diploma'),
  option(CertificationType.AWARD, 'جائزة أو تكريم', 'Award'),
  option(CertificationType.OTHER, 'أخرى', 'Other'),
] satisfies CredentialOption<CertificationType>[];

export const EDUCATION_DEGREE_TYPES_METADATA = [
  option(EducationDegreeType.HIGH_SCHOOL, 'ثانوية عامة', 'High School'),
  option(EducationDegreeType.DIPLOMA, 'دبلوم', 'Diploma'),
  option(EducationDegreeType.ASSOCIATE, 'درجة مشاركة', 'Associate Degree'),
  option(EducationDegreeType.BACHELOR, 'بكالوريوس', "Bachelor's Degree"),
  option(EducationDegreeType.MASTER, 'ماجستير', "Master's Degree"),
  option(EducationDegreeType.DOCTORATE, 'دكتوراه', 'Doctorate'),
  option(EducationDegreeType.POSTGRADUATE, 'دراسات عليا', 'Postgraduate'),
  option(
    EducationDegreeType.PROFESSIONAL_DEGREE,
    'درجة مهنية',
    'Professional Degree',
  ),
  option(EducationDegreeType.OTHER, 'أخرى', 'Other'),
] satisfies CredentialOption<EducationDegreeType>[];

export const CERTIFICATION_PLATFORM_SUGGESTIONS = [
  'Coursera',
  'Udemy',
  'edX',
  'LinkedIn Learning',
  'Google',
  'Microsoft Learn',
  'AWS Training and Certification',
  'Cisco Networking Academy',
  'Oracle University',
  'IBM SkillsBuild',
  'Meta',
  'freeCodeCamp',
  'Pluralsight',
  'DataCamp',
  'FutureLearn',
  'Other',
] as const;
