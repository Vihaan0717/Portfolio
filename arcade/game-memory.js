// ============================================================
// KANNA LAB MINI ARCADE — GAME 3: MEMORY MATCH
// DOM-based 4x4 Neo-Brutalist Matching Game with 3D Flip
// ============================================================
window.MemoryGame = (() => {
  const PAIRS_DATA = [
    { id: 'agent', emoji: '🤖', label: 'AI AGENT' },
    { id: 'mobile', emoji: '📱', label: 'FLUTTER' },
    { id: 'lightning', emoji: '⚡', label: 'REALTIME' },
    { id: 'cloud', emoji: '☁️', label: 'CLOUD' },
    { id: 'brain', emoji: '🧠', label: 'LLM' },
    { id: 'shield', emoji: '🔒', label: 'SECURITY' },
    { id: 'code', emoji: '💻', label: 'FULLSTACK' },
    { id: 'spark', emoji: '✦', label: 'GEN Z' }
  ];

  let boardEl = null;
  let flippedCards = [];
  let matchedPairs = 0;
  let totalFlips = 0;
  let isLocked = false;
  let timerInterval = null;
  let secondsElapsed = 0;
  let isRunning = false;

  // Callbacks
  let onFlipsUpdate = null;
  let onPairsUpdate = null;
  let onTimeUpdate = null;
  let onVictory = null;

  const init = (containerEl, callbacks = {}) => {
    boardEl = containerEl;
    onFlipsUpdate = callbacks.onFlipsUpdate || (() => {});
    onPairsUpdate = callbacks.onPairsUpdate || (() => {});
    onTimeUpdate = callbacks.onTimeUpdate || (() => {});
    onVictory = callbacks.onVictory || (() => {});
  };

  const startTimer = () => {
    clearInterval(timerInterval);
    secondsElapsed = 0;
    onTimeUpdate(formatTime(secondsElapsed));
    timerInterval = setInterval(() => {
      secondsElapsed++;
      onTimeUpdate(formatTime(secondsElapsed));
    }, 1000);
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const reset = () => {
    stop();
    flippedCards = [];
    matchedPairs = 0;
    totalFlips = 0;
    isLocked = false;
    isRunning = true;

    onFlipsUpdate(totalFlips);
    onPairsUpdate(matchedPairs, PAIRS_DATA.length);
    startTimer();
    renderBoard();
  };

  const renderBoard = () => {
    if (!boardEl) return;
    boardEl.innerHTML = '';

    // Create 16 cards (8 pairs)
    const deck = [];
    PAIRS_DATA.forEach((item) => {
      deck.push({ ...item, uid: item.id + '_1' });
      deck.push({ ...item, uid: item.id + '_2' });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    deck.forEach((card, index) => {
      const cardEl = document.createElement('button');
      cardEl.className = 'arcade-mem-card';
      cardEl.setAttribute('type', 'button');
      cardEl.setAttribute('role', 'gridcell');
      cardEl.setAttribute('aria-label', `Card ${index + 1}: Hidden`);
      cardEl.dataset.cardId = card.id;

      cardEl.innerHTML = `
        <div class="arcade-card-flipper">
          <div class="arcade-card-front" aria-hidden="true">
            <span class="card-mark">✦</span>
          </div>
          <div class="arcade-card-back">
            <span class="card-emoji">${card.emoji}</span>
            <small class="card-tag">${card.label}</small>
          </div>
        </div>
      `;

      cardEl.addEventListener('click', () => handleCardClick(cardEl, card));
      boardEl.appendChild(cardEl);
    });
  };

  const handleCardClick = (cardEl, card) => {
    if (!isRunning || isLocked) return;
    if (cardEl.classList.contains('is-flipped') || cardEl.classList.contains('is-matched')) return;

    cardEl.classList.add('is-flipped');
    cardEl.setAttribute('aria-label', `Card ${card.label}`);
    flippedCards.push({ el: cardEl, data: card });
    totalFlips++;
    onFlipsUpdate(totalFlips);

    window.SoundFX?.playTap();
    window.SoundFX?.triggerHaptic(8);

    if (flippedCards.length === 2) {
      isLocked = true;
      checkMatch();
    }
  };

  const checkMatch = () => {
    const [first, second] = flippedCards;

    if (first.data.id === second.data.id) {
      // Match found!
      first.el.classList.add('is-matched');
      second.el.classList.add('is-matched');
      matchedPairs++;
      onPairsUpdate(matchedPairs, PAIRS_DATA.length);

      window.SoundFX?.playPop();
      window.SoundFX?.triggerHaptic([12, 22]);

      flippedCards = [];
      isLocked = false;

      // Victory condition
      if (matchedPairs === PAIRS_DATA.length) {
        clearInterval(timerInterval);
        isRunning = false;
        window.SoundFX?.playSuccess();
        window.SoundFX?.triggerHaptic([20, 35, 30, 50]);

        // Lower flips is better
        const rec = window.ArcadeStorage?.recordScore('memory', totalFlips, true) || { isNewRecord: false, best: totalFlips };
        onVictory(totalFlips, formatTime(secondsElapsed), rec.isNewRecord, rec.best);
      }
    } else {
      // Mismatch - flip back after brief pause
      setTimeout(() => {
        first.el.classList.remove('is-flipped');
        second.el.classList.remove('is-flipped');
        first.el.setAttribute('aria-label', 'Card: Hidden');
        second.el.setAttribute('aria-label', 'Card: Hidden');
        flippedCards = [];
        isLocked = false;
      }, 700);
    }
  };

  const stop = () => {
    isRunning = false;
    clearInterval(timerInterval);
    flippedCards = [];
    isLocked = false;
  };

  const destroy = () => {
    stop();
    if (boardEl) boardEl.innerHTML = '';
  };

  return {
    init,
    reset,
    stop,
    destroy,
    isRunning: () => isRunning
  };
})();
