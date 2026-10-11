"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Scissors, Lock, User, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="border-primary/20 bg-card/90 shadow-2xl backdrop-blur">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Lock className="size-6" />
        </div>
        <CardTitle className="font-display text-2xl font-bold">
          Panel de Administración
        </CardTitle>
        <CardDescription>
          Introduce tus credenciales para gestionar la agenda de {BUSINESS.name}.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-md bg-destructive/15 border border-destructive/30 text-destructive text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="usuario">Usuario</Label>
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
                className="pl-9"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
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
                className="pl-9"
                disabled={loading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Verificando…
              </>
            ) : (
              "Acceder al Panel"
            )}
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Volver a la página principal
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2 text-center">
          <Scissors className="size-6 text-primary" />
          <span className="font-display font-bold text-2xl tracking-wide">
            {BUSINESS.name}
          </span>
        </div>

        <Suspense fallback={<div className="h-72 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
