// ============================================================================
//  MENTE SERENA — Bienvenida, consentimiento informado y aviso de emergencia
//  Se muestra una sola vez por dispositivo, antes de usar la app.
//  IMPORTANTE: el texto legal/clínico debe revisarlo la dirección clínica y un
//  asesor legal (Ley 172-13) antes de abrir a pacientes reales.
// ============================================================================
import { useState } from "react";
import { ShieldCheck, Phone, Heart, Lock } from "lucide-react";
import PieLegal from "./PieLegal.jsx";

const CLAVE = "mente-serena-onboarding";

export function onboardingAceptado() {
  return localStorage.getItem(CLAVE) === "1";
}

export default function Bienvenida({ alAceptar }) {
  const [acepto, setAcepto] = useState(false);

  function comenzar() {
    localStorage.setItem(CLAVE, "1");
    alAceptar();
  }

  return (
    <div className="acceso" style={{ paddingTop: 28, paddingBottom: 28 }}>
      <div className="marca">
        <img src={import.meta.env.BASE_URL + "icono.svg"} alt="" />
        <h1>Bienvenida a Mente Serena</h1>
        <p>Un acompañamiento sereno entre tus sesiones de terapia.</p>
      </div>

      <div className="tarjeta">
        <div className="item">
          <div className="icono-redondo"><Heart size={18} /></div>
          <div className="cuerpo">
            <div className="titulo">Para acompañarte, no para juzgarte</div>
            <div className="meta">Registra tu ánimo y descanso, guarda recursos y mantén el contacto con tu equipo.</div>
          </div>
        </div>
        <div className="item">
          <div className="icono-redondo"><Lock size={18} /></div>
          <div className="cuerpo">
            <div className="titulo">Tu información es privada</div>
            <div className="meta">Puedes proteger la app con un PIN desde Ajustes.</div>
          </div>
        </div>
        <div className="item">
          <div className="icono-redondo"><ShieldCheck size={18} /></div>
          <div className="cuerpo">
            <div className="titulo">No sustituye a tu terapia</div>
            <div className="meta">Es una herramienta de apoyo, no reemplaza la atención profesional ni de emergencia.</div>
          </div>
        </div>
      </div>

      <div className="aviso">
        <div className="titulo">
          <Phone size={18} /> En una emergencia
        </div>
        <p>
          Si estás en peligro o atraviesas una crisis, llama de inmediato a emergencias
          (<strong>911</strong>) o acude al servicio de urgencias más cercano. En la pantalla
          de <strong>Apoyo</strong> tienes también una línea de acompañamiento.
        </p>
      </div>

      <label
        style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "4px 4px 14px", fontSize: "0.9rem" }}
      >
        <input
          type="checkbox"
          checked={acepto}
          onChange={(e) => setAcepto(e.target.checked)}
          style={{ width: 20, height: 20, accentColor: "var(--salvia)", marginTop: 2, flexShrink: 0 }}
        />
        Entiendo que Mente Serena acompaña mi proceso y <strong>no sustituye</strong> la atención
        médica ni de emergencia, y acepto usarla con ese fin.
      </label>

      <button className="btn" onClick={comenzar} disabled={!acepto}>
        Comenzar
      </button>

      <PieLegal />
    </div>
  );
}
