import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = await request.json();
  const response = await fetch(`${siteConfig.apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    return NextResponse.json(payload, { status: response.status });
  }

  const data = payload.data ?? {};
  const accessToken = data.accessToken ?? data.access_token ?? data.token;
  const refreshToken = data.refreshToken ?? data.refresh_token;
  const next = NextResponse.json({ success: true, user: data.user });
  if (accessToken) {
    next.cookies.set(ACCESS_COOKIE, accessToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 30 });
  }
  if (refreshToken) {
    next.cookies.set(REFRESH_COOKIE, refreshToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  }
  return next;
}
