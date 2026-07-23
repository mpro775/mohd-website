"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAdminLayoutMode } from "@/components/admin/AdminLayoutModeContext";
import { BlogArchiveDialog } from "./BlogArchiveDialog";
import { BlogDocumentHeader } from "./BlogDocumentHeader";
import { BlogEditorInspector } from "./BlogEditorInspector";
import { BlogEditorTopbar } from "./BlogEditorTopbar";
import { BlogEditorWorkspace } from "./BlogEditorWorkspace";
import { BlogPublishDialog } from "./BlogPublishDialog";
import { BlogRequestChangesDialog } from "./BlogRequestChangesDialog";
import { buildRequestChangesPayload } from "./BlogRequestChangesDialog";
import { BlogScheduleDialog } from "./BlogScheduleDialog";
import type { BlogEditorMode, BlogWritingStudioProps } from "./blog-writing-studio.types";

export function BlogWritingStudio(props: BlogWritingStudioProps) {
  const { focusMode, setFocusMode } = useAdminLayoutMode();
  const [mode, setMode] = useState<BlogEditorMode>("write");
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [readinessOpen, setReadinessOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => () => setFocusMode(false), [setFocusMode]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setFocusMode(!focusMode);
      } else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        setMode("preview");
      } else if (event.key === "Escape" && focusMode) {
        setFocusMode(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focusMode, setFocusMode]);

  const checkedAction = async (name: string) => {
    if (name !== "publish" && name !== "schedule") {
      await props.onAction(name);
      return;
    }
    const result = await props.readiness.refresh();
    if (!result) return;
    if (result.blockers.length || result.warnings.length) {
      setPendingAction(name);
      setReadinessOpen(true);
      return;
    }
    await props.onAction(name);
  };

  const primaryAction = () => {
    const status = props.post?.status ?? "new";
    if (status === "new") void props.onSave();
    else if (status === "approved") void checkedAction("publish");
    else if (status === "in_review") void props.onAction("approve");
    else if (status === "archived") void props.onAction("unpublish");
    else if (status === "draft" || status === "changes_requested") void props.onAction("submit-review");
    else setInspectorOpen(true);
  };

  const values = props.form.watch();
  return (
    <div className={`min-h-screen pb-16 ${focusMode ? "bg-background px-4 md:px-8" : ""}`} dir="rtl">
      <BlogEditorTopbar
        post={props.post}
        busy={props.busy}
        saveState={props.autosaveState}
        savedAt={props.savedAt}
        focusMode={focusMode}
        readiness={props.readiness.result}
        onToggleFocus={() => setFocusMode(!focusMode)}
        onPreview={() => setMode("preview")}
        onSave={() => void props.onSave()}
        onOpenInspector={() => setInspectorOpen(true)}
        onPrimaryAction={primaryAction}
        onRefreshReadiness={() => void props.readiness.refresh()}
      />
      <div className="mx-auto flex max-w-[1400px] items-start gap-5 pt-2">
        <main className="min-w-0 flex-1">
          <BlogDocumentHeader form={props.form} />
          <BlogEditorWorkspace
            mode={mode}
            onModeChange={setMode}
            markdown={values.content}
            savedMarkdown={props.savedMarkdown}
            exportFileName={values.slug || values.title || "article"}
            onChange={(content) => props.form.setValue("content", content, { shouldDirty: true, shouldValidate: true })}
          />
        </main>
        {!focusMode ? (
          <BlogEditorInspector
            form={props.form}
            post={props.post}
            busy={props.busy}
            scheduleValue={props.scheduleValue}
            readiness={props.readiness}
            onAction={async (name, payload) => {
              if (name === "request-changes") setRequestChangesOpen(true);
              else if (name === "archive") setArchiveOpen(true);
              else if (name === "schedule" || name === "publish") await checkedAction(name);
              else await props.onAction(name, payload);
            }}
            collapsed={inspectorCollapsed}
            onCollapsedChange={setInspectorCollapsed}
            mobileOpen={inspectorOpen}
            onMobileOpenChange={setInspectorOpen}
            onRequestChanges={() => setRequestChangesOpen(true)}
            onArchive={() => setArchiveOpen(true)}
            onScheduleOpen={() => setScheduleOpen(true)}
          />
        ) : null}
      </div>
      <BlogScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        value={props.scheduleValue}
        onValueChange={props.onScheduleValue}
        busy={props.busy}
        onConfirm={() => {
          setScheduleOpen(false);
          void checkedAction("schedule");
        }}
      />
      <BlogRequestChangesDialog
        open={requestChangesOpen}
        onOpenChange={setRequestChangesOpen}
        busy={props.busy}
        onSubmit={(message) => {
          setRequestChangesOpen(false);
          void props.onAction("request-changes", buildRequestChangesPayload(message));
        }}
      />
      <BlogArchiveDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        busy={props.busy}
        onConfirm={() => void props.onAction("archive")}
      />
      <BlogPublishDialog
        open={readinessOpen}
        onOpenChange={setReadinessOpen}
        result={props.readiness.result}
        busy={props.busy}
        confirmLabel={pendingAction === "schedule" ? "المتابعة والجدولة" : "المتابعة والنشر"}
        onConfirm={() => {
          if (!pendingAction) return;
          setReadinessOpen(false);
          void props.onAction(pendingAction).catch(() => toast.error("تعذر تنفيذ الإجراء"));
          setPendingAction(null);
        }}
      />
    </div>
  );
}
