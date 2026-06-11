import { supabase } from '../supabaseClient.js'
import { propagateOfficialMatches } from './tournamentLogic.js'

// CONFIGURACIÓN DE LA API
const API_CONFIG = {
  enabled: true,                                  // Cambiado a true para habilitar la API
  baseUrl: 'https://api.football-data.org/v4',
  apiKey: 'f04fbc5943114490b62819501ec31f6a',      // Clave de API provista por el usuario
  competitionId: 'WC',                            // WC = World Cup
}

// Diccionario de traducción para emparejar equipos de la API (en inglés) con los de nuestra BD (en español)
const TEAM_TRANSLATIONS = {
  "Mexico": "México",
  "South Africa": "Sudáfrica",
  "South Korea": "Corea del Sur",
  "Czechia": "Chequia",
  "Canada": "Canadá",
  "Bosnia and Herzegovina": "Bosnia-Herz.",
  "Qatar": "Qatar",
  "Switzerland": "Suiza",
  "Brazil": "Brasil",
  "Morocco": "Marruecos",
  "Haiti": "Haití",
  "Scotland": "Escocia",
  "USA": "Estados Unidos",
  "Paraguay": "Paraguay",
  "Australia": "Australia",
  "Turkey": "Turquía",
  "Germany": "Alemania",
  "Curaçao": "Curazao",
  "Ivory Coast": "Costa de Marfil",
  "Ecuador": "Ecuador",
  "Netherlands": "Países Bajos",
  "Japan": "Japón",
  "Sweden": "Suecia",
  "Tunisia": "Túnez",
  "Belgium": "Bélgica",
  "Egypt": "Egipto",
  "Iran": "Irán",
  "New Zealand": "Nueva Zelanda",
  "Spain": "España",
  "Cape Verde": "Cabo Verde",
  "Saudi Arabia": "Arabia Saudí",
  "Uruguay": "Uruguay",
  "France": "Francia",
  "Senegal": "Senegal",
  "Iraq": "Irak",
  "Norway": "Noruega",
  "Argentina": "Argentina",
  "Algeria": "Argelia",
  "Austria": "Austria",
  "Jordan": "Jordania",
  "Portugal": "Portugal",
  "DR Congo": "Congo RD",
  "Uzbekistan": "Uzbekistán",
  "Colombia": "Colombia",
  "England": "Inglaterra",
  "Croatia": "Croacia",
  "Ghana": "Ghana",
  "Panama": "Panamá"
}

/**
 * Función para sincronizar los marcadores de la base de datos oficial
 * con los datos en tiempo real de la API externa de fútbol.
 */
export async function syncMatchesWithAPI() {
  if (!API_CONFIG.enabled) {
    throw new Error(
      "La sincronización de la API no está habilitada. Por favor, configura tus claves y pon 'enabled: true' en 'src/utils/apiSync.js'."
    )
  }

  console.log('[API Sync] Iniciando sincronización con API de football-data.org...')

  // 1. Petición HTTP a la API
  const response = await fetch(`${API_CONFIG.baseUrl}/competitions/${API_CONFIG.competitionId}/matches`, {
    headers: {
      'X-Auth-Token': API_CONFIG.apiKey
    }
  })

  // Obtener headers de control de rate limiting / throttling
  const requestsAvailable = response.headers.get('X-RequestsAvailable')
  const requestCounterReset = response.headers.get('X-RequestCounter-Reset')

  if (requestsAvailable !== null) {
    console.log(`[API Sync] Peticiones disponibles en este minuto: ${requestsAvailable}`)
    if (parseInt(requestsAvailable, 10) < 3) {
      console.warn(`[API Sync] Advertencia: Quedan pocas peticiones disponibles (${requestsAvailable} restantes).`)
    }
  }

  // Si se supera el límite de peticiones (HTTP 429)
  if (response.status === 429) {
    const secondsToWait = requestCounterReset ? parseInt(requestCounterReset, 10) : 60
    throw new Error(
      `Has superado el límite de peticiones (Rate Limit). Por favor, espera ${secondsToWait} segundos antes de volver a intentarlo.`
    )
  }

  if (!response.ok) {
    throw new Error(`Error de comunicación con la API: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const apiMatches = data.matches || []

  // 2. Descargar partidos actuales de la base de datos local
  const { data: localMatches, error: fetchErr } = await supabase
    .from('matches')
    .select('*')

  if (fetchErr) throw fetchErr

  let updatedCount = 0

  // 3. Procesar y comparar marcadores
  for (const match of localMatches) {
    // Buscar el partido equivalente en la API usando el ID oficial o coincidencia de equipos traducidos
    const apiMatch = apiMatches.find(am => {
      // Traducir nombres de los equipos de la API al español
      const apiHomeTranslated = TEAM_TRANSLATIONS[am.homeTeam?.name] || am.homeTeam?.name
      const apiAwayTranslated = TEAM_TRANSLATIONS[am.awayTeam?.name] || am.awayTeam?.name
      
      return (
        am.id?.toString() === match.api_match_id ||
        (apiHomeTranslated === match.home_team && apiAwayTranslated === match.away_team)
      )
    })

    if (apiMatch && (apiMatch.status === 'FINISHED' || apiMatch.status === 'IN_PLAY')) {
      const hScore = apiMatch.score.fullTime.home
      const aScore = apiMatch.score.fullTime.away
      const isFinished = apiMatch.status === 'FINISHED'
      
      let winner = null
      if (match.stage !== 'group') {
        if (hScore > aScore) winner = match.home_team
        else if (aScore > hScore) winner = match.away_team
        else {
          // Si hay empate al final del tiempo regular, buscar el ganador del desempate (prórrogas/penaltis)
          const apiWinnerName = apiMatch.score.winner === 'HOME_TEAM' ? apiMatch.homeTeam?.name : apiMatch.awayTeam?.name
          winner = TEAM_TRANSLATIONS[apiWinnerName] || apiWinnerName || null
        }
      }

      const hasScoreChanged = match.home_score !== hScore || match.away_score !== aScore
      const hasStatusChanged = match.status !== (isFinished ? 'finished' : 'live')

      if (hasScoreChanged || hasStatusChanged) {
        // Actualizar el partido en Supabase
        const { error: updateErr } = await supabase
          .from('matches')
          .update({
            home_score: hScore,
            away_score: aScore,
            winner: winner,
            status: isFinished ? 'finished' : 'live',
            api_match_id: apiMatch.id?.toString() // Guardamos el ID oficial para futuras búsquedas directas
          })
          .eq('id', match.id)

        if (updateErr) throw updateErr

        // Actualizar el objeto local en memoria para poder realizar la propagación del bracket a continuación
        match.home_score = hScore
        match.away_score = aScore
        match.winner = winner
        match.status = isFinished ? 'finished' : 'live'
        match.api_match_id = apiMatch.id?.toString()
        
        updatedCount++
      }
    }
  }

  // 4. Propagación automática del avance del bracket si algún marcador cambió
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

