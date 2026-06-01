import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, getRefreshToken } from "@/lib/auth/session";
import { siteConfig } from "@/config/site";

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    await fetch(`${siteConfig.apiUrl}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => undefined);
  }
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
