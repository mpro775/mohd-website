import { Container } from "./Container";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <section className="border-b border-border bg-muted/30 py-12">
      <Container>
        <h1 className="text-3xl font-bold md:text-5xl">{title}</h1>
        {description ? <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">{description}</p> : null}
      </Container>
    </section>
  );
}
