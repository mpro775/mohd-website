import { apiRequest, normalizePaginated } from "./client";
import { getAccessToken } from "@/lib/auth/session";
import type { MediaItem, PaginationMeta } from "./types";

type Query = Record<string, string | number | boolean | undefined | null>;

async function token() {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error("Unauthorized");
  return accessToken;
}

export async function adminGet<T>(path: string, query?: Query) {
  return apiRequest<T>(path, { token: await token(), query, cache: "no-store" }).then((r) => r.data);
}

export async function adminList<T>(path: string, query?: Query) {
  const r = await apiRequest<T[], PaginationMeta>(path, { token: await token(), query, cache: "no-store" });
  return normalizePaginated<T>(r.data, r.meta);
}

export async function adminMutation<T>(path: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body?: unknown) {
  return apiRequest<T>(path, { method, token: await token(), body, cache: "no-store" }).then((r) => r.data);
}

export async function uploadMedia(formData: FormData) {
  return apiRequest<MediaItem>("/admin/media/upload", {
    method: "POST",
    token: await token(),
    body: formData,
    cache: "no-store",
  }).then((r) => r.data);
}
