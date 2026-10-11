/** Helpers de enlaces wa.me (seguro en cliente y servidor) */
import { formatFechaCorta } from "./schedule";

/** Solo dígitos, con prefijo de país (formato que exige wa.me) */
export function waNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function waLink(phone: string, text?: string): string {
  const base = `https://wa.me/${waNumber(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export interface CitaResumen {
  nombre: string;
  apellidos: string;
  servicio: string;
  fecha: string;
  hora: string;
}

/** Mensaje que el cliente envía al barbero para confirmar */
export function mensajeConfirmacionCliente(c: CitaResumen): string {
  return `Hola, quiero confirmar mi cita: ${c.nombre} ${c.apellidos}, Servicio: ${c.servicio}, Día: ${formatFechaCorta(c.fecha)}, Hora: ${c.hora}`;
}

/** Mensaje que el barbero envía al cliente desde el panel */
export function mensajeBarberoACliente(c: CitaResumen): string {
  return `Hola ${c.nombre}, te escribo de la barbería sobre tu cita de ${c.servicio} el ${formatFechaCorta(c.fecha)} a las ${c.hora}.`;
}
