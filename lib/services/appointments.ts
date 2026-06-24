import { supabase } from "@/lib/supabaseClient";

export interface AppointmentData {
  nombre: string;
  apellidos: string;
  telefono_whatsapp: string;
  fecha_hora: string;
  servicio: string;
}

/**
 * Fetches booked times (in HH:MM format) for a given date.
 */
export async function fetchBookedSlots(date: Date): Promise<string[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("citas")
    .select("fecha_hora")
    .neq("estado", "cancelada")
    .gte("fecha_hora", start.toISOString())
    .lte("fecha_hora", end.toISOString());

  if (error) {
    throw error;
  }

  // Map UTC/ISO strings to client's local "HH:MM"
  return (data || []).map((booking: any) => {
    const d = new Date(booking.fecha_hora);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  });
}

/**
 * Inserts a new appointment.
 */
export async function createAppointment(appointment: AppointmentData): Promise<any> {
  const { data, error } = await supabase
    .from("citas")
    .insert({
      nombre: appointment.nombre,
      apellidos: appointment.apellidos,
      telefono_whatsapp: appointment.telefono_whatsapp,
      fecha_hora: appointment.fecha_hora,
      servicio: appointment.servicio,
      estado: "pendiente"
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Fetches all appointments for a specific date (for the admin dashboard).
 */
export async function fetchAppointmentsForDate(date: Date): Promise<any[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("citas")
    .select("*")
    .gte("fecha_hora", start.toISOString())
    .lte("fecha_hora", end.toISOString())
    .order("fecha_hora", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Updates the status of an existing appointment.
 */
export async function updateAppointmentStatus(id: string, newStatus: string): Promise<any> {
  const { data, error } = await supabase
    .from("citas")
    .update({ estado: newStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
