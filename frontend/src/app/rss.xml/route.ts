import { NextResponse } from "next/server";
import { publicApi } from "@/lib/api/public";
import { absoluteUrl } from "@/lib/utils";

export async function GET() {
  const posts = await publicApi.posts({ limit: 50 }).catch(() => ({ items: [] }));
  const items = posts.items
    .map((post) => `<item><title><![CDATA[${post.title}]]></title><link>${absoluteUrl(`/blog/${post.slug}`)}</link><description><![CDATA[${post.summary}]]></description><pubDate>${new Date(post.publishDate ?? Date.now()).toUTCString()}</pubDate></item>`)
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Mohd.dev Blog</title><link>${absoluteUrl("/")}</link><description>مدونة تقنية</description>${items}</channel></rss>`;
  return new NextResponse(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
