import { registerUser, AuthError } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { ok, fail } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");
    const user = await registerUser(username, password);
    await createSession(user);
    return ok({ user: { username: user.username, isAdmin: user.isAdmin } });
  } catch (e) {
    if (e instanceof AuthError) return fail(e.message, 400);
    console.error(e);
    return fail("Não foi possível criar a conta.", 500);
  }
}
