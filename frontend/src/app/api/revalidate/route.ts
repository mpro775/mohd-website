import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { secret, tags } = await request.json();

    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ success: false, message: "Invalid secret" }, { status: 401 });
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json({ success: false, message: "Tags are required" }, { status: 400 });
    }

    for (const tag of tags) {
      revalidateTag(tag, {});
    }

    return NextResponse.json({ success: true, revalidated: tags });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
