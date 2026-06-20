import type { ReactNode } from "react";
import { Container } from "./Container";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  routeLabel?: string;
  children?: ReactNode;
};

export function PageHeader({ title, description, eyebrow, routeLabel, children }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-muted/15 py-12 tech-grid md:py-16">
      <div className="ambient-glow-strong -left-20 -top-20 opacity-30" />
      <div className="ambient-glow -bottom-10 -right-10 opacity-20" />
      <Container className="relative z-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            {eyebrow ? (
              <div className="flex items-center gap-3">
                <p dir="ltr" className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {`// ${eyebrow}`}
                </p>
                <div className="h-px w-16 bg-gradient-to-r from-primary/35 to-transparent" />
              </div>
            ) : null}
            {routeLabel ? (
              <div dir="ltr" className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-[#071019] px-2.5 py-1 font-mono text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {routeLabel}
              </div>
            ) : null}
            <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-normal text-foreground md:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="max-w-3xl text-sm leading-8 text-muted-foreground md:text-base md:leading-9">
                {description}
              </p>
            ) : null}
          </div>
          {children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
        </div>
      </Container>
    </section>
  );
}
