"use client";

import React from "react";
import { 
  Scissors, 
  Calendar, 
  LogOut, 
  Menu, 
  X, 
  Loader2,
  UserCheck,
  Users
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const {
    session,
    isLoading,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    handleSignOut,
    pathname
  } = useAdminAuth();

  // If we're loading, show a premium fullscreen loading screen
  if (isLoading && pathname.startsWith("/admin/dashboard")) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] bg-[var(--glow-color)] rounded-full blur-[140px] pointer-events-none opacity-30" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[var(--glow-color)] rounded-full blur-[140px] pointer-events-none opacity-20" />
        
        <div className="flex flex-col items-center z-10 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-muted-foreground text-[9px] uppercase tracking-[0.2em] font-extrabold mt-2">
            Verificando Credenciales...
          </p>
        </div>
      </div>
    );
  }

  // If we are on the login page, render children directly without dashboard shell
  if (pathname === "/admin") {
    return <>{children}</>;
  }

  // For dashboard pages, render the premium admin console style template
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative transition-colors duration-300">
      
      {/* Background glow layers */}
      <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-[var(--glow-color)] rounded-full blur-[120px] pointer-events-none opacity-20" />
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-[var(--glow-color)] rounded-full blur-[120px] pointer-events-none opacity-20" />

      {/* Sidebar for Desktop (macOS style glass panel - sharp) */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border p-6 space-y-8 flex-shrink-0 relative z-20">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group px-2 shrink-0">
          <div className="w-7 h-7 rounded-full border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
            <Scissors className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-foreground">
            MAGIC BARBER
          </span>
        </Link>

        {/* User Profile Card */}
        {session?.user && (
          <div className="flex items-center gap-3 p-3.5 bg-secondary/10 border border-border shrink-0">
            <div className="w-7 h-7 rounded-full border border-primary/20 flex items-center justify-center text-primary bg-primary/5 shrink-0">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div className="truncate min-w-0">
              <p className="text-[8px] text-primary font-mono tracking-widest uppercase font-bold">Administrador</p>
              <p className="text-[10px] text-foreground truncate font-bold uppercase tracking-wider mt-0.5">{session.user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 pt-2">
          <Link 
            href="/admin/dashboard" 
            className={`flex items-center gap-3 px-4 py-3.5 text-[9px] font-extrabold tracking-[0.2em] uppercase transition-all duration-300 border-l-2 ${
              pathname === "/admin/dashboard" 
                ? "border-primary bg-primary/[0.02] text-primary font-extrabold" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            Reservas de Hoy
          </Link>
          <Link 
            href="/admin/barbers" 
            className={`flex items-center gap-3 px-4 py-3.5 text-[9px] font-extrabold tracking-[0.2em] uppercase transition-all duration-300 border-l-2 ${
              pathname === "/admin/barbers" 
                ? "border-primary bg-primary/[0.02] text-primary font-extrabold" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            Peluqueros
          </Link>
        </nav>

        {/* Logout Button */}
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent flex items-center justify-start gap-3 w-full py-5 rounded-none text-[9px] font-extrabold uppercase tracking-[0.2em] cursor-pointer transition-all duration-300 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </Button>
      </aside>

      {/* Header for Mobile (Editorial glass nav) */}
      <header className="md:hidden w-full bg-card/85 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between relative z-30 shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center text-primary">
            <Scissors className="w-3 h-3" />
          </div>
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-foreground">
            MAGIC BARBER
          </span>
        </Link>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-muted-foreground hover:text-foreground hover:bg-secondary/40 rounded-none border border-border"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </header>

      {/* Mobile Menu Panel (Sliding sheet - sharp) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[57px] left-0 w-full bg-card/95 backdrop-blur-2xl border-b border-border shadow-xl z-25 flex flex-col p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
          {session?.user && (
            <div className="flex items-center gap-3 p-3.5 bg-secondary/10 border border-border mb-2">
              <div className="w-7 h-7 rounded-full border border-primary/20 flex items-center justify-center text-primary bg-primary/5 shrink-0">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-[8px] text-primary font-mono tracking-widest uppercase font-bold">Administrador</p>
                <p className="text-[10px] text-foreground truncate font-bold uppercase tracking-wider mt-0.5">{session.user.email}</p>
              </div>
            </div>
          )}

          <Link 
            href="/admin/dashboard" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3.5 text-[9px] font-extrabold tracking-[0.2em] uppercase transition-all duration-300 border-l-2 ${
              pathname === "/admin/dashboard" 
                ? "border-primary bg-primary/[0.02] text-primary font-extrabold" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Reservas de Hoy
          </Link>
          <Link 
            href="/admin/barbers" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3.5 text-[9px] font-extrabold tracking-[0.2em] uppercase transition-all duration-300 border-l-2 ${
              pathname === "/admin/barbers" 
                ? "border-primary bg-primary/[0.02] text-primary font-extrabold" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`}
          >
            <Users className="w-4 h-4" />
            Peluqueros
          </Link>

          <Button 
            variant="ghost" 
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleSignOut();
            }}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent flex items-center justify-start gap-3 w-full py-5 rounded-none text-[9px] font-extrabold uppercase tracking-[0.2em] cursor-pointer transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-6 md:p-8 lg:p-10 overflow-y-auto relative z-10 apple-scrollbar">
        {children}
      </main>
    </div>
  );
}
