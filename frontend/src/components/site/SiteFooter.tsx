import Link from "next/link";
import { Container } from "@/components/common/Container";
import { publicApi } from "@/lib/api/public";
import { siteNav } from "@/config/nav";

export async function SiteFooter() {
  const profile = await publicApi.profile().catch(() => null);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-card/20 py-10 text-sm overflow-hidden">
      {/* Subtle tech-grid background */}
      <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />
      {/* Ambient glow */}
      <div className="ambient-glow -bottom-40 left-1/4 opacity-20" />
      
      <Container className="relative z-10 grid gap-8 md:grid-cols-[1.5fr_1fr_auto]">
        <div>
          <p className="font-mono text-primary font-bold text-lg">
            <span dir="ltr">&lt;Mohd.dev /&gt;</span>
          </p>
          <p className="mt-3 max-w-sm text-xs leading-7 text-muted-foreground">
            {profile?.headline ?? "موقع شخصي لمبرمج Full-Stack يركز على بناء منتجات ويب واضحة وقابلة للصيانة."}
          </p>
          <div dir="ltr" className="mt-4 rounded border border-border/40 bg-[#071019] px-3 py-2 font-mono text-[10px] text-muted-foreground/50 inline-block select-none">
            <p>{"/**"}</p>
            <p>{" * Built with Next.js, TypeScript,"}</p>
            <p>{" * and clean architecture."}</p>
            <p>{" * Crafted with ♥ and lots of ☕"}</p>
            <p>{" */"}</p>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs font-semibold text-foreground">{"// Navigation"}</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {siteNav.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="group text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="inline-block w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:w-3 group-hover:opacity-100 text-primary/60 font-mono" dir="ltr">{"->"}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs font-semibold text-foreground">{"// Connect"}</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:gap-y-2.5">
            {profile?.socialLinks?.map((link) => (
              <a 
                key={`${link.platform}-${link.url}`} 
                href={link.url} 
                target="_blank" 
                rel="noreferrer" 
                className="group text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="inline-block w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:w-3 group-hover:opacity-100 text-primary/60 font-mono" dir="ltr">{"->"}</span>
                {link.platform}
              </a>
            ))}
          </div>
        </div>
      </Container>
      
      <Container className="relative z-10 mt-10 border-t border-border/20 pt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-muted-foreground/50">
        <p>&copy; {currentYear} Mohd.dev. جميع الحقوق محفوظة.</p>
        <p dir="ltr" className="font-mono text-[10px] flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-primary/60 animate-pulse" />
          {"v1.0.0 // production_ready"}
        </p>
      </Container>
    </footer>
  );
}
