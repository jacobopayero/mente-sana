// ============================================================================
//  AURA — Caja de herramientas
//  Ejercicios breves para momentos difíciles: respiración guiada animada,
//  anclaje 5-4-3-2-1 y una pausa de autocompasión. No requieren conexión.
// ============================================================================
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Wind, Anchor, Heart, Play, Square } from "lucide-react";

function Cabecera({ titulo, subtitulo, onVolver }) {
  return (
    <header className="encabezado">
      {onVolver && (
        <button
          onClick={onVolver}
          style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--salvia-osc)", fontWeight: 600, marginBottom: 6 }}
        >
          <ChevronLeft size={18} /> Inicio
        </button>
      )}
      <p className="saludo">{subtitulo}</p>
      <h1 style={{ marginTop: 0 }}>{titulo}</h1>
    </header>
  );
}

// ---------------------------------------------------------------------------
//  Respiración guiada 4 · 7 · 8 con círculo animado
// ---------------------------------------------------------------------------
const FASES = [
  { nombre: "Inhala", seg: 4, escala: 1.6 },
  { nombre: "Sostén", seg: 7, escala: 1.6 },
  { nombre: "Exhala", seg: 8, escala: 1.0 },
];

function Respiracion() {
  const [activo, setActivo] = useState(false);
  const [fase, setFase] = useState(0);
  const [cuenta, setCuenta] = useState(FASES[0].seg);
  const ref = useRef();

  useEffect(() => {
    if (!activo) return;
    ref.current = setInterval(() => {
      setCuenta((c) => {
        if (c > 1) return c - 1;
        // cambiar de fase
        setFase((f) => {
          const sig = (f + 1) % FASES.length;
          return sig;
        });
        return 0; // se ajusta abajo
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [activo]);

  // Al cambiar de fase, reiniciar la cuenta a la duración de esa fase.
  useEffect(() => {
    if (activo) setCuenta(FASES[fase].seg);
  }, [fase, activo]);

  function alternar() {
    if (activo) {
      setActivo(false);
      clearInterval(ref.current);
    } else {
      setFase(0);
      setCuenta(FASES[0].seg);
      setActivo(true);
    }
  }

  const faseActual = FASES[fase];

  return (
    <div className="tarjeta" style={{ textAlign: "center" }}>
      <h2 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Wind size={18} /> Respiración 4 · 7 · 8
      </h2>
      <p className="sub">Sigue el círculo. Cuando la ansiedad aprieta, esto la afloja.</p>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 220 }}>
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "var(--salvia-clara)",
            border: "3px solid var(--salvia)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--salvia-osc)",
            transform: `scale(${activo ? faseActual.escala : 1})`,
            transition: `transform ${activo ? faseActual.seg : 0.4}s ease-in-out`,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{activo ? faseActual.nombre : "Listo"}</span>
          {activo && <span style={{ fontSize: "1.6rem", fontWeight: 800 }}>{cuenta}</span>}
        </div>
      </div>

      <button className="btn" onClick={alternar}>
        {activo ? (
          <>
            <Square size={18} /> Terminar
          </>
        ) : (
          <>
            <Play size={18} /> Empezar
          </>
        )}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Anclaje 5-4-3-2-1
// ---------------------------------------------------------------------------
const PASOS_ANCLAJE = [
  { n: 5, t: "5 cosas que puedes VER a tu alrededor" },
  { n: 4, t: "4 cosas que puedes TOCAR" },
  { n: 3, t: "3 cosas que puedes OÍR" },
  { n: 2, t: "2 cosas que puedes OLER" },
  { n: 1, t: "1 cosa que puedes SABOREAR" },
];

function Anclaje() {
  const [i, setI] = useState(-1);
  const enMarcha = i >= 0 && i < PASOS_ANCLAJE.length;
  const terminado = i >= PASOS_ANCLAJE.length;

  return (
    <div className="tarjeta" style={{ textAlign: "center" }}>
      <h2 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Anchor size={18} /> Anclaje 5-4-3-2-1
      </h2>
      <p className="sub">Vuelve al presente usando tus sentidos, uno a uno.</p>

      {!enMarcha && !terminado && (
        <button className="btn" onClick={() => setI(0)}>
          <Play size={18} /> Empezar
        </button>
      )}

      {enMarcha && (
        <>
          <div
            style={{
              fontSize: "3rem",
              fontWeight: 800,
              color: "var(--salvia)",
              margin: "8px 0",
            }}
          >
            {PASOS_ANCLAJE[i].n}
          </div>
          <p style={{ fontSize: "1.05rem", minHeight: 48 }}>{PASOS_ANCLAJE[i].t}</p>
          <button className="btn" onClick={() => setI(i + 1)}>
            {i === PASOS_ANCLAJE.length - 1 ? "Terminar" : "Siguiente"}
          </button>
        </>
      )}

      {terminado && (
        <>
          <p style={{ fontSize: "1.05rem" }}>Estás aquí, en este momento. 🌿</p>
          <button className="btn secundario" onClick={() => setI(-1)}>
            Repetir
          </button>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Pausa de autocompasión
// ---------------------------------------------------------------------------
function Autocompasion() {
  return (
    <div className="tarjeta">
      <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Heart size={18} /> Pausa de autocompasión
      </h2>
      <p className="sub">Una mano en el pecho. Respira. Y date estas tres frases:</p>
      <ol style={{ paddingLeft: 18, margin: 0, fontSize: "0.98rem", lineHeight: 1.9 }}>
        <li>"Este es un momento difícil."</li>
        <li>"Los momentos difíciles son parte de ser humano."</li>
        <li>"Que pueda tratarme con la amabilidad que necesito."</li>
      </ol>
    </div>
  );
}

export function VistaHerramientas({ irA }) {
  return (
    <>
      <Cabecera titulo="Caja de herramientas" subtitulo="Para volver a la calma" onVolver={() => irA("inicio")} />
      <Respiracion />
      <Anclaje />
      <Autocompasion />
    </>
  );
}
