import { createClient } from '@supabase/supabase-js'

const FD_API_URL  = 'https://api.football-data.org/v4'
const FD_API_KEY = process.env.FD_API_KEY
const COMPETITION = 'WC'

export default async function handler(req) {
  try {
    const url  = process.env.VITE_SUPABASE_URL
    const srvKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !srvKey) {
      return new Response(JSON.stringify({ ok: false, error: 'Supabase keys missing in Netlify' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(url, srvKey)

    // 1. Fetch Supabase matches
    const { data: dbMatches, error: dbErr } = await supabase
      .from('matches')
      .select('*')
      .order('id', { ascending: true })

    if (dbErr) throw dbErr

    // 2. Fetch football-data.org matches
    let apiMatches = []
    let apiError = null
    if (FD_API_KEY) {
      try {
        const res = await fetch(`${FD_API_URL}/competitions/${COMPETITION}/matches?season=2026`, {
          headers: { 'X-Auth-Token': FD_API_KEY }
        })
        if (res.ok) {
          const data = await res.json()
          apiMatches = data.matches || []
        } else {
          apiError = `API returned ${res.status}: ${res.statusText}`
        }
      } catch (err) {
        apiError = err.message
      }
    } else {
      apiError = 'FD_API_KEY missing'
    }

    // Filter Group A matches for quick debug
    const dbGroupAMatches = dbMatches.filter(m => m.id.startsWith('A'))
    const apiGroupAMatches = apiMatches.filter(m => m.group === 'GROUP_A' || (m.homeTeam?.name === 'Mexico' || m.awayTeam?.name === 'Mexico' || m.homeTeam?.name === 'Germany' || m.awayTeam?.name === 'Germany'))

    return new Response(JSON.stringify({
      ok: true,
      apiError,
      dbGroupAMatches,
      apiGroupAMatchesSample: apiGroupAMatches.slice(0, 10),
      dbAllMatchesSample: dbMatches.map(m => ({ id: m.id, home: m.home_team, away: m.away_team, score: `${m.home_score}-${m.away_score}`, status: m.status, winner: m.winner }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
