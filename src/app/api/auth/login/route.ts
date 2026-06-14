import { verifyUser } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { ok, fail } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");
    if (!username || !password) {
      return fail("Indica o nome de utilizador e a palavra-passe.", 400);
    }
    const user = await verifyUser(username, password);
    if (!user) return fail("Nome ou palavra-passe incorretos.", 401);
    await createSession(user);
    return ok({ user: { username: user.username, isAdmin: user.isAdmin } });
  } catch (e) {
    console.error(e);
    return fail("Erro ao iniciar sessão.", 500);
  }
}
