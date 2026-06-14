import { ref } from 'vue'
import { supabase } from '../supabaseClient.js'

export function useAuth() {
  const user = ref(null)
  const session = ref(null)
  const profile = ref(null)
  const showAuthModal = ref(false)
  const isDark = ref(true)

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return {
    user,
    session,
    profile,
    showAuthModal,
    isDark,
    applyTheme,
    toggleTheme,
    handleLogout
  }
}
