import { ImageResponse } from "next/og";

export const alt = "FlowStore — the marketplace for n8n automation workflows";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #07100D 0%, #0D1814 60%, #0E1A15 100%)",
          color: "#EAF4F0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
          <span style={{ color: "#2DD4A7" }}>Flow</span>
          <span>Store</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2, maxWidth: 940 }}>
            The automation you need is already built.
          </div>
          <div style={{ fontSize: 30, color: "#9DB2AB", maxWidth: 820 }}>
            A library of working n8n workflows — preview on a canvas, import in seconds.
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#657C74" }}>flowstore</div>
      </div>
    ),
    size,
  );
}
