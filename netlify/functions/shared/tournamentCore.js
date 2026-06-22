// Shared tournament logic and configuration between frontend and backend functions

export const GROUPS_DATA = {
  A: ["México", "Sudáfrica", "Corea del Sur", "Chequia"],
  B: ["Canadá", "Bosnia-Herz.", "Qatar", "Suiza"],
  C: ["Brasil", "Marruecos", "Haití", "Escocia"],
  D: ["Estados Unidos", "Paraguay", "Australia", "Turquía"],
  E: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
  F: ["Países Bajos", "Japón", "Suecia", "Túnez"],
  G: ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"],
  H: ["España", "Cabo Verde", "Arabia Saudí", "Uruguay"],
  I: ["Francia", "Senegal", "Irak", "Noruega"],
  J: ["Argentina", "Argelia", "Austria", "Jordania"],
  K: ["Portugal", "Congo RD", "Uzbekistán", "Colombia"],
  L: ["Inglaterra", "Croacia", "Ghana", "Panamá"]
}

export const TEAMS_INFO = {
  "México": { flag: "mx", conf: "CONCACAF", rating: 77 },
  "Sudáfrica": { flag: "za", conf: "CAF", rating: 68 },
  "Corea del Sur": { flag: "kr", conf: "AFC", rating: 78 },
  "Chequia": { flag: "cz", conf: "UEFA", rating: 76 },
  "Canadá": { flag: "ca", conf: "CONCACAF", rating: 75 },
  "Bosnia-Herz.": { flag: "ba", conf: "UEFA", rating: 71 },
  "Qatar": { flag: "qa", conf: "AFC", rating: 70 },
  "Suiza": { flag: "ch", conf: "UEFA", rating: 79 },
  "Brasil": { flag: "br", conf: "CONMEBOL", rating: 85 },
  "Marruecos": { flag: "ma", conf: "CAF", rating: 82 },
  "Haití": { flag: "ht", conf: "CONCACAF", rating: 64 },
  "Escocia": { flag: "gb-sct", conf: "UEFA", rating: 73 },
  "Estados Unidos": { flag: "us", conf: "CONCACAF", rating: 79 },
  "Paraguay": { flag: "py", conf: "CONMEBOL", rating: 74 },
  "Australia": { flag: "au", conf: "AFC", rating: 75 },
  "Turquía": { flag: "tr", conf: "UEFA", rating: 77 },
  "Alemania": { flag: "de", conf: "UEFA", rating: 84 },
  "Curazao": { flag: "cw", conf: "CONCACAF", rating: 63 },
  "Costa de Marfil": { flag: "ci", conf: "CAF", rating: 78 },
  "Ecuador": { flag: "ec", conf: "CONMEBOL", rating: 78 },
  "Países Bajos": { flag: "nl", conf: "UEFA", rating: 83 },
  "Japón": { flag: "jp", conf: "AFC", rating: 81 },
  "Suecia": { flag: "se", conf: "UEFA", rating: 77 },
  "Túnez": { flag: "tn", conf: "CAF", rating: 71 },
  "Bélgica": { flag: "be", conf: "UEFA", rating: 81 },
  "Egipto": { flag: "eg", conf: "CAF", rating: 76 },
  "Irán": { flag: "ir", conf: "AFC", rating: 77 },
  "Nueva Zelanda": { flag: "nz", conf: "OFC", rating: 62 },
  "España": { flag: "es", conf: "UEFA", rating: 85 },
  "Cabo Verde": { flag: "cv", conf: "CAF", rating: 72 },
  "Arabia Saudí": { flag: "sa", conf: "AFC", rating: 70 },
  "Uruguay": { flag: "uy", conf: "CONMEBOL", rating: 82 },
  "Francia": { flag: "fr", conf: "UEFA", rating: 86 },
  "Senegal": { flag: "sn", conf: "CAF", rating: 78 },
  "Irak": { flag: "iq", conf: "AFC", rating: 71 },
  "Noruega": { flag: "no", conf: "UEFA", rating: 76 },
  "Argentina": { flag: "ar", conf: "CONMEBOL", rating: 87 },
  "Argelia": { flag: "dz", conf: "CAF", rating: 75 },
  "Austria": { flag: "at", conf: "UEFA", rating: 77 },
  "Jordania": { flag: "jo", conf: "AFC", rating: 68 },
  "Portugal": { flag: "pt", conf: "UEFA", rating: 85 },
  "Congo RD": { flag: "cd", conf: "CAF", rating: 71 },
  "Uzbekistán": { flag: "uz", conf: "AFC", rating: 72 },
  "Colombia": { flag: "co", conf: "CONMEBOL", rating: 81 },
  "Inglaterra": { flag: "gb-eng", conf: "UEFA", rating: 85 },
  "Croacia": { flag: "hr", conf: "UEFA", rating: 80 },
  "Ghana": { flag: "gh", conf: "CAF", rating: 72 },
  "Panamá": { flag: "pa", conf: "CONCACAF", rating: 73 }
}

export const TEAM_TRANSLATIONS = {
  "Mexico": "México", "South Africa": "Sudáfrica", "South Korea": "Corea del Sur",
  "Czechia": "Chequia", "Canada": "Canadá", "Bosnia and Herzegovina": "Bosnia-Herz.",
  "Bosnia-Herzegovina": "Bosnia-Herz.",
  "Qatar": "Qatar", "Switzerland": "Suiza", "Brazil": "Brasil", "Morocco": "Marruecos",
  "Haiti": "Haití", "Scotland": "Escocia", "USA": "Estados Unidos", "United States": "Estados Unidos", "Paraguay": "Paraguay",
  "Australia": "Australia", "Turkey": "Turquía", "Germany": "Alemania",
  "Curaçao": "Curazao", "Curacao": "Curazao", "Ivory Coast": "Costa de Marfil", "Côte d'Ivoire": "Costa de Marfil", "Ecuador": "Ecuador",
  "Netherlands": "Países Bajos", "Japan": "Japón", "Sweden": "Suecia",
  "Tunisia": "Túnez", "Belgium": "Bélgica", "Egypt": "Egipto", "Iran": "Irán",
  "New Zealand": "Nueva Zelanda", "Spain": "España", "Cape Verde": "Cabo Verde",
  "Cape Verde Islands": "Cabo Verde",
  "Saudi Arabia": "Arabia Saudí", "Uruguay": "Uruguay", "France": "Francia",
  "Senegal": "Senegal", "Iraq": "Irak", "Norway": "Noruega", "Argentina": "Argentina",
  "Algeria": "Argelia", "Austria": "Austria", "Jordan": "Jordania",
  "Portugal": "Portugal", "DR Congo": "Congo RD", "Congo DR": "Congo RD", "Democratic Republic of the Congo": "Congo RD", "Uzbekistan": "Uzbekistán",
  "Colombia": "Colombia", "England": "Inglaterra", "Croatia": "Croacia",
  "Ghana": "Ghana", "Panama": "Panamá",
  "EE.UU.": "Estados Unidos",
  "EEUU": "Estados Unidos",
  "U.S.A.": "Estados Unidos",
  "Arabia Saudita": "Arabia Saudí",
  "República Checa": "Chequia",
  "Czech Republic": "Chequia",
  "Bosnia": "Bosnia-Herz.",
  "Congo": "Congo RD"
}

export function calculateGroupStandings(matches, originalTeams) {
  const stats = {}
  originalTeams.forEach(t => {
    stats[t] = { team: t, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 }
  })

  matches.forEach(m => {
    if (m.played && m.scoreHome !== null && m.scoreAway !== null) {
      const sH = parseInt(m.scoreHome)
      const sA = parseInt(m.scoreAway)

      stats[m.home].pj++
      stats[m.away].pj++
      stats[m.home].gf += sH
      stats[m.home].gc += sA
      stats[m.away].gf += sA
      stats[m.away].gc += sH

      if (sH > sA) {
        stats[m.home].g++
        stats[m.home].pts += 3
        stats[m.away].p++
      } else if (sH < sA) {
        stats[m.away].g++
        stats[m.away].pts += 3
        stats[m.home].p++
      } else {
        stats[m.home].e++
        stats[m.home].pts += 1
        stats[m.away].e++
        stats[m.away].pts += 1
      }
    }
  })

  const standings = Object.values(stats)
  standings.forEach(s => {
    s.dg = s.gf - s.gc
  })

  // Tie-breakers: Pts -> DG -> GF -> Head-to-Head -> FIFA rating
  standings.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.dg !== a.dg) return b.dg - a.dg
    if (b.gf !== a.gf) return b.gf - a.gf

    const directMatch = matches.find(m =>
      m.played &&
      ((m.home === a.team && m.away === b.team) || (m.home === b.team && m.away === a.team))
    )
    if (directMatch) {
      const aScore = directMatch.home === a.team ? directMatch.scoreHome : directMatch.scoreAway
      const bScore = directMatch.home === b.team ? directMatch.scoreHome : directMatch.scoreAway
      if (aScore !== bScore) return bScore - aScore
    }

    return (TEAMS_INFO[b.team]?.rating || 70) - (TEAMS_INFO[a.team]?.rating || 70)
  })

  return standings
}

export function selectBestThirds(groups) {
  const thirds = []
  Object.keys(groups).forEach(gKey => {
    const group = groups[gKey]
    if (group.standings.length >= 3) {
      const thirdPlace = group.standings[2]
      thirds.push({
        team: thirdPlace.team,
        pts: thirdPlace.pts,
        dg: thirdPlace.dg,
        gf: thirdPlace.gf,
        group: gKey
      })
    }
  })

  thirds.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.dg !== a.dg) return b.dg - a.dg
    if (b.gf !== a.gf) return b.gf - a.gf
    
    // Fallback: FIFA Ranking (rating in TEAMS_INFO)
    const ratingA = TEAMS_INFO[a.team]?.rating || 70
    const ratingB = TEAMS_INFO[b.team]?.rating || 70
    if (ratingB !== ratingA) return ratingB - ratingA
    
    return a.group.localeCompare(b.group)
  })

  return thirds.slice(0, 8).map(t => t.team)
}

export function getR32Mapping(groups) {
  const getG = (groupKey, pos) => {
    const standings = groups[groupKey]?.standings
    return standings && standings[pos] ? standings[pos].team : null
  }

  const thirds = []
  Object.keys(groups).forEach(gKey => {
    const standings = groups[gKey]?.standings
    if (standings && standings.length >= 3) {
      const t = standings[2]
      thirds.push({ team: t.team, pts: t.pts, dg: t.dg, gf: t.gf, group: gKey })
    }
  })

  thirds.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.dg !== a.dg) return b.dg - a.dg
    if (b.gf !== a.gf) return b.gf - a.gf
    
    // Fallback: FIFA Ranking (rating in TEAMS_INFO)
    const ratingA = TEAMS_INFO[a.team]?.rating || 70
    const ratingB = TEAMS_INFO[b.team]?.rating || 70
    if (ratingB !== ratingA) return ratingB - ratingA
    
    return a.group.localeCompare(b.group)
  })
  const bestEight = thirds.slice(0, 8)

  const slotConstraints = {
    P1:  ['A', 'B', 'C', 'D', 'F'],
    P2:  ['C', 'D', 'F', 'G', 'H'],
    P7:  ['B', 'E', 'F', 'I', 'J'],
    P8:  ['A', 'E', 'H', 'I', 'J'],
    P11: ['C', 'E', 'F', 'H', 'I'],
    P12: ['E', 'H', 'I', 'J', 'K'],
    P15: ['E', 'F', 'G', 'I', 'J'],
    P16: ['D', 'E', 'I', 'J', 'L']
  }
  const slots = ['P1', 'P2', 'P7', 'P8', 'P11', 'P12', 'P15', 'P16']
  const resolvedThirds = {}
  slots.forEach(s => resolvedThirds[s] = null)

  const assigned = new Set()
  const solve = (slotIdx) => {
    if (slotIdx === slots.length) return true
    const slot = slots[slotIdx]
    const allowed = slotConstraints[slot]
    for (let i = 0; i < bestEight.length; i++) {
      if (assigned.has(i)) continue
      const candidate = bestEight[i]
      if (allowed.includes(candidate.group)) {
        assigned.add(i)
        resolvedThirds[slot] = candidate.team
        if (solve(slotIdx + 1)) return true
        assigned.delete(i)
        resolvedThirds[slot] = null
      }
    }
    return false
  }
  solve(0)

  return {
    P1:  { home: getG('E', 0), away: resolvedThirds.P1 },
    P2:  { home: getG('I', 0), away: resolvedThirds.P2 },
    P3:  { home: getG('A', 1), away: getG('B', 1) },
    P4:  { home: getG('F', 0), away: getG('C', 1) },
    P5:  { home: getG('K', 1), away: getG('L', 1) },
    P6:  { home: getG('H', 0), away: getG('J', 1) },
    P7:  { home: getG('D', 0), away: resolvedThirds.P7 },
    P8:  { home: getG('G', 0), away: resolvedThirds.P8 },
    P9:  { home: getG('C', 0), away: getG('F', 1) },
    P10: { home: getG('E', 1), away: getG('I', 1) },
    P11: { home: getG('A', 0), away: resolvedThirds.P11 },
    P12: { home: getG('L', 0), away: resolvedThirds.P12 },
    P13: { home: getG('J', 0), away: getG('H', 1) },
    P14: { home: getG('D', 1), away: getG('G', 1) },
    P15: { home: getG('B', 0), away: resolvedThirds.P15 },
    P16: { home: getG('K', 0), away: resolvedThirds.P16 }
  }
}

export function propagateOfficialMatches(allMatches) {
  const matchMap = {}
  allMatches.forEach(m => {
    matchMap[m.id] = { ...m }
  })

  // 1. Group Stage to R32
  const groups = {}
  Object.keys(GROUPS_DATA).forEach(gKey => {
    groups[gKey] = {
      standings: [],
      matches: []
    }
    for (let i = 1; i <= 6; i++) {
      const mId = `${gKey}${i}`
      if (matchMap[mId]) {
        groups[gKey].matches.push({
          home: matchMap[mId].home_team,
          away: matchMap[mId].away_team,
          scoreHome: matchMap[mId].home_score,
          scoreAway: matchMap[mId].away_score,
          played: matchMap[mId].status === 'finished'
        })
      }
    }
    groups[gKey].standings = calculateGroupStandings(groups[gKey].matches, GROUPS_DATA[gKey])
  })

  const r32Mapping = getR32Mapping(groups)
  
  Object.keys(r32Mapping).forEach(id => {
    if (matchMap[id]) {
      const map = r32Mapping[id]
      if (map.home) matchMap[id].home_team = map.home
      if (map.away) matchMap[id].away_team = map.away
    }
  })

  const getWinner = (mId) => {
    const m = matchMap[mId]
    if (!m || m.status !== 'finished') return null
    return m.winner
  }

  const getLoser = (mId) => {
    const m = matchMap[mId]
    if (!m || m.status !== 'finished' || !m.winner) return null
    return m.winner === m.home_team ? m.away_team : m.home_team
  }

  // 2. R32 to R16
  const r16Mapping = [
    { id: 'O1', m1: 'P1', m2: 'P2' },
    { id: 'O2', m1: 'P3', m2: 'P4' },
    { id: 'O3', m1: 'P5', m2: 'P6' },
    { id: 'O4', m1: 'P7', m2: 'P8' },
    { id: 'O5', m1: 'P9', m2: 'P10' },
    { id: 'O6', m1: 'P11', m2: 'P12' },
    { id: 'O7', m1: 'P13', m2: 'P14' },
    { id: 'O8', m1: 'P15', m2: 'P16' }
  ]
  r16Mapping.forEach(({ id, m1, m2 }) => {
    const w1 = getWinner(m1)
    const w2 = getWinner(m2)
    if (w1 && matchMap[id]) matchMap[id].home_team = w1
    if (w2 && matchMap[id]) matchMap[id].away_team = w2
  })

  // 3. R16 to QF
  const qfMapping = [
    { id: 'Q1', m1: 'O1', m2: 'O2' },
    { id: 'Q2', m1: 'O3', m2: 'O4' },
    { id: 'Q3', m1: 'O5', m2: 'O6' },
    { id: 'Q4', m1: 'O7', m2: 'O8' }
  ]
  qfMapping.forEach(({ id, m1, m2 }) => {
    const w1 = getWinner(m1)
    const w2 = getWinner(m2)
    if (w1 && matchMap[id]) matchMap[id].home_team = w1
    if (w2 && matchMap[id]) matchMap[id].away_team = w2
  })

  // 4. QF to SF
  const sfMapping = [
    { id: 'S1', m1: 'Q1', m2: 'Q2' },
    { id: 'S2', m1: 'Q3', m2: 'Q4' }
  ]
  sfMapping.forEach(({ id, m1, m2 }) => {
    const w1 = getWinner(m1)
    const w2 = getWinner(m2)
    if (w1 && matchMap[id]) matchMap[id].home_team = w1
    if (w2 && matchMap[id]) matchMap[id].away_team = w2
  })

  // 5. SF to Finals
  const wS1 = getWinner('S1')
  const wS2 = getWinner('S2')
  const lS1 = getLoser('S1')
  const lS2 = getLoser('S2')

  if (wS1 && matchMap['final']) matchMap['final'].home_team = wS1
  if (wS2 && matchMap['final']) matchMap['final'].away_team = wS2
  if (lS1 && matchMap['third']) matchMap['third'].home_team = lS1
  if (lS2 && matchMap['third']) matchMap['third'].away_team = lS2

  return Object.values(matchMap)
}
