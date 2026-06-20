// ============================================================================
//  AURA — Sistema familiar / genograma (enfoque sistémico)
//
//  Para terapia familiar y de pareja: registra los miembros del sistema, su
//  parentesco y la dinámica relacional. Datos estructurados, de uso clínico.
// ============================================================================
import { useEffect, useState } from "react";
import { Users, Plus, Trash2 } from "lucide-react";
import { guardarFichaDePaciente } from "./api";

const PARENTESCOS = ["Madre", "Padre", "Pareja/Cónyuge", "Hijo/a", "Hermano/a", "Abuelo/a", "Otro"];

export function SistemaFamiliar({ paciente, ficha, onGuardar }) {
  const [miembros, setMiembros] = useState(ficha.sistema_familiar || []);
  const [form, setForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [parentesco, setParentesco] = useState(PARENTESCOS[0]);
  const [edad, setEdad] = useState("");
  const [nota, setNota] = useState("");

  useEffect(() => setMiembros(ficha.sistema_familiar || []), [ficha]);

  async function persistir(lista) {
    setMiembros(lista);
    await guardarFichaDePaciente(paciente.id, { sistema_familiar: lista });
    onGuardar && (await onGuardar());
  }

  async function agregar(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    await persistir([...miembros, { nombre: nombre.trim(), parentesco, edad: edad.trim(), nota: nota.trim() }]);
    setNombre("");
    setEdad("");
    setNota("");
    setParentesco(PARENTESCOS[0]);
    setForm(false);
  }

  async function quitar(i) {
    await persistir(miembros.filter((_, idx) => idx !== i));
  }

  return (
    <>
      <div className="seccion-titulo">
        <Users size={15} /> Sistema familiar (genograma)
      </div>
      <div className="tarjeta">
        {miembros.length === 0 ? (
          <p className="vacio" style={{ padding: 8 }}>Sin miembros registrados.</p>
        ) : (
          miembros.map((m, i) => (
            <div className="item" key={i}>
              <div className="avatar" style={{ width: 38, height: 38, fontSize: "0.8rem" }}>
                {(m.nombre || "?").slice(0, 2)}
              </div>
              <div className="cuerpo">
                <div className="titulo">{m.nombre} <span style={{ fontWeight: 400, color: "var(--tinta-suave)" }}>· {m.parentesco}{m.edad ? ` · ${m.edad} años` : ""}</span></div>
                {m.nota && <div className="meta">{m.nota}</div>}
              </div>
              <button onClick={() => quitar(i)} title="Quitar" style={{ color: "var(--tinta-suave)" }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}

        {!form ? (
          <button className="btn fantasma" style={{ marginTop: 12 }} onClick={() => setForm(true)}>
            <Plus size={16} /> Añadir miembro
          </button>
        ) : (
          <form onSubmit={agregar} style={{ marginTop: 12 }}>
            <div className="campo">
              <label>Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" required />
            </div>
            <div className="campo">
              <label>Parentesco</label>
              <select value={parentesco} onChange={(e) => setParentesco(e.target.value)}>
                {PARENTESCOS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label>Edad (opcional)</label>
              <input value={edad} onChange={(e) => setEdad(e.target.value)} placeholder="Edad" />
            </div>
            <div className="campo">
              <label>Dinámica / nota</label>
              <textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Relación, rol en el sistema, conflictos…" />
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
