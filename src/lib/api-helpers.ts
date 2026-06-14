import "server-only";
import { NextResponse } from "next/server";
import { getSession, type SessionUser } from "./session";

export function ok(data: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: true, ...data });
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const u = await getSession();
  if (!u) throw new ApiError("Sessão inválida. Faz login outra vez.", 401);
  return u;
}

export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser();
  if (!u.isAdmin) {
    throw new ApiError("Apenas o administrador pode fazer isto.", 403);
  }
  return u;
}

export function handleError(e: unknown) {
  if (e instanceof ApiError) return fail(e.message, e.status);
  console.error(e);
  return fail("Ocorreu um erro inesperado.", 500);
}

export function validScore(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= 99;
}
