<template>
  <div
    :id="cardId"
    class="bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-200 flex flex-col"
  >
    <!-- Card Header -->
    <div class="px-2.5 py-1 bg-slate-950/60 font-bold text-slate-400 flex justify-between items-center gap-2 border-b border-slate-800/50">
      <span class="font-bold text-[9px]" :class="roundKey === 'final' || roundKey === 'third' ? 'text-amber-400' : 'text-slate-300'">
        {{ matchId }}
      </span>
      <span v-if="labels" class="text-[9px] text-slate-400 font-medium">
        {{ labels.home }} <span class="text-slate-600">vs</span> {{ labels.away }}
      </span>
    </div>

    <!-- Home Slot -->
    <div
      class="flex items-center justify-between px-2.5 py-1.5 md:py-2 hover:bg-slate-800/40 transition-colors duration-150 group relative"
      :class="[getConfClass(matchData.home)]"
      @dragover.prevent
      @drop="onDrop('home', $event)"
    >
      <div v-if="matchData.home" class="flex items-center gap-1.5 md:gap-2" :class="!readOnly ? 'cursor-grab active:cursor-grabbing' : ''" :draggable="!readOnly" @dragstart="onDragStart(matchData.home, $event)">
        <div class="flex items-center gap-1.5 md:gap-2" @click="setWinner(matchData.home)">
          <img v-if="getFlagUrl(matchData.home)" class="w-4 h-2.5 md:w-4.5 md:h-3 object-cover rounded-sm border border-slate-800" :src="getFlagUrl(matchData.home)" @error="$event.target.style.display = 'none'" alt="" width="24" height="18" loading="lazy">
          <span
            class="font-bold text-[10px] md:text-[11px] truncate max-w-[90px] md:max-w-[110px]"
            :class="matchData.winner === matchData.home ? 'text-blue-400 font-extrabold' : 'text-slate-300'"
          >
            {{ matchData.home }}
          </span>
        </div>
      </div>
      <div v-else>
        <span class="text-[10px] md:text-[11px] text-slate-500 italic font-medium">
          {{ labels ? labels.home : 'Por definir...' }}
        </span>
      </div>

      <!-- Action Button / Checkmark -->
      <div v-if="matchData.home && !readOnly">
        <span v-if="matchData.winner === matchData.home" class="text-[9px] md:text-[10px] text-blue-500 font-bold bg-blue-950/40 border border-blue-900/40 rounded px-1 flex items-center gap-0.5">
          ✔️ <span class="hidden group-hover:inline cursor-pointer text-red-400 hover:text-red-300" @click.stop="setWinner(null)">deshacer</span>
        </span>
        <button
          v-else
          @click="setWinner(matchData.home)"
          class="opacity-0 group-hover:opacity-100 text-[9px] md:text-[10px] text-slate-400 hover:text-white px-1 py-0.5 bg-slate-800 rounded transition duration-150 cursor-pointer"
        >
          Ganador
        </button>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-slate-800/40"></div>

    <!-- Away Slot -->
    <div
      class="flex items-center justify-between px-2.5 py-1.5 md:py-2 hover:bg-slate-800/40 transition-colors duration-150 group relative"
      :class="[getConfClass(matchData.away)]"
      @dragover.prevent
      @drop="onDrop('away', $event)"
    >
      <div v-if="matchData.away" class="flex items-center gap-1.5 md:gap-2" :class="!readOnly ? 'cursor-grab active:cursor-grabbing' : ''" :draggable="!readOnly" @dragstart="onDragStart(matchData.away, $event)">
        <div class="flex items-center gap-1.5 md:gap-2" @click="setWinner(matchData.away)">
          <img v-if="getFlagUrl(matchData.away)" class="w-4 h-2.5 md:w-4.5 md:h-3 object-cover rounded-sm border border-slate-800" :src="getFlagUrl(matchData.away)" @error="$event.target.style.display = 'none'" alt="" width="24" height="18" loading="lazy">
          <span
            class="font-bold text-[10px] md:text-[11px] truncate max-w-[90px] md:max-w-[110px]"
            :class="matchData.winner === matchData.away ? 'text-blue-400 font-extrabold' : 'text-slate-300'"
          >
            {{ matchData.away }}
          </span>
        </div>
      </div>
      <div v-else>
        <span class="text-[10px] md:text-[11px] text-slate-500 italic font-medium">
          {{ labels ? labels.away : 'Por definir...' }}
        </span>
      </div>

      <!-- Action Button / Checkmark -->
      <div v-if="matchData.away && !readOnly">
        <span v-if="matchData.winner === matchData.away" class="text-[9px] md:text-[10px] text-blue-500 font-bold bg-blue-950/40 border border-blue-900/40 rounded px-1 flex items-center gap-0.5">
          ✔️ <span class="hidden group-hover:inline cursor-pointer text-red-400 hover:text-red-300" @click.stop="setWinner(null)">deshacer</span>
        </span>
        <button
          v-else
          @click="setWinner(matchData.away)"
          class="opacity-0 group-hover:opacity-100 text-[9px] md:text-[10px] text-slate-400 hover:text-white px-1 py-0.5 bg-slate-800 rounded transition duration-150 cursor-pointer"
        >
          Ganador
        </button>
      </div>
    </div>

    <!-- Footer Match Details -->
    <div v-if="schedule" class="px-2 py-1 md:px-2.5 md:py-1.5 bg-slate-950/50 border-t border-slate-800/50 flex items-center justify-between gap-1">
      <span class="flex items-center gap-1 text-[8px] md:text-[9px] text-slate-400 font-semibold">
        <span class="text-slate-600">📅</span>{{ schedule.date }}
      </span>
      <span class="flex items-center gap-1 overflow-hidden">
        <span v-if="schedule.stadium" class="text-[8px] text-slate-600 font-medium truncate">{{ schedule.stadium }}</span>
        <span v-if="schedule.city" class="text-[8px] text-slate-500 font-medium truncate">📍{{ schedule.city }}</span>
        <span class="text-[8px] md:text-[9px] font-extrabold text-indigo-400 bg-indigo-950/50 border border-indigo-900/40 rounded px-1 md:px-1.5 py-0.5 shrink-0">⏱ {{ schedule.time }}</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { R32_SLOT_LABELS, MATCH_SCHEDULE } from '../utils/tournamentLogic.js'
import { getFlagUrl, getConfClass } from '../utils/helpers.js'

const props = defineProps({
  roundKey: String,
  matchId: String,
  matchData: Object,
  readOnly: Boolean
})

const emit = defineEmits(['set-winner', 'drop-team'])

const cardId = computed(() => {
  if (props.roundKey === 'final' || props.roundKey === 'third') {
    return `match-card-${props.roundKey}-${props.roundKey}`
  }
  return `match-card-${props.roundKey}-${props.matchId}`
})

const labels = computed(() => {
  if (props.roundKey === 'r32') {
    return R32_SLOT_LABELS[props.matchId] || null
  }
  return null
})

const schedule = computed(() => {
  if (props.roundKey === 'final') return MATCH_SCHEDULE.final
  if (props.roundKey === 'third') return MATCH_SCHEDULE.third
  return (MATCH_SCHEDULE[props.roundKey] && MATCH_SCHEDULE[props.roundKey][props.matchId]) || null
})



function setWinner(team) {
  if (props.readOnly) return
  if (!team) {
    emit('set-winner', props.roundKey, props.matchId, null)
  } else {
    emit('set-winner', props.roundKey, props.matchId, team)
  }
}

function onDragStart(team, e) {
  if (props.readOnly) return
  e.dataTransfer.setData('text/plain', team)
}

function onDrop(position, e) {
  if (props.readOnly) return
  const team = e.dataTransfer.getData('text/plain')
  if (!team) return
  emit('drop-team', props.roundKey, props.matchId, position, team)
}
</script>
