<template>
  <div class="space-y-6 max-w-5xl mx-auto px-4 pb-12">
    <!-- Admin Header -->
    <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
      <div>
        <h2 class="text-xl font-black text-slate-100 flex items-center gap-2">
          <span class="text-red-500">⚙️</span> Panel de Administración
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          Inicializa la base de datos oficial, introduce los marcadores de los partidos en tiempo real y gestiona el flujo del bracket oficial.
        </p>
      </div>
      <div class="flex flex-wrap gap-2 shrink-0">
        <button
          @click="handleAPISync"
          :disabled="loading || syncingAPI"
          class="px-4 py-2 bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-700/50 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-lg"
        >
          {{ syncingAPI ? 'Sincronizando...' : '📡 Sincronizar API' }}
        </button>
        <button
          @click="seedDatabase"
          :disabled="loading || syncingAPI"
          class="px-4 py-2 bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 text-red-300 hover:text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-lg"
        >
          {{ loading ? 'Procesando...' : '🔄 Inicializar Calendario' }}
        </button>
      </div>
    </div>

    <!-- Alert Messages -->
    <div v-if="successMsg" class="p-3 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-xs font-semibold rounded-xl text-center">
      ✔️ {{ successMsg }}
    </div>
    <div v-if="errorMsg" class="p-3 bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-semibold rounded-xl text-center">
      ❌ {{ errorMsg }}
    </div>

    <!-- Secciones del torneo -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div class="flex border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
        <button
          v-for="tab in adminTabs"
          :key="tab.id"
          @click="activeSubTab = tab.id"
          class="px-5 py-3.5 text-xs font-bold text-slate-400 hover:text-white border-b-2 whitespace-nowrap transition cursor-pointer"
          :class="activeSubTab === tab.id ? 'border-blue-500 text-blue-400 bg-slate-900/40' : 'border-transparent'"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="p-4 md:p-6">
        <!-- Loader -->
        <div v-if="loadingMatches" class="py-12 text-center text-slate-500 text-xs font-medium">
          Cargando partidos oficiales...
        </div>

        <div v-else-if="filteredMatches.length === 0" class="py-12 text-center text-slate-500 text-xs font-medium">
          No hay partidos en esta categoría. Inicializa el calendario arriba.
        </div>

        <!-- Matches list -->
        <div v-else class="space-y-4">
          <div
            v-for="match in filteredMatches"
            :key="match.id"
            class="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-4 transition hover:border-slate-700"
          >
            <!-- Match Meta Info -->
            <div class="flex items-center gap-3 w-full lg:w-auto">
              <span class="text-xs font-black px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg">
                {{ match.id }}
              </span>
              <div>
                <div class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  {{ getStageLabel(match.stage) }}
                </div>
                <div class="text-xs text-slate-300 font-medium mt-0.5">
                  📅 {{ formatDateStr(match.start_time) }} | ⏱ {{ formatTimeStr(match.start_time) }}
                </div>
              </div>
            </div>

            <!-- Match Score Input -->
            <div class="flex items-center justify-center gap-4 py-2 w-full lg:w-auto">
              <!-- Home -->
              <div class="flex items-center gap-2 w-32 md:w-40 justify-end text-right min-w-0">
                <span class="text-xs font-bold text-slate-200 truncate">{{ match.home_team }}</span>
                <img v-if="getFlag(match.home_team)" class="w-6 h-4 object-cover rounded shadow" :src="getFlag(match.home_team)" alt="">
              </div>

              <!-- Inputs -->
              <div class="flex items-center gap-1.5">
                <input
                  type="number"
                  v-model="scores[match.id].home"
                  min="0"
                  class="w-10 h-10 bg-slate-900 border border-slate-800 text-center font-extrabold text-sm rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="-"
                >
                <span class="text-slate-600 font-bold">:</span>
                <input
                  type="number"
                  v-model="scores[match.id].away"
                  min="0"
                  class="w-10 h-10 bg-slate-900 border border-slate-800 text-center font-extrabold text-sm rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="-"
                >
              </div>

              <!-- Away -->
              <div class="flex items-center gap-2 w-32 md:w-40 justify-start text-left min-w-0">
                <img v-if="getFlag(match.away_team)" class="w-6 h-4 object-cover rounded shadow" :src="getFlag(match.away_team)" alt="">
                <span class="text-xs font-bold text-slate-200 truncate">{{ match.away_team }}</span>
              </div>
            </div>

            <!-- Match Actions & Status -->
            <div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto justify-end">
              <!-- Winner Select for Knockouts -->
              <div v-if="match.stage !== 'group'" class="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                <span class="text-[9px] text-slate-500 font-extrabold uppercase px-1.5">Ganador:</span>
                <button
                  @click="setMatchWinner(match.id, match.home_team)"
                  class="px-2 py-1 text-[10px] font-bold rounded-lg transition"
                  :class="winnerMap[match.id] === match.home_team ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'"
                >
                  LOCAL
                </button>
                <button
                  @click="setMatchWinner(match.id, match.away_team)"
                  class="px-2 py-1 text-[10px] font-bold rounded-lg transition"
                  :class="winnerMap[match.id] === match.away_team ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'"
                >
                  VISITANTE
                </button>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2 shrink-0">
                <!-- Status Badge -->
                <span
                  class="text-[9px] font-extrabold uppercase px-2 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60"
                  :class="getStatusClass(match.status)"
                >
                  {{ match.status === 'finished' ? 'Finalizado' : match.status === 'live' ? 'En Juego' : 'Programado' }}
                </span>

                <button
                  v-if="match.status !== 'finished' || hasUnsavedChanges(match.id)"
                  @click="saveOfficialMatch(match, 'finished')"
                  class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-md"
                >
                  Guardar
                </button>
                <button
                  v-else
                  @click="resetOfficialMatch(match)"
                  class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition border border-slate-700 cursor-pointer"
                >
                  Reiniciar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { supabase } from '../supabaseClient.js'
import {
  TEAMS_INFO,
  GROUP_STAGE_SCHEDULE,
  MATCH_SCHEDULE,
  R32_SLOT_LABELS,
  propagateOfficialMatches
} from '../utils/tournamentLogic.js'
// syncMatchesWithAPI se ejecuta via Netlify Function (server-side) para evitar CORS

const emit = defineEmits(['matches-updated'])

const loading = ref(false)
const loadingMatches = ref(false)
const errorMsg = ref("")
const successMsg = ref("")
const activeSubTab = ref("group")
const officialMatches = ref([])

const syncingAPI = ref(false)

async function handleAPISync() {
  syncingAPI.value = true
  errorMsg.value = ""
  successMsg.value = ""
  try {
    // Llamamos a la Netlify Function (servidor) para evitar bloqueos CORS del navegador
    const response = await fetch('/.netlify/functions/sync-manual', { method: 'POST' })
    const data = await response.json()
    if (!data.ok) throw new Error(data.error || 'Error desconocido en la sincronización.')
    successMsg.value = `✅ Sincronización completada en ${data.ms}ms. Se actualizaron ${data.updated} partido(s).`
    await fetchMatches()
    emit('matches-updated')
  } catch (err) {
    console.error(err)
    errorMsg.value = "Error al sincronizar con la API: " + err.message
  } finally {
    syncingAPI.value = false
  }
}

// Form models
const scores = ref({}) // { matchId: { home: 0, away: 0 } }
const winnerMap = ref({}) // { matchId: winnerTeamName }

const adminTabs = [
  { id: 'group', name: 'Fase de Grupos' },
  { id: 'r32', name: 'Ronda de 32' },
  { id: 'r16', name: 'Octavos de Final' },
  { id: 'qf', name: 'Cuartos de Final' },
  { id: 'sf', name: 'Semifinales' },
  { id: 'finals', name: 'Finales' }
]

// Fetch official matches on mount
onMounted(() => {
  fetchMatches()
})

async function fetchMatches() {
  loadingMatches.value = true
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('start_time', { ascending: true })

    if (error) throw error
    officialMatches.value = data || []
    
    // Initialize scores & winner state
    const newScores = {}
    const newWinnerMap = {}
    officialMatches.value.forEach(m => {
      newScores[m.id] = {
        home: m.home_score !== null ? m.home_score : '',
        away: m.away_score !== null ? m.away_score : ''
      }
      newWinnerMap[m.id] = m.winner || null
    })
    scores.value = newScores
    winnerMap.value = newWinnerMap
  } catch (err) {
    console.error(err)
    errorMsg.value = "Error al cargar partidos: " + err.message
  } finally {
    loadingMatches.value = false
  }
}

const filteredMatches = computed(() => {
  if (activeSubTab.value === 'finals') {
    return officialMatches.value.filter(m => m.stage === 'final' || m.stage === 'third')
  }
  return officialMatches.value.filter(m => m.stage === activeSubTab.value)
})

function getFlag(team) {
  const info = TEAMS_INFO[team]
  if (!info) return ''
  return `https://flagcdn.com/32x24/${info.flag}.png`
}

function getStageLabel(stage) {
  const labels = {
    group: 'Fase de Grupos',
    r32: 'Ronda de 32',
    r16: 'Octavos de Final',
    qf: 'Cuartos de Final',
    sf: 'Semifinales',
    third: 'Tercer Puesto',
    final: 'Gran Final'
  }
  return labels[stage] || stage
}

function getStatusClass(status) {
  if (status === 'finished') return 'text-emerald-400 border-emerald-950 bg-emerald-950/20'
  if (status === 'live') return 'text-indigo-400 border-indigo-950 bg-indigo-950/20'
  return 'text-slate-400 border-slate-800 bg-slate-950/40'
}

function formatDateStr(isoStr) {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

function formatTimeStr(isoStr) {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' h'
}

function setMatchWinner(matchId, team) {
  if (winnerMap.value[matchId] === team) {
    winnerMap.value[matchId] = null
  } else {
    winnerMap.value[matchId] = team
  }
}

// Save match and trigger propagation
async function saveOfficialMatch(match, targetStatus) {
  const matchId = match.id
  const home = scores.value[matchId].home
  const away = scores.value[matchId].away
  let winner = winnerMap.value[matchId] || null

  if (home === '' || away === '') {
    alert('Introduce las puntuaciones para el partido.')
    return
  }

  const hScore = parseInt(home)
  const aScore = parseInt(away)

  // Validate winner selection for knockouts
  if (match.stage !== 'group') {
    if (hScore > aScore) {
      winner = match.home_team
    } else if (aScore > hScore) {
      winner = match.away_team
    } else if (hScore === aScore && !winner) {
      alert('Para eliminatorias con empate, selecciona el ganador de la prórroga/penaltis en los botones del local/visitante.')
      return
    }
  }

  loading.value = true
  errorMsg.value = ""
  successMsg.value = ""

  try {
    // 1. Update this match in database
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        home_score: hScore,
        away_score: aScore,
        winner: winner,
        status: targetStatus
      })
      .eq('id', matchId)

    if (updateError) throw updateError

    // 2. Fetch all matches to execute bracket propagation
    const { data: allMatches, error: fetchErr } = await supabase
      .from('matches')
      .select('*')

    if (fetchErr) throw fetchErr

    // Update locally so we can propagate
    const localMatch = allMatches.find(m => m.id === matchId)
    if (localMatch) {
      localMatch.home_score = hScore
      localMatch.away_score = aScore
      localMatch.winner = winner
      localMatch.status = targetStatus
    }

    // 3. Propagate all match outcomes and obtain updated team list
    const propagated = propagateOfficialMatches(allMatches)

    // Find which matches have changed team names and update them in Supabase
    const updates = []
    propagated.forEach(m => {
      const orig = allMatches.find(o => o.id === m.id)
      if (orig && (orig.home_team !== m.home_team || orig.away_team !== m.away_team)) {
        updates.push({
          id: m.id,
          home_team: m.home_team,
          away_team: m.away_team
        })
      }
    })

    // Batch updates if any matches changed
    if (updates.length > 0) {
      for (const item of updates) {
        await supabase
          .from('matches')
          .update({ home_team: item.home_team, away_team: item.away_team })
          .eq('id', item.id)
      }
    }

    successMsg.value = `¡Partido ${matchId} actualizado correctamente!`
    await fetchMatches()
    emit('matches-updated')
  } catch (err) {
    console.error(err)
    errorMsg.value = "Error al actualizar partido: " + err.message
  } finally {
    loading.value = false
  }
}

function hasUnsavedChanges(matchId) {
  const match = officialMatches.value.find(m => m.id === matchId)
  if (!match) return false
  const score = scores.value[matchId]
  if (!score) return false
  
  const currentHome = score.home
  const currentAway = score.away
  
  // Normalize empty/null values for comparison
  const normHome = currentHome === '' || currentHome === null || currentHome === undefined ? null : parseInt(currentHome)
  const normAway = currentAway === '' || currentAway === null || currentAway === undefined ? null : parseInt(currentAway)
  
  return normHome !== match.home_score || normAway !== match.away_score
}

// Reset match scores
async function resetOfficialMatch(match) {
  if (!confirm(`¿Deseas restablecer el partido ${match.id}? Se borrarán los marcadores oficiales.`)) return

  loading.value = true
  errorMsg.value = ""
  successMsg.value = ""

  try {
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        home_score: null,
        away_score: null,
        winner: null,
        status: 'scheduled'
      })
      .eq('id', match.id)

    if (updateError) throw updateError

    // 2. Propagate matches resetting
    const { data: allMatches, error: fetchErr } = await supabase
      .from('matches')
      .select('*')

    if (fetchErr) throw fetchErr

    const propagated = propagateOfficialMatches(allMatches)

    // Save changes
    const updates = []
    propagated.forEach(m => {
      const orig = allMatches.find(o => o.id === m.id)
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

    successMsg.value = `¡Partido ${match.id} restablecido!`
    await fetchMatches()
    emit('matches-updated')
  } catch (err) {
    console.error(err)
    errorMsg.value = "Error al restablecer: " + err.message
  } finally {
    loading.value = false
  }
}

// Database Seeder
async function seedDatabase() {
  if (!confirm("⚠️ ¿Estás seguro de reiniciar e inicializar la base de datos oficial del torneo? Se borrarán todos los resultados y predicciones existentes.")) return

  loading.value = true
  errorMsg.value = ""
  successMsg.value = ""

  try {
    // Delete existing matches
    const { error: deleteError } = await supabase.from('matches').delete().neq('id', 'dummy_id_never_matching')
    if (deleteError) throw deleteError

    const matchesToInsert = []

    // Time parsing helper
    const getTimestamp = (dateStr, timeStr) => {
      const months = { "jun": "06", "jul": "07" }
      const parts = dateStr.trim().split(/\s+/)
      const day = parts[0].padStart(2, '0')
      const month = months[parts[1].toLowerCase()] || '06'
      return `2026-${month}-${day}T${timeStr}:00+02:00`
    }

    // A. Seed Group Stage Matches
    Object.keys(GROUP_STAGE_SCHEDULE).forEach(gKey => {
      GROUP_STAGE_SCHEDULE[gKey].forEach((m, idx) => {
        matchesToInsert.push({
          id: `${gKey}${idx + 1}`,
          home_team: m.home,
          away_team: m.away,
          home_score: null,
          away_score: null,
          winner: null,
          status: 'scheduled',
          start_time: getTimestamp(m.date, m.time),
          stage: 'group'
        })
      })
    })

    // B. Seed Ronda de 32 Matches
    Object.keys(MATCH_SCHEDULE.r32).forEach(id => {
      const sch = MATCH_SCHEDULE.r32[id]
      const lbl = R32_SLOT_LABELS[id]
      matchesToInsert.push({
        id: id,
        home_team: lbl.home,
        away_team: lbl.away,
        home_score: null,
        away_score: null,
        winner: null,
        status: 'scheduled',
        start_time: getTimestamp(sch.date, sch.time),
        stage: 'r32'
      })
    })

    // C. Seed Octavos (r16) Matches
    const r16Mapping = {
      O1: { home: "Ganador P1", away: "Ganador P2" },
      O2: { home: "Ganador P3", away: "Ganador P4" },
      O3: { home: "Ganador P5", away: "Ganador P6" },
      O4: { home: "Ganador P7", away: "Ganador P8" },
      O5: { home: "Ganador P9", away: "Ganador P10" },
      O6: { home: "Ganador P11", away: "Ganador P12" },
      O7: { home: "Ganador P13", away: "Ganador P14" },
      O8: { home: "Ganador P15", away: "Ganador P16" }
    }
    Object.keys(MATCH_SCHEDULE.r16).forEach(id => {
      const sch = MATCH_SCHEDULE.r16[id]
      const lbl = r16Mapping[id]
      matchesToInsert.push({
        id: id,
        home_team: lbl.home,
        away_team: lbl.away,
        home_score: null,
        away_score: null,
        winner: null,
        status: 'scheduled',
        start_time: getTimestamp(sch.date, sch.time),
        stage: 'r16'
      })
    })

    // D. Seed Cuartos (qf) Matches
    const qfMapping = {
      Q1: { home: "Ganador O1", away: "Ganador O2" },
      Q2: { home: "Ganador O3", away: "Ganador O4" },
      Q3: { home: "Ganador O5", away: "Ganador O6" },
      Q4: { home: "Ganador O7", away: "Ganador O8" }
    }
    Object.keys(MATCH_SCHEDULE.qf).forEach(id => {
      const sch = MATCH_SCHEDULE.qf[id]
      const lbl = qfMapping[id]
      matchesToInsert.push({
        id: id,
        home_team: lbl.home,
        away_team: lbl.away,
        home_score: null,
        away_score: null,
        winner: null,
        status: 'scheduled',
        start_time: getTimestamp(sch.date, sch.time),
        stage: 'qf'
      })
    })

    // E. Seed Semifinales (sf) Matches
    const sfMapping = {
      S1: { home: "Ganador Q1", away: "Ganador Q2" },
      S2: { home: "Ganador Q3", away: "Ganador Q4" }
    }
    Object.keys(MATCH_SCHEDULE.sf).forEach(id => {
      const sch = MATCH_SCHEDULE.sf[id]
      const lbl = sfMapping[id]
      matchesToInsert.push({
        id: id,
        home_team: lbl.home,
        away_team: lbl.away,
        home_score: null,
        away_score: null,
        winner: null,
        status: 'scheduled',
        start_time: getTimestamp(sch.date, sch.time),
        stage: 'sf'
      })
    })

    // F. Seed Tercer Puesto Match
    matchesToInsert.push({
      id: 'third',
      home_team: "Perdedor S1",
      away_team: "Perdedor S2",
      home_score: null,
      away_score: null,
      winner: null,
      status: 'scheduled',
      start_time: getTimestamp(MATCH_SCHEDULE.third.date, MATCH_SCHEDULE.third.time),
      stage: 'third'
    })

    // G. Seed Final Match
    matchesToInsert.push({
      id: 'final',
      home_team: "Ganador S1",
      away_team: "Ganador S2",
      home_score: null,
      away_score: null,
      winner: null,
      status: 'scheduled',
      start_time: getTimestamp(MATCH_SCHEDULE.final.date, MATCH_SCHEDULE.final.time),
      stage: 'final'
    })

    // Bulk insert matches
    const { error: insertError } = await supabase.from('matches').insert(matchesToInsert)
    if (insertError) throw insertError

    successMsg.value = "¡Calendario inicializado con éxito!"
    await fetchMatches()
    emit('matches-updated')
  } catch (err) {
    console.error(err)
    errorMsg.value = "Error al inicializar base de datos: " + err.message
  } finally {
    loading.value = false
  }
}
</script>
