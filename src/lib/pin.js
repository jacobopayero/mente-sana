// ============================================================================
//  Bloqueo con PIN (privacidad)
//
//  Guarda solo un hash del PIN (SHA-256 con sal aleatoria) en este dispositivo,
//  nunca el PIN en claro. Pensado para que solo la persona dueña del teléfono
//  abra la app. En la versión nativa de iOS se puede sumar Face ID.
// ============================================================================

const CLAVE = "mente-serena-pin";

function aHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashear(codigo, sal) {
  const datos = new TextEncoder().encode(`${sal}:${codigo}`);
  const resumen = await crypto.subtle.digest("SHA-256", datos);
  return aHex(resumen);
}

export function pinActivo() {
  return Boolean(localStorage.getItem(CLAVE));
}

export async function definirPin(codigo) {
  const sal = crypto.randomUUID ? crypto.randomUUID() : String(Math.random());
  const h = await hashear(codigo, sal);
  localStorage.setItem(CLAVE, JSON.stringify({ sal, h }));
}

export async function verificarPin(codigo) {
  const guardado = localStorage.getItem(CLAVE);
  if (!guardado) return true;
  const { sal, h } = JSON.parse(guardado);
  return (await hashear(codigo, sal)) === h;
}

export function quitarPin() {
  localStorage.removeItem(CLAVE);
}
