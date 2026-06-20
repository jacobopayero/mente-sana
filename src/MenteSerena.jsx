// ============================================================================
//  AURA — Interfaz (Fase 1)
//  App de acompañamiento para pacientes en terapia. Dirección clínica en TCA.
//
//  SALVAGUARDAS DE DISEÑO (no negociables):
//   - No se registran ni muestran calorías, peso, IMC ni métricas corporales.
//   - No se comenta la apariencia ni se generan planes de alimentación.
//   - El sueño usa solo calidad cualitativa y un rango de descanso percibido.
// ============================================================================
import { useEffect, useState, useCallback } from "react";
import {
  Home,
  HeartPulse,
  Moon,
  CalendarDays,
  LifeBuoy,
  CheckSquare,
  Sparkles,
  Video,
  MapPin,
  Trash2,
  Plus,
  LogOut,
  PlayCircle,
  Music,
  BookOpen,
  Link as LinkIcon,
  Phone,
  MessageCircleHeart,
  Wind,
} from "lucide-react";

import PanelProfesional from "./PanelProfesional.jsx";
import PanelAdmin from "./PanelAdmin.jsx";
import PinLock from "./PinLock.jsx";
import {
  VistaMedicacion,
  VistaPlanSeguridad,
  VistaAjustes,
  SOSBoton,
  BotonCalendario,
} from "./Bienestar.jsx";
import { VistaHerramientas } from "./Herramientas.jsx";
import { VistaDiario } from "./Diario.jsx";
import Bienvenida, { onboardingAceptado } from "./Bienvenida.jsx";
import { VistaPerfil } from "./Perfil.jsx";
import PieLegal from "./PieLegal.jsx";
import { VistaSuscripcion } from "./Suscripcion.jsx";
import { VistaRecetas } from "./Recetas.jsx";
import { Crown, FileText } from "lucide-react";
import { Pill, ShieldCheck, Settings, BookHeart, Bell, User } from "lucide-react";
import { pinActivo } from "./lib/pin";
import { recordarCita, recordarTarea, recordarRegistroAnimo } from "./lib/calendario";
import {
  estaConfigurado,
  registrarse,
  iniciarSesion,
  entrarDemoComo,
  cerrarSesion,
  miPerfil,
  miEquipo,
  listarAnimo,
  guardarAnimo,
  listarSueno,
  guardarSueno,
  evaluarAlertaSueno,
  registrarAlertaSueno,
  listarCitas,
  crearCita,
  cancelarCita,
  listarTareas,
  marcarTarea,
  listarNotas,
  listarRecursos,
} from "./api";

// --- Constantes de presentación --------------------------------------------
const CARAS = [
  { v: 1, emoji: "😣", texto: "Muy bajo" },
  { v: 2, emoji: "😕", texto: "Bajo" },
  { v: 3, emoji: "😐", texto: "Neutral" },
  { v: 4, emoji: "🙂", texto: "Bien" },
  { v: 5, emoji: "😄", texto: "Muy bien" },
];

const EMOCIONES = [
  "calma",
  "ansiedad",
  "esperanza",
  "tristeza",
  "enojo",
  "miedo",
  "gratitud",
  "cansancio",
];

const CALIDADES = [
  { v: "inquieto", texto: "Inquieto" },
  { v: "regular", texto: "Regular" },
  { v: "reparador", texto: "Reparador" },
];

const RANGOS = ["Muy poco", "Poco", "Suficiente", "Bastante"];

const ICONO_RECURSO = {
  video: PlayCircle,
  cancion: Music,
  instructivo: BookOpen,
  motivacion: Sparkles,
  enlace: LinkIcon,
};

const ROL_LABEL = { terapeuta: "Terapeuta", psiquiatra: "Psiquiatra", admin: "Administración" };

// Línea de apoyo — PENDIENTE de verificar con la dirección clínica antes de
// abrir a pacientes reales (ver README, "Antes de abrir a pacientes reales").
const LINEA_APOYO = {
  nombre: "Línea de apoyo en salud mental",
  telefono: "*462", // marcador de posición — verificar para RD
  nota: "Número de ejemplo. Debe sustituirse por la línea verificada de apoyo en TCA.",
};

const FRASES = [
  "Sanar no es lineal. Cada intento cuenta.",
  "No tienes que poder con todo hoy.",
  "Tu valor no depende de un día difícil.",
  "Pedir ayuda también es ser valiente.",
  "Estás haciendo más de lo que crees.",
  "Un paso pequeño sigue siendo avanzar.",
  "Mereces la misma amabilidad que das.",
  "Hoy basta con cuidarte un poco.",
];
const fraseDelDia = () => {
  const inicioAno = new Date(new Date().getFullYear(), 0, 0);
  const dia = Math.floor((Date.now() - inicioAno) / 86400000);
  return FRASES[dia % FRASES.length];
};

const hoy = () => new Date().toISOString().slice(0, 10);
const fechaLegible = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-DO", { weekday: "short", day: "numeric", month: "short" });
};

// ============================================================================
//  Componente raíz
// ============================================================================
export default function MenteSerena() {
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [bloqueado, setBloqueado] = useState(pinActivo());
  const [onboarding, setOnboarding] = useState(!onboardingAceptado());

  const refrescarPerfil = useCallback(async () => {
    try {
      const p = await miPerfil();
      setPerfil(p);
    } catch (e) {
      console.error(e);
      setPerfil(null);
    } finally {
      setCargandoSesion(false);
    }
  }, []);

  useEffect(() => {
    refrescarPerfil();
  }, [refrescarPerfil]);

  if (bloqueado) {
    return <PinLock alDesbloquear={() => setBloqueado(false)} />;
  }

  if (onboarding) {
    return <Bienvenida alAceptar={() => setOnboarding(false)} />;
  }

  if (cargandoSesion) {
    return <div className="cargando">Cargando…</div>;
  }

  if (!perfil) {
    return <PantallaAcceso alIngresar={refrescarPerfil} />;
  }

  if (perfil.rol === "admin") {
    return <PanelAdmin perfil={perfil} alSalir={refrescarPerfil} />;
  }
  if (["terapeuta", "psiquiatra"].includes(perfil.rol)) {
    return <PanelProfesional perfil={perfil} alSalir={refrescarPerfil} />;
  }

  return <AppPaciente perfil={perfil} alSalir={refrescarPerfil} />;
}

// ============================================================================
//  Acceso (registro / inicio de sesión)
// ============================================================================
function PantallaAcceso({ alIngresar }) {
  const [modo, setModo] = useState("entrar"); // entrar | crear
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      if (modo === "crear") {
        await registrarse({ email, password, nombre });
      }
      await iniciarSesion({ email, password });
      await alIngresar();
    } catch (err) {
      setError(err.message || "No pudimos completar la acción. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  async function entrarDemo(rol) {
    setError("");
    setEnviando(true);
    try {
      await entrarDemoComo(rol);
      await alIngresar();
    } catch (err) {
      setError(err.message || "No pudimos entrar en modo demo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="acceso">
      <div className="marca">
        <img src={import.meta.env.BASE_URL + "icono.svg"} alt="" />
        <h1>Aura</h1>
        <p>Acompañamiento sereno para tu proceso.</p>
      </div>

      {!estaConfigurado && (
        <div className="tarjeta" style={{ marginBottom: 16 }}>
          <div className="banner-demo" style={{ borderRadius: 12, marginBottom: 14 }}>
            Modo demo · los datos se guardan solo en este navegador
          </div>
          <button className="btn" style={{ marginBottom: 10 }} onClick={() => entrarDemo("paciente")}>
            Entrar como paciente (demo)
          </button>
          <button className="btn secundario" style={{ marginBottom: 10 }} onClick={() => entrarDemo("terapeuta")}>
            Entrar como médico master (demo)
          </button>
          <button className="btn secundario" style={{ marginBottom: 10 }} onClick={() => entrarDemo("psiquiatra")}>
            Entrar como médico colaborador (demo)
          </button>
          <button className="btn secundario" onClick={() => entrarDemo("admin")}>
            Entrar como central / HQ (demo)
          </button>
        </div>
      )}

      <form onSubmit={enviar} className="tarjeta">
        {modo === "crear" && (
          <div className="campo">
            <label>¿Cómo te gustaría que te llamemos?</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>
        )}
        <div className="campo">
          <label>Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            required={estaConfigurado}
          />
        </div>
        <div className="campo">
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required={estaConfigurado}
          />
        </div>

        {error && <p className="error-texto">{error}</p>}

        <button className="btn" type="submit" disabled={enviando}>
          {enviando ? "Un momento…" : modo === "crear" ? "Crear mi cuenta" : "Entrar"}
        </button>
      </form>

      <p className="cambiar">
        {modo === "entrar" ? "¿Primera vez aquí? " : "¿Ya tienes cuenta? "}
        <button onClick={() => setModo(modo === "entrar" ? "crear" : "entrar")}>
          {modo === "entrar" ? "Crear cuenta" : "Iniciar sesión"}
        </button>
      </p>

      <PieLegal />
    </div>
  );
}

// ============================================================================
//  App del paciente (con navegación)
// ============================================================================
function AppPaciente({ perfil, alSalir }) {
  const [vista, setVista] = useState("inicio");

  const TABS = [
    { id: "inicio", icono: Home, texto: "Inicio" },
    { id: "animo", icono: HeartPulse, texto: "Ánimo" },
    { id: "sueno", icono: Moon, texto: "Sueño" },
    { id: "citas", icono: CalendarDays, texto: "Agenda" },
    { id: "apoyo", icono: LifeBuoy, texto: "Apoyo" },
  ];

  async function salir() {
    await cerrarSesion();
    await alSalir();
  }

  return (
    <div className="app">
      {!estaConfigurado && <div className="banner-demo">Modo demo · datos locales de prueba</div>}

      <div className="contenido">
        {vista === "inicio" && <VistaInicio perfil={perfil} irA={setVista} salir={salir} />}
        {vista === "animo" && <VistaAnimo />}
        {vista === "sueno" && <VistaSueno />}
        {vista === "citas" && <VistaCitas />}
        {vista === "tareas" && <VistaTareas />}
        {vista === "recursos" && <VistaRecursos />}
        {vista === "apoyo" && <VistaApoyo irA={setVista} />}
        {vista === "medicacion" && <VistaMedicacion irA={setVista} />}
        {vista === "plan" && <VistaPlanSeguridad irA={setVista} />}
        {vista === "ajustes" && <VistaAjustes irA={setVista} />}
        {vista === "herramientas" && <VistaHerramientas irA={setVista} />}
        {vista === "diario" && <VistaDiario irA={setVista} />}
        {vista === "perfil" && <VistaPerfil irA={setVista} alActualizar={alSalir} />}
        {vista === "suscripcion" && <VistaSuscripcion irA={setVista} />}
        {vista === "recetas" && <VistaRecetas irA={setVista} />}
      </div>

      {vista !== "apoyo" && <SOSBoton onClick={() => setVista("apoyo")} />}

      <nav className="nav">
        {TABS.map((t) => {
          const Icono = t.icono;
          const activo = vista === t.id;
          return (
            <button
              key={t.id}
              className={activo ? "activo" : ""}
              onClick={() => setVista(t.id)}
            >
              <Icono size={22} strokeWidth={activo ? 2.4 : 1.8} />
              <span>{t.texto}</span>
              <span className="punto" />
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ============================================================================
//  Inicio
// ============================================================================
function VistaInicio({ perfil, irA, salir }) {
  const [equipo, setEquipo] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [notas, setNotas] = useState([]);

  useEffect(() => {
    miEquipo().then(setEquipo).catch(console.error);
    listarTareas().then(setTareas).catch(console.error);
    listarNotas(perfil.id).then(setNotas).catch(() => setNotas([]));
  }, [perfil.id]);

  const pendientes = tareas.filter((t) => !t.completada);
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <>
      <header className="encabezado">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <button onClick={() => irA("perfil")} style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
            {perfil.foto_url ? (
              <img src={perfil.foto_url} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div className="avatar" style={{ width: 48, height: 48 }}>
                {(perfil.nombre || "?").split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </div>
            )}
            <div>
              <p className="saludo">{saludo},</p>
              <h1 style={{ margin: "2px 0 0" }}>{perfil.nombre || "hola"}</h1>
            </div>
          </button>
          <div style={{ display: "flex", gap: 4 }}>
            <button style={{ padding: 8 }} onClick={() => irA("ajustes")} title="Ajustes">
              <Settings size={20} color="var(--tinta-suave)" />
            </button>
            <button style={{ padding: 8 }} onClick={salir} title="Cerrar sesión">
              <LogOut size={20} color="var(--tinta-suave)" />
            </button>
          </div>
        </div>
      </header>

      <div className="tarjeta" style={{ background: "var(--salvia)", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.9, fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <Sparkles size={14} /> Frase del día
        </div>
        <p style={{ margin: "8px 0 0", fontSize: "1.05rem", fontWeight: 500 }}>{fraseDelDia()}</p>
      </div>

      <div className="tarjeta">
        <h2>¿Cómo te encuentras hoy?</h2>
        <p className="sub">Un registro breve, a tu ritmo. Sin juicios.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" onClick={() => irA("animo")}>
            <HeartPulse size={18} /> Registrar ánimo
          </button>
          <button className="btn secundario" onClick={() => irA("sueno")}>
            <Moon size={18} /> Sueño
          </button>
        </div>
      </div>

      <div className="seccion-titulo">
        <ShieldCheck size={15} /> Tu cuidado
      </div>
      <div className="tarjeta">
        <button className="btn fantasma" style={{ marginBottom: 10 }} onClick={() => irA("perfil")}>
          <User size={18} /> Mi perfil y ficha clínica
        </button>
        <button className="btn fantasma" style={{ marginBottom: 10 }} onClick={() => irA("herramientas")}>
          <Wind size={18} /> Caja de herramientas
        </button>
        <button className="btn fantasma" style={{ marginBottom: 10 }} onClick={() => irA("diario")}>
          <BookHeart size={18} /> Mi diario
        </button>
        <button className="btn fantasma" style={{ marginBottom: 10 }} onClick={() => irA("recetas")}>
          <FileText size={18} /> Mis recetas
        </button>
        <button className="btn fantasma" style={{ marginBottom: 10 }} onClick={() => irA("medicacion")}>
          <Pill size={18} /> Medicación y recordatorios
        </button>
        <button className="btn fantasma" style={{ marginBottom: 10 }} onClick={() => irA("plan")}>
          <ShieldCheck size={18} /> Mi plan de seguridad
        </button>
        <button className="btn fantasma" onClick={() => irA("suscripcion")}>
          <Crown size={18} /> Plan anual
        </button>
      </div>

      {notas.length > 0 && (
        <>
          <div className="seccion-titulo">
            <MessageCircleHeart size={15} /> De tu equipo
          </div>
          <div className="tarjeta">
            {notas.slice(0, 2).map((n) => (
              <div className="item" key={n.id}>
                <div className="icono-redondo">
                  <MessageCircleHeart size={18} />
                </div>
                <div className="cuerpo">
                  <div className="titulo">{n.texto}</div>
                  <div className="meta">{fechaLegible((n.creado_en || "").slice(0, 10))}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="seccion-titulo">
        <CheckSquare size={15} /> Tus tareas
      </div>
      <div className="tarjeta">
        {pendientes.length === 0 ? (
          <p className="vacio" style={{ padding: 12 }}>Sin tareas pendientes. 🌿</p>
        ) : (
          <>
            {pendientes.slice(0, 2).map((t) => (
              <div className="item" key={t.id}>
                <div className="check" />
                <div className="cuerpo">
                  <div className="tarea-texto">{t.texto}</div>
                </div>
              </div>
            ))}
            <button className="btn fantasma" style={{ marginTop: 10 }} onClick={() => irA("tareas")}>
              Ver todas ({pendientes.length})
            </button>
          </>
        )}
      </div>

      <div className="seccion-titulo">
        <Sparkles size={15} /> Para ti
      </div>
      <div className="tarjeta">
        <button className="btn fantasma" onClick={() => irA("recursos")}>
          <BookOpen size={18} /> Explorar recursos
        </button>
      </div>

      {equipo.length > 0 && (
        <>
          <div className="seccion-titulo">Tu equipo de cuidado</div>
          <div className="tarjeta">
            {equipo.map((pro) => {
              const prof = pro.perfiles_profesional?.[0] || {};
              const iniciales = (pro.nombre || "?")
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("");
              return (
                <div className="pro" key={pro.id} style={{ marginBottom: 8 }}>
                  <div className="avatar" style={{ background: prof.color_hex || "var(--salvia)" }}>
                    {iniciales}
                  </div>
                  <div>
                    <div className="titulo">{pro.nombre}</div>
                    <div className="meta" style={{ fontSize: "0.82rem", color: "var(--tinta-suave)" }}>
                      {(ROL_LABEL[pro.rol] || "Profesional") + (prof.especialidad ? " · " + prof.especialidad : "")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

// ============================================================================
//  Ánimo
// ============================================================================
function VistaAnimo() {
  const [registros, setRegistros] = useState([]);
  const [animo, setAnimo] = useState(3);
  const [emociones, setEmociones] = useState([]);
  const [nota, setNota] = useState("");
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    listarAnimo().then(setRegistros).catch(console.error);
  }, []);

  function toggleEmocion(e) {
    setEmociones((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
  }

  async function guardar() {
    const entry = await guardarAnimo({ fecha: hoy(), animo, emociones, nota });
    setRegistros((prev) => [...prev.filter((m) => m.fecha !== entry.fecha), entry].sort((a, b) => a.fecha.localeCompare(b.fecha)));
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  const historial = [...registros].reverse();

  return (
    <>
      <header className="encabezado">
        <p className="saludo">Diario de ánimo</p>
        <h1>¿Cómo te sientes?</h1>
      </header>

      <div className="tarjeta">
        <h2>Tu ánimo hoy</h2>
        <p className="sub">Toca la carita que más se acerca.</p>
        <div className="fila-animo">
          {CARAS.map((c) => (
            <button
              key={c.v}
              className={"cara" + (animo === c.v ? " activa" : "")}
              onClick={() => setAnimo(c.v)}
              aria-label={c.texto}
            >
              {c.emoji}
            </button>
          ))}
        </div>
        <p className="sub" style={{ textAlign: "center", marginTop: 4 }}>
          {CARAS.find((c) => c.v === animo)?.texto}
        </p>

        <div className="campo" style={{ marginTop: 12 }}>
          <label>¿Qué emociones notas?</label>
          <div className="chips">
            {EMOCIONES.map((e) => (
              <button
                key={e}
                className={"chip" + (emociones.includes(e) ? " activa" : "")}
                onClick={() => toggleEmocion(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="campo">
          <label>Una nota para ti (opcional)</label>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Lo que quieras recordar de hoy…"
          />
        </div>

        <button className="btn" onClick={guardar}>
          {guardado ? "Guardado 🌿" : "Guardar registro"}
        </button>
      </div>

      <button className="btn fantasma" style={{ marginBottom: 14 }} onClick={() => recordarRegistroAnimo()}>
        <Bell size={16} /> Recordarme cada día
      </button>

      <div className="seccion-titulo">Tus días recientes</div>
      <div className="tarjeta">
        {historial.length === 0 ? (
          <p className="vacio">Aún no hay registros. Tu primer paso empieza hoy.</p>
        ) : (
          historial.slice(0, 10).map((r) => (
            <div className="item" key={r.id || r.fecha}>
              <div className="icono-redondo" style={{ fontSize: "1.3rem" }}>
                {CARAS.find((c) => c.v === r.animo)?.emoji}
              </div>
              <div className="cuerpo">
                <div className="titulo">{fechaLegible(r.fecha)}</div>
                <div className="meta">
                  {(r.emociones || []).join(" · ") || "Sin emociones anotadas"}
                </div>
                {r.nota && <div className="meta" style={{ marginTop: 2 }}>“{r.nota}”</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ============================================================================
//  Sueño  (solo calidad cualitativa y rango de descanso percibido)
// ============================================================================
function VistaSueno() {
  const [registros, setRegistros] = useState([]);
  const [calidad, setCalidad] = useState("regular");
  const [rango, setRango] = useState(2);
  const [nota, setNota] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [alerta, setAlerta] = useState(false);

  const cargar = useCallback(async () => {
    const data = await listarSueno();
    setRegistros(data);
    const { disparar } = await evaluarAlertaSueno();
    setAlerta(disparar);
  }, []);

  useEffect(() => {
    cargar().catch(console.error);
  }, [cargar]);

  async function guardar() {
    await guardarSueno({ fecha: hoy(), calidad, rango, nota });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
    await cargar();
  }

  async function avisarEquipo() {
    await registrarAlertaSueno({
      motivo: "Varias noches de descanso pobre",
      respuesta: "El paciente pidió aviso a su equipo",
    });
    setAlerta(false);
  }

  const historial = [...registros].reverse();

  return (
    <>
      <header className="encabezado">
        <p className="saludo">Descanso</p>
        <h1>¿Cómo dormiste?</h1>
      </header>

      {alerta && (
        <div className="aviso">
          <div className="titulo">
            <Wind size={18} /> Notamos noches difíciles
          </div>
          <p>
            Llevas un par de noches de descanso inquieto. Eso cansa. ¿Quieres que avisemos
            a tu equipo para que te acompañe?
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="btn" onClick={avisarEquipo}>
              Avisar a mi equipo
            </button>
            <button className="btn secundario" onClick={() => setAlerta(false)}>
              Ahora no
            </button>
          </div>
        </div>
      )}

      <div className="tarjeta">
        <h2>Tu descanso de anoche</h2>
        <p className="sub">Sin cifras ni metas: solo cómo lo viviste.</p>

        <div className="campo">
          <label>¿Cómo fue?</label>
          <div className="chips">
            {CALIDADES.map((c) => (
              <button
                key={c.v}
                className={"chip" + (calidad === c.v ? " activa" : "")}
                onClick={() => setCalidad(c.v)}
              >
                {c.texto}
              </button>
            ))}
          </div>
        </div>

        <div className="campo">
          <label>¿Cuánto sientes que descansaste? — {RANGOS[rango]}</label>
          <input
            type="range"
            min="0"
            max="3"
            step="1"
            value={rango}
            onChange={(e) => setRango(Number(e.target.value))}
            style={{ accentColor: "var(--salvia)" }}
          />
        </div>

        <div className="campo">
          <label>Nota (opcional)</label>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Algo que quieras recordar…"
          />
        </div>

        <button className="btn" onClick={guardar}>
          {guardado ? "Guardado 🌿" : "Guardar"}
        </button>
      </div>

      <div className="seccion-titulo">Noches recientes</div>
      <div className="tarjeta">
        {historial.length === 0 ? (
          <p className="vacio">Aún no hay registros de sueño.</p>
        ) : (
          historial.slice(0, 10).map((r) => (
            <div className="item" key={r.id || r.fecha}>
              <div className="icono-redondo">
                <Moon size={18} />
              </div>
              <div className="cuerpo">
                <div className="titulo">{fechaLegible(r.fecha)}</div>
                <div className="meta">
                  {CALIDADES.find((c) => c.v === r.calidad)?.texto} · {RANGOS[r.rango]} descanso
                  {r.origen === "reloj" ? " · del reloj" : ""}
                </div>
                {r.nota && <div className="meta" style={{ marginTop: 2 }}>“{r.nota}”</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ============================================================================
//  Citas
// ============================================================================
function VistaCitas() {
  const [citas, setCitas] = useState([]);
  const [equipo, setEquipo] = useState([]);
  const [form, setForm] = useState(false);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("16:00");
  const [modalidad, setModalidad] = useState("Videollamada");
  const [tipo, setTipo] = useState("Individual");
  const [profesional, setProfesional] = useState("");

  const cargar = useCallback(async () => {
    setCitas(await listarCitas());
  }, []);

  useEffect(() => {
    cargar().catch(console.error);
    miEquipo()
      .then((e) => {
        setEquipo(e);
        if (e[0]) setProfesional(e[0].id);
      })
      .catch(console.error);
  }, [cargar]);

  async function agendar(e) {
    e.preventDefault();
    await crearCita({ profesional_id: profesional, fecha, hora, modalidad, tipo });
    setForm(false);
    setFecha("");
    await cargar();
  }

  async function cancelar(id) {
    await cancelarCita(id);
    await cargar();
  }

  const proximas = citas.filter((c) => c.estado !== "cancelada");

  return (
    <>
      <header className="encabezado">
        <p className="saludo">Agenda</p>
        <h1>Tus citas</h1>
      </header>

      {!form && (
        <button className="btn" style={{ marginBottom: 14 }} onClick={() => setForm(true)}>
          <Plus size={18} /> Solicitar una cita
        </button>
      )}

      {form && (
        <form className="tarjeta" onSubmit={agendar}>
          <h2>Nueva cita</h2>
          {equipo.length > 0 && (
            <div className="campo">
              <label>Con</label>
              <select value={profesional} onChange={(e) => setProfesional(e.target.value)}>
                {equipo.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo ? p.titulo + " " : ""}
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="campo">
            <label>Fecha</label>
            <input type="date" value={fecha} min={hoy()} onChange={(e) => setFecha(e.target.value)} required />
          </div>
          <div className="campo">
            <label>Hora</label>
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
          </div>
          <div className="campo">
            <label>Modalidad</label>
            <select value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
              <option>Videollamada</option>
              <option>Presencial</option>
            </select>
          </div>
          <div className="campo">
            <label>Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option>Individual</option>
              <option>Pareja</option>
              <option>Familiar</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" type="submit">Solicitar</button>
            <button className="btn secundario" type="button" onClick={() => setForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="seccion-titulo">Próximas</div>
      <div className="tarjeta">
        {proximas.length === 0 ? (
          <p className="vacio">No tienes citas agendadas.</p>
        ) : (
          proximas.map((c) => (
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
                <BotonCalendario texto="Recordarme" onClick={() => recordarCita(c)} />
              </div>
              <button onClick={() => cancelar(c.id)} title="Cancelar" style={{ color: "var(--tinta-suave)" }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ============================================================================
//  Tareas
// ============================================================================
function VistaTareas() {
  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    listarTareas().then(setTareas).catch(console.error);
  }, []);

  async function alternar(t) {
    await marcarTarea(t.id, !t.completada);
    setTareas((prev) => prev.map((x) => (x.id === t.id ? { ...x, completada: !t.completada } : x)));
  }

  return (
    <>
      <header className="encabezado">
        <p className="saludo">Acompañamiento</p>
        <h1>Tus tareas</h1>
      </header>

      <div className="tarjeta">
        {tareas.length === 0 ? (
          <p className="vacio">Tu equipo aún no te ha asignado tareas.</p>
        ) : (
          tareas.map((t) => (
            <div className="item" key={t.id}>
              <button
                className={"check" + (t.completada ? " on" : "")}
                onClick={() => alternar(t)}
                title={t.completada ? "Marcar como pendiente" : "Marcar como hecha"}
              >
                {t.completada && <CheckSquare size={16} />}
              </button>
              <div className="cuerpo">
                <div className={"tarea-texto" + (t.completada ? " hecha" : "")}>{t.texto}</div>
                {!t.completada && <BotonCalendario texto="Recordarme" onClick={() => recordarTarea(t)} />}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ============================================================================
//  Recursos
// ============================================================================
function VistaRecursos() {
  const [recursos, setRecursos] = useState([]);
  const [abierto, setAbierto] = useState(null);

  useEffect(() => {
    listarRecursos().then(setRecursos).catch(console.error);
  }, []);

  return (
    <>
      <header className="encabezado">
        <p className="saludo">Para ti</p>
        <h1>Recursos</h1>
      </header>

      {recursos.length === 0 ? (
        <div className="tarjeta">
          <p className="vacio">Aún no hay recursos compartidos.</p>
        </div>
      ) : (
        recursos.map((r) => {
          const Icono = ICONO_RECURSO[r.tipo] || BookOpen;
          const estaAbierto = abierto === r.id;
          return (
            <div className="tarjeta" key={r.id}>
              <div className="item" style={{ padding: 0, borderBottom: "none" }}>
                <div className="icono-redondo">
                  <Icono size={18} />
                </div>
                <div className="cuerpo">
                  <div className="titulo">{r.titulo}</div>
                  {r.descripcion && <div className="meta">{r.descripcion}</div>}
                </div>
                <span className="etiqueta">{r.tipo}</span>
              </div>

              {r.texto && (
                <>
                  {estaAbierto && (
                    <p style={{ marginTop: 12, fontSize: "0.92rem" }}>{r.texto}</p>
                  )}
                  <button
                    className="btn fantasma"
                    style={{ marginTop: 12 }}
                    onClick={() => setAbierto(estaAbierto ? null : r.id)}
                  >
                    {estaAbierto ? "Cerrar" : "Leer"}
                  </button>
                </>
              )}
              {r.url && (
                <a
                  className="btn fantasma"
                  style={{ marginTop: 12, textDecoration: "none" }}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <LinkIcon size={16} /> Abrir enlace
                </a>
              )}
            </div>
          );
        })
      )}
    </>
  );
}

// ============================================================================
//  Apoyo
// ============================================================================
function VistaApoyo({ irA }) {
  return (
    <>
      <header className="encabezado">
        <p className="saludo">Estamos contigo</p>
        <h1>Apoyo</h1>
      </header>

      <div className="aviso">
        <div className="titulo">
          <LifeBuoy size={18} /> Si este es un momento difícil
        </div>
        <p>
          No tienes que pasarlo en soledad. Hablar ayuda. Aquí tienes formas de buscar
          acompañamiento ahora mismo.
        </p>
      </div>

      <a className="btn-apoyo" href={`tel:${LINEA_APOYO.telefono}`}>
        <Phone size={20} />
        <span>
          {LINEA_APOYO.nombre}
          <br />
          <small style={{ opacity: 0.85 }}>{LINEA_APOYO.telefono}</small>
        </span>
      </a>
      <p className="sub" style={{ padding: "0 4px" }}>
        {LINEA_APOYO.nota}
      </p>

      <button className="btn" style={{ marginBottom: 10 }} onClick={() => irA("plan")}>
        <ShieldCheck size={18} /> Abrir mi plan de seguridad
      </button>
      <button className="btn secundario" style={{ marginBottom: 14 }} onClick={() => irA("herramientas")}>
        <Wind size={18} /> Caja de herramientas
      </button>

      <div className="seccion-titulo">
        <Wind size={15} /> Una pausa para respirar
      </div>
      <div className="tarjeta">
        <h2>Respiración 4 · 7 · 8</h2>
        <p className="sub">Cuando la ansiedad aprieta, esto la afloja un poco.</p>
        <ol style={{ paddingLeft: 18, margin: 0, fontSize: "0.92rem" }}>
          <li>Inhala por la nariz contando hasta 4.</li>
          <li>Sostén el aire contando hasta 7.</li>
          <li>Exhala despacio por la boca contando hasta 8.</li>
          <li>Repítelo 4 veces. Sin prisa.</li>
        </ol>
      </div>

      <div className="tarjeta">
        <h2>Recuerda</h2>
        <p style={{ margin: 0, fontSize: "0.95rem" }}>
          Sanar no es lineal. Hay días mejores y días más cuesta arriba, y todos son parte
          del proceso. Estás haciendo algo valiente al estar aquí. 🌿
        </p>
      </div>
    </>
  );
}
