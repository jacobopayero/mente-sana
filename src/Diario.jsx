// ============================================================================
//  MENTE SERENA — Diario (journaling)
//  Espacio privado de escritura, con sugerencias suaves para empezar.
//  SALVAGUARDA: escritura reflexiva; nunca pide cifras ni métricas corporales.
// ============================================================================
import { useEffect, useState } from "react";
import { ChevronLeft, RefreshCw, BookHeart } from "lucide-react";
import { listarDiario, crearEntradaDiario } from "./api";

const SUGERENCIAS = [
  "¿Qué necesité hoy?",
  "Un momento amable conmigo de hoy fue…",
  "¿Qué emoción estuvo más presente y dónde la sentí?",
  "Algo que me costó hoy y cómo lo afronté.",
  "¿De qué me siento agradecida/o, aunque sea pequeño?",
  "Una cosa que quiero recordarme para mañana.",
  "¿Qué le diría a una amiga que estuviera viviendo lo que yo vivo?",
  "¿Qué me ayudó a sentirme un poco mejor?",
];

const fechaLegible = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "short" });
};

export function VistaDiario({ irA }) {
  const [entradas, setEntradas] = useState([]);
  const [sugIdx, setSugIdx] = useState(() => Math.floor(Math.random() * SUGERENCIAS.length));
  const [texto, setTexto] = useState("");
  const [guardado, setGuardado] = useState(false);

  async function cargar() {
    setEntradas(await listarDiario());
  }
  useEffect(() => {
    cargar().catch(console.error);
  }, []);

  function otraSugerencia() {
    setSugIdx((i) => (i + 1) % SUGERENCIAS.length);
  }

  async function guardar() {
    if (!texto.trim()) return;
    await crearEntradaDiario({ sugerencia: SUGERENCIAS[sugIdx], texto: texto.trim() });
    setTexto("");
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
    await cargar();
  }

  return (
    <>
      <header className="encabezado">
        <button
          onClick={() => irA("inicio")}
          style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--salvia-osc)", fontWeight: 600, marginBottom: 6 }}
        >
          <ChevronLeft size={18} /> Inicio
        </button>
        <p className="saludo">Tu espacio privado</p>
        <h1 style={{ marginTop: 0 }}>Diario</h1>
      </header>

      <div className="tarjeta">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <BookHeart size={18} /> Hoy
          </h2>
          <button
            onClick={otraSugerencia}
            title="Otra sugerencia"
            style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--salvia-osc)", fontSize: "0.82rem", fontWeight: 600 }}
          >
            <RefreshCw size={14} /> Otra
          </button>
        </div>
        <p className="sub" style={{ marginTop: 6, fontStyle: "italic" }}>“{SUGERENCIAS[sugIdx]}”</p>
        <div className="campo">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe lo que quieras, sin filtros. Nadie más lo lee."
            style={{ minHeight: 120 }}
          />
        </div>
        <button className="btn" onClick={guardar}>
          {guardado ? "Guardado 🌿" : "Guardar entrada"}
        </button>
      </div>

      <div className="seccion-titulo">Entradas anteriores</div>
      <div className="tarjeta">
        {entradas.length === 0 ? (
          <p className="vacio">Aún no has escrito. Tu primera página te espera.</p>
        ) : (
          entradas.map((e) => (
            <div className="item" key={e.id} style={{ display: "block" }}>
              <div className="meta" style={{ textTransform: "capitalize" }}>{fechaLegible(e.creado_en)}</div>
              {e.sugerencia && <div className="meta" style={{ fontStyle: "italic" }}>“{e.sugerencia}”</div>}
              <div style={{ marginTop: 4 }}>{e.texto}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
