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
    <div className="relative min-h-screen text-foreground flex flex-col selection:bg-amber-400/20 selection:text-amber-300 overflow-x-hidden">
      {/* Malla de luz ambiental líquida (Fluid Mesh Glow 2026) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[450px] rounded-full bg-gradient-to-b from-amber-500/15 via-yellow-500/8 to-transparent blur-[120px] opacity-75" />
        <div className="absolute top-[35%] -left-[15%] w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-amber-600/10 via-indigo-500/5 to-transparent blur-[140px] opacity-50" />
        <div className="absolute top-[50%] -right-[15%] w-[420px] h-[420px] rounded-full bg-gradient-to-tl from-amber-400/10 via-rose-500/5 to-transparent blur-[140px] opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
      </div>

      <AdminHeader user={session.user} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-6 pt-4 pb-16 space-y-6">
        <AdminAgenda />
      </main>
    </div>
  );
}
