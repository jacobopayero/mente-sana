-- ============================================================================
--  AURA — Teleconsulta y rol central (HQ)  ·  Ejecutar tras 01-06.
--
--  IMPORTANTE: la GRABACIÓN de llamadas requiere consentimiento explícito de
--  las partes y una integración telefónica externa (p. ej. Twilio). Esta tabla
--  guarda el registro de consultas y la referencia a la grabación; el audio se
--  almacena cifrado en el proveedor/almacenamiento que se defina.
-- ============================================================================

-- Número telefónico asociado por profesional (al que se enlazan las consultas).
alter table perfiles_profesional add column if not exists numero_asociado text;

create table teleconsultas (
  id                uuid primary key default gen_random_uuid(),
  paciente_id       uuid references perfiles(id) on delete set null,
  paciente_nombre   text,
  profesional_id    uuid references perfiles(id),
  fecha             date not null default current_date,
  duracion_min      integer default 0,
  estado            text default 'registrada',  -- registrada | en_curso | finalizada
  grabacion         boolean not null default false,
  grabacion_url     text,    -- ruta cifrada del audio (cuando exista integración)
  transcripcion     text,    -- para evaluación y análisis (cuando exista)
  nota              text,
  creado_en         timestamptz not null default now()
);

alter table teleconsultas enable row level security;

-- ¿El usuario actual es dirección/central (admin)?
create or replace function es_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from perfiles where id = auth.uid() and rol = 'admin');
$$;

-- El profesional ve/gestiona sus consultas; la central (HQ) ve todas.
create policy tele_profesional on teleconsultas
  for all using (profesional_id = auth.uid())
  with check (profesional_id = auth.uid());
create policy tele_admin on teleconsultas
  for select using (es_admin());

-- La central (HQ) puede leer perfiles y referidos de toda la red.
create policy perfiles_admin_ve on perfiles
  for select using (es_admin());
create policy referidos_admin_ve on referidos
  for select using (es_admin());

-- ============================================================================
--  NOTA: el rol 'admin' (central/HQ) concentra la coordinación. Asignarlo solo
--  a la dirección verificada. La grabación de llamadas debe cumplir el
--  consentimiento informado y la Ley 172-13 (RD) antes de activarse.
-- ============================================================================
