-- ============================================================================
--  MENTE SERENA — Registro de referidos (profesional → profesional)
--  Ejecutar tras 01-05.
--
--  Deja constancia de quién refirió a cada paciente (p. ej. un psiquiatra
--  deriva a la paciente a su terapeuta). Útil para coordinación y para medir
--  el origen de los pacientes (red de referidos entre profesionales de salud).
-- ============================================================================

create table referidos (
  id              uuid primary key default gen_random_uuid(),
  paciente_id     uuid references perfiles(id) on delete set null, -- puede ser null si aún no tiene cuenta
  paciente_nombre text,
  referido_por    uuid references perfiles(id),  -- profesional que refiere
  hacia           uuid references perfiles(id),  -- profesional que recibe
  nota            text,
  creado_en       timestamptz not null default now()
);

alter table referidos enable row level security;

-- Cada profesional ve los referidos que hizo o que recibió, y puede registrar
-- nuevos referidos hechos por él.
create policy referidos_ver on referidos
  for select using (referido_por = auth.uid() or hacia = auth.uid());
create policy referidos_crear on referidos
  for insert with check (referido_por = auth.uid());
