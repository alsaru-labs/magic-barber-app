/**
 * API de administración de citas (requiere sesión de admin).
 *  GET   /api/admin/citas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&scope=todas|futuras|pasadas
 *  PATCH /api/admin/citas   { id: number, estado: 'pendiente'|'confirmada'|'cancelada' }
 */
import { requireAdmin } from "@/lib/auth";
import { listCitas, updateEstado } from "@/lib/d1";
import { apiError, json, readJson } from "@/lib/http";
import { addDays, nowInBusinessTz } from "@/lib/schedule";
import { adminListQuerySchema, fieldErrors, updateEstadoSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const MAX_RANGE_DAYS = 62;

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = adminListQuerySchema.safeParse(params);
  if (!parsed.success) {
    return apiError(400, "Parámetros no válidos.", { fields: fieldErrors(parsed.error) });
  }
  const { desde, hasta, scope } = parsed.data;
  if (hasta > addDays(desde, MAX_RANGE_DAYS)) {
    return apiError(400, `El rango máximo es de ${MAX_RANGE_DAYS} días.`);
  }

  const now = nowInBusinessTz();
  try {
    const citas = await listCitas({ desde, hasta, scope, nowKey: `${now.fecha} ${now.hora}` });
    return json({ citas, now: { fecha: now.fecha, hora: now.hora } });
  } catch (err) {
    console.error("[GET /api/admin/citas]", err);
    return apiError(500, "No se pudieron cargar las citas.");
  }
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = await readJson(request);
  if (body === undefined) return apiError(400, "Cuerpo de la petición no válido.");

  const parsed = updateEstadoSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "Datos no válidos.", { fields: fieldErrors(parsed.error) });
  }

  try {
    const result = await updateEstado(parsed.data.id, parsed.data.estado);
    if (!result.ok) {
      if (result.reason === "not_found") return apiError(404, "La cita no existe.");
      return apiError(409, "No se puede reactivar: la franja ya está ocupada por otra cita.", {
        code: "slot_taken",
      });
    }
    return json({ cita: result.cita });
  } catch (err) {
    console.error("[PATCH /api/admin/citas]", err);
    return apiError(500, "No se pudo actualizar la cita.");
  }
}
