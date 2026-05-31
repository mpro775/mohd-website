import { siteConfig } from "@/config/site";
import { ApiError, normalizeFieldErrors } from "./errors";
import type { ApiResponse, PaginationMeta } from "./types";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  next?: NextFetchRequestConfig;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path.replace(/^\/api/, ""), siteConfig.apiUrl.endsWith("/") ? siteConfig.apiUrl : `${siteConfig.apiUrl}/`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

export async function apiRequest<T, M = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta?: M; message: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  const requestBody = isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined;
  const response = await fetch(buildUrl(path, options.query), {
    ...options,
    headers,
    body: requestBody as BodyInit | undefined,
    signal: options.signal ?? controller.signal,
  }).finally(() => clearTimeout(timeout));

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as ApiResponse<T, M>)
    : undefined;

  if (!response.ok || payload?.success === false) {
    const error = new ApiError(
      payload?.message ?? `Request failed with ${response.status}`,
      payload?.statusCode ?? response.status,
      payload,
    );
    error.fieldErrors = normalizeFieldErrors(payload?.errors);
    throw error;
  }

  return {
    data: payload?.data as T,
    meta: payload?.meta,
    message: payload?.message ?? "تمت العملية",
  };
}

export function normalizePaginated<T>(data: unknown, meta?: PaginationMeta) {
  const items = Array.isArray(data)
    ? data
    : Array.isArray((data as { items?: unknown[] })?.items)
      ? (data as { items: unknown[] }).items
      : [];
  const resolvedMeta =
    meta ??
    (data as { meta?: PaginationMeta })?.meta ?? {
      total: items.length,
      page: 1,
      limit: items.length || 10,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };
  return { items: items as T[], meta: resolvedMeta };
}

export function itemId(item: { id?: string; _id?: string }) {
  return item.id ?? item._id ?? "";
}
