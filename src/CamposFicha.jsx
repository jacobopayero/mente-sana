// ============================================================================
//  MENTE SERENA — Campos de la ficha clínica / anamnesis (definición central)
//  Se reutiliza en: Mi perfil (paciente), edición del profesional y expediente.
//
//  SALVAGUARDA: ningún campo de peso, IMC, calorías ni medidas corporales.
//  Campos sensibles (abuso, consumo) son OPCIONALES y confidenciales.
// ============================================================================

export const GRUPOS_FICHA = [
  {
    titulo: "Datos generales",
    campos: [
      { k: "fecha_nacimiento", label: "Fecha de nacimiento", tipo: "date" },
      { k: "genero", label: "Género", tipo: "text", ph: "Cómo se identifica" },
      { k: "religion", label: "Religión / creencias", tipo: "text", ph: "Opcional" },
      { k: "crianza", label: "Crianza / origen familiar", tipo: "text", ph: "Con ambos padres, con uno, familia extensa, adoptada, institución…" },
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
      { k: "abuso", label: "Antecedentes de abuso o trauma", tipo: "area", ph: "Opcional" },
      { k: "consumo", label: "Consumo de sustancias", tipo: "area", ph: "Tabaco, alcohol u otras (o “ninguno”)" },
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
      { k: "notas", label: "Otras notas", tipo: "area" },
    ],
  },
];

export const CAMPOS_FICHA = GRUPOS_FICHA.flatMap((g) => g.campos);

// Checklist de antecedentes (marcar los que apliquen).
export const GRUPOS_ANTECEDENTES = [
  { titulo: "Salud mental", items: ["Depresión", "Ansiedad", "TCA", "Autolesiones", "Ideación/intento suicida", "Trastorno bipolar", "TOC", "Trauma o abuso"] },
  { titulo: "Consumo", items: ["Tabaco", "Alcohol", "Otras sustancias"] },
  { titulo: "Médicos", items: ["Cirugías estéticas", "Otras cirugías", "Hospitalizaciones", "Embarazo actual", "Embarazos previos"] },
  { titulo: "Familiares", items: ["Salud mental en la familia", "TCA en la familia"] },
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
  if (ficha.antecedentes && ficha.antecedentes.length) {
    res.unshift({ label: "Antecedentes", valor: ficha.antecedentes.join(", ") });
  }
  return res;
}

// Formulario reutilizable de la ficha (paciente o profesional).
export function CamposFicha({ ficha, setF }) {
  const seleccion = new Set(ficha.antecedentes || []);
  function alternar(item) {
    const s = new Set(seleccion);
    s.has(item) ? s.delete(item) : s.add(item);
    setF("antecedentes", [...s]);
  }

  return (
    <>
      {/* Checklist de antecedentes (datos estructurados para análisis) */}
      <div className="seccion-titulo" style={{ marginLeft: 0 }}>Antecedentes (marca los que apliquen)</div>
      {GRUPOS_ANTECEDENTES.map((g) => (
        <div key={g.titulo} style={{ marginBottom: 12 }}>
          <div className="meta" style={{ marginBottom: 6, fontWeight: 600 }}>{g.titulo}</div>
          <div className="chips">
            {g.items.map((it) => (
              <button
                type="button"
                key={it}
                className={"chip" + (seleccion.has(it) ? " activa" : "")}
                onClick={() => alternar(it)}
              >
                {it}
              </button>
            ))}
          </div>
        </div>
      ))}

      {GRUPOS_FICHA.map((g) => (
        <div key={g.titulo}>
          <div className="seccion-titulo" style={{ marginLeft: 0 }}>{g.titulo}</div>
          {g.nota && <p className="sub" style={{ marginTop: 0 }}>{g.nota}</p>}
          {g.campos.map((c) => (
            <div className="campo" key={c.k}>
              <label>{c.label}</label>
              {c.tipo === "area" ? (
                <textarea value={ficha[c.k] || ""} onChange={(e) => setF(c.k, e.target.value)} placeholder={c.ph || ""} />
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
