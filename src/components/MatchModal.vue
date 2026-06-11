<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center"
  >
    <div class="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl w-full max-w-[90%] sm:max-w-md mx-4 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="font-bold text-base md:text-lg text-slate-100">
          {{ locked ? 'Detalles del Partido' : 'Introducir Marcador' }}
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
      </div>

      <!-- Lock Alert -->
      <div v-if="locked" class="p-2.5 bg-amber-950/30 border border-amber-900/40 rounded-xl text-center text-amber-400 text-xs font-semibold animate-pulse">
        🔒 Partido bloqueado. El juego ya comenzó o finalizó.
      </div>

      <div class="flex items-center justify-between py-4 md:py-6 gap-2 md:gap-4">
        <!-- Home Team -->
        <div class="flex flex-col items-center flex-1 text-center min-w-0">
          <img class="w-12 h-9 md:w-16 md:h-12 object-cover rounded-md md:rounded-lg shadow-md mb-2 border border-slate-800" :src="getFlagUrl(homeTeam)" alt="">
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
            class="w-12 h-12 md:w-14 md:h-14 bg-slate-950 border border-slate-800 text-center font-extrabold text-xl md:text-2xl rounded-lg md:rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
          >
          <span class="text-slate-500 text-lg md:text-xl font-bold">:</span>
          <input
            type="number"
            v-model="scoreAwayVal"
            min="0"
            max="99"
            :disabled="locked"
            class="w-12 h-12 md:w-14 md:h-14 bg-slate-950 border border-slate-800 text-center font-extrabold text-xl md:text-2xl rounded-lg md:rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
          >
        </div>

        <!-- Away Team -->
        <div class="flex flex-col items-center flex-1 text-center min-w-0">
          <img class="w-12 h-9 md:w-16 md:h-12 object-cover rounded-md md:rounded-lg shadow-md mb-2 border border-slate-800" :src="getFlagUrl(awayTeam)" alt="">
          <span class="font-bold text-xs md:text-sm text-slate-200 truncate w-full px-1">{{ awayTeam }}</span>
        </div>
      </div>

      <div class="flex gap-2 md:gap-3 justify-end pt-2">
        <button
          v-if="!locked"
          @click="clear"
          class="px-3.5 py-2 md:px-4 md:py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 font-semibold text-xs md:text-sm rounded-xl border border-red-900/50 transition"
        >
          Borrar
        </button>
        <button
          @click="$emit('close')"
          class="px-3.5 py-2 md:px-4 md:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs md:text-sm rounded-xl border border-slate-700 transition"
        >
          {{ locked ? 'Cerrar' : 'Cancelar' }}
        </button>
        <button
          v-if="!locked"
          @click="confirm"
          class="px-4 py-2 md:px-5 md:py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs md:text-sm rounded-xl shadow-lg shadow-blue-500/20 transition"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { TEAMS_INFO } from '../utils/tournamentLogic.js'

const props = defineProps({
  show: Boolean,
  homeTeam: String,
  awayTeam: String,
  scoreHome: Number,
  scoreAway: Number,
  locked: Boolean
})

const emit = defineEmits(['close', 'save', 'clear'])

const scoreHomeVal = ref('')
const scoreAwayVal = ref('')

watch(() => props.show, (newShow) => {
  if (newShow) {
    scoreHomeVal.value = props.scoreHome !== null && props.scoreHome !== undefined ? props.scoreHome : ''
    scoreAwayVal.value = props.scoreAway !== null && props.scoreAway !== undefined ? props.scoreAway : ''
  }
})

function getFlagUrl(team) {
  const info = TEAMS_INFO[team]
  if (!info) return ''
  return `https://flagcdn.com/64x48/${info.flag}.png`
}

function confirm() {
  if (scoreHomeVal.value === '' || scoreAwayVal.value === '') {
    alert('Por favor introduce puntuaciones para ambos equipos.')
    return
  }
  emit('save', parseInt(scoreHomeVal.value), parseInt(scoreAwayVal.value))
}

function clear() {
  scoreHomeVal.value = ''
  scoreAwayVal.value = ''
  emit('clear')
}
</script>
