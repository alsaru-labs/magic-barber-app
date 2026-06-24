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
    <div className="min-h-screen bg-[#F0F4F9] dark:bg-[#121212] text-foreground flex flex-col items-center justify-center p-4">
      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary bg-background border border-border hover:bg-secondary py-2 px-4 rounded-full transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al inicio
      </Link>

      <div className="w-full max-w-[440px] z-10 space-y-6">
        
        {/* Google Style Sign-in Card */}
        <div className="bg-card border border-border sm:shadow-md rounded-[28px] p-8 md:p-10 space-y-8">
          
          {/* Brand Header */}
          <div className="flex flex-col items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Scissors className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
                Iniciar sesión
              </h1>
              <p className="text-sm text-muted-foreground">
                Usa tu cuenta de administrador de Magic Barber
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-card border-border text-foreground placeholder-muted-foreground/60 focus-visible:ring-primary focus-visible:border-primary py-6 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-card border-border text-foreground placeholder-muted-foreground/60 focus-visible:ring-primary focus-visible:border-primary py-6 rounded-xl text-sm"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive">
                {errorMessage}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2">
              <Link 
                href="/" 
                className="text-xs font-bold text-primary hover:underline"
              >
                ¿Olvidaste el correo?
              </Link>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/95 text-white font-bold py-6 px-6 rounded-full flex items-center justify-center gap-2 text-sm shadow-sm transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Siguiente"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Links Google Style */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-4">
          <span>Español (España)</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Ayuda</a>
            <a href="#" className="hover:underline">Privacidad</a>
            <a href="#" className="hover:underline">Condiciones</a>
          </div>
        </div>

      </div>
    </div>
  );
}
