import { getDb } from "@/lib/db";
import { hasStarted } from "@/lib/format";
import { ok, fail, requireUser, handleError, validScore } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const matchId = Number(body.matchId);
    const home = Number(body.home);
    const away = Number(body.away);

    if (!Number.isInteger(matchId)) return fail("Jogo inválido.");
    if (!validScore(home) || !validScore(away)) {
      return fail("Resultado inválido (usa números inteiros entre 0 e 99).");
    }

    const db = getDb();
    const { data: match } = await db
      .from("matches")
      .select("id, kickoff_utc")
      .eq("id", matchId)
      .maybeSingle();
    if (!match) return fail("Jogo não encontrado.", 404);

    // Bloqueio do lado do servidor: nao se pode palpitar depois do apito inicial.
    if (hasStarted(match.kickoff_utc)) {
      return fail(
        "Os palpites para este jogo já estão fechados (o jogo começou).",
        403,
      );
    }

    const { error } = await db.from("predictions").upsert(
      {
        user_id: user.uid,
        match_id: matchId,
        pred_home: home,
        pred_away: away,
        points: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,match_id" },
    );
    if (error) return fail("Não foi possível guardar o palpite.", 500);

    return ok({ matchId, home, away });
  } catch (e) {
    return handleError(e);
  }
}
