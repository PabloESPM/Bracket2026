<template>
  <div class="space-y-6">
    <div class="bg-slate-900/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold flex items-center gap-2">
          <span>📊</span> Clasificación del Torneo de Amigos
        </h2>
        <p class="text-xs text-slate-400">
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
              <th class="p-3 text-center w-12">Puesto</th>
              <th class="p-3">Usuario</th>
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
              <td class="p-3 text-center font-bold text-slate-400">{{ idx + 1 }}</td>
              <td class="p-3 font-semibold text-slate-100 flex items-center gap-2">
                <span>{{ row.username }}</span>
                <span v-if="row.user_id === currentUserId" class="px-1.5 py-0.5 text-[8px] bg-blue-950/50 border border-blue-900/50 text-blue-400 rounded-full font-bold uppercase">Tú</span>
              </td>
              <td class="p-3 text-center text-slate-300">{{ row.total_predictions || 0 }} / 72</td>
              <td class="p-3 text-center text-emerald-400 font-semibold">{{ row.exact_scores || 0 }}</td>
              <td class="p-3 text-center text-blue-400 font-semibold">{{ row.correct_outcomes || 0 }}</td>
              <td class="p-3 text-center font-extrabold text-amber-400 text-sm">{{ row.total_points || 0 }}</td>
              <td class="p-3 text-right">
                <button
                  @click="$emit('view-predictions', row)"
                  class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition duration-150"
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
defineProps({
  users: {
    type: Array,
    default: () => []
  },
  currentUserId: String
})

defineEmits(['view-predictions'])
</script>
