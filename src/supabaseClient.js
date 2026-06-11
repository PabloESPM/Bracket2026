import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

console.log('[Supabase] Inicializando cliente reactivo...', { urlConfigured: !!supabaseUrl })

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
