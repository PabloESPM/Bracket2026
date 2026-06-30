/**
 * Módulo compartido de sincronización con football-data.org.
 * Usado tanto por sync-api.js (cron automático) como por sync-manual.js (botón admin).
 */

import { createClient } from '@supabase/supabase-js'

const FD_API_URL  = 'https://api.football-data.org/v4'
const FD_API_KEY = process.env.FD_API_KEY
const COMPETITION = 'WC'

import { TEAM_TRANSLATIONS, propagateOfficialMatches } from '../shared/tournamentCore.js'

function mapApiStageToDb(apiStage) {
  if (!apiStage) return ''
  const s = apiStage.toUpperCase()
  if (s === 'GROUP_STAGE') return 'group'
  if (s === 'LAST_32' || s === 'ROUND_OF_32') return 'r32'
  if (s === 'LAST_16' || s === 'ROUND_OF_16') return 'r16'
  if (s === 'QUARTER_FINALS') return 'qf'
  if (s === 'SEMI_FINALS') return 'sf'
  if (s === 'THIRD_PLACE' || s === 'THIRD') return 'third'
  if (s === 'FINAL') return 'final'
  return ''
}

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
    const apiMatch = (() => {
      // 3.1 Coincidencia directa por ID de la API
      const directMatch = apiMatches.find(am => am.id?.toString() === match.api_match_id)
      if (directMatch) return directMatch

      // 3.2 Buscar coincidencia por puntuación/heurística
      let bestMatch = null
      let maxScore = -1
      const dbStage = match.stage // 'group', 'r32', 'r16', etc.

      for (const am of apiMatches) {
        const apiStage = mapApiStageToDb(am.stage)
        // La fase debe coincidir siempre
        if (apiStage !== dbStage) continue

        let score = 0

        // Comparar nombres de equipos
        const homeName = am.homeTeam?.name || ''
        const awayName = am.awayTeam?.name || ''

        const apiHome = (lowercaseTranslations[homeName.toLowerCase().trim()] || homeName.trim()).toLowerCase().trim()
        const apiAway = (lowercaseTranslations[awayName.toLowerCase().trim()] || awayName.trim()).toLowerCase().trim()

        const dbHome = (match.home_team || '').toLowerCase().trim()
        const dbAway = (match.away_team || '').toLowerCase().trim()

        const homeMatched = (apiHome === dbHome || apiHome === dbAway)
        const awayMatched = (apiAway === dbHome || apiAway === dbAway)

        if (homeMatched && awayMatched) {
          score += 50
        } else if (homeMatched || awayMatched) {
          // Coincidencia parcial: un equipo coincide. Útil si el otro en la BD es un tercero incorrecto.
          score += 30
        }

        // Comparar fecha y hora de inicio
        if (am.utcDate && match.start_time) {
          const apiTime = new Date(am.utcDate).getTime()
          const dbTime = new Date(match.start_time).getTime()
          if (!isNaN(apiTime) && !isNaN(dbTime)) {
            const diffMin = Math.abs(apiTime - dbTime) / (1000 * 60)
            if (diffMin <= 15) {
              score += 20
            } else if (diffMin <= 120) {
              score += 10
            }
          }
        }

        // Para fase de grupos, requerimos que coincida al menos un equipo para evitar falsos positivos
        if (dbStage === 'group' && !homeMatched && !awayMatched) {
          continue
        }

        if (score > maxScore) {
          maxScore = score
          bestMatch = am
        }
      }

      // Solo consideramos válido si la puntuación supera un umbral mínimo
      // (20 para coincidir por hora exacta de inicio, o 30 por nombre de equipo)
      return maxScore >= 15 ? bestMatch : null
    })()

    if (!apiMatch) {
      // Log de diagnóstico para partidos sin coincidencia
      if (match.stage === 'group' || match.status === 'finished' || match.status === 'live') {
        console.warn(`[doSync] ⚠️ Partido DB ${match.id} (${match.home_team} vs ${match.away_team}, stage: ${match.stage}) no encontró coincidencia en la API`)
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

    // Capturar duración del partido: REGULAR, EXTRA_TIME, PENALTY_SHOOTOUT
    const apiDuration = apiMatch.score?.duration || 'REGULAR'

    // Capturar marcadores de penaltis (solo cuando hay tanda de penaltis)
    const hPenalties = apiMatch.score?.penalties?.home ?? null
    const aPenalties = apiMatch.score?.penalties?.away ?? null

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
        // Empate en tiempo reglamentario: usar el campo winner de la API (se decide por penaltis/ET)
        const apiWinnerSide = apiMatch.score?.winner // 'HOME_TEAM', 'AWAY_TEAM', or null
        if (apiWinnerSide === 'HOME_TEAM') {
          winner = TEAM_TRANSLATIONS[apiMatch.homeTeam?.name] || apiMatch.homeTeam?.name || match.home_team
        } else if (apiWinnerSide === 'AWAY_TEAM') {
          winner = TEAM_TRANSLATIONS[apiMatch.awayTeam?.name] || apiMatch.awayTeam?.name || match.away_team
        }
      }
    }

    // Para partidos de eliminatoria en vivo o finalizados: actualizar equipos reales desde la API.
    // IMPORTANTE: En R32 la BD puede tener equipos calculados desde grupos (equivocados).
    // La API nos da los equipos reales del sorteo. Los usamos para corregir la BD.
    let apiHomeTeam = match.home_team
    let apiAwayTeam = match.away_team
    if (match.stage !== 'group' && (isFinished || isLive)) {
      const translatedHome = TEAM_TRANSLATIONS[apiMatch.homeTeam?.name] || apiMatch.homeTeam?.name
      const translatedAway = TEAM_TRANSLATIONS[apiMatch.awayTeam?.name] || apiMatch.awayTeam?.name
      if (translatedHome) apiHomeTeam = translatedHome
      if (translatedAway) apiAwayTeam = translatedAway
    }

    // Validar si hay cambios en scores, estado, hora de inicio, api_match_id o equipos
    const timeChanged = new Date(match.start_time).getTime() !== new Date(apiMatch.utcDate).getTime()
    const apiIdChanged = match.api_match_id !== apiMatch.id?.toString()
    const scoreChanged = match.home_score !== hScore || match.away_score !== aScore
    const statusChanged = match.status !== newStatus
    const winnerChanged = match.winner !== winner
    const teamsChanged = match.home_team !== apiHomeTeam || match.away_team !== apiAwayTeam
    const durationChanged = (match.duration || 'REGULAR') !== apiDuration
    const penaltiesChanged = match.home_penalties !== hPenalties || match.away_penalties !== aPenalties

    const changed = scoreChanged || statusChanged || winnerChanged || timeChanged || apiIdChanged || teamsChanged || durationChanged || penaltiesChanged
    if (!changed) continue

    const updatePayload = {
      home_team:       apiHomeTeam,
      away_team:       apiAwayTeam,
      home_score:      hScore,
      away_score:      aScore,
      winner:          winner,
      status:          newStatus,
      start_time:      apiMatch.utcDate,
      duration:        apiDuration,
      home_penalties:  hPenalties,
      away_penalties:  aPenalties
    }
    if (apiMatch.id) updatePayload.api_match_id = apiMatch.id.toString()

    if (teamsChanged) {
      console.log(`[doSync] Partido ${match.id} - corrigiendo equipos: ${match.home_team} vs ${match.away_team} → ${apiHomeTeam} vs ${apiAwayTeam}`)
    }

    const { error: updateErr } = await supabase.from('matches').update(updatePayload).eq('id', match.id)
    if (updateErr) {
      // Fallback si fallan columnas nuevas (duration, penalties)
      const safePayload = {
        home_team: apiHomeTeam, away_team: apiAwayTeam,
        home_score: hScore, away_score: aScore,
        winner, status: newStatus, start_time: apiMatch.utcDate
      }
      if (apiMatch.id) safePayload.api_match_id = apiMatch.id.toString()
      const errMsg = updateErr.message || ''
      if (errMsg.includes('api_match_id') || errMsg.includes('duration') || errMsg.includes('penalties')) {
        const { error: e2 } = await supabase.from('matches').update(safePayload).eq('id', match.id)
        if (e2) throw e2
        console.warn(`[doSync] Columnas nuevas (duration/penalties) no disponibles aún. Ejecuta la migración SQL.`)
      } else {
        throw updateErr
      }
    }

    match.home_team = apiHomeTeam
    match.away_team = apiAwayTeam
    match.home_score = hScore
    match.away_score = aScore
    match.winner = winner
    match.status = newStatus
    match.start_time = apiMatch.utcDate
    match.api_match_id = apiMatch.id?.toString()
    match.duration = apiDuration
    match.home_penalties = hPenalties
    match.away_penalties = aPenalties
    updatedCount++
    console.log(`[doSync] Partido ${match.id} actualizado (scores, status, time, teams o id)`)
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
