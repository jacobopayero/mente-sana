-- ============================================================================
--  MENTE SERENA — Funciones y políticas adicionales (Fase 2)
--  Ejecutar DESPUÉS de 01_esquema.sql en el SQL Editor de Supabase.
--
--  Completa lo necesario para que el registro de cuentas y el panel del
--  profesional funcionen de extremo a extremo con seguridad por filas (RLS).
-- ============================================================================

-- ----------------------------------------------------------------------------
--  1. Crear el perfil automáticamente al registrarse una cuenta nueva.
--     Se ejecuta con privilegios elevados (security definer) para poder
--     insertar en 'perfiles' aunque RLS esté activo.
-- ----------------------------------------------------------------------------
create or replace function public.manejar_usuario_nuevo()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, email, nombre, rol)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    'paciente'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.manejar_usuario_nuevo();

-- Permitir, además, que cada quien pueda crear/asegurar su propio perfil
-- desde el cliente (respaldo del trigger).
create policy perfil_crear on perfiles
  for insert with check (id = auth.uid());

-- ----------------------------------------------------------------------------
--  2. Políticas de la tabla de alertas de sueño.
--     (El esquema activa RLS en esta tabla pero no definía políticas, lo que
--     dejaba la tabla inaccesible. Esto lo corrige.)
--     El paciente gestiona sus alertas; su equipo de cuidado las lee y puede
--     marcarlas como vistas.
-- ----------------------------------------------------------------------------
create policy alertas_paciente on alertas_sueno
  for all using (paciente_id = auth.uid())
  with check (paciente_id = auth.uid());

create policy alertas_equipo_lee on alertas_sueno
  for select using (atiende_a(paciente_id));

create policy alertas_equipo_marca on alertas_sueno
  for update using (atiende_a(paciente_id))
  with check (atiende_a(paciente_id));

-- ----------------------------------------------------------------------------
--  3. Vista de apoyo: lista de pacientes de un profesional con su nombre.
--     Facilita el panel del profesional. La seguridad la siguen aplicando las
--     políticas de 'perfiles' y 'vinculos_cuidado'.
-- ----------------------------------------------------------------------------
create or replace view mis_pacientes as
  select
    v.id as vinculo_id,
    p.id,
    p.nombre,
    p.email,
    v.profesional_id,
    v.activo
  from vinculos_cuidado v
  join perfiles p on p.id = v.paciente_id
  where v.activo = true;

-- ============================================================================
--  NOTA: igual que el esquema base, estas políticas son un punto de partida
--  sólido para la beta y deben revisarse junto a la dirección clínica y a un
--  asesor legal en protección de datos (Ley 172-13) antes de manejar datos
--  reales de pacientes.
-- ============================================================================
