import { ref } from 'vue'
import { supabase } from '../supabaseClient.js'

export function usePredictions(
  user,
  profile,
  userPredictions,
  chismosoMode,
  modalMatch,
  computedGroups,
  computedBracket,
  closeMatchModal
) {
  const saving = ref(false)

  // Save a group stage match prediction in Supabase
  async function savePrediction(scoreHome, scoreAway) {
    if (chismosoMode.value) return
    if (!modalMatch.value) return

    const matchId = modalMatch.value.id
    saving.value = true

    let predictedWinner = null
    if (scoreHome > scoreAway) {
      predictedWinner = modalMatch.value.home
    } else if (scoreAway > scoreHome) {
      predictedWinner = modalMatch.value.away
    }

    try {
      const { error } = await supabase
        .from('predictions')
        .upsert({
          user_id: user.value.id,
          match_id: matchId,
          home_predicted_score: scoreHome,
          away_predicted_score: scoreAway,
          predicted_winner: predictedWinner
        }, { onConflict: 'user_id, match_id' })

      if (error) throw error

      // Update locally immediately
      const existingIdx = userPredictions.value.findIndex(p => p.match_id === matchId)
      const newPred = {
        user_id: user.value.id,
        match_id: matchId,
        home_predicted_score: scoreHome,
        away_predicted_score: scoreAway,
        predicted_winner: predictedWinner
      }

      if (existingIdx !== -1) {
        userPredictions.value[existingIdx] = newPred
      } else {
        userPredictions.value.push(newPred)
      }

      closeMatchModal()
    } catch (err) {
      console.error("Error saving score prediction:", err)
      alert("No se pudo guardar la predicción: " + err.message)
    } finally {
      saving.value = false
    }
  }

  // Clear prediction score
  async function clearPrediction() {
    if (chismosoMode.value) return
    if (!modalMatch.value) return

    const matchId = modalMatch.value.id
    saving.value = true

    try {
      const { error } = await supabase
        .from('predictions')
        .delete()
        .eq('user_id', user.value.id)
        .eq('match_id', matchId)

      if (error) throw error

      userPredictions.value = userPredictions.value.filter(p => p.match_id !== matchId)
      closeMatchModal()
    } catch (err) {
      console.error("Error deleting prediction:", err)
      alert("Error al borrar predicción: " + err.message)
    } finally {
      saving.value = false
    }
  }

  // Save bracket winner selections
  async function handleBracketWinner(roundKey, matchId, winnerTeam) {
    if (chismosoMode.value) return

    saving.value = true

    try {
      if (roundKey === 'champion') {
        // Set champion = set winner of final
        const fMatch = computedBracket.value.final
        if (!fMatch.home || !fMatch.away) return
        
        const { error } = await supabase
          .from('predictions')
          .upsert({
            user_id: user.value.id,
            match_id: 'final',
            home_predicted_score: winnerTeam === fMatch.home ? 1 : 0,
            away_predicted_score: winnerTeam === fMatch.away ? 1 : 0,
            predicted_winner: winnerTeam
          }, { onConflict: 'user_id, match_id' })

        if (error) throw error

        // Update locally
        const idx = userPredictions.value.findIndex(p => p.match_id === 'final')
        const pData = {
          user_id: user.value.id,
          match_id: 'final',
          home_predicted_score: winnerTeam === fMatch.home ? 1 : 0,
          away_predicted_score: winnerTeam === fMatch.away ? 1 : 0,
          predicted_winner: winnerTeam
        }
        if (idx !== -1) userPredictions.value[idx] = pData
        else userPredictions.value.push(pData)

      } else {
        const match = computedBracket.value[roundKey][matchId]
        if (!match) return

        if (winnerTeam === null) {
          // Delete or set winner null
          const { error } = await supabase
            .from('predictions')
            .delete()
            .eq('user_id', user.value.id)
            .eq('match_id', matchId)

          if (error) throw error
          userPredictions.value = userPredictions.value.filter(p => p.match_id !== matchId)
        } else {
          const { error } = await supabase
            .from('predictions')
            .upsert({
              user_id: user.value.id,
              match_id: matchId,
              home_predicted_score: winnerTeam === match.home ? 1 : 0,
              away_predicted_score: winnerTeam === match.away ? 1 : 0,
              predicted_winner: winnerTeam
            }, { onConflict: 'user_id, match_id' })

          if (error) throw error

          const idx = userPredictions.value.findIndex(p => p.match_id === matchId)
          const pData = {
            user_id: user.value.id,
            match_id: matchId,
            home_predicted_score: winnerTeam === match.home ? 1 : 0,
            away_predicted_score: winnerTeam === match.away ? 1 : 0,
            predicted_winner: winnerTeam
          }
          if (idx !== -1) userPredictions.value[idx] = pData
          else userPredictions.value.push(pData)
        }
      }
    } catch (err) {
      console.error("Error setting winner:", err)
    } finally {
      saving.value = false
    }
  }

  // Drag & drop validation in bracket
  function handleBracketDrop({ roundKey, matchId, position, team }) {
    if (chismosoMode.value) return

    if (roundKey === 'champion') {
      const fMatch = computedBracket.value.final
      if (team === fMatch.home || team === fMatch.away) {
        handleBracketWinner('champion', null, team)
      }
    } else {
      const match = computedBracket.value[roundKey][matchId]
      if (!match) return
      if (position === 'home' && team === match.home) return
      if (position === 'away' && team === match.away) return

      // Allow user to set winner based on dropping
      if (team === match.home || team === match.away) {
        handleBracketWinner(roundKey, matchId, team)
      }
    }
  }

  // Standings row drag reordering persist
  async function handleGroupReorder(groupKey, fromIdx, toIdx) {
    if (chismosoMode.value) return

    const group = computedGroups.value[groupKey]
    if (!group) return

    const reordered = [...group.standings]
    const dragged = reordered[fromIdx]
    reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, dragged)

    const list = reordered.map(s => s.team)

    saving.value = true
    try {
      const updatedManual = { ...(profile.value?.manual_groups || {}) }
      updatedManual[groupKey] = list

      const { error } = await supabase
        .from('profiles')
        .update({ manual_groups: updatedManual })
        .eq('id', user.value.id)

      if (error) throw error

      if (!profile.value) profile.value = {}
      profile.value.manual_groups = updatedManual
    } catch (err) {
      console.error("Error updating standings order:", err)
      alert("Error al ordenar standings: " + err.message)
    } finally {
      saving.value = false
    }
  }

  return {
    saving,
    savePrediction,
    clearPrediction,
    handleBracketWinner,
    handleBracketDrop,
    handleGroupReorder
  }
}
