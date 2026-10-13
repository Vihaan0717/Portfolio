// ============================================================
// KANNA LAB MINI ARCADE — GAME 2: BRICK BREAKER
// 60fps Canvas Brick Breaker with Multi-Levels, Lives & SFX
// ============================================================
window.BrickGame = (() => {
  let canvas = null;
  let ctx = null;
  let animId = null;
  let isRunning = false;
  let isPaused = false;
  let isGameOver = false;
  let isWin = false;
  let isServed = false;

  // Board dimensions
  let width = 480;
  let height = 480;

  // Paddle
  let paddle = {
    x: 200,
    y: 440,
    w: 90,
    h: 12,
    speed: 7,
    dx: 0
  };

  // Ball
  let ball = {
    x: 245,
    y: 425,
    r: 6,
    speed: 5.5,
    dx: 3.5,
    dy: -4
  };

  // Game state
  let score = 0;
  let lives = 3;
  let level = 1;
  const MAX_LEVELS = 3;
  let bricks = [];
  let keys = { left: false, right: false };

  // Callbacks
  let onScoreUpdate = null;
  let onLivesUpdate = null;
  let onLevelUpdate = null;
  let onGameOver = null;
  let onWin = null;

  // Color palette for bricks matching portfolio tokens
  const BRICK_COLORS = [
    '#ff4e28', // coral
    '#5637f2', // plum
    '#ffcf3f', // sun
    '#17d9df', // cyan
    '#d5ff45'  // lime
  ];

  const init = (canvasEl, callbacks = {}) => {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    onScoreUpdate = callbacks.onScoreUpdate || (() => {});
    onLivesUpdate = callbacks.onLivesUpdate || (() => {});
    onLevelUpdate = callbacks.onLevelUpdate || (() => {});
    onGameOver = callbacks.onGameOver || (() => {});
    onWin = callbacks.onWin || (() => {});

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    setupTouchListeners();
  };

  const resize = () => {
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const maxW = Math.min(parent.clientWidth - 20, 480);
    const size = Math.max(280, maxW);
    width = size;
    height = Math.round(size * 1.05);
    canvas.width = width;
    canvas.height = height;

    paddle.y = height - 32;
    paddle.w = Math.max(64, Math.round(width * 0.22));

    if (!isServed) {
      ball.x = paddle.x + paddle.w / 2;
      ball.y = paddle.y - ball.r - 2;
    }

    if (!isRunning) {
      render();
    }
  };

  const setupTouchListeners = () => {
    if (!canvas) return;
    let isTouching = false;

    const getCanvasX = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      return (clientX - rect.left) * scaleX;
    };

    const handlePointerMove = (e) => {
      if (!isRunning || isPaused || isGameOver) return;
      const x = getCanvasX(e.clientX);
      paddle.x = Math.max(0, Math.min(width - paddle.w, x - paddle.w / 2));
      if (!isServed) {
        ball.x = paddle.x + paddle.w / 2;
      }
    };

    const handlePointerDown = (e) => {
      isTouching = true;
      handlePointerMove(e);
      if (!isServed) {
        serveBall();
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', () => { isTouching = false; });
  };

  const handleKeyDown = (e) => {
    if (!isRunning || isGameOver) return;
    let handled = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      keys.left = true;
      handled = true;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      keys.right = true;
      handled = true;
    } else if (e.key === ' ') {
      if (!isServed) {
        serveBall();
      } else {
        togglePause();
      }
      handled = true;
    }

    if (handled) {
      e.preventDefault();
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      keys.left = false;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      keys.right = false;
    }
  };

  const buildBricks = () => {
    bricks = [];
    const rows = level === 1 ? 4 : level === 2 ? 5 : 6;
    const cols = 7;
    const padding = 6;
    const offsetTop = 40;
    const offsetSide = 14;
    const brickW = (width - (offsetSide * 2) - ((cols - 1) * padding)) / cols;
    const brickH = 14;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Layout variations per level
        if (level === 2 && (r + c) % 2 === 1 && r > 2) continue;
        if (level === 3 && (c === 0 || c === cols - 1) && (r === 0 || r === rows - 1)) continue;

        const maxHp = level >= 2 && r === 0 ? 2 : 1;
        bricks.push({
          x: offsetSide + c * (brickW + padding),
          y: offsetTop + r * (brickH + padding),
          w: brickW,
          h: brickH,
          hp: maxHp,
          maxHp: maxHp,
          color: BRICK_COLORS[r % BRICK_COLORS.length]
        });
      }
    }
  };

  const reset = (fullReset = true) => {
    stop();
    if (fullReset) {
      score = 0;
      lives = 3;
      level = 1;
    }

    paddle.x = width / 2 - paddle.w / 2;
    paddle.y = height - 32;
    paddle.dx = 0;

    isServed = false;
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - ball.r - 2;
    ball.speed = 5.2 + (level * 0.45);
    ball.dx = 0;
    ball.dy = 0;

    isPaused = false;
    isGameOver = false;
    isWin = false;
    isRunning = true;

    buildBricks();
    onScoreUpdate(score);
    onLivesUpdate(lives);
    onLevelUpdate(level);

    animId = requestAnimationFrame(gameLoop);
  };

  const serveBall = () => {
    if (isServed || !isRunning || isPaused || isGameOver) return;
    isServed = true;
    const angle = (Math.random() * 0.4 - 0.2) * Math.PI; // slight tilt
    ball.dx = Math.sin(angle) * ball.speed + (Math.random() > 0.5 ? 2.5 : -2.5);
    ball.dy = -ball.speed;
    window.SoundFX?.playPop();
    window.SoundFX?.triggerHaptic(12);
  };

  const togglePause = () => {
    if (!isRunning || isGameOver) return;
    isPaused = !isPaused;
    if (!isPaused) {
      animId = requestAnimationFrame(gameLoop);
    }
    return isPaused;
  };

  const update = () => {
    // Paddle movement from keys
    if (keys.left) {
      paddle.x = Math.max(0, paddle.x - paddle.speed);
    }
    if (keys.right) {
      paddle.x = Math.min(width - paddle.w, paddle.x + paddle.speed);
    }

    // Ball on paddle before serve
    if (!isServed) {
      ball.x = paddle.x + paddle.w / 2;
      ball.y = paddle.y - ball.r - 2;
      return;
    }

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall bounce (Left/Right)
    if (ball.x - ball.r <= 0) {
      ball.x = ball.r;
      ball.dx = Math.abs(ball.dx);
      window.SoundFX?.playTap();
    } else if (ball.x + ball.r >= width) {
      ball.x = width - ball.r;
      ball.dx = -Math.abs(ball.dx);
      window.SoundFX?.playTap();
    }

    // Top wall bounce
    if (ball.y - ball.r <= 0) {
      ball.y = ball.r;
      ball.dy = Math.abs(ball.dy);
      window.SoundFX?.playTap();
    }

    // Paddle collision
    if (
      ball.y + ball.r >= paddle.y &&
      ball.y - ball.r <= paddle.y + paddle.h &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.w &&
      ball.dy > 0
    ) {
      // Calculate dynamic reflection angle based on hit location
      const hitPoint = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2); // -1 to 1
      const maxBounceAngle = Math.PI / 3; // 60 degrees max
      const bounceAngle = hitPoint * maxBounceAngle;

      ball.dx = ball.speed * Math.sin(bounceAngle);
      ball.dy = -ball.speed * Math.cos(bounceAngle);
      ball.y = paddle.y - ball.r;

      window.SoundFX?.playPop();
      window.SoundFX?.triggerHaptic(14);
    }

    // Brick collisions
    let hitBrick = false;
    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      if (b.hp <= 0) continue;

      if (
        ball.x + ball.r >= b.x &&
        ball.x - ball.r <= b.x + b.w &&
        ball.y + ball.r >= b.y &&
        ball.y - ball.r <= b.y + b.h
      ) {
        b.hp--;
        score += 15;
        onScoreUpdate(score);
        window.SoundFX?.playSpark();
        window.SoundFX?.triggerHaptic(10);

        // Determine bounce axis
        const overlapLeft = (ball.x + ball.r) - b.x;
        const overlapRight = (b.x + b.w) - (ball.x - ball.r);
        const overlapTop = (ball.y + ball.r) - b.y;
        const overlapBottom = (b.y + b.h) - (ball.y - ball.r);

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
          ball.dx = -ball.dx;
        } else {
          ball.dy = -ball.dy;
        }

        hitBrick = true;
        break; // one brick per physics step to avoid tunneling glitches
      }
    }

    // Check level cleared
    const remainingBricks = bricks.filter(b => b.hp > 0).length;
    if (remainingBricks === 0) {
      if (level < MAX_LEVELS) {
        level++;
        score += 100;
        onScoreUpdate(score);
        window.SoundFX?.playSuccess();
        window.SoundFX?.triggerHaptic([20, 30, 40]);
        reset(false); // keep score and lives for next level
      } else {
        // Complete victory!
        isWin = true;
        isRunning = false;
        window.SoundFX?.playSuccess();
        window.SoundFX?.triggerHaptic([30, 50, 40, 60]);
        const rec = window.ArcadeStorage?.recordScore('brick', score) || { isNewRecord: false, best: score };
        onWin(score, rec.isNewRecord, rec.best);
      }
      return;
    }

    // Bottom loss
    if (ball.y - ball.r > height) {
      lives--;
      onLivesUpdate(lives);
      window.SoundFX?.playTap();
      window.SoundFX?.triggerHaptic([20, 30]);

      if (lives <= 0) {
        isGameOver = true;
        isRunning = false;
        const rec = window.ArcadeStorage?.recordScore('brick', score) || { isNewRecord: false, best: score };
        onGameOver(score, rec.isNewRecord, rec.best);
      } else {
        // Reset ball to paddle
        isServed = false;
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - ball.r - 2;
        ball.dx = 0;
        ball.dy = 0;
      }
    }
  };

  const render = () => {
    if (!ctx || !canvas) return;

    // Background
    ctx.fillStyle = '#19161e';
    ctx.fillRect(0, 0, width, height);

    // Subtle arena borders
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Render Bricks
    bricks.forEach(b => {
      if (b.hp <= 0) return;
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 3);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Cracked indicator for multi-hp bricks
      if (b.hp < b.maxHp) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(b.x + b.w / 2 - 2, b.y, 4, b.h);
      }
    });

    // Render Paddle
    ctx.fillStyle = '#17d9df'; // cyan
    ctx.shadowColor = '#17d9df';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Render Ball
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Launch hint if not served
    if (!isServed && isRunning && !isPaused && !isGameOver) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'bold 13px "DM Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TAP OR PRESS SPACE TO LAUNCH BALL', width / 2, paddle.y - 18);
    }

    // Pause overlay
    if (isPaused) {
      ctx.fillStyle = 'rgba(25, 22, 30, 0.75)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px "Londrina Solid", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', width / 2, height / 2);
    }
  };

  const gameLoop = () => {
    if (!isRunning || isGameOver || isWin) return;
    if (!isPaused) {
      update();
    }
    render();
    if (isRunning && !isGameOver && !isWin) {
      animId = requestAnimationFrame(gameLoop);
    }
  };

  const movePaddleLeft = () => {
    if (!isRunning || isPaused || isGameOver) return;
    paddle.x = Math.max(0, paddle.x - paddle.speed * 2);
    if (!isServed) ball.x = paddle.x + paddle.w / 2;
  };

  const movePaddleRight = () => {
    if (!isRunning || isPaused || isGameOver) return;
    paddle.x = Math.min(width - paddle.w, paddle.x + paddle.speed * 2);
    if (!isServed) ball.x = paddle.x + paddle.w / 2;
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
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };

  return {
    init,
    reset,
    serveBall,
    movePaddleLeft,
    movePaddleRight,
    togglePause,
    stop,
    destroy,
    isRunning: () => isRunning,
    isPaused: () => isPaused,
    isGameOver: () => isGameOver,
    isWin: () => isWin
  };
})();
