"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { LinkItem } from "@/lib/api/types";
import { itemId } from "@/lib/api/client";

export function TrackedLink({ link }: { link: LinkItem }) {
  async function track() {
    const id = itemId(link);
    if (!id) return;
    fetch(`/api/links/${id}/click`, { method: "POST" }).catch(() => undefined);
  }

  return (
    <Link
      href={link.url}
      target={link.openInNewTab === false ? undefined : "_blank"}
      rel="noreferrer"
      onClick={track}
      className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_-8px_rgba(55,211,153,0.15)]"
    >
      <div className="space-y-1.5 text-right">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-foreground transition-colors group-hover:text-primary">
            {link.title}
          </span>
          {link.isFeatured && (
            <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary uppercase select-none">
              featured
            </span>
          )}
          {(link.platform || link.category) && (
            <span className="font-mono text-[9px] text-muted-foreground/60 uppercase select-none" dir="ltr">
              [{link.platform ?? link.category}]
            </span>
          )}
        </div>
        {link.description ? (
          <p className="text-xs leading-5 text-muted-foreground">{link.description}</p>
        ) : null}
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border bg-muted/50 text-muted-foreground transition group-hover:border-primary/30 group-hover:text-primary select-none">
        <ExternalLink className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}
