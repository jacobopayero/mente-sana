# Aura

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

Secciones del paciente: **Inicio**, **Ánimo**, **Sueño** (con alerta de descanso), **Agenda**
(citas), **Tareas**, **Recursos** y **Apoyo**.

**Panel del profesional (Fase 2):** quien tenga rol `terapeuta`, `psiquiatra` o `admin` ve, al
entrar, la lista de sus pacientes y, por cada uno: ánimo y sueño recientes, alertas de
descanso, tareas (puede asignar nuevas) y notas de coordinación (puede escribirlas y
decidir si el paciente las ve). En modo demo, usa el botón **"Entrar como profesional"**.

**Bienestar y seguridad:**
- **Botón SOS** flotante: en cualquier pantalla, lleva al instante a la pantalla de Apoyo
  (respiración, línea de ayuda y plan de seguridad).
- **Plan de seguridad** personal: señales de alerta, qué me calma, personas de confianza y
  motivos para seguir. Privado del paciente; su equipo lo puede leer.
- **Bloqueo con PIN**: protege la app en el dispositivo (hash con sal, nunca el PIN en claro).
  En la app nativa de iOS puede sumarse Face ID.
- **Medicación con recordatorios** y **citas/tareas al calendario**: generan un evento `.ics`
  con alarma que el Calendario/Recordatorios del iPhone dispara aunque la app esté cerrada.
- **Caja de herramientas**: respiración guiada 4·7·8 animada, anclaje 5-4-3-2-1 y una pausa
  de autocompasión. Sin conexión.
- **Diario** (journaling): escritura privada del paciente con sugerencias rotativas.
- **Frase del día** en el inicio.
- **Bienvenida** (primer ingreso): consentimiento informado y aviso de emergencia.
- **Recordatorio diario de "registrar mi ánimo"** (evento recurrente de calendario).
- **Tendencias** en el panel del profesional: mini-gráficas cualitativas de ánimo y
  calidad del descanso de las últimas dos semanas.
- **Mi perfil**: el paciente edita su nombre, **sube una foto** y completa su **ficha
  clínica** (historia médica) — fecha de nacimiento, contacto de emergencia, alergias,
  condiciones relevantes, tratamientos previos y notas. **Sin** peso, IMC ni medidas
  corporales. La foto y la ficha también se ven en el panel del profesional.
- **Expediente completo** (profesional): consolida todo el histórico del paciente en un
  documento exportable a **PDF** (Imprimir) para el record clínico.
- **Registro de referidos** (profesional → profesional): deja constancia de quién refirió a
  cada paciente y permite registrar nuevas derivaciones (`supabase/06_referidos.sql`).
- **Plan anual / suscripción** (demo abierto): pantalla de plan con precio anual y estado
  "activa hasta…". El cobro real (Stripe / Apple-RevenueCat) se conecta después.
- **Derechos reservados**: aviso legal de autoría (Jacobo Payero) en acceso, bienvenida,
  panel y expediente.
- **Central / Administración (HQ)**: rol `admin` (dirección) con vista interconectada de toda
  la red — profesionales, pacientes, referidos y teleconsultas. En demo: "Entrar como central / HQ".
- **Teleconsulta**: número asociado por profesional y registro de consultas. La **grabación**
  para evaluación/análisis requiere integración telefónica externa (p. ej. Twilio) y
  **consentimiento** explícito (`supabase/07_teleconsulta.sql`).
- **Médico master / colaborador**: estructura en 3 áreas (paciente · médico master · médico
  colaborador). El **master autoriza** a colaboradores a acceder a sus pacientes
  (`supabase/12_master_colaborador.sql`).
- **Recetario**: el médico envía recetas al paciente, que las consulta en "Mis recetas"
  (`supabase/11_recetario.sql`).
- **Asistente / secretaria**: el médico autoriza a un asistente con acceso limitado
  (solo **datos de contacto** y **gestión de citas**, sin información clínica) y,
  opcionalmente, permiso para **sellar indicaciones** (`supabase/13_asistente.sql`).
- **Conexiones (uso clínico)**: el médico conecta relojes/apps (Apple Watch, Garmin, Fitbit,
  Samsung, Oura, Whoop…); importa **solo la calidad del sueño**. El paciente no la ve.

---

## Conectar Supabase (datos reales)

### 1. Crear el proyecto en Supabase
1. Entra a [supabase.com](https://supabase.com) y crea un proyecto nuevo.
2. Anota la **URL del proyecto** y la **clave anónima (anon key)**.

### 2. Crear la base de datos
1. En Supabase, abre el **SQL Editor**.
2. Pega y ejecuta **`supabase/01_esquema.sql`** (tablas, roles y políticas RLS).
3. Pega y ejecuta **`supabase/02_funciones.sql`** (trigger que crea el perfil al
   registrarse, políticas de las alertas de sueño y la vista de pacientes).
4. Verifica en **Table Editor** que aparezcan las tablas (`perfiles`, `registros_animo`,
   `registros_sueno`, `citas`, etc.).

### 3. Ajustes de Supabase para la beta
En el panel de Supabase:
- **Authentication → Sign In / Providers → Email**: desactiva **"Confirm email"** para que
  las cuentas de prueba entren al instante (si lo dejas activo, hay que confirmar por correo).
- **Authentication → URL Configuration → Site URL**: pon la URL pública
  (`https://jacobopayero.github.io/mente-sana/`).

### 4. Conectar las credenciales (sin exponerlas)
Para desarrollo local, crea un archivo `.env` (copia `.env.example`):

```
VITE_SUPABASE_URL=la-url-de-tu-proyecto
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

> Nunca subas el archivo `.env`. Ya está en `.gitignore`. Al reiniciar `npm run dev`, la app
> deja el modo demo y usa Supabase.

Para la **app publicada** (GitHub Pages), define dos **Variables del repositorio** en
**Settings → Secrets and variables → Actions → Variables**:
`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. El workflow las inyecta al compilar.
(La *anon key* está diseñada para vivir en el cliente; la seguridad real la dan las
políticas RLS de la base.)

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

-- Convertir una cuenta en psiquiatra y vincularla también con la paciente
-- (repite el bloque para cada psiquiatra del caso, p. ej. Dr. Musa y Dr. Rodríguez)
update perfiles set rol = 'psiquiatra', nombre = 'Musa', titulo = 'Dr.'
where email = 'correo-psiquiatra@ejemplo.com';

insert into perfiles_profesional (perfil_id, especialidad, credenciales, color_hex)
select id, 'Psiquiatría · TCA', 'Médico Psiquiatra', '#6d6a9e'
from perfiles where email = 'correo-psiquiatra@ejemplo.com';

insert into vinculos_cuidado (paciente_id, profesional_id)
select p.id, q.id
from perfiles p, perfiles q
where p.email = 'correo-paciente@ejemplo.com'
  and q.email = 'correo-psiquiatra@ejemplo.com';
```

El equipo de cuidado puede incluir **terapeuta y psiquiatra**. Ambos ven a la paciente; la
medicación queda del lado de psiquiatría. En modo demo puedes entrar como cualquiera de los
tres roles (paciente, terapeuta, psiquiatra).

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

---

## App para iPhone (iOS)

Hay dos caminos. El primero funciona **hoy, sin Mac ni cuenta de desarrollador**.

### Opción A — PWA (la más rápida)
La app ya es instalable como PWA. En el iPhone:
1. Publica la beta (Vercel/Netlify) y abre el enlace en **Safari**.
2. Toca **Compartir → "Añadir a pantalla de inicio"**.
3. Queda con su icono, a pantalla completa, como una app.

### Opción B — App nativa con Capacitor (para App Store / TestFlight)
El proyecto ya incluye la plataforma iOS en `ios/` (Capacitor 8, sin CocoaPods).
**Requiere una Mac con Xcode y una cuenta de Apple Developer** para firmar y publicar.

```bash
npm run ios:build   # compila la web y la sincroniza con el proyecto iOS
npm run ios:open    # abre el proyecto en Xcode
```

En Xcode: selecciona tu *Team* de firma, elige un simulador o tu iPhone y pulsa **Run**.
Para distribuir: **Product → Archive → Distribute App** (TestFlight o App Store).

> El `appId` es `do.menteserena.app` (editable en `capacitor.config.json`). Cada vez que
> cambies el código web, ejecuta `npm run ios:build` para reflejarlo en la app.

---

## Fases

- **Fase 1:** cuentas, roles, persistencia de las secciones e interfaz del paciente. ✅
- **Fase 2 (este repo):** panel del profesional (pacientes, ánimo/sueño, tareas, notas) y
  empaquetado iOS con Capacitor. ✅
- **Fases siguientes:** conexión del reloj (solo sueño), notificaciones y suscripciones.
