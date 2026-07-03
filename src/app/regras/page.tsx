import type { Metadata } from "next";
import ScoringLegend from "@/components/ScoringLegend";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Regras",
  description: `Como funciona a pontuação, os desempates e o fecho dos palpites no ${SITE_NAME}.`,
};

export default function RegrasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-page section-accent">Regras</h1>
        <p className="text-muted text-sm mt-2 max-w-md leading-relaxed">
          Simples: palpita antes do apito, soma pontos consoante acertas.
        </p>
      </div>

      <ScoringLegend />

      <div className="card p-5 space-y-4">
        <div>
          <h2 className="display text-base mb-1.5">Desempate</h2>
          <p className="text-sm text-muted leading-relaxed">
            A classificação ordena primeiro por mais pontos; em caso de
            empate, ganha quem tiver mais resultados exatos.
          </p>
        </div>
        <div className="pt-3 border-t border-line/50">
          <h2 className="display text-base mb-1.5">Fecho dos palpites</h2>
          <p className="text-sm text-muted leading-relaxed">
            Cada jogo fecha para palpites no apito inicial — a validação é
            feita no servidor, não há forma de palpitar depois de começar.
            Os palpites de toda a gente só ficam visíveis quando o jogo
            começa, para ninguém ser influenciado pelas escolhas dos outros.
          </p>
        </div>
        <div className="pt-3 border-t border-line/50">
          <h2 className="display text-base mb-1.5">Resultado considerado</h2>
          <p className="text-sm text-muted leading-relaxed">
            Conta sempre o resultado dos 90 minutos, mesmo em jogos a
            eliminar que vão a prolongamento ou grandes penalidades.
          </p>
        </div>
      </div>
    </div>
  );
}
