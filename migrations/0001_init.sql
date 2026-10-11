-- Migration number: 0001 	 Esquema inicial de reservas
-- Cloudflare D1 (SQLite)

CREATE TABLE IF NOT EXISTS citas (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre            TEXT    NOT NULL CHECK (length(nombre) BETWEEN 1 AND 60),
  apellidos         TEXT    NOT NULL CHECK (length(apellidos) BETWEEN 1 AND 80),
  telefono_whatsapp TEXT    NOT NULL CHECK (length(telefono_whatsapp) BETWEEN 8 AND 16),
  servicio          TEXT    NOT NULL,
  -- 'YYYY-MM-DD'
  fecha             TEXT    NOT NULL CHECK (fecha GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  -- 'HH:MM'
  hora              TEXT    NOT NULL CHECK (hora GLOB '[0-2][0-9]:[0-5][0-9]'),
  -- Duración en minutos: permite detectar solapamientos de servicios largos
  duracion_min      INTEGER NOT NULL DEFAULT 30 CHECK (duracion_min > 0 AND duracion_min <= 240),
  estado            TEXT    NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Barrera final contra dobles reservas: dos citas activas no pueden empezar a
-- la misma hora el mismo día. (El solapamiento por duración se controla con un
-- INSERT condicional atómico en lib/d1.ts.)
CREATE UNIQUE INDEX IF NOT EXISTS idx_citas_slot
  ON citas (fecha, hora)
  WHERE estado != 'cancelada';

-- Consultas de agenda / disponibilidad por rango de fechas
CREATE INDEX IF NOT EXISTS idx_citas_fecha_estado
  ON citas (fecha, estado, hora);
