import { syncFromFootballData } from "@/lib/sync";
import { ok, requireAdmin, handleError } from "@/lib/api-helpers";

export async function POST() {
  try {
    await requireAdmin();
    const result = await syncFromFootballData();
    return ok({ result });
  } catch (e) {
    return handleError(e);
  }
}
