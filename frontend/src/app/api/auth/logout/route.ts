import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, getAccessToken } from "@/lib/auth/session";
import { siteConfig } from "@/config/site";

export async function POST() {
  const token = await getAccessToken();
  if (token) {
    await fetch(`${siteConfig.apiUrl}/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }).catch(() => undefined);
  }
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
