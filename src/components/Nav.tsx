"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SITE_NAME } from "@/lib/constants";
import Emblem from "@/components/Emblem";

type NavUser = { username: string; isAdmin: boolean } | null;

export default function Nav({ user }: { user: NavUser }) {
  const path = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const links = [
    { href: "/palpites", label: "Palpites" },
    { href: "/calendario", label: "Calendário" },
    { href: "/classificacao", label: "Classificação" },
  ];
  if (user?.isAdmin) links.push({ href: "/admin", label: "Admin" });

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-ink/85 backdrop-blur">
      <div className="festive-bar" />
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <Link
          href={user ? "/palpites" : "/login"}
          className="shrink-0 flex items-center gap-2"
        >
          <Emblem size={22} layout="inline" />
          <span className="display text-fg text-base sm:text-lg leading-none max-w-[40vw] sm:max-w-none truncate">
            {SITE_NAME}
          </span>
        </Link>

        {user && (
          <nav className="ml-auto flex items-center gap-1 overflow-x-auto">
            {links.map((l) => {
              const active = path === l.href || path.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-2.5 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    active ? "bg-card2 text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        )}

        {user ? (
          <div className="flex items-center gap-2 shrink-0">
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
  );
}
