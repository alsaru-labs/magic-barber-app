/**
 * Configuración de negocio de la barbería.
 * Todo lo editable (servicios, horario, branding) vive aquí.
 * Este módulo es puro (sin dependencias de servidor) y se comparte cliente/servidor.
 */

export const BUSINESS = {
  name: "Magic Barber",
  tagline: "Cortes de precisión. Sin esperas. Sin registros.",
  address: "Calle Mayor 1, Madrid",
  /** Zona horaria de la barbería: "hoy" y "ahora" se calculan siempre aquí */
  timezone: "Europe/Madrid",
  /** Apertura y cierre (la última cita debe TERMINAR antes o a la hora de cierre) */
  openTime: "10:00",
  closeTime: "20:00",
  /** Granularidad de la grilla de horas, en minutos */
  slotStepMin: 30,
  /** Días cerrados: 0 = domingo … 6 = sábado */
  closedWeekdays: [0] as readonly number[],
  /** Pausas (p.ej. comida). Ejemplo: [{ start: "14:00", end: "15:00" }] */
  breaks: [] as readonly { start: string; end: string }[],
  /** Con cuántos días de antelación máxima se puede reservar */
  maxDaysAhead: 30,
  /** Margen mínimo (min) para reservar un hueco del mismo día */
  minLeadMinutes: 15,
} as const;

export interface Service {
  id: string;
  nombre: string;
  descripcion: string;
  duracionMin: number;
  precio: number;
}

export const SERVICES: readonly Service[] = [
  {
    id: "corte-clasico",
    nombre: "Corte Clásico",
    descripcion: "Corte a tijera o máquina, lavado y peinado.",
    duracionMin: 30,
    precio: 15,
  },
  {
    id: "arreglo-barba",
    nombre: "Arreglo de Barba",
    descripcion: "Perfilado, toalla caliente y aceites.",
    duracionMin: 30,
    precio: 10,
  },
  {
    id: "combo-corte-barba",
    nombre: "Combo Corte + Barba",
    descripcion: "La experiencia completa: corte y barba.",
    duracionMin: 60,
    precio: 22,
  },
] as const;

export const SERVICE_IDS = SERVICES.map((s) => s.id) as [string, ...string[]];

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export const ESTADOS = ["pendiente", "confirmada", "cancelada"] as const;
export type EstadoCita = (typeof ESTADOS)[number];
