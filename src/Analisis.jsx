// ============================================================================
//  AURA — Análisis con IA + Estadísticas (para el profesional)
//
//  Calcula estadísticas a partir de los datos que el paciente YA registró
//  (ánimo, emociones, sueño, adherencia) y muestra un resumen de comportamiento.
//
//  ÉTICA Y PRIVACIDAD: solo se analizan datos recogidos con consentimiento, bajo
//  minimización de datos. SIN peso, IMC, calorías ni métricas corporales. El
//  análisis enriquecido con IA (Claude) se genera en el backend, sobre datos
//  con consentimiento, y nunca reemplaza el criterio clínico.
// ============================================================================
import { Sparkles, BarChart3, ShieldCheck } from "lucide-react";

const ANIMO_TXT = ["", "muy bajo", "bajo", "neutral", "bien", "muy bien"];

function promedio(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function AnalisisIA({ animo = [], sueno = [], tareas = [] }) {
  const valores = animo.map((r) => r.animo).filter(Boolean);
  const prom = promedio(valores);

  // Tendencia: primera mitad vs segunda mitad
  let tendencia = "estable";
  if (valores.length >= 4) {
    const mitad = Math.floor(valores.length / 2);
    const a = promedio(valores.slice(0, mitad));
    const b = promedio(valores.slice(mitad));
    if (b - a >= 0.4) tendencia = "mejorando";
    else if (a - b >= 0.4) tendencia = "a la baja";
  }

  // Emociones más frecuentes
  const cuenta = {};
  animo.forEach((r) => (r.emociones || []).forEach((e) => (cuenta[e] = (cuenta[e] || 0) + 1)));
  const topEmociones = Object.entries(cuenta).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([e]) => e);

  // Adherencia a tareas
  const totalT = tareas.length;
  const hechas = tareas.filter((t) => t.completada).length;
  const adherencia = totalT ? Math.round((hechas / totalT) * 100) : 0;

  // Descanso reparador
  const reparador = sueno.filter((s) => s.calidad === "reparador").length;
  const pctReparador = sueno.length ? Math.round((reparador / sueno.length) * 100) : 0;

  // Resumen de comportamiento (regla simple; la versión enriquecida la genera la IA)
  const frases = [];
  if (valores.length) frases.push(`Ánimo promedio ${prom.toFixed(1)}/5 (${ANIMO_TXT[Math.round(prom)] || "—"}), tendencia ${tendencia}.`);
  if (topEmociones.length) frases.push(`Emociones más presentes: ${topEmociones.join(", ")}.`);
  if (totalT) frases.push(`Adherencia a tareas: ${adherencia}%.`);
  if (sueno.length) frases.push(`Descanso reparador en ${pctReparador}% de las noches registradas.`);
  const resumen = frases.length ? frases.join(" ") : "Aún no hay datos suficientes para un análisis.";

  const Stat = ({ valor, texto }) => (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--salvia-osc)" }}>{valor}</div>
      <div className="meta" style={{ fontSize: "0.74rem" }}>{texto}</div>
    </div>
  );

  return (
    <>
      <div className="seccion-titulo">
        <BarChart3 size={15} /> Análisis y estadísticas
      </div>

      <div className="tarjeta">
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <Stat valor={valores.length ? prom.toFixed(1) : "—"} texto="Ánimo prom." />
          <Stat valor={`${adherencia}%`} texto="Tareas" />
          <Stat valor={`${pctReparador}%`} texto="Descanso" />
          <Stat valor={valores.length} texto="Registros" />
        </div>

        <div
          style={{
            background: "var(--crema)",
            borderRadius: 12,
            padding: 14,
            borderLeft: "4px solid var(--salvia)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--salvia-osc)", marginBottom: 6 }}>
            <Sparkles size={16} /> Resumen de comportamiento
          </div>
          <p style={{ margin: 0, fontSize: "0.92rem" }}>{resumen}</p>
          <p className="meta" style={{ marginTop: 8, fontSize: "0.74rem" }}>
            El análisis enriquecido con IA (Claude) se genera sobre datos con consentimiento.
            Apoya, no reemplaza, el criterio clínico.
          </p>
        </div>
      </div>

      <div className="aviso" style={{ background: "#eef1ea", borderColor: "var(--salvia-clara)" }}>
        <div className="titulo" style={{ color: "var(--salvia-osc)" }}>
          <ShieldCheck size={18} /> Datos con propósito y consentimiento
        </div>
        <p>
          Se analizan solo los datos que el paciente registró y autorizó (minimización de datos).
          Sin peso, IMC ni medidas corporales.
        </p>
      </div>
    </>
  );
}
