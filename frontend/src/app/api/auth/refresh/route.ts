import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, getRefreshToken } from "@/lib/auth/session";
import { siteConfig } from "@/config/site";

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const response = await fetch(`${siteConfig.apiUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok || payload.success === false) return NextResponse.json(payload, { status: response.status });
  const accessToken = payload.data?.accessToken ?? payload.data?.access_token;
  const nextRefreshToken = payload.data?.refreshToken ?? payload.data?.refresh_token;
  const next = NextResponse.json({ success: true });
  if (accessToken) next.cookies.set(ACCESS_COOKIE, accessToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 30 });
  if (nextRefreshToken) next.cookies.set(REFRESH_COOKIE, nextRefreshToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return next;
}
