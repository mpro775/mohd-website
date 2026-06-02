import { describe, it, expect } from "vitest";
import { normalizeClientPaginated } from "./admin-client";
import { normalizeFieldErrors, ApiError } from "./errors";

describe("Admin Client Data Helpers", () => {
  describe("normalizeClientPaginated", () => {
    it("should normalize array items correctly", () => {
      const items = [{ id: "1" }, { id: "2" }];
      const normalized = normalizeClientPaginated(items);
      expect(normalized.items).toEqual(items);
      expect(normalized.meta.total).toBe(2);
      expect(normalized.meta.page).toBe(1);
    });

    it("should normalize object containing items correctly", () => {
      const payload = {
        items: [{ id: "1" }],
        meta: {
          total: 10,
          page: 2,
          limit: 1,
          totalPages: 10,
          hasNextPage: true,
          hasPrevPage: true,
        },
      };
      const normalized = normalizeClientPaginated(payload);
      expect(normalized.items).toEqual(payload.items);
      expect(normalized.meta.total).toBe(10);
      expect(normalized.meta.page).toBe(2);
    });
  });

  describe("normalizeFieldErrors", () => {
    it("should return undefined if errors is not an array", () => {
      expect(normalizeFieldErrors(null)).toBeUndefined();
      expect(normalizeFieldErrors("error")).toBeUndefined();
    });

    it("should group field errors correctly", () => {
      const errors = [
        { field: "title", message: "العنوان مطلوب" },
        { field: "title", message: "العنوان قصير جداً" },
        { field: "liveUrl", message: "الرابط غير صالح" },
        { field: undefined, message: "خطأ عام في النظام" },
      ];
      const normalized = normalizeFieldErrors(errors);
      expect(normalized).toBeDefined();
      expect(normalized?.title).toEqual(["العنوان مطلوب", "العنوان قصير جداً"]);
      expect(normalized?.liveUrl).toEqual(["الرابط غير صالح"]);
      expect(normalized?.root).toEqual(["خطأ عام في النظام"]);
    });
  });

  describe("ApiError class", () => {
    it("should instantiate with correct properties", () => {
      const err = new ApiError("خطأ ما", 400, { debug: true });
      expect(err.message).toBe("خطأ ما");
      expect(err.statusCode).toBe(400);
      expect(err.raw).toEqual({ debug: true });
      expect(err.name).toBe("ApiError");
    });
  });
});
