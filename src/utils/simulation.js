import { TEAMS_INFO, calculateGroupStandings, selectBestThirds, getR32Mapping } from './tournamentLogic.js';

export function simulateMatchScore(teamA, teamB, canDraw = true) {
  const ratingA = TEAMS_INFO[teamA] ? TEAMS_INFO[teamA].rating : 70;
  const ratingB = TEAMS_INFO[teamB] ? TEAMS_INFO[teamB].rating : 70;

  const diff = ratingA - ratingB;
  let winProbA = 0.37 + diff * 0.02;
  let winProbB = 0.37 - diff * 0.02;

  winProbA = Math.max(0.12, Math.min(0.80, winProbA));
  winProbB = Math.max(0.12, Math.min(0.80, winProbB));

  const drawProb = canDraw ? Math.max(0.08, 1 - winProbA - winProbB) : 0;
  const sum = winProbA + winProbB + drawProb;

  const rand = Math.random() * sum;

  let scoreHome = 0;
  let scoreAway = 0;

  if (rand < winProbA) {
    scoreHome = 1 + Math.floor(Math.random() * 3);
    scoreAway = Math.floor(Math.random() * scoreHome);
  } else if (rand < winProbA + winProbB) {
    scoreAway = 1 + Math.floor(Math.random() * 3);
    scoreHome = Math.floor(Math.random() * scoreAway);
  } else {
    scoreHome = Math.floor(Math.random() * 3);
    scoreAway = scoreHome;
  }

  return { scoreHome, scoreAway };
}

export function simulateRemainingBracket(bracket) {
  const solveMatch = (match) => {
    if (!match.winner && match.home && match.away) {
      const res = simulateMatchScore(match.home, match.away, false);
      match.winner = res.scoreHome >= res.scoreAway ? match.home : match.away;
    }
  };

  const updateFlow = (b) => {
    const checkAdvance = (prevMatch1, prevMatch2, targetSlot) => {
      const p1 = b.r32[prevMatch1] || b.r16[prevMatch1] || b.qf[prevMatch1] || b.sf[prevMatch1];
      const p2 = b.r32[prevMatch2] || b.r16[prevMatch2] || b.qf[prevMatch2] || b.sf[prevMatch2];

      const w1 = p1 ? p1.winner : null;
      const w2 = p2 ? p2.winner : null;

      if (targetSlot.home !== w1) {
        targetSlot.home = w1;
        targetSlot.winner = null;
      }
      if (targetSlot.away !== w2) {
        targetSlot.away = w2;
        targetSlot.winner = null;
      }
    };

    checkAdvance('P1', 'P2', b.r16.O1);
    checkAdvance('P3', 'P4', b.r16.O2);
    checkAdvance('P5', 'P6', b.r16.O3);
    checkAdvance('P7', 'P8', b.r16.O4);
    checkAdvance('P9', 'P10', b.r16.O5);
    checkAdvance('P11', 'P12', b.r16.O6);
    checkAdvance('P13', 'P14', b.r16.O7);
    checkAdvance('P15', 'P16', b.r16.O8);

    checkAdvance('O1', 'O2', b.qf.Q1);
    checkAdvance('O3', 'O4', b.qf.Q2);
    checkAdvance('O5', 'O6', b.qf.Q3);
    checkAdvance('O7', 'O8', b.qf.Q4);

    checkAdvance('Q1', 'Q2', b.sf.S1);
    checkAdvance('Q3', 'Q4', b.sf.S2);

    const s1 = b.sf.S1;
    const s2 = b.sf.S2;

    const fHome = s1.winner;
    const fAway = s2.winner;

    if (b.final.home !== fHome) {
      b.final.home = fHome;
      b.final.winner = null;
    }
    if (b.final.away !== fAway) {
      b.final.away = fAway;
      b.final.winner = null;
    }

    let l1 = null;
    if (s1.home && s1.away && s1.winner) {
      l1 = s1.winner === s1.home ? s1.away : s1.home;
    }
    let l2 = null;
    if (s2.home && s2.away && s2.winner) {
      l2 = s2.winner === s2.home ? s2.away : s2.home;
    }

    if (b.third.home !== l1) {
      b.third.home = l1;
      b.third.winner = null;
    }
    if (b.third.away !== l2) {
      b.third.away = l2;
      b.third.winner = null;
    }

    b.champion = b.final.winner;
  };

  // R32
  Object.keys(bracket.r32).forEach(k => solveMatch(bracket.r32[k]));
  updateFlow(bracket);

  // R16
  Object.keys(bracket.r16).forEach(k => solveMatch(bracket.r16[k]));
  updateFlow(bracket);

  // QF
  Object.keys(bracket.qf).forEach(k => solveMatch(bracket.qf[k]));
  updateFlow(bracket);

  // SF
  solveMatch(bracket.sf.S1);
  solveMatch(bracket.sf.S2);
  updateFlow(bracket);

  // Finals
  solveMatch(bracket.final);
  solveMatch(bracket.third);

  bracket.champion = bracket.final.winner;
}
