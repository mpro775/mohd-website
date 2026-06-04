import Link from "next/link";
import { Container } from "@/components/common/Container";
import { publicApi } from "@/lib/api/public";
import { siteNav } from "@/config/nav";

export async function SiteFooter() {
  const profile = await publicApi.profile().catch(() => null);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/20 py-8 text-sm">
      <Container className="grid gap-6 md:grid-cols-[1.5fr_1fr_auto]">
        <div>
          <p className="font-mono text-primary font-bold">
            <span dir="ltr">&lt;Mohd.dev /&gt;</span>
          </p>
          <p className="mt-2 max-w-sm text-xs leading-6 text-muted-foreground">
            {profile?.headline ?? "موقع شخصي لمبرمج Full-Stack يركز على بناء منتجات ويب واضحة وقابلة للصيانة."}
          </p>
          <p dir="ltr" className="mt-2 font-mono text-[10px] text-muted-foreground/60">
            {"// Built with Next.js, TypeScript, and clean architecture."}
          </p>
        </div>
        
        {/* Quick Links */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-semibold text-foreground">{"// Navigation"}</span>
          <div className="grid grid-cols-2 gap-2">
            {siteNav.map((item) => (
              <Link key={item.href} href={item.href} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-semibold text-foreground">{"// Connect"}</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 md:flex-col md:gap-y-2">
            {profile?.socialLinks?.map((link) => (
              <a key={`${link.platform}-${link.url}`} href={link.url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {link.platform}
              </a>
            ))}
          </div>
        </div>
      </Container>
      
      <Container className="mt-8 border-t border-border/20 pt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-xs text-muted-foreground/60">
        <p>&copy; {currentYear} Mohd.dev. جميع الحقوق محفوظة.</p>
        <p dir="ltr" className="font-mono text-[10px]">{"v1.0.0 // production_ready"}</p>
      </Container>
    </footer>
  );
}
