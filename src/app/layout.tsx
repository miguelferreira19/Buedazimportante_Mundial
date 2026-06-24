import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "Torneio de palpites do Mundial 2026 entre amigos.",
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
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-8">
          {children}
        </main>
        <footer className="mt-10 border-t border-line/60 text-center text-xs text-muted py-8 px-4 pb-24 sm:pb-8">
          <span className="brand-text font-display">{SITE_NAME}</span>
          <span className="mx-2 text-line">/</span>
          feito entre amigos
        </footer>
      </body>
    </html>
  );
}
