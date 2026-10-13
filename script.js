(() => {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('.mobile-menu');
  const menuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  const rail = document.querySelector('[data-project-rail]');
  const previous = document.querySelector('[data-carousel-prev]');
  const next = document.querySelector('[data-carousel-next]');
  const revealItems = document.querySelectorAll('[data-reveal]');
  const cursorCards = document.querySelectorAll('[data-cursor-glow]');
  const labRail = document.querySelector('[data-lab-rail]');
  const labPrevious = document.querySelector('[data-lab-prev]');
  const labNext = document.querySelector('[data-lab-next]');
  const year = document.querySelector('[data-year]');
  const capabilityStage = document.querySelector('[data-capability-stage]');
  let lastScroll = window.scrollY;

  if (year) year.textContent = new Date().getFullYear();

  if (capabilityStage) {
    const capabilityItems = [...capabilityStage.querySelectorAll('[data-capability]')];
    const capabilityPreview = capabilityStage.querySelector('.choose-preview');
    const capabilityImage = capabilityStage.querySelector('[data-capability-image]');
    const capabilityBackImage = capabilityStage.querySelector('.choose-photo-back img');
    const capabilityLabel = capabilityStage.querySelector('[data-capability-label]');
    const chooseList = capabilityStage.querySelector('.choose-list');
    let hideTimeout = null;
    let lastZoneIndex = -1;

    // Dynamic spatial zones spread across the ENTIRE slide canvas
    // Alternate sides, heights, and angles across the full section slide
    const SLIDE_ZONES = [
      { side: 'left',  topPct: 6,  rot: -14 },  // High Far-Left (near top of slide)
      { side: 'right', topPct: 8,  rot: 13 },   // High Far-Right (near top of slide)
      { side: 'left',  topPct: 24, rot: 9 },    // Upper-Mid Left
      { side: 'right', topPct: 26, rot: -11 },  // Upper-Mid Right
      { side: 'left',  topPct: 42, rot: -8 },   // Lower-Mid Left
      { side: 'right', topPct: 44, rot: 10 },   // Lower-Mid Right
      { side: 'left',  topPct: 58, rot: 12 },   // Bottom Far-Left
      { side: 'right', topPct: 60, rot: -13 }   // Bottom Far-Right
    ];

    // Place polaroid clip dynamically anywhere on the slide WITHOUT ever overlaying the text
    const placePreviewRandomly = (itemIndex) => {
      if (!capabilityPreview) return;
      const isMobile = window.innerWidth <= 760;
      if (isMobile) {
        capabilityPreview.style.left = '';
        capabilityPreview.style.right = '';
        capabilityPreview.style.top = '';
        capabilityPreview.style.bottom = '';
        capabilityPreview.style.transform = '';
        capabilityPreview.classList.add('is-visible');
        return;
      }

      // Pick zone according to item or cycle without repeating previous spot
      let zoneIndex;
      if (typeof itemIndex === 'number' && itemIndex >= 0) {
        zoneIndex = itemIndex % SLIDE_ZONES.length;
        if (zoneIndex === lastZoneIndex) {
          zoneIndex = (zoneIndex + 1) % SLIDE_ZONES.length;
        }
      } else {
        do {
          zoneIndex = Math.floor(Math.random() * SLIDE_ZONES.length);
        } while (zoneIndex === lastZoneIndex && SLIDE_ZONES.length > 1);
      }
      lastZoneIndex = zoneIndex;

      let zone = SLIDE_ZONES[zoneIndex];

      // Measure stage and text boundaries to guarantee NO overlay
      const stageRect = capabilityStage.getBoundingClientRect();
      const listRect = chooseList ? chooseList.getBoundingClientRect() : null;
      const previewWidth = capabilityPreview.offsetWidth || 220;

      const textLeft = listRect ? (listRect.left - stageRect.left) : 0;
      const textRight = listRect ? (listRect.right - stageRect.left) : stageRect.width;
      const stageWidth = stageRect.width;

      const sideSpaceLeft = textLeft - 30;
      const sideSpaceRight = stageWidth - textRight - 30;
      const hasFlankSpace = sideSpaceLeft >= previewWidth || sideSpaceRight >= previewWidth;

      // If screen is too narrow for side flanks, place neatly below the text list
      if (!hasFlankSpace && listRect) {
        capabilityPreview.style.top = `${listRect.height + 20}px`;
        capabilityPreview.style.left = '50%';
        capabilityPreview.style.right = 'auto';
        capabilityPreview.style.transform = 'translateX(-50%)';
        capabilityPreview.classList.remove('is-popping');
        void capabilityPreview.offsetWidth;
        capabilityPreview.classList.add('is-popping');
        capabilityPreview.classList.add('is-visible');
        return;
      }

      // If selected side doesn't have enough room, switch to the other side
      let activeSide = zone.side;
      if (activeSide === 'left' && sideSpaceLeft < previewWidth) {
        activeSide = 'right';
      } else if (activeSide === 'right' && sideSpaceRight < previewWidth) {
        activeSide = 'left';
      }

      // Jitter rotation within +/- 3.5 deg
      const rotJitter = (Math.random() * 7 - 3.5).toFixed(1);
      const rot = (zone.rot + parseFloat(rotJitter)).toFixed(1);

      // Jitter vertical position within +/- 4%
      const vJitter = Math.floor(Math.random() * 8) - 4;
      const topPct = Math.min(62, Math.max(6, zone.topPct + vJitter));

      // Calculate horizontal position strictly ensuring at least 45px clearance from text!
      if (listRect && stageWidth > 0) {
        if (activeSide === 'left') {
          // Left zone: right edge must be at least 45px to the left of textLeft
          const maxAllowedLeft = Math.max(16, textLeft - previewWidth - 45);
          const minAllowedLeft = 20;
          const leftRange = Math.max(10, maxAllowedLeft - minAllowedLeft);
          const leftPos = minAllowedLeft + Math.floor(Math.random() * leftRange);
          capabilityPreview.style.left = `${Math.min(leftPos, maxAllowedLeft)}px`;
          capabilityPreview.style.right = 'auto';
        } else {
          // Right zone: left edge must be at least 45px to the right of textRight
          const stageRightDist = stageWidth - textRight;
          const maxAllowedRight = Math.max(16, stageRightDist - previewWidth - 45);
          const minAllowedRight = 20;
          const rightRange = Math.max(10, maxAllowedRight - minAllowedRight);
          const rightPos = minAllowedRight + Math.floor(Math.random() * rightRange);
          capabilityPreview.style.right = `${Math.min(rightPos, maxAllowedRight)}px`;
          capabilityPreview.style.left = 'auto';
        }
      } else {
        // Fallback percentages if rects not available
        const offsetPct = Math.floor(Math.random() * 6) + 3;
        if (activeSide === 'left') {
          capabilityPreview.style.left = `${offsetPct}%`;
          capabilityPreview.style.right = 'auto';
        } else {
          capabilityPreview.style.right = `${offsetPct}%`;
          capabilityPreview.style.left = 'auto';
        }
      }

      capabilityPreview.style.top = `${topPct}%`;
      capabilityPreview.style.bottom = 'auto';
      capabilityPreview.style.setProperty('--photo-rot', `${rot}deg`);
      capabilityPreview.style.transform = `rotate(${rot}deg)`;

      // Trigger bouncy pop-up spring animation on the clip
      capabilityPreview.classList.remove('is-popping');
      void capabilityPreview.offsetWidth; // force DOM reflow
      capabilityPreview.classList.add('is-popping');
      capabilityPreview.classList.add('is-visible');
    };

    const updatePreviewContent = (item) => {
      const image = item.dataset.image;
      if (capabilityLabel) capabilityLabel.textContent = item.dataset.label || item.textContent.trim();
      if (capabilityImage) capabilityImage.src = image;
      if (capabilityBackImage) capabilityBackImage.src = image;
    };

    const activateCapability = (item, index) => {
      capabilityItems.forEach((candidate) => {
        const active = candidate === item;
        candidate.classList.toggle('is-active', active);
        candidate.setAttribute('aria-pressed', String(active));
      });
      updatePreviewContent(item);
      placePreviewRandomly(index);
    };

    // HOVER: instantly activate capability, change text font & pop polaroid WITHOUT needing to click!
    capabilityItems.forEach((item, index) => {
      item.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        activateCapability(item, index);
      });

      item.addEventListener('pointerenter', () => {
        clearTimeout(hideTimeout);
        activateCapability(item, index);
      });

      // CLICK: also activates (great for mobile/touch or keyboards)
      item.addEventListener('click', (e) => {
        e.preventDefault();
        activateCapability(item, index);
      });
    });

    // Hide preview after cursor leaves the entire stage area
    if (capabilityStage) {
      capabilityStage.addEventListener('mouseleave', () => {
        hideTimeout = setTimeout(() => {
          if (capabilityPreview) {
            capabilityPreview.classList.remove('is-visible', 'is-popping');
          }
        }, 400);
      });
    }

    // Show initial preview for the first active item
    const firstActive = capabilityStage.querySelector('.choose-item.is-active') || capabilityItems[0];
    if (firstActive) {
      const idx = capabilityItems.indexOf(firstActive);
      updatePreviewContent(firstActive);
      placePreviewRandomly(idx >= 0 ? idx : 0);
    }
  }

  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    mobileMenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      mobileMenu.classList.toggle('is-open', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
    });

    menuLinks.forEach((link) => link.addEventListener('click', closeMenu));
  }

  window.addEventListener('scroll', () => {
    if (!header) return;
    const currentScroll = window.scrollY;
    header.classList.toggle('header-scrolled', currentScroll > 24);
    header.classList.toggle('header-hidden', currentScroll > 280 && currentScroll > lastScroll);
    lastScroll = currentScroll;
  }, { passive: true });

  const scrollRail = (direction) => {
    if (!rail) return;
    const card = rail.querySelector('.project-card');
    const amount = card ? card.getBoundingClientRect().width + 22 : rail.clientWidth * .85;
    rail.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  previous?.addEventListener('click', () => scrollRail(-1));
  next?.addEventListener('click', () => scrollRail(1));

  const scrollLabRail = (direction) => {
    if (!labRail) return;
    const card = labRail.querySelector('.lab-card');
    const gap = parseFloat(getComputedStyle(labRail).columnGap) || 18;
    const distance = card ? card.getBoundingClientRect().width + gap : labRail.clientWidth * .85;
    labRail.scrollBy({ left: distance * direction, behavior: 'smooth' });
  };

  labPrevious?.addEventListener('click', () => scrollLabRail(-1));
  labNext?.addEventListener('click', () => scrollLabRail(1));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -30px' });

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 60}ms`;
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add('revealed'));
  }

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cursorCards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;
        card.style.setProperty('--pointer-x', `${x}%`);
        card.style.setProperty('--pointer-y', `${y}%`);
        card.style.setProperty('--tilt-x', `${((x - 50) / 50) * 5}deg`);
        card.style.setProperty('--tilt-y', `${((50 - y) / 50) * 4}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--pointer-x', '50%');
        card.style.setProperty('--pointer-y', '50%');
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  document.querySelectorAll('.faq details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.faq details').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });
})();

// ============================================================
// GAME ZONE — Interactive Games (Tamada-inspired)
// ============================================================
(() => {
  // ── Tab switching ───────────────────────────────────────────
  const tabs   = document.querySelectorAll('[data-gz-tab]');
  const panels = document.querySelectorAll('[data-gz-panel]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.gzTab;
      tabs.forEach(t => { t.classList.toggle('is-active', t.dataset.gzTab === target); t.setAttribute('aria-selected', String(t.dataset.gzTab === target)); });
      panels.forEach(p => { const show = p.dataset.gzPanel === target; p.classList.toggle('is-active', show); p.hidden = !show; });
    });
  });

  // ══════════════════════════════════════════════════════════
  // GAME 1 — AI Quiz
  // ══════════════════════════════════════════════════════════
  const quizQuestions = [
    { q: 'What does "RAG" stand for in AI systems?', options: ['Random Access Generation','Retrieval-Augmented Generation','Recursive Agent Graph','Rule-Aligned Grounding'], answer: 1 },
    { q: 'Which framework is used to build cross-platform mobile apps from a single codebase?', options: ['React Native only','Swift UI','Flutter','Xamarin'], answer: 2 },
    { q: 'What is a "multi-agent system"?', options: ['One AI running multiple prompts','Several AI agents that collaborate to complete tasks','A multi-GPU training setup','Multiple LLM providers on one API'], answer: 1 },
    { q: 'In LLMs, what does "temperature" control?', options: ['Processing heat limits','Output randomness / creativity','Token count','Context window size'], answer: 1 },
    { q: 'What does "prompt engineering" primarily involve?', options: ['Writing Python scripts for AI','Crafting inputs to get desired AI outputs','Training new AI models','Building neural network architectures'], answer: 1 },
    { q: 'What is "fine-tuning" in the context of LLMs?', options: ['Adding more RAM to a server','Further training a pre-trained model on specific data','Optimising CSS for performance','Reducing API call costs'], answer: 1 },
    { q: 'Which of these is a vector database used in AI apps?', options: ['MySQL','PostgreSQL','Pinecone','MongoDB'], answer: 2 },
    { q: 'What does "agentic AI" mean?', options: ['AI that runs ads automatically','AI that takes autonomous actions to achieve goals','AI trained on agency datasets','A marketing term with no technical meaning'], answer: 1 },
  ];

  let quizState = { score: 0, idx: 0, timer: null, answered: false };
  const QUIZ_TOTAL = 5;
  const QUIZ_TIME  = 15;
  const ARC_FULL   = 163; // stroke-dasharray value

  const qStartScreen    = document.getElementById('quiz-start-screen');
  const qQuestionScreen = document.getElementById('quiz-question-screen');
  const qEndScreen      = document.getElementById('quiz-end-screen');
  const qScoreDisplay   = document.getElementById('quiz-score-display');
  const qProgressBar    = document.getElementById('quiz-progress');
  const qResult         = document.getElementById('quiz-result');
  const qTimerDisplay   = document.getElementById('quiz-timer-display');
  const qTimerArc       = document.querySelector('.gz-timer-arc');
  const qQNumber        = document.getElementById('quiz-q-number');
  const qQText          = document.getElementById('quiz-q-text');
  const qOptions        = document.getElementById('quiz-options');
  const qEndEmoji       = document.getElementById('quiz-end-emoji');
  const qEndTitle       = document.getElementById('quiz-end-title');
  const qFinalScore     = document.getElementById('quiz-final-score');

  function shuffledQuestions() {
    return [...quizQuestions].sort(() => Math.random() - .5).slice(0, QUIZ_TOTAL);
  }

  let activeQuestions = [];

  function startQuiz() {
    activeQuestions = shuffledQuestions();
    quizState = { score: 0, idx: 0, timer: null, answered: false };
    qScoreDisplay.textContent = '0 / ' + QUIZ_TOTAL;
    qProgressBar.style.width = '0%';
    qResult.hidden = true;
    qStartScreen.hidden = true;
    qEndScreen.hidden = true;
    qQuestionScreen.hidden = false;
    showQuestion();
  }

  function showQuestion() {
    const q = activeQuestions[quizState.idx];
    quizState.answered = false;
    qQNumber.textContent = 'Q' + (quizState.idx + 1) + ' / ' + QUIZ_TOTAL;
    qQText.textContent = q.q;
    qOptions.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'gz-option-btn';
      btn.type = 'button';
      btn.textContent = opt;
      btn.addEventListener('click', () => answerQuiz(i, btn, q.answer));
      qOptions.appendChild(btn);
    });
    startTimer();
  }

  function startTimer() {
    clearInterval(quizState.timer);
    let timeLeft = QUIZ_TIME;
    qTimerDisplay.textContent = timeLeft;
    if (qTimerArc) { qTimerArc.style.strokeDashoffset = '0'; qTimerArc.classList.remove('urgent'); }
    quizState.timer = setInterval(() => {
      timeLeft--;
      if (qTimerArc) {
        qTimerArc.style.strokeDashoffset = String(ARC_FULL * (1 - timeLeft / QUIZ_TIME));
        if (timeLeft <= 5) qTimerArc.classList.add('urgent');
      }
      qTimerDisplay.textContent = timeLeft;
      if (timeLeft <= 0) { clearInterval(quizState.timer); timeoutQuiz(); }
    }, 1000);
  }

  function timeoutQuiz() {
    if (quizState.answered) return;
    quizState.answered = true;
    const btns = qOptions.querySelectorAll('.gz-option-btn');
    btns.forEach((btn, i) => { if (i === activeQuestions[quizState.idx].answer) btn.classList.add('correct'); btn.disabled = true; });
    setTimeout(nextQuestion, 1200);
  }

  function answerQuiz(chosen, btn, correct) {
    if (quizState.answered) return;
    quizState.answered = true;
    clearInterval(quizState.timer);
    const btns = qOptions.querySelectorAll('.gz-option-btn');
    btns.forEach(b => b.disabled = true);
    if (chosen === correct) { btn.classList.add('correct'); quizState.score++; }
    else { btn.classList.add('wrong'); btns[correct].classList.add('correct'); }
    qScoreDisplay.textContent = quizState.score + ' / ' + QUIZ_TOTAL;
    qProgressBar.style.width = ((quizState.idx + 1) / QUIZ_TOTAL * 100) + '%';
    setTimeout(nextQuestion, 1200);
  }

  function nextQuestion() {
    quizState.idx++;
    if (quizState.idx < QUIZ_TOTAL) { showQuestion(); return; }
    qQuestionScreen.hidden = true;
    qEndScreen.hidden = false;
    qFinalScore.textContent = quizState.score;
    const passed = quizState.score >= 4;
    qEndEmoji.textContent  = passed ? '🏆' : quizState.score >= 2 ? '👍' : '😅';
    qEndTitle.textContent  = passed ? 'You crushed it!' : quizState.score >= 2 ? 'Not bad!' : 'Keep learning!';
    if (!qResult.hidden) { qResult.className = 'gz-pass-chip ' + (passed ? 'passed' : 'failed'); qResult.textContent = passed ? '✓ PASSED' : '✗ RETRY'; }
  }

  document.getElementById('quiz-start-btn')?.addEventListener('click', startQuiz);
  document.getElementById('quiz-retry-btn')?.addEventListener('click', () => {
    qEndScreen.hidden = true;
    qStartScreen.hidden = false;
  });

  // ══════════════════════════════════════════════════════════
  // GAME 2 — Speed Type
  // ══════════════════════════════════════════════════════════
  const speedWords = ['agent','flutter','llm','saas','react','api','typescript','python','prompt','neural','vector','rag','token','model','embed','deploy','inference','webhook','oauth','docker','git','devops','kotlin','swift','firebase','mongodb','redis','graphql','tailwind','vercel','nextjs','supabase','pinecone','langchain','openai','gemini'];

  let speedState = { score: 0, streak: 0, timer: null, currentWord: '', timeLeft: 30 };
  const SPEED_TIME = 30;

  const spStartScreen  = document.getElementById('speed-start-screen');
  const spPlayScreen   = document.getElementById('speed-play-screen');
  const spEndScreen    = document.getElementById('speed-end-screen');
  const spWordDisplay  = document.getElementById('speed-word-display');
  const spInput        = document.getElementById('speed-type-input');
  const spFeedback     = document.getElementById('speed-feedback');
  const spStreak       = document.getElementById('speed-streak-val');
  const spScoreDisplay = document.getElementById('speed-score-display');
  const spTimeDisplay  = document.getElementById('speed-time-display');
  const spProgress     = document.getElementById('speed-progress');
  const spFinalScore   = document.getElementById('speed-final-score');

  function pickSpeedWord() {
    const words = speedWords.filter(w => w !== speedState.currentWord);
    speedState.currentWord = words[Math.floor(Math.random() * words.length)];
    if (spWordDisplay) spWordDisplay.textContent = speedState.currentWord;
    if (spInput) { spInput.value = ''; spInput.className = 'gz-type-input'; spInput.focus(); }
    if (spFeedback) spFeedback.textContent = '';
  }

  function startSpeed() {
    speedState = { score: 0, streak: 0, timer: null, currentWord: '', timeLeft: SPEED_TIME };
    spScoreDisplay.textContent = '0 pts';
    spTimeDisplay.textContent  = SPEED_TIME + 's';
    if (spProgress) spProgress.style.width = '100%';
    spStartScreen.hidden = true;
    spEndScreen.hidden   = true;
    spPlayScreen.hidden  = false;
    pickSpeedWord();
    speedState.timer = setInterval(() => {
      speedState.timeLeft--;
      spTimeDisplay.textContent = speedState.timeLeft + 's';
      if (spProgress) spProgress.style.width = (speedState.timeLeft / SPEED_TIME * 100) + '%';
      if (speedState.timeLeft <= 0) { clearInterval(speedState.timer); endSpeed(); }
    }, 1000);
  }

  function endSpeed() {
    spPlayScreen.hidden = true;
    spEndScreen.hidden  = false;
    spFinalScore.textContent = speedState.score;
    const title = document.getElementById('speed-end-title');
    if (title) title.textContent = speedState.score >= 15 ? 'Lightning fingers! ⚡' : speedState.score >= 8 ? 'Solid speed! 💪' : "Practice makes perfect!";
  }

  if (spInput) {
    spInput.addEventListener('input', () => {
      const typed = spInput.value.toLowerCase().trim();
      if (typed === speedState.currentWord) {
        speedState.score += 1 + Math.floor(speedState.streak / 3);
        speedState.streak++;
        spScoreDisplay.textContent = speedState.score + ' pts';
        spStreak.textContent = speedState.streak;
        spInput.classList.add('gz-correct');
        if (spFeedback) spFeedback.textContent = '+' + (1 + Math.floor((speedState.streak - 1) / 3)) + ' ' + (speedState.streak > 2 ? '🔥' : '✓');
        setTimeout(pickSpeedWord, 220);
      } else if (speedState.currentWord.startsWith(typed)) {
        spInput.classList.remove('gz-wrong', 'gz-correct');
      } else {
        spInput.classList.add('gz-wrong');
      }
    });
  }

  document.getElementById('speed-start-btn')?.addEventListener('click', startSpeed);
  document.getElementById('speed-retry-btn')?.addEventListener('click', () => {
    spEndScreen.hidden  = true;
    spStartScreen.hidden = false;
  });

  // ══════════════════════════════════════════════════════════
  // GAME 3 — Skill Match (memory card game)
  // ══════════════════════════════════════════════════════════
  const matchPairs = [
    { emoji: '🤖', label: 'AI AGENT' },
    { emoji: '📱', label: 'FLUTTER' },
    { emoji: '🔗', label: 'API' },
    { emoji: '🧠', label: 'LLM' },
    { emoji: '☁️', label: 'CLOUD' },
    { emoji: '🔒', label: 'AUTH' },
    { emoji: '⚡', label: 'REALTIME' },
    { emoji: '🎨', label: 'UI/UX' },
  ];

  let matchState = { flipped: [], matched: 0, flips: 0, locked: false };
  const matchBoard     = document.getElementById('match-board');
  const matchStart     = document.getElementById('match-start-screen');
  const matchEnd       = document.getElementById('match-end-screen');
  const matchFlips     = document.getElementById('match-flips-display');
  const matchPairsDisp = document.getElementById('match-pairs-display');
  const matchFinalFlip = document.getElementById('match-final-flips');

  function buildMatchBoard() {
    if (!matchBoard) return;
    const cards = [];
    matchPairs.forEach((pair, i) => {
      cards.push({ id: i, emoji: pair.emoji, label: pair.label });
      cards.push({ id: i, emoji: pair.emoji, label: pair.label });
    });
    cards.sort(() => Math.random() - .5);
    matchBoard.innerHTML = '';
    cards.forEach((card, idx) => {
      const el = document.createElement('div');
      el.className = 'gz-match-card';
      el.setAttribute('role', 'gridcell');
      el.setAttribute('aria-label', 'Card ' + (idx + 1));
      el.innerHTML = `<div class="gz-match-card-inner"><div class="gz-card-front">?</div><div class="gz-card-back">${card.emoji}<br>${card.label}</div></div>`;
      el.dataset.cardId = card.id;
      el.addEventListener('click', () => flipCard(el));
      matchBoard.appendChild(el);
    });
  }

  function flipCard(el) {
    if (matchState.locked || el.classList.contains('is-flipped') || el.classList.contains('is-matched')) return;
    el.classList.add('is-flipped');
    matchState.flipped.push(el);
    matchState.flips++;
    if (matchFlips) matchFlips.textContent = matchState.flips + ' flips';
    if (matchState.flipped.length === 2) { matchState.locked = true; checkMatch(); }
  }

  function checkMatch() {
    const [a, b] = matchState.flipped;
    if (a.dataset.cardId === b.dataset.cardId) {
      a.classList.add('is-matched'); b.classList.add('is-matched');
      matchState.matched++;
      if (matchPairsDisp) matchPairsDisp.textContent = matchState.matched + ' / 8 pairs';
      matchState.flipped = [];
      matchState.locked  = false;
      if (matchState.matched === 8) { setTimeout(endMatch, 600); }
    } else {
      setTimeout(() => {
        a.classList.remove('is-flipped');
        b.classList.remove('is-flipped');
        matchState.flipped = [];
        matchState.locked  = false;
      }, 900);
    }
  }

  function startMatch() {
    matchState = { flipped: [], matched: 0, flips: 0, locked: false };
    if (matchFlips)     matchFlips.textContent     = '0 flips';
    if (matchPairsDisp) matchPairsDisp.textContent = '0 / 8 pairs';
    matchStart.hidden = true;
    matchEnd.hidden   = true;
    matchBoard.hidden = false;
    buildMatchBoard();
  }

  function endMatch() {
    matchBoard.hidden = true;
    matchEnd.hidden   = false;
    if (matchFinalFlip) matchFinalFlip.textContent = matchState.flips;
    const title = document.getElementById('match-end-title');
    if (title) title.textContent = matchState.flips <= 18 ? 'Perfect memory! 🎯' : matchState.flips <= 26 ? 'Great job! 🏅' : 'Nice persistence! 💪';
  }

  document.getElementById('match-start-btn')?.addEventListener('click', startMatch);
  document.getElementById('match-retry-btn')?.addEventListener('click', () => {
    matchEnd.hidden   = true;
    matchStart.hidden = false;
  });
})();


// ============================================================
// JOURNEY & PLANS INTERACTION
// ============================================================
(() => {
  // Year tab switcher
  const jTabs = document.querySelectorAll('[data-year-tab]');
  const jPanels = document.querySelectorAll('[data-year-panel]');
  jTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const year = tab.dataset.yearTab;
      jTabs.forEach((t) => {
        const active = t.dataset.yearTab === year;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      jPanels.forEach((p) => {
        const show = p.dataset.yearPanel === year;
        p.classList.toggle('is-active', show);
        p.hidden = !show;
      });
    });
  });

  // Plan button prefill message in contact form
  document.querySelectorAll('[data-plan]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const planName = btn.dataset.plan;
      const planInput = document.getElementById('plan-input');
      const msg = document.getElementById('message-input');
      if (planInput) planInput.value = planName;
      if (msg) {
        msg.value = "Hi! I would love to explore the " + planName + " plan. Here are details about our project: ";
        msg.focus();
      }
    });
  });
})();
