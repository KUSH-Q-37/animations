import { ImageResponse } from "next/og";

export const alt = "Kush Bhardwaj — Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          padding: "90px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 44,
            width: 28,
            height: 28,
            borderTop: "3px solid #00ff33",
            borderLeft: "3px solid #00ff33",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 44,
            right: 44,
            width: 28,
            height: 28,
            borderBottom: "3px solid #00ff33",
            borderRight: "3px solid #00ff33",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: 108,
              fontWeight: 700,
              letterSpacing: "-4px",
              lineHeight: 1,
            }}
          >
            KUSH
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: "#00ff33",
              color: "#000000",
              fontSize: 108,
              fontWeight: 700,
              letterSpacing: "-4px",
              lineHeight: 1,
              padding: "2px 18px",
              marginTop: 10,
              alignSelf: "flex-start",
            }}
          >
            BHARDWAJ
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 44,
            color: "#a1a1aa",
            fontSize: 34,
            fontWeight: 300,
          }}
        >
          Full-Stack Developer — VM One Technologies
        </div>
      </div>
    ),
    { ...size },
  );
}
