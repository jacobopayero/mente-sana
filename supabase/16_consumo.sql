-- ============================================================================
--  AURA — Consumo de sustancias estructurado  ·  Ejecutar tras 01-15.
--
--  Lista marcable de sustancias (con opción de añadir otras) y marca de uso
--  combinado. Datos estructurados para análisis. Sin métricas corporales.
-- ============================================================================

alter table ficha_clinica add column if not exists consumo_sustancias text[] default '{}';
alter table ficha_clinica add column if not exists consumo_combinado boolean default false;

-- (El campo de texto libre 'consumo' queda en desuso; se reemplaza por la lista.)
