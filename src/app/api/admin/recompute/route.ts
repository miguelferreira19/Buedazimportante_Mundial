import { recomputeAllFinished } from "@/lib/sync";
import { ok, requireAdmin, handleError } from "@/lib/api-helpers";

export async function POST() {
  try {
    await requireAdmin();
    const recomputed = await recomputeAllFinished();
    return ok({ recomputed });
  } catch (e) {
    return handleError(e);
  }
}
