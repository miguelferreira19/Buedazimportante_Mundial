import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const dynamic = "force-static";

// Ícone maskable 192x192 para o manifest: fundo edge-to-edge (sem cantos
// arredondados, o SO aplica a máscara) com o troféu do emblema na "safe
// zone" central para não cortar em launchers adaptativos.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(140deg, #ff9a2e, #ef7d10)",
        }}
      >
        <svg
          width={104}
          height={104}
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
    ),
    { width: 192, height: 192 },
  );
}
