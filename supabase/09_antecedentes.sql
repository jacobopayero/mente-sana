-- ============================================================================
--  MENTE SERENA — Checklist de antecedentes  ·  Ejecutar tras 01-08.
--
--  Antecedentes como datos ESTRUCTURADOS (lista de marcas) para poder analizar
--  y generar estadística (no texto libre). Campos sensibles, con consentimiento.
-- ============================================================================

alter table ficha_clinica add column if not exists antecedentes text[] default '{}';

-- Ejemplos de valores: 'Depresión', 'Ansiedad', 'TCA', 'Autolesiones',
-- 'Ideación/intento suicida', 'Tabaco', 'Alcohol', 'Cirugías estéticas',
-- 'Embarazo actual', 'Salud mental en la familia', etc.
