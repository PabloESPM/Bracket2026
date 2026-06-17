<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center"
  >
    <div class="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl w-full max-w-[90%] sm:max-w-md mx-4 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="font-bold text-base md:text-lg text-slate-100">
          {{ locked || !isTeamsReady ? 'Detalles del Partido' : 'Introducir Marcador' }}
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
      </div>

      <!-- Lock Alert -->
      <div v-if="locked" class="p-2.5 bg-amber-950/30 border border-amber-900/40 rounded-xl text-center text-amber-400 text-xs font-semibold animate-pulse">
        🔒 Partido bloqueado. El juego ya comenzó o finalizó.
      </div>
      
      <!-- Teams Not Ready Alert -->
      <div v-else-if="isKnockout && !isTeamsReady" class="p-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-center text-slate-400 text-xs font-semibold">
        ⏳ Los equipos participantes aún no están definidos.
      </div>

      <!-- Inputs for Group stage -->
      <div v-if="!isKnockout" class="flex items-center justify-between py-4 md:py-6 gap-2 md:gap-4">
        <!-- Home Team -->
        <div class="flex flex-col items-center flex-1 text-center min-w-0">
          <img v-if="getFlagUrl(homeTeam)" class="w-12 h-9 md:w-16 md:h-12 object-cover rounded-md md:rounded-lg shadow-md mb-2 border border-slate-800" :src="getFlagUrl(homeTeam, 64, 48)" @error="$event.target.style.display = 'none'" :alt="`Bandera de ${homeTeam}`" width="64" height="48" loading="lazy">
          <span class="font-bold text-xs md:text-sm text-slate-200 truncate w-full px-1">{{ homeTeam }}</span>
        </div>

        <!-- Input Score -->
        <div class="flex items-center gap-1.5 md:gap-2 shrink-0">
            <input
              type="number"
              v-model="scoreHomeVal"
              min="0"
              max="99"
              :disabled="locked"
              :aria-label="`Goles de ${homeTeam}`"
              class="w-12 h-12 md:w-14 md:h-14 bg-slate-950 border border-slate-800 text-center font-extrabold text-xl md:text-2xl rounded-lg md:rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
            >
          <span class="text-slate-500 text-lg md:text-xl font-bold">:</span>
            <input
              type="number"
              v-model="scoreAwayVal"
              min="0"
              max="99"
              :disabled="locked"
              :aria-label="`Goles de ${awayTeam}`"
              class="w-12 h-12 md:w-14 md:h-14 bg-slate-950 border border-slate-800 text-center font-extrabold text-xl md:text-2xl rounded-lg md:rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
            >
        </div>

        <!-- Away Team -->
        <div class="flex flex-col items-center flex-1 text-center min-w-0">
          <img v-if="getFlagUrl(awayTeam)" class="w-12 h-9 md:w-16 md:h-12 object-cover rounded-md md:rounded-lg shadow-md mb-2 border border-slate-800" :src="getFlagUrl(awayTeam, 64, 48)" @error="$event.target.style.display = 'none'" :alt="`Bandera de ${awayTeam}`" width="64" height="48" loading="lazy">
          <span class="font-bold text-xs md:text-sm text-slate-200 truncate w-full px-1">{{ awayTeam }}</span>
        </div>
      </div>

      <!-- Winner Selector for Knockout stage -->
      <div v-else class="flex flex-col items-center py-2 md:py-4 space-y-3">
        <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">¿Quién clasifica a la siguiente ronda?</p>
        <div class="flex items-center justify-center gap-4 w-full">
          <!-- Home Team Card -->
          <button
            @click="selectWinner(homeTeam)"
            :disabled="locked || !isTeamsReady"
            class="flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 w-[45%] bg-slate-950/40 hover:bg-slate-800/40 border-slate-800/80"
            :class="[
              selectedWinner === homeTeam ? '!border-blue-500 bg-blue-950/20 text-blue-400 font-extrabold' : 'text-slate-300',
              locked || !isTeamsReady ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            ]"
          >
            <img v-if="getFlagUrl(homeTeam)" class="w-12 h-8 object-cover rounded shadow-md mb-2 border border-slate-800" :src="getFlagUrl(homeTeam, 64, 48)" @error="$event.target.style.display = 'none'" alt="">
            <span class="font-bold text-xs truncate w-full text-center" :title="homeTeam">{{ homeTeam || 'Por definir' }}</span>
          </button>

          <span class="text-slate-600 font-extrabold text-sm uppercase shrink-0">vs</span>

          <!-- Away Team Card -->
          <button
            @click="selectWinner(awayTeam)"
            :disabled="locked || !isTeamsReady"
            class="flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 w-[45%] bg-slate-950/40 hover:bg-slate-800/40 border-slate-800/80"
            :class="[
              selectedWinner === awayTeam ? '!border-blue-500 bg-blue-950/20 text-blue-400 font-extrabold' : 'text-slate-300',
              locked || !isTeamsReady ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            ]"
          >
            <img v-if="getFlagUrl(awayTeam)" class="w-12 h-8 object-cover rounded shadow-md mb-2 border border-slate-800" :src="getFlagUrl(awayTeam, 64, 48)" @error="$event.target.style.display = 'none'" alt="">
            <span class="font-bold text-xs truncate w-full text-center" :title="awayTeam">{{ awayTeam || 'Por definir' }}</span>
          </button>
        </div>
      </div>

      <div class="flex gap-2 md:gap-3 justify-end pt-2">
        <button
          v-if="!locked && (!isKnockout || isTeamsReady)"
          @click="clear"
          class="px-3.5 py-2 md:px-4 md:py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 font-semibold text-xs md:text-sm rounded-xl border border-red-900/50 transition cursor-pointer"
        >
          Borrar
        </button>
        <button
          @click="$emit('close')"
          class="px-3.5 py-2 md:px-4 md:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs md:text-sm rounded-xl border border-slate-700 transition cursor-pointer"
        >
          {{ locked || (isKnockout && !isTeamsReady) ? 'Cerrar' : 'Cancelar' }}
        </button>
        <button
          v-if="!locked && (!isKnockout || isTeamsReady)"
          @click="confirm"
          class="px-4 py-2 md:px-5 md:py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs md:text-sm rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { getFlagUrl } from '../utils/helpers.js'

const props = defineProps({
  show: Boolean,
  homeTeam: String,
  awayTeam: String,
  scoreHome: Number,
  scoreAway: Number,
  locked: Boolean,
  isKnockout: {
    type: Boolean,
    default: false
  },
  predictedWinner: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'save', 'clear'])

const scoreHomeVal = ref('')
const scoreAwayVal = ref('')
const selectedWinner = ref('')

const isTeamsReady = computed(() => {
  if (!props.homeTeam || !props.awayTeam) return false
  // Check if team names are actual placeholders
  const nameH = props.homeTeam
  const nameA = props.awayTeam
  if (nameH.includes('º') || nameA.includes('º')) return false
  if (nameH.startsWith('Ganador') || nameA.startsWith('Ganador')) return false
  if (nameH.startsWith('Perdedor') || nameA.startsWith('Perdedor')) return false
  return true
})

function selectWinner(team) {
  if (!props.locked && isTeamsReady.value) {
    selectedWinner.value = team
  }
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    scoreHomeVal.value = props.scoreHome !== null && props.scoreHome !== undefined ? props.scoreHome : ''
    scoreAwayVal.value = props.scoreAway !== null && props.scoreAway !== undefined ? props.scoreAway : ''
    selectedWinner.value = props.predictedWinner || ''
  }
})

function confirm() {
  if (props.isKnockout) {
    if (!selectedWinner.value) {
      alert('Por favor selecciona el equipo ganador para clasificar.')
      return
    }
    emit('save', selectedWinner.value)
  } else {
    if (scoreHomeVal.value === '' || scoreAwayVal.value === '') {
      alert('Por favor introduce puntuaciones para ambos equipos.')
      return
    }
    const home = parseInt(scoreHomeVal.value)
    const away = parseInt(scoreAwayVal.value)
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0 || home > 99 || away > 99) {
      alert('Las puntuaciones deben ser números enteros entre 0 y 99.')
      return
    }
    emit('save', home, away)
  }
}

function clear() {
  scoreHomeVal.value = ''
  scoreAwayVal.value = ''
  selectedWinner.value = ''
  emit('clear')
}
</script>
