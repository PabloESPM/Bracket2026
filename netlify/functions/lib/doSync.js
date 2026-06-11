/**
 * Módulo compartido de sincronización con football-data.org.
 * Usado tanto por sync-api.js (cron automático) como por sync-manual.js (botón admin).
 */

import { createClient } from '@supabase/supabase-js'

const FD_API_URL  = 'https://api.football-data.org/v4'
const FD_API_KEY  = 'f04fbc5943114490b62819501ec31f6a'
const COMPETITION = 'WC'

// ─── Diccionario inglés → español ─────────────────────────────────────────────
const TEAM_TRANSLATIONS = {
  "Mexico": "México", "South Africa": "Sudáfrica", "South Korea": "Corea del Sur",
  "Czechia": "Chequia", "Canada": "Canadá", "Bosnia and Herzegovina": "Bosnia-Herz.",
  "Qatar": "Qatar", "Switzerland": "Suiza", "Brazil": "Brasil", "Morocco": "Marruecos",
  "Haiti": "Haití", "Scotland": "Escocia", "USA": "Estados Unidos", "Paraguay": "Paraguay",
  "Australia": "Australia", "Turkey": "Turquía", "Germany": "Alemania",
  "Curaçao": "Curazao", "Ivory Coast": "Costa de Marfil", "Ecuador": "Ecuador",
  "Netherlands": "Países Bajos", "Japan": "Japón", "Sweden": "Suecia",
  "Tunisia": "Túnez", "Belgium": "Bélgica", "Egypt": "Egipto", "Iran": "Irán",
  "New Zealand": "Nueva Zelanda", "Spain": "España", "Cape Verde": "Cabo Verde",
  "Saudi Arabia": "Arabia Saudí", "Uruguay": "Uruguay", "France": "Francia",
  "Senegal": "Senegal", "Iraq": "Irak", "Norway": "Noruega", "Argentina": "Argentina",
  "Algeria": "Argelia", "Austria": "Austria", "Jordan": "Jordania",
  "Portugal": "Portugal", "DR Congo": "Congo RD", "Uzbekistan": "Uzbekistán",
  "Colombia": "Colombia", "England": "Inglaterra", "Croatia": "Croacia",
  "Ghana": "Ghana", "Panama": "Panamá"
}

// ─── Datos estáticos de grupos ────────────────────────────────────────────────
const GROUPS_DATA = {
  A: ["México","Sudáfrica","Corea del Sur","Chequia"],
  B: ["Canadá","Bosnia-Herz.","Qatar","Suiza"],
  C: ["Brasil","Marruecos","Haití","Escocia"],
  D: ["Estados Unidos","Paraguay","Australia","Turquía"],
  E: ["Alemania","Curazao","Costa de Marfil","Ecuador"],
  F: ["Países Bajos","Japón","Suecia","Túnez"],
  G: ["Bélgica","Egipto","Irán","Nueva Zelanda"],
  H: ["España","Cabo Verde","Arabia Saudí","Uruguay"],
  I: ["Francia","Senegal","Irak","Noruega"],
  J: ["Argentina","Argelia","Austria","Jordania"],
  K: ["Portugal","Congo RD","Uzbekistán","Colombia"],
  L: ["Inglaterra","Croacia","Ghana","Panamá"]
}

const TEAMS_RATING = {
  "México":82,"Sudáfrica":68,"Corea del Sur":78,"Chequia":76,"Canadá":75,
  "Bosnia-Herz.":71,"Qatar":70,"Suiza":79,"Brasil":85,"Marruecos":82,
  "Haití":64,"Escocia":73,"Estados Unidos":79,"Paraguay":74,"Australia":75,
  "Turquía":77,"Alemania":84,"Curazao":63,"Costa de Marfil":78,"Ecuador":78,
  "Países Bajos":83,"Japón":81,"Suecia":77,"Túnez":71,"Bélgica":81,
  "Egipto":76,"Irán":77,"Nueva Zelanda":62,"España":85,"Cabo Verde":72,
  "Arabia Saudí":70,"Uruguay":82,"Francia":86,"Senegal":78,"Irak":71,
  "Noruega":76,"Argentina":87,"Argelia":75,"Austria":77,"Jordania":68,
  "Portugal":85,"Congo RD":71,"Uzbekistán":72,"Colombia":81,"Inglaterra":85,
  "Croacia":80,"Ghana":72,"Panamá":73
}

function calculateGroupStandings(matches, originalTeams) {
  const stats = {}
  originalTeams.forEach(t => {
    stats[t] = { team: t, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 }
  })
  matches.forEach(m => {
    if (m.played && m.scoreHome !== null && m.scoreAway !== null) {
      const sH = parseInt(m.scoreHome), sA = parseInt(m.scoreAway)
      stats[m.home].pj++; stats[m.away].pj++
      stats[m.home].gf += sH; stats[m.home].gc += sA
      stats[m.away].gf += sA; stats[m.away].gc += sH
      if (sH > sA) { stats[m.home].g++; stats[m.home].pts += 3; stats[m.away].p++ }
      else if (sH < sA) { stats[m.away].g++; stats[m.away].pts += 3; stats[m.home].p++ }
      else { stats[m.home].e++; stats[m.home].pts++; stats[m.away].e++; stats[m.away].pts++ }
    }
  })
  const standings = Object.values(stats)
  standings.forEach(s => { s.dg = s.gf - s.gc })
  standings.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.dg !== a.dg) return b.dg - a.dg
    if (b.gf !== a.gf) return b.gf - a.gf
    const dm = matches.find(m => m.played && ((m.home===a.team&&m.away===b.team)||(m.home===b.team&&m.away===a.team)))
    if (dm) { const aS = dm.home===a.team?dm.scoreHome:dm.scoreAway; const bS = dm.home===b.team?dm.scoreHome:dm.scoreAway; if(aS!==bS) return bS-aS }
    return (TEAMS_RATING[b.team]||70) - (TEAMS_RATING[a.team]||70)
  })
  return standings
}

function getR32Mapping(groups) {
  const getG = (k, pos) => groups[k]?.standings[pos]?.team || null
  const thirds = []
  Object.keys(groups).forEach(gKey => {
    const s = groups[gKey]?.standings
    if (s && s.length >= 3) thirds.push({ team: s[2].team, pts: s[2].pts, dg: s[2].dg, gf: s[2].gf, group: gKey })
  })
  thirds.sort((a, b) => b.pts!==a.pts?b.pts-a.pts:b.dg!==a.dg?b.dg-a.dg:b.gf!==a.gf?b.gf-a.gf:a.group.localeCompare(b.group))
  const bestEight = thirds.slice(0, 8)
  const constraints = {
    P1:['A','B','C','D','F'], P2:['C','D','F','G','H'], P7:['B','E','F','I','J'],
    P8:['A','E','H','I','J'], P11:['C','E','F','H','I'], P12:['E','H','I','J','K'],
    P15:['E','F','G','I','J'], P16:['D','E','I','J','L']
  }
  const slots = ['P1','P2','P7','P8','P11','P12','P15','P16']
  const resolved = {}; slots.forEach(s => resolved[s] = null)
  const assigned = new Set()
  const solve = (idx) => {
    if (idx === slots.length) return true
    const slot = slots[idx]
    for (let i = 0; i < bestEight.length; i++) {
      if (assigned.has(i)) continue
      if (constraints[slot].includes(bestEight[i].group)) {
        assigned.add(i); resolved[slot] = bestEight[i].team
        if (solve(idx + 1)) return true
        assigned.delete(i); resolved[slot] = null
      }
    }
    return false
  }
  solve(0)
  return {
    P1:{home:getG('E',0),away:resolved.P1}, P2:{home:getG('I',0),away:resolved.P2},
    P3:{home:getG('A',1),away:getG('B',1)}, P4:{home:getG('F',0),away:getG('C',1)},
    P5:{home:getG('K',1),away:getG('L',1)}, P6:{home:getG('H',0),away:getG('J',1)},
    P7:{home:getG('D',0),away:resolved.P7}, P8:{home:getG('G',0),away:resolved.P8},
    P9:{home:getG('C',0),away:getG('F',1)}, P10:{home:getG('E',1),away:getG('I',1)},
    P11:{home:getG('A',0),away:resolved.P11}, P12:{home:getG('L',0),away:resolved.P12},
    P13:{home:getG('J',0),away:getG('H',1)}, P14:{home:getG('D',1),away:getG('G',1)},
    P15:{home:getG('B',0),away:resolved.P15}, P16:{home:getG('K',0),away:resolved.P16},
  }
}

function propagateOfficialMatches(allMatches) {
  const mm = {}
  allMatches.forEach(m => { mm[m.id] = { ...m } })
  const groups = {}
  Object.keys(GROUPS_DATA).forEach(gKey => {
    groups[gKey] = { standings: [], matches: [] }
    for (let i = 1; i <= 6; i++) {
      const m = mm[`${gKey}${i}`]
      if (m) groups[gKey].matches.push({ home: m.home_team, away: m.away_team, scoreHome: m.home_score, scoreAway: m.away_score, played: m.status === 'finished' })
    }
    groups[gKey].standings = calculateGroupStandings(groups[gKey].matches, GROUPS_DATA[gKey])
  })
  const r32 = getR32Mapping(groups)
  Object.keys(r32).forEach(id => {
    if (mm[id]) { if (r32[id].home) mm[id].home_team = r32[id].home; if (r32[id].away) mm[id].away_team = r32[id].away }
  })
  const W = (id) => { const m = mm[id]; return m && m.status === 'finished' ? m.winner : null }
  const L = (id) => { const m = mm[id]; if (!m || m.status !== 'finished' || !m.winner) return null; return m.winner === m.home_team ? m.away_team : m.home_team }
  ;[['O1','P1','P2'],['O2','P3','P4'],['O3','P5','P6'],['O4','P7','P8'],['O5','P9','P10'],['O6','P11','P12'],['O7','P13','P14'],['O8','P15','P16']].forEach(([id,m1,m2]) => { const w1=W(m1),w2=W(m2); if(w1&&mm[id]) mm[id].home_team=w1; if(w2&&mm[id]) mm[id].away_team=w2 })
  ;[['Q1','O1','O2'],['Q2','O3','O4'],['Q3','O5','O6'],['Q4','O7','O8']].forEach(([id,m1,m2]) => { const w1=W(m1),w2=W(m2); if(w1&&mm[id]) mm[id].home_team=w1; if(w2&&mm[id]) mm[id].away_team=w2 })
  ;[['S1','Q1','Q2'],['S2','Q3','Q4']].forEach(([id,m1,m2]) => { const w1=W(m1),w2=W(m2); if(w1&&mm[id]) mm[id].home_team=w1; if(w2&&mm[id]) mm[id].away_team=w2 })
  const wS1=W('S1'),wS2=W('S2'),lS1=L('S1'),lS2=L('S2')
  if(wS1&&mm['final']) mm['final'].home_team=wS1; if(wS2&&mm['final']) mm['final'].away_team=wS2
  if(lS1&&mm['third']) mm['third'].home_team=lS1; if(lS2&&mm['third']) mm['third'].away_team=lS2
  return Object.values(mm)
}

// ─── Función principal de sincronización ──────────────────────────────────────
export async function doSync() {
  const t0 = Date.now()
  const url  = process.env.VITE_SUPABASE_URL
  const key  = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no configuradas en Netlify.')

  const supabase = createClient(url, key)

  // 1. Llamada a la API de football-data.org
  const res = await fetch(`${FD_API_URL}/competitions/${COMPETITION}/matches`, {
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

    if (!apiMatch || (apiMatch.status !== 'FINISHED' && apiMatch.status !== 'IN_PLAY')) continue

    const hScore    = apiMatch.score.fullTime.home
    const aScore    = apiMatch.score.fullTime.away
    const isFinished = apiMatch.status === 'FINISHED'

    let winner = null
    if (match.stage !== 'group') {
      if (hScore > aScore) winner = match.home_team
      else if (aScore > hScore) winner = match.away_team
      else {
        const wName = apiMatch.score.winner === 'HOME_TEAM' ? apiMatch.homeTeam?.name : apiMatch.awayTeam?.name
        winner = TEAM_TRANSLATIONS[wName] || wName || null
      }
    }

    const changed = match.home_score !== hScore || match.away_score !== aScore || match.status !== (isFinished ? 'finished' : 'live')
    if (!changed) continue

    const { error: updateErr } = await supabase.from('matches').update({
      home_score:   hScore,
      away_score:   aScore,
      winner:       winner,
      status:       isFinished ? 'finished' : 'live',
      api_match_id: apiMatch.id?.toString()
    }).eq('id', match.id)

    if (updateErr) throw updateErr

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
