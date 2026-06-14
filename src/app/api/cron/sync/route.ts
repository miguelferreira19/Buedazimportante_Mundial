import { syncFromFootballData } from "@/lib/sync";
import { ok, fail } from "@/lib/api-helpers";

// Endpoint chamado pelo GitHub Actions (cron) para atualizar resultados.
// Protegido por um segredo partilhado (CRON_SECRET).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return fail("CRON_SECRET não está configurado.", 500);

  const url = new URL(req.url);
  const provided =
    req.headers.get("x-cron-secret") || url.searchParams.get("key");
  if (provided !== secret) return fail("Não autorizado.", 401);

  try {
    const result = await syncFromFootballData();
    return ok({ result });
  } catch (e) {
    console.error(e);
    return fail("Falha na sincronização com a football-data.org.", 500);
  }
}
