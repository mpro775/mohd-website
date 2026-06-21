import Link from "next/link";
import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { brand } from "@/config/brand";
import { siteNav } from "@/config/nav";
import { publicApi } from "@/lib/api/public";

export async function SiteFooter() {
  const [profile, links] = await Promise.all([
    publicApi.profile().catch(() => null),
    publicApi.links().catch(() => []),
  ]);
  const socialLinks = links.filter((link) => link.category === "social");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border bg-card/20 py-12 text-sm">
      <div className="pointer-events-none absolute inset-0 tech-grid opacity-25" />
      <div className="ambient-glow -bottom-40 left-1/4 opacity-20" />

      <Container className="relative z-10 grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <p className="font-mono text-lg font-bold text-primary" dir="ltr">
            &lt;Mohd.dev /&gt;
          </p>
          <p className="max-w-md text-sm leading-7 text-muted-foreground">
            {profile?.headline ?? brand.arabicPositioning}
          </p>
          <div dir="ltr" className="inline-flex rounded-lg border border-border bg-[#071019] px-3 py-2 font-mono text-[11px] text-muted-foreground">
            {brand.signature}
          </div>
        </div>

        <div>
          <h3 dir="ltr" className="mb-4 font-mono text-xs font-semibold text-foreground">
            {"// Navigation"}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {siteNav.map((item) => (
              <Link key={item.href} href={item.href} className="text-xs text-muted-foreground transition hover:text-primary">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 dir="ltr" className="font-mono text-xs font-semibold text-foreground">
            {"// Status"}
          </h3>
          <p dir="ltr" className="flex items-center gap-2 font-mono text-[11px] text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {profile?.availableForWork ? brand.availabilityLabels.available : brand.availabilityLabels.building}
          </p>
          {socialLinks?.length ? (
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <a
                  key={`${link.platform || link.title}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  {link.title}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </Container>

      <Container className="relative z-10 mt-10 border-t border-border/25 pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-foreground">جاهز تبني مشروعك القادم؟</p>
            <p className="mt-1 text-xs text-muted-foreground">&copy; {currentYear} Mohd.dev. جميع الحقوق محفوظة.</p>
          </div>
          <LinkButton href="/contact" size="sm">
            تواصل الآن
          </LinkButton>
        </div>
      </Container>
    </footer>
  );
}
