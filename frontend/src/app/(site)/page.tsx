import { Code2, Cpu, FileText, FolderGit2 } from "lucide-react";
import { Container } from "@/components/common/Container";
import { SectionHeader } from "@/components/common/SectionHeader";
import { LinkButton } from "@/components/common/Button";
import { TerminalCard } from "@/components/common/TerminalCard";
import { CodePreviewCard } from "@/components/common/CodePreviewCard";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { PostCard } from "@/features/blog/components/PostCard";
import { ServiceCard } from "@/features/services/components/ServiceCard";
import { TechnologyCard } from "@/features/technologies/components/TechnologyCard";
import { FaqList } from "@/features/faqs/components/FaqList";
import { publicApi } from "@/lib/api/public";
import { personJsonLd } from "@/lib/seo/structured-data";

export default async function HomePage() {
  const [profile, projects, services, technologies, posts, faqs] = await Promise.all([
    publicApi.profile().catch(() => null),
    publicApi.projects({ limit: 6 }).catch(() => ({ items: [], meta: undefined })),
    publicApi.services().catch(() => []),
    publicApi.technologies().catch(() => []),
    publicApi.posts({ limit: 3 }).catch(() => ({ items: [], meta: undefined })),
    publicApi.faqs({ limit: 4, featured: true }).catch(() => ({ items: [], meta: undefined })),
  ]);
  const featuredProjects = projects.items.filter((project) => project.featured).slice(0, 6);
  const visibleProjects = featuredProjects.length ? featuredProjects : projects.items.slice(0, 6);
  const visibleServices = services.filter((service) => service.isFeatured).slice(0, 3).length
    ? services.filter((service) => service.isFeatured).slice(0, 3)
    : services.slice(0, 3);
  const visibleTech = technologies.filter((tech) => tech.highlighted).slice(0, 8).length
    ? technologies.filter((tech) => tech.highlighted).slice(0, 8)
    : technologies.slice(0, 8);

  return (
    <>
      {profile ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(profile)) }} /> : null}
      <section className="relative overflow-hidden tech-grid border-b border-border">
        <Container className="grid min-h-[calc(100vh-4rem)] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10">
            <p className="mb-4 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
              {profile?.availableForWork ? "متاح للتعاون والعمل" : "Software Engineer"}
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl tracking-tight">
              {profile?.fullName ?? "Mohd"}، <span className="bg-gradient-to-r from-primary via-emerald-400 to-secondary bg-clip-text text-transparent">{profile?.title ?? "Full-Stack Developer"}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-muted-foreground">
              {profile?.headline ?? profile?.bio ?? "أبني واجهات وتطبيقات ويب متينة باستخدام Next.js وNestJS مع تركيز واضح على تجربة المستخدم، الأداء، وقابلية الصيانة."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/contact">تواصل معي</LinkButton>
              <LinkButton href="/projects" variant="secondary">شاهد الأعمال</LinkButton>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            {/* Ambient glows behind the code cards */}
            <div className="ambient-glow -top-12 -right-12 opacity-60" />
            <div className="ambient-glow -bottom-16 -left-16 opacity-40" />
            
            <div className="relative z-10 grid w-full gap-4">
              <TerminalCard lines={["npm run build", "api.health() => ok", "ship({ quality: true })"]} />
              <CodePreviewCard />
            </div>
          </div>
        </Container>
      </section>
      <Container className="py-14">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "سنوات خبرة", value: profile?.yearsOfExperience ?? 0, icon: Cpu },
            { label: "مشاريع", value: projects.meta?.total ?? projects.items.length, icon: FolderGit2 },
            { label: "مقالات", value: posts.meta?.total ?? posts.items.length, icon: FileText },
            { label: "تقنيات", value: technologies.length, icon: Code2 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_8px_24px_-8px_rgba(55,211,153,0.1)]">
              <stat.icon className="mb-4 h-5 w-5 text-primary" />
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
      <Container className="py-12">
        <SectionHeader eyebrow="Case Studies" title="مشاريع تقنية مختارة" description="ليست صوراً فقط، بل مشاكل وحلول وتقنيات ونتائج قابلة للفحص." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </div>
      </Container>
      <Container className="py-12">
        <SectionHeader eyebrow="Services" title="خدمات برمجية واضحة" />
        <div className="grid gap-5 md:grid-cols-3">
          {visibleServices.map((service) => <ServiceCard key={service.slug} service={service} />)}
        </div>
      </Container>
      <Container className="py-12">
        <SectionHeader eyebrow="Stack" title="تقنيات أستخدمها عملياً" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {visibleTech.map((technology) => <TechnologyCard key={technology.slug} technology={technology} />)}
        </div>
      </Container>
      <Container className="py-12">
        <SectionHeader eyebrow="Blog" title="آخر المقالات التقنية" />
        <div className="grid gap-5 md:grid-cols-3">
          {posts.items.map((post) => <PostCard key={post.slug} post={post} />)}
        </div>
      </Container>
      {faqs.items.length ? (
        <Container className="py-12">
          <SectionHeader eyebrow="FAQ" title="أسئلة شائعة" />
          <FaqList faqs={faqs.items} />
        </Container>
      ) : null}
    </>
  );
}
