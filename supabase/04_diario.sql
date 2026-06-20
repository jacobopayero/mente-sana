-- ============================================================================
--  AURA — Diario (journaling)  ·  Ejecutar tras 01/02/03.
--
--  Entradas de escritura libre del paciente, con una sugerencia opcional.
--  SALVAGUARDA: es texto reflexivo; no registra cifras ni métricas corporales.
-- ============================================================================

create table diario (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references perfiles(id) on delete cascade,
  sugerencia   text,            -- la pregunta/guía que inspiró la entrada
  texto        text not null,
  creado_en    timestamptz not null default now()
);

alter table diario enable row level security;

-- El diario es privado del paciente. Por defecto, el equipo NO lo lee
-- (es un espacio personal). Si la dirección clínica decidiera compartirlo,
-- se añadiría aquí una política de lectura para el equipo.
create policy diario_paciente on diario
  for all using (paciente_id = auth.uid())
  with check (paciente_id = auth.uid());
