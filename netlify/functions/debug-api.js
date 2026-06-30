import { createClient } from '@supabase/supabase-js'

export default async function handler(req) {
  try {
    const url  = process.env.VITE_SUPABASE_URL
    const srvKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const dbMatches = []
    let dbError = null

    if (url && srvKey) {
      try {
        const supabase = createClient(url, srvKey)
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .order('id', { ascending: true })
        if (error) {
          dbError = error.message
        } else {
          dbMatches.push(...(data || []))
        }
      } catch (err) {
        dbError = err.message
      }
    } else {
      dbError = 'Supabase credentials missing in process.env'
    }

    return new Response(JSON.stringify({
      ok: true,
      hasUrl: !!url,
      urlStart: url ? url.substring(0, 15) : null,
      hasSrvKey: !!srvKey,
      dbError,
      matchesCount: dbMatches.length,
      groupAMatches: dbMatches.filter(m => m.id.startsWith('A')).map(m => ({ id: m.id, home: m.home_team, away: m.away_team, score: `${m.home_score}-${m.away_score}`, status: m.status })),
      knockoutMatches: dbMatches.filter(m => m.stage !== 'group').map(m => ({ id: m.id, home: m.home_team, away: m.away_team, score: `${m.home_score}-${m.away_score}`, status: m.status, api_id: m.api_match_id }))
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
