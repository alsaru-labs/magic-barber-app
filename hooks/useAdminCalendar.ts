"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fetchAppointmentsForDate, updateAppointmentStatus } from "@/lib/services/appointments";
import { fetchAdminBarbers } from "@/lib/services/barbers";

export function useAdminCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBarbers, setIsLoadingBarbers] = useState(false);
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

  // Fetch barbers list on mount
  const loadBarbers = async () => {
    setIsLoadingBarbers(true);
    try {
      const data = await fetchAdminBarbers();
      setBarbers(data);
    } catch (err: any) {
      console.error("Error loading barbers in admin calendar:", err.message);
    } finally {
      setIsLoadingBarbers(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  useEffect(() => {
    loadBarbers();
  }, []);

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

  // Reassign barber wrapper
  const handleReassignBarber = async (appointmentId: string, newBarberId: string) => {
    setIsUpdating(true);
    setErrorMsg(null);
    try {
      await updateAppointmentStatus(appointmentId, undefined, newBarberId);
      
      if (selectedAppt && selectedAppt.id === appointmentId) {
        const selectedBarber = barbers.find((b) => b.id === newBarberId);
        setSelectedAppt((prev: any) => ({ 
          ...prev, 
          peluquero_id: newBarberId,
          peluqueros: selectedBarber ? { nombre: selectedBarber.nombre } : null
        }));
      }

      await fetchAppointments();
    } catch (err: any) {
      console.error("Error reassigning barber:", err.message);
      if (err.code === "23505") {
        setErrorMsg("Este peluquero ya tiene otra cita activa a esta misma hora.");
      } else {
        setErrorMsg(err.message || "Error al reasignar el peluquero.");
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
    barbers,
    isLoading,
    isLoadingBarbers,
    selectedAppt,
    setSelectedAppt,
    isDialogOpen,
    setIsDialogOpen,
    isUpdating,
    errorMsg,
    setErrorMsg,
    fetchAppointments,
    handleUpdateStatus,
    handleReassignBarber,
    getLocalTime,
    handleOpenDialog,
    totalCount,
    pendingCount,
    confirmedCount,
    cancelledCount
  };
}
