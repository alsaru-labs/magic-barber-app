"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fetchAppointmentsForDate, updateAppointmentStatus } from "@/lib/services/appointments";

export function useAdminCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch appointments for selected date
  const fetchAppointments = async () => {
    if (!selectedDate) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await fetchAppointmentsForDate(selectedDate);
      setAppointments(data);
    } catch (err: any) {
      console.error("Error fetching appointments:", err.message);
      setErrorMsg("Error al cargar las citas de este día.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  // Update status wrapper
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsUpdating(true);
    setErrorMsg(null);
    try {
      await updateAppointmentStatus(id, newStatus);

      if (selectedAppt && selectedAppt.id === id) {
        setSelectedAppt((prev: any) => ({ ...prev, estado: newStatus }));
      }

      await fetchAppointments();
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error("Error updating status:", err.message);
      if (err.code === "23505") {
        setErrorMsg("No se puede confirmar esta cita porque ya existe otra reserva activa en este horario.");
      } else {
        setErrorMsg(err.message || "Error al actualizar el estado de la cita.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getLocalTime = (isoString: string) => {
    const d = new Date(isoString);
    return format(d, "HH:mm");
  };

  const handleOpenDialog = (appt: any) => {
    setSelectedAppt(appt);
    setIsDialogOpen(true);
  };

  // Stats
  const totalCount = appointments.length;
  const pendingCount = appointments.filter(a => a.estado === "pendiente").length;
  const confirmedCount = appointments.filter(a => a.estado === "confirmada").length;
  const cancelledCount = appointments.filter(a => a.estado === "cancelada").length;

  return {
    selectedDate,
    setSelectedDate,
    appointments,
    isLoading,
    selectedAppt,
    setSelectedAppt,
    isDialogOpen,
    setIsDialogOpen,
    isUpdating,
    errorMsg,
    setErrorMsg,
    fetchAppointments,
    handleUpdateStatus,
    getLocalTime,
    handleOpenDialog,
    totalCount,
    pendingCount,
    confirmedCount,
    cancelledCount
  };
}
