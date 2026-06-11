-- ============================================================================
--  MENTE SERENA — Extensión: plan de seguridad y medicamentos (Fase 2+)
--  Ejecutar DESPUÉS de 01_esquema.sql y 02_funciones.sql.
--
--  SALVAGUARDAS: medicamentos NO incluye métricas corporales; el plan de
--  seguridad es texto de afrontamiento definido con la dirección clínica.
-- ============================================================================

-- ----------------------------------------------------------------------------
--  Plan de seguridad personal (uno por paciente)
-- ----------------------------------------------------------------------------
create table plan_seguridad (
  paciente_id    uuid primary key references perfiles(id) on delete cascade,
  senales        text,   -- señales de alerta que noto en mí
  calma          text,   -- qué me ayuda a calmarme
  personas       text,   -- personas de confianza a quienes acudir
  motivos        text,   -- mis motivos para seguir / razones de esperanza
  actualizado_en timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
--  Medicamentos (lado psiquiatría). Sin dosis numéricas corporales: 'dosis'
--  es texto libre (ej. "1 tableta"), 'horario' es una hora del día.
-- ----------------------------------------------------------------------------
create table medicamentos (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references perfiles(id) on delete cascade,
  nombre       text not null,
  dosis        text,
  horario      time,
  nota         text,
  activo       boolean not null default true,
  creado_en    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
--  Seguridad por filas
-- ----------------------------------------------------------------------------
alter table plan_seguridad enable row level security;
alter table medicamentos   enable row level security;

-- Plan de seguridad: el paciente lo gestiona; su equipo lo lee.
create policy plan_paciente on plan_seguridad
  for all using (paciente_id = auth.uid())
  with check (paciente_id = auth.uid());
create policy plan_equipo_lee on plan_seguridad
  for select using (atiende_a(paciente_id));

-- Medicamentos: el paciente los gestiona; su equipo (psiquiatra) los lee y
-- también puede crearlos/ajustarlos.
create policy medic_paciente on medicamentos
  for all using (paciente_id = auth.uid())
  with check (paciente_id = auth.uid());
create policy medic_equipo on medicamentos
  for all using (atiende_a(paciente_id))
  with check (atiende_a(paciente_id));
