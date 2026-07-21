import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.text();
  const response = await fetch(`${siteConfig.apiUrl}/public/blog/posts/${encodeURIComponent(id)}/view`, {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": request.headers.get("user-agent") ?? "", "x-forwarded-for": request.headers.get("x-forwarded-for") ?? "" },
    body,
  });
  return new NextResponse(null, { status: response.ok ? 204 : response.status });
}
