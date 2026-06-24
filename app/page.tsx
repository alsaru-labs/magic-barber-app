"use client";

import React from "react";
import BookingForm from "@/components/BookingForm";
import { Scissors, Star, MapPin, Clock, Phone, Compass, Share2, Globe } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F0F4F9] dark:bg-[#121212] text-foreground flex flex-col">
      {/* Global Desktop Navigation Header */}
      <header className="w-full bg-background border-b border-border/80 px-6 py-4 flex items-center justify-between sticky top-0 z-25">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-200">
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
        <div className="w-full max-w-md sm:rounded-3xl bg-card border-0 sm:border border-border sm:shadow-lg overflow-hidden flex flex-col relative min-h-screen sm:min-h-auto sm:my-4">
          
          {/* Cover Header Banner */}
          <div className="w-full h-40 bg-gradient-to-br from-primary via-[#1a73e8] to-[#0842a0] relative flex items-center justify-center text-white p-6 shrink-0">
            <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
            <div className="relative text-center space-y-1">
              <div className="inline-flex p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/80">Estilo & Precisión</p>
            </div>
          </div>

          {/* Place Header Info Card (Google Maps Style) */}
          <div className="p-5 border-b border-border bg-card shrink-0 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
                  Magic Barber Shop
                </h1>
                <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full uppercase">
                  Premium
                </span>
              </div>
              
              {/* Star Rating */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-sm font-bold text-foreground">4.9</span>
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-xs text-muted-foreground">(184 reseñas) • Barbería</span>
              </div>
            </div>

            {/* Google Quick Actions Buttons */}
            <div className="grid grid-cols-4 gap-2 border-y border-border/80 py-3">
              <a 
                href="tel:34600000000" 
                className="flex flex-col items-center gap-1 text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-secondary group-hover:bg-primary/10 flex items-center justify-center text-primary transition-all duration-200">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-all duration-200">Llamar</span>
              </a>

              <a 
                href="https://maps.google.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-secondary group-hover:bg-primary/10 flex items-center justify-center text-primary transition-all duration-200">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-all duration-200">Cómo llegar</span>
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
                className="flex flex-col items-center gap-1 text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-secondary group-hover:bg-primary/10 flex items-center justify-center text-primary transition-all duration-200">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-all duration-200">Compartir</span>
              </button>

              <a 
                href="#"
                className="flex flex-col items-center gap-1 text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-secondary group-hover:bg-primary/10 flex items-center justify-center text-primary transition-all duration-200">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-all duration-200">Sitio Web</span>
              </a>
            </div>

            {/* Quick Place Information details */}
            <div className="space-y-2.5 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Centro Ciudad, 12 • 28001 Madrid</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>Abierto • L-S: 10:00 - 20:00</span>
              </div>
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

