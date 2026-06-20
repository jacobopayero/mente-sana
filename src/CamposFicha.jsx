// ============================================================================
//  AURA — Campos de la ficha clínica / anamnesis (definición central)
//  Se reutiliza en: Mi perfil (paciente), edición del profesional y expediente.
//
//  SALVAGUARDA: ningún campo de peso, IMC, calorías ni medidas corporales.
//  Campos sensibles (abuso, consumo) son OPCIONALES y confidenciales.
//  Los antecedentes y síntomas son MARCAS (datos estructurados) para análisis.
// ============================================================================
import { useState } from "react";

// Lista de ocupaciones (con opción "Otra" para escribir libremente).
export const OCUPACIONES = [
  "Estudiante", "Docente / Profesor(a)", "Médico/a", "Enfermero/a", "Psicólogo/a",
  "Ingeniero/a", "Abogado/a", "Contador/a", "Administrador/a", "Comerciante",
  "Empresario/a", "Diseñador/a", "Programador/a", "Vendedor/a", "Chofer",
  "Ama/o de casa", "Jubilado/a", "Desempleado/a", "Militar / Policía", "Artista",
  "Agricultor/a", "Obrero/a",
];

// Rango de fechas de nacimiento: hasta 110 años de edad.
const HOY_ISO = new Date().toISOString().slice(0, 10);
const MIN_NAC_ISO = `${new Date().getFullYear() - 110}-01-01`;

export const GRUPOS_FICHA = [
  {
    titulo: "Datos generales",
    campos: [
      { k: "fecha_nacimiento", label: "Fecha de nacimiento", tipo: "date" },
      { k: "genero", label: "Sexo / género", tipo: "select", opciones: ["Femenino", "Masculino", "Otro", "Prefiero no decir"] },
      { k: "estado_civil", label: "Estado civil", tipo: "select", opciones: ["Soltero/a", "En pareja", "Casado/a", "Divorciado/a", "Viudo/a"] },
      { k: "ocupacion", label: "Ocupación", tipo: "select-otro", opciones: OCUPACIONES },
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
  { titulo: "Médicos", items: ["Cirugías estéticas", "Otras cirugías", "Hospitalizaciones", "Embarazo actual", "Embarazos previos"] },
  { titulo: "Familiares", items: ["Salud mental en la familia", "TCA en la familia"] },
];

// Sustancias más comunes a nivel mundial (con opción de añadir otra y marcar
// uso combinado). Lista amplia; el clínico marca las que apliquen.
export const SUSTANCIAS = [
  "Tabaco / Nicotina", "Alcohol", "Cafeína", "Cannabis (marihuana)", "Hachís",
  "Cocaína", "Crack", "Anfetaminas", "Metanfetamina", "MDMA / Éxtasis",
  "Heroína", "Morfina", "Codeína", "Fentanilo", "Tramadol", "Metadona",
  "Oxicodona", "Benzodiacepinas", "Barbitúricos", "Sedantes / hipnóticos",
  "LSD", "Hongos (psilocibina)", "Ketamina", "PCP (fenciclidina)",
  "DMT / Ayahuasca", "Mescalina / Peyote", "GHB", "Poppers (nitritos)",
  "Inhalantes / solventes", "Kratom", "Salvia divinorum", "Esteroides anabólicos",
  "Bebidas energéticas", "Medicamentos sin receta",
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
  if (ficha.consumo_sustancias && ficha.consumo_sustancias.length) {
    res.unshift({ label: "Consumo de sustancias", valor: ficha.consumo_sustancias.join(", ") + (ficha.consumo_combinado ? " (uso combinado)" : "") });
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

// Select con opción "Otra (especificar)" para escribir un valor libre.
function SelectOtro({ valor, opciones, onChange, ph }) {
  const enLista = opciones.includes(valor || "");
  const [otra, setOtra] = useState(Boolean(valor) && !enLista);
  return (
    <>
      <select
        value={otra ? "__otra__" : valor || ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__otra__") {
            setOtra(true);
            onChange("");
          } else {
            setOtra(false);
            onChange(v);
          }
        }}
      >
        <option value="">Seleccionar…</option>
        {opciones.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
        <option value="__otra__">Otra (especificar)…</option>
      </select>
      {otra && (
        <input
          style={{ marginTop: 8 }}
          value={valor || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={ph || "Especifica"}
        />
      )}
    </>
  );
}

// Consumo de sustancias: lista marcable + crear nueva + uso combinado.
function ConsumoSustancias({ ficha, setF }) {
  const sel = ficha.consumo_sustancias || [];
  const [nueva, setNueva] = useState("");
  const customs = sel.filter((s) => !SUSTANCIAS.includes(s));
  const todos = [...SUSTANCIAS, ...customs];

  function agregar() {
    const v = nueva.trim();
    if (v && !sel.includes(v)) setF("consumo_sustancias", [...sel, v]);
    setNueva("");
  }

  return (
    <>
      <div className="seccion-titulo" style={{ marginLeft: 0 }}>Consumo de sustancias</div>
      <div className="chips" style={{ marginBottom: 10 }}>
        {todos.map((it) => (
          <button
            type="button"
            key={it}
            className={"chip" + (sel.includes(it) ? " activa" : "")}
            onClick={() => setF("consumo_sustancias", toggleEnLista(sel, it))}
          >
            {it}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregar(); } }}
          placeholder="Otra sustancia…"
        />
        <button type="button" className="btn secundario" style={{ width: "auto", padding: "10px 14px" }} onClick={agregar}>
          Añadir
        </button>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", marginBottom: 6 }}>
        <input
          type="checkbox"
          checked={!!ficha.consumo_combinado}
          onChange={(e) => setF("consumo_combinado", e.target.checked)}
          style={{ width: 18, height: 18, accentColor: "var(--salvia)" }}
        />
        Uso combinado (varias sustancias)
      </label>
    </>
  );
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

      <ConsumoSustancias ficha={ficha} setF={setF} />

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
              ) : c.tipo === "select-otro" ? (
                <SelectOtro valor={ficha[c.k]} opciones={c.opciones} onChange={(v) => setF(c.k, v)} ph={c.ph} />
              ) : c.tipo === "date" ? (
                <input
                  type="date"
                  value={ficha[c.k] || ""}
                  min={MIN_NAC_ISO}
                  max={HOY_ISO}
                  onChange={(e) => setF(c.k, e.target.value)}
                />
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
