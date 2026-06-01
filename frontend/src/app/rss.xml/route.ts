import { NextResponse } from "next/server";
import { publicApi } from "@/lib/api/public";
import { siteConfig } from "@/config/site";

export async function GET() {
  const posts = await publicApi.posts({ limit: 100 }).catch(() => ({ items: [] }));
  
  // Filter for published posts only
  const publishedPosts = posts.items.filter(post => post.status === "published");
  
  const siteUrl = siteConfig.siteUrl.endsWith("/") ? siteConfig.siteUrl.slice(0, -1) : siteConfig.siteUrl;

  const items = publishedPosts
    .map((post) => {
      const pubDate = new Date(post.publishDate ?? post.createdAt ?? Date.now()).toUTCString();
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <description><![CDATA[${post.summary}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid>${siteUrl}/blog/${post.slug}</guid>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name} - المدونة التقنية</title>
    <link>${siteUrl}</link>
    <description>${siteConfig.description}</description>
    <language>ar</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=18000",
    },
  });
}
export const dynamic = "force-dynamic";
