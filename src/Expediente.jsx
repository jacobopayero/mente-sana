// ============================================================================
//  MENTE SERENA — Expediente completo del paciente (para el profesional)
//  Consolida TODO el histórico en un documento imprimible / exportable a PDF,
//  para que el equipo lo conserve en el record clínico.
//
//  SALVAGUARDA: no incluye peso, IMC, calorías ni medidas corporales.
// ============================================================================
import { useEffect, useState } from "react";
import { ChevronLeft, Printer } from "lucide-react";
import { AVISO_LEGAL } from "./PieLegal.jsx";
import { camposConValor } from "./CamposFicha.jsx";
import {
  animoDePaciente,
  suenoDePaciente,
  citasDePaciente,
  tareasDePaciente,
  notasDePaciente,
  medicamentosDePaciente,
  alertasDePaciente,
  fichaDePaciente,
} from "./api";

const CARAS = ["", "😣", "😕", "😐", "🙂", "😄"];
const ANIMO_TXT = ["", "Muy bajo", "Bajo", "Neutral", "Bien", "Muy bien"];
const CALIDAD = { inquieto: "Inquieto", regular: "Regular", reparador: "Reparador" };
const RANGOS = ["Muy poco", "Poco", "Suficiente", "Bastante"];

const fecha = (iso) => {
  if (!iso) return "";
  const d = new Date(String(iso).slice(0, 10) + "T00:00:00");
  return d.toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
};

function Seccion({ titulo, children }) {
  return (
    <div style={{ marginTop: 18 }}>
      <h3 style={{ fontSize: "0.95rem", margin: "0 0 8px", color: "var(--salvia-osc)", borderBottom: "2px solid var(--salvia-clara)", paddingBottom: 4 }}>
        {titulo}
      </h3>
      {children}
    </div>
  );
}

function Fila({ children }) {
  return <div style={{ padding: "6px 0", borderBottom: "1px solid #eee", fontSize: "0.9rem" }}>{children}</div>;
}

export function VistaExpediente({ paciente, profesional, onVolver }) {
  const [d, setD] = useState(null);

  useEffect(() => {
    (async () => {
      const [animo, sueno, citas, tareas, notas, meds, alertas, ficha] = await Promise.all([
        animoDePaciente(paciente.id),
        suenoDePaciente(paciente.id),
        citasDePaciente(paciente.id),
        tareasDePaciente(paciente.id),
        notasDePaciente(paciente.id),
        medicamentosDePaciente(paciente.id),
        alertasDePaciente(paciente.id),
        fichaDePaciente(paciente.id),
      ]);
      setD({ animo, sueno, citas, tareas, notas, meds, alertas, ficha });
    })().catch(console.error);
  }, [paciente.id]);

  if (!d) return <div className="cargando">Cargando expediente…</div>;

  const generadoPor = profesional ? `${profesional.titulo ? profesional.titulo + " " : ""}${profesional.nombre}` : "";

  return (
    <div style={{ padding: "4px 2px" }}>
      {/* Controles (no se imprimen) */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={onVolver} style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--salvia-osc)", fontWeight: 600 }}>
          <ChevronLeft size={18} /> Volver
        </button>
        <button className="btn" style={{ width: "auto", padding: "10px 16px" }} onClick={() => window.print()}>
          <Printer size={18} /> Imprimir / PDF
        </button>
      </div>

      {/* Documento */}
      <div className="tarjeta" id="expediente">
        <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "2px solid var(--salvia)", paddingBottom: 12, marginBottom: 8 }}>
          <img src={import.meta.env.BASE_URL + "icono.svg"} alt="" style={{ width: 40, height: 40 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Mente Serena · Expediente</div>
            <div style={{ fontSize: "0.82rem", color: "var(--tinta-suave)" }}>
              Generado el {fecha(new Date().toISOString())}
              {generadoPor ? ` · por ${generadoPor}` : ""}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 8px" }}>
          {paciente.foto_url && (
            <img src={paciente.foto_url} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover" }} />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{paciente.nombre}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--tinta-suave)" }}>{paciente.email}</div>
          </div>
        </div>

        {/* Ficha clínica / anamnesis */}
        <Seccion titulo="Ficha clínica (anamnesis)">
          {camposConValor(d.ficha).length ? (
            camposConValor(d.ficha).map(({ label, valor }) => (
              <Fila key={label}><strong>{label}:</strong> {valor}</Fila>
            ))
          ) : (
            <Fila>Sin ficha completada.</Fila>
          )}
        </Seccion>

        {/* Medicación */}
        <Seccion titulo="Medicación">
          {d.meds.length ? d.meds.map((m) => (
            <Fila key={m.id}><strong>{m.nombre}</strong> — {[m.dosis, m.horario && `a las ${(m.horario || "").slice(0,5)}`, m.nota].filter(Boolean).join(" · ")}</Fila>
          )) : <Fila>Sin medicamentos registrados.</Fila>}
        </Seccion>

        {/* Histórico de ánimo */}
        <Seccion titulo={`Histórico de ánimo (${d.animo.length})`}>
          {d.animo.length ? [...d.animo].reverse().map((r) => (
            <Fila key={r.id || r.fecha}>
              {CARAS[r.animo]} <strong>{fecha(r.fecha)}</strong> — {ANIMO_TXT[r.animo]}
              {(r.emociones || []).length ? ` · ${(r.emociones || []).join(", ")}` : ""}
              {r.nota ? ` · “${r.nota}”` : ""}
            </Fila>
          )) : <Fila>Sin registros.</Fila>}
        </Seccion>

        {/* Histórico de sueño */}
        <Seccion titulo={`Histórico de descanso (${d.sueno.length})`}>
          {d.sueno.length ? [...d.sueno].reverse().map((r) => (
            <Fila key={r.id || r.fecha}>
              <strong>{fecha(r.fecha)}</strong> — {CALIDAD[r.calidad]} · {RANGOS[r.rango]} descanso
              {r.nota ? ` · “${r.nota}”` : ""}
            </Fila>
          )) : <Fila>Sin registros.</Fila>}
        </Seccion>

        {/* Alertas */}
        {d.alertas.length > 0 && (
          <Seccion titulo={`Alertas (${d.alertas.length})`}>
            {d.alertas.map((a) => (
              <Fila key={a.id}><strong>{fecha(a.fecha)}</strong> — {a.motivo}{a.respuesta ? ` · ${a.respuesta}` : ""}</Fila>
            ))}
          </Seccion>
        )}

        {/* Tareas */}
        <Seccion titulo={`Tareas (${d.tareas.length})`}>
          {d.tareas.length ? d.tareas.map((t) => (
            <Fila key={t.id}>{t.completada ? "✓" : "○"} {t.texto} <span style={{ color: "var(--tinta-suave)" }}>— {t.completada ? "completada" : "pendiente"}</span></Fila>
          )) : <Fila>Sin tareas.</Fila>}
        </Seccion>

        {/* Notas de coordinación */}
        <Seccion titulo={`Notas de coordinación (${d.notas.length})`}>
          {d.notas.length ? d.notas.map((n) => (
            <Fila key={n.id}>
              <strong>[{n.categoria}]</strong> {fecha(n.creado_en)} {n.visible_paciente ? "· (visible al paciente)" : ""}<br />{n.texto}
            </Fila>
          )) : <Fila>Sin notas.</Fila>}
        </Seccion>

        {/* Citas */}
        <Seccion titulo={`Citas (${d.citas.length})`}>
          {d.citas.length ? d.citas.map((c) => (
            <Fila key={c.id}><strong>{fecha(c.fecha)}</strong> {(c.hora || "").slice(0,5)} — {c.modalidad} · {c.tipo} · {c.estado}</Fila>
          )) : <Fila>Sin citas.</Fila>}
        </Seccion>

        <p style={{ fontSize: "0.75rem", color: "var(--tinta-suave)", marginTop: 18, borderTop: "1px solid #eee", paddingTop: 8 }}>
          Documento confidencial generado por Mente Serena. Uso exclusivo del equipo de cuidado.
          No sustituye el criterio clínico. Datos protegidos conforme a la Ley 172-13 (RD).
          <br />
          {AVISO_LEGAL}
        </p>
      </div>
    </div>
  );
}
