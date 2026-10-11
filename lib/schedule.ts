/**
 * Lógica pura de agenda: grilla de horas, días cerrados, disponibilidad.
 * Sin dependencias de servidor → se usa igual en el navegador y en el Worker.
 */
import { BUSINESS } from "./config";

export const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** "HH:MM" → minutos desde medianoche */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** minutos desde medianoche → "HH:MM" */
export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Comprueba que "YYYY-MM-DD" es una fecha real del calendario (no 2026-02-31) */
export function isValidDateString(fecha: string): boolean {
  if (!DATE_RE.test(fecha)) return false;
  const [y, m, d] = fecha.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function addDays(fecha: string, days: number): string {
  const [y, m, d] = fecha.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sábado (independiente de la zona horaria del runtime) */
export function weekdayOf(fecha: string): number {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Lunes de la semana a la que pertenece `fecha` */
export function startOfWeek(fecha: string): string {
  const wd = weekdayOf(fecha);
  const diff = wd === 0 ? -6 : 1 - wd;
  return addDays(fecha, diff);
}

/** Fecha y hora actuales en la zona horaria de la barbería */
export function nowInBusinessTz(now: Date = new Date()): { fecha: string; minutos: number; hora: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const fecha = `${get("year")}-${get("month")}-${get("day")}`;
  const hora = `${get("hour")}:${get("minute")}`;
  return { fecha, hora, minutos: toMinutes(hora) };
}

export function isClosedDay(fecha: string): boolean {
  return BUSINESS.closedWeekdays.includes(weekdayOf(fecha));
}

/** ¿La fecha está dentro de la ventana reservable [hoy, hoy + maxDaysAhead]? */
export function isWithinBookingWindow(fecha: string, today: string): boolean {
  return fecha >= today && fecha <= addDays(today, BUSINESS.maxDaysAhead);
}

/** Todas las horas de inicio de la grilla del día (independiente del servicio) */
export function dayGrid(): string[] {
  const open = toMinutes(BUSINESS.openTime);
  const close = toMinutes(BUSINESS.closeTime);
  const out: string[] = [];
  for (let t = open; t < close; t += BUSINESS.slotStepMin) out.push(fromMinutes(t));
  return out;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Horas de inicio válidas para un servicio de `duracionMin`:
 * el servicio debe terminar antes del cierre y no pisar ninguna pausa.
 */
export function startTimesForDuration(duracionMin: number): string[] {
  const close = toMinutes(BUSINESS.closeTime);
  return dayGrid().filter((h) => {
    const s = toMinutes(h);
    const e = s + duracionMin;
    if (e > close) return false;
    return !BUSINESS.breaks.some((b) => overlaps(s, e, toMinutes(b.start), toMinutes(b.end)));
  });
}

export interface BusyBlock {
  hora: string;
  duracion_min: number;
}

/** Slots de la grilla cubiertos (total o parcialmente) por citas activas */
export function occupiedGridSlots(busy: BusyBlock[]): string[] {
  const step = BUSINESS.slotStepMin;
  return dayGrid().filter((h) => {
    const s = toMinutes(h);
    return busy.some((b) => {
      const bs = toMinutes(b.hora);
      return overlaps(s, s + step, bs, bs + b.duracion_min);
    });
  });
}

export interface SlotAvailability {
  hora: string;
  disponible: boolean;
}

/**
 * Calcula la disponibilidad real de cada hora de inicio para un servicio dado,
 * considerando citas existentes, pausas, cierre y horas ya pasadas.
 */
export function computeAvailability(
  fecha: string,
  duracionMin: number,
  busy: BusyBlock[],
  now = nowInBusinessTz(),
): SlotAvailability[] {
  if (isClosedDay(fecha) || !isWithinBookingWindow(fecha, now.fecha)) {
    return startTimesForDuration(duracionMin).map((hora) => ({ hora, disponible: false }));
  }
  const minStart = fecha === now.fecha ? now.minutos + BUSINESS.minLeadMinutes : -1;
  return startTimesForDuration(duracionMin).map((hora) => {
    const s = toMinutes(hora);
    const e = s + duracionMin;
    const pasada = s < minStart;
    const choca = busy.some((b) => {
      const bs = toMinutes(b.hora);
      return overlaps(s, e, bs, bs + b.duracion_min);
    });
    return { hora, disponible: !pasada && !choca };
  });
}

/**
 * Valida una petición de reserva contra las reglas de negocio (no contra la BD).
 * Devuelve un mensaje de error legible o null si es válida.
 */
export function validateBookingRules(
  fecha: string,
  hora: string,
  duracionMin: number,
  now = nowInBusinessTz(),
): string | null {
  if (!isValidDateString(fecha)) return "La fecha no es válida.";
  if (isClosedDay(fecha)) return "La barbería está cerrada ese día.";
  if (fecha < now.fecha) return "No se puede reservar en una fecha pasada.";
  if (!isWithinBookingWindow(fecha, now.fecha))
    return `Solo se puede reservar con un máximo de ${BUSINESS.maxDaysAhead} días de antelación.`;
  if (!startTimesForDuration(duracionMin).includes(hora)) return "La hora seleccionada no es válida para este servicio.";
  if (fecha === now.fecha && toMinutes(hora) < now.minutos + BUSINESS.minLeadMinutes)
    return "Esa hora ya ha pasado o está demasiado próxima.";
  return null;
}

/** "2026-10-14" → "miércoles, 14 de octubre" */
export function formatFechaLarga(fecha: string): string {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** "2026-10-14" → "14/10/2026" */
export function formatFechaCorta(fecha: string): string {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}
