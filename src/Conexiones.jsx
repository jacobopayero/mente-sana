// ============================================================================
//  AURA — Conexiones (relojes y apps) · SOLO para el profesional
//
//  Esta sección y sus datos son de USO CLÍNICO: el paciente NO los ve. En TCA,
//  mostrar métricas de actividad puede ser disparador; por eso el reloj importa
//  ÚNICAMENTE la calidad del sueño y los datos quedan del lado del equipo.
//
//  Nota técnica: la sincronización real requiere la app nativa (Apple HealthKit
//  / Google Health Connect) u OAuth (Garmin, Fitbit…) y las cuentas de
//  desarrollador correspondientes. Aquí se gestiona el estado de conexión.
// ============================================================================
import { useState } from "react";
import { Watch, ShieldCheck, Activity } from "lucide-react";

const CLAVE = "aura-conexiones";

// Logo de marca (Simple Icons) sobre fondo del color de la marca. Si la imagen
// no carga, queda el recuadro con el color de la marca.
function Logo({ slug, color }) {
  return (
    <div className="icono-redondo" style={{ background: color, padding: 7, flexShrink: 0 }}>
      <img
        src={`https://cdn.simpleicons.org/${slug}/white`}
        alt=""
        width={22}
        height={22}
        style={{ display: "block" }}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    </div>
  );
}

const RELOJES = [
  { id: "apple", nombre: "Apple Watch · Salud", slug: "apple", color: "#000000" },
  { id: "googlefit", nombre: "Google Fit · Health Connect", slug: "googlefit", color: "#4285F4" },
  { id: "garmin", nombre: "Garmin", slug: "garmin", color: "#007CC3" },
  { id: "fitbit", nombre: "Fitbit", slug: "fitbit", color: "#00B0B9" },
  { id: "samsung", nombre: "Samsung Health", slug: "samsung", color: "#1428A0" },
  { id: "oura", nombre: "Oura", slug: "oura", color: "#111111" },
  { id: "whoop", nombre: "Whoop", slug: "whoop", color: "#0a0a0a" },
];

const EJERCICIO = [
  { id: "strava", nombre: "Strava", slug: "strava", color: "#FC4C02" },
  { id: "nrc", nombre: "Nike Run Club", slug: "nike", color: "#111111" },
  { id: "applefitness", nombre: "Apple Fitness+", slug: "apple", color: "#000000" },
  { id: "peloton", nombre: "Peloton", slug: "peloton", color: "#111111" },
];

function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || "{}");
  } catch (_) {
    return {};
  }
}

export function Conexiones({ paciente }) {
  const clave = CLAVE + (paciente?.id ? ":" + paciente.id : "");
  const [conectado, setConectado] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(clave) || "{}");
    } catch (_) {
      return leer();
    }
  });

  function alternar(id) {
    const next = { ...conectado, [id]: !conectado[id] };
    setConectado(next);
    localStorage.setItem(clave, JSON.stringify(next));
  }

  const Item = ({ it }) => (
    <div className="item">
      <Logo slug={it.slug} color={it.color} />
      <div className="cuerpo">
        <div className="titulo">{it.nombre}</div>
        <div className="meta">{conectado[it.id] ? "Conectado · importa solo sueño" : "No conectado"}</div>
      </div>
      <button
        className={conectado[it.id] ? "btn secundario" : "btn"}
        style={{ width: "auto", padding: "8px 14px" }}
        onClick={() => alternar(it.id)}
      >
        {conectado[it.id] ? "Quitar" : "Conectar"}
      </button>
    </div>
  );

  return (
    <>
      <div className="seccion-titulo">
        <Watch size={15} /> Conexiones (uso clínico)
      </div>

      <div className="aviso" style={{ background: "#eef1ea", borderColor: "var(--salvia-clara)" }}>
        <div className="titulo" style={{ color: "var(--salvia-osc)" }}>
          <ShieldCheck size={18} /> Datos solo para el equipo
        </div>
        <p>
          El paciente <strong>no ve</strong> esta sección. Aura importa <strong>únicamente la
          calidad del sueño</strong> del reloj; no pasos, calorías ni actividad.
        </p>
      </div>

      <div className="tarjeta">
        <div className="meta" style={{ marginBottom: 6, fontWeight: 600 }}>Relojes y apps de salud</div>
        {RELOJES.map((it) => (
          <Item key={it.id} it={it} />
        ))}
      </div>

      <div className="tarjeta">
        <div className="meta" style={{ marginBottom: 6, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <Activity size={14} /> Apps de ejercicio (con criterio clínico)
        </div>
        <p className="sub" style={{ marginTop: 0 }}>
          En TCA el ejercicio puede volverse compulsivo. No importan calorías ni metas; uso solo
          clínico.
        </p>
        {EJERCICIO.map((it) => (
          <Item key={it.id} it={it} />
        ))}
      </div>
    </>
  );
}
