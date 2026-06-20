import { ArrowUpLeft, CalendarDays } from "lucide-react";
import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { nowConfig } from "@/config/now";

export default function NowPage() {
  const cards = [
    { title: "Current focus", items: nowConfig.focus },
    { title: "Learning", items: nowConfig.learning },
    { title: "Preferred projects", items: nowConfig.preferredProjects },
  ];

  return (
    <>
      <PageHeader
        title="ما أعمل عليه الآن"
        description="لقطة مختصرة عن تركيزي الحالي، ما أتعلمه، ونوع المشاريع التي أفضل العمل عليها."
        eyebrow="Now"
        routeLabel="~/now"
      />
      <Container className="py-12">
        <div className="mb-6 premium-card flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">الحالة الحالية</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">{nowConfig.availability}</h2>
          </div>
          <p dir="ltr" className="flex items-center gap-2 font-mono text-xs text-primary">
            <CalendarDays className="h-4 w-4" />
            updated: {nowConfig.lastUpdated}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((card) => (
            <article key={card.title} className="premium-card p-6">
              <h3 dir="ltr" className="font-mono text-base font-bold text-primary">
                {card.title}
              </h3>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
                {card.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-8 premium-card p-6 text-center">
          <h2 className="text-2xl font-bold text-foreground">لديك مشروع يناسب هذا التركيز؟</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-8 text-muted-foreground">
            أفضّل المشاريع التي تحتاج تفكيرًا في المنتج والهندسة معًا، من الواجهة إلى النشر.
          </p>
          <LinkButton href="/contact" className="mt-6 gap-2">
            تواصل الآن <ArrowUpLeft className="h-4 w-4" />
          </LinkButton>
        </div>
      </Container>
    </>
  );
}
