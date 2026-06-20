-- ============================================================================
--  AURA — Médico principal/secundario y recetario  ·  Ejecutar tras 01-10.
--
--  - Marca el médico PRINCIPAL del caso en el vínculo de cuidado.
--  - Recetario: el profesional envía recetas al paciente; el paciente las ve.
--
--  SALVAGUARDA: el recetario es para medicación clínica; sin métricas corporales
--  ni planes de alimentación.
-- ============================================================================

-- Médico principal del caso (los demás vínculos quedan como secundarios).
alter table vinculos_cuidado add column if not exists principal boolean default false;

create table recetas (
  id             uuid primary key default gen_random_uuid(),
  paciente_id    uuid not null references perfiles(id) on delete cascade,
  profesional_id uuid references perfiles(id),
  medicamento    text not null,
  dosis          text,
  frecuencia     text,
  indicaciones   text,
  fecha          date not null default current_date,
  creado_en      timestamptz not null default now()
);

alter table recetas enable row level security;

-- El paciente ve sus recetas; su equipo de cuidado las crea y consulta.
create policy recetas_paciente on recetas
  for select using (paciente_id = auth.uid());
create policy recetas_equipo on recetas
  for all using (atiende_a(paciente_id))
  with check (atiende_a(paciente_id));
