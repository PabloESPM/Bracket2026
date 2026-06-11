<template>
  <div class="space-y-6">
    <!-- Mode Header -->
    <div class="flex flex-col sm:flex-row items-center justify-between bg-slate-900/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-800 gap-4">
      <div>
        <h2 class="text-lg font-bold flex items-center gap-2">
          <span>⚽</span> Configuración de la Fase de Grupos
        </h2>
        <p class="text-xs text-slate-400">
          {{ readOnly ? 'Viendo predicciones en modo de solo lectura para curiosear.' : 'Introduce resultados para calcular las tablas o arrastra las filas para predecir el orden manualmente.' }}
        </p>
      </div>
      <div v-if="!readOnly" class="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 self-end sm:self-auto">
        <button
          @click="mode = 'results'"
          class="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200"
          :class="mode === 'results' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
        >
          Resultados
        </button>
        <button
          @click="mode = 'drag'"
          class="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200"
          :class="mode === 'drag' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
        >
          Arrastre manual
        </button>
      </div>
    </div>

    <!-- Groups Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(group, gKey) in groups"
        :key="gKey"
        class="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl flex flex-col transition-all duration-200"
      >
        <!-- Card Header -->
        <div class="px-4 py-3.5 bg-slate-950/40 border-b border-slate-800 flex justify-between items-center">
          <h3 class="font-extrabold text-sm tracking-wider text-slate-200">GRUPO {{ gKey }}</h3>
          <span
            v-if="!readOnly"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-800 bg-slate-950/60"
            :class="mode === 'drag' ? 'text-amber-400 border-amber-900/50' : 'text-blue-400 border-blue-900/50'"
          >
            {{ mode === 'drag' ? '🔀 Modo Arrastre' : '📝 Modo Resultados' }}
          </span>
        </div>

        <!-- Standings Table -->
        <table class="w-full text-left text-[11px] md:text-xs border-collapse">
          <thead>
            <tr class="bg-slate-950/20 text-slate-400 border-b border-slate-800/60">
              <th class="py-1.5 md:py-2 px-0.5 md:px-1 text-center w-6">#</th>
              <th class="py-1.5 md:py-2 px-0.5 md:px-1">Selección</th>
              <th class="py-1.5 md:py-2 px-0.5 md:px-1 text-center w-7">PJ</th>
              <th class="py-1.5 md:py-2 px-0.5 md:px-1 text-center w-5 hidden sm:table-cell">G</th>
              <th class="py-1.5 md:py-2 px-0.5 md:px-1 text-center w-5 hidden sm:table-cell">E</th>
              <th class="py-1.5 md:py-2 px-0.5 md:px-1 text-center w-5 hidden sm:table-cell">P</th>
              <th class="py-1.5 md:py-2 px-0.5 md:px-1 text-center w-7 hidden md:table-cell">GF</th>
              <th class="py-1.5 md:py-2 px-0.5 md:px-1 text-center w-7 hidden md:table-cell">GC</th>
              <th class="py-1.5 md:py-2 px-0.5 md:px-1 text-center w-7">DG</th>
              <th class="py-1.5 md:py-2 px-0.5 md:px-1 text-center font-bold w-8">Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(s, idx) in group.standings"
              :key="s.team"
              class="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors"
              :class="[getConfClass(s.team), mode === 'drag' && !readOnly ? 'cursor-grab active:cursor-grabbing' : '']"
              :draggable="mode === 'drag' && !readOnly"
              @dragstart="dragStart(gKey, idx, $event)"
              @dragover.prevent
              @drop="drop(gKey, idx)"
            >
              <td class="py-1.5 md:py-2 px-0.5 md:px-1 text-center font-bold text-slate-500">{{ idx + 1 }}</td>
              <td class="py-1.5 md:py-2 px-0.5 md:px-1 font-semibold text-slate-200 flex items-center gap-1.5 min-w-[90px] md:min-w-[100px]">
                <span class="text-[9px] mr-0.5">{{ idx < 2 ? '🟢' : idx === 2 ? '🟡' : '🔴' }}</span>
                <img class="w-4 h-2.5 md:w-4.5 md:h-3 object-cover rounded-sm shadow-sm" :src="getFlagUrl(s.team)" alt="">
                <span class="truncate max-w-[65px] sm:max-w-[80px] md:max-w-[95px]">{{ s.team }}</span>
              </td>
              <td class="py-1.5 md:py-2 px-0.5 md:px-1 text-center text-slate-400">{{ s.pj }}</td>
              <td class="py-1.5 md:py-2 px-0.5 md:px-1 text-center text-slate-400 hidden sm:table-cell">{{ s.g }}</td>
              <td class="py-1.5 md:py-2 px-0.5 md:px-1 text-center text-slate-400 hidden sm:table-cell">{{ s.e }}</td>
              <td class="py-1.5 md:py-2 px-0.5 md:px-1 text-center text-slate-400 hidden sm:table-cell">{{ s.p }}</td>
              <td class="py-1.5 md:py-2 px-0.5 md:px-1 text-center text-slate-400 hidden md:table-cell">{{ s.gf }}</td>
              <td class="py-1.5 md:py-2 px-0.5 md:px-1 text-center text-slate-400 hidden md:table-cell">{{ s.gc }}</td>
              <td class="py-1.5 md:py-2 px-0.5 md:px-1 text-center" :class="s.dg > 0 ? 'text-emerald-500' : s.dg < 0 ? 'text-red-500' : 'text-slate-400'">
                {{ s.dg > 0 ? '+' + s.dg : s.dg }}
              </td>
              <td class="py-1.5 md:py-2 px-0.5 md:px-1 text-center font-extrabold text-slate-100">{{ s.pts }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Matches Section -->
        <div v-if="mode === 'results'" class="p-2 md:p-3 border-t border-slate-800/50 bg-slate-950/20 space-y-1 md:space-y-1.5 mt-auto">
          <div
            v-for="(m, mIdx) in group.matches"
            :key="mIdx"
            @click="editMatch(gKey, mIdx)"
            class="flex flex-col p-1.5 md:p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 cursor-pointer border border-slate-800/30 hover:border-slate-700/60 transition duration-150 space-y-0.5 md:space-y-1"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 md:gap-2 w-[42%] justify-end text-right">
                <span class="font-medium text-[10px] md:text-[11px] text-slate-300 truncate">{{ m.home }}</span>
                <img class="w-4 h-2.5 md:w-4.5 md:h-3 object-cover rounded-sm" :src="getFlagUrl(m.home)" alt="">
              </div>
              
            <!-- Score / vs badge -->
              <span
                class="text-[10px] md:text-[11px] px-1.5 md:px-2 py-0.5 rounded-md border min-w-[34px] md:min-w-[38px] text-center"
                :class="[
                  m.isLive
                    ? 'bg-red-950/60 border-red-800/60 text-red-400 font-extrabold animate-pulse'
                    : m.played
                      ? 'bg-slate-900/80 border-slate-800/50 text-indigo-400 font-extrabold'
                      : 'bg-slate-900/80 border-slate-800/50 text-slate-500 font-semibold',
                  isLocked(m) && !m.played && !m.isLive ? 'border-amber-900/50' : ''
                ]"
              >
                <span v-if="m.isLive" class="mr-0.5 text-[7px] align-middle">🔴</span>
                <span v-else-if="isLocked(m) && !m.played" class="mr-0.5 text-[8px]" title="Pronóstico cerrado">🔒</span>
                <span v-if="m.isLive && !m.played">En curso</span>
                <span v-else>{{ m.played ? `${m.scoreHome} - ${m.scoreAway}` : 'vs' }}</span>
              </span>

              <div class="flex items-center gap-1.5 md:gap-2 w-[42%] justify-start text-left">
                <img class="w-4 h-2.5 md:w-4.5 md:h-3 object-cover rounded-sm" :src="getFlagUrl(m.away)" alt="">
                <span class="font-medium text-[10px] md:text-[11px] text-slate-300 truncate">{{ m.away }}</span>
              </div>
            </div>
            <!-- Match Info Footer -->
            <div class="flex items-center justify-between text-[8px] md:text-[9px] text-slate-500 font-medium px-1">
              <span>📅 {{ m.date }}</span>
              <span class="truncate max-w-[100px] md:max-w-[130px]">📍 {{ m.city || m.stadium }}</span>
              <span
                class="px-1 rounded text-[7px] md:text-[8px] font-extrabold"
                :class="m.isLive
                  ? 'text-red-400 bg-red-950/40 border border-red-900/40'
                  : 'text-indigo-400 bg-indigo-950/40 border border-indigo-900/40'"
              >{{ m.isLive ? '🔴 EN VIVO' : '⏱ ' + m.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { TEAMS_INFO, CONF_CLASSES } from '../utils/tournamentLogic.js'

const props = defineProps({
  groups: {
    type: Object,
    required: true
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit-match', 'reorder-group'])

const mode = ref('results') // 'results' or 'drag'

// Drag reordering state variables
let dragSourceGroupKey = null
let dragSourceRowIdx = null

function dragStart(gKey, idx, e) {
  if (props.readOnly) return
  dragSourceGroupKey = gKey
  dragSourceRowIdx = idx
  e.dataTransfer.effectAllowed = 'move'
}

function drop(targetGKey, targetIdx) {
  if (props.readOnly) return
  if (dragSourceGroupKey !== targetGKey) return // Solo ordenar dentro del mismo grupo
  
  emit('reorder-group', targetGKey, dragSourceRowIdx, targetIdx)
}

function getFlagUrl(team) {
  const info = TEAMS_INFO[team]
  if (!info) return ''
  return `https://flagcdn.com/24x18/${info.flag}.png`
}

function getConfClass(team) {
  const info = TEAMS_INFO[team]
  if (!info) return ''
  return CONF_CLASSES[info.conf] || ''
}

function editMatch(gKey, idx) {
  if (props.readOnly) return
  emit('edit-match', gKey, idx)
}

function isLocked(match) {
  if (!match.start_time) return false
  return new Date() >= new Date(match.start_time)
}
</script>
