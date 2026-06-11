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
        @close="closeMatchModal"
        @save="savePrediction"
        @clear="clearPrediction"
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { supabase } from './supabaseClient.js'
import Auth from './components/Auth.vue'
import Navbar from './components/Navbar.vue'
import Leaderboard from './components/Leaderboard.vue'
import GroupGrid from './components/GroupGrid.vue'
import BracketTree from './components/BracketTree.vue'
import SimulationTab from './components/SimulationTab.vue'
import AdminPanel from './components/AdminPanel.vue'
import MatchModal from './components/MatchModal.vue'

import {
  GROUPS_DATA,
  calculateGroupStandings,
  selectBestThirds,
  getR32Mapping
} from './utils/tournamentLogic.js'

// Session & Auth state
const user = ref(null)
const session = ref(null)
const profile = ref(null)

// UI State
const activeTab = ref('groups')
const isDark = ref(true)
const saving = ref(false)
const loadingData = ref(false)
const showAuthModal = ref(false)

// Chismoso mode state (view other users)
const chismosoMode = ref(false)
const viewedUser = ref(null)
const chismosoPredictions = ref([])

// Database lists
const officialMatches = ref([])
const userPredictions = ref([])
const leaderboard = ref([])

// Modal prediction state
const showModal = ref(false)
const modalMatch = ref(null) // { id, home, away, scoreHome, scoreAway, locked, groupKey, index }

// Check active session and configure theme on mount
onMounted(() => {
  // Apply dark mode initially
  applyTheme()

  supabase.auth.getSession().then(({ data: { session: s } }) => {
    session.value = s
    user.value = s?.user || null
    fetchInitialData()
  })

  supabase.auth.onAuthStateChange((_event, s) => {
    session.value = s
    const oldUser = user.value
    user.value = s?.user || null
    if (user.value) {
      fetchInitialData()
    } else {
      clearUserState()
      fetchInitialData()
    }
  })
})

function applyTheme() {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
}

function clearUserState() {
  profile.value = null
  userPredictions.value = []
  exitChismosoMode()
}

function clearState() {
  user.value = null
  profile.value = null
  officialMatches.value = []
  userPredictions.value = []
  leaderboard.value = []
  exitChismosoMode()
}

async function handleLogout() {
  await supabase.auth.signOut()
}

function onAuthSuccess(loggedInUser) {
  user.value = loggedInUser
  showAuthModal.value = false
  fetchInitialData()
}

function handleTabChange(tabId) {
  activeTab.value = tabId
}

// Fetch all database information
async function fetchInitialData() {
  loadingData.value = true
  try {
    // 1. Fetch Profile (only if logged in)
    if (user.value) {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .maybeSingle()

      if (profErr) throw profErr
      profile.value = prof
    } else {
      profile.value = null
    }

    // 2. Fetch Matches (ALWAYS)
    const { data: mat, error: matErr } = await supabase
      .from('matches')
      .select('*')
      .order('start_time', { ascending: true })

    if (matErr) throw matErr
    officialMatches.value = mat || []

    // 3. Fetch User Predictions (only if logged in)
    if (user.value) {
      const { data: pred, error: predErr } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.value.id)

      if (predErr) throw predErr
      userPredictions.value = pred || []
    } else {
      userPredictions.value = []
    }

    // 4. Fetch Leaderboard View (ALWAYS)
    const { data: lead, error: leadErr } = await supabase
      .from('leaderboard')
      .select('*')
      .order('total_points', { ascending: false })

    if (leadErr) throw leadErr
    leaderboard.value = lead || []

  } catch (err) {
    console.error("Error loading tournament details:", err)
  } finally {
    loadingData.value = false
  }
}

// Enter chismoso mode to view friend predictions
async function enterChismosoMode(userRow) {
  if (user.value && userRow.user_id === user.value.id) {
    exitChismosoMode()
    return
  }

  loadingData.value = true
  try {
    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userRow.user_id)
      .single()
    if (profErr) throw profErr

    const { data: pred, error: predErr } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userRow.user_id)
    if (predErr) throw predErr

    viewedUser.value = prof
    chismosoPredictions.value = pred || []
    chismosoMode.value = true
    
    // Switch to groups view
    activeTab.value = 'groups'
  } catch (err) {
    console.error("Error loading friend predictions:", err)
    alert("No se pudieron cargar las predicciones del usuario.")
  } finally {
    loadingData.value = false
  }
}

function exitChismosoMode() {
  chismosoMode.value = false
  viewedUser.value = null
  chismosoPredictions.value = []
  activeTab.value = 'leaderboard'
}

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

    // Build the 6 matches of the group stage
    for (let i = 1; i <= 6; i++) {
      const matchId = `${gKey}${i}`
      const match = officialMatches.value.find(m => m.id === matchId)
      if (!match) continue

      const p = predMap[matchId]
      const locked = new Date() >= new Date(match.start_time) || match.status !== 'scheduled'

      if (match.status === 'finished' || match.status === 'live') {
        // Official played match overrides predictions
        groups[gKey].matches.push({
          id: matchId,
          home: match.home_team,
          away: match.away_team,
          scoreHome: match.home_score,
          scoreAway: match.away_score,
          played: true,
          locked: true,
          start_time: match.start_time,
          date: formatDateStr(match.start_time),
          time: formatTimeStr(match.start_time)
        })
      } else {
        // Unplayed official match: load prediction
        groups[gKey].matches.push({
          id: matchId,
          home: match.home_team,
          away: match.away_team,
          scoreHome: p ? p.home_predicted_score : null,
          scoreAway: p ? p.away_predicted_score : null,
          played: p !== undefined,
          locked: locked,
          start_time: match.start_time,
          date: formatDateStr(match.start_time),
          time: formatTimeStr(match.start_time)
        })
      }
    }

    // Calculate standings
    groups[gKey].standings = calculateGroupStandings(groups[gKey].matches, GROUPS_DATA[gKey])

    // Apply manual drag order if present
    const manualOrder = currentManual[gKey]
    if (manualOrder && Array.isArray(manualOrder)) {
      // Re-map standings to match the manual sorting order
      const sorted = []
      manualOrder.forEach(teamName => {
        const row = groups[gKey].standings.find(s => s.team === teamName)
        if (row) sorted.push(row)
      })
      // Add any missing teams to avoid layout breaking
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

  // 1. Determine Ronda de 32 matching
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

  // Populate Round of 32
  Object.keys(r32Mapping).forEach(id => {
    const match = officialMatches.value.find(m => m.id === id)
    if (!match) return

    const mapping = r32Mapping[id]
    const p = predMap[id]
    const locked = new Date() >= new Date(match.start_time) || match.status !== 'scheduled'

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

  // Helper helper to resolve flow of next slots
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
    const locked = new Date() >= new Date(match.start_time) || match.status !== 'scheduled'

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

  // Populate R16
  resolveSlot('r16', 'O1', 'P1', 'P2', 'r32')
  resolveSlot('r16', 'O2', 'P3', 'P4', 'r32')
  resolveSlot('r16', 'O3', 'P5', 'P6', 'r32')
  resolveSlot('r16', 'O4', 'P7', 'P8', 'r32')
  resolveSlot('r16', 'O5', 'P9', 'P10', 'r32')
  resolveSlot('r16', 'O6', 'P11', 'P12', 'r32')
  resolveSlot('r16', 'O7', 'P13', 'P14', 'r32')
  resolveSlot('r16', 'O8', 'P15', 'P16', 'r32')

  // Populate QF
  resolveSlot('qf', 'Q1', 'O1', 'O2', 'r16')
  resolveSlot('qf', 'Q2', 'O3', 'O4', 'r16')
  resolveSlot('qf', 'Q3', 'O5', 'O6', 'r16')
  resolveSlot('qf', 'Q4', 'O7', 'O8', 'r16')

  // Populate SF
  resolveSlot('sf', 'S1', 'Q1', 'Q2', 'qf')
  resolveSlot('sf', 'S2', 'Q3', 'Q4', 'qf')

  // Populate Final
  const finalMatch = officialMatches.value.find(m => m.id === 'final')
  if (finalMatch) {
    const fHome = getWinner('sf', 'S1')
    const fAway = getWinner('sf', 'S2')
    const p = predMap['final']
    const locked = new Date() >= new Date(finalMatch.start_time) || finalMatch.status !== 'scheduled'

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

  // Populate Third Place
  const thirdMatch = officialMatches.value.find(m => m.id === 'third')
  if (thirdMatch) {
    const tHome = getLoser('sf', 'S1')
    const tAway = getLoser('sf', 'S2')
    const p = predMap['third']
    const locked = new Date() >= new Date(thirdMatch.start_time) || thirdMatch.status !== 'scheduled'

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

  // Determine champion
  b.champion = b.final.winner

  return b
})

// MODAL CONTROLS & EVENT HANDLERS
function openMatchEdit(groupKey, idx) {
  const match = computedGroups.value[groupKey].matches[idx]
  modalMatch.value = {
    ...match,
    groupKey,
    index: idx
  }
  showModal.value = true
}

function closeMatchModal() {
  showModal.value = false
  modalMatch.value = null
}

// Save a group stage match prediction in Supabase
async function savePrediction(scoreHome, scoreAway) {
  if (chismosoMode.value) return
  if (!modalMatch.value) return

  const matchId = modalMatch.value.id
  saving.value = true

  let predictedWinner = null
  if (scoreHome > scoreAway) {
    predictedWinner = modalMatch.value.home
  } else if (scoreAway > scoreHome) {
    predictedWinner = modalMatch.value.away
  }

  try {
    const { error } = await supabase
      .from('predictions')
      .upsert({
        user_id: user.value.id,
        match_id: matchId,
        home_predicted_score: scoreHome,
        away_predicted_score: scoreAway,
        predicted_winner: predictedWinner
      }, { onConflict: 'user_id, match_id' })

    if (error) throw error

    // Update locally immediately
    const existingIdx = userPredictions.value.findIndex(p => p.match_id === matchId)
    const newPred = {
      user_id: user.value.id,
      match_id: matchId,
      home_predicted_score: scoreHome,
      away_predicted_score: scoreAway,
      predicted_winner: predictedWinner
    }

    if (existingIdx !== -1) {
      userPredictions.value[existingIdx] = newPred
    } else {
      userPredictions.value.push(newPred)
    }

    closeMatchModal()
  } catch (err) {
    console.error("Error saving score prediction:", err)
    alert("No se pudo guardar la predicción: " + err.message)
  } finally {
    saving.value = false
  }
}

// Clear prediction score
async function clearPrediction() {
  if (chismosoMode.value) return
  if (!modalMatch.value) return

  const matchId = modalMatch.value.id
  saving.value = true

  try {
    const { error } = await supabase
      .from('predictions')
      .delete()
      .eq('user_id', user.value.id)
      .eq('match_id', matchId)

    if (error) throw error

    userPredictions.value = userPredictions.value.filter(p => p.match_id !== matchId)
    closeMatchModal()
  } catch (err) {
    console.error("Error deleting prediction:", err)
    alert("Error al borrar predicción: " + err.message)
  } finally {
    saving.value = false
  }
}

// Save bracket winner selections
async function handleBracketWinner(roundKey, matchId, winnerTeam) {
  if (chismosoMode.value) return

  saving.value = true
  const realMatchId = roundKey === 'champion' ? 'final' : matchId

  try {
    if (roundKey === 'champion') {
      // Set champion = set winner of final
      const fMatch = computedBracket.value.final
      if (!fMatch.home || !fMatch.away) return
      
      const { error } = await supabase
        .from('predictions')
        .upsert({
          user_id: user.value.id,
          match_id: 'final',
          home_predicted_score: winnerTeam === fMatch.home ? 1 : 0,
          away_predicted_score: winnerTeam === fMatch.away ? 1 : 0,
          predicted_winner: winnerTeam
        }, { onConflict: 'user_id, match_id' })

      if (error) throw error

      // Update locally
      const idx = userPredictions.value.findIndex(p => p.match_id === 'final')
      const pData = {
        user_id: user.value.id,
        match_id: 'final',
        home_predicted_score: winnerTeam === fMatch.home ? 1 : 0,
        away_predicted_score: winnerTeam === fMatch.away ? 1 : 0,
        predicted_winner: winnerTeam
      }
      if (idx !== -1) userPredictions.value[idx] = pData
      else userPredictions.value.push(pData)

    } else {
      const match = computedBracket.value[roundKey][matchId]
      if (!match) return

      if (winnerTeam === null) {
        // Delete or set winner null
        const { error } = await supabase
          .from('predictions')
          .delete()
          .eq('user_id', user.value.id)
          .eq('match_id', matchId)

        if (error) throw error
        userPredictions.value = userPredictions.value.filter(p => p.match_id !== matchId)
      } else {
        const { error } = await supabase
          .from('predictions')
          .upsert({
            user_id: user.value.id,
            match_id: matchId,
            home_predicted_score: winnerTeam === match.home ? 1 : 0,
            away_predicted_score: winnerTeam === match.away ? 1 : 0,
            predicted_winner: winnerTeam
          }, { onConflict: 'user_id, match_id' })

        if (error) throw error

        const idx = userPredictions.value.findIndex(p => p.match_id === matchId)
        const pData = {
          user_id: user.value.id,
          match_id: matchId,
          home_predicted_score: winnerTeam === match.home ? 1 : 0,
          away_predicted_score: winnerTeam === match.away ? 1 : 0,
          predicted_winner: winnerTeam
        }
        if (idx !== -1) userPredictions.value[idx] = pData
        else userPredictions.value.push(pData)
      }
    }
  } catch (err) {
    console.error("Error setting winner:", err)
  } finally {
    saving.value = false
  }
}

// Drag & drop validation in bracket
function handleBracketDrop({ roundKey, matchId, position, team }) {
  if (chismosoMode.value) return

  if (roundKey === 'champion') {
    const fMatch = computedBracket.value.final
    if (team === fMatch.home || team === fMatch.away) {
      handleBracketWinner('champion', null, team)
    }
  } else {
    const match = computedBracket.value[roundKey][matchId]
    if (!match) return
    if (position === 'home' && team === match.home) return
    if (position === 'away' && team === match.away) return

    // Allow user to set winner based on dropping
    if (team === match.home || team === match.away) {
      handleBracketWinner(roundKey, matchId, team)
    }
  }
}

// Standings row drag reordering persist
async function handleGroupReorder(groupKey, fromIdx, toIdx) {
  if (chismosoMode.value) return

  const group = computedGroups.value[groupKey]
  if (!group) return

  const reordered = [...group.standings]
  const dragged = reordered[fromIdx]
  reordered.splice(fromIdx, 1)
  reordered.splice(toIdx, 0, dragged)

  // Map to team names
  const newOrder = reordered.map(s => s.team)

  saving.value = true
  try {
    const currentManual = profile.value?.manual_groups || {}
    const updatedManual = { ...currentManual, [groupKey]: newOrder }

    const { error } = await supabase
      .from('profiles')
      .update({ manual_groups: updatedManual })
      .eq('id', user.value.id)

    if (error) throw error

    // Update local profile state
    profile.value.manual_groups = updatedManual
  } catch (err) {
    console.error("Error updating standings order:", err)
    alert("Error al ordenar standings: " + err.message)
  } finally {
    saving.value = false
  }
}

// Helper methods for dates and flags
function formatDateStr(isoStr) {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

function formatTimeStr(isoStr) {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}
</script>
