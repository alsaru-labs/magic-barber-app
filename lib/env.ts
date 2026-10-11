/**
 * Acceso al contexto de Cloudflare (bindings y secretos) desde Next.js.
 * Solo para código de servidor (Route Handlers, Server Components).
 */
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getCf() {
  return getCloudflareContext({ async: true });
}

export async function getEnv(): Promise<CloudflareEnv> {
  return (await getCf()).env;
}

type StringKeys = {
  [K in keyof CloudflareEnv]-?: CloudflareEnv[K] extends string | undefined ? K : never;
}[keyof CloudflareEnv] &
  string;

/**
 * Lee una variable/secreto: primero del binding de Cloudflare (wrangler vars /
 * secrets / .dev.vars), y como respaldo de process.env (útil en `next dev`).
 */
export async function getVar(name: StringKeys): Promise<string | undefined> {
  let value: unknown;
  try {
    value = (await getEnv())[name];
  } catch {
    value = undefined;
  }
  if (typeof value === "string" && value.length > 0) return value;
  const fromProcess = process.env[name];
  return fromProcess && fromProcess.length > 0 ? fromProcess : undefined;
}

export async function requireVar(name: StringKeys): Promise<string> {
  const v = await getVar(name);
  if (!v) throw new Error(`Falta la variable de entorno ${String(name)}`);
  return v;
}

/** Ejecuta trabajo en segundo plano sin bloquear la respuesta (ctx.waitUntil) */
export async function runInBackground(promise: Promise<unknown>): Promise<void> {
  const safe = promise.catch((err) => console.error("[background]", err));
  try {
    (await getCf()).ctx.waitUntil(safe);
  } catch {
    // Fuera de Workers (p.ej. tests) simplemente no esperamos
  }
}
