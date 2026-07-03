import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME } from "@/lib/constants";

export const alt = "Palpites Mundial 2026 — o bolão do Mundial, entre amigos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const archivoBlack = await readFile(
    join(process.cwd(), "assets/ArchivoBlack-Regular.ttf"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a12",
          position: "relative",
          padding: "80px",
        }}
      >
        {/* Wash quente no canto (mesma linguagem do body::before) */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -160,
            right: -160,
            width: 760,
            height: 760,
            borderRadius: 760,
            background:
              "linear-gradient(135deg, rgba(255,106,26,0.55), rgba(245,144,30,0) 68%)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: -220,
            left: -160,
            width: 680,
            height: 680,
            borderRadius: 680,
            background:
              "linear-gradient(45deg, rgba(47,107,255,0.16), rgba(47,107,255,0) 70%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 108,
              height: 108,
              borderRadius: 28,
              background: "linear-gradient(140deg, #ff9a2e, #ef7d10)",
              marginBottom: 40,
            }}
          >
            <svg
              width={60}
              height={60}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#f2c14e",
              marginBottom: 22,
            }}
          >
            Canadá · México · Estados Unidos
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Archivo Black",
              fontSize: 92,
              lineHeight: 1.04,
              letterSpacing: -1,
              color: "#f6f7fb",
              maxWidth: 1000,
            }}
          >
            {SITE_NAME}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "#9aa0bd",
              marginTop: 26,
              maxWidth: 840,
            }}
          >
            O bolão do Mundial, entre amigos.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Archivo Black",
          data: archivoBlack,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
