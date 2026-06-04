"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { siteNav } from "@/config/nav";
import { cn } from "@/lib/utils";
import { Container } from "@/components/common/Container";
import { LinkButton } from "@/components/common/Button";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-300",
        scrolled
          ? "border-border/60 bg-background/80 backdrop-blur-xl shadow-[0_1px_12px_-4px_rgba(55,211,153,0.08)]"
          : "border-border bg-background/90 backdrop-blur-md"
      )}
    >
      {/* Top gradient accent line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <Container className={cn("flex items-center justify-between transition-all duration-300", scrolled ? "h-14" : "h-16")}>
        <Link href="/" className="group font-mono text-lg font-bold text-primary flex items-center gap-1">
          <span dir="ltr" className="transition-colors group-hover:text-foreground">
            &lt;Mohd.dev /&gt;
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {siteNav.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  isActive && "text-foreground",
                )}
              >
                {item.label}
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute inset-x-1 -bottom-[13px] h-[2px] rounded-full bg-gradient-to-r from-primary/80 via-primary to-primary/80" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions section */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <LinkButton href="/contact" variant="terminal" size="sm">
            ابدأ مشروعًا
          </LinkButton>
        </div>

        {/* Mobile menu and toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:text-foreground hover:border-primary/30 focus:outline-none"
            aria-label="فتح القائمة"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile Nav dropdown */}
      {open ? (
        <div className="border-t border-border bg-card/95 backdrop-blur-xl md:hidden shadow-lg animate-in fade-in-50 duration-200">
          <Container className="grid gap-2 py-4">
            <nav className="grid gap-1">
              {siteNav.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:text-foreground",
                      isActive && "bg-primary/5 text-primary font-semibold border-r-2 border-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border/40 pt-3 mt-1">
              <LinkButton
                href="/contact"
                variant="terminal"
                className="w-full text-center"
                onClick={() => setOpen(false)}
              >
                ابدأ مشروعًا
              </LinkButton>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
