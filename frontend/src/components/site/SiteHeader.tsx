"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Menu, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { siteNav } from "@/config/nav";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-300",
        scrolled
          ? "border-border/60 bg-background/82 shadow-[0_1px_20px_-12px_var(--glow-primary)] backdrop-blur-xl"
          : "border-border bg-background/92 backdrop-blur-md",
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <Container className={cn("transition-all duration-300", scrolled ? "h-14" : "h-16")}>
        <div dir="ltr" className="flex items-center justify-between w-full h-full">
          <Link href="/" className="group flex items-center gap-2 font-mono text-lg font-bold text-primary">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span dir="ltr" className="transition-colors group-hover:text-foreground">
              &lt;Mohd.dev /&gt;
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" dir="rtl">
            {siteNav.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-md px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
                    active ? "text-primary" : "hover:text-foreground",
                  )}
                >
                  {item.label}
                  {active ? <span className="absolute inset-x-2 -bottom-[13px] h-0.5 rounded-full bg-primary" /> : null}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LinkButton href="/contact" variant="terminal" size="sm" className="gap-2 font-semibold flex-row-reverse">
              <Send className="h-4 w-4 text-primary" />
              <span>تواصل معي</span>
            </LinkButton>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:text-primary"
            >
              <Code2 className="h-4 w-4" />
            </a>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:border-primary/30 hover:text-foreground focus:outline-none"
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Container>

      {open ? (
        <div className="border-t border-border bg-card/95 shadow-lg backdrop-blur-xl md:hidden">
          <Container className="grid min-h-[calc(100dvh-3.5rem)] content-between gap-6 py-5">
            <nav className="grid gap-2">
              {siteNav.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg border border-transparent px-4 py-3 text-base font-medium text-muted-foreground transition hover:border-border hover:text-foreground",
                      active && "border-primary/30 bg-primary/10 text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <LinkButton href="/contact" className="w-full" onClick={() => setOpen(false)}>
              ابدأ مشروعًا
            </LinkButton>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
