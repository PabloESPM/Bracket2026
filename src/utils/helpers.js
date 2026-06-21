import { TEAMS_INFO, CONF_CLASSES, TEAM_TRANSLATIONS } from './tournamentLogic.js'

// Pre-build lowercase maps for case-insensitive lookup
const lowercaseTranslations = {}
Object.keys(TEAM_TRANSLATIONS).forEach(key => {
  lowercaseTranslations[key.toLowerCase()] = TEAM_TRANSLATIONS[key]
})

const lowercaseTeamsInfo = {}
Object.keys(TEAMS_INFO).forEach(key => {
  lowercaseTeamsInfo[key.toLowerCase()] = TEAMS_INFO[key]
})

/**
 * Devuelve la URL de la bandera de un equipo desde flagcdn.com.
 * @param {string} team - Nombre del equipo en español o inglés
 * @param {number} [width=24] - Ancho de la bandera
 * @param {number} [height=18] - Alto de la bandera
 * @returns {string} URL de la imagen
 */
export function getFlagUrl(team, width = 24, height = 18) {
  if (!team) return ''
  const cleanedTeam = team.trim().toLowerCase()
  const translatedTeam = lowercaseTranslations[cleanedTeam] || team.trim()
  const info = lowercaseTeamsInfo[translatedTeam.toLowerCase()]
  if (!info) return ''
  return `https://flagcdn.com/${width}x${height}/${info.flag}.png`
}

/**
 * Devuelve la clase CSS de confederación de un equipo.
 * @param {string} team - Nombre del equipo en español o inglés
 * @returns {string} Nombre de la clase CSS
 */
export function getConfClass(team) {
  if (!team) return ''
  const cleanedTeam = team.trim().toLowerCase()
  const translatedTeam = lowercaseTranslations[cleanedTeam] || team.trim()
  const info = lowercaseTeamsInfo[translatedTeam.toLowerCase()]
  if (!info) return ''
  return CONF_CLASSES[info.conf] || ''
}

/**
 * Formatea un string ISO 8601 como fecha corta en español.
 * @param {string} isoStr - Fecha ISO 8601
 * @returns {string} ej: "11 jun"
 */
export function formatDateStr(isoStr) {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

/**
 * Formatea un string ISO 8601 como hora en español.
 * @param {string} isoStr - Fecha ISO 8601
 * @returns {string} ej: "21:00"
 */
export function formatTimeStr(isoStr) {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}
