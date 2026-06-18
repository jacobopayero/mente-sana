// ============================================================================
//  MENTE SERENA — Campos de la ficha clínica / anamnesis (definición central)
//  Se reutiliza en: Mi perfil (paciente), edición del profesional y expediente.
//
//  SALVAGUARDA: ningún campo de peso, IMC, calorías ni medidas corporales.
//  Campos sensibles (abuso, consumo) son OPCIONALES y confidenciales.
//  Los antecedentes y síntomas son MARCAS (datos estructurados) para análisis.
// ============================================================================

export const GRUPOS_FICHA = [
  {
    titulo: "Datos generales",
    campos: [
      { k: "fecha_nacimiento", label: "Fecha de nacimiento", tipo: "date" },
      { k: "genero", label: "Género", tipo: "text", ph: "Cómo se identifica" },
      { k: "estado_civil", label: "Estado civil", tipo: "select", opciones: ["Soltero/a", "En pareja", "Casado/a", "Divorciado/a", "Viudo/a"] },
      { k: "ocupacion", label: "Ocupación", tipo: "text", ph: "A qué se dedica" },
      { k: "escolaridad", label: "Escolaridad", tipo: "select", opciones: ["Primaria", "Secundaria", "Técnico", "Universitario", "Posgrado", "Ninguna"] },
      { k: "convivencia", label: "¿Con quién vive?", tipo: "select", opciones: ["Solo/a", "Con pareja", "Con padres", "Con familia", "Compañeros", "Otro"] },
      { k: "religion", label: "Religión / creencias", tipo: "text", ph: "Opcional" },
      { k: "crianza", label: "Crianza / origen familiar", tipo: "text", ph: "Con ambos padres, con uno, familia extensa, adoptada, institución…" },
    ],
  },
  {
    titulo: "Motivo de consulta",
    campos: [
      { k: "motivo_consulta", label: "¿Qué te trae a consulta?", tipo: "area", ph: "El motivo principal y desde cuándo" },
    ],
  },
  {
    titulo: "Contacto de emergencia",
    campos: [
      { k: "contacto_emergencia", label: "Nombre", tipo: "text", ph: "Ej.: mi mamá, Ana" },
      { k: "contacto_emergencia_tel", label: "Teléfono", tipo: "tel", ph: "Número" },
    ],
  },
  {
    titulo: "Historia psicosocial (anamnesis)",
    nota: "Información sensible y confidencial. Comparte solo lo que desees; tu equipo de cuidado puede ayudarte a completarla.",
    campos: [
      { k: "infancia", label: "Aspectos de la niñez", tipo: "area", ph: "Contexto o eventos relevantes de la infancia" },
      { k: "antecedentes_familiares", label: "Antecedentes familiares (salud mental)", tipo: "area" },
      { k: "abuso", label: "Abuso o trauma (detalle)", tipo: "area", ph: "Opcional" },
      { k: "consumo", label: "Consumo de sustancias (detalle)", tipo: "area", ph: "Opcional" },
      { k: "frecuencia_consumo", label: "Frecuencia de consumo", tipo: "select", opciones: ["No consume", "Ocasional", "Fin de semana", "Semanal", "Diario"] },
      { k: "actividad_fisica", label: "Actividad física / deporte", tipo: "area" },
    ],
  },
  {
    titulo: "Salud",
    campos: [
      { k: "condiciones", label: "Condiciones médicas relevantes", tipo: "area" },
      { k: "alergias", label: "Alergias", tipo: "area", ph: "Medicamentos, alimentos… (o “ninguna”)" },
      { k: "cirugias", label: "Cirugías (incluye estéticas)", tipo: "area" },
      { k: "embarazos", label: "Embarazos / gestaciones (si aplica)", tipo: "area" },
      { k: "tratamientos_previos", label: "Tratamientos previos", tipo: "area" },
    ],
  },
  {
    titulo: "Plan",
    campos: [
      { k: "objetivos", label: "Objetivos de tratamiento", tipo: "area", ph: "Metas acordadas con el equipo" },
      { k: "notas", label: "Otras notas", tipo: "area" },
    ],
  },
];

export const CAMPOS_FICHA = GRUPOS_FICHA.flatMap((g) => g.campos);

// Checklist de antecedentes (marcar los que apliquen) — datos estructurados.
export const GRUPOS_ANTECEDENTES = [
  { titulo: "Salud mental", items: ["Depresión", "Ansiedad", "TCA", "Autolesiones", "Ideación/intento suicida", "Trastorno bipolar", "TOC", "TEPT", "TDAH", "Fobias", "Trastorno límite"] },
  { titulo: "Conducta / control de impulsos", items: ["Cleptomanía", "Mitomanía", "Ludopatía", "Compras compulsivas", "Tricotilomanía", "Piromanía"] },
  { titulo: "Abuso / trauma", items: ["Abuso físico", "Abuso sexual", "Abuso emocional", "Negligencia", "Violencia intrafamiliar", "Acoso/bullying"] },
  { titulo: "Consumo", items: ["Tabaco", "Alcohol", "Cafeína", "Cannabis", "Cocaína", "Medicamentos sin receta", "Otras sustancias"] },
  { titulo: "Médicos", items: ["Cirugías estéticas", "Otras cirugías", "Hospitalizaciones", "Embarazo actual", "Embarazos previos"] },
  { titulo: "Familiares", items: ["Salud mental en la familia", "TCA en la familia"] },
];

// Checklist de síntomas actuales.
export const SINTOMAS = [
  "Insomnio", "Fatiga", "Irritabilidad", "Llanto frecuente", "Aislamiento",
  "Falta de concentración", "Pérdida de interés", "Ansiedad/pánico",
  "Pensamientos intrusivos", "Cambios en el apetito", "Tristeza persistente", "Culpa excesiva",
];

const fechaLegible = (iso) => {
  if (!iso) return "";
  const d = new Date(String(iso).slice(0, 10) + "T00:00:00");
  return d.toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
};

// Devuelve [{label, valor}] solo de los campos con valor (para mostrar).
export function camposConValor(ficha = {}) {
  const res = CAMPOS_FICHA.filter((c) => ficha[c.k]).map((c) => ({
    label: c.label,
    valor: c.tipo === "date" ? fechaLegible(ficha[c.k]) : ficha[c.k],
  }));
  if (ficha.sintomas && ficha.sintomas.length) {
    res.unshift({ label: "Síntomas actuales", valor: ficha.sintomas.join(", ") });
  }
  if (ficha.antecedentes && ficha.antecedentes.length) {
    res.unshift({ label: "Antecedentes", valor: ficha.antecedentes.join(", ") });
  }
  return res;
}

// Checklist de marcas reutilizable.
function Checklist({ titulo, grupos, valores, onToggle }) {
  const sel = new Set(valores || []);
  return (
    <>
      <div className="seccion-titulo" style={{ marginLeft: 0 }}>{titulo}</div>
      {grupos.map((g) => (
        <div key={g.titulo} style={{ marginBottom: 12 }}>
          <div className="meta" style={{ marginBottom: 6, fontWeight: 600 }}>{g.titulo}</div>
          <div className="chips">
            {g.items.map((it) => (
              <button
                type="button"
                key={it}
                className={"chip" + (sel.has(it) ? " activa" : "")}
                onClick={() => onToggle(it)}
              >
                {it}
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function toggleEnLista(lista, item) {
  const s = new Set(lista || []);
  s.has(item) ? s.delete(item) : s.add(item);
  return [...s];
}

// Formulario reutilizable de la ficha (paciente o profesional).
export function CamposFicha({ ficha, setF }) {
  return (
    <>
      <Checklist
        titulo="Antecedentes (marca los que apliquen)"
        grupos={GRUPOS_ANTECEDENTES}
        valores={ficha.antecedentes}
        onToggle={(it) => setF("antecedentes", toggleEnLista(ficha.antecedentes, it))}
      />

      <Checklist
        titulo="Síntomas actuales (marca los que apliquen)"
        grupos={[{ titulo: "Síntomas", items: SINTOMAS }]}
        valores={ficha.sintomas}
        onToggle={(it) => setF("sintomas", toggleEnLista(ficha.sintomas, it))}
      />

      {GRUPOS_FICHA.map((g) => (
        <div key={g.titulo}>
          <div className="seccion-titulo" style={{ marginLeft: 0 }}>{g.titulo}</div>
          {g.nota && <p className="sub" style={{ marginTop: 0 }}>{g.nota}</p>}
          {g.campos.map((c) => (
            <div className="campo" key={c.k}>
              <label>{c.label}</label>
              {c.tipo === "area" ? (
                <textarea value={ficha[c.k] || ""} onChange={(e) => setF(c.k, e.target.value)} placeholder={c.ph || ""} />
              ) : c.tipo === "select" ? (
                <select value={ficha[c.k] || ""} onChange={(e) => setF(c.k, e.target.value)}>
                  <option value="">Seleccionar…</option>
                  {c.opciones.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input type={c.tipo} value={ficha[c.k] || ""} onChange={(e) => setF(c.k, e.target.value)} placeholder={c.ph || ""} />
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
