import { notFound } from "next/navigation";
import { Container } from "@/components/common/Container";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { siteConfig } from "@/config/site";
import { getAccessToken } from "@/lib/auth/session";
import type { AdminPostDetail } from "@/lib/api/types";

export default async function PostPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAccessToken();
  if (!token) notFound();
  const response = await fetch(`${siteConfig.apiUrl}/admin/blog/posts/${id}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) notFound();
  const payload = await response.json();
  const post = payload.data as AdminPostDetail;
  return <Container className="py-12"><div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">معاينة إدارية غير مفهرسة · الحالة: {post.status}</div><article className="mx-auto max-w-4xl"><h1 className="text-4xl font-black">{post.title}</h1><p className="mt-4 text-lg text-muted-foreground">{post.summary}</p><div className="mt-8 premium-card p-6"><MarkdownRenderer content={post.content} /></div></article></Container>;
}
