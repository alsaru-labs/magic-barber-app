/**
 * Verificación server-side de Cloudflare Turnstile.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
import { getVar } from "./env";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface SiteverifyResponse {
  success: boolean;
  "error-codes"?: string[];
  action?: string;
  hostname?: string;
}

export type TurnstileResult = { ok: true } | { ok: false; reason: string };

export async function verifyTurnstile(
  token: string,
  remoteIp: string | null,
  expectedAction?: string,
): Promise<TurnstileResult> {
  let secret = await getVar("TURNSTILE_SECRET_KEY");

  // Detección de token de test emitido por la clave de prueba de Cloudflare (1x00000000000000000000AA)
  const isTestToken =
    token.startsWith("XXXX.DUMMY.TOKEN") ||
    token.includes("DUMMY") ||
    token === "1x00000000000000000000AA";
  const isDev = process.env.NODE_ENV !== "production";

  // En entorno de desarrollo con token de test, validamos directamente para evitar bloqueos por red
  if (isDev && isTestToken) {
    return { ok: true };
  }

  if ((isTestToken || isDev) && (!secret || secret.startsWith("0x"))) {
    // Si la clave es de producción pero estamos en dev, usamos la clave secreta de test oficial
    secret = "1x0000000000000000000000000000000AA";
  }

  if (!secret) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY no configurada");
    return { ok: false, reason: "misconfigured" };
  }

  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);
  body.append("idempotency_key", crypto.randomUUID());

  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    const data = (await res.json()) as SiteverifyResponse;
    if (!data.success) return { ok: false, reason: (data["error-codes"] ?? ["invalid"]).join(",") };
    // Las claves de test devuelven action vacía; solo validamos si viene informada.
    if (expectedAction && data.action && data.action !== expectedAction) {
      return { ok: false, reason: "action_mismatch" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[turnstile] error de red", err);
    if (process.env.NODE_ENV !== "production" && isTestToken) {
      console.warn("[turnstile] Modo dev: admitiendo token de test ante fallo de red");
      return { ok: true };
    }
    return { ok: false, reason: "network" };
  }
}
