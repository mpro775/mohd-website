import type { PublicPostListItem } from "@/lib/api/types";
import { PostCard } from "./PostCard";

export function RelatedPosts({ posts }: { posts: PublicPostListItem[] }) {
  if (!posts.length) return null;
  return <section><h2 className="mb-5 text-2xl font-black">مقالات ذات صلة</h2><div className="grid gap-5 md:grid-cols-3">{posts.map((post) => <PostCard key={post.slug} post={post} />)}</div></section>;
}
