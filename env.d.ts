// Secretos opcionales que no aparecen en wrangler.toml ni en .dev.vars por defecto,
// por lo que `wrangler types` no los genera. Se fusionan con la interfaz global.
interface CloudflareEnv {
  RESEND_API_KEY?: string;
}
