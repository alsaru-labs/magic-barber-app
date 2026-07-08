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
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2,
  MessageSquare,
  CalendarDays,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBooking } from "@/hooks/useBooking";

const SERVICES_CONFIG = [
  {
    id: "corte",
    title: "Corte de Pelo Premium",
    description: "Corte moderno o clásico con champú de autor, masaje capilar, toalla facial y peinado editorial.",
    price: "18€",
    duration: "30 min",
    icon: Scissors,
  },
  {
    id: "barba",
    title: "Afeitado y Barba Imperial",
    description: "Perfilado milimétrico con toallas calientes, aceites hidratantes y afeitado tradicional a navaja.",
    price: "12€",
    duration: "30 min",
    icon: Smile,
  },
  {
    id: "combo",
    title: "Combo Legendario (Corte + Barba)",
    description: "El ritual definitivo. Corte premium y tratamiento imperial de barba, acompañado de café o bebida premium.",
    price: "28€",
    duration: "60 min",
    icon: Sparkles,
  }
];

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

  const morningSlots = TIME_SLOTS.filter(slot => parseInt(slot.split(":")[0]) < 15);
  const afternoonSlots = TIME_SLOTS.filter(slot => parseInt(slot.split(":")[0]) >= 15);

  const slideVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { opacity: 0, x: -10, transition: { duration: 0.2, ease: "easeIn" } },
  } as const;

  return (
    <div className="w-full flex-1 flex flex-col p-6 sm:p-8 space-y-6">
      
      {/* Editorial Stepper / Header */}
      {!bookingSuccess && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono tracking-[0.25em] text-primary uppercase font-bold">
                STAGE 0{step} / 04
              </span>
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground font-sans mt-0.5">
                {step === 1 && "Selección de Servicio"}
                {step === 2 && "Día e Intervalo Horario"}
                {step === 3 && "Barbero / Profesional"}
                {step === 4 && "Información del Cliente"}
              </h3>
            </div>
            
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 text-[9px] tracking-widest font-extrabold uppercase text-muted-foreground hover:text-foreground bg-transparent border-0 cursor-pointer py-1 px-2.5 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Atrás
              </button>
            )}
          </div>

          {/* Thin Gold Hairline Progress Bar */}
          <div className="relative h-[1px] w-full bg-border">
            <div 
              className="absolute h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-start">
        {bookingSuccess ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-6 space-y-6 text-center"
          >
            {/* Visual Minimal Success Tag */}
            <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center text-primary bg-primary/5">
              <CheckCircle2 className="w-5 h-5 stroke-[1.5]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-light font-serif tracking-tight text-foreground">Reserva Pre-Registrada</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest max-w-[280px] leading-relaxed">
                Por favor, envía el mensaje de WhatsApp para confirmar tu cita.
              </p>
            </div>

            {/* Premium Boarding Pass style ticket */}
            <div className="w-full max-w-[340px] bg-secondary/15 dark:bg-black/15 border border-border shadow-lg text-left relative flex flex-col">
              
              {/* Corner Gold Trim details */}
              <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 border-l border-b border-border flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary" />
              </div>

              {/* Pass Header */}
              <div className="p-5 space-y-1">
                <span className="text-[8px] text-primary font-mono tracking-[0.2em] uppercase font-bold block">
                  BOARDING PASS / EXPERIENCIA
                </span>
                <h4 className="font-serif font-light text-foreground text-base leading-tight pr-6 mt-1">
                  {selectedService?.title}
                </h4>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-light">
                  Magic Barber Shop
                </p>
              </div>

              {/* Fine dashed cutoff line */}
              <div className="relative flex items-center py-1">
                <div className="absolute left-[-6px] w-3 h-3 rounded-full bg-background border-r border-border" />
                <div className="w-full border-t border-dashed border-border/80" />
                <div className="absolute right-[-6px] w-3 h-3 rounded-full bg-background border-l border-border" />
              </div>

              {/* Booking specifications */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-[11px] uppercase tracking-wider font-light">
                  <div>
                    <span className="text-[8px] tracking-widest text-muted-foreground block font-bold">FECHA</span>
                    <span className="font-bold text-foreground mt-0.5 block">
                      {selectedDate && format(selectedDate, "dd.MM.yyyy", { locale: es })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] tracking-widest text-muted-foreground block font-bold">HORARIO</span>
                    <span className="font-bold text-foreground mt-0.5 block">
                      {selectedTime} HS
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] tracking-widest text-muted-foreground block font-bold">PROFESIONAL</span>
                    <span className="font-bold text-foreground mt-0.5 block">
                      {selectedBarber?.nombre || "CUALQUIER PROFESIONAL"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] tracking-widest text-muted-foreground block font-bold">CLIENTE</span>
                    <span className="font-bold text-primary mt-0.5 block truncate">
                      {formData.nombre} {formData.apellidos}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-3 flex items-center justify-between uppercase tracking-wider">
                  <span className="text-[10px] text-muted-foreground">Importe Estimado:</span>
                  <span className="text-sm font-bold text-primary font-serif">{selectedService?.price}</span>
                </div>

                {/* Minimalist Barcode vector */}
                <div className="pt-2 flex flex-col items-center gap-1.5 opacity-55">
                  <div className="h-7 w-full flex items-center justify-center gap-[3px] bg-foreground/[0.02] border-y border-border/20 px-2">
                    {[1, 3, 1, 2, 4, 1, 1, 2, 3, 1, 4, 1, 3, 2, 1].map((w, i) => (
                      <div 
                        key={i} 
                        className="bg-foreground h-4 shrink-0" 
                        style={{ width: `${w}px` }} 
                      />
                    ))}
                  </div>
                  <span className="text-[7px] tracking-[4px] font-mono text-muted-foreground/80 uppercase">
                    MB-{selectedTime?.replace(":", "")}
                  </span>
                </div>
              </div>

            </div>

            {/* Minimal glowing action button */}
            <div className="w-full max-w-[340px] pt-2">
              <Button 
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-6 px-8 rounded-none w-full flex items-center justify-center gap-2.5 text-xs uppercase tracking-widest hover:shadow-lg transition-all cursor-pointer border border-[#25D366]"
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
                <MessageSquare className="w-4 h-4 fill-current" />
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
                className="space-y-1"
              >
                {SERVICES_CONFIG.map((srv, index) => {
                  const isSelected = selectedService?.id === srv.id;
                  
                  return (
                    <div 
                      key={srv.id}
                      onClick={() => handleServiceSelect(srv)}
                      className={`group flex items-start justify-between py-6 cursor-pointer border-b border-border/60 transition-all duration-300 ${
                        isSelected 
                          ? "border-primary/80 pl-4 -ml-4 border-l-2 border-l-primary bg-primary/[0.01]" 
                          : "hover:pl-2"
                      }`}
                    >
                      <div className="flex gap-4">
                        <span className={`font-serif text-xl font-light ${isSelected ? "text-primary font-normal" : "text-muted-foreground/30 group-hover:text-primary"}`}>
                          0{index + 1}
                        </span>
                        <div className="space-y-1">
                          <h4 className={`text-xs font-bold uppercase tracking-widest ${isSelected ? "text-primary" : "text-foreground"}`}>
                            {srv.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground font-light max-w-md leading-relaxed pr-2">
                            {srv.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right pl-4 shrink-0 select-none">
                        <div className={`text-xs font-bold uppercase tracking-widest ${isSelected ? "text-primary font-extrabold" : "text-foreground"}`}>
                          {srv.price}
                        </div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">
                          {srv.duration}
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
                className="space-y-6"
              >
                {/* Date header */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-mono tracking-[0.2em] text-primary uppercase font-bold block">
                      {selectedDate ? format(selectedDate, "MMMM / yyyy", { locale: es }) : ""}
                    </span>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger
                      render={
                        <button className="inline-flex items-center gap-1.5 text-[9px] tracking-widest font-extrabold uppercase text-primary bg-transparent border-0 hover:underline cursor-pointer py-1 px-2.5 transition-all">
                          <CalendarDays className="w-3.5 h-3.5" />
                          Calendario completo
                        </button>
                      }
                    />
                    <DialogContent className="bg-popover border border-border p-4 max-w-sm rounded-none">
                      <DialogHeader>
                        <DialogTitle className="text-xs font-bold uppercase tracking-wider text-foreground">Seleccionar Fecha</DialogTitle>
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
                            selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-none font-bold",
                            today: "text-primary border border-primary/30 rounded-none font-semibold",
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Horizontal Wristwatch scale calendar timeline */}
                <div className="flex gap-0 overflow-x-auto pb-4 pt-2 border-b border-border/40 scrollbar-none apple-scrollbar">
                  {daysList.map((date) => {
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const dayName = format(date, "eeeee", { locale: es }).toUpperCase();
                    const dayNumber = format(date, "d");
                    const isTodayDate = isToday(date);
                    
                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center py-4 px-5 border-r border-border/45 cursor-pointer min-w-[60px] relative transition-all duration-300 ${
                          isSelected
                            ? "bg-primary/[0.03] text-primary"
                            : "hover:bg-secondary/15 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-[8px] font-bold tracking-widest">{dayName}</span>
                        <span className="text-sm font-light mt-1 font-serif">{dayNumber}</span>
                        {isTodayDate && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        )}
                        {isSelected && (
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Hour slots */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <Label className="text-foreground text-[10px] font-extrabold uppercase tracking-widest">
                      Horas Disponibles
                    </Label>
                    {selectedDate && (
                      <span className="text-[8px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 uppercase tracking-wider">
                        {format(selectedDate, "d 'de' MMMM", { locale: es })}
                      </span>
                    )}
                  </div>

                  {isLoadingSlots ? (
                    <div className="h-32 flex flex-col items-center justify-center text-muted-foreground gap-2 border border-border/60 bg-secondary/5">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-[9px] tracking-widest uppercase">Buscando horarios...</span>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 apple-scrollbar">
                      
                      {morningSlots.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[8px] font-extrabold text-muted-foreground uppercase tracking-widest">Turno Mañana</p>
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
                                  className={`py-2.5 text-[10px] font-bold tracking-widest rounded-none border text-center transition-all duration-300 cursor-pointer ${
                                    isSelected 
                                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm" 
                                      : isDisabled
                                        ? "bg-transparent border-transparent text-muted-foreground/20 cursor-not-allowed pointer-events-none"
                                        : "bg-transparent border-border text-foreground hover:border-foreground"
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
                          <p className="text-[8px] font-extrabold text-muted-foreground uppercase tracking-widest">Turno Tarde</p>
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
                                  className={`py-2.5 text-[10px] font-bold tracking-widest rounded-none border text-center transition-all duration-300 cursor-pointer ${
                                    isSelected 
                                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm" 
                                      : isDisabled
                                        ? "bg-transparent border-transparent text-muted-foreground/20 cursor-not-allowed pointer-events-none"
                                        : "bg-transparent border-border text-foreground hover:border-foreground"
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
                  <motion.div 
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-primary/[0.03] border border-primary/20 rounded-none text-xs text-primary flex items-center justify-between"
                  >
                    <span className="text-[10px] uppercase tracking-wider font-medium">Horario seleccionado:</span>
                    <strong className="text-[11px] font-extrabold tracking-widest">{selectedTime} HS</strong>
                  </motion.div>
                )}

                <Button
                  disabled={!selectedTime}
                  onClick={() => setStep(3)}
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-6 rounded-none flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all cursor-pointer border border-primary hover:shadow-lg active:scale-[0.99]"
                >
                  Continuar
                  <ArrowRight className="w-3.5 h-3.5" />
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
                className="space-y-1"
              >
                {/* Option: Any Barber */}
                <div 
                  onClick={() => handleBarberSelect({ id: "any", nombre: "Cualquier Peluquero" })}
                  className={`group flex items-center justify-between py-5 cursor-pointer border-b border-border/60 transition-all duration-300 ${
                    selectedBarber?.id === "any" || !selectedBarber
                      ? "border-primary/80 pl-4 -ml-4 border-l-2 border-l-primary bg-primary/[0.01]" 
                      : "hover:pl-2"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`font-serif text-xl font-light ${selectedBarber?.id === "any" || !selectedBarber ? "text-primary font-normal" : "text-muted-foreground/30"}`}>
                      00
                    </span>
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-widest ${selectedBarber?.id === "any" || !selectedBarber ? "text-primary" : "text-foreground"}`}>
                        Cualquier Profesional
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-light leading-snug">
                        Asignación rápida del peluquero disponible más cercano.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center justify-center pr-1">
                    <span className={`w-2 h-2 rounded-full ${selectedBarber?.id === "any" || !selectedBarber ? "bg-primary animate-pulse" : "bg-primary/20"}`} />
                  </div>
                </div>

                {/* Loading State */}
                {isLoadingBarbers || isLoadingBusyBarbers ? (
                  <div className="py-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-[10px] tracking-widest uppercase">Buscando barberos...</span>
                  </div>
                ) : barbersList.length === 0 ? (
                  <p className="text-xs text-center text-muted-foreground py-4">No hay barberos disponibles.</p>
                ) : (
                  barbersList.map((barber, index) => {
                    const isSelected = selectedBarber?.id === barber.id;
                    const isBusy = busyBarberIds.includes(barber.id);

                    return (
                      <div 
                        key={barber.id}
                        onClick={isBusy ? undefined : () => handleBarberSelect(barber)}
                        className={`group flex items-center justify-between py-5 border-b border-border/60 transition-all duration-300 ${
                          isBusy
                            ? "opacity-20 cursor-not-allowed"
                            : isSelected 
                              ? "border-primary/80 pl-4 -ml-4 border-l-2 border-l-primary bg-primary/[0.01] cursor-pointer" 
                              : "hover:pl-2 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`font-serif text-xl font-light ${isSelected ? "text-primary font-normal" : "text-muted-foreground/30"}`}>
                            0{index + 1}
                          </span>
                          <div>
                            <h4 className={`text-xs font-bold uppercase tracking-widest ${isSelected ? "text-primary" : "text-foreground"}`}>
                              {barber.nombre}
                            </h4>
                            <p className="text-[10px] text-muted-foreground font-light">
                              {isBusy ? "Ocupado en este horario" : "Disponible profesional"}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center justify-center pr-1">
                          {!isBusy && (
                            <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-primary animate-pulse" : "bg-emerald-500"}`} />
                          )}
                        </div>
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
                className="space-y-6"
              >
                {/* Visual Editorial Summary */}
                <div className="p-5 bg-secondary/15 border border-border space-y-4">
                  <h5 className="text-[9px] text-primary font-mono tracking-[0.2em] uppercase font-bold">Resumen de tu cita</h5>
                  <div className="grid grid-cols-2 gap-4 text-[10px] uppercase tracking-wider font-light leading-relaxed">
                    <div>
                      <p className="text-muted-foreground text-[8px] tracking-widest font-bold">SERVICIO</p>
                      <p className="text-foreground font-bold mt-0.5">{selectedService?.title}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[8px] tracking-widest font-bold">PROFESIONAL</p>
                      <p className="text-primary font-bold mt-0.5">{selectedBarber?.nombre || "Cualquier Peluquero"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[8px] tracking-widest font-bold">PRECIO ESTIMADO</p>
                      <p className="text-primary font-bold mt-0.5">{selectedService?.price} ({selectedService?.duration})</p>
                    </div>
                    <div className="col-span-2 border-t border-border/40 pt-2.5 flex items-center gap-1.5 text-foreground font-bold">
                      <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        {selectedDate && format(selectedDate, "dd.MM.yyyy", { locale: es })} a las {selectedTime} HS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form fields bottom-line style */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    <div className="space-y-1">
                      <Label htmlFor="nombre" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-0.5">Nombre</Label>
                      <Input 
                        id="nombre" 
                        type="text" 
                        placeholder="Tu nombre" 
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="border-0 border-b border-border hover:border-foreground focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent rounded-none px-0 py-4 text-xs tracking-wider transition-all w-full"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="apellidos" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-0.5">Apellidos</Label>
                      <Input 
                        id="apellidos" 
                        type="text" 
                        placeholder="Tus apellidos" 
                        value={formData.apellidos}
                        onChange={handleInputChange}
                        className="border-0 border-b border-border hover:border-foreground focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent rounded-none px-0 py-4 text-xs tracking-wider transition-all w-full"
                      />
                    </div>

                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="telefono" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-0.5">Teléfono (WhatsApp)</Label>
                    <Input 
                      id="telefono" 
                      type="tel" 
                      placeholder="Ej: 34600000000" 
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="border-0 border-b border-border hover:border-foreground focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent rounded-none px-0 py-4 text-xs tracking-wider transition-all w-full"
                    />
                    <p className="text-[8px] text-muted-foreground uppercase tracking-widest mt-1.5 pl-0.5">
                      Código de país sin signos (ej: 34 para España).
                    </p>
                  </div>

                  {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive uppercase tracking-widest font-bold"
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  <Button
                    disabled={!validateStep3() || isSubmitting}
                    onClick={handleSubmit}
                    className="w-full bg-primary hover:bg-primary/95 disabled:bg-secondary disabled:text-muted-foreground/30 text-primary-foreground font-bold py-6 rounded-none flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all cursor-pointer border border-primary hover:shadow-lg active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Procesando reserva...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5 fill-current" />
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
