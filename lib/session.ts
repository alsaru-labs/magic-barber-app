/**
 * Sesión de administrador basada en JWT (HS256) firmado con `jose`.
 * Módulo compatible con Edge Runtime (lo usa el middleware): sin imports de Node
 * ni del adaptador de Cloudflare.
 */
import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const SESSION_COOKIE = "mb_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 días

const ISSUER = "magic-barber";
const AUDIENCE = "magic-barber-admin";

function secretKey(secret: string): Uint8Array {
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET debe tener al menos 32 caracteres.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(user: string, secret: string): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey(secret));
}

export interface AdminSession {
  user: string;
  exp: number;
}

export async function verifySession(token: string | undefined, secret: string | undefined): Promise<AdminSession | null> {
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(secret), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    if (payload.role !== "admin" || typeof payload.sub !== "string") return null;
    return { user: payload.sub, exp: payload.exp ?? 0 };
  } catch {
    return null;
  }
}
