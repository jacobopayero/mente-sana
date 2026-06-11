// ============================================================================
//  MENTE SERENA — Capa de datos (Fase 1)
//  Conecta la app React al backend (Supabase).
//
//  Si Supabase no está configurado (sin variables de entorno), todas las
//  funciones delegan en un almacén local de demostración (lib/demoStore),
//  para poder revisar la interfaz sin backend.
//
//  SALVAGUARDAS: no hay calorías, peso ni métricas corporales en ningún
//  registro. El sueño usa solo calidad cualitativa y rango.
// ============================================================================

import { supabase, estaConfigurado } from "./lib/supabaseClient";
import { demo } from "./lib/demoStore";

export { estaConfigurado };

// ----------------------------------------------------------------------------
//  AUTENTICACIÓN
// ----------------------------------------------------------------------------
export async function registrarse({ email, password, nombre }) {
  if (!estaConfigurado) return demo.registrarse({ email, nombre });
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // El perfil se crea con un trigger en la base o aquí tras el registro:
  if (data.user) {
    await supabase.from("perfiles").insert({
      id: data.user.id,
      email,
      nombre,
      rol: "paciente",
    });
  }
  return data;
}

export async function iniciarSesion({ email, password }) {
  if (!estaConfigurado) return demo.iniciarSesion({ email });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function cerrarSesion() {
  if (!estaConfigurado) return demo.cerrarSesion();
  await supabase.auth.signOut();
}

export async function usuarioActual() {
  if (!estaConfigurado) return demo.usuarioActual();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function miPerfil() {
  if (!estaConfigurado) return demo.miPerfil();
  const user = await usuarioActual();
  if (!user) return null;
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return data;
}

// ----------------------------------------------------------------------------
//  EQUIPO DE CUIDADO
// ----------------------------------------------------------------------------
export async function miEquipo() {
  if (!estaConfigurado) return demo.miEquipo();
  // Devuelve los profesionales vinculados al paciente actual.
  const { data, error } = await supabase
    .from("vinculos_cuidado")
    .select(`
      profesional:profesional_id (
        id, nombre, nombre_formal, titulo, rol,
        perfiles_profesional ( especialidad, credenciales, color_hex )
      )
    `)
    .eq("activo", true);
  if (error) throw error;
  return (data || []).map((v) => v.profesional);
}

// ----------------------------------------------------------------------------
//  DIARIO DE ÁNIMO
// ----------------------------------------------------------------------------
export async function listarAnimo() {
  if (!estaConfigurado) return demo.listarAnimo();
  const { data, error } = await supabase
    .from("registros_animo")
    .select("*")
    .order("fecha", { ascending: true });
  if (error) throw error;
  return data;
}

export async function guardarAnimo({ fecha, animo, emociones, nota }) {
  if (!estaConfigurado) return demo.guardarAnimo({ fecha, animo, emociones, nota });
  const user = await usuarioActual();
  // upsert por (paciente, fecha): un registro por día
  const { data, error } = await supabase
    .from("registros_animo")
    .upsert(
      { paciente_id: user.id, fecha, animo, emociones, nota },
      { onConflict: "paciente_id,fecha" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ----------------------------------------------------------------------------
//  SUEÑO  (solo calidad cualitativa y rango; nunca métricas corporales)
// ----------------------------------------------------------------------------
export async function listarSueno() {
  if (!estaConfigurado) return demo.listarSueno();
  const { data, error } = await supabase
    .from("registros_sueno")
    .select("*")
    .order("fecha", { ascending: true });
  if (error) throw error;
  return data;
}

export async function guardarSueno({ fecha, calidad, rango, nota, origen = "manual" }) {
  if (!estaConfigurado) return demo.guardarSueno({ fecha, calidad, rango, nota, origen });
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from("registros_sueno")
    .upsert(
      { paciente_id: user.id, fecha, calidad, rango, nota, origen },
      { onConflict: "paciente_id,fecha" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Detecta varias noches seguidas de descanso pobre y, si corresponde,
// registra una alerta de apoyo. El umbral debe calibrarlo la dirección clínica.
export async function evaluarAlertaSueno() {
  const registros = await listarSueno();
  const ultimas = registros.slice(-2);
  const esPobre = (s) => s.calidad === "inquieto" || s.rango === 0;
  const disparar = ultimas.length === 2 && ultimas.every(esPobre);
  return { disparar, ultimas };
}

export async function registrarAlertaSueno({ motivo, respuesta }) {
  if (!estaConfigurado) return demo.registrarAlertaSueno({ motivo, respuesta });
  const user = await usuarioActual();
  const { error } = await supabase
    .from("alertas_sueno")
    .insert({ paciente_id: user.id, motivo, respuesta });
  if (error) throw error;
}

// ----------------------------------------------------------------------------
//  CITAS
// ----------------------------------------------------------------------------
export async function listarCitas() {
  if (!estaConfigurado) return demo.listarCitas();
  const { data, error } = await supabase
    .from("citas")
    .select("*")
    .order("fecha", { ascending: true });
  if (error) throw error;
  return data;
}

export async function crearCita({ profesional_id, fecha, hora, modalidad, tipo }) {
  if (!estaConfigurado) return demo.crearCita({ profesional_id, fecha, hora, modalidad, tipo });
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from("citas")
    .insert({ paciente_id: user.id, profesional_id, fecha, hora, modalidad, tipo })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cancelarCita(id) {
  if (!estaConfigurado) return demo.cancelarCita(id);
  const { error } = await supabase.from("citas").delete().eq("id", id);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
//  TAREAS
// ----------------------------------------------------------------------------
export async function listarTareas() {
  if (!estaConfigurado) return demo.listarTareas();
  const { data, error } = await supabase
    .from("tareas")
    .select("*")
    .order("creado_en", { ascending: true });
  if (error) throw error;
  return data;
}

export async function marcarTarea(id, completada) {
  if (!estaConfigurado) return demo.marcarTarea(id, completada);
  const { error } = await supabase.from("tareas").update({ completada }).eq("id", id);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
//  NOTAS DE COORDINACIÓN  (escritura solo profesionales; el paciente ve las
//  marcadas como visibles para él — controlado por las políticas del backend)
// ----------------------------------------------------------------------------
export async function listarNotas(pacienteId) {
  if (!estaConfigurado) return demo.listarNotas(pacienteId);
  const { data, error } = await supabase
    .from("notas_coordinacion")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("creado_en", { ascending: false });
  if (error) throw error;
  return data;
}

export async function crearNota({ paciente_id, categoria, texto, visible_paciente = false }) {
  if (!estaConfigurado) throw new Error("Crear notas requiere Supabase configurado.");
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from("notas_coordinacion")
    .insert({ paciente_id, autor_id: user.id, categoria, texto, visible_paciente })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ----------------------------------------------------------------------------
//  RECURSOS
// ----------------------------------------------------------------------------
export async function listarRecursos() {
  if (!estaConfigurado) return demo.listarRecursos();
  const { data, error } = await supabase
    .from("recursos")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) throw error;
  return data;
}

export async function crearRecurso(recurso) {
  if (!estaConfigurado) throw new Error("Crear recursos requiere Supabase configurado.");
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from("recursos")
    .insert({ ...recurso, creado_por: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
