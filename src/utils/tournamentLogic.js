// FIFA World Cup 2026 static data and logical calculations

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
};

export const GROUP_STAGE_SCHEDULE = {
  A: [
    { home: "México", away: "Sudáfrica", date: "11 jun", time: "21:00", stadium: "Estadio Azteca", city: "CDMX" },
    { home: "Corea del Sur", away: "Chequia", date: "11 jun", time: "04:00", stadium: "Estadio Akron", city: "Guadalajara" },
    { home: "Chequia", away: "Sudáfrica", date: "18 jun", time: "18:00", stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
    { home: "México", away: "Corea del Sur", date: "18 jun", time: "03:00", stadium: "Estadio Akron", city: "Guadalajara" },
    { home: "México", away: "Chequia", date: "24 jun", time: "03:00", stadium: "Estadio Azteca", city: "CDMX" },
    { home: "Sudáfrica", away: "Corea del Sur", date: "24 jun", time: "03:00", stadium: "Estadio BBVA", city: "Monterrey" }
  ],
  B: [
    { home: "Canadá", away: "Bosnia-Herz.", date: "12 jun", time: "21:00", stadium: "BMO Field", city: "Toronto" },
    { home: "Qatar", away: "Suiza", date: "13 jun", time: "21:00", stadium: "Levi's Stadium", city: "Santa Clara" },
    { home: "Suiza", away: "Bosnia-Herz.", date: "18 jun", time: "21:00", stadium: "SoFi Stadium", city: "Los Angeles" },
    { home: "Canadá", away: "Qatar", date: "18 jun", time: "00:00", stadium: "BC Place", city: "Vancouver" },
    { home: "Canadá", away: "Suiza", date: "24 jun", time: "21:00", stadium: "BC Place", city: "Vancouver" },
    { home: "Bosnia-Herz.", away: "Qatar", date: "24 jun", time: "21:00", stadium: "Lumen Field", city: "Seattle" }
  ],
  C: [
    { home: "Brasil", away: "Marruecos", date: "13 jun", time: "00:00", stadium: "MetLife Stadium", city: "New Jersey" },
    { home: "Haití", away: "Escocia", date: "13 jun", time: "03:00", stadium: "Gillette Stadium", city: "Boston" },
    { home: "Brasil", away: "Haití", date: "19 jun", time: "03:00", stadium: "Lincoln Financial Field", city: "Philadelphia" },
    { home: "Escocia", away: "Marruecos", date: "19 jun", time: "00:00", stadium: "Gillette Stadium", city: "Boston" },
    { home: "Escocia", away: "Brasil", date: "24 jun", time: "00:00", stadium: "Hard Rock Stadium", city: "Miami" },
    { home: "Marruecos", away: "Haití", date: "24 jun", time: "00:00", stadium: "Mercedes-Benz Stadium", city: "Atlanta" }
  ],
  D: [
    { home: "Estados Unidos", away: "Paraguay", date: "12 jun", time: "03:00", stadium: "SoFi Stadium", city: "Los Angeles" },
    { home: "Australia", away: "Turquía", date: "13 jun", time: "06:00", stadium: "BC Place", city: "Vancouver" },
    { home: "Turquía", away: "Paraguay", date: "19 jun", time: "06:00", stadium: "Levi's Stadium", city: "Santa Clara" },
    { home: "Estados Unidos", away: "Australia", date: "19 jun", time: "21:00", stadium: "Lumen Field", city: "Seattle" },
    { home: "Estados Unidos", away: "Turquía", date: "25 jun", time: "04:00", stadium: "SoFi Stadium", city: "Los Angeles" },
    { home: "Paraguay", away: "Australia", date: "25 jun", time: "04:00", stadium: "Levi's Stadium", city: "Santa Clara" }
  ],
  E: [
    { home: "Alemania", away: "Curazao", date: "14 jun", time: "19:00", stadium: "NRG Stadium", city: "Houston" },
    { home: "Costa de Marfil", away: "Ecuador", date: "14 jun", time: "01:00", stadium: "Lincoln Financial Field", city: "Philadelphia" },
    { home: "Alemania", away: "Costa de Marfil", date: "20 jun", time: "22:00", stadium: "BMO Field", city: "Toronto" },
    { home: "Ecuador", away: "Curazao", date: "21 jun", time: "02:00", stadium: "Arrowhead Stadium", city: "Kansas City" },
    { home: "Ecuador", away: "Alemania", date: "25 jun", time: "22:00", stadium: "MetLife Stadium", city: "New Jersey" },
    { home: "Curazao", away: "Costa de Marfil", date: "25 jun", time: "22:00", stadium: "Lincoln Financial Field", city: "Philadelphia" }
  ],
  F: [
    { home: "Países Bajos", away: "Japón", date: "14 jun", time: "22:00", stadium: "AT&T Stadium", city: "Arlington" },
    { home: "Suecia", away: "Túnez", date: "14 jun", time: "04:00", stadium: "Estadio BBVA", city: "Monterrey" },
    { home: "Países Bajos", away: "Suecia", date: "20 jun", time: "19:00", stadium: "NRG Stadium", city: "Houston" },
    { home: "Túnez", away: "Japón", date: "20 jun", time: "06:00", stadium: "Estadio BBVA", city: "Monterrey" },
    { home: "Túnez", away: "Países Bajos", date: "25 jun", time: "01:00", stadium: "Arrowhead Stadium", city: "Kansas City" },
    { home: "Japón", away: "Suecia", date: "25 jun", time: "01:00", stadium: "AT&T Stadium", city: "Arlington" }
  ],
  G: [
    { home: "Bélgica", away: "Egipto", date: "15 jun", time: "21:00", stadium: "Lumen Field", city: "Seattle" },
    { home: "Irán", away: "Nueva Zelanda", date: "15 jun", time: "03:00", stadium: "SoFi Stadium", city: "Los Angeles" },
    { home: "Bélgica", away: "Irán", date: "21 jun", time: "21:00", stadium: "SoFi Stadium", city: "Los Angeles" },
    { home: "Nueva Zelanda", away: "Egipto", date: "22 jun", time: "03:00", stadium: "BC Place", city: "Vancouver" },
    { home: "Nueva Zelanda", away: "Bélgica", date: "26 jun", time: "05:00", stadium: "BC Place", city: "Vancouver" },
    { home: "Egipto", away: "Irán", date: "26 jun", time: "05:00", stadium: "Lumen Field", city: "Seattle" }
  ],
  H: [
    { home: "España", away: "Cabo Verde", date: "15 jun", time: "18:00", stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
    { home: "Arabia Saudí", away: "Uruguay", date: "15 jun", time: "00:00", stadium: "Hard Rock Stadium", city: "Miami" },
    { home: "España", away: "Arabia Saudí", date: "21 jun", time: "18:00", stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
    { home: "Uruguay", away: "Cabo Verde", date: "21 jun", time: "00:00", stadium: "Hard Rock Stadium", city: "Miami" },
    { home: "Uruguay", away: "España", date: "26 jun", time: "02:00", stadium: "Estadio Akron", city: "Guadalajara" },
    { home: "Cabo Verde", away: "Arabia Saudí", date: "26 jun", time: "02:00", stadium: "NRG Stadium", city: "Houston" }
  ],
  I: [
    { home: "Francia", away: "Senegal", date: "16 jun", time: "21:00", stadium: "MetLife Stadium", city: "New Jersey" },
    { home: "Irak", away: "Noruega", date: "16 jun", time: "00:00", stadium: "Gillette Stadium", city: "Boston" },
    { home: "Francia", away: "Irak", date: "22 jun", time: "23:00", stadium: "Lincoln Financial Field", city: "Philadelphia" },
    { home: "Noruega", away: "Senegal", date: "23 jun", time: "02:00", stadium: "MetLife Stadium", city: "New Jersey" },
    { home: "Noruega", away: "Francia", date: "26 jun", time: "21:00", stadium: "Gillette Stadium", city: "Boston" },
    { home: "Senegal", away: "Irak", date: "26 jun", time: "21:00", stadium: "BMO Field", city: "Toronto" }
  ],
  J: [
    { home: "Argentina", away: "Argelia", date: "16 jun", time: "03:00", stadium: "Arrowhead Stadium", city: "Kansas City" },
    { home: "Austria", away: "Jordania", date: "16 jun", time: "06:00", stadium: "Levi's Stadium", city: "Santa Clara" },
    { home: "Argentina", away: "Austria", date: "22 jun", time: "19:00", stadium: "AT&T Stadium", city: "Arlington" },
    { home: "Jordania", away: "Argelia", date: "22 jun", time: "05:00", stadium: "Levi's Stadium", city: "Santa Clara" },
    { home: "Jordania", away: "Argentina", date: "27 jun", time: "04:00", stadium: "AT&T Stadium", city: "Arlington" },
    { home: "Argelia", away: "Austria", date: "27 jun", time: "04:00", stadium: "Arrowhead Stadium", city: "Kansas City" }
  ],
  K: [
    { home: "Portugal", away: "Congo RD", date: "17 jun", time: "19:00", stadium: "NRG Stadium", city: "Houston" },
    { home: "Uzbekistán", away: "Colombia", date: "17 jun", time: "04:00", stadium: "Estadio Azteca", city: "CDMX" },
    { home: "Portugal", away: "Uzbekistán", date: "23 jun", time: "19:00", stadium: "NRG Stadium", city: "Houston" },
    { home: "Colombia", away: "Congo RD", date: "23 jun", time: "04:00", stadium: "Estadio Akron", city: "Guadalajara" },
    { home: "Colombia", away: "Portugal", date: "27 jun", time: "01:30", stadium: "Hard Rock Stadium", city: "Miami" },
    { home: "Congo RD", away: "Uzbekistán", date: "27 jun", time: "01:30", stadium: "Mercedes-Benz Stadium", city: "Atlanta" }
  ],
  L: [
    { home: "Inglaterra", away: "Croacia", date: "17 jun", time: "22:00", stadium: "AT&T Stadium", city: "Arlington" },
    { home: "Ghana", away: "Panamá", date: "18 jun", time: "01:00", stadium: "BMO Field", city: "Toronto" },
    { home: "Inglaterra", away: "Ghana", date: "23 jun", time: "22:00", stadium: "Gillette Stadium", city: "Boston" },
    { home: "Panamá", away: "Croacia", date: "24 jun", time: "01:00", stadium: "BMO Field", city: "Toronto" },
    { home: "Panamá", away: "Inglaterra", date: "27 jun", time: "23:00", stadium: "MetLife Stadium", city: "New Jersey" },
    { home: "Croacia", away: "Ghana", date: "27 jun", time: "23:00", stadium: "Lincoln Financial Field", city: "Philadelphia" }
  ]
};

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
};

export const CONF_CLASSES = {
  UEFA: "conf-uefa",
  CONMEBOL: "conf-conmebol",
  CONCACAF: "conf-concacaf",
  CAF: "conf-caf",
  AFC: "conf-afc",
  OFC: "conf-ofc"
};

export const R32_SLOT_LABELS = {
  P1:  { home: "1º Gr. E",    away: "3º ABCDF" },
  P2:  { home: "1º Gr. I",    away: "3º CDFGH" },
  P3:  { home: "2º Gr. A",    away: "2º Gr. B" },
  P4:  { home: "1º Gr. F",    away: "2º Gr. C" },
  P5:  { home: "2º Gr. K",    away: "2º Gr. L" },
  P6:  { home: "1º Gr. H",    away: "2º Gr. J" },
  P7:  { home: "1º Gr. D",    away: "3º BEFIJ" },
  P8:  { home: "1º Gr. G",    away: "3º AEHIJ" },
  P9:  { home: "1º Gr. C",    away: "2º Gr. F" },
  P10: { home: "2º Gr. E",    away: "2º Gr. I" },
  P11: { home: "1º Gr. A",    away: "3º CEFHI" },
  P12: { home: "1º Gr. L",    away: "3º EHIJK" },
  P13: { home: "1º Gr. J",    away: "2º Gr. H" },
  P14: { home: "2º Gr. D",    away: "2º Gr. G" },
  P15: { home: "1º Gr. B",    away: "3º EFGIJ" },
  P16: { home: "1º Gr. K",    away: "3º DEIJL" },
};

export const BRACKET_CONNECTIONS = [
  ['match-card-r32-P1', 'match-card-r32-P2', 'match-card-r16-O1'],
  ['match-card-r32-P3', 'match-card-r32-P4', 'match-card-r16-O2'],
  ['match-card-r32-P5', 'match-card-r32-P6', 'match-card-r16-O3'],
  ['match-card-r32-P7', 'match-card-r32-P8', 'match-card-r16-O4'],
  ['match-card-r32-P9', 'match-card-r32-P10', 'match-card-r16-O5'],
  ['match-card-r32-P11', 'match-card-r32-P12', 'match-card-r16-O6'],
  ['match-card-r32-P13', 'match-card-r32-P14', 'match-card-r16-O7'],
  ['match-card-r32-P15', 'match-card-r32-P16', 'match-card-r16-O8'],
  
  ['match-card-r16-O1', 'match-card-r16-O2', 'match-card-qf-Q1'],
  ['match-card-r16-O3', 'match-card-r16-O4', 'match-card-qf-Q2'],
  ['match-card-r16-O5', 'match-card-r16-O6', 'match-card-qf-Q3'],
  ['match-card-r16-O7', 'match-card-r16-O8', 'match-card-qf-Q4'],
  
  ['match-card-qf-Q1', 'match-card-qf-Q2', 'match-card-sf-S1'],
  ['match-card-qf-Q3', 'match-card-qf-Q4', 'match-card-sf-S2'],
  
  ['match-card-sf-S1', 'match-card-sf-S2', 'match-card-final-final'],
];

export const MATCH_SCHEDULE = {
  r32: {
    P1:  { date: "29 jun", time: "22:30", city: "Boston" },
    P2:  { date: "30 jun", time: "23:00", city: "Nueva York" },
    P3:  { date: "28 jun", time: "21:00", city: "Los Ángeles" },
    P4:  { date: "30 jun", time: "03:00", city: "Monterrey" },
    P5:  { date: "3 jul",  time: "01:00", city: "Toronto" },
    P6:  { date: "2 jul",  time: "21:00", city: "Los Ángeles" },
    P7:  { date: "2 jul",  time: "02:00", city: "San Francisco" },
    P8:  { date: "1 jul",  time: "22:00", city: "Seattle" },
    P9:  { date: "29 jun", time: "19:00", city: "Houston" },
    P10: { date: "30 jun", time: "19:00", city: "Dallas" },
    P11: { date: "1 jul",  time: "03:00", city: "Cd. México" },
    P12: { date: "1 jul",  time: "18:00", city: "Atlanta" },
    P13: { date: "4 jul",  time: "00:00", city: "Miami" },
    P14: { date: "3 jul",  time: "20:00", city: "Dallas" },
    P15: { date: "3 jul",  time: "05:00", city: "Vancouver" },
    P16: { date: "4 jul",  time: "03:30", city: "Kansas City" },
  },
  r16: {
    O1: { date: "4 jul", time: "18:00" },
    O2: { date: "4 jul", time: "22:00" },
    O3: { date: "5 jul", time: "18:00" },
    O4: { date: "5 jul", time: "22:00" },
    O5: { date: "6 jul", time: "18:00" },
    O6: { date: "6 jul", time: "22:00" },
    O7: { date: "7 jul", time: "18:00" },
    O8: { date: "7 jul", time: "22:00" },
  },
  qf: {
    Q1: { date: "9 jul", time: "18:00" },
    Q2: { date: "9 jul", time: "22:00" },
    Q3: { date: "10 jul", time: "18:00" },
    Q4: { date: "10 jul", time: "22:00" },
  },
  sf: {
    S1: { date: "14 jul", time: "21:00" },
    S2: { date: "15 jul", time: "21:00" },
  },
  third: { date: "18 jul", time: "21:00" },
  final: { date: "19 jul", time: "21:00", stadium: "MetLife Stadium" },
};

// Calculate group standings based on matches played
export function calculateGroupStandings(matches, originalTeams) {
  const stats = {};
  originalTeams.forEach(t => {
    stats[t] = { team: t, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
  });

  matches.forEach(m => {
    if (m.played && m.scoreHome !== null && m.scoreAway !== null) {
      const sH = parseInt(m.scoreHome);
      const sA = parseInt(m.scoreAway);

      stats[m.home].pj++;
      stats[m.away].pj++;
      stats[m.home].gf += sH;
      stats[m.home].gc += sA;
      stats[m.away].gf += sA;
      stats[m.away].gc += sH;

      if (sH > sA) {
        stats[m.home].g++;
        stats[m.home].pts += 3;
        stats[m.away].p++;
      } else if (sH < sA) {
        stats[m.away].g++;
        stats[m.away].pts += 3;
        stats[m.home].p++;
      } else {
        stats[m.home].e++;
        stats[m.home].pts += 1;
        stats[m.away].e++;
        stats[m.away].pts += 1;
      }
    }
  });

  const standings = Object.values(stats);
  standings.forEach(s => {
    s.dg = s.gf - s.gc;
  });

  // Tie-breakers: Pts -> DG -> GF -> Head-to-Head -> FIFA rating
  standings.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;

    const directMatch = matches.find(m =>
      m.played &&
      ((m.home === a.team && m.away === b.team) || (m.home === b.team && m.away === a.team))
    );
    if (directMatch) {
      const aScore = directMatch.home === a.team ? directMatch.scoreHome : directMatch.scoreAway;
      const bScore = directMatch.home === b.team ? directMatch.scoreHome : directMatch.scoreAway;
      if (aScore !== bScore) return bScore - aScore;
    }

    return TEAMS_INFO[b.team].rating - TEAMS_INFO[a.team].rating;
  });

  return standings;
}

// Select 8 best thirds from 12 groups
export function selectBestThirds(groups) {
  const thirds = [];
  Object.keys(groups).forEach(gKey => {
    const group = groups[gKey];
    if (group.standings.length >= 3) {
      const thirdPlace = group.standings[2];
      thirds.push({
        team: thirdPlace.team,
        pts: thirdPlace.pts,
        dg: thirdPlace.dg,
        gf: thirdPlace.gf,
        group: gKey
      });
    }
  });

  thirds.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.group.localeCompare(b.group);
  });

  return thirds.slice(0, 8).map(t => t.team);
}

// Generate R32 mapping from group standings using deterministic bipartite matching for third-place teams
export function getR32Mapping(groups) {
  const getG = (groupKey, pos) => {
    const standings = groups[groupKey]?.standings;
    return standings && standings[pos] ? standings[pos].team : null;
  };

  // 1. Gather third-place teams from all 12 groups
  const thirds = [];
  Object.keys(groups).forEach(gKey => {
    const standings = groups[gKey]?.standings;
    if (standings && standings.length >= 3) {
      const t = standings[2];
      thirds.push({ team: t.team, pts: t.pts, dg: t.dg, gf: t.gf, group: gKey });
    }
  });

  // 2. Sort to find the 8 best third-place teams overall
  thirds.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.group.localeCompare(b.group);
  });
  const bestEight = thirds.slice(0, 8);

  // 3. Resolve the bipartite matching deterministically
  const slotConstraints = {
    P1:  ['A', 'B', 'C', 'D', 'F'],
    P2:  ['C', 'D', 'F', 'G', 'H'],
    P7:  ['B', 'E', 'F', 'I', 'J'],
    P8:  ['A', 'E', 'H', 'I', 'J'],
    P11: ['C', 'E', 'F', 'H', 'I'],
    P12: ['E', 'H', 'I', 'J', 'K'],
    P15: ['E', 'F', 'G', 'I', 'J'],
    P16: ['D', 'E', 'I', 'J', 'L']
  };
  const slots = ['P1', 'P2', 'P7', 'P8', 'P11', 'P12', 'P15', 'P16'];
  const resolvedThirds = {};
  slots.forEach(s => resolvedThirds[s] = null);

  const assigned = new Set();
  const solve = (slotIdx) => {
    if (slotIdx === slots.length) return true;
    const slot = slots[slotIdx];
    const allowed = slotConstraints[slot];
    for (let i = 0; i < bestEight.length; i++) {
      if (assigned.has(i)) continue;
      const candidate = bestEight[i];
      if (allowed.includes(candidate.group)) {
        assigned.add(i);
        resolvedThirds[slot] = candidate.team;
        if (solve(slotIdx + 1)) return true;
        assigned.delete(i);
        resolvedThirds[slot] = null;
      }
    }
    return false;
  };
  solve(0);

  // 4. Map the teams to the bracket slots
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
    P16: { home: getG('K', 0), away: resolvedThirds.P16 },
  };
}

// Propagates official match teams through the stages
export function propagateOfficialMatches(allMatches) {
  const matchMap = {};
  allMatches.forEach(m => {
    matchMap[m.id] = { ...m };
  });

  // 1. Group Stage to R32
  const groups = {};
  Object.keys(GROUPS_DATA).forEach(gKey => {
    groups[gKey] = {
      standings: [],
      matches: []
    };
    for (let i = 1; i <= 6; i++) {
      const mId = `${gKey}${i}`;
      if (matchMap[mId]) {
        groups[gKey].matches.push({
          home: matchMap[mId].home_team,
          away: matchMap[mId].away_team,
          scoreHome: matchMap[mId].home_score,
          scoreAway: matchMap[mId].away_score,
          played: matchMap[mId].status === 'finished'
        });
      }
    }
    groups[gKey].standings = calculateGroupStandings(groups[gKey].matches, GROUPS_DATA[gKey]);
  });

  const r32Mapping = getR32Mapping(groups);
  
  Object.keys(r32Mapping).forEach(id => {
    if (matchMap[id]) {
      const map = r32Mapping[id];
      if (map.home) matchMap[id].home_team = map.home;
      if (map.away) matchMap[id].away_team = map.away;
    }
  });

  const getWinner = (mId) => {
    const m = matchMap[mId];
    if (!m || m.status !== 'finished') return null;
    return m.winner;
  };

  const getLoser = (mId) => {
    const m = matchMap[mId];
    if (!m || m.status !== 'finished' || !m.winner) return null;
    return m.winner === m.home_team ? m.away_team : m.home_team;
  };

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
  ];
  r16Mapping.forEach(({ id, m1, m2 }) => {
    const w1 = getWinner(m1);
    const w2 = getWinner(m2);
    if (w1 && matchMap[id]) matchMap[id].home_team = w1;
    if (w2 && matchMap[id]) matchMap[id].away_team = w2;
  });

  // 3. R16 to QF
  const qfMapping = [
    { id: 'Q1', m1: 'O1', m2: 'O2' },
    { id: 'Q2', m1: 'O3', m2: 'O4' },
    { id: 'Q3', m1: 'O5', m2: 'O6' },
    { id: 'Q4', m1: 'O7', m2: 'O8' }
  ];
  qfMapping.forEach(({ id, m1, m2 }) => {
    const w1 = getWinner(m1);
    const w2 = getWinner(m2);
    if (w1 && matchMap[id]) matchMap[id].home_team = w1;
    if (w2 && matchMap[id]) matchMap[id].away_team = w2;
  });

  // 4. QF to SF
  const sfMapping = [
    { id: 'S1', m1: 'Q1', m2: 'Q2' },
    { id: 'S2', m1: 'Q3', m2: 'Q4' }
  ];
  sfMapping.forEach(({ id, m1, m2 }) => {
    const w1 = getWinner(m1);
    const w2 = getWinner(m2);
    if (w1 && matchMap[id]) matchMap[id].home_team = w1;
    if (w2 && matchMap[id]) matchMap[id].away_team = w2;
  });

  // 5. SF to Finals
  const wS1 = getWinner('S1');
  const wS2 = getWinner('S2');
  const lS1 = getLoser('S1');
  const lS2 = getLoser('S2');

  if (wS1 && matchMap['final']) matchMap['final'].home_team = wS1;
  if (wS2 && matchMap['final']) matchMap['final'].away_team = wS2;
  if (lS1 && matchMap['third']) matchMap['third'].home_team = lS1;
  if (lS2 && matchMap['third']) matchMap['third'].away_team = lS2;

  return Object.values(matchMap);
}

