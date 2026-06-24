-- SQL Script to set up the database schema for the Barber Booking App
-- Execute this script in your Supabase SQL Editor.

-- Create the table for appointments
CREATE TABLE IF NOT EXISTS public.citas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    telefono_whatsapp TEXT NOT NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    servicio TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Constraint to ensure the status is one of the valid values
    CONSTRAINT check_estado CHECK (estado IN ('pendiente', 'confirmada', 'cancelada'))
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

-- Create Policies for clients (public read/write) and admin (authenticated full control)
-- Policy 1: Anyone can insert a booking (public booking flow)
CREATE POLICY "Allow public booking creation" 
ON public.citas 
FOR INSERT 
WITH CHECK (true);

-- Policy 2: Anyone can read bookings to check for occupied slots
CREATE POLICY "Allow public booking reading" 
ON public.citas 
FOR SELECT 
USING (true);

-- Policy 3: Only authenticated administrators can update or delete bookings
CREATE POLICY "Allow admin full control" 
ON public.citas 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Unique Constraint: Prevent booking the same fecha_hora if the appointment is not cancelled.
-- Using a partial unique index is the standard PostgreSQL way to achieve this conditional constraint.
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_booking 
ON public.citas (fecha_hora) 
WHERE (estado != 'cancelada');
