import { Container } from "./Container";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  routeLabel?: string;
  children?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  routeLabel,
  children,
}: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-muted/20 py-12 md:py-16 tech-grid">
      {/* Ambient glows */}
      <div className="ambient-glow-strong -top-20 -left-20 opacity-30" />
      <div className="ambient-glow -bottom-10 -right-10 opacity-20" />
      
      {/* Decorative orbit ring */}
      <div className="orbit-ring w-[500px] h-[500px] -top-[200px] -right-[200px] absolute opacity-50" />
      
      <Container className="relative z-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            {eyebrow && (
              <div className="flex items-center gap-3">
                <p dir="ltr" className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary flex items-center gap-1.5 justify-start">
                  <span>{"//"}</span>
                  <span>{eyebrow}</span>
                </p>
                <div className="h-px w-16 bg-gradient-to-r from-primary/30 to-transparent" />
              </div>
            )}
            {routeLabel && (
              <div dir="ltr" className="inline-flex items-center gap-1.5 rounded bg-[#071019] px-2.5 py-1 font-mono text-xs text-muted-foreground/80 border border-border/40 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                {routeLabel}
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl text-foreground">{title}</h1>
            {description ? (
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8 mt-1">
                {description}
              </p>
            ) : null}
          </div>
          {children && <div className="mt-4 md:mt-0 flex shrink-0 items-center gap-2">{children}</div>}
        </div>
      </Container>
    </section>
  );
}
