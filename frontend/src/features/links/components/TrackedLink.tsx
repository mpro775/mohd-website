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
      className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition hover:border-primary/50"
    >
      <span>
        <span className="block font-semibold">{link.title}</span>
        {link.description ? <span className="mt-1 block text-sm text-muted-foreground">{link.description}</span> : null}
      </span>
      <ExternalLink className="h-4 w-4 text-primary" />
    </Link>
  );
}
