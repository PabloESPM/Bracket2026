import { ref } from 'vue'
import { supabase } from '../supabaseClient.js'

export function useChismoso(user, activeTab, loadingData) {
  const chismosoMode = ref(false)
  const viewedUser = ref(null)
  const chismosoPredictions = ref([])

  async function enterChismosoMode(userRow) {
    if (user.value && userRow.user_id === user.value.id) {
      exitChismosoMode()
      return
    }

    loadingData.value = true
    try {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('id, username, is_admin, manual_groups')
        .eq('id', userRow.user_id)
        .single()
      if (profErr) throw profErr

      const { data: pred, error: predErr } = await supabase
        .from('predictions')
        .select('id, user_id, match_id, home_predicted_score, away_predicted_score, predicted_winner')
        .eq('user_id', userRow.user_id)
      if (predErr) throw predErr

      viewedUser.value = prof
      chismosoPredictions.value = pred || []
      chismosoMode.value = true
      
      // Switch to groups view
      activeTab.value = 'groups'
    } catch (err) {
      console.error("Error loading friend predictions:", err)
      alert("No se pudieron cargar las predicciones del usuario.")
    } finally {
      loadingData.value = false
    }
  }

  function exitChismosoMode() {
    chismosoMode.value = false
    viewedUser.value = null
    chismosoPredictions.value = []
    activeTab.value = 'leaderboard'
  }

  return {
    chismosoMode,
    viewedUser,
    chismosoPredictions,
    enterChismosoMode,
    exitChismosoMode
  }
}
