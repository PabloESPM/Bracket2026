<template>
  <div class="space-y-6">
    <!-- Header Controls Panel -->
    <div class="bg-slate-900 border border-slate-800/80 p-4 md:p-6 rounded-2xl shadow-xl space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg md:text-xl font-extrabold flex items-center gap-2">
            <span>📅</span> Calendario del Torneo
          </h2>
          <p class="text-xs text-slate-400">
            Explora las fechas de los partidos, consulta la información de los encuentros y realiza tus predicciones directamente.
          </p>
        </div>

        <!-- Toolbar: Mode selectors and predictions toggle -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Prediction Mode Toggle -->
          <div v-if="isLoggedIn" class="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              @click="dataSource = 'bracket'"
              class="px-3 py-1.5 text-xs font-bold rounded-lg transition duration-200 cursor-pointer"
              :class="dataSource === 'bracket' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
              title="Muestra el calendario con tus clasificados y predicciones de eliminatorias"
            >
              🔮 Mi Bracket
            </button>
            <button
              @click="dataSource = 'official'"
              class="px-3 py-1.5 text-xs font-bold rounded-lg transition duration-200 cursor-pointer"
              :class="dataSource === 'official' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
              title="Muestra los partidos oficiales del torneo y clasificados oficiales"
            >
              🏆 Oficial
            </button>
          </div>

          <!-- View Mode Toggle -->
          <div class="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              @click="viewMode = 'month'"
              class="px-3 py-1.5 text-xs font-bold rounded-lg transition duration-200 cursor-pointer"
              :class="viewMode === 'month' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
            >
              Mensual
            </button>
            <button
              @click="viewMode = 'year'"
              class="px-3 py-1.5 text-xs font-bold rounded-lg transition duration-200 cursor-pointer"
              :class="viewMode === 'year' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
            >
              Anual
            </button>
          </div>

          <!-- Go to Today button -->
          <button
            @click="goToToday"
            class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            📍 Ir a Hoy
          </button>
        </div>
      </div>

      <!-- Filters & Search row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/40">
        <!-- Stage Filter -->
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fase del Torneo</label>
          <select
            v-model="stageFilter"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Todas las fases</option>
            <option value="group">Fase de Grupos</option>
            <option value="r32">Dieciseisavos (R32)</option>
            <option value="r16">Octavos de Final</option>
            <option value="qf">Cuartos de Final</option>
            <option value="sf">Semifinales</option>
            <option value="finals">Finales (Final & 3er puesto)</option>
          </select>
        </div>

        <!-- Country Search -->
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Buscar Selección</label>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Ej: España, México..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
            <span
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer text-xs font-bold"
            >
              ✕
            </span>
          </div>
        </div>

        <!-- Key Dates Shortcuts -->
        <div class="space-y-1 sm:col-span-2 md:col-span-1">
          <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fechas Clave del Torneo</label>
          <div class="grid grid-cols-3 gap-1.5">
            <button
              @click="jumpToDate(2026, 5, '2026-06-11')"
              class="py-2 text-[10px] font-bold rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              🚀 Inauguración
            </button>
            <button
              @click="jumpToDate(2026, 5, '2026-06-29')"
              class="py-2 text-[10px] font-bold rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              ⚔️ R32 (Elimin.)
            </button>
            <button
              @click="jumpToDate(2026, 6, '2026-07-19')"
              class="py-2 text-[10px] font-bold rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              🏆 Gran Final
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar View Container -->
    <div class="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
      <!-- 1. MONTH VIEW -->
      <div v-if="viewMode === 'month'" class="p-4 md:p-6 space-y-4">
        <!-- Month Selector Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button
              @click="prevMonth"
              class="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 hover:text-white transition cursor-pointer text-xs"
            >
              ◀
            </button>
            <h3 class="text-base md:text-lg font-extrabold text-slate-200 min-w-[140px] text-center capitalize">
              {{ MONTHS[currentMonth] }} {{ currentYear }}
            </h3>
            <button
              @click="nextMonth"
              class="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 hover:text-white transition cursor-pointer text-xs"
            >
              ▶
            </button>
          </div>

          <!-- Select Month/Year dropdown fallback -->
          <div class="flex items-center gap-2">
            <select
              v-model="currentMonth"
              class="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option v-for="(m, idx) in MONTHS" :key="idx" :value="idx">{{ m }}</option>
            </select>
            <select
              v-model="currentYear"
              class="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option v-for="y in [2025, 2026, 2027, 2028]" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>

        <!-- Monthly Grid -->
        <div class="grid grid-cols-7 gap-1 md:gap-2 text-center">
          <!-- Weekdays Header -->
          <div
            v-for="dayName in WEEKDAYS"
            :key="dayName"
            class="text-[10px] md:text-xs font-extrabold text-slate-500 uppercase tracking-widest py-2"
          >
            {{ dayName }}
          </div>

          <!-- Day Cells -->
          <div
            v-for="(cell, cellIdx) in calendarDays"
            :key="cellIdx"
            @click="selectDayAndScroll(cell.dateString)"
            class="aspect-square p-1 md:p-2 border rounded-xl flex flex-col justify-between relative transition duration-150 cursor-pointer group select-none min-h-[55px] md:min-h-[75px] calendar-cell"
            :class="[
              cell.isCurrentMonth
                ? 'bg-slate-950/20 border-slate-800/50 hover:bg-slate-800/40 hover:border-slate-700'
                : 'bg-slate-950/5 border-slate-900/30 text-slate-600 hover:bg-slate-800/10 hover:border-slate-800',
              selectedDateStr === cell.dateString
                ? '!bg-blue-600/20 !border-blue-500 shadow-lg shadow-blue-500/10'
                : '',
              isToday(cell.dateString) ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900' : ''
            ]"
          >
            <!-- Day Number -->
            <span
              class="text-xs md:text-sm font-bold block text-left calendar-cell-number"
              :class="[
                selectedDateStr === cell.dateString ? 'text-blue-400' : 'text-slate-300',
                !cell.isCurrentMonth ? '!text-slate-600' : '',
                isToday(cell.dateString) ? 'text-indigo-400' : ''
              ]"
            >
              {{ cell.day }}
            </span>

            <!-- Indicators of Matches in cell -->
            <div class="w-full flex flex-col items-center justify-end mt-auto min-h-[36px] calendar-cell-indicators">
              <!-- Tags with flag emojis of matchups (Desktop only) -->
              <div 
                v-if="filteredMatchesByDate[cell.dateString]?.length > 0" 
                class="hidden md:flex flex-wrap gap-1 justify-center max-h-[44px] overflow-y-auto w-full pb-0.5 scrollbar-none"
              >
                <span 
                  v-for="m in filteredMatchesByDate[cell.dateString]" 
                  :key="m.id"
                  @click.stop="selectMatchAndScroll(cell.dateString, m.id)"
                  class="inline-flex items-center justify-center px-1 py-0.5 rounded bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700/80 text-[10px] md:text-[11px] font-black leading-none cursor-pointer transition select-none shadow-sm gap-0.5 shrink-0"
                  :title="`${m.home || 'Por definir'} vs ${m.away || 'Por definir'} (${m.id})`"
                >
                  <span class="text-xs md:text-sm leading-none flex items-center">{{ getTeamFlagEmoji(m.home) }}</span>
                  <span class="text-[8px] md:text-[9px] text-slate-500 font-bold leading-none align-middle px-0.5">vs</span>
                  <span class="text-xs md:text-sm leading-none flex items-center">{{ getTeamFlagEmoji(m.away) }}</span>
                </span>
              </div>

              <!-- Match Count Badge (Mobile only) -->
              <div
                v-if="filteredMatchesByDate[cell.dateString]?.length > 0"
                class="md:hidden flex items-center justify-center w-full pb-1"
              >
                <span
                  class="inline-flex items-center justify-center font-extrabold text-[9px] w-5 h-5 rounded-full shadow-sm transition-all duration-200"
                  :class="[
                    selectedDateStr === cell.dateString
                      ? 'bg-blue-600 text-white shadow-blue-500/20'
                      : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                  ]"
                >
                  {{ filteredMatchesByDate[cell.dateString].length }}
                </span>
              </div>
              
              <!-- Tiny indicator for matching countries when search query is active -->
              <div
                v-else-if="matchesByDate[cell.dateString]?.length > 0 && searchQuery"
                class="w-1.5 h-1.5 rounded-full bg-slate-700 mb-1"
                title="Hay partidos pero no coinciden con los filtros"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. YEAR VIEW -->
      <div v-else class="p-4 md:p-6 space-y-6">
        <!-- Year Selector Header -->
        <div class="flex items-center justify-center gap-4">
          <button
            @click="currentYear--"
            class="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 hover:text-white transition cursor-pointer text-xs"
          >
            ◀
          </button>
          <h3 class="text-lg md:text-xl font-extrabold text-slate-200">
            Resumen del Año {{ currentYear }}
          </h3>
          <button
            @click="currentYear++"
            class="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 hover:text-white transition cursor-pointer text-xs"
          >
            ▶
          </button>
        </div>

        <!-- 12 Months Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="(mName, mIdx) in MONTHS"
            :key="mIdx"
            class="bg-slate-950/20 border border-slate-800/60 p-3 rounded-xl flex flex-col space-y-2"
          >
            <!-- Mini Month Title -->
            <button
              @click="selectMonthAndSwitchView(mIdx)"
              class="text-xs font-black text-slate-300 hover:text-blue-400 text-left capitalize hover:underline cursor-pointer"
            >
              {{ mName }}
            </button>

            <!-- Mini Weekday Labels -->
            <div class="grid grid-cols-7 gap-0.5 text-center text-[7px] font-bold text-slate-600">
              <span v-for="d in ['L', 'M', 'X', 'J', 'V', 'S', 'D']" :key="d">{{ d }}</span>
            </div>

            <!-- Mini Days Grid -->
            <div class="grid grid-cols-7 gap-0.5 text-center">
              <div
                v-for="(dayCell, dayCellIdx) in getMiniMonthDays(currentYear, mIdx)"
                :key="dayCellIdx"
                class="aspect-square flex items-center justify-center text-[9px] rounded-sm relative"
                :class="[
                  dayCell.day ? 'text-slate-400 hover:bg-slate-800 cursor-pointer' : '',
                  dayCell.dateString === selectedDateStr ? 'bg-blue-600/30 font-bold text-blue-400' : ''
                ]"
                @click="dayCell.day && selectDayAndSwitchView(mIdx, dayCell.day)"
              >
                <span>{{ dayCell.day }}</span>
                <!-- Mini glow dot for matches -->
                <span
                  v-if="dayCell.day && filteredMatchesByDate[dayCell.dateString]?.length > 0"
                  class="absolute bottom-0 w-1 h-1 rounded-full bg-blue-500 animate-pulse"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Day Matches Detail Section -->
    <div 
      id="selected-day-detail-section"
      class="bg-slate-900 border rounded-2xl shadow-xl overflow-hidden p-4 md:p-6 space-y-4 transition-all duration-500 scroll-mt-24 md:scroll-mt-20"
      :class="[
        activeHighlightSection 
          ? 'ring-2 md:ring-4 ring-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.5)] border-indigo-400 bg-indigo-950/5' 
          : 'border-slate-800/80'
      ]"
    >
      <div class="flex items-center justify-between border-b border-slate-800 pb-3 flex-col sm:flex-row gap-2">
        <h3 class="font-extrabold text-sm md:text-base text-slate-200 flex items-center gap-2">
          <span>⚽</span> Partidos el {{ formatDateLong(selectedDateStr) }}
          <span
            v-if="selectedDayMatchesFiltered.length > 0"
            class="px-2 py-0.5 bg-blue-950/80 border border-blue-900 text-blue-400 text-[10px] rounded-full font-bold uppercase tracking-wider"
          >
            {{ selectedDayMatchesFiltered.length }} {{ selectedDayMatchesFiltered.length === 1 ? 'Encuentro' : 'Encuentros' }}
          </span>
        </h3>

        <!-- Source Legend -->
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/40 border border-slate-800/50 rounded-lg px-2.5 py-1">
          Modo: {{ dataSource === 'bracket' ? '🔮 Mi Predicción' : '🏆 Torneo Oficial' }}
        </span>
      </div>

      <!-- If no matches -->
      <div
        v-if="selectedDayMatchesFiltered.length === 0"
        class="py-12 text-center text-slate-500 text-xs font-semibold space-y-2 border border-dashed border-slate-800 rounded-xl"
      >
        <span class="text-3xl block">📭</span>
        <p>No hay partidos programados para este día con los filtros seleccionados.</p>
        <p class="text-[10px] text-slate-600">Haz clic en los días marcados en azul en el calendario para explorar los encuentros.</p>
      </div>

      <!-- Matches Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="match in selectedDayMatchesFiltered"
          :key="match.id"
          :id="`match-card-detail-${match.id}`"
          @click="editMatch(match)"
          class="flex flex-col bg-slate-950/40 hover:bg-slate-800/40 border rounded-2xl p-4 cursor-pointer space-y-3 relative group transition-all duration-500"
          :class="[
            getConfClass(match.home), 
            match.locked && !match.played && !match.isLive ? 'border-amber-900/40' : '',
            activeHighlightMatchId === match.id 
              ? 'ring-2 md:ring-4 ring-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.6)] border-blue-400 scale-[1.01] md:scale-[1.02] bg-blue-950/10' 
              : 'border-slate-800 hover:border-slate-700/80'
          ]"
        >
          <!-- Match Card Header -->
          <div class="flex items-center justify-between text-[10px] text-slate-400 font-bold border-b border-slate-800/50 pb-2">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800/80 text-[9px] uppercase tracking-widest text-slate-300">
                {{ match.id }}
              </span>
              <span class="text-slate-500 uppercase tracking-wider">
                {{ getStageLabel(match.stage, match.id) }}
              </span>
            </div>

            <!-- Match status / points -->
            <div class="flex items-center gap-1.5">
              <!-- Points badge -->
              <span
                v-if="match.points_earned !== null && match.points_earned !== undefined"
                class="px-1.5 py-0.5 text-[8px] md:text-[9px] font-black rounded"
                :class="match.points_earned > 0 ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400' : 'bg-red-950/60 border border-red-900 text-red-400'"
              >
                +{{ match.points_earned }} PTS
              </span>
              
              <!-- Lock / Live indicator -->
              <span
                class="px-1.5 py-0.5 rounded text-[8px] font-black flex items-center gap-1"
                :class="[
                  match.isLive
                    ? 'bg-red-950/60 border border-red-800/60 text-red-400 animate-pulse'
                    : match.isFinished
                      ? 'bg-slate-900/60 border border-slate-800/60 text-slate-400'
                      : 'bg-indigo-950/60 border border-indigo-900/60 text-indigo-400'
                ]"
              >
                <span v-if="match.isLive" class="w-1 h-1 rounded-full bg-red-400 animate-ping"></span>
                {{ match.isLive ? '🔴 EN VIVO' : match.isFinished ? '🏁 FINAL' : '⏱ ' + formatTimeStr(match.start_time) }}
              </span>
            </div>
          </div>

          <!-- Teams and Scores row -->
          <div class="flex items-center justify-between py-2 gap-4">
            <!-- Home Team info -->
            <div class="flex items-center gap-3 w-[40%] justify-end text-right min-w-0">
              <span 
                class="font-extrabold text-xs md:text-sm text-slate-200 truncate" 
                :class="{ 'hidden md:inline': isRealTeam(match.home) }"
                :title="match.home"
              >
                {{ match.home || 'Por definir' }}
              </span>
              <img
                v-if="getFlagUrl(match.home)"
                :key="match.home"
                class="w-6 h-4 md:w-8 md:h-5 object-cover rounded shadow-sm border border-slate-800 shrink-0"
                :src="getFlagUrl(match.home, 32, 24)"
                @error="$event.target.style.display = 'none'"
                @load="$event.target.style.display = ''"
                alt=""
                width="32"
                height="24"
                loading="lazy"
              >
            </div>

            <!-- Match Score display -->
            <div class="flex flex-col items-center justify-center shrink-0 w-[20%]">
              <div
                class="px-3 py-1.5 rounded-xl border font-black text-xs md:text-sm min-w-[50px] text-center shadow"
                :class="[
                  match.isLive
                    ? 'bg-red-950 border-red-800 text-red-400 animate-pulse'
                    : match.played
                      ? 'bg-slate-900 border-slate-800 text-indigo-400'
                      : 'bg-slate-900/50 border-slate-900 text-slate-500'
                ]"
              >
                <!-- Score or 'vs' -->
                <span v-if="(match.played || match.isLive || match.isFinished) && match.scoreHome !== null && match.scoreAway !== null">
                  {{ match.scoreHome }} - {{ match.scoreAway }}
                </span>
                <span v-else-if="match.stage !== 'group' && match.winner">
                  🏆
                </span>
                <span v-else class="font-bold text-slate-500 uppercase tracking-widest text-[9px] md:text-[10px]">
                  vs
                </span>
              </div>
              
              <!-- Indicator of predicted winner for knockout matches -->
              <span
                v-if="match.stage !== 'group' && match.winner"
                class="text-[7px] md:text-[8px] font-black text-indigo-400 mt-1 uppercase tracking-wide text-center"
              >
                Clasifica: {{ match.winner }}
              </span>
            </div>

            <!-- Away Team info -->
            <div class="flex items-center gap-3 w-[40%] justify-start text-left min-w-0">
              <img
                v-if="getFlagUrl(match.away)"
                :key="match.away"
                class="w-6 h-4 md:w-8 md:h-5 object-cover rounded shadow-sm border border-slate-800 shrink-0"
                :src="getFlagUrl(match.away, 32, 24)"
                @error="$event.target.style.display = 'none'"
                @load="$event.target.style.display = ''"
                alt=""
                width="32"
                height="24"
                loading="lazy"
              >
              <span 
                class="font-extrabold text-xs md:text-sm text-slate-200 truncate" 
                :class="{ 'hidden md:inline': isRealTeam(match.away) }"
                :title="match.away"
              >
                {{ match.away || 'Por definir' }}
              </span>
            </div>
          </div>

          <!-- Match Card Footer Details -->
          <div class="flex items-center justify-between text-[8px] md:text-[9px] text-slate-500 font-bold px-1.5 border-t border-slate-800/30 pt-2">
            <span class="flex items-center gap-1">
              <span>📅</span> {{ formatDateShort(match.start_time) }}
            </span>
            <span v-if="match.stadium || match.city" class="truncate max-w-[170px] flex items-center gap-1" :title="`${match.stadium}, ${match.city}`">
              <span>📍</span> {{ match.stadium || match.city }} <span v-if="match.stadium && match.city" class="text-slate-700">|</span> {{ match.city }}
            </span>
            
            <!-- Quick prediction status action tag -->
            <span
              v-if="!readOnly"
              class="text-[8px] font-bold uppercase transition opacity-60 group-hover:opacity-100"
              :class="[
                match.locked
                  ? 'text-amber-500'
                  : match.played
                    ? 'text-indigo-400 hover:underline'
                    : 'text-blue-400 hover:underline'
              ]"
            >
              {{ match.locked ? '🔒 Bloqueado' : match.played ? '📝 Editar' : '➕ Pronosticar' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { getFlagUrl, getConfClass, formatTimeStr } from '../utils/helpers.js'
import { GROUP_STAGE_SCHEDULE, MATCH_SCHEDULE, R32_SLOT_LABELS, TEAM_TRANSLATIONS, TEAMS_INFO } from '../utils/tournamentLogic.js'

const props = defineProps({
  officialMatches: {
    type: Array,
    required: true
  },
  userPredictions: {
    type: Array,
    required: true
  },
  computedGroups: {
    type: Object,
    required: true
  },
  computedBracket: {
    type: Object,
    required: true
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit-match'])

// Highlight and Scroll States
const activeHighlightMatchId = ref(null)
const activeHighlightSection = ref(false)
let highlightTimeout = null

function clearHighlightTimeout() {
  if (highlightTimeout) {
    clearTimeout(highlightTimeout)
    highlightTimeout = null
  }
}

// Calendar State
const currentYear = ref(2026)
const currentMonth = ref(5) // June (0-indexed)
const selectedDateStr = ref('2026-06-11') // Start date of tournament A1 match
const viewMode = ref('month') // 'month' or 'year'
const dataSource = ref('bracket') // 'bracket' (predictions) or 'official' (official)
const stageFilter = ref('all')
const searchQuery = ref('')

// Auto-set data source to official if not logged in
watch(() => props.isLoggedIn, (newVal) => {
  if (!newVal) {
    dataSource.value = 'official'
  }
}, { immediate: true })

// Calendar Constants
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Determine if a given date string corresponds to today's date
function isToday(dateStr) {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}` === dateStr
}

// Get helper dates and count days
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year, month) => {
  let day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Shift to make Monday = 0
}

// Format local date string from iso
const getMatchLocalDateStr = (isoStr) => {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Extract round key from matchId
const getRoundKey = (matchId) => {
  if (matchId.startsWith('P')) return 'r32'
  if (matchId.startsWith('O')) return 'r16'
  if (matchId.startsWith('Q')) return 'qf'
  if (matchId.startsWith('S')) return 'sf'
  if (matchId === 'final') return 'final'
  if (matchId === 'third') return 'third'
  return ''
}

// Fallback label placeholders for bracket matchups
const getRoundPlaceholder = (matchId, side) => {
  if (matchId.startsWith('O')) {
    const num = parseInt(matchId.substring(1))
    const prev1 = `P${num * 2 - 1}`
    const prev2 = `P${num * 2}`
    return side === 'home' ? `Ganador ${prev1}` : `Ganador ${prev2}`
  }
  if (matchId.startsWith('Q')) {
    const num = parseInt(matchId.substring(1))
    const prev1 = `O${num * 2 - 1}`
    const prev2 = `O${num * 2}`
    return side === 'home' ? `Ganador ${prev1}` : `Ganador ${prev2}`
  }
  if (matchId.startsWith('S')) {
    const num = parseInt(matchId.substring(1))
    const prev1 = `Q${num * 2 - 1}`
    const prev2 = `Q${num * 2}`
    return side === 'home' ? `Ganador ${prev1}` : `Ganador ${prev2}`
  }
  if (matchId === 'final') {
    return side === 'home' ? 'Ganador S1' : 'Ganador S2'
  }
  if (matchId === 'third') {
    return side === 'home' ? 'Perdedor S1' : 'Perdedor S2'
  }
  return 'Por definir'
}

// Resolve static stadium and city if missing
const getCityOrStadium = (matchId, type) => {
  if (matchId.length === 2 && matchId.charAt(0) >= 'A' && matchId.charAt(0) <= 'L') {
    const groupKey = matchId.charAt(0)
    const idx = parseInt(matchId.charAt(1)) - 1
    const groupSched = GROUP_STAGE_SCHEDULE[groupKey]
    if (groupSched && groupSched[idx]) {
      return groupSched[idx][type] || ''
    }
  } else {
    let rKey = getRoundKey(matchId)
    if (rKey === 'final') return MATCH_SCHEDULE.final[type] || ''
    if (rKey === 'third') return MATCH_SCHEDULE.third[type] || ''
    const sched = MATCH_SCHEDULE[rKey]?.[matchId]
    if (sched) {
      return sched[type] || ''
    }
  }
  return ''
}

// Generate Month Days array for the month grid
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const days = []

  // Prev month padding
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)
  for (let i = firstDay - 1; i >= 0; i--) {
    const dNum = daysInPrevMonth - i
    days.push({
      day: dNum,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      dateString: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`
    })
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month,
      year,
      isCurrentMonth: true,
      dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    })
  }

  // Next month padding
  const totalSlots = 42
  const remaining = totalSlots - days.length
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      dateString: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    })
  }

  return days
})

// Generate mini-calendar days for yearly overview
function getMiniMonthDays(year, month) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const days = []

  // Pre padding
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    })
  }

  return days
}

// Flat array of formatted matches based on selected data source (Oficial / Bracket)
const allMatchesFormatted = computed(() => {
  if (!props.officialMatches) return []

  const list = []

  props.officialMatches.forEach(om => {
    const isGroup = om.stage === 'group' || !om.stage || (om.id.length === 2 && om.id.charAt(0) >= 'A' && om.id.charAt(0) <= 'L')

    let homeTeam = om.home_team
    let awayTeam = om.away_team
    let scoreHome = om.home_score
    let scoreAway = om.away_score
    let winner = om.winner
    let isPlayed = om.status === 'finished'
    let isLive = om.status === 'live'

    // Predictions lookup
    const pred = props.userPredictions?.find(p => p.match_id === om.id)

    if (dataSource.value === 'bracket') {
      if (isGroup) {
        if (om.status !== 'finished' && om.status !== 'live') {
          scoreHome = pred ? pred.home_predicted_score : null
          scoreAway = pred ? pred.away_predicted_score : null
          isPlayed = pred !== undefined
        }
      } else {
        // Knockout: pull dynamically resolved matchup from computedBracket
        const rKey = getRoundKey(om.id)
        const bMatch = props.computedBracket?.[rKey]?.[om.id]
        if (bMatch) {
          homeTeam = bMatch.home
          awayTeam = bMatch.away
          winner = bMatch.winner
          isPlayed = bMatch.winner !== null
        }
      }
    } else {
      // Official mode fallback to slot label if null
      if (!homeTeam || !awayTeam) {
        if (om.id.startsWith('P')) {
          const slot = R32_SLOT_LABELS[om.id]
          if (slot) {
            homeTeam = homeTeam || slot.home
            awayTeam = awayTeam || slot.away
          }
        } else {
          homeTeam = homeTeam || getRoundPlaceholder(om.id, 'home')
          awayTeam = awayTeam || getRoundPlaceholder(om.id, 'away')
        }
      }
    }

    const isLocked = new Date().getTime() >= new Date(om.start_time).getTime() - 10 * 60 * 1000 || om.status !== 'scheduled'

    list.push({
      id: om.id,
      home: homeTeam,
      away: awayTeam,
      scoreHome,
      scoreAway,
      winner,
      played: isPlayed,
      isLive,
      isFinished: om.status === 'finished',
      locked: isLocked,
      start_time: om.start_time,
      stage: isGroup ? 'group' : 'knockout',
      roundKey: getRoundKey(om.id),
      city: om.city || getCityOrStadium(om.id, 'city'),
      stadium: om.stadium || getCityOrStadium(om.id, 'stadium'),
      points_earned: pred?.points_earned !== undefined ? pred.points_earned : null
    })
  })

  return list
})

// Grouped matches reactive map
const matchesByDate = computed(() => {
  const map = {}
  allMatchesFormatted.value.forEach(m => {
    if (!m.start_time) return
    const dateStr = getMatchLocalDateStr(m.start_time)
    if (!map[dateStr]) map[dateStr] = []
    map[dateStr].push(m)
  })
  return map
})

// Filtered matches map for rendering indicators
const filteredMatchesByDate = computed(() => {
  const map = {}

  allMatchesFormatted.value.forEach(m => {
    if (!m.start_time) return

    // Stage filtering
    if (stageFilter.value !== 'all') {
      if (stageFilter.value === 'group' && m.stage !== 'group') return
      if (stageFilter.value === 'r32' && m.roundKey !== 'r32') return
      if (stageFilter.value === 'r16' && m.roundKey !== 'r16') return
      if (stageFilter.value === 'qf' && m.roundKey !== 'qf') return
      if (stageFilter.value === 'sf' && m.roundKey !== 'sf') return
      if (stageFilter.value === 'finals' && m.roundKey !== 'final' && m.roundKey !== 'third') return
    }

    // Country search filter
    if (searchQuery.value.trim() !== '') {
      const q = searchQuery.value.toLowerCase().trim()
      const homeMatch = m.home && m.home.toLowerCase().includes(q)
      const awayMatch = m.away && m.away.toLowerCase().includes(q)
      if (!homeMatch && !awayMatch) return
    }

    const dateStr = getMatchLocalDateStr(m.start_time)
    if (!map[dateStr]) map[dateStr] = []
    map[dateStr].push(m)
  })

  return map
})

// Selected Date matches array listing
const selectedDayMatchesFiltered = computed(() => {
  return filteredMatchesByDate.value[selectedDateStr.value] || []
})

// Convert team name to regional flag emoji
function getTeamFlagEmoji(teamName) {
  if (!teamName) return '🏳️'
  const cleaned = teamName.trim()
  const translated = TEAM_TRANSLATIONS[cleaned] || cleaned
  const info = TEAMS_INFO[translated]
  if (!info) return '🏳️'
  const flagCode = info.flag
  if (flagCode === 'gb-sct') return '🏴󠁧󠁢󠁳󠁣󠁴󠁿'
  if (flagCode === 'gb-eng') return '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
  if (!flagCode || flagCode.length !== 2) return '🏳️'
  
  const codePoints = flagCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Select date handlers
function selectDate(dateStr) {
  selectedDateStr.value = dateStr
}

// Day Cell click: Scroll to details container and highlight it
async function selectDayAndScroll(dateStr) {
  selectedDateStr.value = dateStr
  
  clearHighlightTimeout()
  activeHighlightMatchId.value = null
  activeHighlightSection.value = true
  
  highlightTimeout = setTimeout(() => {
    activeHighlightSection.value = false
  }, 2500)
  
  await nextTick()
  const element = document.getElementById('selected-day-detail-section')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Match Tag click: Scroll to specific match card and highlight it
async function selectMatchAndScroll(dateStr, matchId) {
  selectedDateStr.value = dateStr
  
  clearHighlightTimeout()
  activeHighlightSection.value = false
  activeHighlightMatchId.value = matchId
  
  highlightTimeout = setTimeout(() => {
    activeHighlightMatchId.value = null
  }, 2500)
  
  await nextTick()
  const element = document.getElementById(`match-card-detail-${matchId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function selectMonthAndSwitchView(monthIdx) {
  currentMonth.value = monthIdx
  viewMode.value = 'month'
}

function selectDayAndSwitchView(monthIdx, day) {
  currentMonth.value = monthIdx
  viewMode.value = 'month'
  const dateStr = `${currentYear.value}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  selectDayAndScroll(dateStr)
}

// Quick Jump dates
function jumpToDate(year, month, dateStr) {
  currentYear.value = year
  currentMonth.value = month
  selectedDateStr.value = dateStr
  viewMode.value = 'month'
}

// Go to current system day
function goToToday() {
  const today = new Date()
  let targetDate = today
  
  const startTournament = new Date('2026-06-11T00:00:00')
  const endTournament = new Date('2026-07-19T23:59:59')
  
  if (today < startTournament) {
    targetDate = startTournament
  } else if (today > endTournament) {
    targetDate = endTournament
  }
  
  const y = targetDate.getFullYear()
  const m = targetDate.getMonth()
  
  currentYear.value = y
  currentMonth.value = m
  viewMode.value = 'month'
  
  const dStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`
  selectDayAndScroll(dStr)
}

// Month navigation increment/decrement
function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// Label display calculations
function getStageLabel(stage, matchId) {
  if (stage === 'group') {
    return `Grupo ${matchId.charAt(0)}`
  }
  if (matchId.startsWith('P')) return '1/16 Final'
  if (matchId.startsWith('O')) return 'Octavos de Final'
  if (matchId.startsWith('Q')) return 'Cuartos de Final'
  if (matchId.startsWith('S')) return 'Semifinal'
  if (matchId === 'final') return 'Gran Final'
  if (matchId === 'third') return '3er Puesto'
  return stage
}

// Date formatter helpers
function formatDateShort(isoStr) {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

function formatDateLong(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  const date = new Date(parts[0], parts[1] - 1, parts[2])
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// Emit edit-match trigger back to parent
function editMatch(match) {
  if (props.readOnly) return
  emit('edit-match', match)
}

function isRealTeam(teamName) {
  if (!teamName) return false
  const cleaned = teamName.trim()
  const translated = TEAM_TRANSLATIONS[cleaned] || cleaned
  return !!TEAMS_INFO[translated]
}

// Auto scroll/jump to first match month on mount
onMounted(() => {
  if (props.officialMatches && props.officialMatches.length > 0) {
    const firstMatch = props.officialMatches[0]
    if (firstMatch && firstMatch.start_time) {
      const date = new Date(firstMatch.start_time)
      currentYear.value = date.getFullYear()
      currentMonth.value = date.getMonth()
      selectedDateStr.value = getMatchLocalDateStr(firstMatch.start_time)
    }
  }
})
</script>

<style scoped>
/* Chrome, Safari, Edge, Opera: remove spinner arrows for number input */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

@media (max-width: 480px) {
  .calendar-cell {
    min-height: 38px !important;
    aspect-ratio: 1 / 1 !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 2px !important;
  }
  .calendar-cell-number {
    text-align: center !important;
    align-items: center !important;
    justify-content: center !important;
    height: auto !important;
    width: auto !important;
  }
  .calendar-cell-indicators {
    display: none !important;
  }
}
</style>
