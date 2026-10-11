import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Sin caché incremental (ISR): todas las rutas con datos son dinámicas.
const cloudflareConfig = defineCloudflareConfig({});

const config = {
  ...cloudflareConfig,
  buildCommand: "npm run build:next",
};

export default config;
