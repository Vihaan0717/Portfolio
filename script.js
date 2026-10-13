// ============================================================
// HAPTIC & WEB AUDIO SFX ENGINE (Zero External Assets, 100% Theme-Matched)
// ============================================================
window.SoundFX = (() => {
  let ctx = null;
  let enabled = localStorage.getItem('portfolio_sfx') !== 'false';
  let masterGain = null;

  const init = () => {
    if (!ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        ctx = new AudioContextClass();
        masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.14, ctx.currentTime);
        masterGain.connect(ctx.destination);
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  };

  const isEnabled = () => enabled;

  const setEnabled = (val) => {
    enabled = Boolean(val);
    localStorage.setItem('portfolio_sfx', enabled ? 'true' : 'false');
    updateToggles();
  };

  const toggle = () => {
    init();
    setEnabled(!enabled);
    if (enabled) {
      playPop();
      triggerHaptic(18);
    }
    return enabled;
  };

  const triggerHaptic = (pattern) => {
    if (!enabled) return;
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  };

  // 1. Crisp tactile button/link tap
  const playTap = () => {
    if (!enabled) return;
    init();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.038);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  };

  // 2. Playful bubbly pop for badges, stickers, and cards
  const playPop = () => {
    if (!enabled) return;
    init();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.05);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.065);
    } catch (e) {}
  };

  // 3. Delicate harmonic shimmer chime for colored texts & sparks
  let lastSparkTime = 0;
  const playSpark = () => {
    if (!enabled) return;
    init();
    if (!ctx) return;
    const nowMs = performance.now();
    if (nowMs - lastSparkTime < 80) return;
    lastSparkTime = nowMs;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      const base = 1100 + Math.random() * 500;
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(base, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(base * 1.5, now);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.08);
      osc2.stop(now + 0.08);
    } catch (e) {}
  };

  // 4. Clean UI tab chirp for switcher & controls
  const playTab = () => {
    if (!enabled) return;
    init();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.setValueAtTime(740, now + 0.024);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.055);
    } catch (e) {}
  };

  // 5. Joyful fanfare chime for game win / correct answers
  const playSuccess = () => {
    if (!enabled) return;
    init();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const noteStart = ctx.currentTime + idx * 0.045;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.2, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.12);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(noteStart);
        osc.stop(noteStart + 0.13);
      });
    } catch (e) {}
  };

  const updateToggles = () => {
    document.querySelectorAll('[data-sound-toggle]').forEach((btn) => {
      btn.classList.toggle('is-muted', !enabled);
      btn.setAttribute('aria-pressed', String(enabled));
      btn.title = enabled ? 'Sound & Haptics: ON (click to mute)' : 'Sound & Haptics: MUTED (click to enable)';
    });
    document.querySelectorAll('[data-sound-toggle-mini]').forEach((btn) => {
      btn.textContent = enabled ? 'SFX ON' : 'SFX OFF';
      btn.classList.toggle('is-muted', !enabled);
    });
  };

  // Unlock on first user touch/click/key
  const unlock = () => {
    init();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });

  return {
    init,
    isEnabled,
    setEnabled,
    toggle,
    triggerHaptic,
    playTap,
    playPop,
    playSpark,
    playTab,
    playSuccess,
    updateToggles,
  };
})();

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

  // Initialize SoundFX toggle buttons
  SoundFX.updateToggles();
  document.querySelectorAll('[data-sound-toggle], [data-sound-toggle-mini]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundFX.toggle();
    });
  });

  // Global tactile feedback for user clicks
  document.addEventListener('click', (e) => {
    const el = e.target.closest('button, a, summary, [data-badge-pop], .round-control, .choose-item, .gz-tab, .mini-product');
    if (!el) return;
    if (el.matches('[data-sound-toggle], [data-sound-toggle-mini]')) return;

    if (el.matches('[data-badge-pop], .orbit, .hero-sticker')) {
      SoundFX.playPop();
      SoundFX.triggerHaptic(20);
    } else if (el.matches('.choose-item, .gz-tab, .round-control, [data-capability], .journey-tab')) {
      SoundFX.playTab();
      SoundFX.triggerHaptic(12);
    } else {
      SoundFX.playTap();
      SoundFX.triggerHaptic(8);
    }
  });

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

    // ============================================================
    // SCROLL-DRIVEN PARALLAX FOR CHOOSE ITEMS (Tamada Media Pattern)
    // Alternating horizontal shift: Even rows move right-to-left,
    // Odd rows move left-to-right based on scroll progress.
    // Automatically reverses when scrolling UP!
    // ============================================================
    const chooseSection = document.getElementById('choose-build');
    if (chooseSection && capabilityItems.length) {
      let isParallaxTicking = false;

      const updateChooseScrollParallax = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const rect = chooseSection.getBoundingClientRect();
        const vh = window.innerHeight;

        // Skip calculations if well outside viewport
        if (rect.bottom < -120 || rect.top > vh + 120) return;

        // Progress from 0 (section top hits viewport bottom) to 1 (section bottom exits viewport top)
        const totalTravel = vh + rect.height;
        const currentTravel = vh - rect.top;
        const progress = Math.max(0, Math.min(1, currentTravel / totalTravel));

        // factor ranges from -1 (entering bottom) to 0 (centered) to +1 (exiting top)
        const factor = (progress - 0.5) * 2;

        const isMobile = window.innerWidth <= 768;
        // Max horizontal displacement (2.6vw on desktop, 1.4vw on mobile) matching Tamada's 2.4vw
        const maxDisplacementVw = isMobile ? 1.4 : 2.6;

        capabilityItems.forEach((item, index) => {
          // Alternating directions matching Tamada:
          // Even rows (0, 2, 4, 6): start shifted right (+max) -> glide left (-max) as you scroll down
          // Odd rows (1, 3, 5, 7): start shifted left (-max) -> glide right (+max) as you scroll down
          // Scrolling UP runs in exact reverse, sliding adjacent rows smoothly past each other!
          const direction = (index % 2 === 0) ? -1 : 1;
          const offsetVw = (direction * factor * maxDisplacementVw).toFixed(2);
          item.style.setProperty('--scroll-x', `${offsetVw}vw`);
        });
      };

      const onChooseScroll = () => {
        if (!isParallaxTicking) {
          isParallaxTicking = true;
          requestAnimationFrame(() => {
            updateChooseScrollParallax();
            isParallaxTicking = false;
          });
        }
      };

      window.addEventListener('scroll', onChooseScroll, { passive: true });
      window.addEventListener('resize', onChooseScroll, { passive: true });
      // Run once immediately on load
      updateChooseScrollParallax();
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
    const isHeading = (el) => el.matches('.section-heading, .split-heading, .gz-header, .choose-heading, .hero-copy, .approach-copy, .contact-inner') || el.closest('.faq-layout > div:first-child');

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          if (!isHeading(entry.target)) {
            observer.unobserve(entry.target);
          }
        } else if (isHeading(entry.target)) {
          // If scrolled away from this slide, reset so heading scrolls up again when returning
          const rect = entry.boundingClientRect;
          if (rect.top > window.innerHeight * 1.15 || rect.bottom < -120) {
            entry.target.classList.remove('revealed');
          }
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -30px' });

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 60}ms`;
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add('revealed'));
  }

  // Smooth re-trigger of heading scroll-up entrance on navigation link clicks
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', () => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href === '#top') return;
      const target = document.querySelector(href);
      if (target) {
        const heading = target.querySelector('.section-heading, .split-heading, .gz-header, .choose-heading, .approach-copy, .faq-layout > div:first-child, .contact-inner, [data-reveal]');
        if (heading) {
          heading.classList.remove('revealed');
          setTimeout(() => {
            heading.classList.add('revealed');
          }, 80);
        }
      }
    });
  });

  // Dynamic cursor reactivity & micro-sparks for colored accent texts in headings
  const accentTexts = document.querySelectorAll(
    '.hero-copy h1 span, .section-heading h2 span, .approach h2 span, .process h2 span, .proof h2 span, .faq h2 span, .contact h2 span, .gz-header h2 em, .shimmer-text'
  );

  const sparkColors = ['#ff5722', '#c7f52c', '#ffd500', '#17d9df', '#fd48f2', '#681149'];
  const sparkSymbols = ['✦', '★', '✳', '·', '✧'];
  let lastSparkTime = 0;

  const spawnSpark = (x, y) => {
    const spark = document.createElement('span');
    spark.className = 'text-spark';
    spark.textContent = sparkSymbols[Math.floor(Math.random() * sparkSymbols.length)];
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
    spark.style.fontSize = `${Math.floor(Math.random() * 11 + 14)}px`;
    spark.style.setProperty('--spark-vx', `${(Math.random() - 0.5) * 48}px`);
    spark.style.setProperty('--spark-vy', `${-Math.random() * 38 - 18}px`);
    spark.style.setProperty('--spark-rot', `${(Math.random() - 0.5) * 80}deg`);
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 650);
  };

  accentTexts.forEach((el) => {
    el.classList.add('heading-accent');

    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) - 0.5;
      const normY = ((e.clientY - rect.top) / rect.height) - 0.5;

      el.style.setProperty('--accent-tx', `${normX * 16}px`);
      el.style.setProperty('--accent-ty', `${normY * 10}px`);
      el.style.setProperty('--accent-rot', `${normX * 12}deg`);
      el.style.setProperty('--accent-shadow-x', `${-normX * 14}px`);
      el.style.setProperty('--accent-shadow-y', `${-normY * 10 + 8}px`);

      const now = performance.now();
      if (now - lastSparkTime > 110) {
        lastSparkTime = now;
        spawnSpark(e.clientX, e.clientY);
        window.SoundFX?.playSpark();
        window.SoundFX?.triggerHaptic(6);
      }
    });

    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--accent-tx', '0px');
      el.style.setProperty('--accent-ty', '0px');
      el.style.setProperty('--accent-rot', '0deg');
      el.style.setProperty('--accent-shadow-x', '0px');
      el.style.setProperty('--accent-shadow-y', '8px');
    });

    el.addEventListener('click', (e) => {
      window.SoundFX?.playPop();
      window.SoundFX?.triggerHaptic(20);
      for (let i = 0; i < 4; i++) {
        spawnSpark(e.clientX + (Math.random() - 0.5) * 24, e.clientY + (Math.random() - 0.5) * 24);
      }
    });
  });

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
    if (chosen === correct) {
      btn.classList.add('correct');
      quizState.score++;
      window.SoundFX?.playSuccess();
      window.SoundFX?.triggerHaptic([15, 30, 25]);
    } else {
      btn.classList.add('wrong');
      btns[correct].classList.add('correct');
      window.SoundFX?.playTap();
      window.SoundFX?.triggerHaptic(20);
    }
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
    if (passed) {
      window.SoundFX?.playSuccess();
      window.SoundFX?.triggerHaptic([20, 35, 30, 45]);
    }
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
    window.SoundFX?.playSuccess();
    window.SoundFX?.triggerHaptic([20, 35, 30, 45]);
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
        window.SoundFX?.playPop();
        window.SoundFX?.triggerHaptic(14);
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
    window.SoundFX?.playTap();
    window.SoundFX?.triggerHaptic(8);
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
      window.SoundFX?.playSuccess();
      window.SoundFX?.triggerHaptic([15, 35, 25]);
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

  // Hero interactive badges with responsive touch (LLM, SHIP IT, IDEA -> LIVE)
  const heroBadges = document.querySelectorAll('[data-badge-pop]');
  heroBadges.forEach((badge) => {
    badge.addEventListener('click', () => {
      badge.classList.remove('is-popped');
      void badge.offsetWidth;
      badge.classList.add('is-popped');

      // For SHIP IT badge: celebratory toggle
      const shipText = badge.querySelector('.orbit-badge-text');
      const shipIcon = badge.querySelector('.orbit-badge-icon');
      if (shipText && !badge._isShipped) {
        badge._isShipped = true;
        const prevText = shipText.textContent;
        shipText.textContent = 'SHIPPED!';
        if (shipIcon) shipIcon.textContent = '⚡';
        badge.style.background = '#69f0ae';
        badge.style.boxShadow = '6px 9px 0 var(--ink), 0 0 30px rgba(105, 240, 174, 0.7)';
        setTimeout(() => {
          shipText.textContent = prevText;
          if (shipIcon) shipIcon.textContent = '🚀';
          badge.style.background = '';
          badge.style.boxShadow = '';
          badge._isShipped = false;
        }, 1800);
      }

      // Spawn colorful floating reaction particles
      const rect = badge.getBoundingClientRect();
      const spark = document.createElement('span');
      spark.className = 'badge-click-spark';
      spark.textContent = badge.classList.contains('orbit-one') ? '⚡' : badge.classList.contains('orbit-two') ? '🚀' : '✨';
      spark.style.cssText = `position: fixed; left: ${rect.left + rect.width / 2}px; top: ${rect.top}px; pointer-events: none; z-index: 9999; font-size: 26px; animation: sparkFloat 0.8s cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.25));`;
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 800);
    });
  });

  // === HERO 3-CARD STAGE: PEEP ENTRANCE ON RELOAD & OPEN/CLOSE ON CURSOR HOVER ===
  const heroStage = document.querySelector('.hero-stage');
  if (heroStage) {
    const cardCenter = heroStage.querySelector('.product-center');
    const cardLeft = heroStage.querySelector('.product-left');
    const cardRight = heroStage.querySelector('.product-right');

    // On page load or reload: clean up is-popping class once entrance peep finishes so transforms are free
    let popTimer = setTimeout(() => {
      heroStage.classList.remove('is-popping');
    }, 1500);

    let isTracking = false;
    let targetOpen = 0; // 0 = closed by (tucked under), 1 = open up
    let currentOpen = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    const renderCardTransforms = () => {
      // Fluid linear interpolation for open/close state and cursor tracking
      currentOpen += (targetOpen - currentOpen) * 0.12;
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;

      // When open, side cards fan out to ±220px from under the phone. When closed, tuck in to ±42px.
      const leftX = -(42 + currentOpen * 178) + currentX * 18;
      const leftY = 14 + currentOpen * 10 + currentY * 12;
      const leftRot = -3.5 - currentOpen * 6.5 + currentX * 3.5;
      const leftScale = 0.92 + currentOpen * 0.08;

      const rightX = (42 + currentOpen * 178) + currentX * 18;
      const rightY = 20 + currentOpen * 14 + currentY * 12;
      const rightRot = 3.5 + currentOpen * 6.5 + currentX * 3.5;
      const rightScale = 0.92 + currentOpen * 0.08;

      const centerY = -currentOpen * 14 + currentY * 14;
      const centerRot = currentX * 3.5;

      if (cardCenter && !cardCenter.matches(':hover')) {
        cardCenter.style.transform = `translateX(calc(-50% + ${currentX * 14}px)) translateY(${centerY}px) rotate(${centerRot}deg) scale(${1 + currentOpen * 0.02})`;
      }

      if (cardLeft && !cardLeft.matches(':hover')) {
        cardLeft.style.transform = `translateX(-50%) translateX(${leftX}px) translateY(${leftY}px) rotate(${leftRot}deg) scale(${leftScale})`;
        cardLeft.style.opacity = `${0.94 + currentOpen * 0.06}`;
      }

      if (cardRight && !cardRight.matches(':hover')) {
        cardRight.style.transform = `translateX(-50%) translateX(${rightX}px) translateY(${rightY}px) rotate(${rightRot}deg) scale(${rightScale})`;
        cardRight.style.opacity = `${0.94 + currentOpen * 0.06}`;
      }

      const isStillAnimating = isTracking ||
        Math.abs(targetOpen - currentOpen) > 0.003 ||
        Math.abs(targetX - currentX) > 0.003 ||
        Math.abs(targetY - currentY) > 0.003;

      if (isStillAnimating) {
        rafId = requestAnimationFrame(renderCardTransforms);
      } else {
        rafId = null;
        // If fully closed and not tracking, clear inline styles so CSS handles resting state cleanly
        if (!isTracking && targetOpen === 0 && currentOpen < 0.01) {
          if (cardCenter) cardCenter.style.transform = '';
          if (cardLeft) { cardLeft.style.transform = ''; cardLeft.style.opacity = ''; }
          if (cardRight) { cardRight.style.transform = ''; cardRight.style.opacity = ''; }
        }
      }
    };

    const handleStagePointerEnter = () => {
      clearTimeout(popTimer);
      heroStage.classList.remove('is-popping');
      heroStage.classList.add('is-tracking');
      targetOpen = 1; // Open up sides from under the main one
      if (!rafId) rafId = requestAnimationFrame(renderCardTransforms);
    };

    const handleStagePointerMove = (e) => {
      clearTimeout(popTimer);
      heroStage.classList.remove('is-popping');
      heroStage.classList.add('is-tracking');
      targetOpen = 1;

      const rect = heroStage.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetX = Math.max(-1.1, Math.min(1.1, targetX));
      targetY = Math.max(-1.1, Math.min(1.1, targetY));

      if (!isTracking) {
        isTracking = true;
      }
      if (!rafId) rafId = requestAnimationFrame(renderCardTransforms);
    };

    const handleStagePointerLeave = () => {
      isTracking = false;
      targetOpen = 0; // Close by (tuck back under the middle one)
      targetX = 0;
      targetY = 0;
      heroStage.classList.remove('is-tracking');
      if (!rafId) rafId = requestAnimationFrame(renderCardTransforms);
    };

    heroStage.addEventListener('mouseenter', handleStagePointerEnter);
    heroStage.addEventListener('pointerenter', handleStagePointerEnter);
    heroStage.addEventListener('mousemove', handleStagePointerMove);
    heroStage.addEventListener('pointermove', handleStagePointerMove);
    heroStage.addEventListener('mouseleave', handleStagePointerLeave);
    heroStage.addEventListener('pointerleave', handleStagePointerLeave);

    // Replay entrance peep on page reload / navigation
    window.addEventListener('pageshow', () => {
      heroStage.classList.remove('is-popping');
      void heroStage.offsetWidth;
      heroStage.classList.add('is-popping');
      targetOpen = 0;
      currentOpen = 0;
      clearTimeout(popTimer);
      popTimer = setTimeout(() => {
        heroStage.classList.remove('is-popping');
      }, 1500);
    });
  }
})();
