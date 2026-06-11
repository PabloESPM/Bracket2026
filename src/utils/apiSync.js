import { supabase } from '../supabaseClient.js'
import { propagateOfficialMatches } from './tournamentLogic.js'

// CONFIGURACIÓN DE LA API (Ejemplo con football-data.org o API-Football)
const API_CONFIG = {
  enabled: false,               // Cambiar a true cuando consigas la API funcional
  baseUrl: 'https://api.football-data.org/v4', // Ejemplo de URL base del proveedor
  apiKey: 'TU_API_KEY_AQUI',   // Introduce tu token o clave secreta de la API
  competitionId: 'WC',          // Código o ID del Mundial de la FIFA en tu API
}

/**
 * Función para sincronizar los marcadores de la base de datos oficial
 * con los datos en tiempo real de una API externa de fútbol.
 */
export async function syncMatchesWithAPI() {
  if (!API_CONFIG.enabled) {
    throw new Error(
      "La sincronización de la API no está habilitada. Por favor, configura tus claves y pon 'enabled: true' en 'src/utils/apiSync.js'."
    )
  }

  console.log('[API Sync] Iniciando sincronización con API externa...')

  // =========================================================================
  // EJEMPLO DE IMPLEMENTACIÓN REAL (Descomentar y ajustar según tu proveedor):
  // =========================================================================
  // const response = await fetch(`${API_CONFIG.baseUrl}/competitions/${API_CONFIG.competitionId}/matches`, {
  //   headers: { 'X-Auth-Token': API_CONFIG.apiKey }
  // })
  // if (!response.ok) throw new Error(`Error de comunicación con la API: ${response.statusText}`)
  // const data = await response.json()
  // const apiMatches = data.matches || []
  // =========================================================================

  // Mapeador mock provisional para demostrar el funcionamiento
  const apiMatches = [
    // Estructura de ejemplo típica de APIs de resultados
    // { api_match_id: 'A1_api', status: 'FINISHED', score: { fullTime: { home: 2, away: 1 } } }
  ]

  // 1. Descargar partidos actuales de la base de datos local
  const { data: localMatches, error: fetchErr } = await supabase
    .from('matches')
    .select('*')

  if (fetchErr) throw fetchErr

  let updatedCount = 0

  // 2. Procesar los marcadores oficiales
  for (const match of localMatches) {
    // Buscar la equivalencia del partido en la respuesta de la API externa
    const apiMatch = apiMatches.find(am => 
      am.api_match_id === match.api_match_id || 
      (am.homeTeam === match.home_team && am.awayTeam === match.away_team)
    )

    if (apiMatch && (apiMatch.status === 'FINISHED' || apiMatch.status === 'IN_PLAY')) {
      const hScore = apiMatch.score.fullTime.home
      const aScore = apiMatch.score.fullTime.away
      const isFinished = apiMatch.status === 'FINISHED'
      
      let winner = null
      if (match.stage !== 'group') {
        if (hScore > aScore) winner = match.home_team
        else if (aScore > hScore) winner = match.away_team
        else winner = apiMatch.penaltyWinner || null // En caso de prórrogas/penaltis
      }

      // Comprobar si hay cambios para reducir escrituras en la base de datos
      const hasScoreChanged = match.home_score !== hScore || match.away_score !== aScore
      const hasStatusChanged = match.status !== (isFinished ? 'finished' : 'live')

      if (hasScoreChanged || hasStatusChanged) {
        const { error: updateErr } = await supabase
          .from('matches')
          .update({
            home_score: hScore,
            away_score: aScore,
            winner: winner,
            status: isFinished ? 'finished' : 'live'
          })
          .eq('id', match.id)

        if (updateErr) throw updateErr

        // Actualizar el estado local en memoria para poder realizar la propagación del bracket a continuación
        match.home_score = hScore
        match.away_score = aScore
        match.winner = winner
        match.status = isFinished ? 'finished' : 'live'
        
        updatedCount++
      }
    }
  }

  // 3. Si se actualizó algún marcador, recalcular el avance del bracket y actualizar
  if (updatedCount > 0) {
    console.log(`[API Sync] Se actualizaron ${updatedCount} marcadores. Propagando brackets...`)
    const propagated = propagateOfficialMatches(localMatches)
    const updates = []

    propagated.forEach(m => {
      const orig = localMatches.find(o => o.id === m.id)
      if (orig && (orig.home_team !== m.home_team || orig.away_team !== m.away_team)) {
        updates.push({
          id: m.id,
          home_team: m.home_team,
          away_team: m.away_team
        })
      }
    })

    if (updates.length > 0) {
      for (const item of updates) {
        await supabase
          .from('matches')
          .update({ home_team: item.home_team, away_team: item.away_team })
          .eq('id', item.id)
      }
    }
  }

  return updatedCount
}
