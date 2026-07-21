import type { Certification, Education, Post, Profile, Project } from "@/lib/api/types";
import { absoluteUrl } from "@/lib/utils";

export function personJsonLd(profile?: Profile, socialUrls: string[] = []) {
  if (!profile) return undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    jobTitle: profile.title,
    url: absoluteUrl("/"),
    email: profile.email,
    sameAs: socialUrls,
  };
}

export function postJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.publishDate,
    image: post.featuredImage ?? post.coverImage,
    url: absoluteUrl(`/blog/${post.slug}`),
  };
}

export function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.shortDescription,
    url: absoluteUrl(`/projects/${project.slug}`),
    codeRepository: project.githubUrl,
    programmingLanguage: project.technologies,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; item: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((x, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": x.name,
      "item": absoluteUrl(x.item),
    })),
  };
}

export function certificationJsonLd(certification: Certification) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    name: certification.title,
    description: certification.description,
    credentialCategory: certification.type,
    recognizedBy: { "@type": "Organization", name: certification.issuer },
    url: absoluteUrl(`/certifications/${certification.slug}`),
    dateCreated: certification.issuedAt,
    image: certification.image ?? certification.issuerLogo,
  };
}

export function educationJsonLd(education: Education) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    name: education.degree,
    description: education.description,
    credentialCategory: education.degreeType,
    educationalLevel: education.degreeType,
    recognizedBy: { "@type": "EducationalOrganization", name: education.institution, url: education.institutionUrl },
    url: absoluteUrl(`/education/${education.slug}`),
    image: education.coverImage ?? education.institutionLogo,
  };
}
