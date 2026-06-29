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
  User
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
    fetchAppointments, // loadAppointments mapped or renamed
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
        return <span className="px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tracking-wider">Confirmada</span>;
      case "cancelada":
        return <span className="px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-full bg-destructive/10 text-destructive border border-destructive/20 tracking-wider">Cancelada</span>;
      default:
        return <span className="px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-full bg-primary/10 text-primary border border-primary/20 tracking-wider">Pendiente</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">Panel de Reservas</h2>
          <p className="text-muted-foreground text-xs md:text-sm">Administra las citas diarias, confirma solicitudes y reasigna barberos.</p>
        </div>
      </div>

      {/* Overview Stats (M3 widgets style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border/80 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Citas</p>
              <h4 className="text-2xl font-extrabold text-foreground mt-1 font-heading">{totalCount}</h4>
            </div>
            <div className="p-2.5 bg-primary/15 text-primary rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pendientes</p>
              <h4 className="text-2xl font-extrabold text-primary mt-1 font-heading">{pendingCount}</h4>
            </div>
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Clock3 className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Confirmadas</p>
              <h4 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-450 mt-1 font-heading">{confirmedCount}</h4>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded-xl">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Canceladas</p>
              <h4 className="text-2xl font-extrabold text-destructive mt-1 font-heading">{cancelledCount}</h4>
            </div>
            <div className="p-2.5 bg-destructive/10 text-destructive rounded-xl">
              <CalendarX className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Calendar Picker + Daily Appointment List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Calendar Card Selector */}
        <Card className="bg-card border-border lg:col-span-4 p-4 flex flex-col items-center rounded-2xl shadow-sm">
          <CardHeader className="p-2 pb-4 text-center">
            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">Calendario</CardTitle>
          </CardHeader>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="border-0 p-0"
            classNames={{
              selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full font-bold",
              today: "text-primary border border-primary/30 rounded-full",
            }}
          />
        </Card>

        {/* Appointments List Card (Google Calendar style list) */}
        <Card className="bg-card border-border lg:col-span-8 overflow-hidden min-h-[400px] rounded-2xl shadow-sm">
          <CardHeader className="border-b border-border/85 py-4 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground font-heading">Agenda Diaria</CardTitle>
              <CardDescription className="text-muted-foreground text-xs mt-0.5">
                {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es }) : "No hay fecha seleccionada"}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAppointments} // uses LoadAppointments ref in custom hook
              className="border-border text-muted-foreground hover:bg-secondary rounded-full px-4 text-xs font-bold"
            >
              Recargar
            </Button>
          </CardHeader>
          
          <CardContent className="p-6">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <span className="text-xs">Cargando reservaciones...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-2xl bg-secondary/10 gap-3 text-center px-4">
                <CalendarIcon className="w-8 h-8 text-muted-foreground/60" />
                <div>
                  <p className="font-bold text-foreground text-sm font-heading">Sin Citas Agendadas</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-normal">No hay reservas registradas para esta fecha en el sistema.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    onClick={() => handleOpenDialog(appt)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border/70 bg-secondary/20 hover:border-primary/50 hover:bg-primary/[0.01] cursor-pointer transition-all duration-150"
                  >
                    <div className="flex items-center gap-4">
                      {/* Time Badge Google Style */}
                      <div className="flex items-center gap-1.5 text-primary font-extrabold bg-primary/10 border border-primary/20 py-1.5 px-3.5 rounded-full text-xs shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        {getLocalTime(appt.fecha_hora)}
                      </div>
                      
                      {/* Client & Service Info */}
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-foreground text-sm font-heading">{appt.nombre} {appt.apellidos}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5">
                            <Scissors className="w-3.5 h-3.5 text-primary/70" />
                            {appt.servicio}
                          </span>
                          <span className="flex items-center gap-1.5 border-l border-border/60 pl-3">
                            <User className="w-3.5 h-3.5 text-primary/70" />
                            {appt.peluqueros?.nombre || "Sin Asignar"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 pl-0 sm:pl-4 border-t sm:border-t-0 border-border/60 pt-2.5 sm:pt-0 shrink-0">
                      <span className="text-xs font-semibold text-muted-foreground block sm:inline">{appt.telefono_whatsapp}</span>
                      {getStatusBadge(appt.estado)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appointment Detail Dialog (Google styling) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-3xl p-6">
          {selectedAppt && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-foreground font-heading">
                  Detalles de la Cita
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs">
                  Cita ID: {selectedAppt.id.substring(0, 8)}...
                </DialogDescription>
              </DialogHeader>

              {/* Detail list */}
              <div className="space-y-3.5 py-4 border-y border-border/80 text-xs md:text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px] mt-0.5">Cliente:</span>
                  <span className="col-span-2 font-bold text-foreground">{selectedAppt.nombre} {selectedAppt.apellidos}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px] mt-0.5">Servicio:</span>
                  <span className="col-span-2 font-bold text-primary">{selectedAppt.servicio}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px] mt-0.5">Horario:</span>
                  <span className="col-span-2 font-semibold text-foreground">
                    {format(new Date(selectedAppt.fecha_hora), "dd/MM/yyyy")} a las {getLocalTime(selectedAppt.fecha_hora)} hs
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px] mt-0.5">Peluquero:</span>
                  <div className="col-span-2">
                    <select
                      value={selectedAppt.peluquero_id || ""}
                      onChange={(e) => handleReassignBarber(selectedAppt.id, e.target.value)}
                      disabled={isUpdating}
                      className="w-full bg-secondary/80 border border-border text-foreground text-xs font-semibold py-1.5 px-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50"
                    >
                      <option value="" disabled>Seleccionar Peluquero</option>
                      {barbers.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.nombre} {!b.activo && "(Inactivo)"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px] mt-0.5">Teléfono:</span>
                  <span className="col-span-2 font-semibold text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {selectedAppt.telefono_whatsapp}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Estado:</span>
                  <span className="col-span-2">{getStatusBadge(selectedAppt.estado)}</span>
                </div>

                {errorMsg && (
                  <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Dialog Action Buttons */}
              <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                {/* WhatsApp Chat Button */}
                <Button
                  onClick={() => {
                    const message = `Hola ${selectedAppt.nombre}, te escribimos de Magic Barber sobre tu cita para ${selectedAppt.servicio}...`;
                    window.open(`https://wa.me/${selectedAppt.telefono_whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
                  }}
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold gap-2 py-5 rounded-xl flex-1 text-xs cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  Abrir WhatsApp
                </Button>

                <div className="flex gap-2 flex-1 w-full">
                  {/* Cancel Button */}
                  {selectedAppt.estado !== "cancelada" && (
                    <Button
                      variant="outline"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(selectedAppt.id, "cancelada")}
                      className="border-border text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 font-bold py-5 rounded-xl flex-1 bg-transparent text-xs cursor-pointer"
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
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-5 rounded-xl flex-1 text-xs cursor-pointer"
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
