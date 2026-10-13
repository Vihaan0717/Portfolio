// ============================================================
// KANNA LAB MINI ARCADE — GAME 1: SNAKE
// Complete Grid Canvas Snake with SoundFX & Haptics
// ============================================================
window.SnakeGame = (() => {
  let canvas = null;
  let ctx = null;
  let animId = null;
  let lastTick = 0;
  let tickInterval = 130; // base speed ms per step
  let isRunning = false;
  let isPaused = false;
  let isGameOver = false;
  let isAwaitingStart = true;

  // Grid setup: 20x20
  const GRID_SIZE = 20;
  let tileSize = 20;

  // Snake state
  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 10, y: 10, isSpecial: false };
  let score = 0;
  let foodCount = 0;

  // DOM Callbacks
  let onScoreUpdate = null;
  let onGameOver = null;

  const init = (canvasEl, callbacks = {}) => {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    onScoreUpdate = callbacks.onScoreUpdate || (() => {});
    onGameOver = callbacks.onGameOver || (() => {});

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', handleKey);
  };

  const resize = () => {
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const maxSide = Math.min(parent.clientWidth - 20, 480);
    const size = Math.max(280, maxSide);
    canvas.width = size;
    canvas.height = size;
    tileSize = canvas.width / GRID_SIZE;
    if (!isRunning && !isGameOver) {
      render();
    }
  };

  const reset = () => {
    stop();
    snake = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    foodCount = 0;
    tickInterval = 130;
    isPaused = false;
    isGameOver = false;
    isAwaitingStart = true;
    isRunning = true;
    lastTick = performance.now();

    spawnFood();
    onScoreUpdate(score);
    animId = requestAnimationFrame(gameLoop);
  };

  const spawnFood = () => {
    let valid = false;
    let newX, newY;
    foodCount++;
    const isSpecial = foodCount % 5 === 0;

    while (!valid) {
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);
      valid = !snake.some(segment => segment.x === newX && segment.y === newY);
    }
    food = { x: newX, y: newY, isSpecial };
  };

  const setDirection = (x, y) => {
    if (!isRunning || isPaused || isGameOver) return;
    if (isAwaitingStart) {
      isAwaitingStart = false;
      lastTick = performance.now();
      dir = { x, y };
      nextDir = { x, y };
      return;
    }
    // Prevent immediate 180-degree reversal
    if (x !== 0 && dir.x === -x) return;
    if (y !== 0 && dir.y === -y) return;
    nextDir = { x, y };
  };

  const handleKey = (e) => {
    if (!isRunning || isGameOver) return;

    // Check for arrow keys or WASD
    let handled = false;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        setDirection(0, -1);
        handled = true;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        setDirection(0, 1);
        handled = true;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        setDirection(-1, 0);
        handled = true;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        setDirection(1, 0);
        handled = true;
        break;
      case ' ':
        togglePause();
        handled = true;
        break;
    }

    if (handled) {
      e.preventDefault();
    }
  };

  const togglePause = () => {
    if (!isRunning || isGameOver) return;
    isPaused = !isPaused;
    if (!isPaused) {
      lastTick = performance.now();
      animId = requestAnimationFrame(gameLoop);
    }
    return isPaused;
  };

  const step = () => {
    if (isAwaitingStart) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      handleDeath();
      return;
    }

    // Self collision
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      handleDeath();
      return;
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
      const addedPoints = food.isSpecial ? 30 : 10;
      score += addedPoints;
      onScoreUpdate(score);

      // Play audio & haptics
      window.SoundFX?.playPop();
      window.SoundFX?.triggerHaptic([12, 18]);

      // Dynamic speed ramp
      if (score % 40 === 0 && tickInterval > 65) {
        tickInterval = Math.max(65, tickInterval - 8);
      }

      spawnFood();
    } else {
      snake.pop();
    }
  };

  const handleDeath = () => {
    isGameOver = true;
    isRunning = false;
    window.SoundFX?.playTap();
    window.SoundFX?.triggerHaptic([25, 40, 20]);
    const recordResult = window.ArcadeStorage?.recordScore('snake', score) || { isNewRecord: false, best: score };
    onGameOver(score, recordResult.isNewRecord, recordResult.best);
  };

  const gameLoop = (now) => {
    if (!isRunning || isPaused || isGameOver) return;

    if (now - lastTick >= tickInterval) {
      step();
      lastTick = now;
    }

    render();
    if (isRunning && !isPaused && !isGameOver) {
      animId = requestAnimationFrame(gameLoop);
    }
  };

  const render = () => {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#19161e'; // var(--ink)
    ctx.fillRect(0, 0, w, h);

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tileSize, 0);
      ctx.lineTo(i * tileSize, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * tileSize);
      ctx.lineTo(w, i * tileSize);
      ctx.stroke();
    }

    // Render Food
    const fx = food.x * tileSize;
    const fy = food.y * tileSize;
    if (food.isSpecial) {
      // Golden special food with pulsating aura
      ctx.fillStyle = '#ffcf3f'; // var(--sun)
      ctx.shadowColor = '#ffcf3f';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(fx + tileSize / 2, fy + tileSize / 2, tileSize / 2 - 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // Crisp neon coral food
      ctx.fillStyle = '#ff4e28'; // var(--coral)
      ctx.shadowColor = '#ff4e28';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(fx + tileSize / 2, fy + tileSize / 2, tileSize / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Snake
    snake.forEach((seg, index) => {
      const sx = seg.x * tileSize;
      const sy = seg.y * tileSize;
      const isHead = index === 0;

      if (isHead) {
        ctx.fillStyle = '#d5ff45'; // var(--lime)
        ctx.shadowColor = '#d5ff45';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(sx + 1, sy + 1, tileSize - 2, tileSize - 2, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Snake eyes
        ctx.fillStyle = '#19161e';
        const eyeOffset = tileSize * 0.28;
        const eyeSize = Math.max(2, tileSize * 0.16);
        let e1 = { x: sx + eyeOffset, y: sy + eyeOffset };
        let e2 = { x: sx + tileSize - eyeOffset, y: sy + eyeOffset };

        if (dir.x === 1) { // Right
          e1 = { x: sx + tileSize - eyeOffset, y: sy + eyeOffset };
          e2 = { x: sx + tileSize - eyeOffset, y: sy + tileSize - eyeOffset };
        } else if (dir.x === -1) { // Left
          e1 = { x: sx + eyeOffset, y: sy + eyeOffset };
          e2 = { x: sx + eyeOffset, y: sy + tileSize - eyeOffset };
        } else if (dir.y === 1) { // Down
          e1 = { x: sx + eyeOffset, y: sy + tileSize - eyeOffset };
          e2 = { x: sx + tileSize - eyeOffset, y: sy + tileSize - eyeOffset };
        }
        ctx.fillRect(e1.x - eyeSize / 2, e1.y - eyeSize / 2, eyeSize, eyeSize);
        ctx.fillRect(e2.x - eyeSize / 2, e2.y - eyeSize / 2, eyeSize, eyeSize);
      } else {
        // Gradient fade down the body
        const alpha = Math.max(0.45, 1 - (index / (snake.length + 4)));
        ctx.fillStyle = index % 2 === 0 ? `rgba(168, 242, 191, ${alpha})` : `rgba(213, 255, 69, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(sx + 1.5, sy + 1.5, tileSize - 3, tileSize - 3, 3);
        ctx.fill();
      }
    });

    // Awaiting start prompt overlay
    if (isAwaitingStart && !isPaused && !isGameOver) {
      ctx.fillStyle = 'rgba(25, 22, 30, 0.75)';
      ctx.fillRect(0, h / 2 - 28, w, 56);
      ctx.font = 'bold 12px "DM Sans", sans-serif';
      ctx.fillStyle = '#d5ff45';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PRESS ARROW, WASD OR D-PAD TO START 🐍', w / 2, h / 2);
    }

    // Pause overlay
    if (isPaused) {
      ctx.fillStyle = 'rgba(25, 22, 30, 0.75)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px "Londrina Solid", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PAUSED', w / 2, h / 2);
    }
  };

  const stop = () => {
    isRunning = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  };

  const destroy = () => {
    stop();
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', handleKey);
  };

  return {
    init,
    reset,
    setDirection,
    togglePause,
    stop,
    destroy,
    isRunning: () => isRunning,
    isPaused: () => isPaused,
    isGameOver: () => isGameOver
  };
})();
