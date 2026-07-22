"use client";

import { diffLines } from "diff";
import { useMemo, useState } from "react";

interface RevisionContentDiffProps {
  oldText: string;
  newText: string;
}

export function RevisionContentDiff({ oldText, newText }: RevisionContentDiffProps) {
  const [viewMode, setViewMode] = useState<"unified" | "split">("unified");

  const changes = useMemo(() => diffLines(oldText || "", newText || ""), [oldText, newText]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    changes.forEach((c) => {
      const lines = c.value.replace(/\n$/, '').split('\n').length;
      if (c.added) added += lines;
      if (c.removed) removed += lines;
    });
    return { added, removed };
  }, [changes]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-muted p-2">
        <div className="flex gap-4 text-sm font-bold">
          <span className="text-green-600 dark:text-green-500">+{stats.added} أسطر مضافة</span>
          <span className="text-red-600 dark:text-red-500">-{stats.removed} أسطر محذوفة</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode("unified")} 
            className={`rounded px-3 py-1 text-sm transition-colors ${viewMode === "unified" ? "bg-background shadow-sm font-bold" : "text-muted-foreground hover:bg-background/50"}`}
          >
            Unified
          </button>
          <button 
            onClick={() => setViewMode("split")} 
            className={`rounded px-3 py-1 text-sm transition-colors ${viewMode === "split" ? "bg-background shadow-sm font-bold" : "text-muted-foreground hover:bg-background/50"}`}
          >
            Side-by-side
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-zinc-950 p-4 font-mono text-xs text-zinc-300 overflow-x-auto max-h-[60vh] overflow-y-auto" dir="ltr">
        {viewMode === "unified" ? (
          <UnifiedView changes={changes} />
        ) : (
          <SplitView changes={changes} />
        )}
      </div>
    </div>
  );
}

function UnifiedView({ changes }: { changes: any[] }) {
  let oldLineNum = 1;
  let newLineNum = 1;

  return (
    <table className="w-full border-collapse">
      <tbody>
        {changes.map((change, index) => {
          const lines = change.value.replace(/\n$/, "").split("\n");
          return lines.map((line: string, i: number) => {
            const isAdded = change.added;
            const isRemoved = change.removed;
            let currentOld = "";
            let currentNew = "";

            if (!isAdded) {
              currentOld = String(oldLineNum++);
            }
            if (!isRemoved) {
              currentNew = String(newLineNum++);
            }

            return (
              <tr key={`${index}-${i}`} className={`${isAdded ? "bg-green-950/40 text-green-400" : isRemoved ? "bg-red-950/40 text-red-400" : ""}`}>
                <td className="w-[40px] select-none border-r border-zinc-800 pr-2 text-right text-zinc-600">{currentOld}</td>
                <td className="w-[40px] select-none border-r border-zinc-800 pr-2 text-right text-zinc-600">{currentNew}</td>
                <td className="select-none px-2 w-[30px] text-center font-bold">
                  {isAdded ? "+" : isRemoved ? "-" : " "}
                </td>
                <td className="whitespace-pre-wrap pl-2 break-all">{line}</td>
              </tr>
            );
          });
        })}
      </tbody>
    </table>
  );
}

function SplitView({ changes }: { changes: any[] }) {
  const rows: { leftNum: string; leftText: string; rightNum: string; rightText: string; type: 'unchanged'|'removed'|'added'|'modified' }[] = [];
  
  let oldLineNum = 1;
  let newLineNum = 1;

  let i = 0;
  while (i < changes.length) {
    const current = changes[i];
    
    if (current.removed && changes[i+1] && changes[i+1].added) {
      const removedLines = current.value.replace(/\n$/, "").split("\n");
      const addedLines = changes[i+1].value.replace(/\n$/, "").split("\n");
      
      const maxLines = Math.max(removedLines.length, addedLines.length);
      for (let j = 0; j < maxLines; j++) {
        const hasLeft = j < removedLines.length;
        const hasRight = j < addedLines.length;
        rows.push({
          leftNum: hasLeft ? String(oldLineNum++) : "",
          leftText: hasLeft ? removedLines[j] : "",
          rightNum: hasRight ? String(newLineNum++) : "",
          rightText: hasRight ? addedLines[j] : "",
          type: 'modified'
        });
      }
      i += 2;
    } else if (current.removed) {
      const removedLines = current.value.replace(/\n$/, "").split("\n");
      for (const line of removedLines) {
        rows.push({
          leftNum: String(oldLineNum++),
          leftText: line,
          rightNum: "",
          rightText: "",
          type: 'removed'
        });
      }
      i++;
    } else if (current.added) {
      const addedLines = current.value.replace(/\n$/, "").split("\n");
      for (const line of addedLines) {
        rows.push({
          leftNum: "",
          leftText: "",
          rightNum: String(newLineNum++),
          rightText: line,
          type: 'added'
        });
      }
      i++;
    } else {
      const lines = current.value.replace(/\n$/, "").split("\n");
      for (const line of lines) {
        rows.push({
          leftNum: String(oldLineNum++),
          leftText: line,
          rightNum: String(newLineNum++),
          rightText: line,
          type: 'unchanged'
        });
      }
      i++;
    }
  }

  return (
    <table className="w-full border-collapse table-fixed">
      <tbody>
        {rows.map((row, index) => {
          const isRemoved = row.type === 'removed' || (row.type === 'modified' && row.leftNum);
          const isAdded = row.type === 'added' || (row.type === 'modified' && row.rightNum);
          
          return (
            <tr key={index}>
              {/* Left pane */}
              <td className={`w-[40px] select-none border-r border-zinc-800 pr-2 text-right text-zinc-600 ${isRemoved ? 'bg-red-950/40' : ''}`}>
                {row.leftNum}
              </td>
              <td className={`w-[calc(50%-40px)] border-r border-zinc-800 px-2 whitespace-pre-wrap break-all ${isRemoved ? 'bg-red-950/40 text-red-400' : ''}`}>
                {row.leftText}
              </td>
              
              {/* Right pane */}
              <td className={`w-[40px] select-none border-r border-zinc-800 pr-2 text-right text-zinc-600 ${isAdded ? 'bg-green-950/40' : ''}`}>
                {row.rightNum}
              </td>
              <td className={`w-[calc(50%-40px)] px-2 whitespace-pre-wrap break-all ${isAdded ? 'bg-green-950/40 text-green-400' : ''}`}>
                {row.rightText}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
