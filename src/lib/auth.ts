import "server-only";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import type { SessionUser } from "./session";

export const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
export const MIN_PASSWORD = 6;

export class AuthError extends Error {}

export function validateCredentials(username: string, password: string): void {
  if (!USERNAME_RE.test(username)) {
    throw new AuthError(
      "O nome de utilizador tem de ter 3 a 20 caracteres (letras, números ou _).",
    );
  }
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    throw new AuthError(
      `A palavra-passe tem de ter pelo menos ${MIN_PASSWORD} caracteres.`,
    );
  }
}

export async function registerUser(
  username: string,
  password: string,
): Promise<SessionUser> {
  validateCredentials(username, password);
  const db = getDb();

  const { data: existing } = await db
    .from("users")
    .select("id")
    .ilike("username", username)
    .maybeSingle();
  if (existing) {
    throw new AuthError("Esse nome de utilizador já existe. Escolhe outro.");
  }

  // O primeiro utilizador a registar-se fica como administrador.
  const { count } = await db
    .from("users")
    .select("id", { count: "exact", head: true });
  const isAdmin = (count ?? 0) === 0;

  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await db
    .from("users")
    .insert({ username, password_hash, is_admin: isAdmin })
    .select("id, username, is_admin")
    .single();

  if (error || !data) {
    throw new AuthError("Não foi possível criar a conta. Tenta novamente.");
  }
  return { uid: data.id, username: data.username, isAdmin: data.is_admin };
}

// Reset de password feito pelo administrador (nao requer a password antiga).
export async function setUserPassword(
  userId: string,
  newPassword: string,
): Promise<void> {
  if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD) {
    throw new AuthError(
      `A nova palavra-passe tem de ter pelo menos ${MIN_PASSWORD} caracteres.`,
    );
  }
  const db = getDb();
  const password_hash = await bcrypt.hash(newPassword, 10);
  const { error } = await db
    .from("users")
    .update({ password_hash })
    .eq("id", userId);
  if (error) throw new AuthError("Não foi possível atualizar a palavra-passe.");
}

export async function verifyUser(
  username: string,
  password: string,
): Promise<SessionUser | null> {
  const db = getDb();
  const { data } = await db
    .from("users")
    .select("id, username, password_hash, is_admin")
    .ilike("username", username)
    .maybeSingle();
  if (!data) return null;
  const ok = await bcrypt.compare(password, data.password_hash);
  if (!ok) return null;
  return { uid: data.id, username: data.username, isAdmin: data.is_admin };
}
