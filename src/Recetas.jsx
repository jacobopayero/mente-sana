// ============================================================================
//  MENTE SERENA — Recetario
//  El profesional (psiquiatra/terapeuta) envía recetas al paciente; el paciente
//  las consulta. SALVAGUARDA: medicación clínica, sin métricas corporales.
// ============================================================================
import { useEffect, useState } from "react";
import { ChevronLeft, FileText, Plus, Pill } from "lucide-react";
import { listarRecetas, recetasDePaciente, crearReceta } from "./api";

const fecha = (iso) => {
  if (!iso) return "";
  const d = new Date(String(iso).slice(0, 10) + "T00:00:00");
  return d.toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" });
};

function Receta({ r }) {
  return (
    <div className="item" style={{ display: "block" }}>
      <div className="titulo" style={{ fontWeight: 700 }}>
        {r.medicamento} {r.dosis ? `· ${r.dosis}` : ""}
      </div>
      <div className="meta">
        {r.frecuencia || ""}
        {r.profesional_nombre ? ` · ${r.profesional_nombre}` : ""} · {fecha(r.fecha)}
      </div>
      {r.indicaciones && <div className="meta" style={{ marginTop: 2 }}>{r.indicaciones}</div>}
    </div>
  );
}

// ---- Vista del paciente ----------------------------------------------------
export function VistaRecetas({ irA }) {
  const [recetas, setRecetas] = useState([]);

  useEffect(() => {
    listarRecetas().then(setRecetas).catch(console.error);
  }, []);

  return (
    <>
      <header className="encabezado">
        <button
          onClick={() => irA("inicio")}
          style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--salvia-osc)", fontWeight: 600, marginBottom: 6 }}
        >
          <ChevronLeft size={18} /> Inicio
        </button>
        <p className="saludo">De tu equipo</p>
        <h1 style={{ marginTop: 0 }}>Mis recetas</h1>
      </header>

      <div className="tarjeta">
        {recetas.length === 0 ? (
          <p className="vacio">Aún no tienes recetas.</p>
        ) : (
          recetas.map((r) => <Receta key={r.id} r={r} />)
        )}
      </div>

      <p className="sub" style={{ padding: "0 4px" }}>
        Las recetas las emite tu equipo de cuidado. Ante dudas, consúltalo con tu médico.
      </p>
    </>
  );
}

// ---- Bloque del profesional ------------------------------------------------
export function Recetario({ paciente }) {
  const [recetas, setRecetas] = useState([]);
  const [form, setForm] = useState(false);
  const [medicamento, setMedicamento] = useState("");
  const [dosis, setDosis] = useState("");
  const [frecuencia, setFrecuencia] = useState("");
  const [indicaciones, setIndicaciones] = useState("");

  async function cargar() {
    setRecetas(await recetasDePaciente(paciente.id));
  }
  useEffect(() => {
    cargar().catch(console.error);
  }, [paciente.id]);

  async function enviar(e) {
    e.preventDefault();
    if (!medicamento.trim()) return;
    await crearReceta({
      paciente_id: paciente.id,
      medicamento: medicamento.trim(),
      dosis: dosis.trim(),
      frecuencia: frecuencia.trim(),
      indicaciones: indicaciones.trim(),
    });
    setMedicamento("");
    setDosis("");
    setFrecuencia("");
    setIndicaciones("");
    setForm(false);
    await cargar();
  }

  return (
    <>
      <div className="seccion-titulo">
        <FileText size={15} /> Recetario
      </div>
      <div className="tarjeta">
        {recetas.length === 0 ? (
          <p className="vacio" style={{ padding: 8 }}>Sin recetas emitidas.</p>
        ) : (
          recetas.map((r) => <Receta key={r.id} r={r} />)
        )}

        {!form ? (
          <button className="btn fantasma" style={{ marginTop: 12 }} onClick={() => setForm(true)}>
            <Plus size={16} /> Emitir receta
          </button>
        ) : (
          <form onSubmit={enviar} style={{ marginTop: 12 }}>
            <div className="campo">
              <label>Medicamento</label>
              <input value={medicamento} onChange={(e) => setMedicamento(e.target.value)} placeholder="Ej.: Sertralina" required />
            </div>
            <div className="campo">
              <label>Dosis</label>
              <input value={dosis} onChange={(e) => setDosis(e.target.value)} placeholder="Ej.: 50 mg" />
            </div>
            <div className="campo">
              <label>Frecuencia</label>
              <input value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)} placeholder="Ej.: 1 vez al día" />
            </div>
            <div className="campo">
              <label>Indicaciones</label>
              <textarea value={indicaciones} onChange={(e) => setIndicaciones(e.target.value)} placeholder="Ej.: con el desayuno; no suspender sin indicación" />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" type="submit">
                <Pill size={16} /> Enviar al paciente
              </button>
              <button className="btn secundario" type="button" onClick={() => setForm(false)}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
