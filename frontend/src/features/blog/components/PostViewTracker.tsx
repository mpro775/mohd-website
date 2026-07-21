"use client";

import { useEffect } from "react";

export function PostViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const key = `blog:view:${postId}`;
    if (sessionStorage.getItem(key)) return;
    let elapsed = false;
    let sent = false;
    const send = () => {
      if (sent || !elapsed || document.visibilityState !== "visible") return;
      sent = true;
      const sessionKey = "blog:session";
      let sessionId = sessionStorage.getItem(sessionKey);
      if (!sessionId) { sessionId = crypto.randomUUID(); sessionStorage.setItem(sessionKey, sessionId); }
      const body = JSON.stringify({ sessionId, referrer: document.referrer || undefined });
      fetch(`/api/blog-view/${postId}`, { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => undefined);
      sessionStorage.setItem(key, "1");
    };
    const timer = window.setTimeout(() => { elapsed = true; send(); }, 3000);
    document.addEventListener("visibilitychange", send);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", send);
    };
  }, [postId]);
  return null;
}
