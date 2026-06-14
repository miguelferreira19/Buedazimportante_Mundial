import { setUserPassword, AuthError } from "@/lib/auth";
import { ok, fail, requireAdmin, handleError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const userId = String(body.userId ?? "");
    const newPassword = String(body.newPassword ?? "");
    if (!userId) return fail("Utilizador inválido.");
    await setUserPassword(userId, newPassword);
    return ok();
  } catch (e) {
    if (e instanceof AuthError) return fail(e.message, 400);
    return handleError(e);
  }
}
