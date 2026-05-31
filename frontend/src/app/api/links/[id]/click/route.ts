import { NextResponse } from "next/server";
import { publicApi } from "@/lib/api/public";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await publicApi.trackLink(id);
  } catch {
    return NextResponse.json({ ok: false }, { status: 202 });
  }
  return NextResponse.json({ ok: true });
}
