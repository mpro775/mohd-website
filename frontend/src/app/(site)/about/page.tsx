import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { LinkButton } from "@/components/common/Button";
import { publicApi } from "@/lib/api/public";

export default async function AboutPage() {
  const profile = await publicApi.profile().catch(() => null);
  return (
    <>
      <PageHeader title="من أنا" description={profile?.headline ?? "نبذة مهنية عن طريقة عملي وخبرتي التقنية."} />
      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_320px]">
        <article className="rounded-lg border border-border bg-card p-6 leading-9 text-muted-foreground">
          <h2 className="mb-4 text-2xl font-bold text-foreground">{profile?.fullName}</h2>
          <p>{profile?.about ?? profile?.bio}</p>
        </article>
        <aside className="space-y-4 rounded-lg border border-border bg-card p-6">
          <p className="font-semibold">{profile?.title}</p>
          <p className="text-sm text-muted-foreground">{profile?.location}</p>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
          {profile?.cvFile ? <LinkButton href={profile.cvFile} variant="secondary">تحميل CV</LinkButton> : null}
          <div className="border-t border-border pt-4">
            <p className="mb-3 font-semibold">اللغات</p>
            {profile?.languages?.map((language) => <p key={language.name} className="text-sm text-muted-foreground">{language.name} - {language.level}</p>)}
          </div>
          <div className="border-t border-border pt-4">
            <p className="mb-3 font-semibold">الشهادات</p>
            {profile?.certificates?.map((certificate) => <p key={certificate.title} className="text-sm text-muted-foreground">{certificate.title}</p>)}
          </div>
        </aside>
      </Container>
    </>
  );
}
