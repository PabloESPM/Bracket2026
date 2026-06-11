import { createClient } from '@supabase/supabase-js'

let supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
let supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

// Strip single or double quotes if present
supabaseUrl = supabaseUrl.replace(/^["']|["']$/g, '')
supabaseAnonKey = supabaseAnonKey.replace(/^["']|["']$/g, '')

console.log('[Supabase] Inicializando cliente...', { 
  urlConfigured: !!supabaseUrl, 
  urlLength: supabaseUrl.length,
  urlStart: supabaseUrl.substring(0, 12)
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

