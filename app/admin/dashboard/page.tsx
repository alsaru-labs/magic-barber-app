import { redirect } from "next/navigation";
import AdminAgenda from "@/components/admin/Agenda";
import AdminHeader from "@/components/admin/AdminHeader";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AdminHeader user={session.user} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 sm:py-8">
        <AdminAgenda />
      </main>
    </div>
  );
}
