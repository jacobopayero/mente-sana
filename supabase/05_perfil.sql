-- ============================================================================
--  MENTE SERENA — Perfil del paciente y ficha clínica  ·  Ejecutar tras 01-04.
--
--  SALVAGUARDAS: la ficha clínica NO incluye peso, IMC, calorías ni medidas
--  corporales. Recoge contexto clínico seguro (alergias, condiciones
--  relevantes, contacto de emergencia y notas). Los campos exactos deben
--  validarse con la dirección clínica antes de pacientes reales.
-- ============================================================================

-- Foto de perfil (avatar). Guarda una URL o un data-URL pequeño.
alter table perfiles add column if not exists foto_url text;

-- Ficha clínica (historia médica) — una por paciente.
create table ficha_clinica (
  paciente_id            uuid primary key references perfiles(id) on delete cascade,
  fecha_nacimiento       date,
  genero                 text,
  contacto_emergencia    text,   -- nombre
  contacto_emergencia_tel text,
  alergias               text,
  condiciones            text,   -- condiciones médicas relevantes
  tratamientos_previos   text,
  notas                  text,   -- algo que el paciente quiera que su equipo sepa
  actualizado_en         timestamptz not null default now()
);

alter table ficha_clinica enable row level security;

-- El paciente gestiona su ficha; su equipo de cuidado la lee.
create policy ficha_paciente on ficha_clinica
  for all using (paciente_id = auth.uid())
  with check (paciente_id = auth.uid());
create policy ficha_equipo_lee on ficha_clinica
  for select using (atiende_a(paciente_id));
