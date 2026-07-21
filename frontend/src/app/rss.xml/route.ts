import { NextResponse } from "next/server";
import { publicApi } from "@/lib/api/public";
import { absoluteUrl } from "@/lib/utils";

function xml(value: string): string { return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]!); }

export async function GET() {
  const entries = await publicApi.seoEntries(1, 50).catch(() => ({ items: [] }));
  const posts = entries.items.filter((item) => item.type === "post" && item.publishedAt).slice(0, 50);
  const items = posts.map((post) => { const url = absoluteUrl(post.path); return `<item><title>${xml(post.title ?? "")}</title><link>${xml(url)}</link><guid isPermaLink="true">${xml(url)}</guid><description>${xml(post.description ?? "")}</description><pubDate>${new Date(post.publishedAt!).toUTCString()}</pubDate></item>`; }).join("");
  const lastBuildDate = posts[0]?.publishedAt ? new Date(posts[0].publishedAt).toUTCString() : new Date(0).toUTCString();
  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Mohd.dev Blog</title><link>${xml(absoluteUrl("/blog"))}</link><description>مدونة تقنية وهندسية</description><language>ar</language><lastBuildDate>${lastBuildDate}</lastBuildDate>${items}</channel></rss>`;
  return new NextResponse(xmlBody, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600" } });
}
