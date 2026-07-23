import { ArrowLeft, ArrowUpLeft, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { SectionHeader } from "@/components/common/SectionHeader";
import { EngineeringProcess } from "@/components/site/home/EngineeringProcess";
import {
  HeroBadge,
  HeroContent,
  HeroParticles,
  HeroTypingSubtitle,
  HeroVisual,
  CodeTerminalCard,
  DeploymentCard,
  DatabaseSchemaCard,
  ApiStatusCard,
  WireframeGlobeWidget,
  FloatingCodeBadge,
} from "@/components/site/home/HeroSection";
import { ScrollReveal } from "@/components/site/home/ScrollReveal";
import { StatsGrid } from "@/components/site/home/StatsGrid";
import { PostCard } from "@/features/blog/components/PostCard";
import { FaqList } from "@/features/faqs/components/FaqList";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { ServiceCard } from "@/features/services/components/ServiceCard";
import { TechnologyCard } from "@/features/technologies/components/TechnologyCard";
import { FeaturedCertifications } from "@/features/certifications/components/FeaturedCertifications";
import { publicApi } from "@/lib/api/public";
import { personJsonLd } from "@/lib/seo/structured-data";

// techIcons and clientLogos removed in favor of dynamic visibleTech and clients from backend

export default async function HomePage() {
  const [profile, projects, services, technologies, posts, faqs, links, certifications, clients] = await Promise.all([
    publicApi.profile().catch(() => null),
    publicApi.projects({ limit: 6 }).catch(() => ({ items: [], meta: undefined })),
    publicApi.services().catch(() => []),
    publicApi.technologies().catch(() => []),
    publicApi.posts({ limit: 3 }).catch(() => ({ items: [], meta: undefined })),
    publicApi.faqs({ limit: 4, featured: true }).catch(() => ({ items: [], meta: undefined })),
    publicApi.links().catch(() => []),
    publicApi.certifications({ isFeatured: true, limit: 4 }).catch(() => ({ items: [], meta: undefined })),
    publicApi.clients().catch(() => []),
  ]);

  const socialUrls = links.filter((l) => l.category === "social").map((l) => l.url);
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(profile, socialUrls)) }}
        />
      ) : null}

      <section className="relative overflow-hidden border-b border-border tech-grid py-12 md:py-20">
        {/* Glow and orbit decoration */}
        <div className="orbit-ring absolute -right-[200px] -top-[220px] h-[560px] w-[560px] opacity-40" />
        <div className="ambient-glow absolute top-[-10%] right-[-10%] opacity-40" />
        <div className="ambient-glow absolute bottom-[-10%] left-[-10%] opacity-20" />
        <HeroParticles />

        <Container className="space-y-16">
          {/* Main Hero grid */}
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
            {/* Left Column: Wording & Actions */}
            <HeroContent>
              <HeroBadge text="Full-Stack • مطور" isAvailable={isAvailable} />
              <HeroTypingSubtitle />

              <h1 className="text-4xl font-extrabold leading-snug md:text-5xl lg:text-6xl text-foreground mt-4 text-right">
                أبني منتجات رقمية <br />
                كاملة من <span className="text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-gradient-shift">الفكرة إلى النشر</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg md:leading-9 text-right">
                أساعد الشركات وأصحاب الأفكار على تحويل رؤيتهم إلى منتجات ويب احترافية، سريعة، آمنة وقابلة للتوسع.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 items-center justify-center flex-row-reverse">
                <LinkButton href="/contact" variant="terminal" size="lg" className="gap-2.5 font-semibold flex-row-reverse border-primary/40 hover:border-primary">
                  <Send className="h-5 w-5 text-primary" />
                  <span>تواصل معي</span>
                </LinkButton>
                <LinkButton href="/projects" size="lg" className="gap-2.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
                  <span>شاهد مشاريعي</span>
                  <ArrowLeft className="h-5 w-5" />
                </LinkButton>
              </div>
            </HeroContent>

            {/* Right Column: Portrait and floating cards */}
            <HeroVisual>
              <div className="relative w-full max-w-[480px] aspect-[4/5] md:max-w-[520px] flex items-center justify-center">
                {/* Glow behind image */}
                <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-transparent to-transparent blur-3xl -z-10" />

                {/* Masked developer image */}
                <div className="relative w-full h-full overflow-hidden select-none pointer-events-none">
                  {/* Bottom fade overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                  <Image
                    src="/developer_hero.png"
                    alt="Mohd Developer"
                    width={600}
                    height={750}
                    className="w-full h-full object-contain origin-bottom rounded-2xl"
                    priority
                  />
                </div>

                {/* Floating Widgets - Left side of developer */}
                <div className="hidden lg:block absolute -left-24 top-[5%] z-20 scale-75 xl:scale-90 origin-left">
                  <CodeTerminalCard />
                </div>
                <div className="hidden md:block absolute -left-28 bottom-[15%] z-20 scale-75 xl:scale-90 origin-left">
                  <DeploymentCard />
                </div>
                <div className="hidden lg:block absolute -left-10 top-[45%] z-30 scale-75 xl:scale-90 origin-left">
                  <FloatingCodeBadge />
                </div>

                {/* Floating Widgets - Right side of developer */}
                <div className="hidden lg:block absolute -right-24 top-[10%] z-20 scale-75 xl:scale-90 origin-right">
                  <DatabaseSchemaCard />
                </div>
                <div className="hidden md:block absolute -right-28 top-[45%] z-20 scale-75 xl:scale-90 origin-right">
                  <ApiStatusCard />
                </div>
                <div className="hidden md:flex absolute -right-12 bottom-[5%] z-20 scale-75 xl:scale-90 origin-right">
                  <WireframeGlobeWidget />
                </div>
              </div>
            </HeroVisual>
          </div>

          {/* Stats Grid section */}
          <div className="pt-6">
            <StatsGrid
              stats={
                profile?.heroStats && profile.heroStats.length > 0
                  ? (profile.heroStats as any)
                  : [
                      { label: "مشروع مكتمل", value: 15, suffix: "+", iconName: "Rocket" },
                      { label: "سنوات خبرة", value: 3, suffix: "+", iconName: "Code2" },
                      { label: "عملاء سعداء", value: 10, suffix: "+", iconName: "Users" },
                      { label: "رضا العملاء", value: 99, suffix: "%", iconName: "Sparkles" },
                    ]
              }
            />
          </div>

          {/* Tech and clients section */}
          <div className="border-t border-border/40 pt-10 flex flex-col md:flex-row justify-between gap-10 items-start">
            {/* Tech stack */}
            <div className="flex flex-col items-start">
              <h3 className="text-xs font-mono font-bold text-success mb-4 text-start">
                أستخدم أحدث التقنيات
              </h3>
              <div className="flex flex-wrap gap-2.5 justify-start">
                {visibleTech.map((tech) => (
                  <div
                    key={tech.slug}
                    className="w-11 h-11 rounded-lg border border-border bg-card/60 flex items-center justify-center hover:border-primary/50 transition-colors shadow-md hover:shadow-primary/5 group relative overflow-hidden"
                    title={tech.name}
                  >
                    {tech.iconMedia ? (
                      <Image src={tech.iconMedia.url} alt={tech.name} fill className="object-contain p-2" />
                    ) : tech.icon ? (
                      <div dangerouslySetInnerHTML={{ __html: tech.icon }} className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full flex items-center justify-center" />
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground">{tech.name.substring(0, 3)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Client Logos */}
            <div className="flex flex-col items-start">
              <h3 className="text-xs font-mono font-bold text-muted-foreground mb-4 text-right">
                بعض العملاء الذين عملت معهم
              </h3>
              <div className="flex flex-wrap gap-4 items-center justify-start">
                {clients.map((client) => (
                  <div
                    key={client.name}
                    className="px-3.5 py-2.5 rounded-lg border border-border/60 bg-card/40 flex items-center gap-2 hover:border-primary/30 transition-colors"
                  >
                    {client.logoMedia ? (
                      <div className="relative w-4 h-4 shrink-0">
                        <Image src={client.logoMedia.url} alt={client.name} fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 shrink-0 bg-primary/20 rounded-full" />
                    )}
                    <div className="text-[10px] leading-tight text-foreground/80 font-bold select-none flex flex-col items-start font-sans">
                      <span>{client.arabicName}</span>
                      <span className="text-[7px] text-muted-foreground uppercase">{client.englishName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <EngineeringProcess />

      {certifications.items.length ? (
        <Container className="py-14">
          <FeaturedCertifications items={certifications.items.slice(0, 4)} title="تطور مهني موثّق" />
        </Container>
      ) : null}

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
