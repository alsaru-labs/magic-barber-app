"use client";

import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Phone, 
  Scissors, 
  Check, 
  X, 
  AlertCircle,
  MessageSquare,
  TrendingUp,
  Clock3,
  CalendarCheck,
  CalendarX,
  Loader2,
  User,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useAdminCalendar } from "@/hooks/useAdminCalendar";
import { motion } from "framer-motion";

export default function AdminCalendar() {
  const {
    selectedDate,
    setSelectedDate,
    appointments,
    barbers,
    isLoading,
    isLoadingBarbers,
    selectedAppt,
    isDialogOpen,
    setIsDialogOpen,
    isUpdating,
    errorMsg,
    fetchAppointments,
    handleUpdateStatus,
    handleReassignBarber,
    getLocalTime,
    handleOpenDialog,
    totalCount,
    pendingCount,
    confirmedCount,
    cancelledCount
  } = useAdminCalendar();

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return (
          <span className="px-2.5 py-0.5 text-[8px] font-bold uppercase rounded-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/25 tracking-widest shrink-0">
            Confirmada
          </span>
        );
      case "cancelada":
        return (
          <span className="px-2.5 py-0.5 text-[8px] font-bold uppercase rounded-none bg-destructive/10 text-destructive border border-destructive/20 tracking-widest shrink-0">
            Cancelada
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[8px] font-bold uppercase rounded-none bg-primary/10 text-primary border border-primary/20 tracking-widest shrink-0">
            Pendiente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-0.5">
          <span className="text-[8px] font-mono tracking-[0.2em] text-primary uppercase font-bold">
            CONSOLA DE CONTROL
          </span>
          <h2 className="text-xl font-light tracking-wide text-foreground font-serif uppercase mt-0.5">
            Panel de Reservas
          </h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchAppointments}
          className="border-border hover:bg-secondary/40 text-muted-foreground hover:text-foreground rounded-none px-4 py-2.5 text-[9px] font-extrabold uppercase tracking-widest shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Actualizar Agenda
        </Button>
      </div>

      {/* Editorial Roster Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border bg-secondary/5">
        
        <div className="p-4 border-r border-b md:border-b-0 border-border space-y-1">
          <p className="text-[8px] font-extrabold uppercase tracking-widest text-muted-foreground">TOTAL CITAS</p>
          <h4 className="text-xl font-light text-foreground font-serif">{totalCount}</h4>
        </div>

        <div className="p-4 border-r border-b md:border-b-0 border-border space-y-1">
          <p className="text-[8px] font-extrabold uppercase tracking-widest text-primary">PENDIENTES</p>
          <h4 className="text-xl font-light text-primary font-serif">{pendingCount}</h4>
        </div>

        <div className="p-4 border-r border-border space-y-1">
          <p className="text-[8px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-450">CONFIRMADAS</p>
          <h4 className="text-xl font-light text-emerald-600 dark:text-emerald-450 font-serif">{confirmedCount}</h4>
        </div>

        <div className="p-4 space-y-1">
          <p className="text-[8px] font-extrabold uppercase tracking-widest text-destructive">CANCELADAS</p>
          <h4 className="text-xl font-light text-destructive font-serif">{cancelledCount}</h4>
        </div>

      </div>

      {/* Main Grid Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Calendar Picker (Sharp) */}
        <div className="border border-border p-4 bg-secondary/5 lg:col-span-4 flex flex-col items-center">
          <span className="text-[8px] font-extrabold text-muted-foreground uppercase tracking-widest border-b border-border pb-2 w-full text-center block mb-4">
            Calendario
          </span>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="border-0 p-0"
            classNames={{
              selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-none font-bold",
              today: "text-primary border border-primary/30 rounded-none font-semibold",
            }}
          />
        </div>

        {/* Daily agenda appointments (macOS Reminders / list - sharp) */}
        <div className="border border-border lg:col-span-8 flex flex-col min-h-[400px]">
          <div className="border-b border-border py-4 px-6 bg-secondary/15 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Agenda Diaria</h3>
            <span className="text-[9px] font-mono tracking-widest uppercase text-primary font-bold">
              {selectedDate ? format(selectedDate, "dd / MM / yyyy", { locale: es }) : ""}
            </span>
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-start overflow-y-auto apple-scrollbar">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2 flex-1">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-[9px] tracking-widest uppercase">Cargando reservas...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border bg-secondary/5 gap-3 text-center px-4 flex-1">
                <CalendarIcon className="w-6 h-6 text-muted-foreground/35" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground">Sin Citas Agendadas</p>
                  <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px] leading-normal uppercase">
                    No hay reservas registradas en el día.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1 apple-scrollbar">
                {appointments.map((appt, idx) => (
                  <div
                    key={appt.id}
                    onClick={() => handleOpenDialog(appt)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-border/60 hover:pl-2 cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      {/* Serif Number Indicator */}
                      <span className="font-serif text-sm font-light text-primary/40 min-w-[20px]">
                        0{idx + 1}
                      </span>
                      
                      {/* Time text */}
                      <span className="text-xs font-bold tracking-widest text-primary shrink-0">
                        {getLocalTime(appt.fecha_hora)} HS
                      </span>
                      
                      {/* Client info details */}
                      <div className="space-y-0.5 pl-2 border-l border-border/40">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          {appt.nombre} {appt.apellidos}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground uppercase font-light">
                          <span>{appt.servicio}</span>
                          <span>•</span>
                          <span>{appt.peluqueros?.nombre || "Sin Asignar"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 pl-0 sm:pl-4 pt-2 sm:pt-0 shrink-0 select-none">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {appt.telefono_whatsapp}
                      </span>
                      {getStatusBadge(appt.estado)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Detail Dialog (Sharp macOS Sheet) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-popover border border-border text-foreground max-w-md rounded-none p-6 shadow-2xl relative">
          
          {/* Top Gold Accent Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary" />

          {selectedAppt && (
            <>
              <DialogHeader className="pb-3 border-b border-border">
                <DialogTitle className="text-xs font-extrabold uppercase tracking-widest text-foreground">
                  Detalles de la Reserva
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-[9px] font-mono tracking-widest uppercase">
                  Cita ID: {selectedAppt.id.substring(0, 8)}
                </DialogDescription>
              </DialogHeader>

              {/* Detail fields */}
              <div className="space-y-4 py-4 text-xs md:text-sm leading-relaxed uppercase tracking-wider font-light">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground font-bold text-[8px] tracking-widest mt-0.5">Cliente:</span>
                  <span className="col-span-2 font-bold text-foreground">{selectedAppt.nombre} {selectedAppt.apellidos}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground font-bold text-[8px] tracking-widest mt-0.5">Servicio:</span>
                  <span className="col-span-2 font-bold text-primary">{selectedAppt.servicio}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground font-bold text-[8px] tracking-widest mt-0.5">Horario:</span>
                  <span className="col-span-2 font-bold text-foreground">
                    {format(new Date(selectedAppt.fecha_hora), "dd/MM/yyyy")} a las {getLocalTime(selectedAppt.fecha_hora)} HS
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-muted-foreground font-bold text-[8px] tracking-widest">Peluquero:</span>
                  <div className="col-span-2">
                    <select
                      value={selectedAppt.peluquero_id || ""}
                      onChange={(e) => handleReassignBarber(selectedAppt.id, e.target.value)}
                      disabled={isUpdating}
                      className="w-full bg-secondary/35 border-0 border-b border-border text-foreground text-xs font-bold py-2 px-1 focus:outline-none focus:border-primary cursor-pointer rounded-none uppercase"
                    >
                      <option value="" disabled>Asignar Profesional</option>
                      {barbers.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.nombre} {!b.activo && "(Inactivo)"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground font-bold text-[8px] tracking-widest mt-0.5">Contacto:</span>
                  <span className="col-span-2 font-bold text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                    {selectedAppt.telefono_whatsapp}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-muted-foreground font-bold text-[8px] tracking-widest">Estado:</span>
                  <span className="col-span-2">{getStatusBadge(selectedAppt.estado)}</span>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive font-bold uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Dialog Footer Actions */}
              <DialogFooter className="flex flex-col sm:flex-row gap-2 border-t border-border pt-4">
                
                {/* Chat via WhatsApp */}
                <Button
                  onClick={() => {
                    const message = `Hola ${selectedAppt.nombre}, te escribimos de Magic Barber sobre tu cita para ${selectedAppt.servicio}...`;
                    window.open(`https://wa.me/${selectedAppt.telefono_whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
                  }}
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold gap-2 py-5 rounded-none flex-1 text-xs uppercase tracking-widest cursor-pointer border border-[#25D366] hover:shadow-lg transition-all"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  Chat WhatsApp
                </Button>

                <div className="flex gap-2 flex-1 w-full">
                  {/* Cancel Button */}
                  {selectedAppt.estado !== "cancelada" && (
                    <Button
                      variant="outline"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(selectedAppt.id, "cancelada")}
                      className="border-border text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 font-bold py-5 rounded-none flex-1 bg-transparent text-xs uppercase tracking-widest cursor-pointer transition-all"
                    >
                      <X className="w-4 h-4 mr-1.5" />
                      Cancelar
                    </Button>
                  )}

                  {/* Confirm Button */}
                  {selectedAppt.estado !== "confirmada" && (
                    <Button
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(selectedAppt.id, "confirmada")}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-5 rounded-none flex-1 text-xs uppercase tracking-widest cursor-pointer hover:shadow-lg transition-all border border-primary"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Confirmar
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
