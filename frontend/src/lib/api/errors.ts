import type { ApiFieldError } from "./types";

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;
  raw?: unknown;

  constructor(message: string, statusCode = 500, raw?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.raw = raw;
  }
}

export function normalizeFieldErrors(errors: unknown) {
  if (!Array.isArray(errors)) return undefined;
  return errors.reduce<Record<string, string[]>>((acc, item: ApiFieldError) => {
    const field = item.field ?? "root";
    acc[field] = [...(acc[field] ?? []), item.message ?? "خطأ غير معروف"];
    return acc;
  }, {});
}
