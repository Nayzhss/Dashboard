import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

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
          background: "#0b0b10",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(139,92,246,0.35), transparent 50%), radial-gradient(circle at 85% 75%, rgba(124,58,237,0.3), transparent 50%)",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          OPENRF Community
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#a78bfa",
            marginTop: 20,
          }}
        >
          Dashboard pour les frérots, régalez-vous.
        </div>
      </div>
    ),
    { ...size }
  )
}
