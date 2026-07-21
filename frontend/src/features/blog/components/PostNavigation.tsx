import Link from "next/link";
import type { PostNavigation as Navigation } from "@/lib/api/types";

export function PostNavigation({ navigation }: { navigation?: Navigation }) {
  if (!navigation?.previous && !navigation?.next) return null;
  return <nav aria-label="التنقل بين المقالات" className="grid gap-3 sm:grid-cols-2">{navigation.previous ? <Link href={`/blog/${navigation.previous.slug}`} className="rounded-xl border border-border p-4 hover:border-primary"><span className="text-xs text-muted-foreground">المقال السابق</span><p className="mt-1 font-bold">{navigation.previous.title}</p></Link> : <span />}{navigation.next ? <Link href={`/blog/${navigation.next.slug}`} className="rounded-xl border border-border p-4 text-left hover:border-primary"><span className="text-xs text-muted-foreground">المقال التالي</span><p className="mt-1 font-bold">{navigation.next.title}</p></Link> : null}</nav>;
}
