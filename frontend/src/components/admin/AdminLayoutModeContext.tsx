"use client";

import { createContext, useContext } from "react";

export type AdminLayoutModeContextValue = {
  focusMode: boolean;
  setFocusMode: (enabled: boolean) => void;
};

export const AdminLayoutModeContext =
  createContext<AdminLayoutModeContextValue | null>(null);

export function useAdminLayoutMode() {
  const context = useContext(AdminLayoutModeContext);
  if (!context) {
    throw new Error("useAdminLayoutMode must be used inside AdminShell");
  }
  return context;
}
