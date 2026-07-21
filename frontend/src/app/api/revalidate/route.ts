import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { siteConfig } from "@/config/site";
import { getAccessToken } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const token = await getAccessToken();
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const identity = await fetch(`${siteConfig.apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!identity.ok) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { tags } = (await request.json()) as { tags?: unknown };

    if (!Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json({ success: false, message: "Tags are required" }, { status: 400 });
    }

    if (!tags.every((tag) => typeof tag === "string" && tag.length > 0 && tag.length <= 100)) {
      return NextResponse.json({ success: false, message: "Invalid cache tags" }, { status: 400 });
    }

    for (const tag of tags) {
      revalidateTag(tag, {});
    }

    return NextResponse.json({ success: true, revalidated: tags });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Revalidation failed" }, { status: 500 });
  }
}
