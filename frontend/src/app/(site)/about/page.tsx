import Image from "next/image";
import { Mail, MapPin, Download, Globe, Award } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { LinkButton } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { publicApi } from "@/lib/api/public";

export default async function AboutPage() {
  const profile = await publicApi.profile().catch(() => null);
  
  return (
    <>
      <PageHeader 
        title="من أنا" 
        description={profile?.headline ?? "نبذة مهنية عن طريقة عملي وخبرتي التقنية."} 
        eyebrow="About"
        routeLabel="~/about"
      />
      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <article className="rounded-lg border border-border bg-card p-6 md:p-8 leading-9 text-muted-foreground">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              أبني منتجات ويب واضحة وقابلة للصيانة
            </h2>
            <p className="text-sm leading-8 text-muted-foreground whitespace-pre-line">
              {profile?.about ?? profile?.bio ?? "أنا مهندس برمجيات متخصص في تطوير تطبيقات الويب الكاملة (Full-Stack). أهتم بأدق التفاصيل البرمجية لضمان بناء كود نظيف وتصميم واجهات سلسة توفر أفضل تجربة للمستخدم النهائي."}
            </p>
          </article>

          {/* 3 Core Skill Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="tech-card p-5">
              <span className="font-mono text-xs text-primary font-bold">{"// FRONTEND"}</span>
              <h3 className="font-bold text-foreground mt-1.5 text-base">واجهات المستخدم</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-5">
                تطوير واجهات سريعة وتفاعلية متوافقة مع الجوال باستخدام React و Next.js و Tailwind CSS.
              </p>
            </div>
            <div className="tech-card p-5">
              <span className="font-mono text-xs text-primary font-bold">{"// BACKEND"}</span>
              <h3 className="font-bold text-foreground mt-1.5 text-base">البنية الخلفية</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-5">
                تصميم وتطوير APIs آمنة وقواعد بيانات متينة تعتمد على NestJS و Node.js و PostgreSQL.
              </p>
            </div>
            <div className="tech-card p-5">
              <span className="font-mono text-xs text-primary font-bold">{"// PERFORMANCE"}</span>
              <h3 className="font-bold text-foreground mt-1.5 text-base">الجودة والأداء</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-5">
                تطبيق مبادئ Clean Architecture و Clean Code لضمان قابلية صيانة وتوسع البرمجيات وسرعة الأداء.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Profile Card */}
        <aside className="h-fit space-y-6 rounded-lg border border-border bg-card p-6">
          {profile?.profileImage && (
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted shadow-sm select-none">
              <Image
                src={profile.profileImage}
                alt={profile.profileImageAlt ?? profile.fullName}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">{profile?.fullName}</h3>
              <p className="text-xs font-mono text-primary font-semibold mt-0.5" dir="ltr">{"// "}{profile?.title}</p>
            </div>

            <div className="space-y-2.5 text-xs text-muted-foreground border-t border-border/30 pt-3">
              {profile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <a href={`mailto:${profile.email}`} className="hover:text-primary transition-colors">
                    {profile.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {profile?.cvFile && (
            <LinkButton href={profile.cvFile} target="_blank" rel="noreferrer" className="w-full justify-center gap-1.5" size="md">
              <Download className="h-4 w-4" /> تحميل السيرة الذاتية (CV)
            </LinkButton>
          )}

          {/* Languages Section */}
          {profile?.languages?.length ? (
            <div className="border-t border-border/30 pt-4 space-y-3">
              <h4 className="font-mono text-xs font-semibold text-foreground uppercase flex items-center gap-1.5 justify-start">
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span>{"// Languages"}</span>
              </h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                {profile.languages.map((language) => (
                  <div key={language.name} className="flex justify-between items-center">
                    <span>{language.name}</span>
                    {language.level ? <StatusBadge value={language.level.toLowerCase()} /> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Certificates Section */}
          {profile?.certificates?.length ? (
            <div className="border-t border-border/30 pt-4 space-y-3">
              <h4 className="font-mono text-xs font-semibold text-foreground uppercase flex items-center gap-1.5 justify-start">
                <Award className="h-3.5 w-3.5 text-primary" />
                <span>{"// Certificates"}</span>
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {profile.certificates.map((cert) => (
                  <li key={cert.title} className="flex flex-col gap-0.5">
                    <span className="font-semibold text-foreground leading-5">{cert.title}</span>
                    {cert.issuer && <span className="text-[10px] text-muted-foreground/80">{cert.issuer}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </Container>
    </>
  );
}
