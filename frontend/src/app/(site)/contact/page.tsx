import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { publicApi } from "@/lib/api/public";
import { ScrollReveal } from "@/components/site/home/ScrollReveal";

export default async function ContactPage() {
  const profile = await publicApi.profile().catch(() => null);
  
  return (
    <>
      <PageHeader 
        title="التواصل والتعاون" 
        description="للتعاون المهني، بناء منتج، تحسين أداء، أو استشارة تقنية." 
        eyebrow="Contact"
        routeLabel="~/contact"
      />
      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_380px] relative">
        {/* Background Ambient Glow */}
        <div className="ambient-glow -bottom-16 -left-16 opacity-75" />
        
        <ScrollReveal className="z-10">
          <ContactForm />
        </ScrollReveal>
        
        {/* Contact info and terminal board */}
        <ScrollReveal direction="left" delay={0.1} className="z-10">
          <aside className="h-fit space-y-6 glass-card p-6">
            <div className="space-y-4">
              <h3 className="font-mono text-xs font-semibold text-foreground uppercase border-b border-border/40 pb-2">{"// Contact Info"}</h3>
              
              <div className="space-y-3 text-sm">
                {profile?.email && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">البريد الإلكتروني:</span>
                    <a href={`mailto:${profile.email}`} className="font-semibold text-primary hover:underline underline-offset-4">
                      {profile.email}
                    </a>
                  </div>
                )}
                
                {profile?.phone && (
                  <div className="flex flex-col gap-1 border-t border-border/30 pt-3">
                    <span className="text-xs text-muted-foreground">الهاتف:</span>
                    <a href={`tel:${profile.phone}`} className="font-semibold text-foreground hover:text-primary transition-colors" dir="ltr">
                      {profile.phone}
                    </a>
                  </div>
                )}

                {profile?.location && (
                  <div className="flex flex-col gap-1 border-t border-border/30 pt-3">
                    <span className="text-xs text-muted-foreground">الموقع الحالي:</span>
                    <span className="font-semibold text-foreground">{profile.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Terminal Contact Card */}
            <div dir="ltr" className="rounded border border-border/60 bg-[#071019] p-4 font-mono text-[11px] leading-6 text-muted-foreground/90 select-none terminal-scanline">
              <p className="text-primary/80"><span className="text-primary font-semibold">$</span> contact --channel=email</p>
              <p className="text-muted-foreground/75"><span className="text-foreground">status</span>: {profile?.availableForWork ? "available" : "busy"}</p>
              <p className="text-muted-foreground/75"><span className="text-foreground">response_time</span>: within 24h</p>
              <p className="text-muted-foreground/75"><span className="text-foreground">stack</span>: Next.js / NestJS</p>
            </div>
          </aside>
        </ScrollReveal>
      </Container>
    </>
  );
}
