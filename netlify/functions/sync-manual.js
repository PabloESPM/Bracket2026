/**
 * Netlify Function (HTTP): sync-manual
 * Endpoint accesible por el botón "Sincronizar API" del panel de admin.
 * Hace de proxy hacia football-data.org para evitar bloqueos CORS del navegador.
 * URL: /.netlify/functions/sync-manual
 * 
 * REQUIERE: Header "Authorization: Bearer <supabase_access_token>"
 * REQUIERE: El usuario debe tener is_admin = true en profiles.
 */

import { createClient } from '@supabase/supabase-js'
import { doSync } from './lib/doSync.js'

export default async function handler(req) {
  // Solo aceptar peticiones POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Método no permitido. Usa POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // --- Verificación de autenticación y autorización ---
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: 'Token de autenticación requerido.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ ok: false, error: 'Configuración de Supabase incompleta en el servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Crear un cliente Supabase con el token del usuario para verificar identidad
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })

  const { data: { user }, error: userError } = await supabaseAuth.auth.getUser()

  if (userError || !user) {
    return new Response(JSON.stringify({ ok: false, error: 'Token inválido o sesión expirada.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Verificar que el usuario es admin
  const { data: profile, error: profileError } = await supabaseAuth
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !profile.is_admin) {
    return new Response(JSON.stringify({ ok: false, error: 'Acceso denegado. Se requieren permisos de administrador.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // --- Ejecutar sincronización ---
  try {
    const result = await doSync()
    console.log(`[sync-manual] ✅ Sincronización manual por ${user.id}. Actualizados: ${result.updated} en ${result.ms}ms`)
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('[sync-manual] ❌ Error:', err.message)
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
