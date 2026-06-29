"use client";

import React from "react";
import { Scissors, Lock, Mail, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAdminLogin } from "@/hooks/useAdminLogin";

export default function AdminLogin() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    errorMessage,
    handleLogin
  } = useAdminLogin();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary bg-card border border-border hover:bg-secondary py-2.5 px-4.5 rounded-full transition-all duration-200"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al inicio
      </Link>

      <div className="w-full max-w-[420px] z-10 space-y-6">
        
        {/* Premium Sign-in Card */}
        <div className="bg-card border border-border/80 sm:shadow-2xl rounded-[28px] p-8 md:p-10 space-y-7 shadow-black/[0.03]">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_15px_rgba(216,178,115,0.15)]">
              <Scissors className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground font-heading">
                Portal de Administración
              </h1>
              <p className="text-xs text-muted-foreground">
                Inicia sesión para gestionar citas, horarios y clientes de la barbería.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4.5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground/80 pl-1">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-card border-border text-foreground placeholder-muted-foreground/60 focus-visible:ring-primary/30 focus-visible:border-primary py-6 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground/80 pl-1">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-card border-border text-foreground placeholder-muted-foreground/60 focus-visible:ring-primary/30 focus-visible:border-primary py-6 rounded-xl text-sm"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive">
                {errorMessage}
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-6 rounded-full flex items-center justify-center gap-2 text-sm shadow-md shadow-primary/10 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Acceder al Panel"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Links Premium Style */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 px-4">
          <span>© {new Date().getFullYear()} Magic Barber Shop</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-primary transition-colors">Volver al Inicio</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
