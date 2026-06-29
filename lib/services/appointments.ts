import { supabase } from "@/lib/supabaseClient";

export interface AppointmentData {
  nombre: string;
  apellidos: string;
  telefono_whatsapp: string;
  fecha_hora: string;
  servicio: string;
  peluquero_id?: string | null;
}

/**
 * Fetches booked times (in HH:MM format) for a given date and optionally a specific barber.
 */
export async function fetchBookedSlots(date: Date, peluqueroId?: string | null): Promise<string[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  let query = supabase
    .from("citas")
    .select("fecha_hora, peluquero_id")
    .neq("estado", "cancelada")
    .gte("fecha_hora", start.toISOString())
    .lte("fecha_hora", end.toISOString());

  // Filter by barber if a specific one is selected
  if (peluqueroId && peluqueroId !== "any") {
    query = query.eq("peluquero_id", peluqueroId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const bookings = data || [];

  if (peluqueroId === "any" || !peluqueroId) {
    // If "any" is selected, a slot is booked only if ALL active barbers are booked at that time!
    // 1. Fetch count of active barbers
    const { count, error: countErr } = await supabase
      .from("peluqueros")
      .select("*", { count: "exact", head: true })
      .eq("activo", true);

    if (countErr) {
      throw countErr;
    }

    const totalBarbers = count || 1;

    // 2. Count appointments per time slot
    const slotCounts: { [key: string]: number } = {};
    bookings.forEach((booking: any) => {
      const d = new Date(booking.fecha_hora);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const timeStr = `${hh}:${mm}`;
      slotCounts[timeStr] = (slotCounts[timeStr] || 0) + 1;
    });

    // 3. A slot is busy if slot appointments count >= active barbers count
    return Object.keys(slotCounts).filter((time) => slotCounts[time] >= totalBarbers);
  } else {
    // If specific barber, return their busy slots directly
    return bookings.map((booking: any) => {
      const d = new Date(booking.fecha_hora);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    });
  }
}

/**
 * Inserts a new appointment, assigning a free active barber if "any" is chosen.
 */
export async function createAppointment(appointment: AppointmentData): Promise<any> {
  let peluqueroId = appointment.peluquero_id;

  // Auto assign a free active barber if "any" or none is selected
  if (!peluqueroId || peluqueroId === "any") {
    // 1. Get all active barbers
    const { data: barbers, error: barbersErr } = await supabase
      .from("peluqueros")
      .select("id")
      .eq("activo", true);

    if (barbersErr) throw barbersErr;
    if (!barbers || barbers.length === 0) {
      throw new Error("No hay peluqueros activos en el sistema para realizar la reserva.");
    }

    // 2. Find appointments at this exact time
    const { data: activeAppointments, error: apptsErr } = await supabase
      .from("citas")
      .select("peluquero_id")
      .neq("estado", "cancelada")
      .eq("fecha_hora", appointment.fecha_hora);

    if (apptsErr) throw apptsErr;

    const busyBarbers = new Set((activeAppointments || []).map((a) => a.peluquero_id));

    // 3. Find first free barber
    const freeBarber = barbers.find((b) => !busyBarbers.has(b.id));

    if (!freeBarber) {
      throw new Error("No hay peluqueros libres disponibles para este horario.");
    }
    peluqueroId = freeBarber.id;
  }

  const { data, error } = await supabase
    .from("citas")
    .insert({
      nombre: appointment.nombre,
      apellidos: appointment.apellidos,
      telefono_whatsapp: appointment.telefono_whatsapp,
      fecha_hora: appointment.fecha_hora,
      servicio: appointment.servicio,
      peluquero_id: peluqueroId,
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
 * Fetches all appointments for a specific date with peluqueros join (for the admin dashboard).
 */
export async function fetchAppointmentsForDate(date: Date): Promise<any[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("citas")
    .select("*, peluqueros(nombre)")
    .gte("fecha_hora", start.toISOString())
    .lte("fecha_hora", end.toISOString())
    .order("fecha_hora", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Updates the status or details of an existing appointment (including reassigning barbers).
 */
export async function updateAppointmentStatus(
  id: string,
  newStatus?: string,
  peluqueroId?: string
): Promise<any> {
  const updates: any = {};
  if (newStatus !== undefined) updates.estado = newStatus;
  if (peluqueroId !== undefined) updates.peluquero_id = peluqueroId;

  const { data, error } = await supabase
    .from("citas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
