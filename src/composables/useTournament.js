import { onMounted, onUnmounted } from 'vue'
import { supabase } from '../supabaseClient.js'

export function useTournament(
  user,
  session,
  profile,
  officialMatches,
  userPredictions,
  leaderboard,
  loadingData,
  clearUserState
) {
  let realtimeChannel = null
  let authListener = null

  async function fetchInitialData() {
    loadingData.value = true
    try {
      // 1. Fetch Profile (only if logged in)
      if (user.value) {
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('id, username, is_admin, manual_groups')
          .eq('id', user.value.id)
          .maybeSingle()

        if (profErr) throw profErr
        profile.value = prof
      } else {
        profile.value = null
      }

      // 2. Fetch Matches (ALWAYS)
      const { data: mat, error: matErr } = await supabase
        .from('matches')
        .select('id, home_team, away_team, home_score, away_score, winner, status, start_time, stage')
        .order('start_time', { ascending: true })

      if (matErr) throw matErr
      officialMatches.value = mat || []

      // 3. Fetch User Predictions (only if logged in)
      if (user.value) {
        const { data: pred, error: predErr } = await supabase
          .from('predictions')
          .select('id, user_id, match_id, home_predicted_score, away_predicted_score, predicted_winner, points_earned')
          .eq('user_id', user.value.id)

        if (predErr) throw predErr
        userPredictions.value = pred || []
      } else {
        userPredictions.value = []
      }

      // 4. Fetch Leaderboard View (ALWAYS)
      const { data: lead, error: leadErr } = await supabase
        .from('leaderboard')
        .select('user_id, username, total_points, exact_scores, correct_outcomes, total_successes, total_predictions')
        .order('total_points', { ascending: false })

      if (leadErr) throw leadErr
      leaderboard.value = lead || []

    } catch (err) {
      console.error("Error loading tournament details:", err)
    } finally {
      loadingData.value = false
    }
  }

  onMounted(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      session.value = s
      user.value = s?.user || null
      fetchInitialData()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      session.value = s
      user.value = s?.user || null
      if (user.value) {
        fetchInitialData()
      } else {
        clearUserState()
        fetchInitialData()
      }
    })
    authListener = subscription

    realtimeChannel = supabase
      .channel('matches-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, (payload) => {
        const idx = officialMatches.value.findIndex(m => m.id === payload.new.id)
        if (idx !== -1) {
          officialMatches.value[idx] = { ...officialMatches.value[idx], ...payload.new }
        }
      })
      .subscribe()
  })

  onUnmounted(() => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
    }
    if (authListener) {
      authListener.unsubscribe()
    }
  })

  return {
    fetchInitialData
  }
}
