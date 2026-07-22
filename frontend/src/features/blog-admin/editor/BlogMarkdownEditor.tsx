"use client";

import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/common/State";

const ClientEditor = dynamic(() => import("./BlogMarkdownEditorClient"), {
  ssr: false,
  loading: () => <LoadingSkeleton className="h-[620px]" />,
});

export function BlogMarkdownEditor(props: {
  markdown: string;
  savedMarkdown: string;
  exportFileName?: string;
  onChange: (value: string) => void;
}) {
  return <ClientEditor {...props} />;
}
