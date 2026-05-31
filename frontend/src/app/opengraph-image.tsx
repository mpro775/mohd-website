import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0b0f14", color: "#eef2f6", display: "flex", flexDirection: "column", justifyContent: "center", padding: 72 }}>
        <div style={{ color: "#37d399", fontSize: 30, fontFamily: "monospace" }}>Mohd.dev</div>
        <div style={{ marginTop: 24, fontSize: 72, fontWeight: 800 }}>Software Engineer</div>
        <div style={{ marginTop: 18, fontSize: 34, color: "#9aa7b6" }}>Next.js • NestJS • Clean Web Systems</div>
      </div>
    ),
    size,
  );
}
