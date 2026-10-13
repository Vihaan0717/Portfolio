// ============================================================
// KANNA LAB MINI ARCADE — GAME 4: ROCK PAPER SCISSORS
// Duel against the Kanna LAB Bot with Streak Tracker & SFX
// ============================================================
window.RpsGame = (() => {
  const CHOICES = [
    { id: 'rock', name: 'Rock', emoji: '🪨', beats: 'scissors' },
    { id: 'paper', name: 'Paper', emoji: '📄', beats: 'rock' },
    { id: 'scissors', name: 'Scissors', emoji: '✂️', beats: 'paper' }
  ];

  let stats = {
    playerWins: 0,
    botWins: 0,
    draws: 0,
    currentStreak: 0,
    bestStreak: 0
  };

  let isPlayingRound = false;

  // DOM Callbacks
  let onStatsUpdate = null;
  let onRoundResult = null;

  const init = (callbacks = {}) => {
    onStatsUpdate = callbacks.onStatsUpdate || (() => {});
    onRoundResult = callbacks.onRoundResult || (() => {});

    stats.bestStreak = window.ArcadeStorage?.getBest('rps') || 0;
    onStatsUpdate(stats);
    window.addEventListener('keydown', handleKey);
  };

  const handleKey = (e) => {
    if (isPlayingRound) return;
    if (e.key === '1' || e.key === 'r' || e.key === 'R') {
      playRound('rock');
    } else if (e.key === '2' || e.key === 'p' || e.key === 'P') {
      playRound('paper');
    } else if (e.key === '3' || e.key === 's' || e.key === 'S') {
      playRound('scissors');
    }
  };

  const playRound = (playerChoiceId) => {
    if (isPlayingRound) return;
    isPlayingRound = true;

    const playerChoice = CHOICES.find(c => c.id === playerChoiceId) || CHOICES[0];

    // Audio & haptics for player action
    window.SoundFX?.playTap();
    window.SoundFX?.triggerHaptic(10);

    // Independent, fair random bot choice
    const botChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];

    // Suspensful micro-delay for reveal animation
    setTimeout(() => {
      let outcome = ''; // 'win', 'lose', 'draw'

      if (playerChoice.id === botChoice.id) {
        outcome = 'draw';
        stats.draws++;
        stats.currentStreak = 0;
        window.SoundFX?.playPop();
      } else if (playerChoice.beats === botChoice.id) {
        outcome = 'win';
        stats.playerWins++;
        stats.currentStreak++;
        window.SoundFX?.playSuccess();
        window.SoundFX?.triggerHaptic([15, 30, 25]);

        // Check streak record
        const rec = window.ArcadeStorage?.recordScore('rps', stats.currentStreak) || { isNewRecord: false, best: stats.currentStreak };
        stats.bestStreak = rec.best;
      } else {
        outcome = 'lose';
        stats.botWins++;
        stats.currentStreak = 0;
        window.SoundFX?.playTap();
        window.SoundFX?.triggerHaptic(20);
      }

      isPlayingRound = false;
      onStatsUpdate(stats);
      onRoundResult({
        outcome,
        playerChoice,
        botChoice,
        streak: stats.currentStreak,
        isNewStreakRecord: stats.currentStreak > 0 && stats.currentStreak === stats.bestStreak
      });
    }, 450);
  };

  const resetStats = () => {
    stats.playerWins = 0;
    stats.botWins = 0;
    stats.draws = 0;
    stats.currentStreak = 0;
    stats.bestStreak = window.ArcadeStorage?.getBest('rps') || 0;
    onStatsUpdate(stats);
  };

  const destroy = () => {
    window.removeEventListener('keydown', handleKey);
  };

  return {
    init,
    playRound,
    resetStats,
    destroy,
    getStats: () => ({ ...stats }),
    isPlaying: () => isPlayingRound
  };
})();
