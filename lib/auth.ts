/**
 * Autenticación del administrador (servidor).
 *  - Contraseña: PBKDF2-SHA256 vía WebCrypto (bcrypt no es nativo en Workers).
 *    Formato de ADMIN_PASSWORD_HASH: "pbkdf2:<iteraciones>:<salt_b64>:<hash_b64>"
 *    (se usa ':' en vez de '$' para evitar la expansión de variables en .dev.vars/.env)
 *    Genera uno con: npm run hash-password -- "tu-contraseña"
 *  - Sesión: JWT HS256 en cookie HttpOnly (ver lib/session.ts).
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getVar } from "./env";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession, type AdminSession } from "./session";

// Cloudflare Workers limita PBKDF2 a 100.000 iteraciones.
const MAX_ITERATIONS = 100_000;

const b64ToBytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function pbkdf2(password: string, salt: Uint8Array, iterations: number, length = 32): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    length * 8,
  );
  return new Uint8Array(bits);
}

/** Comparación en tiempo constante */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function sha256(text: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.trim().split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 10_000 || iterations > MAX_ITERATIONS) return false;
  try {
    const salt = b64ToBytes(parts[2]);
    const expected = b64ToBytes(parts[3]);
    const actual = await pbkdf2(password, salt, iterations, expected.length);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export async function verifyCredentials(usuario: string, password: string): Promise<boolean> {
  const [adminUser, adminHash] = await Promise.all([getVar("ADMIN_USER"), getVar("ADMIN_PASSWORD_HASH")]);
  if (!adminUser || !adminHash) {
    console.error("[auth] ADMIN_USER o ADMIN_PASSWORD_HASH no configurados");
    return false;
  }
  // Se evalúan ambas comprobaciones siempre para no filtrar por tiempos si el usuario existe.
  const [userOk, passOk] = await Promise.all([
    Promise.all([sha256(usuario), sha256(adminUser)]).then(([a, b]) => timingSafeEqual(a, b)),
    verifyPassword(password, adminHash),
  ]);
  return userOk && passOk;
}

export async function getSessionSecret(): Promise<string | undefined> {
  return getVar("SESSION_SECRET");
}

export async function createSessionCookie(res: NextResponse, user: string): Promise<void> {
  const secret = await getSessionSecret();
  if (!secret) throw new Error("SESSION_SECRET no configurado");
  const token = await signSession(user, secret);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** Sesión actual (Server Components / Route Handlers) */
export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value, await getSessionSecret());
}

/**
 * Guarda para APIs de administración. Devuelve una respuesta de error si no hay
 * sesión válida, o null si la petición puede continuar.
 * Además, en métodos que mutan estado comprueba el Origin (defensa CSRF extra
 * sobre SameSite=Lax).
 */
export async function requireAdmin(request: Request): Promise<NextResponse | null> {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
    }
  }
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  return null;
}
