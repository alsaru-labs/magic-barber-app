"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Scissors, Lock, User, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUSINESS } from "@/lib/config";

interface LoginResponse {
  ok?: boolean;
  error?: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin/dashboard";

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario.trim() || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: usuario.trim(), password }),
      });

      const data = (await res.json().catch(() => ({}))) as LoginResponse;

      if (res.ok) {
        toast.success("Sesión iniciada correctamente.");
        router.push(nextUrl);
        router.refresh();
      } else {
        setError(data.error || "Credenciales incorrectas.");
        toast.error(data.error || "Error al iniciar sesión.");
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      toast.error("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="liquid-glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/12 space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto size-14 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
          <Lock className="size-6" />
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Panel de Administración
        </h2>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Introduce tus credenciales para gestionar la agenda de {BUSINESS.name}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-center">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="usuario" className="text-xs font-medium">Usuario</Label>
          <div className="relative">
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
              <User className="size-4" />
            </span>
            <Input
              id="usuario"
              name="usuario"
              type="text"
              autoComplete="username"
              required
              placeholder="admin"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="pl-9 h-11 text-base sm:text-sm bg-white/[0.03] border-white/10 rounded-xl focus-visible:border-amber-400/50 focus-visible:bg-white/[0.06] transition-all"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-medium">Contraseña</Label>
          <div className="relative">
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
              <Lock className="size-4" />
            </span>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 h-11 text-base sm:text-sm bg-white/[0.03] border-white/10 rounded-xl focus-visible:border-amber-400/50 focus-visible:bg-white/[0.06] transition-all"
              disabled={loading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 shadow-[0_0_25px_rgba(250,204,21,0.35)] hover:shadow-[0_0_35px_rgba(250,204,21,0.5)] active:scale-[0.99] transition-all touch-manipulation mt-2"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin text-stone-950" /> Verificando…
            </>
          ) : (
            "Acceder al Panel"
          )}
        </Button>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors liquid-glass-subtle px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="size-3.5 text-amber-400" /> Volver a la página principal
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen text-foreground flex flex-col items-center justify-center p-4 selection:bg-amber-400/20 selection:text-amber-300 overflow-x-hidden">
      {/* Malla de luz ambiental líquida (Fluid Mesh Glow 2026) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-gradient-to-b from-amber-500/15 via-yellow-500/10 to-transparent blur-[120px] opacity-80" />
        <div className="absolute top-[40%] -left-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-amber-600/10 via-indigo-500/5 to-transparent blur-[140px] opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2.5 text-center">
          <div className="size-9 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
            <Scissors className="size-4.5" />
          </div>
          <span className="font-display font-bold text-2xl tracking-wide">
            {BUSINESS.name}
          </span>
        </div>

        <Suspense fallback={<div className="h-72 flex items-center justify-center"><Loader2 className="animate-spin text-amber-400" /></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
