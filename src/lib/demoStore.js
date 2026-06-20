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
  const paciente = { id: "demo-paciente", email: "paciente@demo", nombre: "Jacobo Payero", rol: "paciente", foto_url: "", telefono: "809-555-0123" };
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
  // Psiquiatra colaboradora del caso.
  const psiquiatra = {
    id: "demo-psiquiatra-cindy",
    nombre: "Cindy Rodríguez",
    nombre_formal: "Cindy Rodríguez",
    titulo: "Dra.",
    rol: "psiquiatra",
    tipo: "colaborador",
    perfiles_profesional: [
      { especialidad: "Especialista en TCA", credenciales: "Médico Psiquiatra", color_hex: "#6d6a9e" },
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

  // Asistente / secretaria del médico (acceso limitado).
  const asistente = {
    id: "demo-asistente",
    nombre: "Carolina Méndez",
    nombre_formal: "Carolina Méndez (Asistente)",
    titulo: "",
    rol: "asistente",
    email: "asistente@demo",
  };

  return {
    sesion: null, // se llena al iniciar sesión
    perfil: paciente,
    equipo: [terapeuta, psiquiatra],
    central,
    asistente,
    // Autorizaciones que el médico master concede a colaboradores.
    autorizaciones: { [psiquiatra.id]: true },
    // Permisos del/los asistente(s): acceso y si puede "sellar" indicaciones.
    asistentes_perm: { [asistente.id]: { autorizado: true, sellar: false } },
    // Contabilidad: tarifa por consulta del colaborador y pagos registrados.
    tarifas: { [psiquiatra.id]: 25 },
    pagos: [
      { id: id(), profesional_id: psiquiatra.id, profesional_nombre: "Dra. Cindy Rodríguez", paciente_nombre: paciente.nombre, monto: 25, fecha: diasAtras(5) },
    ],
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
        profesional_nombre: "Dra. Cindy Rodríguez",
        medicamento: "Sertralina",
        dosis: "50 mg",
        frecuencia: "1 vez al día",
        indicaciones: "Con el desayuno. No suspender sin indicación.",
        fecha: diasAtras(5),
        sellada: true,
      },
      {
        id: id(),
        paciente_id: paciente.id,
        profesional_nombre: "Dra. Cindy Rodríguez",
        medicamento: "Melatonina",
        dosis: "3 mg",
        frecuencia: "1 vez en la noche",
        indicaciones: "30 minutos antes de dormir, por 2 semanas.",
        fecha: diasAtras(6),
        sellada: false,
      },
    ],
    registros_animo: [
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(9), animo: 2, emociones: ["ansiedad", "cansancio"], nota: "Semana pesada en el trabajo." },
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(8), animo: 2, emociones: ["tristeza"], nota: "" },
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(7), animo: 3, emociones: ["calma"], nota: "Caminé un rato, me ayudó." },
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(5), animo: 3, emociones: ["esperanza"], nota: "" },
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(4), animo: 4, emociones: ["esperanza", "gratitud"], nota: "Buena charla con Daniela." },
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(2), animo: 2, emociones: ["ansiedad", "miedo"], nota: "Discusión; me costó calmarme." },
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(1), animo: 3, emociones: ["calma"], nota: "Usé la respiración 4-7-8." },
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(0), animo: 4, emociones: ["esperanza", "calma"], nota: "Hoy me sentí más estable." },
    ],
    registros_sueno: [
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(4), calidad: "inquieto", rango: 0, nota: "Me desperté varias veces.", origen: "manual" },
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(3), calidad: "inquieto", rango: 1, nota: "Costó dormir.", origen: "manual" },
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(2), calidad: "regular", rango: 2, nota: "", origen: "manual" },
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(1), calidad: "reparador", rango: 3, nota: "Dormí bien.", origen: "manual" },
      { id: id(), paciente_id: paciente.id, fecha: diasAtras(0), calidad: "regular", rango: 2, nota: "", origen: "manual" },
    ],
    alertas_sueno: [
      { id: id(), paciente_id: paciente.id, motivo: "2 noches de descanso pobre", respuesta: "Se ofreció calma; el paciente pidió aviso al equipo", creado_en: diasAtras(3) },
    ],
    citas: [
      { id: id(), paciente_id: paciente.id, profesional_id: terapeuta.id, fecha: diasAtras(7), hora: "10:00", modalidad: "Presencial", tipo: "Individual", estado: "completada" },
      { id: id(), paciente_id: paciente.id, profesional_id: terapeuta.id, fecha: diasAtras(-3), hora: "16:00", modalidad: "Videollamada", tipo: "Pareja", estado: "agendada" },
      { id: id(), paciente_id: paciente.id, profesional_id: psiquiatra.id, fecha: diasAtras(-9), hora: "11:30", modalidad: "Presencial", tipo: "Individual", estado: "agendada" },
    ],
    tareas: [
      { id: id(), paciente_id: paciente.id, asignada_por: terapeuta.id, texto: "Anotar un momento amable contigo cada día.", completada: false, creado_en: diasAtras(3) },
      { id: id(), paciente_id: paciente.id, asignada_por: terapeuta.id, texto: "Practicar la respiración 4-7-8 al despertar.", completada: true, creado_en: diasAtras(5) },
      { id: id(), paciente_id: paciente.id, asignada_por: terapeuta.id, texto: "Conversar 15 min con Daniela sin pantallas.", completada: false, creado_en: diasAtras(2) },
      { id: id(), paciente_id: paciente.id, asignada_por: terapeuta.id, texto: "Apagar pantallas 1 hora antes de dormir.", completada: true, creado_en: diasAtras(6) },
    ],
    notas_coordinacion: [
      { id: id(), paciente_id: paciente.id, autor_id: terapeuta.id, categoria: "Evolucion", texto: "Buen avance esta semana. Sigamos con calma.", visible_paciente: true, creado_en: diasAtras(2) },
      { id: id(), paciente_id: paciente.id, autor_id: terapeuta.id, categoria: "Observacion", texto: "Ansiedad ligada a conflicto de pareja; trabajar comunicación. Coordinar con psiquiatría dosis de sertralina.", visible_paciente: false, creado_en: diasAtras(4) },
      { id: id(), paciente_id: paciente.id, autor_id: psiquiatra.id, categoria: "Medicacion", texto: "Mantener sertralina 50 mg; reevaluar en 4 semanas.", visible_paciente: false, creado_en: diasAtras(5) },
    ],
    plan_seguridad: {
      paciente_id: paciente.id,
      senales: "Aislarme, insomnio, pensamientos muy autocríticos.",
      calma: "Respiración 4-7-8, caminar, hablar con Daniela, música.",
      personas: "Daniela (pareja), mi hermana Sofía, Lic. Alexandra.",
      motivos: "Mi pareja, mi proyecto profesional, mi perro Toby.",
    },
    ficha_clinica: {
      paciente_id: paciente.id,
      antecedentes: ["Ansiedad", "Depresión", "Salud mental en la familia"],
      sintomas: ["Insomnio", "Ansiedad/pánico", "Tristeza persistente", "Falta de concentración", "Irritabilidad"],
      sistema_familiar: [
        { nombre: "Rosa", parentesco: "Madre", edad: "58", nota: "Muy cercana; sobreprotectora." },
        { nombre: "Luis", parentesco: "Padre", edad: "60", nota: "Relación distante; trabajo absorbente." },
        { nombre: "Sofía", parentesco: "Hermana", edad: "26", nota: "Buen vínculo, red de apoyo." },
        { nombre: "Daniela", parentesco: "Pareja/Cónyuge", edad: "28", nota: "Conviven; conflictos de comunicación." },
      ],
      fecha_nacimiento: "1996-04-12",
      genero: "Masculino",
      estado_civil: "En pareja",
      ocupacion: "Diseñador/a",
      escolaridad: "Universitario",
      convivencia: "Con pareja",
      religion: "Católico",
      crianza: "Con ambos padres",
      motivo_consulta: "Ansiedad y bajo estado de ánimo tras estrés laboral; dificultad para dormir desde hace 3 meses.",
      infancia: "Infancia estable con alta exigencia académica. Padre ausente por trabajo.",
      antecedentes_familiares: "Madre con depresión; abuelo materno con alcoholismo.",
      abuso: "Niega abuso. Episodio de bullying en secundaria.",
      consumo_sustancias: ["Alcohol", "Cafeína"],
      consumo_combinado: false,
      frecuencia_consumo: "Fin de semana",
      actividad_fisica: "Camina ocasionalmente; sin rutina fija.",
      condiciones: "Ninguna relevante.",
      alergias: "Ninguna.",
      cirugias: "Ninguna.",
      embarazos: "",
      tratamientos_previos: "Terapia individual en 2022 (6 meses).",
      objetivos: "Reducir la ansiedad, recuperar el sueño y mejorar la comunicación de pareja.",
      notas: "Motivado al cambio; buen insight.",
      riesgo: "Moderado",
      riesgo_nota: "Ideación pasiva ocasional, sin plan ni intención. Reevaluar en cada sesión.",
    },
    diario: [
      { id: id(), paciente_id: paciente.id, sugerencia: "¿Qué necesité hoy?", texto: "Necesité ir más despacio y pedir ayuda. Lo hice.", creado_en: diasAtras(6) },
      { id: id(), paciente_id: paciente.id, sugerencia: "Algo que me costó hoy y cómo lo afronté.", texto: "Discutí con Daniela; respiré antes de responder y bajó la tensión.", creado_en: diasAtras(2) },
      { id: id(), paciente_id: paciente.id, sugerencia: "¿De qué me siento agradecido, aunque sea pequeño?", texto: "De que dormí mejor anoche y de mi hermana.", creado_en: diasAtras(1) },
    ],
    // Registro de referidos (profesional → profesional). Ej.: la Dra. Cindy
    // Rodríguez refirió al paciente a la terapeuta.
    referidos: [
      {
        id: id(),
        paciente_nombre: paciente.nombre,
        referido_por_id: psiquiatra.id,
        referido_por_nombre: "Dra. Cindy Rodríguez",
        hacia_id: terapeuta.id,
        hacia_nombre: "Lic. Alexandra García",
        nota: "Derivación para terapia familiar/TCA.",
        fecha: diasAtras(20),
      },
    ],
    medicamentos: [
      { id: id(), paciente_id: paciente.id, nombre: "Sertralina", dosis: "1 tableta (50 mg)", horario: "08:00", nota: "Con el desayuno", activo: true, creado_en: diasAtras(10) },
      { id: id(), paciente_id: paciente.id, nombre: "Melatonina", dosis: "1 tableta (3 mg)", horario: "22:00", nota: "30 min antes de dormir", activo: true, creado_en: diasAtras(6) },
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
      if (rol === "asistente") {
        db.sesion = { user: { id: db.asistente.id, email: db.asistente.email }, rol: "asistente", profId: db.asistente.id };
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
    if (db.sesion.rol === "asistente") {
      return { ...db.asistente };
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

  // ---- Contabilidad / informe de colaboradores -----------------------------
  async informeColaboradores() {
    const db = leer();
    const refer = (proId) => (db.referidos || []).filter((r) => r.referido_por_id === proId).length;
    return db.equipo
      .filter((p) => p.tipo === "colaborador")
      .map((p) => {
        const pagos = (db.pagos || []).filter((x) => x.profesional_id === p.id);
        return {
          id: p.id,
          nombre: `${p.titulo ? p.titulo + " " : ""}${p.nombre}`,
          referidos: refer(p.id),
          precio_consulta: db.tarifas?.[p.id] ?? 0,
          consultas: pagos.length,
          total: pagos.reduce((a, b) => a + (Number(b.monto) || 0), 0),
        };
      });
  },
  async setPrecioConsulta(colaboradorId, precio) {
    actualizar((db) => {
      if (!db.tarifas) db.tarifas = {};
      db.tarifas[colaboradorId] = Number(precio) || 0;
    });
  },
  async colaboradoresParaPago() {
    const db = leer();
    return db.equipo
      .filter((p) => p.tipo === "colaborador")
      .map((p) => ({ id: p.id, nombre: `${p.titulo ? p.titulo + " " : ""}${p.nombre}`, precio: db.tarifas?.[p.id] ?? 0 }));
  },
  async listarPagos() {
    return [...(leer().pagos || [])].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  },
  async registrarPago({ profesional_id, paciente_nombre, monto }) {
    let g;
    actualizar((db) => {
      const pro = db.equipo.find((p) => p.id === profesional_id);
      g = {
        id: id(),
        profesional_id,
        profesional_nombre: pro ? `${pro.titulo ? pro.titulo + " " : ""}${pro.nombre}` : "",
        paciente_nombre,
        monto: Number(monto) || 0,
        fecha: hoy(),
      };
      if (!db.pagos) db.pagos = [];
      db.pagos.push(g);
    });
    return g;
  },

  // ---- Asistente / secretaria (acceso limitado) ----------------------------
  async listarAsistentes() {
    const db = leer();
    const perm = db.asistentes_perm || {};
    const a = db.asistente;
    return a
      ? [{ id: a.id, nombre: a.nombre, autorizado: perm[a.id]?.autorizado === true, sellar: perm[a.id]?.sellar === true }]
      : [];
  },
  async autorizarAsistente(asistenteId, autorizado) {
    actualizar((db) => {
      if (!db.asistentes_perm) db.asistentes_perm = {};
      db.asistentes_perm[asistenteId] = { ...(db.asistentes_perm[asistenteId] || {}), autorizado };
    });
  },
  async permitirSellar(asistenteId, sellar) {
    actualizar((db) => {
      if (!db.asistentes_perm) db.asistentes_perm = {};
      db.asistentes_perm[asistenteId] = { ...(db.asistentes_perm[asistenteId] || {}), sellar };
    });
  },
  async miPermisoAsistente() {
    const db = leer();
    const id = db.sesion?.profId;
    return db.asistentes_perm?.[id] || { autorizado: false, sellar: false };
  },
  // Solo datos de contacto del/los paciente(s).
  async contactosPacientes() {
    const db = leer();
    return [{ id: db.perfil.id, nombre: db.perfil.nombre, email: db.perfil.email, telefono: db.perfil.telefono || "" }];
  },
  async crearCitaPara({ paciente_id, profesional_id, fecha, hora, modalidad, tipo }) {
    let g;
    actualizar((db) => {
      g = {
        id: id(),
        paciente_id: paciente_id || db.perfil.id,
        profesional_id: profesional_id || db.equipo[0]?.id,
        fecha,
        hora,
        modalidad,
        tipo,
        estado: "agendada",
      };
      db.citas.push(g);
    });
    return g;
  },
  async sellarReceta(recetaId) {
    actualizar((db) => {
      const r = (db.recetas || []).find((x) => x.id === recetaId);
      if (r) r.sellada = true;
    });
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
