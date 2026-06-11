<template>
  <div class="space-y-6">
    <div class="bg-slate-900/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
      <div>
        <h2 class="text-lg font-bold flex items-center gap-2">
          <span>🌿</span> Árbol de Eliminatorias (Championship Bracket)
        </h2>
        <p class="text-xs text-slate-400">
          {{ readOnly ? 'Viendo predicciones en modo de solo lectura para curiosear.' : 'Haz clic en un equipo para clasificarlo automáticamente a la siguiente ronda, o arrástralo y suéltalo en su casilla correspondiente.' }}
        </p>
      </div>
    </div>

    <!-- Scrollable container -->
    <div class="overflow-x-auto pb-6" ref="scrollContainer">
      <div
        class="min-w-[1250px] md:min-w-[1400px] grid grid-cols-6 gap-4 md:gap-6 p-4 md:p-6 relative min-h-[1500px] md:min-h-[1700px] select-none"
        ref="bracketContainer"
      >
        <!-- Column 1: Ronda de 32 -->
        <div class="flex flex-col h-full">
          <h3 class="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Ronda de 32</h3>
          <div class="flex flex-col justify-around flex-grow space-y-2">
            <BracketCard
              v-for="(match, matchId) in bracket.r32"
              :key="matchId"
              round-key="r32"
              :match-id="matchId"
              :match-data="match"
              :read-only="readOnly"
              @set-winner="setWinner"
              @drop-team="dropTeam"
            />
          </div>
        </div>

        <!-- Column 2: Octavos -->
        <div class="flex flex-col h-full">
          <h3 class="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Octavos</h3>
          <div class="flex flex-col justify-around flex-grow space-y-4">
            <BracketCard
              v-for="(match, matchId) in bracket.r16"
              :key="matchId"
              round-key="r16"
              :match-id="matchId"
              :match-data="match"
              :read-only="readOnly"
              @set-winner="setWinner"
              @drop-team="dropTeam"
            />
          </div>
        </div>

        <!-- Column 3: Cuartos -->
        <div class="flex flex-col h-full">
          <h3 class="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Cuartos</h3>
          <div class="flex flex-col justify-around flex-grow space-y-8">
            <BracketCard
              v-for="(match, matchId) in bracket.qf"
              :key="matchId"
              round-key="qf"
              :match-id="matchId"
              :match-data="match"
              :read-only="readOnly"
              @set-winner="setWinner"
              @drop-team="dropTeam"
            />
          </div>
        </div>

        <!-- Column 4: Semifinales -->
        <div class="flex flex-col h-full">
          <h3 class="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Semifinales</h3>
          <div class="flex flex-col justify-around flex-grow space-y-16">
            <BracketCard
              round-key="sf"
              match-id="S1"
              :match-data="bracket.sf.S1"
              :read-only="readOnly"
              @set-winner="setWinner"
              @drop-team="dropTeam"
            />
            <BracketCard
              round-key="sf"
              match-id="S2"
              :match-data="bracket.sf.S2"
              :read-only="readOnly"
              @set-winner="setWinner"
              @drop-team="dropTeam"
            />
          </div>
        </div>

        <!-- Column 5: Final / 3er Puesto -->
        <div class="flex flex-col h-full">
          <h3 class="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Finales</h3>
          <div class="flex flex-col justify-center space-y-12 flex-grow">
            <!-- Final -->
            <BracketCard
              round-key="final"
              match-id="final"
              :match-data="bracket.final"
              :read-only="readOnly"
              class="border-amber-500/50 bg-amber-950/10"
              @set-winner="setWinner"
              @drop-team="dropTeam"
            />
            <div class="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest -mb-8">Tercer Puesto</div>
            <!-- 3rd Place -->
            <BracketCard
              round-key="third"
              match-id="third"
              :match-data="bracket.third"
              :read-only="readOnly"
              class="border-slate-700/50 bg-slate-900/10"
              @set-winner="setWinner"
              @drop-team="dropTeam"
            />
          </div>
        </div>

        <!-- Column 6: Campeón -->
        <div class="flex flex-col h-full justify-center items-center">
          <h3 class="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Campeón</h3>
          <div class="flex flex-col justify-center items-center flex-grow">
            <div
              class="flex flex-col items-center justify-center p-6 bg-slate-900 border-2 border-dashed rounded-2xl w-48 md:w-52 text-center space-y-4 min-h-[180px] transition duration-300"
              :class="bracket.champion
                ? 'border-amber-500/60 bg-amber-950/10'
                : 'border-slate-800 hover:border-amber-500'"
              @dragover.prevent
              @drop="onChampionDrop"
            >
              <div v-if="bracket.champion">
                <div class="text-5xl trophy-anim">🏆</div>
                <div class="mt-4">
                  <h4 class="font-extrabold text-amber-400 text-base uppercase tracking-wider truncate max-w-[150px]" :title="bracket.champion">
                    {{ bracket.champion }}
                  </h4>
                  <span class="text-[10px] text-slate-400 font-bold px-2 py-0.5 bg-slate-950/60 rounded-full">Campeón Mundial</span>
                </div>
                <button
                  v-if="!readOnly"
                  @click="removeChampion"
                  class="text-[10px] text-red-400 hover:underline mt-2 block mx-auto cursor-pointer"
                >
                  Quitar campeón
                </button>
              </div>
              <div v-else>
                <div class="text-4xl text-slate-700">🏆</div>
                <span class="text-xs text-slate-500 font-medium px-2 block">
                  {{ readOnly ? 'Por definir' : 'Arrastra al ganador de la Final aquí' }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUpdated, onBeforeUnmount, nextTick } from 'vue'
import BracketCard from './BracketCard.vue'
import { BRACKET_CONNECTIONS } from '../utils/tournamentLogic.js'

const props = defineProps({
  bracket: {
    type: Object,
    required: true
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['set-winner', 'validate-and-drop'])

const scrollContainer = ref(null)
const bracketContainer = ref(null)

function setWinner(roundKey, matchId, team) {
  emit('set-winner', roundKey, matchId, team)
}

function dropTeam(roundKey, matchId, position, team) {
  emit('validate-and-drop', { roundKey, matchId, position, team })
}

function onChampionDrop(e) {
  if (props.readOnly) return
  const team = e.dataTransfer.getData('text/plain')
  if (!team) return
  emit('validate-and-drop', { roundKey: 'champion', matchId: 'C1', position: 'winner', team })
}

function removeChampion() {
  emit('set-winner', 'champion', null, null)
}

// Draw Bracket SVG lines
function drawBracketConnectors() {
  requestAnimationFrame(() => {
    const container = bracketContainer.value
    if (!container) return

    // Remove old SVG if it exists
    const oldSvg = container.querySelector('#bracket-connectors-svg')
    if (oldSvg) oldSvg.remove()

    const W = container.scrollWidth
    const H = container.scrollHeight

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.id = 'bracket-connectors-svg'
    svg.setAttribute('width', W.toString())
    svg.setAttribute('height', H.toString())
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    Object.assign(svg.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: W + 'px',
      height: H + 'px',
      pointerEvents: 'none',
      zIndex: '5',
      overflow: 'visible'
    })

    function offsetPos(el) {
      const rectEl = el.getBoundingClientRect()
      const rectContainer = container.getBoundingClientRect()
      return {
        x: rectEl.left - rectContainer.left,
        y: rectEl.top - rectContainer.top,
        w: rectEl.width,
        h: rectEl.height
      }
    }

    const getRightCenter = (el) => {
      const p = offsetPos(el)
      return { x: p.x + p.w, y: p.y + p.h / 2 }
    }

    const getLeftCenter = (el) => {
      const p = offsetPos(el)
      return { x: p.x, y: p.y + p.h / 2 }
    }

    const makePath = (d) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', d)
      path.classList.add('bracket-connector')
      path.setAttribute('stroke-linecap', 'round')
      path.setAttribute('stroke-linejoin', 'round')
      return path
    }

    BRACKET_CONNECTIONS.forEach(([idA, idB, idC]) => {
      const elA = container.querySelector(`#${idA}`)
      const elB = container.querySelector(`#${idB}`)
      const elC = container.querySelector(`#${idC}`)
      if (!elA || !elB || !elC) return

      const a = getRightCenter(elA)
      const b = getRightCenter(elB)
      const c = getLeftCenter(elC)

      const midX = (a.x + c.x) / 2
      const midY = (a.y + b.y) / 2

      svg.appendChild(makePath(`M ${a.x} ${a.y} H ${midX} V ${midY}`))
      svg.appendChild(makePath(`M ${b.x} ${b.y} H ${midX} V ${midY}`))
      svg.appendChild(makePath(`M ${midX} ${midY} H ${c.x}`))
    })

    container.appendChild(svg)
  })
}

// Trigger drawing connectors on layout update
onMounted(() => {
  nextTick(() => {
    drawBracketConnectors()
  })
  window.addEventListener('resize', drawBracketConnectors)
})

onUpdated(() => {
  nextTick(() => {
    drawBracketConnectors()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', drawBracketConnectors)
})
</script>
