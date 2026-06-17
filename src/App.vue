<template>
  <div :class="{'dark': isDark}" class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
    <!-- Main Application -->
    <div class="flex flex-col min-h-screen">
      <Navbar
        :activeTab="activeTab"
        :isLoggedIn="!!user"
        :username="profile?.username || (user ? user.email.split('@')[0] : 'Invitado')"
        :isAdmin="profile?.is_admin || false"
        :saving="saving"
        :chismosoMode="chismosoMode"
        :isDark="isDark"
        @change-tab="handleTabChange"
        @logout="handleLogout"
        @open-login="showAuthModal = true"
        @toggle-theme="toggleTheme"
      />

      <!-- Chismoso mode banner -->
      <div v-if="chismosoMode" class="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-400 font-semibold flex items-center justify-center gap-2">
        <span>👁 Viendo las predicciones de <strong>{{ viewedUser?.username }}</strong> (Solo lectura)</span>
        <button
          @click="exitChismosoMode"
          class="px-2.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md transition text-[10px]"
        >
          Volver a mi perfil
        </button>
      </div>

      <!-- Main Content Area -->
      <main class="flex-grow max-w-7xl mx-auto w-full px-4 py-6">
        <!-- 1. Admin Panel (Rendered directly so it's accessible to seed the database) -->
        <div v-if="activeTab === 'admin' && profile?.is_admin">
          <AdminPanel
            @matches-updated="fetchInitialData"
          />
        </div>

        <!-- 2. Alert when database is not initialized (for non-admin tabs) -->
        <div v-else-if="officialMatches.length === 0 && !loadingData" class="p-6 bg-amber-950/20 border border-amber-900/50 rounded-2xl text-center space-y-4 max-w-md mx-auto my-12">
          <span class="text-4xl block">⚠️</span>
          <h3 class="font-extrabold text-amber-400 text-lg">Calendario sin inicializar</h3>
          <p class="text-xs text-slate-400">
            La base de datos de partidos oficiales del torneo está vacía.
            <span v-if="profile?.is_admin">Por favor, dirígete a la pestaña de "Administración" para cargar los encuentros iniciales.</span>
            <span v-else>Por favor, espera a que el administrador del sistema inicialice los partidos para poder empezar a predecir.</span>
          </p>
          <button
            v-if="profile?.is_admin"
            @click="activeTab = 'admin'"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Ir a Administración
          </button>
        </div>

        <!-- 3. Loading Indicator -->
        <div v-else-if="loadingData" class="py-24 text-center text-slate-500 text-xs font-bold">
          <div class="inline-block animate-spin text-lg mr-2">⏳</div> Cargando datos del torneo...
        </div>

        <!-- 4. Other tabs (Rendered once matches are populated) -->
        <div v-else>
          <!-- 0. CALENDAR -->
          <CalendarTab
            v-if="activeTab === 'calendar'"
            :officialMatches="officialMatches"
            :userPredictions="userPredictions"
            :computedGroups="computedGroups"
            :computedBracket="computedBracket"
            :readOnly="chismosoMode || !user"
            @edit-match="openCalendarMatchEdit"
          />

          <!-- 1. LEADERBOARD -->
          <Leaderboard
            v-if="activeTab === 'leaderboard'"
            :users="leaderboard"
            :currentUserId="user ? user.id : null"
            @view-predictions="enterChismosoMode"
          />

          <!-- 2. GROUPS -->
          <GroupGrid
            v-if="activeTab === 'groups'"
            :groups="computedGroups"
            :readOnly="chismosoMode || !user"
            @edit-match="openMatchEdit"
            @reorder-group="handleGroupReorder"
          />

          <!-- 3. BRACKET -->
          <BracketTree
            v-if="activeTab === 'bracket'"
            :bracket="computedBracket"
            :readOnly="chismosoMode || !user"
            @set-winner="handleBracketWinner"
            @validate-and-drop="handleBracketDrop"
          />

          <!-- 4. SIMULATION -->
          <SimulationTab
            v-if="activeTab === 'simulation'"
            :groups="computedGroups"
            :bracket="computedBracket"
          />
        </div>
      </main>

      <!-- Match Modal Popup -->
      <MatchModal
        :show="showModal"
        :homeTeam="modalMatch?.home || ''"
        :awayTeam="modalMatch?.away || ''"
        :scoreHome="modalMatch?.scoreHome"
        :scoreAway="modalMatch?.scoreAway"
        :locked="modalMatch?.locked"
        :isKnockout="modalMatch?.stage && modalMatch?.stage !== 'group'"
        :predictedWinner="modalMatch?.winner || ''"
        @close="closeMatchModal"
        @save="handleModalSave"
        @clear="clearCalendarPrediction"
      />

      <!-- Authentication Modal Overlay -->
      <div v-if="showAuthModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div class="relative w-full max-w-md">
          <!-- Close button -->
          <button
            @click="showAuthModal = false"
            class="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold z-20 cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-slate-900/60 hover:bg-slate-800 transition"
            title="Cerrar"
          >
            ✕
          </button>
          <Auth @auth-success="onAuthSuccess" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { formatDateStr, formatTimeStr } from './utils/helpers.js'
import { supabase } from './supabaseClient.js'
import Auth from './components/Auth.vue'
import Navbar from './components/Navbar.vue'
import GroupGrid from './components/GroupGrid.vue'
import MatchModal from './components/MatchModal.vue'

// Lazy-loaded components
const CalendarTab = defineAsyncComponent(() => import('./components/CalendarTab.vue'))
const Leaderboard = defineAsyncComponent(() => import('./components/Leaderboard.vue'))
const BracketTree = defineAsyncComponent(() => import('./components/BracketTree.vue'))
const SimulationTab = defineAsyncComponent(() => import('./components/SimulationTab.vue'))
const AdminPanel = defineAsyncComponent(() => import('./components/AdminPanel.vue'))

import {
  GROUPS_DATA,
  calculateGroupStandings,
  selectBestThirds,
  getR32Mapping
} from './utils/tournamentLogic.js'

// Composables
import { useAuth } from './composables/useAuth.js'
import { useTournament } from './composables/useTournament.js'
import { usePredictions } from './composables/usePredictions.js'
import { useChismoso } from './composables/useChismoso.js'

// 1. Central UI/Database Refs
const activeTab = ref('calendar')
const officialMatches = ref([])
const userPredictions = ref([])
const leaderboard = ref([])
const loadingData = ref(false)
const showModal = ref(false)
const modalMatch = ref(null)

// 2. Auth & Theme Composable
const {
  user,
  session,
  profile,
  showAuthModal,
  isDark,
  applyTheme,
  toggleTheme,
  handleLogout
} = useAuth()

// 3. Chismoso Composable
const {
  chismosoMode,
  viewedUser,
  chismosoPredictions,
  enterChismosoMode,
  exitChismosoMode
} = useChismoso(user, activeTab, loadingData)

// 4. Computed select states
// REACTIVE COMPUTED STATE FOR GROUPS AND STANDINGS
const computedGroups = computed(() => {
  const currentPreds = chismosoMode.value ? chismosoPredictions.value : userPredictions.value
  const currentManual = chismosoMode.value ? (viewedUser.value?.manual_groups || {}) : (profile.value?.manual_groups || {})
  const predMap = {}
  currentPreds.forEach(p => {
    predMap[p.match_id] = p
  })

  const groups = {}
  Object.keys(GROUPS_DATA).forEach(gKey => {
    groups[gKey] = {
      standings: [],
      matches: []
    }

    for (let i = 1; i <= 6; i++) {
      const matchId = `${gKey}${i}`
      const match = officialMatches.value.find(m => m.id === matchId)
      if (!match) continue

      const p = predMap[matchId]
      const locked = new Date().getTime() >= new Date(match.start_time).getTime() - 10 * 60 * 1000 || match.status !== 'scheduled'

      if (match.status === 'finished' || match.status === 'live') {
        const hasScore = match.home_score !== null && match.home_score !== undefined &&
                         match.away_score !== null && match.away_score !== undefined
        groups[gKey].matches.push({
          id: matchId,
          home: match.home_team,
          away: match.away_team,
          scoreHome: hasScore ? match.home_score : null,
          scoreAway: hasScore ? match.away_score : null,
          played: hasScore,
          isLive: match.status === 'live',
          isFinished: match.status === 'finished',
          locked: true,
          start_time: match.start_time,
          date: formatDateStr(match.start_time),
          time: formatTimeStr(match.start_time)
        })
      } else {
        groups[gKey].matches.push({
          id: matchId,
          home: match.home_team,
          away: match.away_team,
          scoreHome: p ? p.home_predicted_score : null,
          scoreAway: p ? p.away_predicted_score : null,
          played: p !== undefined,
          isLive: match.status === 'live',
          isFinished: match.status === 'finished',
          locked: locked,
          start_time: match.start_time,
          date: formatDateStr(match.start_time),
          time: formatTimeStr(match.start_time)
        })
      }
    }

    groups[gKey].standings = calculateGroupStandings(groups[gKey].matches, GROUPS_DATA[gKey])

    const manualOrder = currentManual[gKey]
    if (manualOrder && Array.isArray(manualOrder)) {
      const sorted = []
      manualOrder.forEach(teamName => {
        const row = groups[gKey].standings.find(s => s.team === teamName)
        if (row) sorted.push(row)
      })
      groups[gKey].standings.forEach(row => {
        if (!sorted.includes(row)) sorted.push(row)
      })
      groups[gKey].standings = sorted
    }
  })
  return groups
})

// REACTIVE COMPUTED STATE FOR KNOCKOUT BRACKET
const computedBracket = computed(() => {
  const currentPreds = chismosoMode.value ? chismosoPredictions.value : userPredictions.value
  const predMap = {}
  currentPreds.forEach(p => {
    predMap[p.match_id] = p
  })

  const r32Mapping = getR32Mapping(computedGroups.value)
  const b = {
    r32: {},
    r16: {},
    qf: {},
    sf: { S1: {}, S2: {} },
    final: {},
    third: {},
    champion: null
  }

  Object.keys(r32Mapping).forEach(id => {
    const match = officialMatches.value.find(m => m.id === id)
    if (!match) return

    const mapping = r32Mapping[id]
    const p = predMap[id]
    const locked = new Date().getTime() >= new Date(match.start_time).getTime() - 10 * 60 * 1000 || match.status !== 'scheduled'

    if (match.status === 'finished') {
      b.r32[id] = {
        home: match.home_team,
        away: match.away_team,
        winner: match.winner,
        locked: true
      }
    } else {
      b.r32[id] = {
        home: mapping.home,
        away: mapping.away,
        winner: (p && (p.predicted_winner === mapping.home || p.predicted_winner === mapping.away)) ? p.predicted_winner : null,
        locked: locked
      }
    }
  })

  const getWinner = (round, matchId) => {
    const m = b[round][matchId]
    return m ? m.winner : null
  }

  const getLoser = (round, matchId) => {
    const m = b[round][matchId]
    if (!m || !m.winner) return null
    return m.winner === m.home ? m.away : m.home
  }

  const resolveSlot = (stage, id, prev1, prev2, prevRound) => {
    const match = officialMatches.value.find(m => m.id === id)
    if (!match) return

    const homeVal = getWinner(prevRound, prev1)
    const awayVal = getWinner(prevRound, prev2)
    const p = predMap[id]
    const locked = new Date().getTime() >= new Date(match.start_time).getTime() - 10 * 60 * 1000 || match.status !== 'scheduled'

    if (match.status === 'finished') {
      b[stage][id] = {
        home: match.home_team,
        away: match.away_team,
        winner: match.winner,
        locked: true
      }
    } else {
      b[stage][id] = {
        home: homeVal,
        away: awayVal,
        winner: (p && (p.predicted_winner === homeVal || p.predicted_winner === awayVal)) ? p.predicted_winner : null,
        locked: locked
      }
    }
  }

  resolveSlot('r16', 'O1', 'P1', 'P2', 'r32')
  resolveSlot('r16', 'O2', 'P3', 'P4', 'r32')
  resolveSlot('r16', 'O3', 'P5', 'P6', 'r32')
  resolveSlot('r16', 'O4', 'P7', 'P8', 'r32')
  resolveSlot('r16', 'O5', 'P9', 'P10', 'r32')
  resolveSlot('r16', 'O6', 'P11', 'P12', 'r32')
  resolveSlot('r16', 'O7', 'P13', 'P14', 'r32')
  resolveSlot('r16', 'O8', 'P15', 'P16', 'r32')

  resolveSlot('qf', 'Q1', 'O1', 'O2', 'r16')
  resolveSlot('qf', 'Q2', 'O3', 'O4', 'r16')
  resolveSlot('qf', 'Q3', 'O5', 'O6', 'r16')
  resolveSlot('qf', 'Q4', 'O7', 'O8', 'r16')

  resolveSlot('sf', 'S1', 'Q1', 'Q2', 'qf')
  resolveSlot('sf', 'S2', 'Q3', 'Q4', 'qf')

  const finalMatch = officialMatches.value.find(m => m.id === 'final')
  if (finalMatch) {
    const fHome = getWinner('sf', 'S1')
    const fAway = getWinner('sf', 'S2')
    const p = predMap['final']
    const locked = new Date().getTime() >= new Date(finalMatch.start_time).getTime() - 10 * 60 * 1000 || finalMatch.status !== 'scheduled'

    if (finalMatch.status === 'finished') {
      b.final = { home: finalMatch.home_team, away: finalMatch.away_team, winner: finalMatch.winner, locked: true }
    } else {
      b.final = {
        home: fHome,
        away: fAway,
        winner: (p && (p.predicted_winner === fHome || p.predicted_winner === fAway)) ? p.predicted_winner : null,
        locked: locked
      }
    }
  }

  const thirdMatch = officialMatches.value.find(m => m.id === 'third')
  if (thirdMatch) {
    const tHome = getLoser('sf', 'S1')
    const tAway = getLoser('sf', 'S2')
    const p = predMap['third']
    const locked = new Date().getTime() >= new Date(thirdMatch.start_time).getTime() - 10 * 60 * 1000 || thirdMatch.status !== 'scheduled'

    if (thirdMatch.status === 'finished') {
      b.third = { home: thirdMatch.home_team, away: thirdMatch.away_team, winner: thirdMatch.winner, locked: true }
    } else {
      b.third = {
        home: tHome,
        away: tAway,
        winner: (p && (p.predicted_winner === tHome || p.predicted_winner === tAway)) ? p.predicted_winner : null,
        locked: locked
      }
    }
  }

  b.champion = b.final.winner
  return b
})

// 5. Modal and local UI helper functions
function openMatchEdit(groupKey, idx) {
  const match = computedGroups.value[groupKey].matches[idx]
  modalMatch.value = {
    ...match,
    groupKey,
    index: idx
  }
  showModal.value = true
}

function openCalendarMatchEdit(match) {
  if (match.stage === 'group') {
    const groupKey = match.id.charAt(0)
    const groupMatches = computedGroups.value[groupKey]?.matches || []
    const idx = groupMatches.findIndex(m => m.id === match.id)
    if (idx !== -1) {
      openMatchEdit(groupKey, idx)
    } else {
      modalMatch.value = {
        id: match.id,
        home: match.home,
        away: match.away,
        scoreHome: match.scoreHome,
        scoreAway: match.scoreAway,
        locked: match.locked,
        stage: 'group'
      }
      showModal.value = true
    }
  } else {
    modalMatch.value = {
      id: match.id,
      home: match.home,
      away: match.away,
      winner: match.winner,
      locked: match.locked,
      stage: match.stage,
      roundKey: match.roundKey
    }
    showModal.value = true
  }
}

async function handleModalSave(scoreHomeOrWinner, scoreAway) {
  if (modalMatch.value?.stage && modalMatch.value.stage !== 'group') {
    const winnerTeam = scoreHomeOrWinner
    await handleBracketWinner(modalMatch.value.roundKey, modalMatch.value.id, winnerTeam)
    closeMatchModal()
  } else {
    await savePrediction(scoreHomeOrWinner, scoreAway)
  }
}

async function clearCalendarPrediction() {
  if (modalMatch.value?.stage && modalMatch.value.stage !== 'group') {
    await handleBracketWinner(modalMatch.value.roundKey, modalMatch.value.id, null)
    closeMatchModal()
  } else {
    await clearPrediction()
  }
}

function closeMatchModal() {
  showModal.value = false
  modalMatch.value = null
}

function clearUserState() {
  profile.value = null
  userPredictions.value = []
  chismosoMode.value = false
  viewedUser.value = null
  chismosoPredictions.value = []
}

function onAuthSuccess(loggedInUser) {
  user.value = loggedInUser
  showAuthModal.value = false
  fetchInitialData()
}

function handleTabChange(tabId) {
  activeTab.value = tabId
}

// 6. Predictions Composable
const {
  saving,
  savePrediction,
  clearPrediction,
  handleBracketWinner,
  handleBracketDrop,
  handleGroupReorder
} = usePredictions(
  user,
  profile,
  userPredictions,
  chismosoMode,
  modalMatch,
  computedGroups,
  computedBracket,
  closeMatchModal
)

// 7. Tournament Data Fetcher & Lifecycle Hooks Composable
const { fetchInitialData } = useTournament(
  user,
  session,
  profile,
  officialMatches,
  userPredictions,
  leaderboard,
  loadingData,
  clearUserState
)

onMounted(() => {
  applyTheme()
})
</script>
