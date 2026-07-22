import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { siteConfig } from "@/config/site";
import { getAccessToken } from "@/lib/auth/session";

const TAG_RE = /^[\p{L}\p{N}_:-]+$/u;
const PATH_RE = /^\/[\p{L}\p{N}\/_.:%-]*$/u;

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

    const { tags, paths } = (await request.json()) as { tags?: unknown; paths?: unknown };

    const validTags = Array.isArray(tags) && tags.length <= 100 && tags.every((t) => typeof t === "string" && TAG_RE.test(t));
    const validPaths = Array.isArray(paths) && paths.length <= 50 && paths.every((p) => typeof p === "string" && PATH_RE.test(p));

    const hasTags = Array.isArray(tags) && tags.length > 0;
    const hasPaths = Array.isArray(paths) && paths.length > 0;

    if (!hasTags && !hasPaths) return NextResponse.json({ success: false, message: "At least one tag or path is required" }, { status: 400 });
    if (hasTags && !validTags) return NextResponse.json({ success: false, message: "Invalid cache tags" }, { status: 400 });
    if (hasPaths && !validPaths) return NextResponse.json({ success: false, message: "Invalid paths" }, { status: 400 });

    const revalidatedTags: string[] = [];
    const revalidatedPaths: string[] = [];

    if (hasTags) {
      for (const tag of new Set(tags as string[])) { revalidateTag(tag, {}); revalidatedTags.push(tag); }
    }
    if (hasPaths) {
      for (const p of new Set(paths as string[])) { revalidatePath(p); revalidatedPaths.push(p); }
    }

    return NextResponse.json({ success: true, revalidatedTags, revalidatedPaths });
  } catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Revalidation failed" }, { status: 500 }); }
}
