import Link from "next/link";
import { Scissors, MapPin, Clock, ShieldCheck, Sparkles } from "lucide-react";
import BookingForm from "@/components/BookingForm";
import { BUSINESS } from "@/lib/config";
import { getVar } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const turnstileSiteKey =
    (await getVar("TURNSTILE_SITE_KEY")) ?? "1x00000000000000000000AA";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Header minimalista */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Scissors className="size-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-wide">
              {BUSINESS.name}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              {BUSINESS.address}
            </span>
            <Link
              href="/admin/login"
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Acceso Barbero
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-12 space-y-10">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-2xl mx-auto pt-2 sm:pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium tracking-wide">
            <Sparkles className="size-3" />
            <span>Reservas online instantáneas · Sin registro</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            El estilo que mereces, <br className="hidden sm:inline" />
            <span className="text-gold-gradient">en el momento justo.</span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
            {BUSINESS.tagline} Elige tu servicio, fecha y hora en menos de un minuto.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" /> Lun - Sáb: {BUSINESS.openTime} a {BUSINESS.closeTime}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" /> Confirmación directa vía WhatsApp
            </span>
          </div>
        </section>

        {/* Formulario de Reserva */}
        <section id="reservar" className="max-w-2xl mx-auto w-full">
          <BookingForm turnstileSiteKey={turnstileSiteKey} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {BUSINESS.name}. Todos los derechos reservados.
          </span>
          <span className="text-muted-foreground/60">
            Powered by Cloudflare Workers & D1 Edge Database
          </span>
        </div>
      </footer>
    </div>
  );
}
