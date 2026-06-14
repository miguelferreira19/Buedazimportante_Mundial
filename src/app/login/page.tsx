import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSession().catch(() => null);
  if (user) redirect("/palpites");
  return <LoginForm />;
}
