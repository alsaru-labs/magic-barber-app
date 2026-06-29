"use client";

import React from "react";
import { format, isToday, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scissors, 
  Smile, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2,
  MessageSquare,
  CalendarDays,
  Check,
  MapPin,
  Clock4
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBooking } from "@/hooks/useBooking";

// Define presentation pricing, description and titles for the services with icons
const SERVICES_CONFIG = [
  {
    id: "corte",
    title: "Corte de Pelo Premium",
    description: "Corte moderno o clásico, incluye lavado con champú especial, peinado y asesoramiento de imagen.",
    price: "18€",
    duration: "30 min",
    icon: Scissors,
    colorClass: "bg-primary/10 text-primary border border-primary/20",
  },
  {
    id: "barba",
    title: "Afeitado y Barba Imperial",
    description: "Perfilado milimétrico, toalla caliente para abrir poros, afeitado clásico a navaja y aceites hidratantes.",
    price: "12€",
    duration: "30 min",
    icon: Smile,
    colorClass: "bg-accent text-accent-foreground border border-border/50",
  },
  {
    id: "combo",
    title: "Combo Legendario (Corte + Barba)",
    description: "La experiencia completa de barbería. Corte de pelo premium y tratamiento de barba imperial.",
    price: "28€",
    duration: "60 min",
    icon: Sparkles,
    colorClass: "bg-primary/25 text-primary border border-primary/40 shadow-[0_0_15px_rgba(216,178,115,0.15)]",
  }
];

// Predefined 30-min slots from 10:00 to 20:00 (last slot starts at 19:30)
const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", 
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", 
  "19:00", "19:30"
];

export default function BookingForm() {
  const {
    step,
    setStep,
    selectedService,
    selectedBarber,
    setSelectedBarber,
    barbersList,
    isLoadingBarbers,
    busyBarberIds,
    isLoadingBusyBarbers,
    selectedDate,
    setSelectedDate,
    selectedTime,
    bookedTimes,
    isLoadingSlots,
    daysList,
    formData,
    isSubmitting,
    bookingSuccess,
    errorMessage,
    handleServiceSelect,
    handleBarberSelect,
    handleTimeSelect,
    handleInputChange,
    isSlotPast,
    validateStep3,
    handleSubmit
  } = useBooking();

  // Find dynamic config details of the selected service
  const currentServiceDetails = SERVICES_CONFIG.find(s => s.id === selectedService?.id);

  // Group slots into morning (before 15:00) and afternoon (15:00 and after)
  const morningSlots = TIME_SLOTS.filter(slot => parseInt(slot.split(":")[0]) < 15);
  const afternoonSlots = TIME_SLOTS.filter(slot => parseInt(slot.split(":")[0]) >= 15);

  // Steps animations
  const slideVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.15, ease: "easeIn" } },
  } as const;

  return (
    <div className="w-full flex-1 flex flex-col p-6 space-y-6">
      
      {/* Progress Bar & Header */}
      {!bookingSuccess && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Paso {step} de 4</p>
              <h2 className="text-lg font-bold text-foreground tracking-tight mt-1">
                {step === 1 && "Selecciona un servicio"}
                {step === 2 && "Elige fecha y hora"}
                {step === 3 && "Elige un profesional"}
                {step === 4 && "Tus datos de contacto"}
              </h2>
            </div>
            
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold bg-transparent border-0 cursor-pointer py-1 px-2.5 rounded-full hover:bg-secondary transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Atrás
              </button>
            )}
          </div>

          {/* Stepper Progress Bar */}
          <div className="relative h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-primary transition-all duration-300 ease-out rounded-full" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Form Area */}
      <div className="flex-1 flex flex-col justify-start">
        {bookingSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-6 space-y-6 text-center"
          >
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center ring-8 ring-primary/5 shadow-[0_0_20px_rgba(216,178,115,0.2)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-foreground font-heading">¡Reserva Pre-Registrada!</h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Tu cita ha sido guardada en estado <span className="italic font-semibold">pendiente</span>. Para confirmarla definitivamente, debes enviar la notificación por WhatsApp.
              </p>
            </div>

            {/* Premium Reservation Ticket */}
            <div className="w-full max-w-sm bg-secondary/50 border border-border/70 rounded-2xl shadow-md text-left overflow-hidden relative p-5 space-y-4">
              {/* Decorative Golden Corner Accents */}
              <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-3xl border-l border-b border-primary/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-primary font-bold uppercase tracking-wider">Pase de Reserva</span>
                <h4 className="font-extrabold text-foreground text-sm font-heading pr-6">{selectedService?.title}</h4>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Magic Barber Shop</p>
              </div>

              <div className="border-t border-dashed border-border/80 pt-3 space-y-2.5 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Fecha</span>
                  <span className="font-semibold text-foreground">
                    {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Horario</span>
                  <span className="font-semibold text-foreground">{selectedTime} hs <span className="text-[10px] text-muted-foreground font-normal">({selectedService?.duration})</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Profesional</span>
                  <span className="font-semibold text-foreground">{selectedBarber?.nombre || "Cualquier Peluquero"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Barbería</span>
                  <span className="font-semibold text-foreground">Madrid Centro</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Cliente</span>
                  <span className="font-bold text-primary">{formData.nombre} {formData.apellidos}</span>
                </div>
              </div>
              
              <div className="border-t border-border/80 pt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Precio total:</span>
                <span className="text-base font-extrabold text-primary">{selectedService?.price}</span>
              </div>
            </div>

            <div className="w-full max-w-sm space-y-3">
              <Button 
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-6 px-8 rounded-2xl w-full flex items-center justify-center gap-2.5 text-sm shadow-md shadow-[#25D366]/10 cursor-pointer"
                onClick={() => {
                  const appointmentDate = new Date(selectedDate!);
                  const [hours, minutes] = selectedTime!.split(":").map(Number);
                  appointmentDate.setHours(hours, minutes, 0, 0);
                  const formattedDate = format(appointmentDate, "EEEE d 'de' MMMM 'a las' HH:mm 'hs'", { locale: es });
                  const barberName = selectedBarber?.id === "any" || !selectedBarber ? "Cualquier Peluquero" : selectedBarber.nombre;
                  const messageText = `¡Hola Magic Barber! Me gustaría confirmar mi cita:%0A%0A*Cliente:* ${formData.nombre} ${formData.apellidos}%0A*Servicio:* ${selectedService?.title}%0A*Peluquero:* ${barberName}%0A*Fecha y Hora:* ${formattedDate}%0A*Teléfono:* ${formData.telefono}%0A%0A¡Muchas gracias!`;
                  const barberPhone = process.env.NEXT_PUBLIC_BARBER_WHATSAPP || "34600000000";
                  window.open(`https://wa.me/${barberPhone}?text=${messageText}`, "_blank");
                }}
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                Enviar WhatsApp de Confirmación
              </Button>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-3"
              >
                {SERVICES_CONFIG.map((srv) => {
                  const IconComponent = srv.icon;
                  const isSelected = selectedService?.id === srv.id;
                  
                  return (
                    <div 
                      key={srv.id}
                      onClick={() => handleServiceSelect(srv)}
                      className={`group flex items-center justify-between p-4.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? "border-primary bg-primary/[0.03] shadow-md shadow-primary/5 scale-[1.01]" 
                          : "border-border/80 bg-card hover:bg-secondary/40 hover:border-border hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 pr-2">
                        <div className={`p-2.5 rounded-xl shrink-0 ${srv.colorClass} transition-transform duration-300 group-hover:scale-105`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="space-y-1 mt-0.5">
                          <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors duration-200">{srv.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{srv.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3.5 shrink-0 pl-1">
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-foreground">{srv.price}</div>
                          <div className="text-[10px] text-muted-foreground">{srv.duration}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent"
                        }`}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    Selecciona Fecha
                  </Label>
                  
                  <Dialog>
                    <DialogTrigger
                      render={
                        <button className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline bg-transparent border-0 cursor-pointer py-1 px-2 rounded-full hover:bg-primary/5 transition-all">
                          <CalendarDays className="w-3.5 h-3.5" />
                          Ver calendario
                        </button>
                      }
                    />
                    <DialogContent className="bg-card border border-border p-4 max-w-sm rounded-3xl">
                      <DialogHeader>
                        <DialogTitle className="text-base font-bold text-foreground">Seleccionar Fecha</DialogTitle>
                      </DialogHeader>
                      <div className="flex items-center justify-center py-2">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDate(date);
                            }
                          }}
                          className="mx-auto border-0"
                          classNames={{
                            selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
                            today: "text-primary border border-primary/30 rounded-full",
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2.5 pt-0.5 scrollbar-none px-0.5">
                  {daysList.map((date) => {
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const dayName = format(date, "eee", { locale: es }).substring(0, 3);
                    const dayNumber = format(date, "d");
                    const isTodayDate = isToday(date);
                    
                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[58px] cursor-pointer transition-all duration-200 border ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/10 scale-105 font-bold"
                            : "bg-secondary/40 text-foreground border-border/80 hover:bg-secondary hover:border-border"
                        }`}
                      >
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                          {dayName}
                        </span>
                        <span className="text-sm font-extrabold mt-0.5">{dayNumber}</span>
                        {isTodayDate && (
                          <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-1">
                    <Label className="text-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" />
                      Horas Disponibles
                    </Label>
                    {selectedDate && (
                      <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                        {format(selectedDate, "d 'de' MMMM", { locale: es })}
                      </span>
                    )}
                  </div>

                  {isLoadingSlots ? (
                    <div className="h-44 flex flex-col items-center justify-center text-muted-foreground gap-2 border border-border bg-secondary/20 rounded-2xl">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs">Buscando horas libres...</span>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      
                      {morningSlots.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mañana</p>
                          <div className="grid grid-cols-4 gap-2">
                            {morningSlots.map((time) => {
                              const isBooked = bookedTimes.includes(time);
                              const isPastSlot = isSlotPast(time);
                              const isDisabled = isBooked || isPastSlot;
                              const isSelected = selectedTime === time;

                              return (
                                <button
                                  key={time}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => handleTimeSelect(time)}
                                  className={`py-2.5 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                                    isSelected 
                                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm" 
                                      : isDisabled
                                        ? "bg-secondary/45 border-transparent text-muted-foreground/40 line-through cursor-not-allowed opacity-40"
                                        : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/[0.02]"
                                  }`}
                                >
                                  {time}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {afternoonSlots.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tarde</p>
                          <div className="grid grid-cols-4 gap-2">
                            {afternoonSlots.map((time) => {
                              const isBooked = bookedTimes.includes(time);
                              const isPastSlot = isSlotPast(time);
                              const isDisabled = isBooked || isPastSlot;
                              const isSelected = selectedTime === time;

                              return (
                                <button
                                  key={time}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => handleTimeSelect(time)}
                                  className={`py-2.5 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                                    isSelected 
                                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm" 
                                      : isDisabled
                                        ? "bg-secondary/45 border-transparent text-muted-foreground/40 line-through cursor-not-allowed opacity-40"
                                        : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/[0.02]"
                                  }`}
                                >
                                  {time}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedTime && (
                  <div className="p-3 bg-primary/[0.03] border border-primary/20 rounded-xl text-xs text-primary flex items-center justify-between">
                    <span>Horario seleccionado:</span>
                    <strong className="text-sm font-bold">{selectedTime} hs</strong>
                  </div>
                )}

                <Button
                  disabled={!selectedTime}
                  onClick={() => setStep(3)}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-6 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all cursor-pointer"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-3"
              >
                {/* Option: Any Barber */}
                <div 
                  onClick={() => handleBarberSelect({ id: "any", nombre: "Cualquier Peluquero" })}
                  className={`group flex items-center justify-between p-4.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    selectedBarber?.id === "any" || !selectedBarber
                      ? "border-primary bg-primary/[0.03] shadow-md shadow-primary/5 scale-[1.01]" 
                      : "border-border/80 bg-card hover:bg-secondary/40 hover:border-border hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3.5 pr-2">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Cualquier Profesional</h4>
                      <p className="text-[10px] text-muted-foreground">Te asignaremos el peluquero disponible más rápido.</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    selectedBarber?.id === "any" || !selectedBarber ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent"
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Loading State */}
                {isLoadingBarbers || isLoadingBusyBarbers ? (
                  <div className="py-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-xs">Buscando barberos disponibles...</span>
                  </div>
                ) : barbersList.length === 0 ? (
                  <p className="text-xs text-center text-muted-foreground py-4">No hay barberos disponibles en este momento.</p>
                ) : (
                  barbersList.map((barber) => {
                    const isSelected = selectedBarber?.id === barber.id;
                    const isBusy = busyBarberIds.includes(barber.id);
                    const initial = barber.nombre.charAt(0).toUpperCase();

                    return (
                      <div 
                        key={barber.id}
                        onClick={isBusy ? undefined : () => handleBarberSelect(barber)}
                        className={`group flex items-center justify-between p-4.5 rounded-2xl border transition-all duration-300 ${
                          isBusy
                            ? "border-border/45 bg-secondary/20 opacity-55 cursor-not-allowed"
                            : isSelected 
                              ? "border-primary bg-primary/[0.03] shadow-md shadow-primary/5 scale-[1.01] cursor-pointer" 
                              : "border-border/80 bg-card hover:bg-secondary/40 hover:border-border hover:shadow-sm cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 pr-2">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border transition-all duration-300 ${
                            isBusy
                              ? "bg-secondary text-muted-foreground/50 border-border/40"
                              : "bg-secondary group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary border-border group-hover:border-primary/20"
                          }`}>
                            {initial}
                          </div>
                          <div className="space-y-0.5">
                            <h4 className={`font-bold text-sm transition-colors ${
                              isBusy ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
                            }`}>{barber.nombre}</h4>
                            <p className="text-[10px] text-muted-foreground">
                              {isBusy ? "Ocupado en este horario" : "Disponible profesional"}
                            </p>
                          </div>
                        </div>
                        {!isBusy && (
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent"
                          }`}>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                <div className="p-4 bg-secondary/30 rounded-2xl border border-border/60 space-y-2.5 shadow-sm">
                  <h5 className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Resumen de tu cita</h5>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground text-[10px]">Servicio</p>
                      <p className="text-foreground font-bold mt-0.5">{selectedService?.title}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px]">Profesional</p>
                      <p className="text-primary font-bold mt-0.5">{selectedBarber?.nombre || "Cualquier Peluquero"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px]">Precio & Duración</p>
                      <p className="text-primary font-bold mt-0.5">{selectedService?.price} <span className="text-muted-foreground font-normal text-[10px]">({selectedService?.duration})</span></p>
                    </div>
                    <div className="col-span-2 border-t border-border/60 pt-2 flex items-center gap-1.5 text-foreground font-semibold">
                      <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                      <span>
                        {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })} a las {selectedTime} hs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="nombre" className="text-foreground text-xs font-semibold">Nombre</Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="nombre" 
                          type="text" 
                          placeholder="Ej. Juan" 
                          value={formData.nombre}
                          onChange={handleInputChange}
                          className="pl-10 bg-card border-border text-foreground placeholder-muted-foreground/60 focus-visible:ring-primary/30 focus-visible:border-primary py-6 rounded-xl text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="apellidos" className="text-foreground text-xs font-semibold">Apellidos</Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="apellidos" 
                          type="text" 
                          placeholder="Ej. Pérez" 
                          value={formData.apellidos}
                          onChange={handleInputChange}
                          className="pl-10 bg-card border-border text-foreground placeholder-muted-foreground/60 focus-visible:ring-primary/30 focus-visible:border-primary py-6 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="telefono" className="text-foreground text-xs font-semibold">Teléfono (WhatsApp)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="telefono" 
                        type="tel" 
                        placeholder="Ej. 34600000000" 
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="pl-10 bg-card border-border text-foreground placeholder-muted-foreground/60 focus-visible:ring-primary/30 focus-visible:border-primary py-6 rounded-xl text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Introduce tu número incluyendo el código de país (ej. 34 para España, 54 para Argentina) sin espacios ni guiones.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive">
                      {errorMessage}
                    </div>
                  )}

                  <Button
                    disabled={!validateStep3() || isSubmitting}
                    onClick={handleSubmit}
                    className="w-full bg-primary hover:bg-primary/95 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground font-bold py-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Procesando reserva...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 fill-current" />
                        Confirmar Reserva por WhatsApp
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
