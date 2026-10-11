/**
 * Capa de acceso a Cloudflare D1.
 *
 * Control de concurrencia:
 *  - D1 serializa todas las escrituras en una única instancia primaria de SQLite,
 *    por lo que UNA sentencia `INSERT … SELECT … WHERE NOT EXISTS (…)` es atómica:
 *    la comprobación de solapamiento y la inserción no pueden intercalarse con
 *    otra petición concurrente.
 *  - El índice único parcial `idx_citas_slot (fecha, hora) WHERE estado != 'cancelada'`
 *    actúa como última barrera; si salta, lo traducimos a un conflicto (HTTP 409).
 */
import type { EstadoCita } from "./config";
import { getEnv } from "./env";
import type { BusyBlock } from "./schedule";

export interface Cita {
  id: number;
  nombre: string;
  apellidos: string;
  telefono_whatsapp: string;
  servicio: string;
  fecha: string;
  hora: string;
  duracion_min: number;
  estado: EstadoCita;
  created_at: string;
}

export async function getDB(): Promise<D1Database> {
  const env = await getEnv();
  if (!env.DB) throw new Error("Binding D1 'DB' no configurado (revisa wrangler.toml).");
  return env.DB;
}

/** Minutos desde medianoche de la columna `hora` ('HH:MM') de un alias de tabla */
const startMin = (alias: string) =>
  `(CAST(substr(${alias}.hora, 1, 2) AS INTEGER) * 60 + CAST(substr(${alias}.hora, 4, 2) AS INTEGER))`;

export function isUniqueViolation(err: unknown): boolean {
  const msgs: string[] = [];
  let cur: unknown = err;
  for (let i = 0; i < 3 && cur; i++) {
    if (cur instanceof Error) {
      msgs.push(cur.message);
      cur = (cur as Error & { cause?: unknown }).cause;
    } else {
      msgs.push(String(cur));
      break;
    }
  }
  return msgs.some((m) => /UNIQUE constraint failed|SQLITE_CONSTRAINT/i.test(m));
}

// ---------------------------------------------------------------------------
// Público
// ---------------------------------------------------------------------------

/** Bloques ocupados (citas activas) de un día */
export async function getBusyBlocks(fecha: string): Promise<BusyBlock[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(
      `SELECT hora, duracion_min FROM citas
       WHERE fecha = ?1 AND estado != 'cancelada'
       ORDER BY hora`,
    )
    .bind(fecha)
    .all<BusyBlock>();
  return results;
}

export interface NewCita {
  nombre: string;
  apellidos: string;
  telefono_whatsapp: string;
  servicio: string;
  fecha: string;
  hora: string;
  duracion_min: number;
}

export type CreateCitaResult = { ok: true; cita: Cita } | { ok: false; reason: "conflict" };

/** Inserta la cita solo si no se solapa con ninguna activa (atómico). */
export async function createCita(c: NewCita): Promise<CreateCitaResult> {
  const db = await getDB();
  const [h, m] = c.hora.split(":").map(Number);
  const start = h * 60 + m;
  const end = start + c.duracion_min;

  try {
    const row = await db
      .prepare(
        `INSERT INTO citas (nombre, apellidos, telefono_whatsapp, servicio, fecha, hora, duracion_min, estado)
         SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, 'pendiente'
         WHERE NOT EXISTS (
           SELECT 1 FROM citas o
           WHERE o.fecha = ?5
             AND o.estado != 'cancelada'
             AND ${startMin("o")} < ?9
             AND ${startMin("o")} + o.duracion_min > ?8
         )
         RETURNING *`,
      )
      .bind(c.nombre, c.apellidos, c.telefono_whatsapp, c.servicio, c.fecha, c.hora, c.duracion_min, start, end)
      .first<Cita>();

    if (!row) return { ok: false, reason: "conflict" };
    return { ok: true, cita: row };
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, reason: "conflict" };
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Administración
// ---------------------------------------------------------------------------

export interface ListCitasParams {
  desde: string;
  hasta: string;
  scope: "todas" | "futuras" | "pasadas";
  /** 'YYYY-MM-DD HH:MM' en la zona horaria de la barbería */
  nowKey: string;
}

export async function listCitas(p: ListCitasParams): Promise<Cita[]> {
  const db = await getDB();
  let scopeSql = "";
  if (p.scope === "futuras") scopeSql = "AND (fecha || ' ' || hora) >= ?3";
  if (p.scope === "pasadas") scopeSql = "AND (fecha || ' ' || hora) < ?3";

  const stmt = db.prepare(
    `SELECT * FROM citas
     WHERE fecha BETWEEN ?1 AND ?2 ${scopeSql}
     ORDER BY fecha ASC, hora ASC, id ASC
     LIMIT 1000`,
  );
  const bound = p.scope === "todas" ? stmt.bind(p.desde, p.hasta) : stmt.bind(p.desde, p.hasta, p.nowKey);
  const { results } = await bound.all<Cita>();
  return results;
}

export type UpdateEstadoResult =
  | { ok: true; cita: Cita }
  | { ok: false; reason: "not_found" | "conflict" };

/**
 * Cambia el estado de una cita. Si se reactiva una cita cancelada, se comprueba
 * atómicamente que su franja siga libre.
 */
export async function updateEstado(id: number, estado: EstadoCita): Promise<UpdateEstadoResult> {
  const db = await getDB();
  try {
    const row = await db
      .prepare(
        `UPDATE citas SET estado = ?1
         WHERE id = ?2
           AND (
             ?1 = 'cancelada'
             OR estado != 'cancelada'
             OR NOT EXISTS (
               SELECT 1 FROM citas o
               WHERE o.id != citas.id
                 AND o.fecha = citas.fecha
                 AND o.estado != 'cancelada'
                 AND ${startMin("o")} < ${startMin("citas")} + citas.duracion_min
                 AND ${startMin("o")} + o.duracion_min > ${startMin("citas")}
             )
           )
         RETURNING *`,
      )
      .bind(estado, id)
      .first<Cita>();

    if (row) return { ok: true, cita: row };
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, reason: "conflict" };
    throw err;
  }

  const exists = await db.prepare("SELECT 1 AS x FROM citas WHERE id = ?1").bind(id).first();
  return { ok: false, reason: exists ? "conflict" : "not_found" };
}
