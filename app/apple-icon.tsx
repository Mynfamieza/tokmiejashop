import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon: the existing "TM" monogram on the brand maroon. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#8a2420",
          color: "#fffdf8",
          fontSize: 92,
          fontWeight: 800,
        }}
      >
        TM
      </div>
    ),
    size,
  );
}
