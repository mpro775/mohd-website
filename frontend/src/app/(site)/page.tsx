import { Code2, Cpu, FileText, FolderGit2 } from "lucide-react";
import Link from "next/link";
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

  const availableBadgeText = profile?.availableForWork
    ? "available_for_work = true"
    : "currently_building = true";

  return (
    <>
      {profile ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(profile)) }} /> : null}
      <section className="relative overflow-hidden tech-grid border-b border-border">
        <Container className="grid min-h-[calc(100vh-4rem)] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10">
            <div dir="ltr" className="mb-4 inline-flex items-center">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
                {availableBadgeText}
              </span>
            </div>
            
            <p dir="ltr" className="mb-2 font-mono text-xs text-muted-foreground/60">{"// Full-stack developer crafting reliable web products"}</p>
            
            <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl tracking-tight">
              {profile?.fullName ?? "Mohd"}، <span className="bg-gradient-to-r from-primary via-emerald-400 to-secondary bg-clip-text text-transparent">{profile?.title ?? "Full-Stack Developer"}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-muted-foreground">
              {profile?.headline ?? profile?.bio ?? "أبني واجهات وتطبيقات ويب متينة باستخدام Next.js وNestJS مع تركيز واضح على تجربة المستخدم، الأداء، وقابلية الصيانة."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/contact">ابدأ مشروعًا</LinkButton>
              <LinkButton href="/projects" variant="terminal">استعرض المشاريع</LinkButton>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            {/* Ambient glows behind the code cards */}
            <div className="ambient-glow -top-12 -right-12 opacity-60" />
            <div className="ambient-glow -bottom-16 -left-16 opacity-40" />
            
            <div className="relative z-10 grid w-full gap-4">
              <TerminalCard
                lines={[
                  "npm run build",
                  "npm run typecheck",
                  "deploy --target production",
                ]}
                title="developer@mohd: ~"
                finalLine="production_status = stable"
              />
              <CodePreviewCard />
            </div>
          </div>
        </Container>
      </section>
      
      {/* Stats Section */}
      <Container className="py-14">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            { label: "سنوات خبرة", value: profile?.yearsOfExperience ?? 0, icon: Cpu },
            { label: "مشاريع", value: projects.meta?.total ?? projects.items.length, icon: FolderGit2 },
            { label: "مقالات", value: posts.meta?.total ?? posts.items.length, icon: FileText },
            { label: "تقنيات", value: technologies.length, icon: Code2 },
          ].map((stat) => {
            const val = stat.value;
            const displayValue = val > 0 ? `${val}+` : (val === 0 ? "—" : val);
            return (
              <div key={stat.label} className="tech-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_8px_24px_-8px_rgba(55,211,153,0.15)]">
                <stat.icon className="mb-4 h-5 w-5 text-primary" />
                <p className="text-3xl font-mono font-bold text-foreground">{displayValue}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </Container>

      {/* Way of Working Section */}
      <section className="border-t border-b border-border/50 bg-muted/5 py-16 tech-grid">
        <Container>
          <SectionHeader
            eyebrow="Workflow"
            title="طريقة عملي من الفكرة إلى الإطلاق"
            description="خطوات مدروسة وتنسيق كامل لضمان بناء وتوصيل منتجات ويب عالية الجودة."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-8">
            {[
              {
                num: "01",
                title: "Discover",
                desc: "أفهم المشكلة، الجمهور، والهدف.",
              },
              {
                num: "02",
                title: "Architect",
                desc: "أحدد البنية، قاعدة البيانات، والـ API.",
              },
              {
                num: "03",
                title: "Build",
                desc: "أنفذ Frontend و Backend بكود قابل للصيانة.",
              },
              {
                num: "04",
                title: "Ship",
                desc: "أختبر، أحسن الأداء، وأنشر.",
              },
            ].map((step) => (
              <div key={step.num} className="tech-card p-6 transition-all duration-300 hover:border-primary/40 hover:-translate-y-0.5">
                <span className="font-mono text-xs text-primary/70 font-semibold">{step.num}</span>
                <h3 dir="ltr" className="mt-2 font-mono text-lg font-bold text-foreground text-left">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Projects Section */}
      <Container className="py-16">
        <div className="flex items-center justify-between gap-4 mb-2">
          <SectionHeader eyebrow="Case Studies" title="مشاريع تقنية مختارة" description="ليست صوراً فقط، بل مشاكل وحلول وتقنيات ونتائج قابلة للفحص." />
          <Link href="/projects" className="text-xs font-semibold text-primary hover:underline underline-offset-4 shrink-0 transition-colors">
            عرض الكل &larr;
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </div>
      </Container>

      {/* Services Section */}
      <Container className="py-16 border-t border-border/40">
        <div className="flex items-center justify-between gap-4 mb-2">
          <SectionHeader eyebrow="Services" title="خدمات برمجية من الفكرة إلى الإطلاق" />
          <Link href="/services" className="text-xs font-semibold text-primary hover:underline underline-offset-4 shrink-0 transition-colors">
            عرض الكل &larr;
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {visibleServices.map((service) => <ServiceCard key={service.slug} service={service} />)}
        </div>
      </Container>

      {/* Stack Section */}
      <Container className="py-16 border-t border-border/40">
        <div className="flex items-center justify-between gap-4 mb-2">
          <SectionHeader eyebrow="Stack" title="Stack أستخدمه لبناء منتجات قابلة للصيانة" />
          <Link href="/technologies" className="text-xs font-semibold text-primary hover:underline underline-offset-4 shrink-0 transition-colors">
            عرض الكل &larr;
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {visibleTech.map((technology) => <TechnologyCard key={technology.slug} technology={technology} />)}
        </div>
      </Container>

      {/* Blog Section */}
      <Container className="py-16 border-t border-border/40">
        <div className="flex items-center justify-between gap-4 mb-2">
          <SectionHeader eyebrow="Blog" title="ملاحظات وتجارب من داخل التطوير" />
          <Link href="/blog" className="text-xs font-semibold text-primary hover:underline underline-offset-4 shrink-0 transition-colors">
            عرض الكل &larr;
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {posts.items.map((post) => <PostCard key={post.slug} post={post} />)}
        </div>
      </Container>

      {/* FAQ Section */}
      {faqs.items.length ? (
        <Container className="py-16 border-t border-border/40">
          <div className="flex items-center justify-between gap-4 mb-2">
            <SectionHeader eyebrow="FAQ" title="أسئلة شائعة" />
            <Link href="/faqs" className="text-xs font-semibold text-primary hover:underline underline-offset-4 shrink-0 transition-colors">
              عرض الكل &larr;
            </Link>
          </div>
          <FaqList faqs={faqs.items} />
        </Container>
      ) : null}
    </>
  );
}
