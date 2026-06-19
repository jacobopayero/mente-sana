-- ============================================================================
--  MENTE SERENA — Médico master / colaborador y autorizaciones
--  Ejecutar tras 01-11.
--
--  Estructura en 3 áreas: app del paciente, app del médico MASTER (titular de
--  los pacientes) y médico COLABORADOR. El master autoriza a colaboradores a
--  acceder a sus pacientes.
-- ============================================================================

-- Tipo de profesional: master (titular) o colaborador.
alter table perfiles_profesional add column if not exists tipo text default 'master'; -- master | colaborador

-- Autorizaciones que un master concede a un colaborador.
create table autorizaciones (
  master_id      uuid not null references perfiles(id) on delete cascade,
  colaborador_id uuid not null references perfiles(id) on delete cascade,
  autorizado     boolean not null default false,
  creado_en      timestamptz not null default now(),
  primary key (master_id, colaborador_id)
);

alter table autorizaciones enable row level security;

-- El master gestiona sus autorizaciones; el colaborador ve las suyas.
create policy autoriz_master on autorizaciones
  for all using (master_id = auth.uid())
  with check (master_id = auth.uid());
create policy autoriz_colaborador on autorizaciones
  for select using (colaborador_id = auth.uid());

-- ¿El profesional actual tiene acceso autorizado al paciente?
-- (es del equipo y, si es colaborador, su master lo autorizó). Refinar según
-- el modelo definitivo de propiedad de pacientes antes de producción.
-- ============================================================================
--  NOTA: 'atiende_a' (01_esquema) sigue siendo la base del acceso. Estas
--  autorizaciones permiten que el master habilite/inhabilite colaboradores.
-- ============================================================================
