// ============================================================================
//  Pantalla de desbloqueo con PIN
//  Se muestra al abrir la app cuando hay un PIN activo en el dispositivo.
// ============================================================================
import { useState } from "react";
import { Lock } from "lucide-react";
import { verificarPin } from "./lib/pin";

export default function PinLock({ alDesbloquear }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  async function enviar(e) {
    e.preventDefault();
    setError("");
    if (await verificarPin(pin)) {
      alDesbloquear();
    } else {
      setError("PIN incorrecto. Intenta de nuevo.");
      setPin("");
    }
  }

  return (
    <div className="acceso">
      <div className="marca">
        <img src={import.meta.env.BASE_URL + "icono.svg"} alt="" />
        <h1>Mente Serena</h1>
        <p>Tu espacio está protegido</p>
      </div>

      <form onSubmit={enviar} className="tarjeta">
        <div className="campo">
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Lock size={14} /> Introduce tu PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••"
            style={{ textAlign: "center", letterSpacing: "0.5em", fontSize: "1.3rem" }}
          />
        </div>
        {error && <p className="error-texto">{error}</p>}
        <button className="btn" type="submit">
          Entrar
        </button>
      </form>
    </div>
  );
}
