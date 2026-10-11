import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Sin caché incremental (ISR): todas las rutas con datos son dinámicas.
export default defineCloudflareConfig({});
