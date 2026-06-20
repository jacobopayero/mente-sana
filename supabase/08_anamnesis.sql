-- ============================================================================
--  AURA — Anamnesis ampliada de la ficha clínica  ·  Ejecutar tras 01-07.
--
--  Historia psicosocial del paciente (niñez → actualidad). Campos sensibles
--  (abuso, consumo) son OPCIONALES y confidenciales.
--  SALVAGUARDA: NO se añaden peso, IMC, calorías ni medidas corporales.
-- ============================================================================

alter table ficha_clinica add column if not exists religion text;
alter table ficha_clinica add column if not exists crianza text;                 -- origen/crianza (ambos padres, uno, externo…)
alter table ficha_clinica add column if not exists infancia text;                -- aspectos de la niñez
alter table ficha_clinica add column if not exists antecedentes_familiares text; -- salud mental en la familia
alter table ficha_clinica add column if not exists abuso text;                   -- antecedentes de abuso/trauma
alter table ficha_clinica add column if not exists consumo text;                 -- consumo de sustancias
alter table ficha_clinica add column if not exists actividad_fisica text;        -- actividad física / deporte
alter table ficha_clinica add column if not exists cirugias text;                -- cirugías (incl. estéticas)
alter table ficha_clinica add column if not exists embarazos text;               -- embarazos / gestaciones (si aplica)

-- Permitir que el equipo de cuidado complete/edite la ficha del paciente
-- (además de poder leerla). El paciente mantiene el control total de la suya.
create policy ficha_equipo_edita on ficha_clinica
  for all using (atiende_a(paciente_id))
  with check (atiende_a(paciente_id));
