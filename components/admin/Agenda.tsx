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
  AlertCircle,
  RotateCcw,
  Scissors,
  Loader2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card/60 p-4 rounded-xl border border-border/40 backdrop-blur">
        {/* Selector de modo y filtros */}
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="dia">Día</TabsTrigger>
              <TabsTrigger value="semana">Semana</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg p-1 border border-border/30">
            <Filter className="size-3.5 text-muted-foreground ml-1.5" />
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as ScopeFilter)}
              className="bg-transparent text-xs text-foreground font-medium py-1 px-2 focus:outline-none cursor-pointer"
            >
              <option value="todas" className="bg-card">Todas las citas</option>
              <option value="futuras" className="bg-card">Solo futuras</option>
              <option value="pasadas" className="bg-card">Solo pasadas</option>
            </select>
          </div>
        </div>

        {/* Navegación temporal */}
        <div className="flex items-center justify-between lg:justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hoy
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrev} title="Anterior">
              <ChevronLeft className="size-4" />
            </Button>
            <div className="min-w-36 text-center font-medium text-sm">
              {viewMode === "dia" ? (
                <span className="capitalize">{formatFechaLarga(selectedDate)}</span>
              ) : (
                <span>
                  {formatFechaCorta(desde)} - {formatFechaCorta(hasta)}
                </span>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={handleNext} title="Siguiente">
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchCitas}
            disabled={loading}
            title="Recargar agenda"
          >
            <RotateCcw className={cn("size-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card/40 py-3 gap-1">
          <CardHeader className="py-0 px-4">
            <span className="text-xs text-muted-foreground">Total Citas</span>
          </CardHeader>
          <CardContent className="py-0 px-4">
            <span className="text-2xl font-bold font-display">{stats.total}</span>
          </CardContent>
        </Card>

        <Card className="bg-card/40 py-3 gap-1 border-warning/30">
          <CardHeader className="py-0 px-4">
            <span className="text-xs text-warning">Pendientes</span>
          </CardHeader>
          <CardContent className="py-0 px-4">
            <span className="text-2xl font-bold font-display text-warning">
              {stats.pendientes}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card/40 py-3 gap-1 border-success/30">
          <CardHeader className="py-0 px-4">
            <span className="text-xs text-success">Confirmadas</span>
          </CardHeader>
          <CardContent className="py-0 px-4">
            <span className="text-2xl font-bold font-display text-success">
              {stats.confirmadas}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card/40 py-3 gap-1 border-destructive/30">
          <CardHeader className="py-0 px-4">
            <span className="text-xs text-destructive">Canceladas</span>
          </CardHeader>
          <CardContent className="py-0 px-4">
            <span className="text-2xl font-bold font-display text-destructive">
              {stats.canceladas}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Lista / Grilla de citas */}
      {loading && citas.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="text-sm">Cargando citas de la agenda…</span>
        </div>
      ) : citas.length === 0 ? (
        <Card className="bg-card/30 border-dashed text-center p-12">
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <CalendarIcon className="size-10 stroke-1" />
            <p className="font-medium text-base text-foreground">
              No hay citas para este periodo o filtro.
            </p>
            <p className="text-xs">
              Las reservas hechas por clientes aparecerán automáticamente aquí.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(citasPorDia).map(([fecha, lista]) => {
            if (viewMode === "semana" && lista.length === 0) return null;

            return (
              <div key={fecha} className="space-y-3">
                {viewMode === "semana" && (
                  <div className="sticky top-16 z-10 bg-background/95 backdrop-blur py-2 border-b border-border/30 flex items-center justify-between">
                    <h3 className="font-display font-semibold text-lg capitalize flex items-center gap-2">
                      <CalendarIcon className="size-4 text-primary" />
                      {formatFechaLarga(fecha)}
                    </h3>
                    <span className="text-xs text-muted-foreground">
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
        "p-4 rounded-xl border bg-card/60 backdrop-blur transition-all flex flex-col md:flex-row md:items-center justify-between gap-4",
        cita.estado === "cancelada" && "opacity-60 bg-muted/20 border-dashed",
        cita.estado === "pendiente" && "border-warning/30 bg-warning/5",
        cita.estado === "confirmada" && "border-success/30 bg-success/5"
      )}
    >
      {/* Columna Izquierda: Hora, Servicio y Datos del cliente */}
      <div className="flex items-start gap-4">
        {/* Bloque de hora */}
        <div className="size-14 rounded-lg bg-background/80 border border-border/40 flex flex-col items-center justify-center shrink-0">
          <span className="text-sm font-bold font-mono text-foreground leading-tight">
            {cita.hora}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="size-2.5" /> {cita.duracion_min}m
          </span>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-base text-foreground">
              {cita.nombre} {cita.apellidos}
            </span>
            <Badge variant={cita.estado} className="capitalize text-[10px]">
              {cita.estado}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground/80">
              <Scissors className="size-3.5 text-primary" />
              {cita.servicio}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="size-3 text-muted-foreground" />
              +{cita.telefono_whatsapp}
            </span>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Acciones rápidas */}
      <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/30">
        {/* Contactar por WhatsApp */}
        <Button
          asChild
          variant="whatsapp"
          size="sm"
          className="text-xs h-8 px-3"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir WhatsApp para contactar al cliente"
          >
            <MessageCircle className="size-3.5" />
            WhatsApp
          </a>
        </Button>

        {/* Acciones de cambio de estado */}
        {cita.estado !== "confirmada" && (
          <Button
            variant="outline"
            size="sm"
            disabled={isUpdating}
            onClick={() => onUpdateEstado(cita.id, "confirmada")}
            className="text-xs h-8 border-success/40 text-success hover:bg-success/10 hover:text-success"
          >
            <CheckCircle2 className="size-3.5" />
            Confirmar
          </Button>
        )}

        {cita.estado !== "cancelada" && (
          <Button
            variant="outline"
            size="sm"
            disabled={isUpdating}
            onClick={() => onUpdateEstado(cita.id, "cancelada")}
            className="text-xs h-8 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <XCircle className="size-3.5" />
            Cancelar
          </Button>
        )}

        {cita.estado === "cancelada" && (
          <Button
            variant="outline"
            size="sm"
            disabled={isUpdating}
            onClick={() => onUpdateEstado(cita.id, "pendiente")}
            className="text-xs h-8 text-muted-foreground hover:text-foreground"
          >
            <AlertCircle className="size-3.5" />
            Reactivar
          </Button>
        )}
      </div>
    </div>
  );
}
