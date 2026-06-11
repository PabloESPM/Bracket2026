<template>
  <div class="w-full bg-slate-950 border border-slate-800/85 p-4 md:p-6 rounded-2xl relative overflow-hidden shadow-2xl">
    <!-- Background accents -->
    <div class="absolute w-96 h-96 bg-blue-600/10 blur-[120px] -top-12 -left-12 rounded-full"></div>
    <div class="absolute w-96 h-96 bg-emerald-600/10 blur-[120px] -bottom-12 -right-12 rounded-full"></div>

    <div class="w-full space-y-6 relative z-10">
      <!-- Title -->
      <div class="text-center space-y-2">
        <span class="text-4xl md:text-5xl block animate-bounce duration-1000">🏆</span>
        <h2 class="text-2xl font-black tracking-tight text-white bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
          MUNDIAL FIFA 2026
        </h2>
        <p class="text-xs text-slate-400 font-medium">
          Tracker & Predictor entre Amigos
        </p>
      </div>

      <!-- Form Mode Toggle -->
      <div class="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
        <button
          @click="isSignUp = false"
          class="flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer"
          :class="!isSignUp ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'"
        >
          Iniciar Sesión
        </button>
        <button
          @click="isSignUp = true"
          class="flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer"
          :class="isSignUp ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'"
        >
          Registrarse
        </button>
      </div>

      <!-- Alerts -->
      <div v-if="errorMsg" class="p-3 bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-semibold rounded-xl text-center">
        ❌ {{ errorMsg }}
      </div>
      <div v-if="successMsg" class="p-3 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-xs font-semibold rounded-xl text-center">
        ✔️ {{ successMsg }}
      </div>

      <!-- Form fields -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-1">
          <label for="username" class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre de Usuario</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">👤</span>
            <input
              type="text"
              id="username"
              v-model="username"
              required
              placeholder="ej: juan_perez"
              class="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 text-xs md:text-sm rounded-xl focus:outline-none focus:border-blue-500 placeholder-slate-600"
            >
          </div>
        </div>

        <div class="space-y-1">
          <label for="password" class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Contraseña</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔒</span>
            <input
              type="password"
              id="password"
              v-model="password"
              required
              placeholder="••••••••"
              class="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 text-xs md:text-sm rounded-xl focus:outline-none focus:border-blue-500 placeholder-slate-600"
            >
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer disabled:opacity-50"
        >
          {{ loading ? 'Cargando...' : isSignUp ? 'Registrar Cuenta' : 'Ingresar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabaseClient.js'

const emit = defineEmits(['auth-success'])

const isSignUp = ref(false)
const loading = ref(false)
const errorMsg = ref("")
const successMsg = ref("")

const username = ref("")
const password = ref("")

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ""
  successMsg.value = ""

  // Sanitize username (lowercase, remove spaces and strange symbols)
  const cleanUsername = username.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
  
  if (cleanUsername.length < 3) {
    errorMsg.value = "El usuario debe tener al menos 3 caracteres alfanuméricos."
    loading.value = false
    return
  }

  // Create dummy email
  const email = `${cleanUsername}@mundial2026.com`

  try {
    if (isSignUp.value) {
      // 1. Sign Up
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password.value,
        options: {
          data: {
            username: username.value.trim()
          }
        }
      })
      if (error) throw error

      successMsg.value = "¡Registro completado! Iniciando sesión automáticamente..."
      // Automatically log in after registration
      setTimeout(async () => {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password.value
        })
        if (loginError) {
          errorMsg.value = "Error al iniciar sesión: " + loginError.message
          loading.value = false
        } else {
          emit('auth-success', loginData.user)
        }
      }, 1500)

    } else {
      // 2. Log In
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password.value
      })
      if (error) throw error
      
      emit('auth-success', data.user)
    }
  } catch (err) {
    console.error(err)
    errorMsg.value = err.message || "Ocurrió un error inesperado."
    loading.value = false
  }
}
</script>
