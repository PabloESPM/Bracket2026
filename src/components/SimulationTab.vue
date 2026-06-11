<template>
  <div class="space-y-6">
    <!-- Simulation Header -->
    <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
      <div>
        <h2 class="text-lg font-bold flex items-center gap-2">
          <span>🔮</span> Simulador de Torneo Monte Carlo
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          Calcula de manera probabilística las opciones de cada equipo basándose en su rendimiento y tu estado actual de predicciones.
        </p>
      </div>
      <div class="flex gap-2 shrink-0">
        <button
          @click="clearSimulation"
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          Limpiar
        </button>
        <button
          @click="runSimulation"
          :disabled="simulating"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition disabled:opacity-50 cursor-pointer"
        >
          {{ simulating ? 'Simulando...' : '⚡ Simular Torneo (1,000 iteraciones)' }}
        </button>
      </div>
    </div>

    <!-- Status indicator -->
    <div class="flex items-center justify-between px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-xs">
      <span class="text-slate-400 font-medium">Estado del simulador:</span>
      <span
        class="px-2 py-0.5 rounded-full font-bold border text-[10px]"
        :class="hasResults ? 'text-emerald-400 border-emerald-900/50 bg-emerald-950/20' : 'text-slate-400 border-slate-800 bg-slate-900'"
      >
        {{ hasResults ? 'Simulación Completada' : 'Listo para simular' }}
      </span>
    </div>

    <!-- Probability Table -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr class="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[10px] md:text-xs">
              <th class="p-3">Selección</th>
              <th class="p-3 text-center">Fase G.</th>
              <th class="p-3 text-center">Ronda 32</th>
              <th class="p-3 text-center">Octavos</th>
              <th class="p-3 text-center">Cuartos</th>
              <th class="p-3 text-center">Semifinal</th>
              <th class="p-3 text-center">Final</th>
              <th class="p-3 text-center text-amber-400 font-bold">Campeón</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!hasResults">
              <td colspan="8" class="p-8 text-center text-slate-500">
                Haz clic en "Simular Torneo" para calcular las probabilidades de clasificación basadas en Monte Carlo.
              </td>
            </tr>
            <tr
              v-else
              v-for="p in results"
              :key="p.team"
              class="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors text-[11px] md:text-xs"
            >
              <td class="p-3 font-semibold text-slate-100 flex items-center gap-2">
                <img class="w-4.5 h-3 object-cover rounded-sm shadow-sm border border-slate-800" :src="getFlagUrl(p.team)" alt="">
                <span class="truncate max-w-[100px] md:max-w-none">{{ p.team }}</span>
              </td>
              <td class="p-3 text-center text-slate-400">100%</td>
              <td class="p-3 text-center font-bold" :class="getPillClass(p.r32)">{{ p.r32 }}%</td>
              <td class="p-3 text-center font-bold" :class="getPillClass(p.r16)">{{ p.r16 }}%</td>
              <td class="p-3 text-center font-bold" :class="getPillClass(p.qf)">{{ p.qf }}%</td>
              <td class="p-3 text-center font-bold" :class="getPillClass(p.sf)">{{ p.sf }}%</td>
              <td class="p-3 text-center font-bold" :class="getPillClass(p.final)">{{ p.final }}%</td>
              <td class="p-3 text-center font-black text-amber-400 text-xs md:text-sm bg-amber-950/5">{{ p.champion }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  TEAMS_INFO,
  GROUPS_DATA,
  calculateGroupStandings,
  selectBestThirds,
  getR32Mapping
} from '../utils/tournamentLogic.js'
import {
  simulateMatchScore,
  simulateRemainingBracket
} from '../utils/simulation.js'

const props = defineProps({
  groups: {
    type: Object,
    required: true
  },
  bracket: {
    type: Object,
    required: true
  }
})

const simulating = ref(false)
const hasResults = ref(false)
const results = ref([])

function getFlagUrl(team) {
  const info = TEAMS_INFO[team]
  if (!info) return ''
  return `https://flagcdn.com/24x18/${info.flag}.png`
}

function getPillClass(pct) {
  if (pct > 70) return 'text-emerald-400'
  if (pct > 40) return 'text-emerald-500/80'
  if (pct > 15) return 'text-blue-400'
  if (pct > 5) return 'text-slate-400'
  return 'text-slate-600'
}

function clearSimulation() {
  results.value = []
  hasResults.value = false
}

function runSimulation() {
  simulating.value = true
  hasResults.value = false

  setTimeout(() => {
    const iterations = 1000
    const counts = {}

    // Initialize counts
    Object.keys(TEAMS_INFO).forEach(tName => {
      counts[tName] = {
        team: tName,
        r32: 0,
        r16: 0,
        qf: 0,
        sf: 0,
        final: 0,
        champion: 0
      }
    })

    // Perform Monte Carlo runs
    for (let i = 0; i < iterations; i++) {
      // 1. Clone the current predictions status
      const iterGroups = {}
      Object.keys(props.groups).forEach(gKey => {
        const group = props.groups[gKey]
        iterGroups[gKey] = {
          standings: [],
          matches: group.matches.map(m => ({ ...m }))
        }
      })

      const iterBracket = {
        r32: {},
        r16: {},
        qf: {},
        sf: {
          S1: { ...props.bracket.sf.S1 },
          S2: { ...props.bracket.sf.S2 }
        },
        final: { ...props.bracket.final },
        third: { ...props.bracket.third },
        champion: props.bracket.champion
      }

      Object.keys(props.bracket.r32).forEach(k => { iterBracket.r32[k] = { ...props.bracket.r32[k] } })
      Object.keys(props.bracket.r16).forEach(k => { iterBracket.r16[k] = { ...props.bracket.r16[k] } })
      Object.keys(props.bracket.qf).forEach(k => { iterBracket.qf[k] = { ...props.bracket.qf[k] } })

      // 2. Simulate group stage remaining matches
      Object.keys(iterGroups).forEach(gKey => {
        const group = iterGroups[gKey]
        group.matches.forEach(m => {
          if (!m.played) {
            const res = simulateMatchScore(m.home, m.away)
            m.scoreHome = res.scoreHome
            m.scoreAway = res.scoreAway
            m.played = true
          }
        })
        group.standings = calculateGroupStandings(group.matches, GROUPS_DATA[gKey])
      })

      // Select thirds and determine bracket
      const thirds = selectBestThirds(iterGroups)

      // Map to R32 slots
      const mapping = getR32Mapping(iterGroups)
      Object.keys(mapping).forEach(pKey => {
        iterBracket.r32[pKey].home = mapping[pKey].home
        iterBracket.r32[pKey].away = mapping[pKey].away
      })

      // Propagate matches and count stage advances
      // Count group/r32 stage advances
      Object.keys(iterGroups).forEach(gKey => {
        const standings = iterGroups[gKey].standings
        standings.forEach((s, idx) => {
          if (idx < 2) {
            counts[s.team].r32++
          } else if (idx === 2 && thirds.includes(s.team)) {
            counts[s.team].r32++
          }
        })
      })

      // Simulate bracket rounds
      simulateRemainingBracket(iterBracket)

      // Record count matches
      Object.keys(iterBracket.r16).forEach(k => {
        const m = iterBracket.r16[k]
        if (m.home) counts[m.home].r16++
        if (m.away) counts[m.away].r16++
      })

      Object.keys(iterBracket.qf).forEach(k => {
        const m = iterBracket.qf[k]
        if (m.home) counts[m.home].qf++
        if (m.away) counts[m.away].qf++
      })

      if (iterBracket.sf.S1.home) counts[iterBracket.sf.S1.home].sf++
      if (iterBracket.sf.S1.away) counts[iterBracket.sf.S1.away].sf++
      if (iterBracket.sf.S2.home) counts[iterBracket.sf.S2.home].sf++
      if (iterBracket.sf.S2.away) counts[iterBracket.sf.S2.away].sf++

      if (iterBracket.final.home) counts[iterBracket.final.home].final++
      if (iterBracket.final.away) counts[iterBracket.final.away].final++

      if (iterBracket.champion) counts[iterBracket.champion].champion++
    }

    // Compile results
    results.value = Object.values(counts).map(c => ({
      team: c.team,
      r32: Math.round((c.r32 / iterations) * 100),
      r16: Math.round((c.r16 / iterations) * 100),
      qf: Math.round((c.qf / iterations) * 100),
      sf: Math.round((c.sf / iterations) * 100),
      final: Math.round((c.final / iterations) * 100),
      champion: Math.round((c.champion / iterations) * 100)
    }))

    // Sort: Champion % desc, then final %, then sf %
    results.value.sort((a, b) => {
      if (b.champion !== a.champion) return b.champion - a.champion
      if (b.final !== a.final) return b.final - a.final
      if (b.sf !== a.sf) return b.sf - a.sf
      if (b.qf !== a.qf) return b.qf - a.qf
      if (b.r16 !== a.r16) return b.r16 - a.r16
      if (b.r32 !== a.r32) return b.r32 - a.r32
      return a.team.localeCompare(b.team)
    })

    simulating.value = false
    hasResults.value = true
  }, 50)
}
</script>
