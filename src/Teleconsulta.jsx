// ============================================================================
//  MENTE SERENA — Teleconsulta (número asociado + registro de consultas)
//
//  IMPORTANTE (legal y técnico): grabar una llamada requiere CONSENTIMIENTO
//  explícito de las partes y una integración telefónica (p. ej. Twilio) con un
//  número asociado y almacenamiento seguro. Aquí se gestiona el número y el
//  registro de consultas; la grabación/transcripción se conecta en esa fase.
// ============================================================================
import { useEffect, useState } from "react";
import { Phone, PhoneCall, Plus, Save, Mic } from "lucide-react";
import {
  getNumeroAsociado,
  setNumeroAsociado,
  listarTeleconsultas,
  crearTeleconsulta,
} from "./api";

const fecha = (iso) => {
  if (!iso) return "";
  const d = new Date(String(iso).slice(0, 10) + "T00:00:00");
  return d.toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" });
};

export function Teleconsulta() {
  const [numero, setNumero] = useState("");
  const [editando, setEditando] = useState(false);
  const [consultas, setConsultas] = useState([]);
  const [form, setForm] = useState(false);
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [nota, setNota] = useState("");

  async function cargar() {
    setNumero(await getNumeroAsociado());
    setConsultas(await listarTeleconsultas());
  }
  useEffect(() => {
    cargar().catch(console.error);
  }, []);

  async function guardarNumero() {
    await setNumeroAsociado(numero.trim());
    setEditando(false);
  }

  async function registrar(e) {
    e.preventDefault();
    if (!pacienteNombre.trim()) return;
    await crearTeleconsulta({ paciente_nombre: pacienteNombre.trim(), nota: nota.trim() });
    setPacienteNombre("");
    setNota("");
    setForm(false);
    setConsultas(await listarTeleconsultas());
  }

  return (
    <>
      <div className="seccion-titulo">
        <PhoneCall size={15} /> Teleconsulta
      </div>

      {/* Número asociado */}
      <div className="tarjeta">
        <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Phone size={18} /> Número asociado
        </h2>
        <p className="sub">Las llamadas de consulta se enlazan con este número.</p>
        {editando ? (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ej.: +1 809 000 0000"
              style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: "1.5px solid var(--crema-osc)", background: "var(--crema)" }}
            />
            <button className="btn" style={{ width: "auto", padding: "10px 16px" }} onClick={guardarNumero}>
              <Save size={16} /> Guardar
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: numero ? "var(--tinta)" : "var(--tinta-suave)" }}>
              {numero || "Sin número configurado"}
            </div>
            <button className="btn fantasma" style={{ width: "auto", padding: "8px 14px" }} onClick={() => setEditando(true)}>
              {numero ? "Cambiar" : "Configurar"}
            </button>
          </div>
        )}
      </div>

      {/* Aviso de grabación */}
      <div className="aviso">
        <div className="titulo">
          <Mic size={18} /> Grabación para evaluación y análisis
        </div>
        <p>
          La grabación de la consulta requiere el <strong>consentimiento</strong> del paciente y la
          integración telefónica (plug-in). Una vez activa, cada llamada se grabará y enlazará al
          número asociado para su evaluación clínica.
        </p>
      </div>

      {/* Registro de consultas */}
      <div className="tarjeta">
        <h2>Registro de consultas</h2>
        {consultas.length === 0 ? (
          <p className="vacio" style={{ padding: 8 }}>Sin consultas registradas.</p>
        ) : (
          consultas.map((c) => (
            <div className="item" key={c.id} style={{ display: "block" }}>
              <div className="titulo" style={{ fontWeight: 600 }}>{c.paciente_nombre}</div>
              <div className="meta">
                {fecha(c.fecha)} · {c.profesional_nombre || "—"}
                {c.duracion_min ? ` · ${c.duracion_min} min` : ""} ·{" "}
                {c.grabacion ? "grabada" : "grabación pendiente"}
              </div>
              {c.nota && <div className="meta" style={{ marginTop: 2 }}>“{c.nota}”</div>}
            </div>
          ))
        )}

        {!form ? (
          <button className="btn fantasma" style={{ marginTop: 12 }} onClick={() => setForm(true)}>
            <Plus size={16} /> Registrar consulta
          </button>
        ) : (
          <form onSubmit={registrar} style={{ marginTop: 12 }}>
            <div className="campo">
              <label>Paciente</label>
              <input value={pacienteNombre} onChange={(e) => setPacienteNombre(e.target.value)} placeholder="Nombre del paciente" required />
            </div>
            <div className="campo">
              <label>Nota (opcional)</label>
              <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Motivo o resumen" />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" type="submit">Guardar</button>
              <button className="btn secundario" type="button" onClick={() => setForm(false)}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
