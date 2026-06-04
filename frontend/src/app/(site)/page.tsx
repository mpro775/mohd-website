import { Code2, Sparkles, Search, Layers, Rocket, ArrowUpLeft } from "lucide-react";
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
import {
  HeroBadge,
  HeroTypingSubtitle,
  HeroParticles,
  HeroContent,
  HeroVisual,
} from "@/components/site/home/HeroSection";
import { StatsGrid } from "@/components/site/home/StatsGrid";
import { ScrollReveal } from "@/components/site/home/ScrollReveal";

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

  const isAvailable = profile?.availableForWork ?? false;
  const availableBadgeText = isAvailable
    ? "available_for_work = true"
    : "currently_building = true";

  const workflowSteps = [
    {
      num: "01",
      title: "Discover",
      desc: "أفهم المشكلة، الجمهور، والهدف.",
      icon: Search,
    },
    {
      num: "02",
      title: "Architect",
      desc: "أحدد البنية، قاعدة البيانات، والـ API.",
      icon: Layers,
    },
    {
      num: "03",
      title: "Build",
      desc: "أنفذ Frontend و Backend بكود قابل للصيانة.",
      icon: Code2,
    },
    {
      num: "04",
      title: "Ship",
      desc: "أختبر، أحسن الأداء، وأنشر.",
      icon: Rocket,
    },
  ];

  return (
    <>
      {profile ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(profile)) }} /> : null}
      
      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative overflow-hidden tech-grid border-b border-border">
        {/* Decorative orbit rings */}
        <div className="orbit-ring w-[600px] h-[600px] -top-[200px] -right-[200px] absolute" />
        <div className="orbit-ring w-[400px] h-[400px] -bottom-[100px] -left-[100px] absolute" style={{ animationDirection: "reverse", animationDuration: "25s" }} />
        
        <HeroParticles />
        
        <Container className="grid min-h-[calc(100vh-4rem)] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <HeroContent>
            <HeroBadge text={availableBadgeText} isAvailable={isAvailable} />
            
            <HeroTypingSubtitle />
            
            <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl tracking-tight">
              {profile?.fullName ?? "Mohd"}، <span className="gradient-text">{profile?.title ?? "Full-Stack Developer"}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-muted-foreground">
              {profile?.headline ?? profile?.bio ?? "أبني واجهات وتطبيقات ويب متينة باستخدام Next.js وNestJS مع تركيز واضح على تجربة المستخدم، الأداء، وقابلية الصيانة."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/contact">
                <Sparkles className="h-4 w-4 ml-1.5" />
                ابدأ مشروعًا
              </LinkButton>
              <LinkButton href="/projects" variant="terminal">استعرض المشاريع</LinkButton>
            </div>
          </HeroContent>

          <HeroVisual>
            {/* Ambient glows behind the code cards */}
            <div className="ambient-glow-strong -top-12 -right-12 opacity-50" />
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
          </HeroVisual>
        </Container>
      </section>
      
      {/* ═══════════════════ STATS SECTION ═══════════════════ */}
      <Container className="py-14">
        <StatsGrid
          stats={[
            { label: "سنوات خبرة", value: profile?.yearsOfExperience ?? 0, iconName: "Cpu" },
            { label: "مشاريع", value: projects.meta?.total ?? projects.items.length, iconName: "FolderGit2" },
            { label: "مقالات", value: posts.meta?.total ?? posts.items.length, iconName: "FileText" },
            { label: "تقنيات", value: technologies.length, iconName: "Code2" },
          ]}
        />
      </Container>

      {/* ═══════════════════ WORKFLOW SECTION ═══════════════════ */}
      <section className="border-t border-b border-border/50 bg-muted/5 py-16 tech-grid relative overflow-hidden">
        <div className="ambient-glow -top-32 left-1/2 -translate-x-1/2 opacity-30" />
        <Container className="relative z-10">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Workflow"
              title="طريقة عملي من الفكرة إلى الإطلاق"
              description="خطوات مدروسة وتنسيق كامل لضمان بناء وتوصيل منتجات ويب عالية الجودة."
            />
          </ScrollReveal>
          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-8">
            {/* Connecting line between steps */}
            <div className="hidden lg:block absolute top-1/2 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2 z-0" />
            
            {workflowSteps.map((step, index) => (
              <ScrollReveal key={step.num} delay={index * 0.1}>
                <div className="tech-card group relative p-6 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-primary/70 font-semibold">{step.num}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 transition-colors duration-300 group-hover:bg-primary/10 group-hover:border-primary/40">
                      <step.icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <h3 dir="ltr" className="mt-2 font-mono text-lg font-bold text-foreground text-left">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.desc}</p>
                  {/* Step number watermark */}
                  <span className="absolute bottom-3 left-4 font-mono text-6xl font-black text-primary/[0.04] select-none pointer-events-none" dir="ltr">
                    {step.num}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══════════════════ SECTION DIVIDER ═══════════════════ */}
      <div className="section-divider py-4">
        <span className="font-mono text-[10px] text-muted-foreground/40 select-none whitespace-nowrap" dir="ltr">
          {"{ projects }"}
        </span>
      </div>

      {/* ═══════════════════ PROJECTS SECTION ═══════════════════ */}
      <Container className="py-12">
        <ScrollReveal>
          <div className="flex items-center justify-between gap-4 mb-2">
            <SectionHeader eyebrow="Case Studies" title="مشاريع تقنية مختارة" description="ليست صوراً فقط، بل مشاكل وحلول وتقنيات ونتائج قابلة للفحص." />
            <Link href="/projects" className="text-xs font-semibold text-primary hover:underline underline-offset-4 shrink-0 transition-colors">
              عرض الكل &larr;
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project, idx) => (
            <ScrollReveal key={project.slug} delay={idx * 0.08}>
              <ProjectCard project={project} />
            </ScrollReveal>
          ))}
        </div>
      </Container>

      {/* ═══════════════════ SECTION DIVIDER ═══════════════════ */}
      <div className="section-divider py-4">
        <span className="font-mono text-[10px] text-muted-foreground/40 select-none whitespace-nowrap" dir="ltr">
          {"{ services }"}
        </span>
      </div>

      {/* ═══════════════════ SERVICES SECTION ═══════════════════ */}
      <Container className="py-12">
        <ScrollReveal>
          <div className="flex items-center justify-between gap-4 mb-2">
            <SectionHeader eyebrow="Services" title="خدمات برمجية من الفكرة إلى الإطلاق" />
            <Link href="/services" className="text-xs font-semibold text-primary hover:underline underline-offset-4 shrink-0 transition-colors">
              عرض الكل &larr;
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid gap-5 md:grid-cols-3">
          {visibleServices.map((service, idx) => (
            <ScrollReveal key={service.slug} delay={idx * 0.08}>
              <ServiceCard service={service} />
            </ScrollReveal>
          ))}
        </div>
      </Container>

      {/* ═══════════════════ SECTION DIVIDER ═══════════════════ */}
      <div className="section-divider py-4">
        <span className="font-mono text-[10px] text-muted-foreground/40 select-none whitespace-nowrap" dir="ltr">
          {"{ stack }"}
        </span>
      </div>

      {/* ═══════════════════ STACK SECTION ═══════════════════ */}
      <Container className="py-12">
        <ScrollReveal>
          <div className="flex items-center justify-between gap-4 mb-2">
            <SectionHeader eyebrow="Stack" title="Stack أستخدمه لبناء منتجات قابلة للصيانة" />
            <Link href="/technologies" className="text-xs font-semibold text-primary hover:underline underline-offset-4 shrink-0 transition-colors">
              عرض الكل &larr;
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {visibleTech.map((technology, idx) => (
            <ScrollReveal key={technology.slug} delay={idx * 0.06}>
              <TechnologyCard technology={technology} />
            </ScrollReveal>
          ))}
        </div>
      </Container>

      {/* ═══════════════════ SECTION DIVIDER ═══════════════════ */}
      <div className="section-divider py-4">
        <span className="font-mono text-[10px] text-muted-foreground/40 select-none whitespace-nowrap" dir="ltr">
          {"{ blog }"}
        </span>
      </div>

      {/* ═══════════════════ BLOG SECTION ═══════════════════ */}
      <Container className="py-12">
        <ScrollReveal>
          <div className="flex items-center justify-between gap-4 mb-2">
            <SectionHeader eyebrow="Blog" title="ملاحظات وتجارب من داخل التطوير" />
            <Link href="/blog" className="text-xs font-semibold text-primary hover:underline underline-offset-4 shrink-0 transition-colors">
              عرض الكل &larr;
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid gap-5 md:grid-cols-3">
          {posts.items.map((post, idx) => (
            <ScrollReveal key={post.slug} delay={idx * 0.08}>
              <PostCard post={post} />
            </ScrollReveal>
          ))}
        </div>
      </Container>

      {/* ═══════════════════ FAQ SECTION ═══════════════════ */}
      {faqs.items.length ? (
        <>
          <div className="section-divider py-4">
            <span className="font-mono text-[10px] text-muted-foreground/40 select-none whitespace-nowrap" dir="ltr">
              {"{ faq }"}
            </span>
          </div>
          <Container className="py-12">
            <ScrollReveal>
              <div className="flex items-center justify-between gap-4 mb-2">
                <SectionHeader eyebrow="FAQ" title="أسئلة شائعة" />
                <Link href="/faqs" className="text-xs font-semibold text-primary hover:underline underline-offset-4 shrink-0 transition-colors">
                  عرض الكل &larr;
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <FaqList faqs={faqs.items} />
            </ScrollReveal>
          </Container>
        </>
      ) : null}

      {/* ═══════════════════ CTA SECTION ═══════════════════ */}
      <section className="relative overflow-hidden border-t border-border py-20 tech-grid">
        <div className="ambient-glow-strong top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40" />
        <Container className="relative z-10">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center space-y-6">
              <div dir="ltr" className="terminal-surface mx-auto w-fit rounded-lg px-4 py-2 font-mono text-xs text-primary/90">
                <span className="text-primary font-semibold">$</span> init --project <span className="text-secondary">&quot;your-next-idea&quot;</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                لديك فكرة؟ <span className="gradient-text">لنبنيها معاً</span>
              </h2>
              <p className="text-muted-foreground leading-8">
                سواء كنت تبحث عن بناء منتج من الصفر، تحسين أداء تطبيق قائم، أو استشارة تقنية — أنا مستعد للتعاون.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <LinkButton href="/contact">
                  <Sparkles className="h-4 w-4 ml-1.5" />
                  تواصل الآن
                </LinkButton>
                <LinkButton href="/about" variant="terminal">
                  تعرّف عليّ أكثر
                  <ArrowUpLeft className="h-4 w-4 mr-1.5" />
                </LinkButton>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </>
  );
}
