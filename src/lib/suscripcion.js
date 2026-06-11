// ============================================================================
//  Suscripción anual con prueba gratis (demo)
//
//  Maneja el estado de la suscripción en el dispositivo:
//   - Primera semana de prueba GRATIS (7 días).
//   - Luego, suscripción anual.
//  En el demo, los botones simulan el pago/activación. El cobro real
//  (Stripe / Apple-RevenueCat) se conecta después con la cuenta del titular.
// ============================================================================

const CLAVE = "mente-serena-suscripcion";
const CLAVE_PRUEBA = "mente-serena-prueba-usada";

export const DIAS_PRUEBA = 7;

// Precio anual — EDITAR con el valor real definido por el titular.
export const PRECIO_ANUAL = "US$20";
export const PRECIO_NOTA = "por año (precio de ejemplo, por confirmar)";

export function estadoSuscripcion() {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.hasta && new Date(s.hasta) > new Date()) return s;
    }
  } catch (_) {
    /* ignore */
  }
  return { activa: false };
}

export function pruebaUsada() {
  return localStorage.getItem(CLAVE_PRUEBA) === "1";
}

export function activarPrueba() {
  const hasta = new Date();
  hasta.setDate(hasta.getDate() + DIAS_PRUEBA);
  const s = { activa: true, prueba: true, hasta: hasta.toISOString() };
  localStorage.setItem(CLAVE, JSON.stringify(s));
  localStorage.setItem(CLAVE_PRUEBA, "1");
  return s;
}

export function activarAnual() {
  const hasta = new Date();
  hasta.setFullYear(hasta.getFullYear() + 1);
  const s = { activa: true, prueba: false, hasta: hasta.toISOString(), demo: true };
  localStorage.setItem(CLAVE, JSON.stringify(s));
  return s;
}

export function cancelar() {
  localStorage.removeItem(CLAVE);
}
