/** POST /api/admin/login  { usuario, password } → cookie de sesión HttpOnly */
import { NextResponse } from "next/server";
import { createSessionCookie, verifyCredentials } from "@/lib/auth";
import { apiError, readJson } from "@/lib/http";
import { loginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Retardo uniforme en fallos para frenar fuerza bruta y no filtrar tiempos */
const FAIL_DELAY_MS = 800;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return apiError(403, "Origen no permitido.");
  }

  const body = await readJson(request);
  const parsed = loginSchema.safeParse(body ?? {});
  if (!parsed.success) {
    await sleep(FAIL_DELAY_MS);
    return apiError(400, "Usuario y contraseña son obligatorios.");
  }

  try {
    const ok = await verifyCredentials(parsed.data.usuario, parsed.data.password);
    if (!ok) {
      await sleep(FAIL_DELAY_MS);
      return apiError(401, "Credenciales incorrectas.");
    }
    const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    await createSessionCookie(res, parsed.data.usuario);
    return res;
  } catch (err) {
    console.error("[POST /api/admin/login]", err);
    return apiError(500, "Error del servidor al iniciar sesión.");
  }
}
