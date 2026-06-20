-- ============================================================================
--  AURA — Sistema familiar / genograma (terapia sistémica)  ·  Tras 01-14.
--
--  Enfoque sistémico (familia y pareja): miembros del sistema, parentesco y
--  dinámica relacional. Se guarda como JSON estructurado en la ficha clínica.
-- ============================================================================

alter table ficha_clinica add column if not exists sistema_familiar jsonb default '[]'::jsonb;

-- Cada elemento: { "nombre": "...", "parentesco": "...", "edad": "...", "nota": "..." }
