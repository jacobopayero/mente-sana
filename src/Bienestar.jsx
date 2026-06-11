// ============================================================================
//  MENTE SERENA — Funciones de bienestar y seguridad
//  Plan de seguridad, Medicación (con recordatorios de calendario), Ajustes
//  (bloqueo con PIN) y el botón flotante de SOS.
// ============================================================================
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Pill,
  Plus,
  Trash2,
  CalendarPlus,
  LifeBuoy,
  Lock,
  ChevronLeft,
  Heart,
  Users,
  Sparkles,
  Bell,
} from "lucide-react";

import {
  getPlanSeguridad,
  guardarPlanSeguridad,
  listarMedicamentos,
  crearMedicamento,
  eliminarMedicamento,
} from "./api";
import { recordarMedicamento } from "./lib/calendario";
import { pinActivo, definirPin, quitarPin } from "./lib/pin";

// Botón reutilizable para añadir algo al calendario del teléfono.
export function BotonCalendario({ onClick, texto = "Recordarme" }) {
  return (
    <button className="btn fantasma" onClick={onClick} style={{ marginTop: 10 }}>
      <CalendarPlus size={16} /> {texto}
    </button>
  );
}

// ---------------------------------------------------------------------------
//  Encabezado simple con botón de volver
// ---------------------------------------------------------------------------
function Cabecera({ titulo, subtitulo, onVolver }) {
  return (
    <header className="encabezado">
      {onVolver && (
        <button
          onClick={onVolver}
          style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--salvia-osc)", fontWeight: 600, marginBottom: 6 }}
        >
          <ChevronLeft size={18} /> Atrás
        </button>
      )}
      <p className="saludo">{subtitulo}</p>
      <h1 style={{ marginTop: 0 }}>{titulo}</h1>
    </header>
  );
}

// ============================================================================
//  PLAN DE SEGURIDAD
// ============================================================================
export function VistaPlanSeguridad({ irA }) {
  const [campos, setCampos] = useState({ senales: "", calma: "", personas: "", motivos: "" });
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    getPlanSeguridad()
      .then((p) => setCampos({ senales: p.senales || "", calma: p.calma || "", personas: p.personas || "", motivos: p.motivos || "" }))
      .catch(console.error);
  }, []);

  function set(campo, valor) {
    setCampos((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar() {
    await guardarPlanSeguridad(campos);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  const PREGUNTAS = [
    { k: "senales", icono: Heart, label: "Señales de alerta que noto en mí", ph: "Ej.: me aíslo, pensamientos muy autocríticos…" },
    { k: "calma", icono: Sparkles, label: "Qué me ayuda a calmarme", ph: "Ej.: respirar, caminar, música, escribir…" },
    { k: "personas", icono: Users, label: "Personas de confianza a quienes acudir", ph: "Nombres y cómo contactarles" },
    { k: "motivos", icono: ShieldCheck, label: "Mis motivos para seguir", ph: "Razones, metas, lo que me sostiene" },
  ];

  return (
    <>
      <Cabecera titulo="Mi plan de seguridad" subtitulo="Para los momentos difíciles" onVolver={() => irA("apoyo")} />

      <div className="aviso">
        <div className="titulo">
          <ShieldCheck size={18} /> Es tuyo y privado
        </div>
        <p>
          Constrúyelo con calma, idealmente junto a tu terapeuta. Cuando un momento se ponga
          cuesta arriba, vuelve aquí: tu yo de hoy dejándole una mano a tu yo de mañana.
        </p>
      </div>

      <div className="tarjeta">
        {PREGUNTAS.map((p) => {
          const Icono = p.icono;
          return (
            <div className="campo" key={p.k}>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icono size={14} /> {p.label}
              </label>
              <textarea value={campos[p.k]} onChange={(e) => set(p.k, e.target.value)} placeholder={p.ph} />
            </div>
          );
        })}
        <button className="btn" onClick={guardar}>
          {guardado ? "Guardado 🌿" : "Guardar mi plan"}
        </button>
      </div>
    </>
  );
}

// ============================================================================
//  MEDICACIÓN
// ============================================================================
export function VistaMedicacion({ irA }) {
  const [meds, setMeds] = useState([]);
  const [form, setForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [dosis, setDosis] = useState("");
  const [horario, setHorario] = useState("08:00");
  const [nota, setNota] = useState("");

  async function cargar() {
    setMeds(await listarMedicamentos());
  }
  useEffect(() => {
    cargar().catch(console.error);
  }, []);

  async function agregar(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    await crearMedicamento({ nombre: nombre.trim(), dosis: dosis.trim(), horario, nota: nota.trim() });
    setNombre("");
    setDosis("");
    setNota("");
    setHorario("08:00");
    setForm(false);
    await cargar();
  }

  async function quitar(id) {
    await eliminarMedicamento(id);
    await cargar();
  }

  return (
    <>
      <Cabecera titulo="Medicación" subtitulo="Tus recordatorios" onVolver={() => irA("inicio")} />

      <div className="tarjeta">
        <p className="sub" style={{ marginTop: 0 }}>
          Aquí no hay metas ni cifras: solo tus tomas y un recordatorio para no olvidarlas.
        </p>
        {meds.length === 0 ? (
          <p className="vacio">Aún no hay medicamentos registrados.</p>
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
                <button className="btn fantasma" style={{ marginTop: 8 }} onClick={() => recordarMedicamento(m)}>
                  <Bell size={15} /> Recordar cada día
                </button>
              </div>
              <button onClick={() => quitar(m.id)} title="Eliminar" style={{ color: "var(--tinta-suave)" }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}

        {!form ? (
          <button className="btn" style={{ marginTop: 12 }} onClick={() => setForm(true)}>
            <Plus size={18} /> Añadir medicamento
          </button>
        ) : (
          <form onSubmit={agregar} style={{ marginTop: 12 }}>
            <div className="campo">
              <label>Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Sertralina" required />
            </div>
            <div className="campo">
              <label>Dosis (texto libre)</label>
              <input value={dosis} onChange={(e) => setDosis(e.target.value)} placeholder="Ej.: 1 tableta" />
            </div>
            <div className="campo">
              <label>Hora</label>
              <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} />
            </div>
            <div className="campo">
              <label>Nota (opcional)</label>
              <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej.: con el desayuno" />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" type="submit">Guardar</button>
              <button className="btn secundario" type="button" onClick={() => setForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="sub" style={{ padding: "0 4px" }}>
        "Recordar cada día" añade un aviso a la hora indicada en el Calendario de tu teléfono.
      </p>
    </>
  );
}

// ============================================================================
//  AJUSTES (bloqueo con PIN)
// ============================================================================
export function VistaAjustes({ irA, onCambioPin }) {
  const [activo, setActivo] = useState(pinActivo());
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function activar(e) {
    e.preventDefault();
    setError("");
    if (pin1.length < 4) return setError("Usa al menos 4 dígitos.");
    if (pin1 !== pin2) return setError("Los PIN no coinciden.");
    await definirPin(pin1);
    setActivo(true);
    setPin1("");
    setPin2("");
    setOk("Bloqueo activado 🔒");
    onCambioPin && onCambioPin();
    setTimeout(() => setOk(""), 2500);
  }

  function desactivar() {
    quitarPin();
    setActivo(false);
    setOk("Bloqueo desactivado");
    onCambioPin && onCambioPin();
    setTimeout(() => setOk(""), 2500);
  }

  return (
    <>
      <Cabecera titulo="Ajustes" subtitulo="Privacidad" onVolver={() => irA("inicio")} />

      <div className="tarjeta">
        <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Lock size={18} /> Bloqueo con PIN
        </h2>
        <p className="sub">
          Protege tu información con un código. Se guarda cifrado solo en este teléfono.
        </p>

        {ok && <p style={{ color: "var(--salvia-osc)", fontWeight: 600 }}>{ok}</p>}

        {activo ? (
          <>
            <p style={{ fontWeight: 600, color: "var(--salvia-osc)" }}>🔒 El bloqueo está activado.</p>
            <button className="btn secundario" onClick={desactivar}>
              Quitar el PIN
            </button>
          </>
        ) : (
          <form onSubmit={activar}>
            <div className="campo">
              <label>Nuevo PIN (mín. 4 dígitos)</label>
              <input
                type="password"
                inputMode="numeric"
                value={pin1}
                onChange={(e) => setPin1(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
              />
            </div>
            <div className="campo">
              <label>Repite el PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={pin2}
                onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
              />
            </div>
            {error && <p className="error-texto">{error}</p>}
            <button className="btn" type="submit">Activar bloqueo</button>
          </form>
        )}
      </div>

      <p className="sub" style={{ padding: "0 4px" }}>
        En la versión nativa de iOS también podrá usarse Face ID.
      </p>
    </>
  );
}

// ============================================================================
//  BOTÓN SOS (flotante)
// ============================================================================
export function SOSBoton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Necesito apoyo ahora"
      style={{
        position: "fixed",
        right: 16,
        bottom: 84,
        zIndex: 20,
        background: "var(--alerta)",
        color: "#fff",
        borderRadius: 999,
        padding: "12px 18px",
        fontWeight: 800,
        boxShadow: "0 8px 22px rgba(181,119,79,0.45)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <LifeBuoy size={20} /> SOS
    </button>
  );
}
