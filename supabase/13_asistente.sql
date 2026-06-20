-- ============================================================================
--  AURA — Rol asistente / secretaria  ·  Ejecutar tras 01-12.
--
--  El asistente es autorizado por el médico y, por defecto, solo accede a datos
--  de CONTACTO del paciente y a la gestión de CITAS (no a la información
--  clínica). Opcionalmente, el médico puede permitirle "sellar" indicaciones.
-- ============================================================================

-- Nuevo valor de rol (ejecutar por separado si tu Postgres lo exige fuera de
-- transacción): asistente.
alter type rol_usuario add value if not exists 'asistente';

-- Permisos del asistente respecto a un médico (master).
create table asistentes_perm (
  asistente_id uuid not null references perfiles(id) on delete cascade,
  medico_id    uuid not null references perfiles(id) on delete cascade,
  autorizado   boolean not null default false,
  sellar       boolean not null default false,  -- puede sellar indicaciones
  creado_en    timestamptz not null default now(),
  primary key (asistente_id, medico_id)
);

alter table asistentes_perm enable row level security;

create policy asistperm_medico on asistentes_perm
  for all using (medico_id = auth.uid()) with check (medico_id = auth.uid());
create policy asistperm_asistente on asistentes_perm
  for select using (asistente_id = auth.uid());

-- Marca de "sellada" en la receta/indicación.
alter table recetas add column if not exists sellada boolean not null default false;

-- ============================================================================
--  NOTA: el acceso del asistente a CONTACTO y CITAS debe limitarse con políticas
--  RLS específicas (solo columnas de contacto / tabla citas), evitando exponer
--  ficha clínica, notas, ánimo, etc. Definir junto a la dirección clínica.
-- ============================================================================
