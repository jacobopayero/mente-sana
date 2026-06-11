// ----------------------------------------------------------------------------
//  Cliente de Supabase
//  Las credenciales se inyectan por variables de entorno, nunca se escriben
//  directamente en el código ni se suben al repositorio.
//
//  Si las variables no están definidas, `supabase` queda en null y la app
//  funciona en MODO DEMO (datos locales del navegador). Así la interfaz puede
//  revisarse sin un backend configurado.
// ----------------------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const estaConfigurado = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = estaConfigurado
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
