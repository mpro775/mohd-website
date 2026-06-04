"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { siteNav } from "@/config/nav";
import { cn } from "@/lib/utils";
import { Container } from "@/components/common/Container";
import { LinkButton } from "@/components/common/Button";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-mono text-lg font-bold text-primary">
          <span dir="ltr">&lt;Mohd.dev /&gt;</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
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
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground",
                  isActive && "bg-muted text-foreground",
                )}
              >
                {item.label}
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:text-foreground focus:outline-none"
            aria-label="فتح القائمة"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile Nav dropdown */}
      {open ? (
        <div className="border-t border-border bg-card md:hidden shadow-lg animate-in fade-in-50 duration-200">
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
                      isActive && "bg-muted/70 text-primary font-semibold",
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
