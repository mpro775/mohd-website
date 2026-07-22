"use client";

import { useState } from "react";
import type { AdminPostDetail } from "@/lib/api/types";

export function usePostConflict() {
  const [serverPost, setServerPost] = useState<AdminPostDetail | null>(null);
  const [localContent, setLocalContent] = useState("");
  return {
    serverPost,
    localContent,
    openConflict: (server: AdminPostDetail, local: string) => { setServerPost(server); setLocalContent(local); },
    closeConflict: () => { setServerPost(null); setLocalContent(""); },
  };
}
