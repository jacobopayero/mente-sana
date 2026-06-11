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
  // Pasamos el nombre como metadato: el trigger de la base (02_funciones.sql)
  // lo usa para crear el perfil automáticamente al registrarse.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre } },
  });
  if (error) throw error;
  // Aseguramos/actualizamos el perfil (upsert evita conflicto con el trigger).
  // Solo funciona si hay sesión activa (confirmación de correo desactivada).
  if (data.session && data.user) {
    await supabase
      .from("perfiles")
      .upsert({ id: data.user.id, email, nombre, rol: "paciente" }, { onConflict: "id" });
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

// Actualiza el perfil del usuario actual (nombre, foto, etc.).
export async function actualizarMiPerfil(campos) {
  if (!estaConfigurado) return demo.actualizarMiPerfil(campos);
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from("perfiles")
    .update(campos)
    .eq("id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ----------------------------------------------------------------------------
//  FICHA CLÍNICA (historia médica)  ·  sin métricas corporales
// ----------------------------------------------------------------------------
export async function getFichaClinica() {
  if (!estaConfigurado) return demo.getFichaClinica();
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from("ficha_clinica")
    .select("*")
    .eq("paciente_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data || {};
}

export async function guardarFichaClinica(campos) {
  if (!estaConfigurado) return demo.guardarFichaClinica(campos);
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from("ficha_clinica")
    .upsert({ paciente_id: user.id, ...campos, actualizado_en: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Vista del profesional: ficha clínica de un paciente (RLS controla el acceso).
export async function fichaDePaciente(pacienteId) {
  if (!estaConfigurado) return demo.fichaDePaciente(pacienteId);
  const { data, error } = await supabase
    .from("ficha_clinica")
    .select("*")
    .eq("paciente_id", pacienteId)
    .maybeSingle();
  if (error) throw error;
  return data || {};
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
  if (!estaConfigurado) return demo.crearNota({ paciente_id, categoria, texto, visible_paciente });
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
  if (!estaConfigurado) return demo.crearRecurso(recurso);
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from("recursos")
    .insert({ ...recurso, creado_por: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ----------------------------------------------------------------------------
//  PANEL DEL PROFESIONAL (Fase 2)
//  Lectura de los datos de los pacientes a cargo y escritura de tareas, notas
//  y recursos. En Supabase, las políticas RLS (atiende_a) garantizan que un
//  profesional solo ve a sus pacientes.
// ----------------------------------------------------------------------------

// Solo demo: permite entrar como paciente o como profesional para revisar.
export async function entrarDemoComo(rol) {
  return demo.iniciarSesionComo(rol);
}

export async function misPacientes() {
  if (!estaConfigurado) return demo.misPacientes();
  const { data, error } = await supabase
    .from("vinculos_cuidado")
    .select(`paciente:paciente_id ( id, nombre, email, foto_url )`)
    .eq("activo", true);
  if (error) throw error;
  return (data || []).map((v) => v.paciente);
}

export async function animoDePaciente(pacienteId) {
  if (!estaConfigurado) return demo.animoDePaciente(pacienteId);
  const { data, error } = await supabase
    .from("registros_animo")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("fecha", { ascending: true });
  if (error) throw error;
  return data;
}

export async function suenoDePaciente(pacienteId) {
  if (!estaConfigurado) return demo.suenoDePaciente(pacienteId);
  const { data, error } = await supabase
    .from("registros_sueno")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("fecha", { ascending: true });
  if (error) throw error;
  return data;
}

export async function alertasDePaciente(pacienteId) {
  if (!estaConfigurado) return demo.alertasDePaciente(pacienteId);
  const { data, error } = await supabase
    .from("alertas_sueno")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("creado_en", { ascending: false });
  if (error) throw error;
  return data;
}

export async function tareasDePaciente(pacienteId) {
  if (!estaConfigurado) return demo.tareasDePaciente(pacienteId);
  const { data, error } = await supabase
    .from("tareas")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("creado_en", { ascending: true });
  if (error) throw error;
  return data;
}

export async function crearTarea({ paciente_id, texto }) {
  if (!estaConfigurado) return demo.crearTarea({ paciente_id, texto });
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from("tareas")
    .insert({ paciente_id, asignada_por: user.id, texto })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function citasDePaciente(pacienteId) {
  if (!estaConfigurado) return demo.citasDePaciente(pacienteId);
  const { data, error } = await supabase
    .from("citas")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("fecha", { ascending: true });
  if (error) throw error;
  return data;
}

// Vista del profesional: todas las notas del paciente (RLS controla el acceso).
export async function notasDePaciente(pacienteId) {
  if (!estaConfigurado) return demo.notasDePaciente(pacienteId);
  return listarNotas(pacienteId);
}

// ----------------------------------------------------------------------------
//  PLAN DE SEGURIDAD
// ----------------------------------------------------------------------------
export async function getPlanSeguridad() {
  if (!estaConfigurado) return demo.getPlanSeguridad();
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from("plan_seguridad")
    .select("*")
    .eq("paciente_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data || { senales: "", calma: "", personas: "", motivos: "" };
}

export async function guardarPlanSeguridad(campos) {
  if (!estaConfigurado) return demo.guardarPlanSeguridad(campos);
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from("plan_seguridad")
    .upsert({ paciente_id: user.id, ...campos, actualizado_en: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ----------------------------------------------------------------------------
//  MEDICAMENTOS  (texto libre; nunca métricas corporales)
// ----------------------------------------------------------------------------
export async function listarMedicamentos() {
  if (!estaConfigurado) return demo.listarMedicamentos();
  const { data, error } = await supabase
    .from("medicamentos")
    .select("*")
    .eq("activo", true)
    .order("horario", { ascending: true });
  if (error) throw error;
  return data;
}

export async function crearMedicamento({ nombre, dosis, horario, nota }) {
  if (!estaConfigurado) return demo.crearMedicamento({ nombre, dosis, horario, nota });
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from("medicamentos")
    .insert({ paciente_id: user.id, nombre, dosis, horario, nota })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function eliminarMedicamento(id) {
  if (!estaConfigurado) return demo.eliminarMedicamento(id);
  const { error } = await supabase.from("medicamentos").delete().eq("id", id);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
//  DIARIO (journaling)  ·  espacio privado del paciente
// ----------------------------------------------------------------------------
export async function listarDiario() {
  if (!estaConfigurado) return demo.listarDiario();
  const { data, error } = await supabase
    .from("diario")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) throw error;
  return data;
}

export async function crearEntradaDiario({ sugerencia, texto }) {
  if (!estaConfigurado) return demo.crearEntradaDiario({ sugerencia, texto });
  const user = await usuarioActual();
  const { data, error } = await supabase
    .from("diario")
    .insert({ paciente_id: user.id, sugerencia, texto })
    .select()
    .single();
  if (error) throw error;
  return data;
}
