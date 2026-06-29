"use client";

import React from "react";
import BookingForm from "@/components/BookingForm";
import { Scissors, Star, MapPin, Clock, Phone, Compass, Share2, Globe } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Global Desktop Navigation Header */}
      <header className="w-full bg-background/80 backdrop-blur-md border-b border-border/60 px-6 py-4 flex items-center justify-between sticky top-0 z-25">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 group-hover:border group-hover:border-primary/30 transition-all duration-200">
              <Scissors className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground font-heading">
              Magic<span className="text-primary font-extrabold">Barber</span>
            </span>
          </Link>

          <Link 
            href="/admin" 
            className="text-xs font-bold tracking-wide uppercase text-muted-foreground hover:text-primary border border-border hover:bg-secondary px-4 py-2 rounded-full transition-all duration-200"
          >
            Acceso Admin
          </Link>
        </div>
      </header>

      {/* Main Content: Mobile Container centered on desktop */}
      <main className="flex-1 flex flex-col items-center justify-center p-0 sm:p-6 md:py-10">
        <div className="w-full max-w-md sm:rounded-[28px] bg-card border-0 sm:border border-border/80 sm:shadow-2xl overflow-hidden flex flex-col relative min-h-screen sm:min-h-auto sm:my-4 shadow-black/[0.03]">
          
          {/* Cover Header Banner */}
          <div className="w-full h-44 bg-gradient-to-br from-[#1A1816] via-[#11100F] to-[#25201A] relative flex flex-col items-center justify-center text-white p-6 shrink-0 border-b border-border/40">
            <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
            <div className="relative text-center space-y-2">
              <div className="inline-flex p-3 bg-primary/10 backdrop-blur-md rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(216,178,115,0.15)]">
                <Scissors className="w-6 h-6 text-primary" />
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Estilo & Precisión</p>
            </div>
          </div>

          {/* Elegant Brand Header */}
          <div className="p-6 border-b border-border/80 bg-card space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
                  Magic Barber Shop
                </h1>
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Premium Barbería
                </span>
              </div>
              
              {/* Elegantly styled details */}
              <div className="flex flex-wrap gap-y-1.5 gap-x-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                  <span className="font-bold text-foreground">4.9</span>
                  <span>(184 opiniones)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>L-S: 10:00 - 20:00</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Madrid Centro</span>
                </div>
              </div>
            </div>

            {/* Elegantes Botones de Acción de Estilo Premium (No Google Maps) */}
            <div className="flex gap-2 pt-2">
              <a 
                href="tel:34600000000" 
                className="flex-1 py-2.5 px-3 rounded-xl border border-border hover:border-primary/50 bg-secondary/45 hover:bg-primary/[0.04] text-foreground hover:text-primary transition-all duration-200 flex items-center justify-center gap-2 text-xs font-bold text-center"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Llamar</span>
              </a>

              <a 
                href="https://maps.google.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl border border-border hover:border-primary/50 bg-secondary/45 hover:bg-primary/[0.04] text-foreground hover:text-primary transition-all duration-200 flex items-center justify-center gap-2 text-xs font-bold text-center"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Ubicación</span>
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
                className="flex-1 py-2.5 px-3 rounded-xl border border-border hover:border-primary/50 bg-secondary/45 hover:bg-primary/[0.04] text-foreground hover:text-primary transition-all duration-200 flex items-center justify-center gap-2 text-xs font-bold text-center cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir</span>
              </button>
            </div>
          </div>

          {/* Booking Flow Form */}
          <div className="flex-1 flex flex-col bg-card">
            <BookingForm />
          </div>

          {/* Card Footer */}
          <footer className="py-6 text-center text-[10px] text-muted-foreground border-t border-border bg-secondary/35 mt-auto">
            <p>© {new Date().getFullYear()} Magic Barber Shop. Todos los derechos reservados.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

