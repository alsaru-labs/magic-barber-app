/** Utilidades HTTP comunes para los Route Handlers */
import { NextResponse } from "next/server";

const NO_STORE = { "Cache-Control": "no-store" };

export function json<T>(data: T, status = 200, headers: HeadersInit = {}): NextResponse {
  return NextResponse.json(data, { status, headers: { ...NO_STORE, ...headers } });
}

export function apiError(status: number, error: string, extra: Record<string, unknown> = {}): NextResponse {
  return json({ error, ...extra }, status);
}

/** Parsea JSON con límite de tamaño; devuelve undefined si es inválido */
export async function readJson(request: Request, maxBytes = 8 * 1024): Promise<unknown | undefined> {
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return undefined;
  const len = Number(request.headers.get("content-length") ?? "0");
  if (len > maxBytes) return undefined;
  try {
    const text = await request.text();
    if (text.length > maxBytes) return undefined;
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function clientIp(request: Request): string | null {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  );
}
