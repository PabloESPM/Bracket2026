// FIFA World Cup 2026 static data and logical calculations

export { GROUPS_DATA, TEAMS_INFO, TEAM_TRANSLATIONS, calculateGroupStandings, selectBestThirds, getR32Mapping, propagateOfficialMatches } from '../../shared/tournamentCore.js'

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



