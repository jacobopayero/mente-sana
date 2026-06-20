// ============================================================================
//  AURA — Panel del profesional (Fase 2)
//  Para roles 'terapeuta', 'psiquiatra' y 'admin'.
//
//  El profesional ve a sus pacientes a cargo y, por cada uno: su ánimo y sueño
//  recientes, las alertas de descanso, las tareas asignadas, las notas de
//  coordinación y las citas. Puede asignar tareas y escribir notas.
//
//  SALVAGUARDAS: en ningún punto se muestran ni piden calorías, peso, IMC ni
//  métricas corporales; el sueño es solo cualitativo.
// ============================================================================
import { useEffect, useState, useCallback } from "react";
import {
  Users,
  ChevronLeft,
  LogOut,
  Moon,
  HeartPulse,
  CheckSquare,
  ClipboardList,
  CalendarDays,
  Plus,
  Eye,
  EyeOff,
  Wind,
  Video,
  MapPin,
  FileText,
  Pill,
  Share2,
} from "lucide-react";

import {
  cerrarSesion,
  misPacientes,
  miEquipo,
  animoDePaciente,
  suenoDePaciente,
  alertasDePaciente,
  tareasDePaciente,
  crearTarea,
  notasDePaciente,
  crearNota,
  citasDePaciente,
  fichaDePaciente,
  guardarFichaDePaciente,
  medicamentosDePaciente,
  listarReferidos,
  crearReferido,
  listarColaboradores,
  autorizarColaborador,
  listarAsistentes,
  autorizarAsistente,
  permitirSellar,
  informeColaboradores,
  setPrecioConsulta,
  colaboradoresParaPago,
  registrarPago,
} from "./api";
import { VistaExpediente } from "./Expediente.jsx";
import { Teleconsulta } from "./Teleconsulta.jsx";
import { Recetario } from "./Recetas.jsx";
import { Conexiones } from "./Conexiones.jsx";
import { SistemaFamiliar } from "./SistemaFamiliar.jsx";
import { AnalisisIA } from "./Analisis.jsx";
import { CamposFicha, camposConValor } from "./CamposFicha.jsx";
import PieLegal from "./PieLegal.jsx";
import { FileDown } from "lucide-react";

const CARAS = ["", "😣", "😕", "😐", "🙂", "😄"];
const CALIDAD = { inquieto: "Inquieto", regular: "Regular", reparador: "Reparador" };
const RANGOS = ["Muy poco", "Poco", "Suficiente", "Bastante"];
const CATEGORIAS = ["Evolucion", "Medicacion", "Observacion", "Ajuste de plan"];

const fechaLegible = (iso) => {
  if (!iso) return "";
  const d = new Date(String(iso).slice(0, 10) + "T00:00:00");
  return d.toLocaleDateString("es-DO", { weekday: "short", day: "numeric", month: "short" });
};

const CALIDAD_VAL = { inquieto: 1, regular: 2, reparador: 3 };
const ROL_LABEL = { terapeuta: "Terapeuta", psiquiatra: "Psiquiatra", admin: "Administración" };

// Mini-gráfica de barras (cualitativa, sin cifras corporales).
function MiniGrafica({ datos, max, color = "var(--salvia)" }) {
  if (!datos || datos.length === 0) return <p className="vacio" style={{ padding: 8 }}>Sin datos aún.</p>;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 64 }}>
      {datos.map((d, i) => (
        <div
          key={i}
          title={d.etiqueta}
          style={{
            flex: 1,
            maxWidth: 20,
            height: `${Math.max(8, (d.valor / max) * 56)}px`,
            background: color,
            borderRadius: 5,
            opacity: 0.5 + 0.5 * (d.valor / max),
          }}
        />
      ))}
    </div>
  );
}

export default function PanelProfesional({ perfil, alSalir }) {
  const [pacienteSel, setPacienteSel] = useState(null);
  const [expedienteDe, setExpedienteDe] = useState(null);

  async function salir() {
    await cerrarSesion();
    await alSalir();
  }

  return (
    <div className="app">
      <div className="banner-demo" style={{ background: "var(--salvia-osc)", color: "#fff" }}>
        Panel del profesional
      </div>

      <div className="contenido" style={{ paddingBottom: 24 }}>
        {expedienteDe ? (
          <VistaExpediente paciente={expedienteDe} profesional={perfil} onVolver={() => setExpedienteDe(null)} />
        ) : !pacienteSel ? (
          <ListaPacientes perfil={perfil} salir={salir} onAbrir={setPacienteSel} />
        ) : (
          <DetallePaciente
            paciente={pacienteSel}
            onVolver={() => setPacienteSel(null)}
            onExpediente={() => setExpedienteDe(pacienteSel)}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function ListaPacientes({ perfil, salir, onAbrir }) {
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    misPacientes()
      .then(setPacientes)
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  return (
    <>
      <header className="encabezado">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p className="saludo">
              {ROL_LABEL[perfil.rol] || "Profesional"} · {perfil.tipo === "colaborador" ? "Colaborador" : "Master"}
            </p>
            <h1>{perfil.nombre}</h1>
          </div>
          <button style={{ padding: 8 }} onClick={salir} title="Cerrar sesión">
            <LogOut size={20} color="var(--tinta-suave)" />
          </button>
        </div>
      </header>

      {perfil.tipo === "master" && <GestionColaboradores />}
      {perfil.tipo === "master" && <GestionAsistentes />}
      {perfil.tipo === "master" && <Contabilidad />}

      <div className="seccion-titulo">
        <Users size={15} /> Tus pacientes
      </div>
      <div className="tarjeta">
        {cargando ? (
          <p className="vacio">Cargando…</p>
        ) : pacientes.length === 0 ? (
          <p className="vacio">
            {perfil.tipo === "colaborador"
              ? "Pendiente de autorización del médico master."
              : "Aún no tienes pacientes vinculados."}
          </p>
        ) : (
          pacientes.map((p) => {
            const iniciales = (p.nombre || "?")
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("");
            return (
              <button
                key={p.id}
                className="item"
                style={{ width: "100%", textAlign: "left" }}
                onClick={() => onAbrir(p)}
              >
                {p.foto_url ? (
                  <img src={p.foto_url} alt="" style={{ width: 44, height: 44, borderRadius: 14, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div className="avatar" style={{ width: 44, height: 44 }}>
                    {iniciales}
                  </div>
                )}
                <div className="cuerpo">
                  <div className="titulo">{p.nombre}</div>
                  <div className="meta">{p.email}</div>
                </div>
                <Users size={18} color="var(--tinta-suave)" />
              </button>
            );
          })
        )}
      </div>

      <RegistroReferidos />

      <Teleconsulta />

      <PieLegal />
    </>
  );
}

// ---------------------------------------------------------------------------
//  Gestión de colaboradores — solo el médico master autoriza el acceso.
function GestionColaboradores() {
  const [cols, setCols] = useState([]);

  async function cargar() {
    setCols(await listarColaboradores());
  }
  useEffect(() => {
    cargar().catch(console.error);
  }, []);

  async function alternar(c) {
    await autorizarColaborador(c.id, !c.autorizado);
    await cargar();
  }

  return (
    <>
      <div className="seccion-titulo">
        <Users size={15} /> Médicos colaboradores
      </div>
      <div className="tarjeta">
        <p className="sub" style={{ marginTop: 0 }}>Autoriza qué colaboradores pueden acceder a tus pacientes.</p>
        {cols.length === 0 ? (
          <p className="vacio" style={{ padding: 8 }}>Sin colaboradores.</p>
        ) : (
          cols.map((c) => (
            <div className="item" key={c.id}>
              <div className="cuerpo">
                <div className="titulo">{c.nombre}</div>
                <div className="meta">{c.autorizado ? "✓ Acceso autorizado" : "Sin autorización"}</div>
              </div>
              <button
                className={c.autorizado ? "btn secundario" : "btn"}
                style={{ width: "auto", padding: "8px 14px" }}
                onClick={() => alternar(c)}
              >
                {c.autorizado ? "Quitar" : "Autorizar"}
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
//  Contabilidad — informe de colaboradores (referidos, precio/consulta, total).
//  Lo puede llenar la secretaria al cobrar o el propio terapeuta.
function Contabilidad() {
  const [filas, setFilas] = useState([]);
  const [cols, setCols] = useState([]);
  const [form, setForm] = useState(false);
  const [profId, setProfId] = useState("");
  const [paciente, setPaciente] = useState("");
  const [monto, setMonto] = useState("");

  async function cargar() {
    setFilas(await informeColaboradores());
    const c = await colaboradoresParaPago();
    setCols(c);
    if (c[0] && !profId) {
      setProfId(c[0].id);
      setMonto(String(c[0].precio || ""));
    }
  }
  useEffect(() => {
    cargar().catch(console.error);
  }, []);

  async function guardarPrecio(id, valor) {
    await setPrecioConsulta(id, valor);
    await cargar();
  }
  async function pagar(e) {
    e.preventDefault();
    if (!profId) return;
    await registrarPago({ profesional_id: profId, paciente_nombre: paciente.trim(), monto });
    setPaciente("");
    setForm(false);
    await cargar();
  }

  const totalGeneral = filas.reduce((a, b) => a + (b.total || 0), 0);

  return (
    <>
      <div className="seccion-titulo">
        <FileText size={15} /> Contabilidad · colaboradores
      </div>
      <div className="tarjeta">
        {filas.length === 0 ? (
          <p className="vacio" style={{ padding: 8 }}>Sin colaboradores.</p>
        ) : (
          filas.map((f) => (
            <div key={f.id} className="item" style={{ display: "block" }}>
              <div className="titulo">{f.nombre}</div>
              <div className="meta">
                {f.referidos} referido(s) · {f.consultas} consulta(s) · Total: US${f.total}
              </div>
              <div className="campo" style={{ marginTop: 6, marginBottom: 0 }}>
                <label>Precio por consulta (US$)</label>
                <input
                  type="number"
                  defaultValue={f.precio_consulta}
                  onBlur={(e) => guardarPrecio(f.id, e.target.value)}
                  style={{ maxWidth: 140 }}
                />
              </div>
            </div>
          ))
        )}
        {filas.length > 0 && (
          <p style={{ fontWeight: 700, color: "var(--salvia-osc)", marginTop: 10 }}>
            Total general: US${totalGeneral}
          </p>
        )}

        {!form ? (
          <button className="btn fantasma" style={{ marginTop: 8 }} onClick={() => setForm(true)}>
            <Plus size={16} /> Registrar pago / consulta
          </button>
        ) : (
          <form onSubmit={pagar} style={{ marginTop: 8 }}>
            <div className="campo">
              <label>Colaborador</label>
              <select
                value={profId}
                onChange={(e) => {
                  setProfId(e.target.value);
                  const c = cols.find((x) => x.id === e.target.value);
                  setMonto(String(c?.precio || ""));
                }}
              >
                {cols.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label>Paciente</label>
              <input value={paciente} onChange={(e) => setPaciente(e.target.value)} placeholder="Nombre del paciente" />
            </div>
            <div className="campo">
              <label>Monto (US$)</label>
              <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" type="submit">Registrar</button>
              <button className="btn secundario" type="button" onClick={() => setForm(false)}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
//  Gestión de asistentes/secretaria — el médico autoriza acceso (solo contacto
//  y citas) y, opcionalmente, permiso para "sellar" indicaciones.
function GestionAsistentes() {
  const [lista, setLista] = useState([]);

  async function cargar() {
    setLista(await listarAsistentes());
  }
  useEffect(() => {
    cargar().catch(console.error);
  }, []);

  async function toggleAcceso(a) {
    await autorizarAsistente(a.id, !a.autorizado);
    await cargar();
  }
  async function toggleSellar(a) {
    await permitirSellar(a.id, !a.sellar);
    await cargar();
  }

  return (
    <>
      <div className="seccion-titulo">
        <Users size={15} /> Asistente / secretaria
      </div>
      <div className="tarjeta">
        <p className="sub" style={{ marginTop: 0 }}>
          El asistente solo ve datos de contacto y citas (no la información clínica).
        </p>
        {lista.length === 0 ? (
          <p className="vacio" style={{ padding: 8 }}>Sin asistentes.</p>
        ) : (
          lista.map((a) => (
            <div key={a.id} style={{ borderBottom: "1px solid var(--crema-osc)", paddingBottom: 10, marginBottom: 10 }}>
              <div className="item" style={{ borderBottom: "none", padding: "6px 0" }}>
                <div className="cuerpo">
                  <div className="titulo">{a.nombre}</div>
                  <div className="meta">{a.autorizado ? "✓ Acceso autorizado" : "Sin autorización"}</div>
                </div>
                <button
                  className={a.autorizado ? "btn secundario" : "btn"}
                  style={{ width: "auto", padding: "8px 14px" }}
                  onClick={() => toggleAcceso(a)}
                >
                  {a.autorizado ? "Quitar" : "Autorizar"}
                </button>
              </div>
              {a.autorizado && (
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
                  <input
                    type="checkbox"
                    checked={a.sellar}
                    onChange={() => toggleSellar(a)}
                    style={{ width: 18, height: 18, accentColor: "var(--salvia)" }}
                  />
                  Permitir sellar indicaciones
                </label>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
function RegistroReferidos() {
  const [refs, setRefs] = useState([]);
  const [equipo, setEquipo] = useState([]);
  const [form, setForm] = useState(false);
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [hacia, setHacia] = useState("");
  const [nota, setNota] = useState("");

  async function cargar() {
    setRefs(await listarReferidos());
  }
  useEffect(() => {
    cargar().catch(console.error);
    miEquipo()
      .then((e) => {
        setEquipo(e);
        if (e[0]) setHacia(e[0].id);
      })
      .catch(console.error);
  }, []);

  async function enviar(e) {
    e.preventDefault();
    if (!pacienteNombre.trim()) return;
    await crearReferido({ paciente_nombre: pacienteNombre.trim(), hacia_id: hacia, nota: nota.trim() });
    setPacienteNombre("");
    setNota("");
    setForm(false);
    await cargar();
  }

  return (
    <>
      <div className="seccion-titulo">
        <Share2 size={15} /> Registro de referidos
      </div>
      <div className="tarjeta">
        {refs.length === 0 ? (
          <p className="vacio" style={{ padding: 8 }}>Sin referidos registrados.</p>
        ) : (
          refs.map((r) => (
            <div className="item" key={r.id} style={{ display: "block" }}>
              <div className="titulo" style={{ fontWeight: 600 }}>{r.paciente_nombre}</div>
              <div className="meta">
                Referido por <strong>{r.referido_por_nombre || "—"}</strong> → {r.hacia_nombre || "—"} · {fechaLegible(r.fecha)}
              </div>
              {r.nota && <div className="meta" style={{ marginTop: 2 }}>“{r.nota}”</div>}
            </div>
          ))
        )}

        {!form ? (
          <button className="btn fantasma" style={{ marginTop: 12 }} onClick={() => setForm(true)}>
            <Plus size={16} /> Registrar referido
          </button>
        ) : (
          <form onSubmit={enviar} style={{ marginTop: 12 }}>
            <div className="campo">
              <label>Paciente</label>
              <input value={pacienteNombre} onChange={(e) => setPacienteNombre(e.target.value)} placeholder="Nombre del paciente" required />
            </div>
            <div className="campo">
              <label>Referir a</label>
              <select value={hacia} onChange={(e) => setHacia(e.target.value)}>
                {equipo.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo ? p.titulo + " " : ""}
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label>Nota (opcional)</label>
              <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Motivo de la derivación" />
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

// ---------------------------------------------------------------------------
function DetallePaciente({ paciente, onVolver, onExpediente }) {
  const [animo, setAnimo] = useState([]);
  const [sueno, setSueno] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [notas, setNotas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [ficha, setFicha] = useState({});
  const [meds, setMeds] = useState([]);

  const cargar = useCallback(async () => {
    const [a, s, al, t, n, c, f, m] = await Promise.all([
      animoDePaciente(paciente.id),
      suenoDePaciente(paciente.id),
      alertasDePaciente(paciente.id),
      tareasDePaciente(paciente.id),
      notasDePaciente(paciente.id),
      citasDePaciente(paciente.id),
      fichaDePaciente(paciente.id),
      medicamentosDePaciente(paciente.id),
    ]);
    setAnimo(a);
    setSueno(s);
    setAlertas(al);
    setTareas(t);
    setNotas(n);
    setCitas(c);
    setFicha(f || {});
    setMeds(m);
  }, [paciente.id]);

  useEffect(() => {
    cargar().catch(console.error);
  }, [cargar]);

  const animoReciente = [...animo].reverse().slice(0, 7);
  const suenoReciente = [...sueno].reverse().slice(0, 7);
  const citasProximas = citas.filter((c) => c.estado !== "cancelada");

  const animoChart = animo.slice(-14).map((r) => ({ valor: r.animo, etiqueta: `${fechaLegible(r.fecha)}: ${r.animo}/5` }));
  const suenoChart = sueno.slice(-14).map((r) => ({
    valor: CALIDAD_VAL[r.calidad] || 1,
    etiqueta: `${fechaLegible(r.fecha)}: ${r.calidad}`,
  }));

  return (
    <>
      <header className="encabezado">
        <button
          onClick={onVolver}
          style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--salvia-osc)", fontWeight: 600, marginBottom: 6 }}
        >
          <ChevronLeft size={18} /> Pacientes
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {paciente.foto_url ? (
            <img src={paciente.foto_url} alt="" style={{ width: 54, height: 54, borderRadius: 16, objectFit: "cover" }} />
          ) : (
            <div className="avatar" style={{ width: 54, height: 54 }}>
              {(paciente.nombre || "?").split(" ").map((s) => s[0]).slice(0, 2).join("")}
            </div>
          )}
          <div>
            <h1 style={{ margin: 0 }}>{paciente.nombre}</h1>
            {paciente.referido_por_nombre && (
              <p className="saludo" style={{ margin: "2px 0 0" }}>Referido por {paciente.referido_por_nombre}</p>
            )}
          </div>
        </div>
      </header>

      <button className="btn" style={{ marginBottom: 14 }} onClick={onExpediente}>
        <FileDown size={18} /> Exportar expediente completo (PDF)
      </button>

      <FichaClinica ficha={ficha} pacienteId={paciente.id} onGuardar={cargar} />

      <SistemaFamiliar paciente={paciente} ficha={ficha} onGuardar={cargar} />

      <EvaluacionRiesgo ficha={ficha} pacienteId={paciente.id} onGuardar={cargar} />

      <AnalisisIA animo={animo} sueno={sueno} tareas={tareas} />

      {alertas.length > 0 && (
        <div className="aviso">
          <div className="titulo">
            <Wind size={18} /> Alertas de sueño
          </div>
          {alertas.slice(0, 3).map((al) => (
            <p key={al.id} style={{ marginTop: 8 }}>
              <strong>{fechaLegible(al.fecha)}:</strong> {al.motivo}
              {al.respuesta ? ` — ${al.respuesta}` : ""}
            </p>
          ))}
        </div>
      )}

      {/* Tendencias */}
      <div className="seccion-titulo">Tendencias (últimas 2 semanas)</div>
      <div className="tarjeta">
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "var(--tinta-suave)", fontWeight: 600, marginBottom: 6 }}>
          <HeartPulse size={14} /> Ánimo
        </div>
        <MiniGrafica datos={animoChart} max={5} color="var(--salvia)" />
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "var(--tinta-suave)", fontWeight: 600, margin: "14px 0 6px" }}>
          <Moon size={14} /> Calidad del descanso
        </div>
        <MiniGrafica datos={suenoChart} max={3} color="var(--salvia-clara)" />
      </div>

      {/* Ánimo reciente */}
      <div className="seccion-titulo">
        <HeartPulse size={15} /> Ánimo reciente
      </div>
      <div className="tarjeta">
        {animoReciente.length === 0 ? (
          <p className="vacio">Sin registros de ánimo.</p>
        ) : (
          animoReciente.map((r) => (
            <div className="item" key={r.id || r.fecha}>
              <div className="icono-redondo" style={{ fontSize: "1.3rem" }}>
                {CARAS[r.animo]}
              </div>
              <div className="cuerpo">
                <div className="titulo">{fechaLegible(r.fecha)}</div>
                <div className="meta">{(r.emociones || []).join(" · ") || "—"}</div>
                {r.nota && <div className="meta" style={{ marginTop: 2 }}>“{r.nota}”</div>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sueño reciente */}
      <div className="seccion-titulo">
        <Moon size={15} /> Descanso reciente
      </div>
      <div className="tarjeta">
        {suenoReciente.length === 0 ? (
          <p className="vacio">Sin registros de sueño.</p>
        ) : (
          suenoReciente.map((r) => (
            <div className="item" key={r.id || r.fecha}>
              <div className="icono-redondo">
                <Moon size={18} />
              </div>
              <div className="cuerpo">
                <div className="titulo">{fechaLegible(r.fecha)}</div>
                <div className="meta">
                  {CALIDAD[r.calidad]} · {RANGOS[r.rango]} descanso
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Medicación (psiquiatría) */}
      <div className="seccion-titulo">
        <Pill size={15} /> Medicación
      </div>
      <div className="tarjeta">
        {meds.length === 0 ? (
          <p className="vacio" style={{ padding: 8 }}>Sin medicamentos registrados.</p>
        ) : (
          meds.map((m) => (
            <div className="item" key={m.id}>
              <div className="icono-redondo">
                <Pill size={18} />
              </div>
              <div className="cuerpo">
                <div className="titulo">{m.nombre}</div>
                <div className="meta">
                  {[m.dosis, m.horario ? `a las ${(m.horario || "").slice(0, 5)}` : null, m.nota]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Conexiones (reloj/apps) — uso clínico, el paciente no las ve */}
      <Conexiones paciente={paciente} />

      {/* Recetario */}
      <Recetario paciente={paciente} />

      {/* Tareas */}
      <BloqueTareas paciente={paciente} tareas={tareas} alCambiar={cargar} />

      {/* Notas */}
      <BloqueNotas paciente={paciente} notas={notas} alCambiar={cargar} />

      {/* Citas */}
      <div className="seccion-titulo">
        <CalendarDays size={15} /> Citas
      </div>
      <div className="tarjeta">
        {citasProximas.length === 0 ? (
          <p className="vacio">Sin citas agendadas.</p>
        ) : (
          citasProximas.map((c) => (
            <div className="item" key={c.id}>
              <div className="icono-redondo">
                {c.modalidad === "Videollamada" ? <Video size={18} /> : <MapPin size={18} />}
              </div>
              <div className="cuerpo">
                <div className="titulo">
                  {fechaLegible(c.fecha)} · {(c.hora || "").slice(0, 5)}
                </div>
                <div className="meta">
                  {c.modalidad} · {c.tipo}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
//  Evaluación de riesgo — uso clínico (solo profesional; el paciente no la ve).
function EvaluacionRiesgo({ ficha, pacienteId, onGuardar }) {
  const [nivel, setNivel] = useState(ficha.riesgo || "");
  const [nota, setNota] = useState(ficha.riesgo_nota || "");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setNivel(ficha.riesgo || "");
    setNota(ficha.riesgo_nota || "");
  }, [ficha]);

  async function guardar() {
    setGuardando(true);
    try {
      await guardarFichaDePaciente(pacienteId, { riesgo: nivel, riesgo_nota: nota });
      onGuardar && (await onGuardar());
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div className="seccion-titulo">
        <FileText size={15} /> Evaluación de riesgo (uso clínico)
      </div>
      <div className="tarjeta">
        <div className="chips">
          {["Bajo", "Moderado", "Alto"].map((n) => (
            <button type="button" key={n} className={"chip" + (nivel === n ? " activa" : "")} onClick={() => setNivel(n)}>
              {n}
            </button>
          ))}
        </div>
        <div className="campo" style={{ marginTop: 10 }}>
          <label>Nota de riesgo (no visible al paciente)</label>
          <textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Observaciones de riesgo, plan de manejo…" />
        </div>
        <button className="btn" onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar evaluación"}
        </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
function FichaClinica({ ficha, pacienteId, onGuardar }) {
  const [editar, setEditar] = useState(false);
  const [datos, setDatos] = useState(ficha);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => setDatos(ficha), [ficha]);

  const lista = camposConValor(ficha);
  const setF = (k, v) => setDatos((p) => ({ ...p, [k]: v }));

  async function guardar() {
    setGuardando(true);
    try {
      await guardarFichaDePaciente(pacienteId, datos);
      setEditar(false);
      onGuardar && (await onGuardar());
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div className="seccion-titulo">
        <FileText size={15} /> Ficha clínica (anamnesis)
      </div>
      <div className="tarjeta">
        {editar ? (
          <>
            <CamposFicha ficha={datos} setF={setF} />
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn" onClick={guardar} disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar ficha"}
              </button>
              <button className="btn secundario" onClick={() => { setDatos(ficha); setEditar(false); }}>
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            {lista.length === 0 ? (
              <p className="vacio" style={{ padding: 8 }}>El paciente aún no ha completado su ficha.</p>
            ) : (
              lista.map(({ label, valor }) => (
                <div className="item" key={label} style={{ display: "block" }}>
                  <div className="meta">{label}</div>
                  <div className="titulo" style={{ fontWeight: 500, whiteSpace: "pre-wrap" }}>{valor}</div>
                </div>
              ))
            )}
            <button className="btn fantasma" style={{ marginTop: 12 }} onClick={() => setEditar(true)}>
              Completar / editar ficha
            </button>
          </>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
function BloqueTareas({ paciente, tareas, alCambiar }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function agregar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      await crearTarea({ paciente_id: paciente.id, texto: texto.trim() });
      setTexto("");
      await alCambiar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="seccion-titulo">
        <CheckSquare size={15} /> Tareas asignadas
      </div>
      <div className="tarjeta">
        {tareas.length === 0 ? (
          <p className="vacio" style={{ padding: 12 }}>Sin tareas asignadas.</p>
        ) : (
          tareas.map((t) => (
            <div className="item" key={t.id}>
              <div className={"check" + (t.completada ? " on" : "")}>
                {t.completada && <CheckSquare size={16} />}
              </div>
              <div className="cuerpo">
                <div className={"tarea-texto" + (t.completada ? " hecha" : "")}>{t.texto}</div>
                <div className="meta">{t.completada ? "Completada" : "Pendiente"}</div>
              </div>
            </div>
          ))
        )}
        <form onSubmit={agregar} style={{ marginTop: 12 }}>
          <div className="campo" style={{ marginBottom: 8 }}>
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Nueva tarea (sin dietas ni metas numéricas)…"
            />
          </div>
          <button className="btn" type="submit" disabled={enviando}>
            <Plus size={18} /> Asignar tarea
          </button>
        </form>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
function BloqueNotas({ paciente, notas, alCambiar }) {
  const [abrir, setAbrir] = useState(false);
  const [categoria, setCategoria] = useState("Evolucion");
  const [texto, setTexto] = useState("");
  const [visible, setVisible] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function agregar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      await crearNota({
        paciente_id: paciente.id,
        categoria,
        texto: texto.trim(),
        visible_paciente: visible,
      });
      setTexto("");
      setVisible(false);
      setAbrir(false);
      await alCambiar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="seccion-titulo">
        <ClipboardList size={15} /> Notas de coordinación
      </div>
      <div className="tarjeta">
        {notas.length === 0 ? (
          <p className="vacio" style={{ padding: 12 }}>Sin notas todavía.</p>
        ) : (
          notas.map((n) => (
            <div className="item" key={n.id}>
              <div className="cuerpo">
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span className="etiqueta">{n.categoria}</span>
                  <span
                    className="meta"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    {n.visible_paciente ? <Eye size={13} /> : <EyeOff size={13} />}
                    {n.visible_paciente ? "Visible al paciente" : "Solo equipo"}
                  </span>
                </div>
                <div className="titulo" style={{ fontWeight: 500 }}>{n.texto}</div>
                <div className="meta">{fechaLegible(n.creado_en)}</div>
              </div>
            </div>
          ))
        )}

        {!abrir ? (
          <button className="btn fantasma" style={{ marginTop: 12 }} onClick={() => setAbrir(true)}>
            <Plus size={18} /> Nueva nota
          </button>
        ) : (
          <form onSubmit={agregar} style={{ marginTop: 12 }}>
            <div className="campo">
              <label>Categoría</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                {CATEGORIAS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label>Nota</label>
              <textarea value={texto} onChange={(e) => setTexto(e.target.value)} required />
            </div>
            <label
              style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: "0.9rem" }}
            >
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "var(--salvia)" }}
              />
              Visible para el paciente
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" type="submit" disabled={enviando}>
                Guardar nota
              </button>
              <button className="btn secundario" type="button" onClick={() => setAbrir(false)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
