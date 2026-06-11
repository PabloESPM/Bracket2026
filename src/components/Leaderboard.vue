<template>
  <div class="space-y-6">
    <div class="bg-slate-900/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
      <div>
        <h2 class="text-lg font-bold flex items-center gap-2">
          <span>📊</span> Clasificación del Torneo de Amigos
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          Compara tus puntos con los de tus amigos. El ranking se actualiza automáticamente cuando finaliza un partido real.
        </p>
      </div>
    </div>

    <!-- Leaderboard table -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr class="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[10px] md:text-xs">
              <th class="p-3 text-center w-16">Puesto</th>
              <th class="p-3 min-w-[200px] md:min-w-[300px]">Usuario</th>
              <th class="p-3 text-center">Predicciones</th>
              <th class="p-3 text-center text-emerald-400">Exactos (3 pts)</th>
              <th class="p-3 text-center text-blue-400">Resultado (1 pt)</th>
              <th class="p-3 text-center font-bold text-amber-400">Puntos</th>
              <th class="p-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td colspan="7" class="p-8 text-center text-slate-500">Cargando clasificación de amigos...</td>
            </tr>
            <tr
              v-for="(row, idx) in users"
              :key="row.user_id"
              class="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors"
              :class="{'bg-blue-950/10 border-l-4 border-l-blue-500': row.user_id === currentUserId}"
            >
              <!-- Position with Medals -->
              <td class="p-3 text-center">
                <span v-if="idx === 0" class="text-xl md:text-2xl" title="Medalla de Oro">🥇</span>
                <span v-else-if="idx === 1" class="text-xl md:text-2xl" title="Medalla de Plata">🥈</span>
                <span v-else-if="idx === 2" class="text-xl md:text-2xl" title="Medalla de Bronce">🥉</span>
                <span v-else class="font-bold text-slate-400 text-xs md:text-sm">{{ idx + 1 }}</span>
              </td>

              <!-- Username & Progress Bar -->
              <td class="p-3">
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-100 text-xs md:text-sm">{{ row.username }}</span>
                    <span v-if="row.user_id === currentUserId" class="px-1.5 py-0.5 text-[8px] bg-blue-950/50 border border-blue-900/50 text-blue-400 rounded-full font-bold uppercase">Tú</span>
                  </div>
                  <!-- Point progress bar scaled to top score -->
                  <div class="w-full max-w-xs md:max-w-md h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                    <div
                      class="h-full rounded-full transition-all duration-500 ease-out"
                      :class="getBarColor(idx)"
                      :style="{ width: `${getPercentage(row.total_points)}%` }"
                    ></div>
                  </div>
                </div>
              </td>

              <!-- Prediction stats -->
              <td class="p-3 text-center text-slate-300 font-medium">{{ row.total_predictions || 0 }} / 72</td>
              <td class="p-3 text-center text-emerald-400 font-bold">{{ row.exact_scores || 0 }}</td>
              <td class="p-3 text-center text-blue-400 font-bold">{{ row.correct_outcomes || 0 }}</td>
              <td class="p-3 text-center font-extrabold text-amber-400 text-sm md:text-base">{{ row.total_points || 0 }} pts</td>
              
              <!-- Action Button -->
              <td class="p-3 text-right">
                <button
                  @click="$emit('view-predictions', row)"
                  class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition duration-150 cursor-pointer shadow-md hover:border-slate-500"
                >
                  👁 Ver Predicción
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  currentUserId: String
})

defineEmits(['view-predictions'])

// Compute maximum points among all users to scale progress bars
const maxPoints = computed(() => {
  const pointsList = props.users.map(u => u.total_points || 0)
  const max = Math.max(...pointsList, 0)
  return max > 0 ? max : 10 // Avoid division by zero, min scale of 10 points
})

function getPercentage(points) {
  return ((points || 0) / maxPoints.value) * 100
}

function getBarColor(idx) {
  // Podiums get premium metal gradients
  if (idx === 0) return 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 shadow-md shadow-yellow-500/20'
  if (idx === 1) return 'bg-gradient-to-r from-slate-300 via-slate-400 to-slate-200 shadow-md shadow-slate-400/20'
  if (idx === 2) return 'bg-gradient-to-r from-orange-500 via-amber-700 to-orange-600 shadow-md shadow-orange-600/20'

  // Others get cycled colorful gradients
  const cycle = (idx - 3) % 5
  switch (cycle) {
    case 0: return 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/10'
    case 1: return 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/10'
    case 2: return 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-md shadow-purple-500/10'
    case 3: return 'bg-gradient-to-r from-pink-500 to-rose-600 shadow-md shadow-pink-500/10'
    default: return 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/10'
  }
}
</script>
