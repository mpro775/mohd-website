import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useUnsavedChangesGuard(shouldBlock: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const bypassRef = useRef(false);

  const navigate = useCallback((url: string) => {
    if (shouldBlock && !bypassRef.current) {
      setPendingUrl(url);
      setDialogOpen(true);
    } else {
      router.push(url);
    }
  }, [shouldBlock, router]);

  const confirmNavigation = useCallback(() => {
    setDialogOpen(false);
    bypassRef.current = true;
    if (pendingUrl) {
      if (pendingUrl === "history_back") {
        window.history.back();
      } else {
        router.push(pendingUrl);
      }
      setPendingUrl(null);
    }
  }, [pendingUrl, router]);

  const cancelNavigation = useCallback(() => {
    setDialogOpen(false);
    setPendingUrl(null);
  }, []);

  // Intercept local anchor clicks
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!shouldBlock || bypassRef.current) return;
      
      const target = event.target as Element;
      const anchor = target.closest("a");
      
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      
      const isInternal = href.startsWith("/") || href.startsWith(window.location.origin);
      if (!isInternal) return;

      const destination = href.startsWith("http") ? new URL(href).pathname + new URL(href).search : href;
      if (destination.split('#')[0] === pathname) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingUrl(destination);
      setDialogOpen(true);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [shouldBlock, pathname]);

  // Popstate interceptor for back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (!shouldBlock || bypassRef.current) return;
      
      // Prevent URL change by pushing the original path back
      window.history.pushState(null, "", pathname);
      setPendingUrl("history_back");
      setDialogOpen(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [shouldBlock, pathname]);

  // Intercept beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldBlock && !bypassRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldBlock]);

  // Reset bypass if shouldBlock becomes false
  useEffect(() => {
    if (!shouldBlock) {
      bypassRef.current = false;
    }
  }, [shouldBlock]);

  return { navigate, confirmNavigation, cancelNavigation, pendingUrl, dialogOpen };
}
