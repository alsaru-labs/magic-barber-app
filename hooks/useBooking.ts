"use client";

import { useState, useEffect } from "react";
import { format, addDays, isPast, isToday } from "date-fns";
import { fetchBookedSlots, createAppointment } from "@/lib/services/appointments";

export interface ServiceType {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  colorClass: string;
}

export function useBooking() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [daysList, setDaysList] = useState<Date[]>([]);
  
  // Contact details
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    telefono: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate next 14 days
  useEffect(() => {
    const list = [];
    for (let i = 0; i < 14; i++) {
      list.push(addDays(new Date(), i));
    }
    setDaysList(list);
  }, []);

  // Fetch occupied slots from backend service
  useEffect(() => {
    if (!selectedDate) return;

    const loadBookedSlots = async () => {
      setIsLoadingSlots(true);
      setSelectedTime(null);
      
      try {
        const slots = await fetchBookedSlots(selectedDate);
        setBookedTimes(slots);
      } catch (err: any) {
        console.error("Error loading booked slots:", err.message);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    loadBookedSlots();
  }, [selectedDate]);

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Check if a time slot is in the past (only relevant for today)
  const isSlotPast = (slot: string) => {
    if (!selectedDate) return true;
    if (!isToday(selectedDate)) return false;

    const [hours, minutes] = slot.split(":").map(Number);
    const now = new Date();
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    return slotTime.getTime() < now.getTime();
  };

  const validateStep3 = () => {
    return formData.nombre.trim() !== "" && 
           formData.apellidos.trim() !== "" && 
           formData.telefono.trim().length >= 9;
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setErrorMessage("Por favor, completa los pasos anteriores.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Build selected date/time timestamp
      const appointmentDate = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);

      // Create appointment via backend service
      await createAppointment({
        nombre: formData.nombre.trim(),
        apellidos: formData.apellidos.trim(),
        telefono_whatsapp: formData.telefono.trim(),
        fecha_hora: appointmentDate.toISOString(),
        servicio: selectedService.title,
      });

      // Set success status
      setBookingSuccess(true);

    } catch (err: any) {
      if (err.code === "23505") {
        setErrorMessage("Lo sentimos, este horario acaba de ser reservado. Por favor, selecciona otra hora.");
      } else {
        setErrorMessage(err.message || "Ocurrió un error al procesar tu reserva. Inténtalo de nuevo.");
      }
      console.error("Booking Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    selectedService,
    setSelectedService,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    bookedTimes,
    isLoadingSlots,
    daysList,
    formData,
    isSubmitting,
    bookingSuccess,
    errorMessage,
    handleServiceSelect,
    handleTimeSelect,
    handleInputChange,
    isSlotPast,
    validateStep3,
    handleSubmit
  };
}
