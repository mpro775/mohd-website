import type { UseFormReturn } from "react-hook-form";
import type {
  AdminPostDetail,
  ReadinessResult,
} from "@/lib/api/types";
import type { AutosaveState } from "../hooks/usePostAutosave";
import type { PostEditorValues } from "../schemas/post-editor.schema";

export type BlogEditorMode = "write" | "markdown" | "diff" | "preview";
export type BlogInspectorTab =
  | "publishing"
  | "organization"
  | "media"
  | "seo"
  | "quality";

export type BlogWritingStudioProps = {
  form: UseFormReturn<PostEditorValues>;
  post: AdminPostDetail | null;
  busy: boolean;
  savedMarkdown: string;
  autosaveState: AutosaveState;
  savedAt: Date | null;
  scheduleValue: string;
  readiness: {
    result: ReadinessResult | null;
    loading: boolean;
    refresh: () => Promise<ReadinessResult | null>;
  };
  onScheduleValue: (value: string) => void;
  onSave: () => Promise<void>;
  onAction: (name: string, payload?: Record<string, unknown>) => Promise<void>;
};
