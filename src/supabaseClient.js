import { createClient } from '@supabase/supabase-js'

let supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
let supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

// Strip single or double quotes if present
supabaseUrl = supabaseUrl.replace(/^["']|["']$/g, '')
supabaseAnonKey = supabaseAnonKey.replace(/^["']|["']$/g, '')

if (import.meta.env.DEV) {
  console.log('[Supabase] Inicializando cliente...', { 
    urlConfigured: !!supabaseUrl, 
    urlLength: supabaseUrl.length,
    urlStart: supabaseUrl.substring(0, 12)
  })
}

// SWAP DETECTION VALIDATION
if (supabaseUrl.startsWith('sb_') || supabaseUrl.startsWith('eyJ')) {
  throw new Error("ERROR DE CONFIGURACIÓN: Parece que has intercambiado las variables de entorno en Netlify. La variable VITE_SUPABASE_URL contiene una clave (comienza con 'sb_' o 'eyJ') en lugar de la URL del proyecto (que debe empezar con https://). Por favor, ve a Netlify (Site Configuration -> Environment variables) y corrígelo.")
}

if (supabaseAnonKey.startsWith('http://') || supabaseAnonKey.startsWith('https://')) {
  throw new Error("ERROR DE CONFIGURACIÓN: Parece que has intercambiado las variables de entorno en Netlify. La variable VITE_SUPABASE_ANON_KEY contiene la URL de tu proyecto en lugar de la clave anónima (anon key). Por favor, ve a Netlify (Site Configuration -> Environment variables) y corrígelo.")
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("ERROR DE CONFIGURACIÓN: Las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY están vacías o no configuradas en Netlify.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
