-- ============================================================================
--  AURA — Contabilidad: informe de colaboradores  ·  Ejecutar tras 01-13.
--
--  Para el médico master: pacientes referidos, precio por consulta y total.
--  Lo puede llenar la secretaria al cobrar o el propio terapeuta.
-- ============================================================================

-- Tarifa por consulta de cada colaborador (definida por el master).
alter table perfiles_profesional add column if not exists precio_consulta numeric default 0;

-- Pagos / consultas registradas (contabilidad).
create table pagos (
  id              uuid primary key default gen_random_uuid(),
  master_id       uuid references perfiles(id),   -- terapeuta dueño de la contabilidad
  profesional_id  uuid references perfiles(id),   -- colaborador de la consulta
  paciente_nombre text,
  monto           numeric not null default 0,
  fecha           date not null default current_date,
  creado_en       timestamptz not null default now()
);

alter table pagos enable row level security;

-- El master ve/gestiona su contabilidad; el asistente autorizado puede registrar.
create policy pagos_master on pagos
  for all using (master_id = auth.uid())
  with check (master_id = auth.uid());

-- ============================================================================
--  NOTA: el registro por parte de la secretaria requiere una política adicional
--  que valide la relación asistente↔master (ver 13_asistente.sql).
-- ============================================================================
