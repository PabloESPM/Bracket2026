<template>
  <header
    class="sticky top-0 z-40 bg-slate-900/90 dark:bg-slate-950/90 border-b border-slate-800 backdrop-blur-md transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 py-2 md:py-3 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
      <!-- Title & Saving Status -->
      <div class="flex items-center justify-between w-full md:w-auto">
        <div class="flex items-center gap-3">
          <span class="text-2xl md:text-3xl">🏆</span>
          <div>
            <h1
              class="text-lg md:text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent"
            >
              MUNDIAL FIFA 2026
            </h1>
            <p class="text-xs text-slate-400 font-medium">
              Tracker & Predictor Oficial
              <span v-if="saving" class="ml-2 text-indigo-400 animate-pulse text-[10px] font-bold">● Guardando...</span>
              <span v-else-if="chismosoMode" class="ml-2 text-amber-400 text-[10px] font-bold">👁 Chismoseando</span>
              <span v-else class="ml-2 text-emerald-400 text-[10px] font-bold">● Sincronizado</span>
            </p>
          </div>
        </div>
        <!-- Theme & Logout/Login on mobile -->
        <div class="flex md:hidden items-center gap-2">
          <button @click="$emit('toggle-theme')" class="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700">
            {{ isDark ? '🌞' : '🌙' }}
          </button>
          <button v-if="isLoggedIn" @click="$emit('logout')" class="p-1.5 bg-red-950/40 border border-red-900/50 text-red-400 rounded-lg text-xs font-semibold">
            Salir
          </button>
          <button v-else @click="$emit('open-login')" class="p-1.5 bg-blue-600 border border-blue-500 text-white rounded-lg text-[10px] font-bold uppercase">
            Entrar
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="flex items-center bg-slate-800/60 dark:bg-slate-900/60 p-0.5 md:p-1 rounded-xl border border-slate-700/50 overflow-x-auto max-w-full">
        <button
          v-for="tab in visibleTabs"
          :key="tab.id"
          @click="$emit('change-tab', tab.id)"
          class="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 shrink-0 cursor-pointer"
          :class="activeTab === tab.id
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
            : 'text-slate-400 hover:text-slate-100 dark:hover:text-white'"
        >
          {{ tab.name }}
        </button>
      </nav>

      <!-- User Information & Theme Toggle -->
      <div class="hidden md:flex items-center gap-4">
        <template v-if="isLoggedIn">
          <div class="flex flex-col text-right">
            <span class="text-xs text-slate-400">Usuario</span>
            <span class="text-sm font-bold text-slate-100 flex items-center gap-1.5 justify-end">
              {{ username }}
              <span v-if="isAdmin" class="px-1.5 py-0.5 text-[8px] bg-red-950/50 border border-red-900/50 text-red-400 rounded-full font-extrabold uppercase">Admin</span>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button @click="$emit('toggle-theme')" class="p-1.5 md:p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition duration-200 cursor-pointer">
              {{ isDark ? '🌞' : '🌙' }}
            </button>
            <button @click="$emit('logout')" class="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-lg text-xs font-semibold border border-red-900/50 transition duration-200 cursor-pointer">
              Cerrar Sesión
            </button>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center gap-3">
            <button @click="$emit('toggle-theme')" class="p-1.5 md:p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition duration-200 cursor-pointer">
              {{ isDark ? '🌞' : '🌙' }}
            </button>
            <button @click="$emit('open-login')" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition cursor-pointer">
              Iniciar Sesión
            </button>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeTab: String,
  isLoggedIn: Boolean,
  username: String,
  isAdmin: Boolean,
  saving: Boolean,
  chismosoMode: Boolean,
  isDark: Boolean
})

const emit = defineEmits(['change-tab', 'logout', 'toggle-theme', 'open-login'])

const visibleTabs = computed(() => {
  const tabs = [
    { id: 'calendar', name: 'Calendario' },
    { id: 'groups', name: 'Grupos' },
    { id: 'bracket', name: 'Eliminatorias' },
    { id: 'simulation', name: 'Simulación' },
    { id: 'leaderboard', name: 'Clasificación' }
  ]
  if (props.isAdmin) {
    tabs.push({ id: 'admin', name: 'Administración' })
  }
  return tabs
})
</script>
