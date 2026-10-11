#!/usr/bin/env node
/**
 * Genera el valor de ADMIN_PASSWORD_HASH (PBKDF2-SHA256, 100.000 iteraciones).
 * Uso:  npm run hash-password -- "mi-contraseña-segura"
 * Luego: npx wrangler secret put ADMIN_PASSWORD_HASH   (y pega el resultado)
 */
import { webcrypto as crypto } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('Uso: npm run hash-password -- "tu-contraseña"');
  process.exit(1);
}
if (password.length < 8) {
  console.error("La contraseña debe tener al menos 8 caracteres.");
  process.exit(1);
}

const ITERATIONS = 100_000; // máximo soportado por Cloudflare Workers
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS }, key, 256);

const b64 = (u8) => Buffer.from(u8).toString("base64");
console.log(`pbkdf2:${ITERATIONS}:${b64(salt)}:${b64(new Uint8Array(bits))}`);
