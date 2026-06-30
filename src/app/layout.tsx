import type { Metadata, Viewport } from "next";
import { Archivo_Black, Outfit } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { getSession } from "@/lib/session";
import { SITE_NAME } from "@/lib/constants";

const archivo = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

// Outfit: geometrica, moderna; substitui Noto Sans no corpo.
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const DESCRIPTION =
  "Faz os teus palpites, soma pontos a cada jogo e prova que percebes mais de futebol do que o grupo todo.";

export const metadata: Metadata = {
  metadataBase: new URL("https://buedazimportante-mundial.vercel.app"),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  appleWebApp: {
    capable: true,
    title: "Palpites",
    statusBarStyle: "black-translucent",
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
    url: "/",
    images: [
      {
        url: "/img/hero-stadium.jpg",
        alt: "Bolão do Mundial 2026 entre amigos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
    images: ["/img/hero-stadium.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a12",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSession().catch(() => null);

  return (
    <html
      lang="pt-PT"
      className={`${archivo.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col font-sans">
        <Nav
          user={
            user ? { username: user.username, isAdmin: user.isAdmin } : null
          }
        />
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-7 pb-28 sm:pb-10">
          {children}
        </main>
        <footer className="mt-12 border-t border-line/60 px-4 py-9 pb-28 sm:pb-9">
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-1.5 text-center">
            <span className="brand-text text-base">{SITE_NAME}</span>
            <p className="text-xs text-faint">
              Feito entre amigos. Resultados pelos 90 minutos.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
