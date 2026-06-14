/**
 * Módulo compartido de sincronización con football-data.org.
 * Usado tanto por sync-api.js (cron automático) como por sync-manual.js (botón admin).
 */

import { createClient } from '@supabase/supabase-js'

const FD_API_URL  = 'https://api.football-data.org/v4'
const FD_API_KEY = process.env.FD_API_KEY
const COMPETITION = 'WC'

import { TEAM_TRANSLATIONS, propagateOfficialMatches } from '../../shared/tournamentCore.js'

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

  // 2. Leer partidos de Supabase
  const { data: localMatches, error: fetchErr } = await supabase.from('matches').select('*')
  if (fetchErr) throw fetchErr

  let updatedCount = 0

  // 3. Comparar y actualizar
  for (const match of localMatches) {
    const apiMatch = apiMatches.find(am => {
      const apiHome = TEAM_TRANSLATIONS[am.homeTeam?.name] || am.homeTeam?.name
      const apiAway = TEAM_TRANSLATIONS[am.awayTeam?.name] || am.awayTeam?.name
      return am.id?.toString() === match.api_match_id || (apiHome === match.home_team && apiAway === match.away_team)
    })

    if (!apiMatch) continue

    const isFinished = apiMatch.status === 'FINISHED'
    const isLive     = apiMatch.status === 'IN_PLAY' || apiMatch.status === 'PAUSED'

    if (!isFinished && !isLive) continue

    const hScore = apiMatch.score?.fullTime?.home
    const aScore = apiMatch.score?.fullTime?.away
    // El plan gratuito devuelve null en fullTime durante IN_PLAY. Solo actualizamos
    // scores cuando el partido está FINISHED con valores reales.
    const hasValidScores = hScore !== null && hScore !== undefined && aScore !== null && aScore !== undefined

    const newStatus = isFinished ? 'finished' : 'live'

    if (isLive && !hasValidScores) {
      // Partido en curso en plan gratuito: solo actualizar status si ha cambiado
      if (match.status !== 'live') {
        const updatePayload = { status: 'live' }
        // api_match_id es opcional - solo añadir si la columna existe en el schema
        try { updatePayload.api_match_id = apiMatch.id?.toString() } catch (_) {}
        const { error } = await supabase.from('matches').update(updatePayload).eq('id', match.id)
        if (error) {
          // Si el error es por columna inexistente, reintentar sin api_match_id
          if (error.message?.includes('api_match_id')) {
            const { error: e2 } = await supabase.from('matches').update({ status: 'live' }).eq('id', match.id)
            if (e2) throw e2
          } else {
            throw error
          }
        }
        match.status = 'live'
        updatedCount++
        console.log(`[doSync] Partido ${match.id} comenzó (score pendiente al final del partido)`)
      }
      continue
    }

    if (isFinished && !hasValidScores) {
      // Partido finalizado en plan gratuito pero sin scores en la API: solo actualizar status si ha cambiado
      if (match.status !== 'finished') {
        const updatePayload = { status: 'finished' }
        try { updatePayload.api_match_id = apiMatch.id?.toString() } catch (_) {}
        const { error } = await supabase.from('matches').update(updatePayload).eq('id', match.id)
        if (error) {
          if (error.message?.includes('api_match_id')) {
            const { error: e2 } = await supabase.from('matches').update({ status: 'finished' }).eq('id', match.id)
            if (e2) throw e2
          } else {
            throw error
          }
        }
        match.status = 'finished'
        updatedCount++
        console.log(`[doSync] Partido ${match.id} finalizó (esperando ingreso manual de marcador)`)
      }
      continue
    }


    // A partir de aquí: FINISHED con scores válidos (o IN_PLAY con livescores de pago)
    let winner = null
    if (match.stage !== 'group' && hasValidScores) {
      if (hScore > aScore) winner = match.home_team
      else if (aScore > hScore) winner = match.away_team
      else {
        const wName = apiMatch.score?.winner === 'HOME_TEAM' ? apiMatch.homeTeam?.name : apiMatch.awayTeam?.name
        winner = TEAM_TRANSLATIONS[wName] || wName || null
      }
    }

    const changed = match.home_score !== hScore || match.away_score !== aScore || match.status !== newStatus
    if (!changed) continue

    const { error: updateErr } = await supabase.from('matches').update({
      home_score:   hScore,
      away_score:   aScore,
      winner:       winner,
      status:       newStatus,
    }).eq('id', match.id)

    if (updateErr) {
      // Si falla por api_match_id inexistente, reintentar sin él (la columna es opcional)
      if (updateErr.message?.includes('api_match_id')) {
        const { error: e2 } = await supabase.from('matches').update({
          home_score: hScore, away_score: aScore, winner, status: newStatus
        }).eq('id', match.id)
        if (e2) throw e2
      } else {
        throw updateErr
      }
    }

    match.home_score = hScore; match.away_score = aScore
    match.winner = winner; match.status = isFinished ? 'finished' : 'live'
    match.api_match_id = apiMatch.id?.toString()
    updatedCount++
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
