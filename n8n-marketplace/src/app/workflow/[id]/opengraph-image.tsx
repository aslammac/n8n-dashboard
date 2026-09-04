import { ImageResponse } from "next/og";

export const alt = "FlowStore workflow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let title = "n8n workflow";
  let category = "";
  try {
    const res = await fetch(`${API}/workflows/${id}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const w = await res.json();
      title = w.title || title;
      category = w.category || "";
    }
  } catch {
    /* fall back to defaults */
  }

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
        <div style={{ display: "flex", fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>
          <span style={{ color: "#2DD4A7" }}>Flow</span>
          <span>Store</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {category ? (
            <div
              style={{
                fontSize: 24,
                color: "#2DD4A7",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              {category}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: -1.5,
              maxWidth: 1000,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#657C74" }}>
          Preview on a canvas · Import into n8n
        </div>
      </div>
    ),
    size,
  );
}
