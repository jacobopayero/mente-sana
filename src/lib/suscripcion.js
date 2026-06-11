// ============================================================================
//  Suscripción anual (demo)
//
//  Maneja el estado de la suscripción en el dispositivo. En el demo, "Suscribirme"
//  simula el pago y activa 12 meses. El cobro real (Stripe / Apple-RevenueCat)
//  se conecta después con la cuenta del titular.
// ============================================================================

const CLAVE = "mente-serena-suscripcion";

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

export function activarDemo() {
  const hasta = new Date();
  hasta.setFullYear(hasta.getFullYear() + 1);
  const s = { activa: true, hasta: hasta.toISOString(), demo: true };
  localStorage.setItem(CLAVE, JSON.stringify(s));
  return s;
}

export function cancelarDemo() {
  localStorage.removeItem(CLAVE);
}
