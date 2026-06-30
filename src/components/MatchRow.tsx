import Crest from "./Crest";
import { fmtTime } from "@/lib/format";
import type { DbMatch } from "@/lib/types";

export default function MatchRow({
  m,
  className = "",
}: {
  m: DbMatch;
  className?: string;
}) {
  const finished = m.status === "finished";
  const live = m.status === "live";
  const context = [m.grp ?? m.stage ?? "", m.matchday && m.grp ? `J${m.matchday}` : ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={`card p-3.5 ${className}`}>
      <div className="flex items-center justify-between text-xs text-faint mb-2.5">
        <span className="truncate font-medium uppercase tracking-wide">
          {context}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {live && (
            <span className="chip text-brand border-brand/40">
              <span className="live-dot" /> a decorrer
            </span>
          )}
          <span className="tabular-nums">{fmtTime(m.kickoff_utc)}</span>
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 justify-end text-right">
          <span className="truncate font-semibold">
            {m.home_name ?? "A definir"}
          </span>
          <Crest src={m.home_crest} alt={m.home_name ?? ""} size={26} />
        </div>

        <div
          className={`display px-2.5 text-center min-w-[3.6rem] ${
            finished ? "text-2xl text-fg" : "text-base text-faint"
          }`}
        >
          {finished ? (
            <span>
              {m.home_score}
              <span className="text-faint mx-1 font-normal">×</span>
              {m.away_score}
            </span>
          ) : (
            fmtTime(m.kickoff_utc)
          )}
        </div>

        <div className="flex items-center gap-2.5 min-w-0">
          <Crest src={m.away_crest} alt={m.away_name ?? ""} size={26} />
          <span className="truncate font-semibold">
            {m.away_name ?? "A definir"}
          </span>
        </div>
      </div>
    </div>
  );
}
