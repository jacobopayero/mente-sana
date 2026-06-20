-- ============================================================================
--  AURA — Esquema de base de datos (Fase 1)
--  PostgreSQL / Supabase
--
--  Herramienta clínica de acompañamiento para pacientes en terapia.
--  Dirección clínica: Lic. Cecilia Alexandra García H. (especialista en TCA).
--
--  SALVAGUARDAS DE DISEÑO (no modificar sin la dirección clínica):
--   - No existen campos de calorías, peso, IMC ni métricas corporales.
--   - El sueño se guarda solo como calidad cualitativa y rango, nunca cifras
--     corporales. El reloj, en su fase, importará SOLO sueño.
--   - Las tareas y recursos no contienen dietas ni planes de alimentación.
-- ============================================================================

-- ----------------------------------------------------------------------------
--  0. Tipos enumerados
-- ----------------------------------------------------------------------------
create type rol_usuario        as enum ('paciente', 'terapeuta', 'psiquiatra', 'admin');
create type modalidad_cita     as enum ('Presencial', 'Videollamada');
create type tipo_sesion        as enum ('Individual', 'Pareja', 'Familiar');
create type estado_cita        as enum ('agendada', 'completada', 'cancelada');
create type categoria_nota     as enum ('Evolucion', 'Medicacion', 'Observacion', 'Ajuste de plan');
create type tipo_recurso       as enum ('video', 'cancion', 'instructivo', 'motivacion', 'enlace');
create type origen_sueno       as enum ('manual', 'reloj');
create type calidad_sueno      as enum ('inquieto', 'regular', 'reparador');

-- ----------------------------------------------------------------------------
--  1. Usuarios y perfiles
--     En Supabase, auth.users gestiona la autenticación. Esta tabla guarda el
--     perfil de la app y referencia el id de auth.users.
-- ----------------------------------------------------------------------------
create table perfiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  rol           rol_usuario not null default 'paciente',
  nombre        text not null,
  nombre_formal text,                       -- ej. "Cecilia Alexandra García H."
  titulo        text,                        -- ej. "Lic.", "Dr."
  email         text not null,
  telefono      text,
  creado_en     timestamptz not null default now()
);

-- Datos extra solo para profesionales (terapeuta / psiquiatra)
create table perfiles_profesional (
  perfil_id     uuid primary key references perfiles(id) on delete cascade,
  especialidad  text,                        -- ej. "Familiar y de pareja · TCA"
  credenciales  text,                        -- ej. "Máster en TCA y Psicología Clínica"
  color_hex     text default '#5E7560'
);

-- ----------------------------------------------------------------------------
--  2. Vínculo de cuidado: qué profesional atiende a qué paciente.
--     Es la base de TODOS los permisos. Un paciente puede tener terapeuta
--     y psiquiatra; un profesional, muchos pacientes.
-- ----------------------------------------------------------------------------
create table vinculos_cuidado (
  id             uuid primary key default gen_random_uuid(),
  paciente_id    uuid not null references perfiles(id) on delete cascade,
  profesional_id uuid not null references perfiles(id) on delete cascade,
  activo         boolean not null default true,
  creado_en      timestamptz not null default now(),
  unique (paciente_id, profesional_id)
);

-- Función de ayuda: ¿el profesional actual atiende a este paciente?
create or replace function atiende_a(p_paciente uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from vinculos_cuidado
    where profesional_id = auth.uid()
      and paciente_id = p_paciente
      and activo = true
  );
$$;

-- ----------------------------------------------------------------------------
--  3. Registros de ánimo  (solo del paciente y su equipo autorizado)
-- ----------------------------------------------------------------------------
create table registros_animo (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references perfiles(id) on delete cascade,
  fecha        date not null default current_date,
  animo        smallint not null check (animo between 1 and 5),
  emociones    text[] default '{}',
  nota         text,
  creado_en    timestamptz not null default now(),
  unique (paciente_id, fecha)
);

-- ----------------------------------------------------------------------------
--  4. Registros de sueño
--     SOLO calidad cualitativa y rango. Sin horas exactas obligatorias,
--     sin métricas corporales. 'origen' permite distinguir manual vs reloj.
-- ----------------------------------------------------------------------------
create table registros_sueno (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references perfiles(id) on delete cascade,
  fecha        date not null default current_date,
  calidad      calidad_sueno not null,
  rango        smallint not null check (rango between 0 and 3), -- muy poco..bastante
  nota         text,
  origen       origen_sueno not null default 'manual',
  creado_en    timestamptz not null default now(),
  unique (paciente_id, fecha)
);

-- Alertas de sueño: registran un evento de mal descanso sostenido y la
-- respuesta ofrecida. Disparan apoyo, no juicio.
create table alertas_sueno (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references perfiles(id) on delete cascade,
  fecha        date not null default current_date,
  motivo       text,                          -- ej. "2 noches de descanso pobre"
  respuesta    text,                          -- ej. "ofrecio calma", "aviso al equipo"
  visto_equipo boolean not null default false,
  creado_en    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
--  5. Citas
-- ----------------------------------------------------------------------------
create table citas (
  id             uuid primary key default gen_random_uuid(),
  paciente_id    uuid not null references perfiles(id) on delete cascade,
  profesional_id uuid not null references perfiles(id),
  fecha          date not null,
  hora           time not null,
  modalidad      modalidad_cita not null default 'Presencial',
  tipo           tipo_sesion not null default 'Individual',
  estado         estado_cita not null default 'agendada',
  creado_en      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
--  6. Tareas  (asignadas por el profesional; sin dietas ni ejercicio numérico)
-- ----------------------------------------------------------------------------
create table tareas (
  id             uuid primary key default gen_random_uuid(),
  paciente_id    uuid not null references perfiles(id) on delete cascade,
  asignada_por   uuid references perfiles(id),
  texto          text not null,
  completada     boolean not null default false,
  creado_en      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
--  7. Notas de coordinación clínica (entre profesionales del caso)
--     'visible_paciente' decide, por nota, si el paciente puede verla.
-- ----------------------------------------------------------------------------
create table notas_coordinacion (
  id               uuid primary key default gen_random_uuid(),
  paciente_id      uuid not null references perfiles(id) on delete cascade,
  autor_id         uuid not null references perfiles(id),
  categoria        categoria_nota not null,
  texto            text not null,
  visible_paciente boolean not null default false,
  creado_en        timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
--  8. Recursos  (videos, audios, instructivos, mensajes, enlaces)
--     'global' = visible a todos los pacientes del consultorio;
--     si no, dirigido a un paciente concreto.
-- ----------------------------------------------------------------------------
create table recursos (
  id            uuid primary key default gen_random_uuid(),
  creado_por    uuid references perfiles(id),
  paciente_id   uuid references perfiles(id) on delete cascade, -- null = global
  tipo          tipo_recurso not null,
  titulo        text not null,
  descripcion   text,
  url           text,
  texto         text,
  archivo_path  text,                          -- ruta en almacenamiento cifrado
  creado_en     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
--  9. Auditoría: quién accedió a qué y cuándo (exigible en datos de salud)
-- ----------------------------------------------------------------------------
create table auditoria (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  accion      text not null,
  tabla       text,
  registro_id uuid,
  creado_en   timestamptz not null default now()
);

-- ============================================================================
--  SEGURIDAD A NIVEL DE FILA (Row Level Security)
--  Cada quien ve solo lo que su rol permite. Esta es la pieza crítica.
-- ============================================================================
alter table perfiles               enable row level security;
alter table perfiles_profesional   enable row level security;
alter table vinculos_cuidado       enable row level security;
alter table registros_animo        enable row level security;
alter table registros_sueno        enable row level security;
alter table alertas_sueno          enable row level security;
alter table citas                  enable row level security;
alter table tareas                 enable row level security;
alter table notas_coordinacion     enable row level security;
alter table recursos               enable row level security;

-- ---- Perfiles: cada quien ve y edita el suyo; los profesionales ven el de sus pacientes
create policy perfil_propio on perfiles
  for select using (id = auth.uid() or atiende_a(id));
create policy perfil_editar on perfiles
  for update using (id = auth.uid());

-- ---- Registros de ánimo: el paciente los gestiona; su equipo los lee
create policy animo_paciente on registros_animo
  for all using (paciente_id = auth.uid())
  with check (paciente_id = auth.uid());
create policy animo_equipo_lee on registros_animo
  for select using (atiende_a(paciente_id));

-- ---- Registros de sueño: igual patrón
create policy sueno_paciente on registros_sueno
  for all using (paciente_id = auth.uid())
  with check (paciente_id = auth.uid());
create policy sueno_equipo_lee on registros_sueno
  for select using (atiende_a(paciente_id));

-- ---- Citas: el paciente y su profesional asignado
create policy citas_paciente on citas
  for all using (paciente_id = auth.uid())
  with check (paciente_id = auth.uid());
create policy citas_profesional on citas
  for select using (profesional_id = auth.uid() or atiende_a(paciente_id));

-- ---- Tareas: el paciente las ve y completa; el profesional las crea
create policy tareas_paciente on tareas
  for select using (paciente_id = auth.uid());
create policy tareas_paciente_completa on tareas
  for update using (paciente_id = auth.uid());
create policy tareas_profesional on tareas
  for all using (atiende_a(paciente_id))
  with check (atiende_a(paciente_id));

-- ---- Notas de coordinación: las escriben y leen los profesionales del caso;
--      el paciente solo ve las marcadas como visibles para él
create policy notas_equipo on notas_coordinacion
  for all using (atiende_a(paciente_id) or autor_id = auth.uid())
  with check (atiende_a(paciente_id) or autor_id = auth.uid());
create policy notas_paciente_ve on notas_coordinacion
  for select using (paciente_id = auth.uid() and visible_paciente = true);

-- ---- Recursos: globales para todos, o dirigidos a un paciente y su equipo
create policy recursos_lectura on recursos
  for select using (
    paciente_id is null
    or paciente_id = auth.uid()
    or atiende_a(paciente_id)
  );
create policy recursos_profesional on recursos
  for all using (creado_por = auth.uid())
  with check (creado_por = auth.uid());

-- ---- Vínculos de cuidado: el paciente y el profesional involucrados los ven
create policy vinculos_ver on vinculos_cuidado
  for select using (paciente_id = auth.uid() or profesional_id = auth.uid());

-- ============================================================================
--  NOTA: estas políticas son un punto de partida sólido para la beta.
--  Antes de manejar datos reales de pacientes, deben revisarse junto a la
--  dirección clínica y a un asesor legal en protección de datos (Ley 172-13).
-- ============================================================================
