"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";
import ScoringLegend from "@/components/ScoringLegend";

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
    <div className="max-w-sm mx-auto space-y-6 pt-6">
      <div className="text-center space-y-1">
        <h1 className="brand-text text-4xl">{SITE_NAME}</h1>
        <p className="text-muted text-sm">
          Faz os teus palpites, soma pontos, ganha o bolão.
        </p>
      </div>

      <div className="card p-5">
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

      <ScoringLegend />
    </div>
  );
}
