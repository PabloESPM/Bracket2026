/**
 * Netlify Function de diagnóstico: debug-api
 * Llama a football-data.org y devuelve un resumen de lo que recibe.
 * URL: /.netlify/functions/debug-api
 * SOLO PARA DIAGNÓSTICO - eliminar después.
 */

const FD_API_URL = 'https://api.football-data.org/v4'
const FD_API_KEY = 'f04fbc5943114490b62819501ec31f6a'

export default async function handler() {
  try {
    // Probamos con y sin season=2026
    const [res2026, resNoSeason] = await Promise.all([
      fetch(`${FD_API_URL}/competitions/WC/matches?season=2026`, {
        headers: { 'X-Auth-Token': FD_API_KEY }
      }),
      fetch(`${FD_API_URL}/competitions/WC/matches`, {
        headers: { 'X-Auth-Token': FD_API_KEY }
      })
    ])

    const data2026 = await res2026.json()
    const dataNoSeason = await resNoSeason.json()

    // Resumen compacto
    const summarize = (data, label) => {
      if (data.error || data.message) {
        return { label, error: data.error || data.message, status: data.status || 'unknown' }
      }
      const matches = data.matches || []
      const inPlay = matches.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED')
      const finished = matches.filter(m => m.status === 'FINISHED').slice(-5)
      const firstFew = matches.slice(0, 3)
      return {
        label,
        totalMatches: matches.length,
        competition: data.competition?.name,
        season: data.filters?.season,
        inPlayMatches: inPlay.map(m => ({
          id: m.id,
          home: m.homeTeam?.name,
          away: m.awayTeam?.name,
          status: m.status,
          score: m.score?.fullTime
        })),
        recentFinished: finished.map(m => ({
          id: m.id,
          home: m.homeTeam?.name,
          away: m.awayTeam?.name,
          status: m.status,
          score: m.score?.fullTime
        })),
        firstMatches: firstFew.map(m => ({
          id: m.id,
          home: m.homeTeam?.name,
          away: m.awayTeam?.name,
          status: m.status
        }))
      }
    }

    return new Response(JSON.stringify({
      withSeason2026: summarize(data2026, 'season=2026'),
      withoutSeason: summarize(dataNoSeason, 'no season param'),
      httpStatus: { with2026: res2026.status, withoutSeason: resNoSeason.status }
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
