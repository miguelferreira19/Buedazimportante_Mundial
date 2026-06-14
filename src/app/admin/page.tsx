import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db";
import { getAllMatches, getAllUsers } from "@/lib/queries";
import { isFootballDataConfigured } from "@/lib/footballdata";
import SetupNotice from "@/components/SetupNotice";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSession().catch(() => null);
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/palpites");
  if (!isDbConfigured()) return <SetupNotice />;

  const [matches, users] = await Promise.all([
    getAllMatches(),
    getAllUsers(),
  ]);

  return (
    <AdminClient
      matches={matches}
      users={users}
      fdConfigured={isFootballDataConfigured()}
    />
  );
}
