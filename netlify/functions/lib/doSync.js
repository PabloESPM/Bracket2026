/**
 * Módulo compartido de sincronización con football-data.org.
 * Usado tanto por sync-api.js (cron automático) como por sync-manual.js (botón admin).
 */

import { createClient } from '@supabase/supabase-js'

const FD_API_URL  = 'https://api.football-data.org/v4'
const FD_API_KEY = process.env.FD_API_KEY
const COMPETITION = 'WC'

import { TEAM_TRANSLATIONS, propagateOfficialMatches } from '../shared/tournamentCore.js'

export async function doSync() {
  const t0 = Date.now()
  const url  = process.env.VITE_SUPABASE_URL
  const srvKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !srvKey) throw new Error('Variables VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas en Netlify.')
  if (!FD_API_KEY) throw new Error('Variable FD_API_KEY no configurada en Netlify.')

  const supabase = createClient(url, srvKey)

  // 1. Llamada a la API de football-data.org (season=2026 para el Mundial 2026)
  const res = await fetch(`${FD_API_URL}/competitions/${COMPETITION}/matches?season=2026`, {
    headers: { 'X-Auth-Token': FD_API_KEY }
  })

  const requestsAvailable  = res.headers.get('X-RequestsAvailable')
  const requestCounterReset = res.headers.get('X-RequestCounter-Reset')

  if (requestsAvailable !== null) {
    console.log(`[doSync] Peticiones disponibles: ${requestsAvailable}`)
  }

  if (res.status === 429) {
    const wait = requestCounterReset ? parseInt(requestCounterReset, 10) : 60
    throw new Error(`Rate limit alcanzado. Espera ${wait} segundos e inténtalo de nuevo.`)
  }
  if (!res.ok) throw new Error(`API externa devolvió ${res.status}: ${res.statusText}`)

  const data = await res.json()
  const apiMatches = data.matches || []
  console.log(`[doSync] Recibidos ${apiMatches.length} partidos de football-data.org.`)

  // Log de diagnóstico: mostrar los primeros nombres de equipos que devuelve la API
  if (apiMatches.length > 0) {
    const sampleNames = apiMatches.slice(0, 8).map(am => `${am.homeTeam?.name} vs ${am.awayTeam?.name}`)
    console.log(`[doSync] Muestra de nombres API:`, sampleNames)
  }

  // 2. Leer partidos de Supabase
  const { data: localMatches, error: fetchErr } = await supabase.from('matches').select('*')
  if (fetchErr) throw fetchErr

  let updatedCount = 0

  // Pre-build lowercase translations map for case-insensitive lookup
  const lowercaseTranslations = {}
  Object.keys(TEAM_TRANSLATIONS).forEach(key => {
    lowercaseTranslations[key.toLowerCase()] = TEAM_TRANSLATIONS[key]
  })

  // 3. Comparar y actualizar
  for (const match of localMatches) {
    const apiMatch = apiMatches.find(am => {
      // Coincidencia directa por ID de la API (si ya fue mapeado previamente)
      if (am.id?.toString() === match.api_match_id) return true

      const homeName = am.homeTeam?.name || ''
      const awayName = am.awayTeam?.name || ''
      
      const apiHome = (lowercaseTranslations[homeName.toLowerCase().trim()] || homeName.trim()).toLowerCase().trim()
      const apiAway = (lowercaseTranslations[awayName.toLowerCase().trim()] || awayName.trim()).toLowerCase().trim()
      
      const dbHome = (match.home_team || '').toLowerCase().trim()
      const dbAway = (match.away_team || '').toLowerCase().trim()
      
      // Coincidencia directa: home=home, away=away
      if (apiHome === dbHome && apiAway === dbAway) return true
      
      // Coincidencia cruzada: la API puede invertir el orden local/visitante
      if (apiHome === dbAway && apiAway === dbHome) return true
      
      return false
    })

    if (!apiMatch) {
      // Log de diagnóstico para partidos de fase de grupos sin coincidencia
      if (match.stage === 'group') {
        console.warn(`[doSync] ⚠️ Partido ${match.id} (${match.home_team} vs ${match.away_team}) no encontró coincidencia en la API`)
      }
      continue
    }

    const isFinished = apiMatch.status === 'FINISHED'
    const isLive     = apiMatch.status === 'IN_PLAY' || 
                       apiMatch.status === 'PAUSED' || 
                       apiMatch.status === 'EXTRA_TIME' || 
                       apiMatch.status === 'PENALTY_SHOOTOUT'

    let newStatus = 'scheduled'
    if (isFinished) newStatus = 'finished'
    else if (isLive) newStatus = 'live'

    // Intentar obtener scores de múltiples fuentes del API
    // (el plan gratuito a veces solo tiene halfTime o regularTime)
    let hScore = apiMatch.score?.fullTime?.home
    let aScore = apiMatch.score?.fullTime?.away

    // Fallback a regularTime si fullTime no tiene datos
    if ((hScore === null || hScore === undefined) && apiMatch.score?.regularTime) {
      hScore = apiMatch.score.regularTime.home
      aScore = apiMatch.score.regularTime.away
    }

    // Fallback a halfTime si tampoco hay regularTime
    if ((hScore === null || hScore === undefined) && apiMatch.score?.halfTime) {
      hScore = apiMatch.score.halfTime.home
      aScore = apiMatch.score.halfTime.away
    }

    const hasValidScores = hScore !== null && hScore !== undefined && aScore !== null && aScore !== undefined

    // 3.1. Caso particular de partidos en vivo en plan gratuito sin scores
    if (isLive && !hasValidScores) {
      const timeChanged = new Date(match.start_time).getTime() !== new Date(apiMatch.utcDate).getTime()
      const apiIdChanged = match.api_match_id !== apiMatch.id?.toString()
      const statusChanged = match.status !== 'live'
      
      if (statusChanged || timeChanged || apiIdChanged) {
        const updatePayload = { 
          status: 'live',
          start_time: apiMatch.utcDate
        }
        if (apiMatch.id) updatePayload.api_match_id = apiMatch.id.toString()

        const { error } = await supabase.from('matches').update(updatePayload).eq('id', match.id)
        if (error) {
          if (error.message?.includes('api_match_id')) {
            const { error: e2 } = await supabase.from('matches').update({ status: 'live', start_time: apiMatch.utcDate }).eq('id', match.id)
            if (e2) throw e2
          } else {
            throw error
          }
        }
        match.status = 'live'
        match.start_time = apiMatch.utcDate
        match.api_match_id = apiMatch.id?.toString()
        updatedCount++
        console.log(`[doSync] Partido ${match.id} comenzó o actualizó horario/id`)
      }
      continue
    }

    // 3.2. Caso particular de partidos finalizados en plan gratuito sin scores en API
    if (isFinished && !hasValidScores) {
      const timeChanged = new Date(match.start_time).getTime() !== new Date(apiMatch.utcDate).getTime()
      const apiIdChanged = match.api_match_id !== apiMatch.id?.toString()
      const statusChanged = match.status !== 'finished'
      
      if (statusChanged || timeChanged || apiIdChanged) {
        const updatePayload = { 
          status: 'finished',
          start_time: apiMatch.utcDate
        }
        if (apiMatch.id) updatePayload.api_match_id = apiMatch.id.toString()

        const { error } = await supabase.from('matches').update(updatePayload).eq('id', match.id)
        if (error) {
          if (error.message?.includes('api_match_id')) {
            const { error: e2 } = await supabase.from('matches').update({ status: 'finished', start_time: apiMatch.utcDate }).eq('id', match.id)
            if (e2) throw e2
          } else {
            throw error
          }
        }
        match.status = 'finished'
        match.start_time = apiMatch.utcDate
        match.api_match_id = apiMatch.id?.toString()
        updatedCount++
        console.log(`[doSync] Partido ${match.id} finalizó o actualizó horario/id (sin marcadores en API)`)
      }
      continue
    }

    // 3.3. Partidos programados, o partidos en curso/finalizados con marcadores válidos
    let winner = match.winner || null
    if (match.stage !== 'group' && hasValidScores) {
      if (hScore > aScore) winner = match.home_team
      else if (aScore > hScore) winner = match.away_team
      else {
        const wName = apiMatch.score?.winner === 'HOME_TEAM' ? apiMatch.homeTeam?.name : apiMatch.awayTeam?.name
        winner = TEAM_TRANSLATIONS[wName] || wName || null
      }
    }

    // Validar si hay cambios en scores, estado, hora de inicio o api_match_id
    const timeChanged = new Date(match.start_time).getTime() !== new Date(apiMatch.utcDate).getTime()
    const apiIdChanged = match.api_match_id !== apiMatch.id?.toString()
    const scoreChanged = match.home_score !== hScore || match.away_score !== aScore
    const statusChanged = match.status !== newStatus
    const winnerChanged = match.winner !== winner

    const changed = scoreChanged || statusChanged || winnerChanged || timeChanged || apiIdChanged
    if (!changed) continue

    const updatePayload = {
      home_score:   hScore,
      away_score:   aScore,
      winner:       winner,
      status:       newStatus,
      start_time:   apiMatch.utcDate
    }
    if (apiMatch.id) updatePayload.api_match_id = apiMatch.id.toString()

    const { error: updateErr } = await supabase.from('matches').update(updatePayload).eq('id', match.id)
    if (updateErr) {
      if (updateErr.message?.includes('api_match_id')) {
        const { error: e2 } = await supabase.from('matches').update({
          home_score: hScore, away_score: aScore, winner, status: newStatus, start_time: apiMatch.utcDate
        }).eq('id', match.id)
        if (e2) throw e2
      } else {
        throw updateErr
      }
    }

    match.home_score = hScore
    match.away_score = aScore
    match.winner = winner
    match.status = newStatus
    match.start_time = apiMatch.utcDate
    match.api_match_id = apiMatch.id?.toString()
    updatedCount++
    console.log(`[doSync] Partido ${match.id} actualizado (scores, status, time o id)`)
  }

  // 4. Propagar bracket si hubo cambios
  if (updatedCount > 0) {
    const propagated = propagateOfficialMatches(localMatches)
    for (const m of propagated) {
      const orig = localMatches.find(o => o.id === m.id)
      if (orig && (orig.home_team !== m.home_team || orig.away_team !== m.away_team)) {
        await supabase.from('matches').update({ home_team: m.home_team, away_team: m.away_team }).eq('id', m.id)
      }
    }
  }

  return { ok: true, updated: updatedCount, ms: Date.now() - t0 }
}
