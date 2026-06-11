/**
 * Netlify Function (HTTP): sync-manual
 * Endpoint accesible por el botón "Sincronizar API" del panel de admin.
 * Hace de proxy hacia football-data.org para evitar bloqueos CORS del navegador.
 * URL: /.netlify/functions/sync-manual
 */

import { doSync } from './lib/doSync.js'

export default async function handler(req) {
  // Solo aceptar peticiones POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Método no permitido. Usa POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const result = await doSync()
    console.log(`[sync-manual] ✅ Sincronización manual completada. Actualizados: ${result.updated} en ${result.ms}ms`)
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
