"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, LogOut, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/config";

export default function AdminHeader({ user }: { user: string }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("Sesión cerrada.");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("Error al cerrar sesión.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="sticky top-3 sm:top-5 z-40 px-3 sm:px-6 w-full">
      <header className="max-w-5xl mx-auto liquid-glass rounded-full px-3.5 sm:px-6 h-13 sm:h-15 flex items-center justify-between shadow-2xl transition-all border border-white/12">
        {/* Logo y Marca */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="size-8 sm:size-9 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
            <Scissors className="size-4 sm:size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="font-display font-bold text-base sm:text-lg leading-none block truncate">
              {BUSINESS.name}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium block truncate">
              Agenda & Admin
            </span>
          </div>
        </div>

        {/* Acciones y usuario */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground liquid-glass-pill px-3 py-1 rounded-full">
            <span className="size-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>Usuario: <strong className="text-foreground">{user}</strong></span>
          </div>

          <Button asChild variant="ghost" size="sm" className="text-xs h-8 px-2.5 sm:px-3 rounded-full liquid-glass-subtle liquid-glass-interactive touch-manipulation">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5 text-amber-400" />
              <span className="hidden sm:inline">Ver Web</span>
            </a>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs h-8 px-2.5 sm:px-3 rounded-full liquid-glass-subtle liquid-glass-interactive text-muted-foreground hover:text-foreground touch-manipulation"
          >
            {loggingOut ? (
              <Loader2 className="size-3.5 animate-spin text-amber-400" />
            ) : (
              <LogOut className="size-3.5" />
            )}
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </header>
    </div>
  );
}
