export const siteConfig = {
  name: "Mohd",
  title: "Software Engineer / Full-Stack Developer",
  description:
    "موقع شخصي تقني لمبرمج يعرض المشاريع، المقالات، الخدمات، والخبرة العملية.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001",
  apiUrl: process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
};
