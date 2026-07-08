"use client";

import React, { useState, useEffect } from "react";
import BookingForm from "@/components/BookingForm";
import { 
  Scissors, 
  MapPin, 
  Phone, 
  Compass, 
  Share2, 
  Sun, 
  Moon, 
  Star
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isLight = document.documentElement.classList.contains("light") || localStorage.getItem("theme") === "light";
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative flex flex-col lg:h-screen lg:overflow-hidden">
      
      {/* 50/50 Grid container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-full w-full">
        
        {/* Left Side: Immersive Lookbook Editorial Hero (Visible on desktop, stacked on mobile) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative bg-secondary/15 dark:bg-black/20 overflow-y-auto lg:h-full apple-scrollbar border-b lg:border-b-0 border-border">
          
          {/* Header brand details on left */}
          <Link href="/" className="flex items-center gap-2 group self-start shrink-0">
            <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
              <Scissors className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-foreground">
              MAGIC BARBER
            </span>
          </Link>

          {/* Huge Editorial Statement */}
          <div className="my-12 lg:my-auto space-y-8 max-w-md">
            <span className="text-[9px] tracking-[0.3em] uppercase text-primary font-bold block">
              ESTABLISHED 2026 / MADRID
            </span>
            <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-foreground font-serif leading-[1.05]">
              El ritual <br />
              del cuidado <br />
              <span className="text-gold-gradient font-normal italic">masculino</span>.
            </h1>
            <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wider font-light">
              Un espacio de alta precisión diseñado para hombres que aprecian la sofisticación de la barbería clásica.
            </p>

            {/* Asymmetric lookbook list */}
            <div className="space-y-6 pt-6 border-t border-border">
              <div className="flex gap-4">
                <span className="text-[10px] font-mono text-primary font-bold">01</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Afeitado de Autor</h4>
                  <p className="text-[11px] text-muted-foreground font-light mt-1">Ritual tradicional con navaja y toallas calientes.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-[10px] font-mono text-primary font-bold">02</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Cortes de Precisión</h4>
                  <p className="text-[11px] text-muted-foreground font-light mt-1">Perfilados milimétricos y asesoría de imagen.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Micro Footer left */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest pt-4 shrink-0">
            <Star className="w-3.5 h-3.5 fill-primary text-primary" />
            <span>Rating 4.9</span>
            <span>•</span>
            <span>184 Opiniones</span>
          </div>

        </div>

        {/* Right Side: The Booking Canvas (Full height, scrollable) */}
        <div className="lg:col-span-7 flex flex-col justify-between overflow-y-auto lg:h-full lg:editorial-canvas relative bg-card apple-scrollbar">
          
          {/* Header block (Apple nav) */}
          <div className="px-6 py-5 border-b border-border flex items-center justify-between sticky top-0 bg-background/85 backdrop-blur-xl z-20 shrink-0">
            <div className="space-y-0.5">
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-foreground">
                Reservar Experiencia
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <MapPin className="w-3 h-3 text-primary shrink-0" />
                <span>Calle Mayor 12, Madrid</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {mounted && (
                <button 
                  onClick={toggleTheme}
                  aria-label="Alternar tema"
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:border-foreground text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-350"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-primary" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-600 animate-pulse-slow" />
                  )}
                </button>
              )}
              <Link 
                href="/admin" 
                className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground border border-border px-3 py-2 transition-all hover:border-foreground"
              >
                ADMIN
              </Link>
            </div>
          </div>

          {/* Quick contact / directions banner */}
          <div className="px-6 py-4 border-b border-border bg-secondary/5 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-muted-foreground uppercase tracking-widest shrink-0">
            <a href="tel:34600000000" className="hover:text-primary transition-colors flex items-center gap-1.5 font-bold">
              <Phone className="w-3.5 h-3.5" />
              Llamar
            </a>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5 font-bold">
              <Compass className="w-3.5 h-3.5" />
              Dirección
            </a>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Magic Barber Shop',
                    text: 'Reserva tu cita en Magic Barber',
                    url: window.location.href,
                  });
                }
              }}
              className="hover:text-primary transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Compartir
            </button>
          </div>

          {/* Booking Form component */}
          <div className="flex-1 flex flex-col py-4">
            <BookingForm />
          </div>

          {/* Footer details */}
          <footer className="px-6 py-6 border-t border-border bg-secondary/5 text-[9px] text-muted-foreground uppercase tracking-[0.15em] text-center shrink-0">
            <p>© {new Date().getFullYear()} Magic Barber. Todos los derechos reservados.</p>
          </footer>

        </div>

      </div>
    </div>
  );
}
