"use client";

import type { ApiResponse, PaginationMeta } from "./types";
import { ApiError, normalizeFieldErrors } from "./errors";

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Query;
}

// Build URL for the proxy
function buildProxyUrl(path: string, query?: Query) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`/api/admin-proxy/admin${normalizedPath}`, window.location.origin);
  
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

// Unified client-side api request that goes through the admin-proxy
export async function clientApiRequest<T, M = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; meta?: M; message: string }> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const requestBody = isFormData
    ? (options.body as FormData)
    : options.body
    ? JSON.stringify(options.body)
    : undefined;

  const response = await fetch(buildProxyUrl(path, options.query), {
    ...options,
    headers,
    body: requestBody,
  });

  // Handle unauthorized response
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login?expired=true";
    }
    throw new ApiError("انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى", 401);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as ApiResponse<T, M>)
    : undefined;

  if (!response.ok || payload?.success === false) {
    const error = new ApiError(
      payload?.message ?? `فشلت العملية (${response.status})`,
      payload?.statusCode ?? response.status,
      payload
    );
    error.fieldErrors = normalizeFieldErrors(payload?.errors);
    throw error;
  }

  return {
    data: payload?.data as T,
    meta: payload?.meta,
    message: payload?.message ?? "تمت العملية بنجاح",
  };
}

// Normalized paginated response helper
export function normalizeClientPaginated<T>(data: unknown, meta?: PaginationMeta) {
  const items = Array.isArray(data)
    ? data
    : Array.isArray((data as { items?: unknown[] })?.items)
    ? (data as { items: unknown[] }).items
    : [];

  const incomingMeta = meta ?? (data as { meta?: PaginationMeta })?.meta;
  const resolvedMeta = incomingMeta
    ? {
        ...incomingMeta,
        hasPreviousPage: incomingMeta.hasPreviousPage ?? incomingMeta.hasPrevPage ?? false,
      }
    : {
        total: items.length,
        page: 1,
        limit: items.length || 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

  return { items: items as T[], meta: resolvedMeta };
}

// Unified adminClient resource helper
export const adminClient = {
  // Read all items with pagination/search parameters
  listResource: async <T>(resource: string, query?: Query) => {
    const r = await clientApiRequest<T[], PaginationMeta>(`/${resource}`, { query });
    return normalizeClientPaginated<T>(r.data, r.meta);
  },

  // Read a single item by id
  getResource: async <T>(resource: string, id: string) => {
    const r = await clientApiRequest<T>(`/${resource}/${id}`);
    return r.data;
  },

  // Create a new item
  createResource: async <T>(resource: string, data: unknown) => {
    const r = await clientApiRequest<T>(`/${resource}`, {
      method: "POST",
      body: data,
    });
    return r;
  },

  // Update an existing item by id
  updateResource: async <T>(resource: string, id: string, data: unknown) => {
    const r = await clientApiRequest<T>(`/${resource}/${id}`, {
      method: "PUT",
      body: data,
    });
    return r;
  },

  // Patch an existing item by id or path
  patchResource: async <T>(resource: string, idOrPath: string, data?: unknown) => {
    const r = await clientApiRequest<T>(`/${resource}/${idOrPath}`, {
      method: "PATCH",
      body: data ?? {},
    });
    return r;
  },

  // Send a custom api request
  customRequest: async <T>(path: string, method: string, data?: unknown, query?: Query) => {
    const r = await clientApiRequest<T>(path, {
      method,
      body: data,
      query,
    });
    return r;
  },

  // Delete an item by id
  deleteResource: async <T>(resource: string, id: string) => {
    const r = await clientApiRequest<T>(`/${resource}/${id}`, {
      method: "DELETE",
    });
    return r;
  },

  // Reorder resources
  reorderResource: async (resource: string, items: { id: string; order: number }[]) => {
    const r = await clientApiRequest<unknown>(`/${resource}/reorder`, {
      method: "PATCH",
      body: { items },
    });
    return r;
  },

  // Apply bulk action (e.g. bulk delete, bulk publish)
  bulkAction: async <T>(resource: string, action: string, ids: string[], data?: unknown) => {
    const r = await clientApiRequest<T>(`/${resource}/bulk`, {
      method: "POST",
      body: { action, ids, data },
    });
    return r;
  },

  // Upload a media file
  uploadMedia: async <T>(file: File, folder: string, alt?: string, usage?: string) => {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);
    if (alt) {
      formData.set("alt", alt);
    }
    if (usage) {
      formData.set("usage", usage);
    }
    const r = await clientApiRequest<T>("/media/upload", {
      method: "POST",
      body: formData,
    });
    return r.data;
  },

  // Revalidate cache tags
  revalidate: async (tags: string[]) => {
    try {
      const secret = process.env.NEXT_PUBLIC_REVALIDATE_SECRET || "fallback-secret";
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, tags }),
      });
    } catch (e) {
      console.error("Failed to revalidate cache tags:", e);
    }
  },
};
