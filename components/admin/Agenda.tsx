"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Phone,
  MessageCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Scissors,
  Loader2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Cita } from "@/lib/d1";
import type { EstadoCita } from "@/lib/config";

interface CitasApiResponse {
  citas?: Cita[];
  error?: string;
}

interface UpdateCitaApiResponse {
  cita?: Cita;
  error?: string;
}
import {
  addDays,
  formatFechaCorta,
  formatFechaLarga,
  nowInBusinessTz,
  startOfWeek,
} from "@/lib/schedule";
import { mensajeBarberoACliente, waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type ViewMode = "dia" | "semana";
type ScopeFilter = "todas" | "futuras" | "pasadas";

export default function AdminAgenda() {
  const [viewMode, setViewMode] = useState<ViewMode>("dia");
  const [scope, setScope] = useState<ScopeFilter>("todas");
  const [selectedDate, setSelectedDate] = useState(() => nowInBusinessTz().fecha);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Calcula el rango según la vista
  const { desde, hasta } = useMemo(() => {
    if (viewMode === "dia") {
      return { desde: selectedDate, hasta: selectedDate };
    } else {
      const lunes = startOfWeek(selectedDate);
      const domingo = addDays(lunes, 6);
      return { desde: lunes, hasta: domingo };
    }
  }, [viewMode, selectedDate]);

  // Carga las citas desde la API
  const fetchCitas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/citas?desde=${desde}&hasta=${hasta}&scope=${scope}`,
        { cache: "no-store" }
      );
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = (await res.json().catch(() => ({}))) as CitasApiResponse;
      if (res.ok) {
        setCitas(data.citas || []);
      } else {
        toast.error(data.error || "Error al cargar las citas.");
      }
    } catch {
      toast.error("Error de red al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [desde, hasta, scope]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  // Navegación de fechas
  function handlePrev() {
    const delta = viewMode === "dia" ? -1 : -7;
    setSelectedDate((prev) => addDays(prev, delta));
  }

  function handleNext() {
    const delta = viewMode === "dia" ? 1 : 7;
    setSelectedDate((prev) => addDays(prev, delta));
  }

  function handleToday() {
    setSelectedDate(nowInBusinessTz().fecha);
  }

  // Cambio de estado
  async function handleUpdateEstado(id: number, nuevoEstado: EstadoCita) {
    setUpdatingId(id);
    const prevCitas = [...citas];

    // Optimistic update
    setCitas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
    );

    try {
      const res = await fetch("/api/admin/citas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: nuevoEstado }),
      });
      const data = (await res.json().catch(() => ({}))) as UpdateCitaApiResponse;

      if (res.ok) {
        toast.success(`Cita marcada como ${nuevoEstado}.`);
      } else {
        // Rollback
        setCitas(prevCitas);
        toast.error(data.error || "No se pudo actualizar el estado.");
      }
    } catch {
      setCitas(prevCitas);
      toast.error("Error de red al actualizar la cita.");
    } finally {
      setUpdatingId(null);
    }
  }

  // Métricas rápidas
  const stats = useMemo(() => {
    const pendientes = citas.filter((c) => c.estado === "pendiente").length;
    const confirmadas = citas.filter((c) => c.estado === "confirmada").length;
    const canceladas = citas.filter((c) => c.estado === "cancelada").length;
    return { total: citas.length, pendientes, confirmadas, canceladas };
  }, [citas]);

  // Agrupación por días para la vista de semana
  const citasPorDia = useMemo(() => {
    const groups: Record<string, Cita[]> = {};
    if (viewMode === "semana") {
      const lunes = startOfWeek(selectedDate);
      for (let i = 0; i < 7; i++) {
        groups[addDays(lunes, i)] = [];
      }
    } else {
      groups[selectedDate] = [];
    }

    for (const c of citas) {
      if (!groups[c.fecha]) groups[c.fecha] = [];
      groups[c.fecha].push(c);
    }
    return groups;
  }, [citas, viewMode, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Barra de control superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 liquid-glass p-3 sm:p-4.5 rounded-3xl border border-white/12 shadow-2xl">
        {/* Selector de modo y filtros */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-9 bg-white/[0.04] border border-white/10 rounded-2xl p-0.5">
              <TabsTrigger
                value="dia"
                className="text-xs px-3.5 rounded-xl data-[state=active]:bg-amber-400 data-[state=active]:text-stone-950 data-[state=active]:font-bold data-[state=active]:shadow-md transition-all"
              >
                Día
              </TabsTrigger>
              <TabsTrigger
                value="semana"
                className="text-xs px-3.5 rounded-xl data-[state=active]:bg-amber-400 data-[state=active]:text-stone-950 data-[state=active]:font-bold data-[state=active]:shadow-md transition-all"
              >
                Semana
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1.5 liquid-glass-subtle rounded-xl px-2 py-1 border border-white/10 h-9">
            <Filter className="size-3.5 text-amber-400 ml-1" />
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as ScopeFilter)}
              className="bg-transparent text-xs text-foreground font-medium py-1 px-1.5 focus:outline-none cursor-pointer"
            >
              <option value="todas" className="bg-stone-900 text-foreground">Todas</option>
              <option value="futuras" className="bg-stone-900 text-foreground">Solo futuras</option>
              <option value="pasadas" className="bg-stone-900 text-foreground">Solo pasadas</option>
            </select>
          </div>
        </div>

        {/* Navegación temporal */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className="h-9 text-xs px-3.5 font-semibold text-amber-300 liquid-glass-subtle liquid-glass-interactive rounded-xl border border-white/10 touch-manipulation"
          >
            Hoy
          </Button>
          <div className="flex items-center gap-1 flex-1 sm:flex-initial justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              title="Anterior"
              className="size-9 shrink-0 liquid-glass-subtle liquid-glass-interactive rounded-xl touch-manipulation"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="text-center font-bold text-xs sm:text-sm px-1.5 min-w-28 sm:min-w-36 truncate text-foreground">
              {viewMode === "dia" ? (
                <span className="capitalize">{formatFechaLarga(selectedDate)}</span>
              ) : (
                <span>
                  {formatFechaCorta(desde)} - {formatFechaCorta(hasta)}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              title="Siguiente"
              className="size-9 shrink-0 liquid-glass-subtle liquid-glass-interactive rounded-xl touch-manipulation"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchCitas}
            disabled={loading}
            title="Recargar agenda"
            className="size-9 shrink-0 liquid-glass-subtle liquid-glass-interactive rounded-xl touch-manipulation"
          >
            <RotateCcw className={cn("size-4 text-amber-400", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="liquid-glass-subtle liquid-glass-interactive rounded-2xl p-3 sm:p-4 border border-white/10 space-y-1">
          <span className="text-[11px] sm:text-xs text-muted-foreground block font-medium">Total Citas</span>
          <span className="text-xl sm:text-2xl font-bold font-display text-foreground block">{stats.total}</span>
        </div>

        <div className="liquid-glass-subtle liquid-glass-interactive rounded-2xl p-3 sm:p-4 border border-amber-400/35 bg-amber-400/[0.05] space-y-1 shadow-[0_4px_20px_rgba(250,204,21,0.08)]">
          <span className="text-[11px] sm:text-xs text-amber-300 block font-medium">Pendientes</span>
          <span className="text-xl sm:text-2xl font-bold font-display text-amber-300 block">{stats.pendientes}</span>
        </div>

        <div className="liquid-glass-subtle liquid-glass-interactive rounded-2xl p-3 sm:p-4 border border-emerald-400/35 bg-emerald-400/[0.05] space-y-1 shadow-[0_4px_20px_rgba(52,211,153,0.08)]">
          <span className="text-[11px] sm:text-xs text-emerald-400 block font-medium">Confirmadas</span>
          <span className="text-xl sm:text-2xl font-bold font-display text-emerald-400 block">{stats.confirmadas}</span>
        </div>

        <div className="liquid-glass-subtle liquid-glass-interactive rounded-2xl p-3 sm:p-4 border border-rose-400/35 bg-rose-400/[0.05] space-y-1">
          <span className="text-[11px] sm:text-xs text-rose-400 block font-medium">Canceladas</span>
          <span className="text-xl sm:text-2xl font-bold font-display text-rose-400 block">{stats.canceladas}</span>
        </div>
      </div>

      {/* Lista / Grilla de citas */}
      {loading && citas.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-6 animate-spin text-amber-400" />
          <span className="text-sm">Cargando citas de la agenda…</span>
        </div>
      ) : citas.length === 0 ? (
        <div className="liquid-glass-subtle rounded-3xl border border-dashed border-white/15 text-center p-12">
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="size-14 rounded-full liquid-glass-pill flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(250,204,21,0.15)]">
              <CalendarIcon className="size-6 stroke-1" />
            </div>
            <p className="font-medium text-base text-foreground">
              No hay citas para este periodo o filtro.
            </p>
            <p className="text-xs text-muted-foreground/80 max-w-sm">
              Las reservas hechas por clientes aparecerán automáticamente aquí en tiempo real.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(citasPorDia).map(([fecha, lista]) => {
            if (viewMode === "semana" && lista.length === 0) return null;

            return (
              <div key={fecha} className="space-y-3">
                {viewMode === "semana" && (
                  <div className="sticky top-20 z-10 liquid-glass rounded-2xl px-4 py-2.5 border border-white/12 flex items-center justify-between shadow-xl">
                    <h3 className="font-display font-semibold text-base sm:text-lg capitalize flex items-center gap-2">
                      <CalendarIcon className="size-4 text-amber-400" />
                      {formatFechaLarga(fecha)}
                    </h3>
                    <span className="text-xs text-muted-foreground font-medium liquid-glass-pill px-2.5 py-0.5 rounded-full">
                      {lista.length} {lista.length === 1 ? "cita" : "citas"}
                    </span>
                  </div>
                )}

                <div className="grid gap-3">
                  {lista.map((cita) => (
                    <CitaCard
                      key={cita.id}
                      cita={cita}
                      isUpdating={updatingId === cita.id}
                      onUpdateEstado={handleUpdateEstado}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CitaCard({
  cita,
  isUpdating,
  onUpdateEstado,
}: {
  cita: Cita;
  isUpdating: boolean;
  onUpdateEstado: (id: number, estado: EstadoCita) => void;
}) {
  const whatsappUrl = waLink(
    cita.telefono_whatsapp,
    mensajeBarberoACliente({
      nombre: cita.nombre,
      apellidos: cita.apellidos,
      servicio: cita.servicio,
      fecha: cita.fecha,
      hora: cita.hora,
    })
  );

  return (
    <div
      className={cn(
        "p-3.5 sm:p-4.5 rounded-2xl transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border",
        cita.estado === "cancelada" && "opacity-55 liquid-glass-subtle border-dashed border-white/10",
        cita.estado === "pendiente" && "liquid-glass border-amber-400/35 bg-amber-400/[0.04] shadow-[0_6px_25px_rgba(250,204,21,0.08)]",
        cita.estado === "confirmada" && "liquid-glass border-emerald-400/35 bg-emerald-400/[0.04] shadow-[0_6px_25px_rgba(52,211,153,0.08)]"
      )}
    >
      {/* Columna Izquierda: Hora, Servicio y Datos del cliente */}
      <div className="flex items-start gap-3 sm:gap-4 min-w-0">
        {/* Bloque de hora */}
        <div className="size-12 sm:size-14 rounded-2xl liquid-glass-pill border-white/20 flex flex-col items-center justify-center shrink-0 shadow-md">
          <span className="text-xs sm:text-sm font-bold font-mono text-foreground leading-tight">
            {cita.hora}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="size-2.5 text-amber-400" /> {cita.duracion_min}m
          </span>
        </div>

        {/* Info */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-sm sm:text-base text-foreground truncate">
              {cita.nombre} {cita.apellidos}
            </span>
            <span
              className={cn(
                "capitalize text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full border",
                cita.estado === "pendiente" && "bg-amber-400/15 text-amber-300 border-amber-400/30",
                cita.estado === "confirmada" && "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
                cita.estado === "cancelada" && "bg-rose-400/15 text-rose-300 border-rose-400/25"
              )}
            >
              {cita.estado}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground/90 font-medium">
              <Scissors className="size-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{cita.servicio}</span>
            </span>
            <a
              href={`tel:+${cita.telefono_whatsapp}`}
              className="flex items-center gap-1 hover:text-amber-300 transition-colors"
            >
              <Phone className="size-3 text-muted-foreground shrink-0" />
              <span>+{cita.telefono_whatsapp}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Acciones rápidas ergonómicas para móvil */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 pt-2.5 md:pt-0 border-t md:border-t-0 border-white/10 w-full md:w-auto">
        {/* Contactar por WhatsApp */}
        <Button
          asChild
          variant="whatsapp"
          size="sm"
          className={cn(
            "text-xs h-9 sm:h-8.5 px-3 rounded-xl shadow-[0_0_18px_rgba(37,211,102,0.3)] active:scale-95 touch-manipulation font-semibold",
            cita.estado === "pendiente" ? "col-span-2 sm:col-span-1" : "col-span-1"
          )}
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir WhatsApp para contactar al cliente"
            className="flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="size-3.5 shrink-0" />
            WhatsApp
          </a>
        </Button>

        {/* Acciones de cambio de estado */}
        {cita.estado !== "confirmada" && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isUpdating}
            onClick={() => onUpdateEstado(cita.id, "confirmada")}
            className="text-xs h-9 sm:h-8.5 rounded-xl border border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/15 hover:text-emerald-300 active:scale-95 touch-manipulation w-full sm:w-auto liquid-glass-subtle font-medium"
          >
            <CheckCircle2 className="size-3.5 shrink-0" />
            Confirmar
          </Button>
        )}

        {cita.estado !== "cancelada" && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isUpdating}
            onClick={() => onUpdateEstado(cita.id, "cancelada")}
            className="text-xs h-9 sm:h-8.5 rounded-xl border border-rose-400/40 text-rose-400 hover:bg-rose-400/15 hover:text-rose-300 active:scale-95 touch-manipulation w-full sm:w-auto liquid-glass-subtle font-medium"
          >
            <XCircle className="size-3.5 shrink-0" />
            Cancelar
          </Button>
        )}

        {cita.estado === "cancelada" && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isUpdating}
            onClick={() => onUpdateEstado(cita.id, "pendiente")}
            className="text-xs h-9 sm:h-8.5 rounded-xl border border-amber-400/40 text-amber-300 hover:bg-amber-400/15 hover:text-amber-200 active:scale-95 touch-manipulation w-full sm:w-auto liquid-glass-subtle font-medium"
          >
            <RotateCcw className="size-3.5 shrink-0" />
            Reactivar
          </Button>
        )}
      </div>
    </div>
  );
}
