/**
 * API pública de citas.
 *  GET  /api/citas?fecha=YYYY-MM-DD[&servicio=<id>]  → horas ocupadas y disponibilidad
 *  POST /api/citas                                    → crea una cita (Turnstile + control de colisiones)
 */
import { BUSINESS, getServiceById } from "@/lib/config";
import { createCita, getBusyBlocks } from "@/lib/d1";
import { runInBackground, requireVar } from "@/lib/env";
import { apiError, clientIp, json, readJson } from "@/lib/http";
import { notifyBarberNewCita } from "@/lib/notify";
import {
  computeAvailability,
  isClosedDay,
  isWithinBookingWindow,
  nowInBusinessTz,
  occupiedGridSlots,
  validateBookingRules,
} from "@/lib/schedule";
import { verifyTurnstile } from "@/lib/turnstile";
import { availabilityQuerySchema, createCitaSchema, fieldErrors } from "@/lib/validation";
import { mensajeConfirmacionCliente, waLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = availabilityQuerySchema.safeParse(params);
  if (!parsed.success) {
    return apiError(400, "Parámetros no válidos.", { fields: fieldErrors(parsed.error) });
  }
  const { fecha, servicio } = parsed.data;
  const duracion = servicio ? getServiceById(servicio)!.duracionMin : BUSINESS.slotStepMin;
  const now = nowInBusinessTz();
  const abierto = !isClosedDay(fecha) && isWithinBookingWindow(fecha, now.fecha);

  try {
    const busy = abierto ? await getBusyBlocks(fecha) : [];
    return json({
      fecha,
      abierto,
      ocupadas: occupiedGridSlots(busy),
      horas: computeAvailability(fecha, duracion, busy, now),
    });
  } catch (err) {
    console.error("[GET /api/citas]", err);
    return apiError(500, "No se pudo consultar la disponibilidad. Inténtalo de nuevo.");
  }
}

export async function POST(request: Request) {
  const body = await readJson(request);
  if (body === undefined) return apiError(400, "Cuerpo de la petición no válido.");

  const parsed = createCitaSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "Revisa los datos del formulario.", { fields: fieldErrors(parsed.error) });
  }
  const input = parsed.data;
  const service = getServiceById(input.servicioId)!;

  // 1) Reglas de negocio (barato, sin red): día abierto, hueco futuro, en grilla…
  const ruleError = validateBookingRules(input.fecha, input.hora, service.duracionMin);
  if (ruleError) return apiError(422, ruleError, { code: "invalid_slot" });

  // 2) Anti-bot: Turnstile (el token es de un solo uso)
  const ts = await verifyTurnstile(input.turnstileToken, clientIp(request), "reserva");
  if (!ts.ok) {
    if (ts.reason === "misconfigured") return apiError(500, "Servicio de verificación no configurado.");
    return apiError(403, "No hemos podido verificar que no eres un robot. Recarga e inténtalo de nuevo.", {
      code: "turnstile_failed",
    });
  }

  try {
    // 3) Inserción atómica con control de solapamientos
    const result = await createCita({
      nombre: input.nombre,
      apellidos: input.apellidos,
      telefono_whatsapp: input.telefono,
      servicio: service.nombre,
      fecha: input.fecha,
      hora: input.hora,
      duracion_min: service.duracionMin,
    });

    if (!result.ok) {
      return apiError(409, "Lo sentimos, esa hora acaba de ser reservada. Elige otra, por favor.", {
        code: "slot_taken",
      });
    }

    const { cita } = result;
    await runInBackground(notifyBarberNewCita(cita));

    const barberPhone = await requireVar("BARBER_WHATSAPP");
    const whatsappUrl = waLink(barberPhone, mensajeConfirmacionCliente(cita));

    return json(
      {
        cita: {
          id: cita.id,
          nombre: cita.nombre,
          apellidos: cita.apellidos,
          servicio: cita.servicio,
          fecha: cita.fecha,
          hora: cita.hora,
          duracion_min: cita.duracion_min,
          estado: cita.estado,
        },
        whatsappUrl,
      },
      201,
    );
  } catch (err) {
    console.error("[POST /api/citas]", err);
    return apiError(500, "No se pudo registrar la cita. Inténtalo de nuevo en unos segundos.");
  }
}
