-- ============================================================================
--  AURA — Anamnesis ampliada (motivo, síntomas, sociodemográficos,
--  objetivos y evaluación de riesgo)  ·  Ejecutar tras 01-09.
--
--  Basado en componentes estándar de fichas de admisión en salud mental.
--  SALVAGUARDA: sin peso, IMC, calorías ni medidas corporales.
-- ============================================================================

-- Sociodemográficos
alter table ficha_clinica add column if not exists estado_civil text;
alter table ficha_clinica add column if not exists ocupacion text;
alter table ficha_clinica add column if not exists escolaridad text;
alter table ficha_clinica add column if not exists convivencia text;       -- con quién vive

-- Motivo de consulta y plan
alter table ficha_clinica add column if not exists motivo_consulta text;
alter table ficha_clinica add column if not exists frecuencia_consumo text;
alter table ficha_clinica add column if not exists objetivos text;          -- objetivos de tratamiento

-- Síntomas actuales (marcas estructuradas, para análisis)
alter table ficha_clinica add column if not exists sintomas text[] default '{}';

-- Evaluación de riesgo (uso clínico; el paciente no la edita en su perfil)
alter table ficha_clinica add column if not exists riesgo text;            -- Bajo | Moderado | Alto
alter table ficha_clinica add column if not exists riesgo_nota text;
