// ============================================================================
//  AURA — Plan anual / Suscripción (con prueba gratis)
//  Pantalla informativa (el demo queda abierto). Simula la prueba gratis de 7
//  días y la suscripción anual para mostrar el flujo y el estado; el cobro real
//  se conecta después.
// ============================================================================
import { useState } from "react";
import { ChevronLeft, Check, Crown, ShieldCheck, Gift } from "lucide-react";
import {
  PRECIO_ANUAL,
  PRECIO_NOTA,
  DIAS_PRUEBA,
  estadoSuscripcion,
  pruebaUsada,
  activarPrueba,
  activarAnual,
  cancelar,
} from "./lib/suscripcion";
import PieLegal from "./PieLegal.jsx";

const INCLUYE = [
  "Acceso completo durante 12 meses",
  "Diario de ánimo, sueño y journaling",
  "Caja de herramientas (respiración, anclaje)",
  "Recordatorios de citas y medicación",
  "Plan de seguridad y botón SOS",
  "Vínculo con tu equipo de cuidado",
  "Respaldo de tu información",
];

const fechaLarga = (iso) =>
  new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" });

export function VistaSuscripcion({ irA }) {
  const [estado, setEstado] = useState(estadoSuscripcion());
  const [usada, setUsada] = useState(pruebaUsada());

  function empezarPrueba() {
    setEstado(activarPrueba());
    setUsada(true);
  }
  function suscribir() {
    setEstado(activarAnual());
  }
  function cancelarSus() {
    cancelar();
    setEstado({ activa: false });
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
        <p className="saludo">Tu acceso</p>
        <h1 style={{ marginTop: 0 }}>Plan anual</h1>
      </header>

      {/* Estado actual */}
      {estado.activa ? (
        <div className="tarjeta" style={{ background: "var(--salvia)", color: "#fff", textAlign: "center" }}>
          {estado.prueba ? <Gift size={28} style={{ margin: "0 auto 6px", display: "block" }} /> : <Crown size={28} style={{ margin: "0 auto 6px", display: "block" }} />}
          <h2 style={{ color: "#fff" }}>{estado.prueba ? "Prueba gratis activa" : "Suscripción activa"}</h2>
          <p style={{ margin: "4px 0 0", opacity: 0.95 }}>
            {estado.prueba ? "Tu semana gratis termina el " : "Válida hasta el "}
            {fechaLarga(estado.hasta)}.
          </p>
        </div>
      ) : (
        <>
          <div className="aviso" style={{ background: "#eef1ea", borderColor: "var(--salvia-clara)", textAlign: "center" }}>
            <div className="titulo" style={{ color: "var(--salvia-osc)", justifyContent: "center" }}>
              <Gift size={18} /> Primera semana de prueba GRATIS
            </div>
            <p style={{ marginTop: 4 }}>Prueba {DIAS_PRUEBA} días sin costo. Luego, el plan anual.</p>
          </div>
          <div className="tarjeta" style={{ textAlign: "center" }}>
            <div className="etiqueta" style={{ marginBottom: 8 }}>Plan anual</div>
            <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--salvia-osc)" }}>{PRECIO_ANUAL}</div>
            <div className="sub" style={{ marginTop: 2 }}>{PRECIO_NOTA}</div>
          </div>
        </>
      )}

      {/* Beneficios + acciones */}
      <div className="tarjeta">
        <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={18} /> Incluye
        </h2>
        {INCLUYE.map((t) => (
          <div className="item" key={t} style={{ padding: "10px 0" }}>
            <div className="check on" style={{ width: 24, height: 24 }}>
              <Check size={15} />
            </div>
            <div className="cuerpo">
              <div style={{ fontWeight: 500 }}>{t}</div>
            </div>
          </div>
        ))}

        {estado.activa ? (
          <>
            {estado.prueba && (
              <button className="btn" style={{ marginTop: 12 }} onClick={suscribir}>
                Continuar con el plan anual
              </button>
            )}
            <button className="btn secundario" style={{ marginTop: 10 }} onClick={cancelarSus}>
              Cancelar (demo)
            </button>
          </>
        ) : (
          <>
            {!usada && (
              <button className="btn" style={{ marginTop: 12 }} onClick={empezarPrueba}>
                <Gift size={18} /> Empezar mi semana gratis
              </button>
            )}
            <button className={usada ? "btn" : "btn secundario"} style={{ marginTop: 10 }} onClick={suscribir}>
              Suscribirme por un año (demo)
            </button>
          </>
        )}
      </div>

      <p className="sub" style={{ padding: "0 4px" }}>
        El demo está abierto: puedes usar todo sin pagar. La prueba gratis y el cobro anual se
        activan al conectar la pasarela de pago.
      </p>

      <PieLegal />
    </>
  );
}
