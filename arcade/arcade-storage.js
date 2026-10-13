// ============================================================
// KANNA LAB MINI ARCADE — STORAGE UTILITY
// Namespaced, resilient localStorage for personal bests
// ============================================================
window.ArcadeStorage = (() => {
  const PREFIX = 'kanna_arcade_';

  const isAvailable = () => {
    try {
      const testKey = '__arcade_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  };

  const getBest = (gameKey) => {
    if (!isAvailable()) return 0;
    try {
      const val = localStorage.getItem(PREFIX + gameKey);
      if (val === null || val === undefined) return 0;
      const parsed = parseInt(val, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    } catch (e) {
      return 0;
    }
  };

  const saveBest = (gameKey, score) => {
    if (!isAvailable()) return false;
    try {
      localStorage.setItem(PREFIX + gameKey, String(score));
      return true;
    } catch (e) {
      return false;
    }
  };

  // For games where higher is better (Snake, Brick, RPS) or lower is better (Memory flips)
  const recordScore = (gameKey, score, lowerIsBetter = false) => {
    const current = getBest(gameKey);
    let isRecord = false;
    if (current === 0) {
      isRecord = score > 0;
    } else if (lowerIsBetter) {
      isRecord = score < current;
    } else {
      isRecord = score > current;
    }

    if (isRecord) {
      saveBest(gameKey, score);
    }
    return {
      isNewRecord: isRecord,
      best: isRecord ? score : current
    };
  };

  const getAllBests = () => {
    return {
      snake: getBest('snake'),
      brick: getBest('brick'),
      memory: getBest('memory'),
      rps: getBest('rps')
    };
  };

  return {
    getBest,
    saveBest,
    recordScore,
    getAllBests
  };
})();
