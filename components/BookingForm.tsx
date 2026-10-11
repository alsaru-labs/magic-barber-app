"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  Phone,
  Scissors,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUSINESS, SERVICES, type Service } from "@/lib/config";
import { addDays, formatFechaLarga, nowInBusinessTz, toMinutes, type SlotAvailability } from "@/lib/schedule";
import { cn } from "@/lib/utils";
import { contactSchema, fieldErrors } from "@/lib/validation";

// ---------------------------------------------------------------------------
// Tipos y helpers
// ---------------------------------------------------------------------------

type Step = 1 | 2 | 3;

interface AvailabilityState {
  loading: boolean;
  error: string | null;
  abierto: boolean;
  horas: SlotAvailability[];
}

interface CitaCreada {
  id: number;
  nombre: string;
  apellidos: string;
  servicio: string;
  fecha: string;
  hora: string;
  duracion_min: number;
}

interface ContactForm {
  nombre: string;
  apellidos: string;
  telefono: string;
}

interface AvailabilityApiResponse {
  abierto?: boolean;
  horas?: SlotAvailability[];
  error?: string;
}

interface CreateCitaApiResponse {
  cita?: CitaCreada;
  whatsappUrl?: string;
  error?: string;
  fields?: Record<string, string>;
}

const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: "Servicio" },
  { n: 2, label: "Fecha y hora" },
  { n: 3, label: "Tus datos" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const keyToDate = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const dateToKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const euros = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const EMPTY_AVAILABILITY: AvailabilityState = { loading: false, error: null, abierto: true, horas: [] };

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function BookingForm({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [step, setStep] = useState<Step>(1);
  const [servicio, setServicio] = useState<Service | null>(null);
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityState>(EMPTY_AVAILABILITY);
  const [reloadKey, setReloadKey] = useState(0);

  const [contact, setContact] = useState<ContactForm>({ nombre: "", apellidos: "", telefono: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState(false);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ cita: CitaCreada; whatsappUrl: string } | null>(null);

  const topRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => nowInBusinessTz().fecha, []);

  // --- Disponibilidad -------------------------------------------------------
  useEffect(() => {
    if (!fecha || !servicio) return;
    const ctrl = new AbortController();
    setAvailability((a) => ({ ...a, loading: true, error: null }));

    fetch(`/api/citas?fecha=${fecha}&servicio=${servicio.id}`, { signal: ctrl.signal, cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as AvailabilityApiResponse;
        if (!res.ok) throw new Error(data.error ?? "No se pudo cargar la disponibilidad.");
        const horas = data.horas ?? [];
        setAvailability({ loading: false, error: null, abierto: data.abierto ?? true, horas });
        // Si la hora elegida ya no está libre, la deseleccionamos
        setHora((h) => (h && !horas.some((s: SlotAvailability) => s.hora === h && s.disponible) ? null : h));
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setAvailability({ ...EMPTY_AVAILABILITY, error: err.message });
      });

    return () => ctrl.abort();
  }, [fecha, servicio, reloadKey]);

  const goTo = useCallback((s: Step) => {
    setStep(s);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const resetTurnstile = () => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  // --- Envío ------------------------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!servicio || !fecha || !hora || submitting) return;

    const local = contactSchema.safeParse(contact);
    if (!local.success) {
      setErrors(fieldErrors(local.error));
      return;
    }
    setErrors({});
    if (!turnstileToken) {
      toast.error("Espera a que termine la verificación anti-bot.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicioId: servicio.id, fecha, hora, ...contact, turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as CreateCitaApiResponse;

      if (res.status === 201 && data.cita && data.whatsappUrl) {
        setSuccess({ cita: data.cita, whatsappUrl: data.whatsappUrl });
        // Intento de apertura automática (dentro de la ventana de activación del clic).
        // Si el navegador lo bloquea, el modal ofrece el botón de WhatsApp.
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
        return;
      }

      if (res.status === 409 || res.status === 422) {
        toast.error(data.error ?? "Esa hora ya no está disponible.");
        setHora(null);
        setReloadKey((k) => k + 1);
        goTo(2);
      } else if (res.status === 400 && data.fields) {
        setErrors(data.fields);
        toast.error(data.error ?? "Revisa los datos del formulario.");
      } else {
        toast.error(data.error ?? "No se pudo completar la reserva. Inténtalo de nuevo.");
      }
    } catch {
      toast.error("Error de conexión. Comprueba tu red e inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
      resetTurnstile(); // los tokens de Turnstile son de un solo uso
    }
  }

  function resetAll() {
    setSuccess(null);
    setServicio(null);
    setFecha(null);
    setHora(null);
    setContact({ nombre: "", apellidos: "", telefono: "" });
    setErrors({});
    setAvailability(EMPTY_AVAILABILITY);
    goTo(1);
  }

  // --- Render -----------------------------------------------------------------
  return (
    <div ref={topRef} className="scroll-mt-24">
      <Card className="border-primary/10 bg-card/80 gap-0 overflow-hidden py-0 backdrop-blur">
        <StepIndicator step={step} />

        <CardContent className="p-5 sm:p-8">
          {step === 1 && (
            <ServiceStep
              selected={servicio}
              onSelect={(s) => {
                setServicio(s);
                setHora(null);
                goTo(2);
              }}
            />
          )}

          {step === 2 && servicio && (
            <DateTimeStep
              servicio={servicio}
              today={today}
              fecha={fecha}
              hora={hora}
              availability={availability}
              onFecha={(f) => {
                setFecha(f);
                setHora(null);
              }}
              onHora={setHora}
              onRetry={() => setReloadKey((k) => k + 1)}
              onBack={() => goTo(1)}
              onNext={() => goTo(3)}
            />
          )}

          {step === 3 && servicio && fecha && hora && (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <Summary servicio={servicio} fecha={fecha} hora={hora} onEdit={() => goTo(2)} />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="nombre"
                  label="Nombre"
                  icon={<User />}
                  autoComplete="given-name"
                  value={contact.nombre}
                  error={errors.nombre}
                  onChange={(v) => setContact((c) => ({ ...c, nombre: v }))}
                />
                <Field
                  id="apellidos"
                  label="Apellidos"
                  icon={<User />}
                  autoComplete="family-name"
                  value={contact.apellidos}
                  error={errors.apellidos}
                  onChange={(v) => setContact((c) => ({ ...c, apellidos: v }))}
                />
                <div className="sm:col-span-2">
                  <Field
                    id="telefono"
                    label="Teléfono (WhatsApp)"
                    icon={<Phone />}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="612 345 678"
                    value={contact.telefono}
                    error={errors.telefono}
                    hint="Te contactaremos por WhatsApp solo para gestionar tu cita."
                    onChange={(v) => setContact((c) => ({ ...c, telefono: v }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={turnstileSiteKey}
                  options={{ action: "reserva", theme: "dark", size: "flexible", language: "es", appearance: "interaction-only" }}
                  onSuccess={(t) => {
                    setTurnstileToken(t);
                    setTurnstileError(false);
                  }}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => {
                    setTurnstileToken(null);
                    setTurnstileError(true);
                  }}
                />
                <p className="text-muted-foreground flex items-center gap-2 text-xs">
                  {turnstileError ? (
                    <>
                      <ShieldCheck className="text-destructive size-3.5" />
                      Error en la verificación.{" "}
                      <button type="button" className="text-primary underline" onClick={resetTurnstile}>
                        Reintentar
                      </button>
                    </>
                  ) : turnstileToken ? (
                    <>
                      <ShieldCheck className="text-success size-3.5" /> Verificación completada
                    </>
                  ) : (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Verificando que no eres un robot…
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button type="button" variant="ghost" onClick={() => goTo(2)} disabled={submitting}>
                  <ArrowLeft /> Atrás
                </Button>
                <Button type="submit" size="lg" disabled={submitting || !turnstileToken} className="sm:min-w-56">
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" /> Reservando…
                    </>
                  ) : (
                    <>
                      <Check /> Confirmar cita
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <SuccessDialog success={success} onClose={resetAll} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function StepIndicator({ step }: { step: Step }) {
  return (
    <ol className="border-border/60 grid grid-cols-3 border-b">
      {STEPS.map(({ n, label }) => {
        const done = step > n;
        const active = step === n;
        return (
          <li
            key={n}
            aria-current={active ? "step" : undefined}
            className={cn(
              "relative flex items-center justify-center gap-2 px-2 py-4 text-xs font-medium transition-colors sm:text-sm",
              active ? "text-foreground" : done ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border text-[11px]",
                active && "border-primary bg-primary text-primary-foreground",
                done && "border-primary/50 bg-primary/10",
              )}
            >
              {done ? <Check className="size-3.5" /> : n}
            </span>
            <span className="hidden sm:inline">{label}</span>
            {active && <span className="bg-primary absolute inset-x-6 bottom-0 h-0.5 rounded-full" />}
          </li>
        );
      })}
    </ol>
  );
}

function ServiceStep({ selected, onSelect }: { selected: Service | null; onSelect: (s: Service) => void }) {
  return (
    <div className="space-y-5">
      <StepTitle title="Elige tu servicio" subtitle="Precio orientativo. Pagas en la barbería." />
      <div role="radiogroup" aria-label="Servicios" className="grid gap-3">
        {SERVICES.map((s) => {
          const isSel = selected?.id === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={isSel}
              onClick={() => onSelect(s)}
              className={cn(
                "group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
                "hover:border-primary/50 hover:bg-accent/40 focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
                isSel ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
                <Scissors className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{s.nombre}</span>
                <span className="text-muted-foreground block truncate text-sm">{s.descripcion}</span>
                <span className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                  <Clock className="size-3" /> {s.duracionMin} min
                </span>
              </span>
              <span className="text-primary font-display text-xl font-semibold">{euros(s.precio)}</span>
              <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateTimeStep(props: {
  servicio: Service;
  today: string;
  fecha: string | null;
  hora: string | null;
  availability: AvailabilityState;
  onFecha: (f: string) => void;
  onHora: (h: string) => void;
  onRetry: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { servicio, today, fecha, hora, availability, onFecha, onHora, onRetry, onBack, onNext } = props;
  const todayDate = keyToDate(today);
  const maxDate = keyToDate(addDays(today, BUSINESS.maxDaysAhead));

  const grupos = useMemo(() => {
    const manana = availability.horas.filter((s) => toMinutes(s.hora) < 14 * 60);
    const tarde = availability.horas.filter((s) => toMinutes(s.hora) >= 14 * 60);
    return [
      { titulo: "Mañana", slots: manana },
      { titulo: "Tarde", slots: tarde },
    ].filter((g) => g.slots.length > 0);
  }, [availability.horas]);

  const libres = availability.horas.filter((s) => s.disponible).length;

  return (
    <div className="space-y-6">
      <StepTitle title="¿Cuándo te viene bien?" subtitle={`${servicio.nombre} · ${servicio.duracionMin} min`} />

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="bg-background/40 mx-auto w-fit rounded-xl border">
          <Calendar
            mode="single"
            selected={fecha ? keyToDate(fecha) : undefined}
            onSelect={(d) => d && onFecha(dateToKey(d))}
            startMonth={todayDate}
            endMonth={maxDate}
            disabled={[{ before: todayDate }, { after: maxDate }, { dayOfWeek: [...BUSINESS.closedWeekdays] }]}
          />
        </div>

        <div className="min-h-48">
          {!fecha ? (
            <EmptyHint icon={<CalendarDays />} text="Selecciona un día en el calendario para ver las horas libres." />
          ) : availability.loading ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-muted/60 h-11 animate-pulse rounded-md" />
              ))}
            </div>
          ) : availability.error ? (
            <div className="space-y-3 text-center">
              <p className="text-destructive text-sm">{availability.error}</p>
              <Button variant="outline" size="sm" onClick={onRetry}>
                Reintentar
              </Button>
            </div>
          ) : !availability.abierto ? (
            <EmptyHint icon={<CalendarDays />} text="Ese día no hay servicio. Elige otra fecha." />
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm capitalize">
                {formatFechaLarga(fecha)} · <span className="normal-case">{libres} huecos libres</span>
              </p>
              {libres === 0 && <p className="text-sm">Día completo. Prueba con otra fecha.</p>}
              {grupos.map((g) => (
                <div key={g.titulo} className="space-y-2">
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{g.titulo}</p>
                  <div role="radiogroup" aria-label={`Horas de ${g.titulo}`} className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5">
                    {g.slots.map((s) => {
                      const isSel = hora === s.hora;
                      return (
                        <button
                          key={s.hora}
                          type="button"
                          role="radio"
                          aria-checked={isSel}
                          disabled={!s.disponible}
                          onClick={() => onHora(s.hora)}
                          className={cn(
                            "h-11 rounded-md border text-sm font-medium tabular-nums transition-all",
                            "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
                            s.disponible
                              ? "hover:border-primary/60 hover:bg-accent/50"
                              : "text-muted-foreground/40 cursor-not-allowed border-dashed line-through",
                            isSel && "border-primary bg-primary text-primary-foreground hover:bg-primary",
                          )}
                        >
                          {s.hora}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft /> Cambiar servicio
        </Button>
        <Button size="lg" onClick={onNext} disabled={!fecha || !hora} className="sm:min-w-48">
          Continuar <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

function Summary({ servicio, fecha, hora, onEdit }: { servicio: Service; fecha: string; hora: string; onEdit: () => void }) {
  return (
    <div className="border-primary/20 bg-primary/5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border p-4 text-sm">
      <span className="flex items-center gap-2 font-medium">
        <Scissors className="text-primary size-4" /> {servicio.nombre}
      </span>
      <span className="flex items-center gap-2 capitalize">
        <CalendarDays className="text-primary size-4" /> {formatFechaLarga(fecha)}
      </span>
      <span className="flex items-center gap-2 tabular-nums">
        <Clock className="text-primary size-4" /> {hora}
      </span>
      <button type="button" onClick={onEdit} className="text-primary ml-auto text-xs underline-offset-4 hover:underline">
        Cambiar
      </button>
    </div>
  );
}

function Field(props: {
  id: keyof ContactForm;
  label: string;
  icon: React.ReactNode;
  value: string;
  error?: string;
  hint?: string;
  onChange: (v: string) => void;
} & Omit<React.ComponentProps<"input">, "onChange" | "value" | "id">) {
  const { id, label, icon, value, error, hint, onChange, ...rest } = props;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 [&_svg]:size-4">{icon}</span>
        <Input
          id={id}
          name={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="pl-9"
          required
          {...rest}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function SuccessDialog({
  success,
  onClose,
}: {
  success: { cita: CitaCreada; whatsappUrl: string } | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(success)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {success && (
          <>
            <DialogHeader className="items-center text-center sm:text-center">
              <span className="bg-success/15 text-success mb-2 flex size-14 items-center justify-center rounded-full">
                <CheckCircle2 className="size-8" />
              </span>
              <DialogTitle className="font-display text-2xl">¡Cita reservada!</DialogTitle>
              <DialogDescription>
                Tu hueco está guardado. Envía el mensaje de WhatsApp para que {BUSINESS.name} confirme tu cita.
              </DialogDescription>
            </DialogHeader>

            <dl className="bg-background/50 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl border p-4 text-sm">
              <dt className="text-muted-foreground">Cliente</dt>
              <dd className="font-medium">
                {success.cita.nombre} {success.cita.apellidos}
              </dd>
              <dt className="text-muted-foreground">Servicio</dt>
              <dd className="font-medium">{success.cita.servicio}</dd>
              <dt className="text-muted-foreground">Día</dt>
              <dd className="font-medium capitalize">{formatFechaLarga(success.cita.fecha)}</dd>
              <dt className="text-muted-foreground">Hora</dt>
              <dd className="font-medium tabular-nums">{success.cita.hora}</dd>
              <dt className="text-muted-foreground">Estado</dt>
              <dd className="text-warning font-medium">Pendiente de confirmación</dd>
            </dl>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button asChild variant="whatsapp" size="lg" className="w-full">
                <a href={success.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle /> Enviar confirmación por WhatsApp
                </a>
              </Button>
              <Button variant="ghost" onClick={onClose} className="w-full">
                Hacer otra reserva
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-1">
      <h3 className="font-display text-2xl font-semibold tracking-tight">{title}</h3>
      {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
    </div>
  );
}

function EmptyHint({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-muted-foreground flex h-full min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center text-sm [&_svg]:size-6">
      {icon}
      <p className="max-w-60">{text}</p>
    </div>
  );
}
