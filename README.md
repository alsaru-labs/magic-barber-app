# Magic Barber — Sistema de Reservas para Barbería

MVP de reservas online de alto rendimiento, cero fricción para clientes (sin cuentas ni registro) y persistencia en el Edge con **Cloudflare D1**, **Cloudflare Workers** (Next.js 15 App Router vía `@opennextjs/cloudflare`), **Cloudflare Turnstile** y confirmación instantánea vía **WhatsApp**.

---

## ⚡ Características Principales

- **Cero Fricción para el Cliente**: Sin registro, sin contraseñas. Proceso de reserva en 3 pasos visuales (Servicio → Fecha y Hora → Datos de Contacto).
- **Edge Persistence con Cloudflare D1**: SQLite nativo distribuido globalmente, sin riesgo de suspensiones por inactividad.
- **Inserción Atómica y Anti-Colisión**: Protección a nivel de base de datos (`UNIQUE INDEX` condicional) y cláusula atómica `INSERT ... SELECT ... WHERE NOT EXISTS (...)` para evitar colisiones concurrentes y solapamiento entre servicios de diferente duración.
- **Validación Anti-Bot Sin Costes**: Cloudflare Turnstile integrado (interactivo ligero/invisible) validado en el servidor vía `siteverify`.
- **Validación y Notificación WhatsApp**: Formato internacional E.164 parametrizado para apertura automática de `wa.me` con el mensaje de confirmación redactado.
- **Panel Privado del Barbero**:
  - Autenticación segura mediante cookies `HttpOnly` firmadas con JWT HS256 (`jose`).
  - Hashing de contraseña mediante PBKDF2-SHA256 (WebCrypto nativo, 100k iteraciones).
  - Vistas de Agenda (Día / Semana).
  - Filtro de citas (Todas / Futuras / Pasadas).
  - Acciones rápidas: Contactar por WhatsApp al cliente en 1 clic, Confirmar, Cancelar o Reactivar con actualización optimista.
- **Avisos por Email (Opcional)**: Integración con Resend en segundo plano (`ctx.waitUntil`) sin bloquear la respuesta de la reserva.
- **UI Premium**: Tema oscuro moderno con acentos dorados, diseño mobile-first y componentes basados en Shadcn/ui + Tailwind CSS.

---

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Runtime Cloud**: Cloudflare Workers vía `@opennextjs/cloudflare`
- **Base de Datos**: Cloudflare D1 (SQLite Edge)
- **Estilos**: Tailwind CSS, Lucide Icons, Shadcn/ui
- **Validación**: Zod
- **Anti-Bot**: Cloudflare Turnstile (`@marsidev/react-turnstile`)
- **Seguridad**: JWT (`jose`), WebCrypto PBKDF2, Headers de seguridad estrictos

---

## 🚀 Inicio Rápido en Desarrollo Local

### 1. Clonar e Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno Locales
Copia la plantilla de secretos locales:
```bash
cp .dev.vars.example .dev.vars
```
El archivo `.dev.vars` ya viene preconfigurado con:
- Claves de prueba oficiales de **Cloudflare Turnstile** (siempre validan positivamente en desarrollo).
- Usuario administrador: `admin`
- Contraseña por defecto: `barber123` (hash PBKDF2 incluido).

### 3. Aplicar Migración a la Base de Datos D1 Local
```bash
npm run db:migrate:local
```

### 4. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
Abre tu navegador en:
- **Web pública de clientes**: [http://localhost:3000](http://localhost:3000)
- **Panel de administración**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## ☁️ Despliegue en Producción (Cloudflare)

### 1. Iniciar Sesión en Cloudflare
```bash
npx wrangler login
```

### 2. Crear la Base de Datos D1 en Cloudflare
```bash
npx wrangler d1 create magic-barber-db
```
Copia el `database_id` devuelto y pégalo en tu archivo `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "magic-barber-db"
database_id = "TU_DATABASE_ID_AQUI"
```

### 3. Configurar Secretos en Cloudflare Workers
Ejecuta los siguientes comandos para configurar las variables sensibles:

```bash
# 1. Clave secreta de Cloudflare Turnstile (obtenida del dashboard de Cloudflare)
npx wrangler secret put TURNSTILE_SECRET_KEY

# 2. Genera y guarda el hash de tu contraseña de administrador:
npm run hash-password -- "TuContraseñaSegura123"
npx wrangler secret put ADMIN_PASSWORD_HASH

# 3. Clave secreta para firmar sesiones JWT (mínimo 32 caracteres aleatorios):
npx wrangler secret put SESSION_SECRET

# 4. (Opcional) Clave de Resend para avisos por email al barbero:
npx wrangler secret put RESEND_API_KEY
```

En `wrangler.toml` ajusta los valores públicos de tu barbería:
- `BARBER_WHATSAPP`: Teléfono con prefijo internacional sin signos (ej. `34612345678`).
- `TURNSTILE_SITE_KEY`: Site key pública de Turnstile.
- `ADMIN_USER`: Nombre de usuario del administrador (por defecto `admin`).
- `BARBER_EMAIL`: (Opcional) Tu correo para recibir avisos vía Resend.

### 4. Aplicar Migraciones en D1 Remoto
```bash
npm run db:migrate:remote
```

### 5. Compilar y Desplegar
```bash
npm run deploy
```

---

## ⚙️ Personalización del Negocio (`lib/config.ts`)

Todo el catálogo y las reglas operativas de la barbería se configuran en [`lib/config.ts`](file:///f:/Proyectos/magic-barber-app/lib/config.ts):

- **Servicios y Precios**:
  ```ts
  export const SERVICES: readonly Service[] = [
    { id: "corte-clasico", nombre: "Corte Clásico", duracionMin: 30, precio: 15, descripcion: "..." },
    { id: "arreglo-barba", nombre: "Arreglo de Barba", duracionMin: 30, precio: 10, descripcion: "..." },
    { id: "combo-corte-barba", nombre: "Combo Corte + Barba", duracionMin: 60, precio: 22, descripcion: "..." },
  ];
  ```
- **Horarios y Días**:
  - `openTime: "10:00"` / `closeTime: "20:00"`
  - `slotStepMin: 30` (intervalos de 30 minutos)
  - `closedWeekdays: [0]` (domingos cerrado; 0 = domingo ... 6 = sábado)
  - `timezone: "Europe/Madrid"` (cálculo de slots en la hora local del negocio)
  - `maxDaysAhead: 30` (ventana máxima de reserva en días)

---

## 🔒 Rutas y API

| Ruta | Método | Acceso | Descripción |
|---|---|---|---|
| `/` | GET | Público | Landing con branding y formulario de reserva interactivo en 3 pasos |
| `/api/citas` | GET | Público | Consulta slots disponibles y horas ocupadas para una fecha/servicio |
| `/api/citas` | POST | Público | Crea una cita (valida Turnstile, horario, inserción atómica anti-colisión) |
| `/admin/login` | GET | Público | Formulario de acceso al panel privado |
| `/api/admin/login` | POST | Público | Verificación de credenciales y emisión de cookie de sesión `HttpOnly` |
| `/api/admin/logout` | POST | Público | Invalidación de sesión y borrado de cookie |
| `/admin/dashboard` | GET | Admin | Panel de agenda (Día/Semana, filtros, acciones WhatsApp/Estado) |
| `/api/admin/citas` | GET | Admin | Lista citas por rango de fechas y filtro temporal |
| `/api/admin/citas` | PATCH | Admin | Actualiza estado de una cita (`confirmada`, `cancelada`, `pendiente`) |

---

## 🧪 Verificación y Scripts Disponibles

- `npm run dev` — Inicia el entorno local de Next.js con emulación de bindings D1.
- `npm run typecheck` — Comprobación estricta de tipos de TypeScript (`tsc --noEmit`).
- `npm run lint` — Análisis estático de código con ESLint.
- `npm run db:migrate:local` — Ejecuta migraciones en la base de datos D1 local.
- `npm run db:migrate:remote` — Aplica migraciones en Cloudflare D1 en producción.
- `npm run hash-password` — Generador CLI de hash PBKDF2 para la contraseña de admin.
- `npm run preview` — Previsualización local con workerd / Cloudflare Worker runtime.
- `npm run deploy` — Compilación y despliegue a Cloudflare Workers.
