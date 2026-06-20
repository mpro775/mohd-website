import Image from "next/image";
import { Award, CheckCircle2, Globe, Mail, MapPin } from "lucide-react";
import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionHeader } from "@/components/common/SectionHeader";
import { brand } from "@/config/brand";
import { publicApi } from "@/lib/api/public";

const timeline = ["تعلم الأساسيات", "بناء واجهات", "بناء Backends", "بناء مشاريع Full-stack", "نشر وتحسين الإنتاج"];
const cares = ["Clean code", "UX clarity", "Performance", "Maintainability", "Deployment readiness"];

export default async function AboutPage() {
  const profile = await publicApi.profile().catch(() => null);

  return (
    <>
      <PageHeader
        title={profile?.fullName ?? brand.displayName}
        description={profile?.headline ?? profile?.bio ?? brand.arabicPositioning}
        eyebrow={profile?.title ?? brand.title}
        routeLabel="~/about"
      />
      <Container className="space-y-12 py-12">
        <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <article className="premium-card p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-bold text-foreground">أبني منتجات رقمية متماسكة</h2>
            <p className="whitespace-pre-line text-sm leading-8 text-muted-foreground">
              {profile?.about ?? profile?.bio ?? "أتعامل مع المنتج كنظام كامل: تجربة مستخدم واضحة، واجهة منظمة، API مفهوم، وبنية قابلة للصيانة والنشر."}
            </p>
          </article>
          <aside className="premium-card space-y-5 p-6">
            {profile?.profileImage ? (
              <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                <Image src={profile.profileImage} alt={profile.profileImageAlt ?? profile.fullName} fill className="object-cover" />
              </div>
            ) : null}
            <div>
              <h3 className="text-lg font-bold text-foreground">{profile?.fullName ?? brand.displayName}</h3>
              <p dir="ltr" className="mt-1 font-mono text-xs text-primary">{profile?.title ?? brand.title}</p>
            </div>
            {profile?.location ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-primary" />{profile.location}</p> : null}
            {profile?.email ? <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><Mail className="h-4 w-4 text-primary" />{profile.email}</a> : null}
          </aside>
        </section>

        <section>
          <SectionHeader eyebrow="Principles" title="My Engineering Principles" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {brand.principles.map((principle) => (
              <article key={principle.title} className="premium-card p-5">
                <CheckCircle2 className="mb-4 h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">{principle.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{principle.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="premium-card p-6 md:p-8">
          <SectionHeader eyebrow="Timeline" title="My Builder Timeline" />
          <div className="grid gap-3 md:grid-cols-5">
            {timeline.map((item, index) => (
              <div key={item} className="glass-panel p-4">
                <p dir="ltr" className="font-mono text-xs text-primary">0{index + 1}</p>
                <h3 className="mt-2 font-semibold text-foreground">{item}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="premium-card p-6">
            <SectionHeader eyebrow="Care" title="What I care about" />
            <div className="flex flex-wrap gap-2">
              {cares.map((item) => (
                <span key={item} dir="ltr" className="rounded-full border border-border bg-background/60 px-3 py-1.5 font-mono text-xs text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="premium-card p-6">
            <SectionHeader eyebrow="Profile" title="Languages / Certificates" />
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground"><Globe className="h-4 w-4 text-primary" />اللغات</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {profile?.languages?.length ? profile.languages.map((language) => (
                    <li key={language.name}>{language.name}{language.level ? ` - ${language.level}` : ""}</li>
                  )) : <li>تُضاف لاحقًا</li>}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground"><Award className="h-4 w-4 text-primary" />الشهادات</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {profile?.certificates?.length ? profile.certificates.map((cert) => (
                    <li key={cert.title}>{cert.title}{cert.issuer ? ` - ${cert.issuer}` : ""}</li>
                  )) : <li>تُضاف لاحقًا</li>}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="premium-card p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">خلينا نبني شيئًا حقيقيًا</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-8 text-muted-foreground">
            إن كان لديك مشروع يحتاج وضوحًا هندسيًا وتجربة استخدام جيدة، ابدأ برسالة مختصرة.
          </p>
          <LinkButton href="/contact" className="mt-6">ابدأ مشروعًا</LinkButton>
        </section>
      </Container>
    </>
  );
}
