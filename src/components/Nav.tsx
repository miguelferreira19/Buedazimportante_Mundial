"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SITE_NAME } from "@/lib/constants";
import Emblem from "@/components/Emblem";

type NavUser = { username: string; isAdmin: boolean } | null;
type LinkDef = { href: string; label: string; icon: IconName };

function NavIcon({ name }: { name: IconName }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "palpites":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      );
    case "calendario":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "classificacao":
      return (
        <svg {...common}>
          <path d="M3 3v18h18" />
          <path d="M18 17V9M13 17V5M8 17v-3" />
        </svg>
      );
    case "admin":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
      );
  }
}

type IconName = "palpites" | "calendario" | "classificacao" | "admin";

export default function Nav({ user }: { user: NavUser }) {
  const path = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const links: LinkDef[] = [
    { href: "/palpites", label: "Palpites", icon: "palpites" },
    { href: "/calendario", label: "Calendário", icon: "calendario" },
    { href: "/classificacao", label: "Classificação", icon: "classificacao" },
  ];
  if (user?.isAdmin)
    links.push({ href: "/admin", label: "Admin", icon: "admin" });

  const isActive = (href: string) =>
    path === href || path.startsWith(href + "/");

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-ink/85 backdrop-blur">
        <div className="festive-bar" />
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <Link
            href={user ? "/palpites" : "/login"}
            className="group shrink-0 flex items-center gap-2"
          >
            <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Emblem size={30} />
            </span>
            <span className="brand-text text-base sm:text-lg leading-none max-w-[52vw] sm:max-w-none truncate">
              {SITE_NAME}
            </span>
          </Link>

          {/* Links no topo: só em ecrãs maiores */}
          {user && (
            <nav className="ml-auto hidden sm:flex items-center gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    isActive(l.href)
                      ? "bg-card2 text-fg"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          )}

          {user ? (
            <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
              <Link
                href={`/perfil/${user.username}`}
                className="hidden sm:inline text-sm text-muted hover:text-fg"
              >
                @{user.username}
              </Link>
              <button
                onClick={logout}
                disabled={busy}
                className="btn btn-ghost text-sm py-1.5 px-3"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link href="/login" className="ml-auto btn btn-primary text-sm py-1.5">
              Entrar
            </Link>
          )}
        </div>
      </header>

      {/* Barra inferior: só no telemóvel */}
      {user && (
        <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-line bg-ink/90 backdrop-blur flex">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[0.68rem] font-semibold ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <NavIcon name={l.icon} />
                {l.label}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
