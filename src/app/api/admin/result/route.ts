import { setManualResult } from "@/lib/sync";
import { ok, fail, requireAdmin, handleError, validScore } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const matchId = Number(body.matchId);
    if (!Number.isInteger(matchId)) return fail("Jogo inválido.");

    const clear =
      body.home === null ||
      body.home === "" ||
      body.away === null ||
      body.away === "" ||
      typeof body.home === "undefined" ||
      typeof body.away === "undefined";

    if (clear) {
      const recomputed = await setManualResult(matchId, null, null);
      return ok({ recomputed, cleared: true });
    }

    const home = Number(body.home);
    const away = Number(body.away);
    if (!validScore(home) || !validScore(away)) {
      return fail("Resultado inválido (números inteiros entre 0 e 99).");
    }
    const recomputed = await setManualResult(matchId, home, away);
    return ok({ recomputed });
  } catch (e) {
    return handleError(e);
  }
}
