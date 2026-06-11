// ============================================================================
//  Integración con el Calendario / Recordatorios (formato .ics)
//
//  Genera eventos de calendario que el teléfono abre en su app de Calendario
//  (o Recordatorios) de Apple/Google. Es la forma de "recordar" citas,
//  medicamentos y tareas sin depender de un servidor de notificaciones:
//  la alarma la dispara el propio calendario del sistema, aunque la app esté
//  cerrada.
// ============================================================================

const pad = (n) => String(n).padStart(2, "0");

// Fecha/hora local en formato ICS "flotante" (YYYYMMDDTHHMMSS).
function fmt(dt) {
  return (
    `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}` +
    `T${pad(dt.getHours())}${pad(dt.getMinutes())}00`
  );
}

function uid() {
  return "ms-" + Math.random().toString(36).slice(2) + "@mente-serena";
}

// Escapa los caracteres especiales del texto en ICS.
function esc(t = "") {
  return String(t).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

// Construye el contenido .ics de un evento.
//  inicio: Date · durMin: duración · alarmaMin: minutos antes para avisar
//  rrule: regla de repetición (ej. "FREQ=DAILY") · null = evento único
export function construirICS({ titulo, descripcion = "", inicio, durMin = 60, alarmaMin = 15, rrule = null }) {
  const fin = new Date(inicio.getTime() + durMin * 60000);
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mente Serena//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid()}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(inicio)}`,
    `DTEND:${fmt(fin)}`,
    `SUMMARY:${esc(titulo)}`,
    descripcion ? `DESCRIPTION:${esc(descripcion)}` : null,
    rrule ? `RRULE:${rrule}` : null,
    "BEGIN:VALARM",
    `TRIGGER:-PT${Math.max(0, alarmaMin)}M`,
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(titulo)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lineas.join("\r\n");
}

// Descarga / abre el .ics. En iPhone, Safari ofrece añadirlo al Calendario.
export function abrirEnCalendario(nombreArchivo, contenidoICS) {
  const blob = new Blob([contenidoICS], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nombreArchivo}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---- Constructores específicos --------------------------------------------

export function recordarCita(cita) {
  const hora = (cita.hora || "09:00").slice(0, 5);
  const inicio = new Date(`${cita.fecha}T${hora}:00`);
  const ics = construirICS({
    titulo: "Cita · Mente Serena",
    descripcion: `${cita.modalidad || ""} · ${cita.tipo || ""}`.trim(),
    inicio,
    durMin: 60,
    alarmaMin: 60, // avisa 1 hora antes
  });
  abrirEnCalendario("cita-mente-serena", ics);
}

export function recordarMedicamento(med) {
  const hora = (med.horario || "08:00").slice(0, 5);
  const hoy = new Date();
  const [h, m] = hora.split(":").map(Number);
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), h, m, 0);
  const ics = construirICS({
    titulo: `Tomar ${med.nombre}`,
    descripcion: [med.dosis, med.nota].filter(Boolean).join(" · "),
    inicio,
    durMin: 10,
    alarmaMin: 0, // avisa a la hora exacta
    rrule: "FREQ=DAILY", // todos los días
  });
  abrirEnCalendario(`medicamento-${med.nombre}`, ics);
}

export function recordarTarea(tarea, hora = "09:00") {
  const hoy = new Date();
  const [h, m] = hora.split(":").map(Number);
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), h, m, 0);
  const ics = construirICS({
    titulo: `Tarea · ${tarea.texto}`,
    descripcion: "Recordatorio de tu acompañamiento en Mente Serena.",
    inicio,
    durMin: 30,
    alarmaMin: 0,
  });
  abrirEnCalendario("tarea-mente-serena", ics);
}
