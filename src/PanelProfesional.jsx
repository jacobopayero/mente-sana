// ============================================================================
//  MENTE SERENA — Panel del profesional (Fase 2)
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
} from "lucide-react";

import {
  cerrarSesion,
  misPacientes,
  animoDePaciente,
  suenoDePaciente,
  alertasDePaciente,
  tareasDePaciente,
  crearTarea,
  notasDePaciente,
  crearNota,
  citasDePaciente,
  fichaDePaciente,
} from "./api";

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
        {!pacienteSel ? (
          <ListaPacientes perfil={perfil} salir={salir} onAbrir={setPacienteSel} />
        ) : (
          <DetallePaciente paciente={pacienteSel} onVolver={() => setPacienteSel(null)} />
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
              {perfil.titulo ? perfil.titulo + " " : ""}
              {perfil.nombre}
            </p>
            <h1>Tus pacientes</h1>
          </div>
          <button style={{ padding: 8 }} onClick={salir} title="Cerrar sesión">
            <LogOut size={20} color="var(--tinta-suave)" />
          </button>
        </div>
      </header>

      <div className="tarjeta">
        {cargando ? (
          <p className="vacio">Cargando…</p>
        ) : pacientes.length === 0 ? (
          <p className="vacio">Aún no tienes pacientes vinculados.</p>
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
    </>
  );
}

// ---------------------------------------------------------------------------
function DetallePaciente({ paciente, onVolver }) {
  const [animo, setAnimo] = useState([]);
  const [sueno, setSueno] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [notas, setNotas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [ficha, setFicha] = useState({});

  const cargar = useCallback(async () => {
    const [a, s, al, t, n, c, f] = await Promise.all([
      animoDePaciente(paciente.id),
      suenoDePaciente(paciente.id),
      alertasDePaciente(paciente.id),
      tareasDePaciente(paciente.id),
      notasDePaciente(paciente.id),
      citasDePaciente(paciente.id),
      fichaDePaciente(paciente.id),
    ]);
    setAnimo(a);
    setSueno(s);
    setAlertas(al);
    setTareas(t);
    setNotas(n);
    setCitas(c);
    setFicha(f || {});
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
          <h1 style={{ margin: 0 }}>{paciente.nombre}</h1>
        </div>
      </header>

      <FichaClinica ficha={ficha} />

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
function FichaClinica({ ficha }) {
  const campos = [
    ["Fecha de nacimiento", ficha.fecha_nacimiento && fechaLegible(ficha.fecha_nacimiento)],
    ["Género", ficha.genero],
    ["Contacto de emergencia", [ficha.contacto_emergencia, ficha.contacto_emergencia_tel].filter(Boolean).join(" · ")],
    ["Alergias", ficha.alergias],
    ["Condiciones relevantes", ficha.condiciones],
    ["Tratamientos previos", ficha.tratamientos_previos],
    ["Notas del paciente", ficha.notas],
  ].filter(([, v]) => v);

  return (
    <>
      <div className="seccion-titulo">
        <FileText size={15} /> Ficha clínica
      </div>
      <div className="tarjeta">
        {campos.length === 0 ? (
          <p className="vacio" style={{ padding: 8 }}>El paciente aún no ha completado su ficha.</p>
        ) : (
          campos.map(([etiqueta, valor]) => (
            <div className="item" key={etiqueta} style={{ display: "block" }}>
              <div className="meta">{etiqueta}</div>
              <div className="titulo" style={{ fontWeight: 500, whiteSpace: "pre-wrap" }}>{valor}</div>
            </div>
          ))
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
