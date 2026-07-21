import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { siteConfig } from "@/config/site";
import { getAccessToken } from "@/lib/auth/session";

async function authorized(request: NextRequest): Promise<boolean> {
  const expected = process.env.REVALIDATION_SECRET;
  const supplied = request.headers.get("x-revalidation-secret");
  if (expected && supplied && supplied === expected) return true;
  const token = await getAccessToken();
  if (!token) return false;
  const identity = await fetch(`${siteConfig.apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  return identity.ok;
}

export async function POST(request: NextRequest) {
  try {
    if (!(await authorized(request))) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { tags } = await request.json() as { tags?: unknown };
    if (!Array.isArray(tags) || !tags.length || tags.length > 100 || !tags.every((tag) => typeof tag === "string" && /^blog(?::[a-z0-9_-]+){0,2}$/i.test(tag))) return NextResponse.json({ success: false, message: "Invalid cache tags" }, { status: 400 });
    for (const tag of new Set(tags as string[])) revalidateTag(tag, {});
    if (tags.includes("blog:sitemap")) revalidatePath("/sitemap.xml");
    if (tags.includes("blog:rss")) revalidatePath("/rss.xml");
    return NextResponse.json({ success: true, revalidated: [...new Set(tags)] });
  } catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Revalidation failed" }, { status: 500 }); }
}
