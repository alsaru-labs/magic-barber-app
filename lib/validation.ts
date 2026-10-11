/**
 * Esquemas de validación de entrada (zod). Compartibles cliente/servidor.
 */
import { z } from "zod";
import { ESTADOS, SERVICE_IDS } from "./config";
import { isValidDateString, TIME_RE } from "./schedule";

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;

const personName = (label: string, max: number) =>
  z
    .string({ error: `${label} es obligatorio.` })
    .transform((v) => v.normalize("NFC").replace(/\s+/g, " ").trim())
    .pipe(
      z
        .string()
        .min(2, `${label} debe tener al menos 2 caracteres.`)
        .max(max, `${label} es demasiado largo.`)
        .regex(NAME_RE, `${label} contiene caracteres no válidos.`),
    );

/**
 * Normaliza un teléfono a formato wa.me (solo dígitos, con prefijo de país).
 * - "+34 612 34 56 78" → "34612345678"
 * - "0034612345678"    → "34612345678"
 * - "612345678"        → "34612345678" (móvil español sin prefijo)
 * Devuelve null si no parece un número válido (E.164: 8–15 dígitos).
 */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!/^[+\d\s().-]+$/.test(trimmed)) return null;
  let digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) {
    // ya trae prefijo internacional
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (/^[6789]\d{8}$/.test(digits)) {
    digits = `34${digits}`;
  }
  if (digits.length < 8 || digits.length > 15 || digits.startsWith("0")) return null;
  return digits;
}

export const phoneSchema = z
  .string({ error: "El teléfono es obligatorio." })
  .max(25, "Teléfono no válido.")
  .transform((v, ctx) => {
    const n = normalizePhone(v);
    if (!n) {
      ctx.addIssue({ code: "custom", message: "Introduce un teléfono válido (ej. 612 345 678 o +34 612 345 678)." });
      return z.NEVER;
    }
    return n;
  });

export const fechaSchema = z
  .string()
  .refine(isValidDateString, "Fecha no válida (formato YYYY-MM-DD).");

export const horaSchema = z.string().regex(TIME_RE, "Hora no válida (formato HH:MM).");

export const contactSchema = z.object({
  nombre: personName("El nombre", 60),
  apellidos: personName("Los apellidos", 80),
  telefono: phoneSchema,
});

export const createCitaSchema = contactSchema.extend({
  servicioId: z.enum(SERVICE_IDS, { error: "Servicio no válido." }),
  fecha: fechaSchema,
  hora: horaSchema,
  turnstileToken: z.string().min(1, "Falta la verificación anti-bot.").max(2048),
});
export type CreateCitaInput = z.infer<typeof createCitaSchema>;

export const availabilityQuerySchema = z.object({
  fecha: fechaSchema,
  servicio: z.enum(SERVICE_IDS).optional(),
});

export const adminListQuerySchema = z
  .object({
    desde: fechaSchema,
    hasta: fechaSchema,
    scope: z.enum(["todas", "futuras", "pasadas"]).default("todas"),
  })
  .refine((q) => q.desde <= q.hasta, { message: "'desde' debe ser anterior o igual a 'hasta'." });

export const updateEstadoSchema = z.object({
  id: z.number().int().positive(),
  estado: z.enum(ESTADOS),
});

export const loginSchema = z.object({
  usuario: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(256),
});

/** Aplana los errores de zod a { campo: mensaje } para la UI */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
