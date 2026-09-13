import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** TokMieja favicon: the existing "TM" monogram on the brand maroon. */
export default function Icon() {
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
          fontSize: 32,
          fontWeight: 800,
        }}
      >
        TM
      </div>
    ),
    size,
  );
}
