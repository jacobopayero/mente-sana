// ============================================================================
//  MODO DEMO — almacenamiento local (localStorage)
//  Reproduce el comportamiento de la capa de datos sin necesidad de Supabase.
//  Pensado SOLO para revisar la interfaz: los datos viven en este navegador.
//
//  Respeta las mismas salvaguardas: no hay calorías, peso ni métricas
//  corporales; el sueño es solo calidad cualitativa y rango.
// ============================================================================

const CLAVE = "mente-serena-demo";
const hoy = () => new Date().toISOString().slice(0, 10);
const diasAtras = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const id = () =>
  (crypto.randomUUID && crypto.randomUUID()) ||
  String(Date.now() + Math.random());

// ---- Datos de ejemplo (semilla) -------------------------------------------
function semilla() {
  const paciente = { id: "demo-paciente", email: "paciente@demo", nombre: "Tú", rol: "paciente", foto_url: "" };
  const terapeuta = {
    id: "demo-terapeuta",
    nombre: "Alexandra García",
    nombre_formal: "Cecilia Alexandra García H.",
    titulo: "Lic.",
    rol: "terapeuta",
    principal: true, // médico principal del caso
    tipo: "master", // master | colaborador
    perfiles_profesional: [
      {
        especialidad: "Familiar y de pareja · TCA",
        credenciales: "Máster en TCA y Psicología Clínica",
        color_hex: "#5E7560",
      },
    ],
  };
  // Psiquiatras del caso.
  const psiquiatraMusa = {
    id: "demo-psiquiatra-musa",
    nombre: "Musa",
    nombre_formal: "Musa",
    titulo: "Dr.",
    rol: "psiquiatra",
    tipo: "colaborador",
    perfiles_profesional: [
      { especialidad: "Especialista en TCA", credenciales: "Médico Psiquiatra", color_hex: "#6d6a9e" },
    ],
  };
  const psiquiatraRodriguez = {
    id: "demo-psiquiatra-rodriguez",
    nombre: "Rodríguez",
    nombre_formal: "Rodríguez",
    titulo: "Dr.",
    rol: "psiquiatra",
    tipo: "colaborador",
    perfiles_profesional: [
      { especialidad: "Especialista en TCA", credenciales: "Médico Psiquiatra", color_hex: "#7a6fa6" },
    ],
  };

  // Médico "central" / dirección de la app (HQ).
  const central = {
    id: "demo-central",
    nombre: "Dirección Aura",
    nombre_formal: "Dirección clínica",
    titulo: "",
    rol: "admin",
    email: "central@demo",
  };

  return {
    sesion: null, // se llena al iniciar sesión
    perfil: paciente,
    equipo: [terapeuta, psiquiatraMusa, psiquiatraRodriguez],
    central,
    // Autorizaciones que el médico master concede a colaboradores.
    autorizaciones: { [psiquiatraMusa.id]: true, [psiquiatraRodriguez.id]: false },
    numero_asociado: "",
    teleconsultas: [
      {
        id: id(),
        paciente_nombre: paciente.nombre,
        profesional_nombre: "Terapeuta Alexandra García",
        fecha: diasAtras(5),
        duracion_min: 45,
        estado: "registrada",
        grabacion: false,
        nota: "Sesión individual de seguimiento.",
      },
    ],
    recetas: [
      {
        id: id(),
        paciente_id: paciente.id,
        profesional_nombre: "Dr. Musa",
        medicamento: "Sertralina",
        dosis: "50 mg",
        frecuencia: "1 vez al día",
        indicaciones: "Con el desayuno. No suspender sin indicación.",
        fecha: diasAtras(5),
      },
    ],
    registros_animo: [
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(4), animo: 3, emociones: ["calma"], nota: "Día tranquilo." },
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(2), animo: 4, emociones: ["esperanza", "calma"], nota: "" },
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(1), animo: 2, emociones: ["ansiedad"], nota: "Tarde difícil, usé la respiración." },
    ],
    registros_sueno: [
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(2), calidad: "reparador", rango: 2, nota: "", origen: "manual" },
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(1), calidad: "regular", rango: 1, nota: "Me costó dormir.", origen: "manual" },
    ],
    alertas_sueno: [],
    citas: [
      { id: id(), paciente_id: paciente.id, profesional_id: terapeuta.id, fecha: diasAtras(-3), hora: "16:00", modalidad: "Videollamada", tipo: "Individual", estado: "agendada" },
    ],
    tareas: [
      { id: id(), paciente_id: paciente.id, asignada_por: terapeuta.id, texto: "Anotar un momento amable contigo cada día.", completada: false, creado_en: diasAtras(3) },
      { id: id(), paciente_id: paciente.id, asignada_por: terapeuta.id, texto: "Practicar la respiración 4-7-8 al despertar.", completada: true, creado_en: diasAtras(5) },
    ],
    notas_coordinacion: [
      { id: id(), paciente_id: paciente.id, autor_id: terapeuta.id, categoria: "Evolucion", texto: "Buen avance esta semana. Sigamos con calma.", visible_paciente: true, creado_en: diasAtras(2) },
    ],
    plan_seguridad: { paciente_id: paciente.id, senales: "", calma: "", personas: "", motivos: "" },
    ficha_clinica: {
      paciente_id: paciente.id,
      antecedentes: [],
      sintomas: [],
      fecha_nacimiento: "",
      genero: "",
      contacto_emergencia: "",
      contacto_emergencia_tel: "",
      alergias: "",
      condiciones: "",
      tratamientos_previos: "",
      notas: "",
    },
    diario: [
      { id: id(), paciente_id: paciente.id, sugerencia: "¿Qué necesité hoy?", texto: "Necesité ir más despacio y pedir ayuda. Lo hice.", creado_en: diasAtras(3) },
    ],
    // Registro de referidos (profesional → profesional). Ej.: el Dr. Musa
    // refirió a la paciente a la terapeuta.
    referidos: [
      {
        id: id(),
        paciente_nombre: paciente.nombre,
        referido_por_id: psiquiatraMusa.id,
        referido_por_nombre: "Dr. Musa",
        hacia_id: terapeuta.id,
        hacia_nombre: "Lic. Alexandra García",
        nota: "Derivación para terapia familiar/TCA.",
        fecha: diasAtras(20),
      },
    ],
    medicamentos: [
      { id: id(), paciente_id: paciente.id, nombre: "Sertralina", dosis: "1 tableta", horario: "08:00", nota: "Con el desayuno", activo: true, creado_en: diasAtras(10) },
    ],
    recursos: [
      { id: id(), tipo: "motivacion", titulo: "Un paso a la vez", descripcion: "Recordatorio para los días difíciles.", texto: "Sanar no es lineal. Cada día que lo intentas, cuenta.", creado_en: diasAtras(6) },
      { id: id(), tipo: "instructivo", titulo: "Respiración 4-7-8", descripcion: "Una herramienta para momentos de ansiedad.", texto: "Inhala 4 segundos, sostén 7, exhala 8. Repite 4 veces.", creado_en: diasAtras(6) },
      { id: id(), tipo: "enlace", titulo: "¿Qué es la terapia familiar?", descripcion: "Lectura breve.", url: "https://example.org", creado_en: diasAtras(7) },
    ],
  };
}

function leer() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) return JSON.parse(guardado);
  } catch (_) {
    /* ignore */
  }
  const inicial = semilla();
  escribir(inicial);
  return inicial;
}

function escribir(db) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(db));
  } catch (_) {
    /* ignore */
  }
}

function actualizar(fn) {
  const db = leer();
  fn(db);
  escribir(db);
  return db;
}

// ---- API demo (mismas firmas que api.js) ----------------------------------
export const demo = {
  // Auth
  async registrarse({ email, nombre }) {
    return actualizar((db) => {
      db.perfil = { ...db.perfil, email, nombre };
      db.sesion = { user: { id: db.perfil.id, email }, rol: "paciente" };
    }).sesion;
  },
  async iniciarSesion({ email }) {
    return actualizar((db) => {
      db.sesion = { user: { id: db.perfil.id, email: email || db.perfil.email }, rol: "paciente" };
    }).sesion;
  },
  // Solo demo: entrar como 'paciente', 'terapeuta' o 'psiquiatra'.
  // ('profesional' se mantiene como alias de 'terapeuta').
  async iniciarSesionComo(rol) {
    return actualizar((db) => {
      if (rol === "admin" || rol === "central") {
        db.sesion = { user: { id: db.central.id, email: db.central.email }, rol: "admin", profId: db.central.id };
        return;
      }
      const buscado = rol === "profesional" ? "terapeuta" : rol;
      const pro = db.equipo.find((p) => p.rol === buscado);
      if (pro) {
        db.sesion = { user: { id: pro.id, email: `${buscado}@demo` }, rol: "profesional", profId: pro.id };
      } else {
        db.sesion = { user: { id: db.perfil.id, email: db.perfil.email }, rol: "paciente" };
      }
    }).sesion;
  },
  async cerrarSesion() {
    actualizar((db) => {
      db.sesion = null;
    });
  },
  async usuarioActual() {
    return leer().sesion?.user || null;
  },
  async miPerfil() {
    const db = leer();
    if (!db.sesion) return null;
    if (db.sesion.rol === "admin") {
      return { ...db.central };
    }
    if (db.sesion.rol === "profesional") {
      const pro = db.equipo.find((p) => p.id === db.sesion.profId) || db.equipo[0];
      return {
        id: pro.id,
        nombre: pro.nombre,
        nombre_formal: pro.nombre_formal,
        titulo: pro.titulo,
        rol: pro.rol, // 'terapeuta' o 'psiquiatra'
        tipo: pro.tipo || "master", // master | colaborador
        email: db.sesion.user.email,
      };
    }
    return db.perfil;
  },
  async miEquipo() {
    return leer().equipo;
  },

  // Ánimo
  async listarAnimo() {
    return [...leer().registros_animo].sort((a, b) => a.fecha.localeCompare(b.fecha));
  },
  async guardarAnimo({ fecha, animo, emociones, nota }) {
    let guardado;
    actualizar((db) => {
      const i = db.registros_animo.findIndex((r) => r.fecha === fecha);
      const base = { paciente_id: db.perfil.id, fecha, animo, emociones, nota };
      if (i >= 0) {
        db.registros_animo[i] = { ...db.registros_animo[i], ...base };
        guardado = db.registros_animo[i];
      } else {
        guardado = { id: id(), ...base };
        db.registros_animo.push(guardado);
      }
    });
    return guardado;
  },

  // Sueño
  async listarSueno() {
    return [...leer().registros_sueno].sort((a, b) => a.fecha.localeCompare(b.fecha));
  },
  async guardarSueno({ fecha, calidad, rango, nota, origen = "manual" }) {
    let guardado;
    actualizar((db) => {
      const i = db.registros_sueno.findIndex((r) => r.fecha === fecha);
      const base = { paciente_id: db.perfil.id, fecha, calidad, rango, nota, origen };
      if (i >= 0) {
        db.registros_sueno[i] = { ...db.registros_sueno[i], ...base };
        guardado = db.registros_sueno[i];
      } else {
        guardado = { id: id(), ...base };
        db.registros_sueno.push(guardado);
      }
    });
    return guardado;
  },
  async registrarAlertaSueno({ motivo, respuesta }) {
    actualizar((db) => {
      db.alertas_sueno.push({ id: id(), paciente_id: db.perfil.id, fecha: hoy(), motivo, respuesta });
    });
  },

  // Citas
  async listarCitas() {
    return [...leer().citas].sort((a, b) => a.fecha.localeCompare(b.fecha));
  },
  async crearCita({ profesional_id, fecha, hora, modalidad, tipo }) {
    let guardado;
    actualizar((db) => {
      guardado = {
        id: id(),
        paciente_id: db.perfil.id,
        profesional_id: profesional_id || db.equipo[0]?.id,
        fecha,
        hora,
        modalidad,
        tipo,
        estado: "agendada",
      };
      db.citas.push(guardado);
    });
    return guardado;
  },
  async cancelarCita(citaId) {
    actualizar((db) => {
      db.citas = db.citas.filter((c) => c.id !== citaId);
    });
  },

  // Tareas
  async listarTareas() {
    return [...leer().tareas].sort((a, b) => (a.creado_en || "").localeCompare(b.creado_en || ""));
  },
  async marcarTarea(tareaId, completada) {
    actualizar((db) => {
      const t = db.tareas.find((x) => x.id === tareaId);
      if (t) t.completada = completada;
    });
  },

  // Notas
  async listarNotas() {
    return leer()
      .notas_coordinacion.filter((n) => n.visible_paciente)
      .sort((a, b) => (b.creado_en || "").localeCompare(a.creado_en || ""));
  },

  // Recursos
  async listarRecursos() {
    return [...leer().recursos].sort((a, b) => (b.creado_en || "").localeCompare(a.creado_en || ""));
  },
  async crearRecurso(recurso) {
    let guardado;
    actualizar((db) => {
      guardado = { id: id(), creado_por: db.equipo[0]?.id, creado_en: hoy(), ...recurso };
      db.recursos.push(guardado);
    });
    return guardado;
  },

  // ---- Panel del profesional ----------------------------------------------
  async misPacientes() {
    const db = leer();
    // Colaborador sin autorización del master → no ve pacientes.
    const profId = db.sesion?.profId;
    const pro = db.equipo.find((p) => p.id === profId);
    if (pro && pro.tipo === "colaborador" && db.autorizaciones?.[profId] !== true) {
      return [];
    }
    const ref = (db.referidos || []).find((r) => r.paciente_nombre === db.perfil.nombre);
    return [
      {
        id: db.perfil.id,
        nombre: db.perfil.nombre,
        email: db.perfil.email,
        foto_url: db.perfil.foto_url,
        referido_por_nombre: ref?.referido_por_nombre || "",
      },
    ];
  },
  async animoDePaciente(pid) {
    return leer()
      .registros_animo.filter((r) => r.paciente_id === pid)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  },
  async suenoDePaciente(pid) {
    return leer()
      .registros_sueno.filter((r) => r.paciente_id === pid)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  },
  async alertasDePaciente(pid) {
    return leer()
      .alertas_sueno.filter((r) => r.paciente_id === pid)
      .sort((a, b) => (b.creado_en || "").localeCompare(a.creado_en || ""));
  },
  async tareasDePaciente(pid) {
    return leer()
      .tareas.filter((r) => r.paciente_id === pid)
      .sort((a, b) => (a.creado_en || "").localeCompare(b.creado_en || ""));
  },
  async crearTarea({ paciente_id, texto }) {
    let guardado;
    actualizar((db) => {
      guardado = {
        id: id(),
        paciente_id,
        asignada_por: db.equipo[0]?.id,
        texto,
        completada: false,
        creado_en: hoy(),
      };
      db.tareas.push(guardado);
    });
    return guardado;
  },
  async citasDePaciente(pid) {
    return leer()
      .citas.filter((r) => r.paciente_id === pid)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  },
  // Vista del profesional: todas las notas del paciente (incluidas las internas)
  async notasDePaciente(pid) {
    return leer()
      .notas_coordinacion.filter((n) => n.paciente_id === pid)
      .sort((a, b) => (b.creado_en || "").localeCompare(a.creado_en || ""));
  },
  async crearNota({ paciente_id, categoria, texto, visible_paciente = false }) {
    let guardado;
    actualizar((db) => {
      guardado = {
        id: id(),
        paciente_id,
        autor_id: db.equipo[0]?.id,
        categoria,
        texto,
        visible_paciente,
        creado_en: hoy(),
      };
      db.notas_coordinacion.push(guardado);
    });
    return guardado;
  },

  // ---- Plan de seguridad ----------------------------------------------------
  async getPlanSeguridad() {
    const db = leer();
    return db.plan_seguridad || { senales: "", calma: "", personas: "", motivos: "" };
  },
  async guardarPlanSeguridad(campos) {
    let guardado;
    actualizar((db) => {
      db.plan_seguridad = { ...(db.plan_seguridad || {}), paciente_id: db.perfil.id, ...campos };
      guardado = db.plan_seguridad;
    });
    return guardado;
  },

  // ---- Medicamentos ---------------------------------------------------------
  async listarMedicamentos() {
    return [...leer().medicamentos].filter((m) => m.activo);
  },
  async crearMedicamento({ nombre, dosis, horario, nota }) {
    let guardado;
    actualizar((db) => {
      guardado = {
        id: id(),
        paciente_id: db.perfil.id,
        nombre,
        dosis,
        horario,
        nota,
        activo: true,
        creado_en: hoy(),
      };
      db.medicamentos.push(guardado);
    });
    return guardado;
  },
  async eliminarMedicamento(medId) {
    actualizar((db) => {
      db.medicamentos = db.medicamentos.filter((m) => m.id !== medId);
    });
  },
  async medicamentosDePaciente(pid) {
    return leer().medicamentos.filter((m) => m.paciente_id === pid && m.activo);
  },

  // ---- Master / colaboradores (autorización de acceso) ---------------------
  async listarColaboradores() {
    const db = leer();
    return db.equipo
      .filter((p) => p.tipo === "colaborador")
      .map((p) => ({
        id: p.id,
        nombre: `${p.titulo ? p.titulo + " " : ""}${p.nombre}`,
        rol: p.rol,
        autorizado: db.autorizaciones?.[p.id] === true,
      }));
  },
  async autorizarColaborador(colaboradorId, autorizado) {
    actualizar((db) => {
      if (!db.autorizaciones) db.autorizaciones = {};
      db.autorizaciones[colaboradorId] = autorizado;
    });
    return { colaboradorId, autorizado };
  },

  // ---- Recetario (el médico envía recetas al paciente) ---------------------
  async listarRecetas() {
    // Vista del paciente: sus recetas.
    return [...(leer().recetas || [])].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  },
  async recetasDePaciente(pid) {
    return [...(leer().recetas || [])]
      .filter((r) => r.paciente_id === pid)
      .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  },
  async crearReceta({ paciente_id, medicamento, dosis, frecuencia, indicaciones }) {
    let g;
    actualizar((db) => {
      const yo = db.equipo.find((p) => p.id === db.sesion?.profId);
      const nombrePro = yo ? `${yo.titulo ? yo.titulo + " " : ""}${yo.nombre}` : "Profesional";
      g = {
        id: id(),
        paciente_id: paciente_id || db.perfil.id,
        profesional_nombre: nombrePro,
        medicamento,
        dosis,
        frecuencia,
        indicaciones,
        fecha: hoy(),
      };
      if (!db.recetas) db.recetas = [];
      db.recetas.push(g);
    });
    return g;
  },

  // ---- Teleconsulta (número asociado + registro de llamadas) ---------------
  async getNumeroAsociado() {
    return leer().numero_asociado || "";
  },
  async setNumeroAsociado(numero) {
    actualizar((db) => {
      db.numero_asociado = numero;
    });
    return numero;
  },
  async listarTeleconsultas() {
    return [...(leer().teleconsultas || [])].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  },
  async crearTeleconsulta({ paciente_nombre, nota }) {
    let g;
    actualizar((db) => {
      const yo = db.equipo.find((p) => p.id === db.sesion?.profId);
      const nombrePro = yo ? `${yo.titulo ? yo.titulo + " " : ""}${yo.nombre}` : "Profesional";
      g = {
        id: id(),
        paciente_nombre,
        profesional_nombre: nombrePro,
        fecha: hoy(),
        duracion_min: 0,
        estado: "registrada",
        grabacion: false, // requiere integración telefónica para grabar
        nota: nota || "",
      };
      if (!db.teleconsultas) db.teleconsultas = [];
      db.teleconsultas.push(g);
    });
    return g;
  },

  // ---- Panorama de la central (HQ) -----------------------------------------
  async panoramaAdmin() {
    const db = leer();
    return {
      profesionales: db.equipo,
      pacientes: [{ id: db.perfil.id, nombre: db.perfil.nombre, email: db.perfil.email, foto_url: db.perfil.foto_url }],
      referidos: db.referidos || [],
      teleconsultas: db.teleconsultas || [],
      numero_asociado: db.numero_asociado || "",
    };
  },

  // ---- Referidos (profesional → profesional) -------------------------------
  async listarReferidos() {
    const db = leer();
    const profId = db.sesion?.profId;
    return (db.referidos || [])
      .filter((r) => !profId || r.referido_por_id === profId || r.hacia_id === profId)
      .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  },
  async crearReferido({ paciente_nombre, hacia_id, nota }) {
    let g;
    actualizar((db) => {
      const yo = db.equipo.find((p) => p.id === db.sesion?.profId);
      const hacia = db.equipo.find((p) => p.id === hacia_id);
      const nombrePro = (p) => (p ? `${p.titulo ? p.titulo + " " : ""}${p.nombre}` : "");
      g = {
        id: id(),
        paciente_nombre,
        referido_por_id: yo?.id,
        referido_por_nombre: nombrePro(yo),
        hacia_id,
        hacia_nombre: nombrePro(hacia),
        nota: nota || "",
        fecha: hoy(),
      };
      if (!db.referidos) db.referidos = [];
      db.referidos.push(g);
    });
    return g;
  },

  // ---- Perfil y ficha clínica ----------------------------------------------
  async actualizarMiPerfil(campos) {
    let p;
    actualizar((db) => {
      db.perfil = { ...db.perfil, ...campos };
      p = db.perfil;
    });
    return p;
  },
  async getFichaClinica() {
    return leer().ficha_clinica || {};
  },
  async guardarFichaClinica(campos) {
    let f;
    actualizar((db) => {
      db.ficha_clinica = { ...(db.ficha_clinica || {}), paciente_id: db.perfil.id, ...campos };
      f = db.ficha_clinica;
    });
    return f;
  },
  async fichaDePaciente() {
    // En demo solo hay un paciente.
    return leer().ficha_clinica || {};
  },

  // ---- Diario ---------------------------------------------------------------
  async listarDiario() {
    return [...(leer().diario || [])].sort((a, b) => (b.creado_en || "").localeCompare(a.creado_en || ""));
  },
  async crearEntradaDiario({ sugerencia, texto }) {
    let guardado;
    actualizar((db) => {
      if (!db.diario) db.diario = [];
      guardado = { id: id(), paciente_id: db.perfil.id, sugerencia, texto, creado_en: new Date().toISOString() };
      db.diario.push(guardado);
    });
    return guardado;
  },
};
