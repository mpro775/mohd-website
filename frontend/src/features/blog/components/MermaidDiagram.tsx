"use client";

import { useEffect, useId, useState } from "react";

type RenderState =
  | { status: "loading"; chart: string }
  | { status: "ready"; chart: string; svg: string }
  | { status: "error"; chart: string };

export function MermaidDiagram({ chart }: { chart: string }) {
  const reactId = useId();
  const [state, setState] = useState<RenderState>({ status: "loading", chart });

  useEffect(() => {
    let active = true;
    const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

    void Promise.all([import("mermaid"), import("dompurify")])
      .then(async ([mermaidModule, domPurifyModule]) => {
        const mermaid = mermaidModule.default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "default",
          htmlLabels: false,
        });

        const parsed = await mermaid.parse(chart, { suppressErrors: true });
        if (!parsed) throw new Error("Invalid Mermaid diagram");

        const { svg } = await mermaid.render(diagramId, chart);
        const cleanSvg = domPurifyModule.default.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
          FORBID_TAGS: ["script", "foreignObject"],
          FORBID_ATTR: ["onerror", "onload", "onclick"],
        });
        if (!cleanSvg.includes("<svg"))
          throw new Error("Unsafe Mermaid output");
        if (active) setState({ status: "ready", chart, svg: cleanSvg });
      })
      .catch(() => {
        document.getElementById(`d${diagramId}`)?.remove();
        if (active) setState({ status: "error", chart });
      });

    return () => {
      active = false;
      document.getElementById(`d${diagramId}`)?.remove();
    };
  }, [chart, reactId]);

  if (state.chart !== chart || state.status === "loading") {
    return (
      <div
        className="my-6 min-h-32 animate-pulse rounded-xl border border-border bg-muted/30"
        aria-label="جارٍ رسم مخطط Mermaid"
      />
    );
  }

  if (state.status === "error") {
    return (
      <div
        className="my-6 overflow-hidden rounded-xl border border-danger/40 bg-danger/5"
        role="alert"
      >
        <p className="border-b border-danger/20 px-4 py-3 text-sm font-bold text-danger">
          تعذّر عرض مخطط Mermaid. راجع صياغة المخطط أدناه.
        </p>
        <pre dir="ltr" className="overflow-x-auto p-4 text-left text-sm">
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  return (
    <div
      className="mermaid-diagram my-6 overflow-x-auto rounded-xl border border-border bg-white p-4 text-center"
      dir="ltr"
      role="img"
      aria-label="مخطط Mermaid"
      dangerouslySetInnerHTML={{ __html: state.svg }}
    />
  );
}
