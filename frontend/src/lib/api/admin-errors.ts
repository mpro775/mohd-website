"use client";

import { toast } from "sonner";
import { ApiError } from "./errors";
import type { UseFormSetError, FieldValues, Path } from "react-hook-form";

// Normalized error interface
export interface NormalizedError {
  message: string;
  statusCode: number;
  fieldErrors?: Record<string, string[]>;
}

// Extract error details safely from any type of error
export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof ApiError) {
    return {
      message: error.message || "حدث خطأ أثناء الاتصال بالخادم",
      statusCode: error.statusCode,
      fieldErrors: error.fieldErrors,
    };
  }

  if (error instanceof Error) {
    // Check for standard network abort/timeout errors
    if (error.name === "AbortError" || error.message.includes("timeout")) {
      return {
        message: "انتهت مهلة الطلب، يرجى التحقق من اتصال الشبكة وإعادة المحاولة",
        statusCode: 408,
      };
    }
    return {
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    message: "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً",
    statusCode: 500,
  };
}

// Standard UI toast error handler
export function handleAdminError(error: unknown, fallbackMessage?: string) {
  const norm = normalizeError(error);
  
  // Custom toast triggers
  if (norm.statusCode === 401) {
    toast.error("انتهت الجلسة؛ جاري إعادة توجيهك لتسجيل الدخول...");
    return;
  }

  if (norm.statusCode === 403) {
    toast.error("عذراً، ليس لديك الصلاحيات الكافية لإتمام هذا الإجراء");
    return;
  }

  const displayMessage = fallbackMessage || norm.message;
  toast.error(displayMessage);
}

// Maps backend validation field errors directly to react-hook-form
export function setFormErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>
): boolean {
  const norm = normalizeError(error);
  
  if (norm.fieldErrors && Object.keys(norm.fieldErrors).length > 0) {
    Object.entries(norm.fieldErrors).forEach(([field, messages]) => {
      setError(field as Path<TFieldValues>, {
        type: "server",
        message: messages[0] || "خطأ في المدخلات",
      });
    });
    return true; // Successfully mapped validation errors
  }
  return false;
}
