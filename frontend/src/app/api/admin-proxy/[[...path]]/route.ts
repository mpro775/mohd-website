import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { getAccessToken } from "@/lib/auth/session";

async function proxy(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { path = [] } = await params;
  const incomingUrl = new URL(request.url);
  const target = new URL(`${siteConfig.apiUrl}/${path.join("/")}`);
  incomingUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));

  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.delete("host");

  const isFormData = request.headers.get("content-type")?.includes("multipart/form-data");
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : isFormData ? await request.formData() : await request.text();
  const response = await fetch(target, { method: request.method, headers, body, cache: "no-store" });
  const contentType = response.headers.get("content-type") ?? "application/json";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  return NextResponse.json(payload, { status: response.status });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
