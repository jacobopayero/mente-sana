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
import { Watch, Moon, Activity, ShieldCheck } from "lucide-react";

const CLAVE = "aura-conexiones";

const RELOJES = [
  { id: "apple", nombre: "Apple Watch · Salud" },
  { id: "googlefit", nombre: "Google Fit · Health Connect" },
  { id: "garmin", nombre: "Garmin" },
  { id: "fitbit", nombre: "Fitbit" },
  { id: "samsung", nombre: "Samsung Health" },
  { id: "oura", nombre: "Oura" },
  { id: "whoop", nombre: "Whoop" },
];

const EJERCICIO = [
  { id: "strava", nombre: "Strava" },
  { id: "nrc", nombre: "Nike Run Club" },
  { id: "applefitness", nombre: "Apple Fitness+" },
  { id: "peloton", nombre: "Peloton" },
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

  const Item = ({ it, icono: Icono }) => (
    <div className="item">
      <div className="icono-redondo">
        <Icono size={18} />
      </div>
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
          <Item key={it.id} it={it} icono={it.id === "oura" || it.id === "whoop" ? Moon : Watch} />
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
          <Item key={it.id} it={it} icono={Activity} />
        ))}
      </div>
    </>
  );
}
