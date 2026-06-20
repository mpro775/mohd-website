import { CheckCircle2, Clock, Lightbulb } from "lucide-react";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { publicApi } from "@/lib/api/public";

export default async function ContactPage() {
  const profile = await publicApi.profile().catch(() => null);

  return (
    <>
      <PageHeader
        title="ابدأ مشروعًا واضح النطاق"
        description="حوّل فكرتك أو مشكلتك إلى رسالة استشارة منظمة، بدون تغيير طريقة الإرسال أو الاعتماد على حقول جديدة في الباك إند."
        eyebrow="Contact"
        routeLabel="~/contact"
      />
      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_380px]">
        <ContactForm />

        <aside className="h-fit space-y-5">
          <div className="premium-card p-6">
            <h2 className="text-xl font-bold text-foreground">قبل أن تراسلني</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
              <p className="flex gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                أفضل المشاريع عندي: SaaS / Dashboard / Full-stack / API.
              </p>
              <p className="flex gap-3">
                <Clock className="mt-1 h-4 w-4 shrink-0 text-primary" />
                الرد عادة خلال 24 ساعة عند توفر تفاصيل كافية.
              </p>
              <p className="flex gap-3">
                <Lightbulb className="mt-1 h-4 w-4 shrink-0 text-primary" />
                أفضل بداية: وصف المشكلة + الهدف + أي روابط أو أمثلة.
              </p>
            </div>
          </div>

          <div dir="ltr" className="terminal-surface terminal-scanline rounded-lg p-4 font-mono text-[11px] leading-6 text-muted-foreground">
            <p className="text-primary">$ contact --brief</p>
            <p>status: {profile?.availableForWork ? "available" : "currently_building"}</p>
            <p>response_time: within 24h</p>
            {profile?.email ? <p>email: {profile.email}</p> : null}
            {profile?.phone ? <p>phone: {profile.phone}</p> : null}
          </div>
        </aside>
      </Container>
    </>
  );
}
