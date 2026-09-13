import { ImageResponse } from "next/og";

export const alt = "TokMieja - Official Online Store";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Branded Open Graph image generated from the existing TokMieja visual system.
 * No food photography or invented assets - just the monogram + wordmark.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          backgroundColor: "#fffdf8",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, #fdebc7 0%, #fffdf8 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 104,
              height: 104,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 30,
              backgroundColor: "#8a2420",
              color: "#fffdf8",
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            TM
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 68,
                fontWeight: 800,
                color: "#2a1f1a",
                lineHeight: 1,
              }}
            >
              TokMieja
            </span>
            <span
              style={{
                marginTop: 8,
                fontSize: 22,
                letterSpacing: 8,
                color: "#8a2420",
                fontWeight: 700,
              }}
            >
              SHOP
            </span>
          </div>
        </div>

        <div style={{ fontSize: 34, color: "#574238" }}>
          Good Food, Made for Every Day.
        </div>
      </div>
    ),
    size,
  );
}
