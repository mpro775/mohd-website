import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { getAccessToken } from "@/lib/auth/session";

export async function GET() {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const response = await fetch(`${siteConfig.apiUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  return NextResponse.json(payload, { status: response.status });
}
