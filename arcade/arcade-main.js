// ============================================================
// KANNA LAB MINI ARCADE — MAIN CONTROLLER
// Orchestrates 4 Games, Transitions, HUD & High Scores
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const arcadeSection = document.getElementById('play') || document.getElementById('arcade');
  if (!arcadeSection) return;

  const cardGrid = document.getElementById('arcade-card-grid');
  const playShell = document.getElementById('arcade-play-shell');
  const backBtn = document.getElementById('arcade-back-btn');
  const activeTitle = document.getElementById('arcade-active-title');
  const activeBestBadge = document.getElementById('arcade-active-best');
  const activeScoreBadge = document.getElementById('arcade-active-score');
  const gameScreens = document.querySelectorAll('.arcade-game-arena');

  let currentGame = null; // 'snake' | 'brick' | 'memory' | 'rps'

  // Update card best score indicators
  const refreshCardBests = () => {
    const bests = window.ArcadeStorage.getAllBests();

    const snakeEl = document.getElementById('best-badge-snake');
    if (snakeEl) snakeEl.textContent = bests.snake > 0 ? `${bests.snake} pts` : 'No record';

    const brickEl = document.getElementById('best-badge-brick');
    if (brickEl) brickEl.textContent = bests.brick > 0 ? `${bests.brick} pts` : 'No record';

    const memoryEl = document.getElementById('best-badge-memory');
    if (memoryEl) memoryEl.textContent = bests.memory > 0 ? `${bests.memory} flips` : 'No record';

    const rpsEl = document.getElementById('best-badge-rps');
    if (rpsEl) rpsEl.textContent = bests.rps > 0 ? `${bests.rps} streak` : '0 streak';
  };

  refreshCardBests();

  // Navigation: Show game shell
  const openGame = (gameKey) => {
    currentGame = gameKey;
    cardGrid.hidden = true;
    playShell.hidden = false;

    // Hide all game arenas, then reveal the active one
    gameScreens.forEach((el) => {
      el.hidden = el.dataset.gameArena !== gameKey;
    });

    // Reset overlay
    hideModal();

    window.SoundFX?.playPop();
    window.SoundFX?.triggerHaptic(15);

    // Mount game
    switch (gameKey) {
      case 'snake':
        launchSnake();
        break;
      case 'brick':
        launchBrick();
        break;
      case 'memory':
        launchMemory();
        break;
      case 'rps':
        launchRps();
        break;
    }

    // Smooth scroll to top of arcade stage
    playShell.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Navigation: Return to arcade card grid
  const closeGame = () => {
    if (currentGame === 'snake') window.SnakeGame?.stop();
    if (currentGame === 'brick') window.BrickGame?.stop();
    if (currentGame === 'memory') window.MemoryGame?.stop();

    hideModal();
    currentGame = null;
    playShell.hidden = true;
    cardGrid.hidden = false;
    refreshCardBests();

    window.SoundFX?.playTap();
    window.SoundFX?.triggerHaptic(10);
  };

  if (backBtn) {
    backBtn.addEventListener('click', closeGame);
  }

  // Hook card play triggers
  document.querySelectorAll('[data-launch-game]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const gameKey = btn.dataset.launchGame;
      openGame(gameKey);
    });
  });

  // Modal helpers
  const modalEl = document.getElementById('arcade-modal');
  const modalEmoji = document.getElementById('arcade-modal-emoji');
  const modalTitle = document.getElementById('arcade-modal-title');
  const modalDesc = document.getElementById('arcade-modal-desc');
  const modalRecordPill = document.getElementById('arcade-modal-record');
  const modalRetryBtn = document.getElementById('arcade-modal-retry');
  const modalBackBtn = document.getElementById('arcade-modal-back');

  const showModal = ({ emoji, title, desc, isNewRecord, retryAction }) => {
    if (!modalEl) return;
    if (modalEmoji) modalEmoji.textContent = emoji;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.innerHTML = desc;
    if (modalRecordPill) {
      modalRecordPill.hidden = !isNewRecord;
      if (isNewRecord) {
        modalRecordPill.textContent = '★ NEW PERSONAL RECORD!';
      }
    }

    modalRetryBtn.onclick = () => {
      hideModal();
      retryAction();
    };

    modalBackBtn.onclick = () => {
      hideModal();
      closeGame();
    };

    modalEl.hidden = false;
  };

  const hideModal = () => {
    if (modalEl) modalEl.hidden = true;
  };

  // ----------------------------------------------------
  // GAME 1: SNAKE LAUNCHER
  // ----------------------------------------------------
  const launchSnake = () => {
    activeTitle.textContent = 'Snake';
    const best = window.ArcadeStorage.getBest('snake');
    activeBestBadge.textContent = `Best: ${best} pts`;
    activeScoreBadge.textContent = 'Score: 0';

    const canvas = document.getElementById('snake-canvas');
    if (!canvas) return;

    window.SnakeGame.init(canvas, {
      onScoreUpdate: (score) => {
        activeScoreBadge.textContent = `Score: ${score}`;
      },
      onGameOver: (finalScore, isNewRecord, bestScore) => {
        activeBestBadge.textContent = `Best: ${bestScore} pts`;
        refreshCardBests();
        showModal({
          emoji: finalScore >= 100 ? '👑' : finalScore >= 40 ? '🐍' : '💀',
          title: 'Game Over!',
          desc: `You scored <b>${finalScore}</b> points!`,
          isNewRecord,
          retryAction: () => {
            window.SnakeGame.reset();
          }
        });
      }
    });

    // Snake virtual D-pad controls
    document.querySelectorAll('[data-snake-dir]').forEach((btn) => {
      btn.onpointerdown = (e) => {
        e.preventDefault();
        const dir = btn.dataset.snakeDir;
        if (dir === 'up') window.SnakeGame.setDirection(0, -1);
        if (dir === 'down') window.SnakeGame.setDirection(0, 1);
        if (dir === 'left') window.SnakeGame.setDirection(-1, 0);
        if (dir === 'right') window.SnakeGame.setDirection(1, 0);
        window.SoundFX?.playTap();
      };
    });

    const pauseBtn = document.getElementById('snake-pause-btn');
    if (pauseBtn) {
      pauseBtn.onclick = () => {
        const paused = window.SnakeGame.togglePause();
        pauseBtn.textContent = paused ? 'Resume ▶' : 'Pause ❚❚';
      };
    }

    const restartBtn = document.getElementById('snake-restart-btn');
    if (restartBtn) {
      restartBtn.onclick = () => {
        window.SnakeGame.reset();
        if (pauseBtn) pauseBtn.textContent = 'Pause ❚❚';
      };
    }

    window.SnakeGame.reset();
  };

  // ----------------------------------------------------
  // GAME 2: BRICK BREAKER LAUNCHER
  // ----------------------------------------------------
  const launchBrick = () => {
    activeTitle.textContent = 'Brick Breaker';
    const best = window.ArcadeStorage.getBest('brick');
    activeBestBadge.textContent = `Best: ${best} pts`;
    activeScoreBadge.textContent = 'Score: 0';

    const canvas = document.getElementById('brick-canvas');
    const livesEl = document.getElementById('brick-lives-display');
    const levelEl = document.getElementById('brick-level-display');
    if (!canvas) return;

    window.BrickGame.init(canvas, {
      onScoreUpdate: (score) => {
        activeScoreBadge.textContent = `Score: ${score}`;
      },
      onLivesUpdate: (lives) => {
        if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) || '💀';
      },
      onLevelUpdate: (level) => {
        if (levelEl) levelEl.textContent = `Lvl ${level}`;
      },
      onGameOver: (finalScore, isNewRecord, bestScore) => {
        activeBestBadge.textContent = `Best: ${bestScore} pts`;
        refreshCardBests();
        showModal({
          emoji: '💥',
          title: 'Out of Lives!',
          desc: `You made it with <b>${finalScore}</b> points!`,
          isNewRecord,
          retryAction: () => {
            window.BrickGame.reset(true);
          }
        });
      },
      onWin: (finalScore, isNewRecord, bestScore) => {
        activeBestBadge.textContent = `Best: ${bestScore} pts`;
        refreshCardBests();
        showModal({
          emoji: '🏆',
          title: 'All Bricks Cleared!',
          desc: `Flawless run! Final Score: <b>${finalScore}</b> points!`,
          isNewRecord,
          retryAction: () => {
            window.BrickGame.reset(true);
          }
        });
      }
    });

    const serveBtn = document.getElementById('brick-serve-btn');
    if (serveBtn) {
      serveBtn.onclick = () => window.BrickGame.serveBall();
    }

    const leftTouchBtn = document.getElementById('brick-left-btn');
    const rightTouchBtn = document.getElementById('brick-right-btn');
    if (leftTouchBtn) {
      leftTouchBtn.onpointerdown = (e) => {
        e.preventDefault();
        window.BrickGame.movePaddleLeft();
      };
    }
    if (rightTouchBtn) {
      rightTouchBtn.onpointerdown = (e) => {
        e.preventDefault();
        window.BrickGame.movePaddleRight();
      };
    }

    const restartBtn = document.getElementById('brick-restart-btn');
    if (restartBtn) {
      restartBtn.onclick = () => window.BrickGame.reset(true);
    }

    window.BrickGame.reset(true);
  };

  // ----------------------------------------------------
  // GAME 3: MEMORY MATCH LAUNCHER
  // ----------------------------------------------------
  const launchMemory = () => {
    activeTitle.textContent = 'Memory Match';
    const best = window.ArcadeStorage.getBest('memory');
    activeBestBadge.textContent = best > 0 ? `Best: ${best} flips` : 'Best: --';
    activeScoreBadge.textContent = 'Flips: 0';

    const board = document.getElementById('memory-board');
    const timerEl = document.getElementById('memory-timer');
    const pairsEl = document.getElementById('memory-pairs');
    if (!board) return;

    window.MemoryGame.init(board, {
      onFlipsUpdate: (flips) => {
        activeScoreBadge.textContent = `Flips: ${flips}`;
      },
      onPairsUpdate: (matched, total) => {
        if (pairsEl) pairsEl.textContent = `${matched} / ${total} pairs`;
      },
      onTimeUpdate: (timeStr) => {
        if (timerEl) timerEl.textContent = timeStr;
      },
      onVictory: (totalFlips, timeTaken, isNewRecord, bestFlips) => {
        activeBestBadge.textContent = `Best: ${bestFlips} flips`;
        refreshCardBests();
        showModal({
          emoji: totalFlips <= 18 ? '⚡' : '🧠',
          title: 'Memory Mastered!',
          desc: `Matched in <b>${totalFlips} flips</b> (${timeTaken})!`,
          isNewRecord,
          retryAction: () => {
            window.MemoryGame.reset();
          }
        });
      }
    });

    const restartBtn = document.getElementById('memory-restart-btn');
    if (restartBtn) {
      restartBtn.onclick = () => window.MemoryGame.reset();
    }

    window.MemoryGame.reset();
  };

  // ----------------------------------------------------
  // GAME 4: ROCK PAPER SCISSORS LAUNCHER
  // ----------------------------------------------------
  const launchRps = () => {
    activeTitle.textContent = 'Rock Paper Scissors';
    const best = window.ArcadeStorage.getBest('rps');
    activeBestBadge.textContent = `Best Streak: ${best}`;
    activeScoreBadge.textContent = 'Streak: 0';

    const pScore = document.getElementById('rps-player-wins');
    const bScore = document.getElementById('rps-bot-wins');
    const dScore = document.getElementById('rps-draws');
    const streakDisplay = document.getElementById('rps-streak-val');
    const arenaP = document.getElementById('rps-arena-player');
    const arenaB = document.getElementById('rps-arena-bot');
    const resultBanner = document.getElementById('rps-result-banner');

    window.RpsGame.init({
      onStatsUpdate: (stats) => {
        if (pScore) pScore.textContent = stats.playerWins;
        if (bScore) bScore.textContent = stats.botWins;
        if (dScore) dScore.textContent = stats.draws;
        if (streakDisplay) streakDisplay.textContent = stats.currentStreak;
        activeScoreBadge.textContent = `Streak: ${stats.currentStreak}`;
        activeBestBadge.textContent = `Best Streak: ${stats.bestStreak}`;
        refreshCardBests();
      },
      onRoundResult: ({ outcome, playerChoice, botChoice, streak, isNewStreakRecord }) => {
        if (arenaP) arenaP.textContent = playerChoice.emoji;
        if (arenaB) arenaB.textContent = botChoice.emoji;

        if (resultBanner) {
          resultBanner.className = `rps-banner is-${outcome}`;
          if (outcome === 'win') {
            resultBanner.textContent = isNewStreakRecord ? `🔥 VICTORY! NEW RECORD STREAK: ${streak}!` : `✓ YOU WIN! (${playerChoice.name} beats ${botChoice.name})`;
          } else if (outcome === 'lose') {
            resultBanner.textContent = `✗ BOT WINS! (${botChoice.name} beats ${playerChoice.name})`;
          } else {
            resultBanner.textContent = `― DRAW! Both chose ${playerChoice.name}`;
          }
        }
      }
    });

    // Hook weapon buttons
    document.querySelectorAll('[data-rps-choice]').forEach((btn) => {
      btn.onclick = () => {
        const choice = btn.dataset.rpsChoice;
        if (arenaP) arenaP.textContent = '⏳';
        if (arenaB) arenaB.textContent = '🤖';
        if (resultBanner) {
          resultBanner.className = 'rps-banner';
          resultBanner.textContent = 'Thinking...';
        }
        window.RpsGame.playRound(choice);
      };
    });

    const resetStatsBtn = document.getElementById('rps-reset-btn');
    if (resetStatsBtn) {
      resetStatsBtn.onclick = () => {
        window.RpsGame.resetStats();
        if (arenaP) arenaP.textContent = '❓';
        if (arenaB) arenaB.textContent = '🤖';
        if (resultBanner) {
          resultBanner.className = 'rps-banner';
          resultBanner.textContent = 'Pick your weapon below to battle!';
        }
      };
    }
  };
});
