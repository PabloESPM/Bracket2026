// Netlify Scheduled Function: sync-api
// Se ejecuta automáticamente cada 5 minutos via cron job.
// URL de disparo automático: cron */5 * * * *

import { doSync } from './lib/doSync.js'

export default async function handler() {
  console.log(`[sync-api] Ejecución automática programada - ${new Date().toISOString()}`)
  try {
    const result = await doSync()
    console.log(`[sync-api] ✅ Completado. Partidos actualizados: ${result.updated} en ${result.ms}ms`)
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('[sync-api] ❌ Error en ejecución programada:', err.message)
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  schedule: '*/5 * * * *'
}
