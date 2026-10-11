import Link from "next/link";
import { Scissors, MapPin, Clock, ShieldCheck, Sparkles, CheckCircle2, Zap } from "lucide-react";
import BookingForm from "@/components/BookingForm";
import { BUSINESS } from "@/lib/config";
import { getVar } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const turnstileSiteKey =
    (await getVar("TURNSTILE_SITE_KEY")) ?? "1x00000000000000000000AA";

  return (
    <div className="relative min-h-screen text-foreground flex flex-col selection:bg-amber-400/20 selection:text-amber-300 overflow-x-hidden">
      {/* 1. Malla de luz ambiental líquida (Fluid Mesh Glow 2026) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Orbe superior dorado cálido */}
        <div className="absolute -top-24 sm:-top-32 left-1/2 -translate-x-1/2 w-[550px] sm:w-[850px] h-[450px] rounded-full bg-gradient-to-b from-amber-500/20 via-yellow-500/10 to-transparent blur-[120px] opacity-80" />
        
        {/* Destellos de refracción lateral */}
        <div className="absolute top-[28%] -left-[12%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-amber-600/10 via-indigo-500/5 to-transparent blur-[140px] opacity-60" />
        <div className="absolute top-[48%] -right-[12%] w-[420px] h-[420px] rounded-full bg-gradient-to-tl from-amber-400/10 via-rose-500/5 to-transparent blur-[140px] opacity-60" />
        
        {/* Micro-textura de vidrio esmerilado */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* 2. Header flotante tipo Cápsula / Dynamic Glass Island */}
      <div className="sticky top-3 sm:top-5 z-40 px-3 sm:px-4 w-full">
        <header className="max-w-4xl mx-auto liquid-glass rounded-full px-3.5 sm:px-6 h-13 sm:h-15 flex items-center justify-between shadow-2xl transition-all">
          {/* Logo y Marca */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="size-8 sm:size-9 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
              <Scissors className="size-4 sm:size-4.5" />
            </div>
            <div>
              <span className="font-display font-bold text-base sm:text-lg tracking-wide leading-none block">
                {BUSINESS.name}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium block">
                Hairstudio & Shave
              </span>
            </div>
          </div>

          {/* Accesos rápidos e info */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-muted-foreground">
              <MapPin className="size-3.5 text-amber-400" />
              {BUSINESS.address}
            </span>

            <Link
              href="/admin/login"
              className="text-xs text-muted-foreground/80 hover:text-foreground transition-all px-3 py-1.5 rounded-full liquid-glass-subtle liquid-glass-interactive font-medium"
            >
              Acceso Barbero
            </Link>
          </div>
        </header>
      </div>

      {/* 3. Contenido Principal */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-4 pt-6 sm:pt-10 pb-16 space-y-10 sm:space-y-14">
        {/* Hero Section */}
        <section className="text-center space-y-4 sm:space-y-5 max-w-2xl mx-auto pt-2 sm:pt-4">
          {/* Badge estilo Apple Liquid Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-[11px] sm:text-xs font-medium tracking-wide text-foreground/90">
            <Sparkles className="size-3 text-amber-400" />
            <span>Reservas Online · Sin Registro Obligatorio</span>
          </div>

          {/* Título Principal con tipografía líquida */}
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12]">
            El estilo que buscas,
            <span className="text-liquid-gold block mt-1 sm:mt-2">
              en el momento exacto.
            </span>
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            {BUSINESS.tagline} Elige tu servicio, fecha y hora en menos de un minuto con confirmación directa en WhatsApp.
          </p>

          {/* Píldoras de detalles en vidrio líquido */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-subtle">
              <Clock className="size-3.5 text-amber-400" />
              <span>Lun - Sáb: {BUSINESS.openTime} a {BUSINESS.closeTime}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-subtle">
              <ShieldCheck className="size-3.5 text-amber-400" />
              <span>Confirmación 1-Tap por WhatsApp</span>
            </div>
          </div>
        </section>

        {/* Formulario de Reserva con chasis Liquid Glass */}
        <section id="reservar" className="max-w-2xl mx-auto w-full">
          <BookingForm turnstileSiteKey={turnstileSiteKey} />
        </section>

        {/* 4. Tarjetas de Características en Vidrio Líquido (Feature Glass Grid) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 max-w-4xl mx-auto pt-4">
          <div className="liquid-glass-subtle liquid-glass-interactive rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="size-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
              <Scissors className="size-4.5" />
            </div>
            <h3 className="font-display font-semibold text-base text-foreground">
              Corte & Estilo Artesanal
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Asesoramiento personalizado según tu fisonomía, degradados precisos y arreglo de barba al detalle.
            </p>
          </div>

          <div className="liquid-glass-subtle liquid-glass-interactive rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="size-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
              <Zap className="size-4.5" />
            </div>
            <h3 className="font-display font-semibold text-base text-foreground">
              Reserva en 30 Segundos
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sin descargas de aplicaciones ni cuentas obligatorias. Disponibilidad en tiempo real desde el Edge.
            </p>
          </div>

          <div className="liquid-glass-subtle liquid-glass-interactive rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="size-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
              <CheckCircle2 className="size-4.5" />
            </div>
            <h3 className="font-display font-semibold text-base text-foreground">
              Garantía & WhatsApp
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enlace directo para confirmar tu cita y recibir recordatorios sin spam ni complicaciones.
            </p>
          </div>
        </section>
      </main>

      {/* 5. Footer Flotante en Vidrio Líquido */}
      <footer className="px-3 sm:px-4 pb-6 pt-2">
        <div className="max-w-4xl mx-auto liquid-glass-subtle rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>© {new Date().getFullYear()} {BUSINESS.name}. Todos los derechos reservados.</span>
          </div>
          <span className="text-muted-foreground/60 text-[11px]">
            Diseño Apple Liquid Glass · Cloudflare D1 Edge
          </span>
        </div>
      </footer>
    </div>
  );
}
