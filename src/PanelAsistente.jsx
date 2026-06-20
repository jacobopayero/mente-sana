// ============================================================================
//  AURA — Panel del asistente / secretaria (acceso limitado)
//
//  Autorizado por el médico. POR DEFECTO solo ve datos de CONTACTO del paciente
//  y gestiona las citas. Si el médico lo permite, puede "sellar" indicaciones.
//  NO ve la información clínica (ánimo, ficha, notas, etc.).
// ============================================================================
import { useEffect, useState } from "react";
import { LogOut, Phone, Mail, CalendarDays, Plus, Trash2, Video, MapPin, Stamp } from "lucide-react";
import {
  cerrarSesion,
  contactosPacientes,
  miPermisoAsistente,
  citasDePaciente,
  crearCitaPara,
  cancelarCita,
  recetasDePaciente,
  sellarReceta,
} from "./api";
import PieLegal from "./PieLegal.jsx";

const hoy = () => new Date().toISOString().slice(0, 10);
const fecha = (iso) => {
  if (!iso) return "";
  const d = new Date(String(iso).slice(0, 10) + "T00:00:00");
  return d.toLocaleDateString("es-DO", { weekday: "short", day: "numeric", month: "short" });
};

export default function PanelAsistente({ perfil, alSalir }) {
  const [permiso, setPermiso] = useState({ autorizado: false, sellar: false });
  const [pacientes, setPacientes] = useState([]);
  const [sel, setSel] = useState(null);

  useEffect(() => {
    miPermisoAsistente().then(setPermiso).catch(console.error);
    contactosPacientes().then(setPacientes).catch(console.error);
  }, []);

  async function salir() {
    await cerrarSesion();
    await alSalir();
  }

  return (
    <div className="app">
      <div className="banner-demo" style={{ background: "var(--salvia-osc)", color: "#fff" }}>
        Asistencia · agenda y contacto
      </div>

      <div className="contenido" style={{ paddingBottom: 24 }}>
        <header className="encabezado">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p className="saludo">Asistente</p>
              <h1>{perfil.nombre}</h1>
            </div>
            <button style={{ padding: 8 }} onClick={salir} title="Cerrar sesión">
              <LogOut size={20} color="var(--tinta-suave)" />
            </button>
          </div>
        </header>

        {!permiso.autorizado ? (
          <div className="aviso">
            <div className="titulo">Pendiente de autorización</div>
            <p>El médico aún no ha habilitado tu acceso.</p>
          </div>
        ) : !sel ? (
          <>
            <div className="aviso" style={{ background: "#eef1ea", borderColor: "var(--salvia-clara)" }}>
              <p style={{ margin: 0 }}>
                Acceso limitado: solo <strong>datos de contacto</strong> y <strong>citas</strong>.
                No se muestra información clínica.
              </p>
            </div>
            <div className="seccion-titulo">Pacientes (contacto)</div>
            <div className="tarjeta">
              {pacientes.length === 0 ? (
                <p className="vacio">Sin pacientes.</p>
              ) : (
                pacientes.map((p) => (
                  <button key={p.id} className="item" style={{ width: "100%", textAlign: "left" }} onClick={() => setSel(p)}>
                    <div className="avatar" style={{ width: 40, height: 40 }}>
                      {(p.nombre || "?").split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </div>
                    <div className="cuerpo">
                      <div className="titulo">{p.nombre}</div>
                      <div className="meta">{p.telefono || "sin teléfono"} · {p.email}</div>
                    </div>
                    <CalendarDays size={18} color="var(--tinta-suave)" />
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <DetalleAsistente paciente={sel} permiso={permiso} onVolver={() => setSel(null)} />
        )}

        <PieLegal />
      </div>
    </div>
  );
}

function DetalleAsistente({ paciente, permiso, onVolver }) {
  const [citas, setCitas] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [form, setForm] = useState(false);
  const [fechaC, setFechaC] = useState("");
  const [hora, setHora] = useState("16:00");
  const [modalidad, setModalidad] = useState("Videollamada");
  const [tipo, setTipo] = useState("Individual");

  async function cargar() {
    setCitas(await citasDePaciente(paciente.id));
    if (permiso.sellar) setRecetas(await recetasDePaciente(paciente.id));
  }
  useEffect(() => {
    cargar().catch(console.error);
  }, [paciente.id]);

  async function agendar(e) {
    e.preventDefault();
    await crearCitaPara({ paciente_id: paciente.id, fecha: fechaC, hora, modalidad, tipo });
    setForm(false);
    setFechaC("");
    await cargar();
  }
  async function cancelar(cid) {
    await cancelarCita(cid);
    await cargar();
  }
  async function sellar(rid) {
    await sellarReceta(rid);
    await cargar();
  }

  const proximas = citas.filter((c) => c.estado !== "cancelada");

  return (
    <>
      <header className="encabezado">
        <button onClick={onVolver} style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--salvia-osc)", fontWeight: 600, marginBottom: 6 }}>
          ‹ Pacientes
        </button>
        <h1 style={{ marginTop: 0 }}>{paciente.nombre}</h1>
      </header>

      {/* Contacto */}
      <div className="tarjeta">
        <a className="item" href={`tel:${paciente.telefono}`} style={{ textDecoration: "none" }}>
          <div className="icono-redondo"><Phone size={18} /></div>
          <div className="cuerpo"><div className="titulo">{paciente.telefono || "Sin teléfono"}</div><div className="meta">Llamar</div></div>
        </a>
        <a className="item" href={`mailto:${paciente.email}`} style={{ textDecoration: "none" }}>
          <div className="icono-redondo"><Mail size={18} /></div>
          <div className="cuerpo"><div className="titulo">{paciente.email}</div><div className="meta">Correo</div></div>
        </a>
      </div>

      {/* Citas */}
      <div className="seccion-titulo"><CalendarDays size={15} /> Citas</div>
      {!form && (
        <button className="btn" style={{ marginBottom: 14 }} onClick={() => setForm(true)}>
          <Plus size={18} /> Agendar cita
        </button>
      )}
      {form && (
        <form className="tarjeta" onSubmit={agendar}>
          <div className="campo"><label>Fecha</label><input type="date" value={fechaC} min={hoy()} onChange={(e) => setFechaC(e.target.value)} required /></div>
          <div className="campo"><label>Hora</label><input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required /></div>
          <div className="campo"><label>Modalidad</label><select value={modalidad} onChange={(e) => setModalidad(e.target.value)}><option>Videollamada</option><option>Presencial</option></select></div>
          <div className="campo"><label>Tipo</label><select value={tipo} onChange={(e) => setTipo(e.target.value)}><option>Individual</option><option>Pareja</option><option>Familiar</option></select></div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" type="submit">Agendar</button>
            <button className="btn secundario" type="button" onClick={() => setForm(false)}>Cancelar</button>
          </div>
        </form>
      )}
      <div className="tarjeta">
        {proximas.length === 0 ? (
          <p className="vacio">Sin citas.</p>
        ) : (
          proximas.map((c) => (
            <div className="item" key={c.id}>
              <div className="icono-redondo">{c.modalidad === "Videollamada" ? <Video size={18} /> : <MapPin size={18} />}</div>
              <div className="cuerpo">
                <div className="titulo">{fecha(c.fecha)} · {(c.hora || "").slice(0, 5)}</div>
                <div className="meta">{c.modalidad} · {c.tipo}</div>
              </div>
              <button onClick={() => cancelar(c.id)} title="Cancelar" style={{ color: "var(--tinta-suave)" }}><Trash2 size={18} /></button>
            </div>
          ))
        )}
      </div>

      {/* Sellar indicaciones (solo si el médico lo permitió) */}
      {permiso.sellar && (
        <>
          <div className="seccion-titulo"><Stamp size={15} /> Sellar indicaciones</div>
          <div className="tarjeta">
            {recetas.length === 0 ? (
              <p className="vacio">Sin indicaciones.</p>
            ) : (
              recetas.map((r) => (
                <div className="item" key={r.id}>
                  <div className="cuerpo">
                    <div className="titulo">{r.medicamento} {r.dosis ? `· ${r.dosis}` : ""}</div>
                    <div className="meta">{r.frecuencia || ""}{r.profesional_nombre ? ` · ${r.profesional_nombre}` : ""}</div>
                  </div>
                  {r.sellada ? (
                    <span className="etiqueta">Sellada</span>
                  ) : (
                    <button className="btn" style={{ width: "auto", padding: "8px 14px" }} onClick={() => sellar(r.id)}>
                      <Stamp size={16} /> Sellar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </>
  );
}
