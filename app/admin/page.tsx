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
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Background glow layers */}
      <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] bg-[var(--glow-color)] rounded-full blur-[140px] pointer-events-none opacity-30" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[var(--glow-color)] rounded-full blur-[140px] pointer-events-none opacity-20" />

      {/* Back to Home Button (Editorial style) */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-[9px] tracking-widest font-bold uppercase text-muted-foreground hover:text-foreground border border-border px-4 py-2.5 transition-all duration-300"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al inicio
      </Link>

      <div className="w-full max-w-[380px] z-10 space-y-6">
        
        {/* Editorial Login Box */}
        <div className="bg-secondary/15 dark:bg-black/35 border border-border p-8 md:p-10 space-y-8 relative">
          
          {/* Top Gold Accent Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary" />

          {/* User Icon Header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-primary bg-primary/5 shrink-0">
              <Scissors className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h1 className="text-base font-extrabold tracking-widest uppercase text-foreground">
                CONSOLA ADMIN
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-relaxed">
                Inicia sesión para administrar la agenda y barberos.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground pl-0.5">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-0 top-3.5 w-4 h-4 text-muted-foreground/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-7 border-0 border-b border-border hover:border-foreground focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent rounded-none px-0 py-4 text-xs tracking-wider transition-all w-full"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground pl-0.5">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-0 top-3.5 w-4 h-4 text-muted-foreground/60" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-7 border-0 border-b border-border hover:border-foreground focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent rounded-none px-0 py-4 text-xs tracking-wider transition-all w-full"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive uppercase tracking-widest font-bold">
                {errorMessage}
              </div>
            )}

            {/* Acceder Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-6 rounded-none flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all duration-300 hover:shadow-lg active:scale-[0.99] cursor-pointer border border-primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[9px] text-muted-foreground/80 uppercase tracking-widest px-1">
          <span>© {new Date().getFullYear()} Magic Barber</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-primary transition-colors">Volver al Inicio</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
