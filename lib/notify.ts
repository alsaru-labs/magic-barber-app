/**
 * Aviso opcional por email al barbero vía Resend (https://resend.com).
 * Solo se activa si existen RESEND_API_KEY y BARBER_EMAIL. Nunca bloquea ni
 * hace fallar la reserva: se ejecuta en segundo plano con ctx.waitUntil.
 */
import { BUSINESS } from "./config";
import type { Cita } from "./d1";
import { getVar } from "./env";
import { formatFechaLarga } from "./schedule";
import { waLink } from "./whatsapp";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function notifyBarberNewCita(cita: Cita): Promise<void> {
  const [apiKey, to, from] = await Promise.all([
    getVar("RESEND_API_KEY"),
    getVar("BARBER_EMAIL"),
    getVar("RESEND_FROM"),
  ]);
  if (!apiKey || !to) return;

  const fecha = formatFechaLarga(cita.fecha);
  const nombre = `${cita.nombre} ${cita.apellidos}`;
  const html = `
    <h2>Nueva reserva pendiente</h2>
    <p><strong>${escapeHtml(nombre)}</strong></p>
    <ul>
      <li>Servicio: ${escapeHtml(cita.servicio)}</li>
      <li>Día: ${escapeHtml(fecha)}</li>
      <li>Hora: ${escapeHtml(cita.hora)}</li>
      <li>WhatsApp: <a href="${waLink(cita.telefono_whatsapp)}">+${escapeHtml(cita.telefono_whatsapp)}</a></li>
    </ul>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: from || `${BUSINESS.name} <onboarding@resend.dev>`,
      to: [to],
      subject: `Nueva cita: ${nombre} · ${fecha} ${cita.hora}`,
      html,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    console.error("[resend] fallo al enviar email", res.status, await res.text().catch(() => ""));
  }
}
