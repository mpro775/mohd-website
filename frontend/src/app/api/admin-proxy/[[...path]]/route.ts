import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { ACCESS_COOKIE, REFRESH_COOKIE, getAccessToken, getRefreshToken } from "@/lib/auth/session";

type ProxyContext = { params: Promise<{ path?: string[] }> };

function authHeaders(request: Request, token: string, isFormData: boolean) {
  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.delete("host");
  if (isFormData) headers.delete("content-type");
  return headers;
}

async function refreshTokens(): Promise<{ accessToken: string; refreshToken?: string } | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  const response = await fetch(`${siteConfig.apiUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) return null;
  const accessToken = payload.data?.accessToken ?? payload.data?.access_token;
  const nextRefreshToken = payload.data?.refreshToken ?? payload.data?.refresh_token;
  return typeof accessToken === "string" ? { accessToken, refreshToken: typeof nextRefreshToken === "string" ? nextRefreshToken : undefined } : null;
}

async function proxy(request: Request, { params }: ProxyContext) {
  let token = await getAccessToken();
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { path = [] } = await params;
  const incomingUrl = new URL(request.url);
  const target = new URL(`${siteConfig.apiUrl}/${path.join("/")}`);
  incomingUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));

  const isFormData = request.headers.get("content-type")?.includes("multipart/form-data") ?? false;
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : isFormData ? await request.formData() : await request.text();

  const send = (bearer: string) =>
    fetch(target, {
      method: request.method,
      headers: authHeaders(request, bearer, isFormData),
      body,
      cache: "no-store",
    });

  let response = await send(token);
  let refreshed: Awaited<ReturnType<typeof refreshTokens>> = null;
  if (response.status === 401) {
    refreshed = await refreshTokens();
    if (refreshed?.accessToken) {
      token = refreshed.accessToken;
      response = await send(token);
    }
  }

  const contentType = response.headers.get("content-type") ?? "application/json";
  const payload = contentType.includes("application/json") ? await response.json().catch(() => ({})) : await response.text();
  const next = NextResponse.json(payload, { status: response.status });

  if (refreshed?.accessToken) {
    next.cookies.set(ACCESS_COOKIE, refreshed.accessToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 30 });
  }
  if (refreshed?.refreshToken) {
    next.cookies.set(REFRESH_COOKIE, refreshed.refreshToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  }
  if (response.status === 401) {
    next.cookies.delete(ACCESS_COOKIE);
    next.cookies.delete(REFRESH_COOKIE);
  }

  return next;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
