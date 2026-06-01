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
  response.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  response.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return response;
}
