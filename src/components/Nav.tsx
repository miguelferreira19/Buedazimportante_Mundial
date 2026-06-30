"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SITE_NAME } from "@/lib/constants";
import Emblem from "@/components/Emblem";

type NavUser = { username: string; isAdmin: boolean } | null;
type LinkDef = { href: string; label: string; icon: IconName };
type IconName = "palpites" | "calendario" | "classificacao" | "admin";

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
      <header className="sticky top-0 z-30 border-b border-line/80 bg-ink/80 backdrop-blur-xl">
        <div className="festive-bar" />
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href={user ? "/palpites" : "/login"}
            className="group shrink-0 flex items-center gap-2"
            aria-label={SITE_NAME}
          >
            <span className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
              <Emblem size={30} />
            </span>
            <span className="brand-text text-base sm:text-lg leading-none max-w-[46vw] sm:max-w-none truncate">
              {SITE_NAME}
            </span>
          </Link>

          {/* Links no topo: só em ecrãs maiores */}
          {user && (
            <nav className="ml-auto hidden sm:flex items-center gap-0.5">
              {links.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                      active
                        ? "text-fg"
                        : "text-muted hover:text-fg hover:bg-card2/50"
                    }`}
                  >
                    {l.label}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand" />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {user ? (
            <div className="flex items-center gap-2.5 shrink-0 ml-auto sm:ml-2">
              <Link
                href={`/perfil/${user.username}`}
                className="hidden sm:flex items-center gap-2 text-sm text-muted hover:text-fg transition-colors"
              >
                <span className="avatar h-7 w-7 text-xs">
                  {user.username.charAt(0)}
                </span>
                <span className="max-w-[12ch] truncate">{user.username}</span>
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
            <Link
              href="/login"
              className="ml-auto btn btn-primary text-sm py-1.5 px-4"
            >
              Entrar
            </Link>
          )}
        </div>
      </header>

      {/* Barra inferior: só no telemóvel */}
      {user && (
        <nav
          className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line/80 bg-ink/90 backdrop-blur-xl flex"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[0.68rem] font-semibold transition-colors ${
                  active ? "text-brand" : "text-faint"
                }`}
              >
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand" />
                )}
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
