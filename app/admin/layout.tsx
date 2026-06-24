"use client";

import React from "react";
import { 
  Scissors, 
  Calendar, 
  LogOut, 
  Menu, 
  X, 
  Loader2,
  UserCheck
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

  // If we're loading, show a fullscreen Google loading screen
  if (isLoading && pathname.startsWith("/admin/dashboard")) {
    return (
      <div className="min-h-screen bg-[#F0F4F9] dark:bg-[#121212] text-foreground flex flex-col items-center justify-center">
        <Loader2 className="w-9 h-9 animate-spin text-primary" />
        <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold mt-4">Verificando Credenciales...</p>
      </div>
    );
  }

  // If we are on the login page, render children directly without dashboard shell
  if (pathname === "/admin") {
    return <>{children}</>;
  }

  // For dashboard pages, render the Google Workspace Admin console style template
  return (
    <div className="min-h-screen bg-[#F0F4F9] dark:bg-[#121212] text-foreground flex flex-col md:flex-row relative">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border p-6 space-y-6 flex-shrink-0">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group px-2">
          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Scissors className="w-4.5 h-4.5" />
          </div>
          <span className="text-md font-bold tracking-tight text-foreground font-heading">
            Magic<span className="text-primary font-extrabold">Barber</span>
          </span>
        </Link>

        {/* User Profile Card */}
        {session?.user && (
          <div className="flex items-center gap-3 p-3.5 bg-secondary/60 rounded-2xl border border-border/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Admin</p>
              <p className="text-xs text-foreground truncate font-semibold">{session.user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 pt-4">
          <Link 
            href="/admin/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-150 ${
              pathname === "/admin/dashboard" 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Reservas de Hoy
          </Link>
        </nav>

        {/* Logout */}
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 border border-transparent flex items-center justify-start gap-3 w-full py-5 rounded-full text-xs font-bold uppercase tracking-wide"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </Button>
      </aside>

      {/* Header for Mobile */}
      <header className="md:hidden w-full bg-card border-b border-border px-6 py-4 flex items-center justify-between relative z-20 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary" />
          <span className="text-md font-bold tracking-tight text-foreground font-heading">
            Magic<span className="text-primary font-extrabold">Barber</span>
          </span>
        </Link>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[61px] left-0 w-full bg-card border-b border-border shadow-md z-20 flex flex-col p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          {session?.user && (
            <div className="flex items-center gap-3 p-3.5 bg-secondary/60 rounded-2xl border border-border/50 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Admin</p>
                <p className="text-xs text-foreground truncate font-semibold">{session.user.email}</p>
              </div>
            </div>
          )}

          <Link 
            href="/admin/dashboard" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-150 ${
              pathname === "/admin/dashboard" 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Reservas de Hoy
          </Link>

          <Button 
            variant="ghost" 
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleSignOut();
            }}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent flex items-center justify-start gap-3 w-full py-5 rounded-full text-xs font-bold uppercase tracking-wide"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-5 md:p-8 overflow-y-auto relative z-10">
        {children}
      </main>
    </div>
  );
}
