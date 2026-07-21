"use client";

import { useState } from "react";
import type { Post } from "@/lib/api/types";

export function usePostConflict() {
  const [serverPost, setServerPost] = useState<Post | null>(null);
  const [localContent, setLocalContent] = useState("");
  return {
    serverPost,
    localContent,
    openConflict: (server: Post, local: string) => { setServerPost(server); setLocalContent(local); },
    closeConflict: () => { setServerPost(null); setLocalContent(""); },
  };
}
