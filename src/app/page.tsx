import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getSession().catch(() => null);
  redirect(user ? "/palpites" : "/login");
}
