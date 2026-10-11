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
    <header className="border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Scissors className="size-5" />
          </div>
          <div>
            <span className="font-display font-bold text-lg leading-none block">
              {BUSINESS.name}
            </span>
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
              Agenda & Administración
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-md border border-border/30">
            <span className="size-2 rounded-full bg-success inline-block animate-pulse" />
            <span>Usuario: <strong className="text-foreground">{user}</strong></span>
          </div>

          <Button asChild variant="ghost" size="sm" className="text-xs">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
              <span className="hidden sm:inline">Ver Web</span>
            </a>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {loggingOut ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <LogOut className="size-3.5" />
            )}
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
