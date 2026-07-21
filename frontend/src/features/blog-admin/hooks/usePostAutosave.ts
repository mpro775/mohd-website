"use client";

import { useEffect, useRef, useState } from "react";

export type AutosaveState = "idle" | "dirty" | "saving" | "saved" | "error" | "conflict";

export function usePostAutosave(options: {
  enabled: boolean;
  fingerprint: string;
  save: () => Promise<void>;
  delay?: number;
}) {
  const { enabled, fingerprint, save, delay = 12_000 } = options;
  const [state, setState] = useState<AutosaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const previous = useRef(fingerprint);
  const saveRef = useRef(save);
  useEffect(() => { saveRef.current = save; }, [save]);
  useEffect(() => {
    if (!enabled || fingerprint === previous.current) return;
    setState("dirty");
    const timer = window.setTimeout(async () => {
      setState("saving");
      try {
        await saveRef.current();
        previous.current = fingerprint;
        setSavedAt(new Date());
        setState("saved");
      } catch (error: any) {
        if (error?.statusCode !== 409 && (!error?.statusCode || error.statusCode >= 500)) {
          try {
            await new Promise((resolve) => window.setTimeout(resolve, 2000));
            await saveRef.current();
            previous.current = fingerprint;
            setSavedAt(new Date());
            setState("saved");
            return;
          } catch (retryError: any) {
            setState(retryError?.statusCode === 409 ? "conflict" : "error");
            return;
          }
        }
        setState(error?.statusCode === 409 ? "conflict" : "error");
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [delay, enabled, fingerprint]);
  const markSaved = () => { previous.current = fingerprint; setSavedAt(new Date()); setState("saved"); };
  return { state, savedAt, markSaved, setState };
}
