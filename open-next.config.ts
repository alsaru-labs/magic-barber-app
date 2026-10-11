import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Sin caché incremental (ISR): todas las rutas con datos son dinámicas.
const cloudflareConfig = defineCloudflareConfig({});

export default {
  ...cloudflareConfig,
  buildCommand: "npm run build:next",
};
