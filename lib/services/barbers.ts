import { supabase } from "@/lib/supabaseClient";

export interface Barber {
  id: string;
  nombre: string;
  activo: boolean;
  created_at: string;
}

/**
 * Fetch active barbers for public bookings.
 */
export async function fetchActiveBarbers(): Promise<Barber[]> {
  const { data, error } = await supabase
    .from("peluqueros")
    .select("*")
    .eq("activo", true)
    .order("nombre", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Fetch all barbers (active and inactive) for admin management.
 */
export async function fetchAdminBarbers(): Promise<Barber[]> {
  const { data, error } = await supabase
    .from("peluqueros")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Create a new barber.
 */
export async function createBarber(nombre: string): Promise<Barber> {
  const { data, error } = await supabase
    .from("peluqueros")
    .insert({ nombre, activo: true })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update a barber's name or status.
 */
export async function updateBarber(
  id: string,
  updates: { nombre?: string; activo?: boolean }
): Promise<Barber> {
  const { data, error } = await supabase
    .from("peluqueros")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Delete a barber.
 */
export async function deleteBarber(id: string): Promise<void> {
  const { error } = await supabase
    .from("peluqueros")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}

/**
 * Fetch busy barber IDs for a specific time slot.
 */
export async function fetchBusyBarberIdsForSlot(dateTimeIso: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("citas")
    .select("peluquero_id")
    .neq("estado", "cancelada")
    .eq("fecha_hora", dateTimeIso);

  if (error) {
    throw error;
  }

  return (data || []).map((appt: any) => appt.peluquero_id).filter(Boolean);
}
