import Reveal from "./Reveal";
import { PRIZES } from "@/lib/prizes";

// Bloco festivo no topo da classificacao, revelado quando o Mundial termina.
// Anuncia o campeao e mostra as duas mensagens de premio (campeao e ultimo).
// Elementos decorativos com aria-hidden; mensagens em texto acessivel.
export default function PrizeBanner({
  champion,
  loser,
}: {
  champion: string;
  loser: string;
}) {
  return (
    <Reveal>
      <div className="prize-banner card p-6 sm:p-7 text-center">
        <div aria-hidden className="prize-trophy text-5xl sm:text-6xl leading-none">
          {PRIZES.champion.emoji}
        </div>
        <p className="eyebrow mt-3">{PRIZES.banner.eyebrow}</p>
        <h2 className="display text-2xl sm:text-3xl mt-1.5 text-gold">
          {PRIZES.banner.title(champion)}
        </h2>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 text-left">
          <div className="rounded-xl border border-gold/40 bg-gold/[0.07] p-3.5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-gold">
              {PRIZES.champion.label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-fg">
              {PRIZES.champion.message}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-card2/50 p-3.5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted">
              {PRIZES.loser.label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-fg">
              {PRIZES.loser.message(loser)}
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
