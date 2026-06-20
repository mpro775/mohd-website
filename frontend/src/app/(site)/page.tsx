import { ArrowUpLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ArchitectureConsole } from "@/components/site/home/ArchitectureConsole";
import { EngineeringProcess } from "@/components/site/home/EngineeringProcess";
import {
  HeroBadge,
  HeroContent,
  HeroParticles,
  HeroTypingSubtitle,
  HeroVisual,
} from "@/components/site/home/HeroSection";
import { ProofStrip } from "@/components/site/home/ProofStrip";
import { ScrollReveal } from "@/components/site/home/ScrollReveal";
import { StatsGrid } from "@/components/site/home/StatsGrid";
import { brand } from "@/config/brand";
import { PostCard } from "@/features/blog/components/PostCard";
import { FaqList } from "@/features/faqs/components/FaqList";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { ServiceCard } from "@/features/services/components/ServiceCard";
import { TechnologyCard } from "@/features/technologies/components/TechnologyCard";
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

  const visibleProjects = projects.items.filter((project) => project.featured).slice(0, 6).length
    ? projects.items.filter((project) => project.featured).slice(0, 6)
    : projects.items.slice(0, 6);
  const visibleServices = services.filter((service) => service.isFeatured).slice(0, 3).length
    ? services.filter((service) => service.isFeatured).slice(0, 3)
    : services.slice(0, 3);
  const visibleTech = technologies.filter((tech) => tech.highlighted).slice(0, 8).length
    ? technologies.filter((tech) => tech.highlighted).slice(0, 8)
    : technologies.slice(0, 8);
  const isAvailable = profile?.availableForWork ?? false;

  return (
    <>
      {profile ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(profile)) }}
        />
      ) : null}

      <section className="relative overflow-hidden border-b border-border tech-grid">
        <div className="orbit-ring absolute -right-[200px] -top-[220px] h-[560px] w-[560px]" />
        <HeroParticles />
        <Container className="grid min-h-[calc(100svh-4rem)] items-center gap-10 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
          <HeroContent>
            <HeroBadge
              text={isAvailable ? brand.availabilityLabels.available : brand.availabilityLabels.building}
              isAvailable={isAvailable}
            />
            <HeroTypingSubtitle />
            <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
              أبني منتجات ويب كاملة من <span className="gradient-text">الواجهة إلى الإنتاج</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg md:leading-9">
              Full-Stack Developer أركز على بناء واجهات عالية الجودة، APIs واضحة، أنظمة قابلة للصيانة، وتجارب استخدام جاهزة للنشر.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/contact" size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                ابدأ مشروعًا
              </LinkButton>
              <LinkButton href="/projects" variant="terminal" size="lg">
                استعرض المشاريع
              </LinkButton>
            </div>
          </HeroContent>

          <HeroVisual>
            <div className="ambient-glow-strong -right-12 -top-12 opacity-50" />
            <ArchitectureConsole />
          </HeroVisual>
        </Container>
      </section>

      <ProofStrip />

      <Container className="py-14">
        <StatsGrid
          stats={[
            { label: "years_experience", value: profile?.yearsOfExperience ?? 0, iconName: "Cpu" },
            { label: "projects_shipped", value: projects.meta?.total ?? projects.items.length, iconName: "FolderGit2" },
            { label: "engineering_notes", value: posts.meta?.total ?? posts.items.length, iconName: "FileText" },
            { label: "trusted_stack", value: technologies.length, iconName: "Code2" },
          ]}
        />
      </Container>

      <EngineeringProcess />

      <Container className="py-14">
        <ScrollReveal>
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Case Studies"
              title="مشاريع تقنية مختارة"
              description="مشاريع تعرض المشكلة والحل والتقنيات والنتيجة بدل الاكتفاء بصورة نهائية."
              className="mb-0"
            />
            <Link href="/projects" className="shrink-0 text-xs font-semibold text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
        </ScrollReveal>
        {visibleProjects.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState title="لا توجد مشاريع بعد" description="ستظهر دراسات الحالة هنا عند نشر المشاريع العامة." />
        )}
      </Container>

      <section className="border-y border-border/50 bg-muted/5 py-14">
        <Container>
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Services"
              title="خدمات عملية لبناء منتجات رقمية قابلة للنشر"
              className="mb-0"
            />
            <Link href="/services" className="shrink-0 text-xs font-semibold text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
          {visibleServices.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {visibleServices.map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          ) : (
            <EmptyState title="لا توجد خدمات بعد" description="يمكنك التواصل مباشرة لطلب استشارة مخصصة." />
          )}
        </Container>
      </section>

      <Container className="py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <SectionHeader eyebrow="Toolbox" title="Stack أستخدمه لبناء منتجات قابلة للصيانة" className="mb-0" />
          <Link href="/technologies" className="shrink-0 text-xs font-semibold text-primary hover:underline">
            عرض الكل
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {visibleTech.map((technology) => (
            <TechnologyCard key={technology.slug} technology={technology} />
          ))}
        </div>
      </Container>

      <section className="border-y border-border/50 bg-muted/5 py-14">
        <Container>
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeader eyebrow="Engineering Notes" title="ملاحظات هندسية من واقع بناء المنتجات" className="mb-0" />
            <Link href="/blog" className="shrink-0 text-xs font-semibold text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
          {posts.items.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {posts.items.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState title="لا توجد مقالات بعد" description="ستظهر الملاحظات الهندسية هنا عند نشرها." />
          )}
        </Container>
      </section>

      {faqs.items.length ? (
        <Container className="py-14">
          <SectionHeader eyebrow="FAQ" title="أسئلة شائعة" />
          <FaqList faqs={faqs.items} />
        </Container>
      ) : null}

      <section className="relative overflow-hidden border-t border-border py-20 tech-grid">
        <div className="ambient-glow-strong left-1/2 top-1/2 opacity-40" />
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p dir="ltr" className="mx-auto mb-4 w-fit rounded-lg border border-border bg-[#071019] px-4 py-2 font-mono text-xs text-primary">
              {'init --project "your-next-idea"'}
            </p>
            <h2 className="text-3xl font-bold md:text-4xl">
              لديك فكرة؟ <span className="gradient-text">لنحولها إلى منتج حقيقي</span>
            </h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              ابدأ برسالة مختصرة عن المشكلة والهدف، وسأساعدك على تحويلها إلى نطاق واضح وخطة تنفيذ قابلة للنشر.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <LinkButton href="/contact" className="gap-2">
                تواصل الآن
              </LinkButton>
              <LinkButton href="/about" variant="terminal" className="gap-2">
                تعرف علي أكثر
                <ArrowUpLeft className="h-4 w-4" />
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
