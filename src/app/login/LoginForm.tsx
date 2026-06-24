"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";
import ScoringLegend from "@/components/ScoringLegend";
import Emblem from "@/components/Emblem";
import TeamRail from "@/components/TeamRail";
import Reveal from "@/components/Reveal";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const url =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const j = await res.json();
      if (j.ok) {
        router.push("/palpites");
        router.refresh();
      } else {
        setErr(j.error || "Ocorreu um erro.");
        setBusy(false);
      }
    } catch {
      setErr("Não foi possível contactar o servidor.");
      setBusy(false);
    }
  }

  return (
    <div className="relative -mt-6">
      {/* Hero fotografico full-bleed (estadio cheio a noite), so no login.
          z-0 (a frente do fundo opaco do body), conteudo fica em z-10. */}
      <div aria-hidden className="fixed inset-0 z-0 overflow-hidden">
        <div
          className="photo photo-wash"
          style={{ "--img": "url(/img/hero-stadium.jpg)" } as React.CSSProperties}
        />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-7 pt-10 sm:pt-16">
        <div className="flex flex-col items-center text-center gap-4">
          <Emblem size={76} />
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold/90">
            Canadá · México · Estados Unidos
          </p>
          <h1
            className="display leading-[1.04] max-w-4xl"
            style={{ fontSize: "clamp(2.4rem, 7vw, 3.6rem)" }}
          >
            O bolão do Mundial,{" "}
            <span className="brand-text">entre amigos</span>.
          </h1>
          <p className="text-muted text-[0.95rem] max-w-sm leading-relaxed">
            Faz os teus palpites, soma pontos a cada jogo e prova que percebes
            mais de futebol do que o grupo todo.
          </p>
        </div>

        <div className="glass p-5 sm:p-6">
        <div className="flex gap-1 mb-4 bg-ink rounded-lg p-1 border border-line">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setErr(null);
              }}
              className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                mode === m ? "bg-card2 text-fg" : "text-muted"
              }`}
            >
              {m === "login" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-muted">Nome de utilizador</label>
            <input
              className="input mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
              autoComplete="username"
              placeholder="ex.: joao_silva"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Palavra-passe</label>
            <input
              className="input mt-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder="mínimo 6 caracteres"
            />
          </div>

          {err && (
            <p className="text-sm text-brand bg-brand/10 border border-brand/30 rounded-lg px-3 py-2">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn btn-primary w-full"
          >
            {busy
              ? "A processar…"
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>
        <p className="text-xs text-muted mt-3 text-center">
          Sem email — só nome e palavra-passe. Guarda-a bem!
        </p>
      </div>

      <TeamRail />

      <Reveal>
        <ScoringLegend />
      </Reveal>
      </div>
    </div>
  );
}
