# Mente Serena

App de acompañamiento para pacientes en terapia, con dirección clínica especializada en TCA.
Proyecto **Vite + React + Supabase**: cuentas, roles, persistencia real y una interfaz serena,
instalable como PWA.

> **Salvaguardas de diseño (no negociables).** La app no registra ni muestra calorías,
> peso, IMC ni métricas corporales; no comenta apariencia; no genera planes de
> alimentación. El sueño usa solo calidad cualitativa y un rango de descanso percibido.
> El reloj, en su fase, importará únicamente sueño. Estas reglas viven también dentro del
> esquema SQL y de la capa de datos.

---

## Arranque rápido (modo demo, sin backend)

```bash
npm install
npm run dev
```

Abre la dirección que muestra la terminal. **Sin credenciales de Supabase, la app
arranca en modo demo**: los datos se guardan solo en tu navegador (localStorage), con
registros de ejemplo. Ideal para revisar la interfaz. Crea una cuenta de prueba con
cualquier dato y explora las secciones.

## Estructura del proyecto

| Ruta | Para qué sirve |
|---|---|
| `src/MenteSerena.jsx` | La interfaz completa (auth + 7 secciones). |
| `src/api.js` | Capa de datos: conecta la app a Supabase (o al modo demo). |
| `src/lib/supabaseClient.js` | Cliente de Supabase; decide si hay backend o modo demo. |
| `src/lib/demoStore.js` | Almacén local de demostración (localStorage). |
| `supabase/01_esquema.sql` | Crea todas las tablas, roles y políticas de seguridad (RLS). |

Secciones de la app: **Inicio**, **Ánimo**, **Sueño** (con alerta de descanso), **Agenda**
(citas), **Tareas**, **Recursos** y **Apoyo**.

---

## Conectar Supabase (datos reales)

### 1. Crear el proyecto en Supabase
1. Entra a [supabase.com](https://supabase.com) y crea un proyecto nuevo.
2. Anota la **URL del proyecto** y la **clave anónima (anon key)**.

### 2. Crear la base de datos
1. En Supabase, abre el **SQL Editor**.
2. Pega el contenido de `supabase/01_esquema.sql` y ejecútalo.
3. Verifica en **Table Editor** que aparezcan las tablas (`perfiles`, `registros_animo`,
   `registros_sueno`, `citas`, etc.).

### 3. Conectar las credenciales (sin exponerlas)
Crea un archivo `.env` en la raíz (copia `.env.example`):

```
VITE_SUPABASE_URL=la-url-de-tu-proyecto
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

> Nunca subas el archivo `.env` al repositorio. Ya está en `.gitignore`.

Al reiniciar `npm run dev`, la app deja el modo demo y usa Supabase automáticamente.

### 4. Publicar la beta
- Sube el proyecto a Vercel o Netlify (ambos conectan con tu repositorio).
- Configura las mismas variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- La app queda accesible desde un enlace, instalable en el teléfono como PWA.

---

## Crear las cuentas del equipo (terapeuta y psiquiatra)

Por seguridad, los roles `terapeuta` y `psiquiatra` no se asignan solos. Tras crear sus
cuentas, un administrador los marca desde Supabase:

```sql
-- Convertir una cuenta en terapeuta y completar su perfil profesional
update perfiles set rol = 'terapeuta',
  nombre = 'Alexandra García',
  nombre_formal = 'Cecilia Alexandra García H.',
  titulo = 'Lic.'
where email = 'correo-de-alexandra@ejemplo.com';

insert into perfiles_profesional (perfil_id, especialidad, credenciales)
select id, 'Familiar y de pareja · TCA', 'Máster en TCA y Psicología Clínica'
from perfiles where email = 'correo-de-alexandra@ejemplo.com';

-- Vincular una paciente con su terapeuta
insert into vinculos_cuidado (paciente_id, profesional_id)
select p.id, t.id
from perfiles p, perfiles t
where p.email = 'correo-paciente@ejemplo.com'
  and t.email = 'correo-de-alexandra@ejemplo.com';
```

---

## Antes de abrir a pacientes reales

Esto no es opcional cuando se manejan datos de salud:

- **Revisión legal** del consentimiento informado y cumplimiento de la **Ley 172-13** de RD.
- **Validación clínica** con Alexandra de los textos, alertas y permisos.
- **Cifrado y respaldos** activados en Supabase.
- **Línea de apoyo en TCA** real y verificada en la pantalla de Apoyo
  (hoy hay un número de ejemplo marcado como pendiente en `src/MenteSerena.jsx`).
- **Umbral de la alerta de sueño** calibrado por la dirección clínica
  (hoy: 2 noches seguidas de descanso pobre, en `evaluarAlertaSueno` de `src/api.js`).

---

## Fases

- **Fase 1 (este repo):** cuentas, roles, persistencia de las secciones e interfaz del paciente.
- **Fase 2:** panel del profesional y beta con pacientes.
- **Fases siguientes:** conexión del reloj (solo sueño) y suscripciones.
