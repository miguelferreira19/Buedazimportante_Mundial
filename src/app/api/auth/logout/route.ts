import { clearSession } from "@/lib/session";
import { ok } from "@/lib/api-helpers";

export async function POST() {
  await clearSession();
  return ok();
}
