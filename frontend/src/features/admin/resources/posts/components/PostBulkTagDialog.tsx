"use client";

import { PostBulkCategoryDialog } from "./PostBulkCategoryDialog";

export function PostBulkTagDialog(props: Omit<Parameters<typeof PostBulkCategoryDialog>[0], "type">) {
  return <PostBulkCategoryDialog {...props} type="tag" />;
}
