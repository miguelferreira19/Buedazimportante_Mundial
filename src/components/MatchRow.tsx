import Crest from "./Crest";
import { fmtTime } from "@/lib/format";
import type { DbMatch } from "@/lib/types";

export default function MatchRow({ m }: { m: DbMatch }) {
  const finished = m.status === "finished";
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between text-xs text-muted mb-2">
        <span className="truncate">
          {m.grp ?? m.stage ?? ""}
          {m.matchday && m.grp ? ` · J${m.matchday}` : ""}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {m.status === "live" && (
            <span className="chip text-brand border-brand/40">
              <span className="live-dot" /> a decorrer
            </span>
          )}
          <span>{fmtTime(m.kickoff_utc)}</span>
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex items-center gap-2 min-w-0 justify-end text-right">
          <span className="truncate font-semibold">
            {m.home_name ?? "A definir"}
          </span>
          <Crest src={m.home_crest} alt={m.home_name ?? ""} />
        </div>

        <div className="display text-2xl px-2 text-center min-w-[3.5rem]">
          {finished ? `${m.home_score} × ${m.away_score}` : fmtTime(m.kickoff_utc)}
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <Crest src={m.away_crest} alt={m.away_name ?? ""} />
          <span className="truncate font-semibold">
            {m.away_name ?? "A definir"}
          </span>
        </div>
      </div>
    </div>
  );
}
