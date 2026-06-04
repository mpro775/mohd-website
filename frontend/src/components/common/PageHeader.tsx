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
    <section className="relative overflow-hidden border-b border-border bg-muted/20 py-10 md:py-14 tech-grid">
      {/* Subtle ambient glow inside the header */}
      <div className="ambient-glow -top-20 -left-20 opacity-40" />
      
      <Container className="relative z-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            {eyebrow && (
              <p dir="ltr" className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary flex items-center gap-1.5 justify-start">
                <span>{"//"}</span>
                <span>{eyebrow}</span>
              </p>
            )}
            {routeLabel && (
              <div dir="ltr" className="inline-block rounded bg-[#071019] px-2 py-0.5 font-mono text-xs text-muted-foreground/80 border border-border/40 mb-1">
                {routeLabel}
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl text-foreground">{title}</h1>
            {description ? (
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8 mt-2">
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

