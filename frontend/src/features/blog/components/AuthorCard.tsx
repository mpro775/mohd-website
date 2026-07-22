import type { PublicPostDetail } from "@/lib/api/types";

export function AuthorCard({ author }: { author: PublicPostDetail["author"] }) {
  const value = typeof author === "object" ? author : null;
  return <section className="rounded-xl border border-primary/20 bg-primary/5 p-5"><p className="text-xs font-bold text-primary">عن الكاتب</p><h2 className="mt-2 text-lg font-bold">{value?.name ?? "Mohd"}</h2>{value?.title ? <p className="mt-1 text-sm text-muted-foreground">{value.title}</p> : <p className="mt-1 text-sm text-muted-foreground">أوثّق هنا القرارات الهندسية والدروس المستفادة من بناء المنتجات الرقمية.</p>}</section>;
}
