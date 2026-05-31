import Link from "next/link";
import { Container } from "@/components/common/Container";
import { publicApi } from "@/lib/api/public";

export async function SiteFooter() {
  const profile = await publicApi.profile().catch(() => null);
  return (
    <footer className="border-t border-border bg-card/40 py-10">
      <Container className="grid gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <p className="font-mono text-primary">Mohd.dev</p>
          <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
            {profile?.headline ?? "موقع شخصي تقني لمبرمج Full-Stack يركز على بناء منتجات ويب واضحة وقابلة للصيانة."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {profile?.socialLinks?.map((link) => (
            <Link key={`${link.platform}-${link.url}`} href={link.url} target="_blank" className="text-sm text-muted-foreground hover:text-primary">
              {link.platform}
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
}
