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
    const capabilityImage = capabilityStage.querySelector('[data-capability-image]');
    const capabilityBackImage = capabilityStage.querySelector('.choose-photo-back img');
    const capabilityLabel = capabilityStage.querySelector('[data-capability-label]');
    const activateCapability = (item) => {
      if (item.classList.contains('is-active')) return;
      capabilityItems.forEach((candidate) => {
        const active = candidate === item;
        candidate.classList.toggle('is-active', active);
        candidate.setAttribute('aria-pressed', String(active));
      });
      const image = item.dataset.image;
      capabilityStage.classList.add('is-changing');
      if (capabilityLabel) capabilityLabel.textContent = item.dataset.label || item.textContent.trim();
      if (capabilityImage) {
        capabilityImage.onload = () => capabilityStage.classList.remove('is-changing');
        capabilityImage.src = image;
      }
      if (capabilityBackImage) capabilityBackImage.src = image;
      window.setTimeout(() => capabilityStage.classList.remove('is-changing'), 500);
    };
    capabilityItems.forEach((item) => {
      item.addEventListener('click', () => activateCapability(item));
      item.addEventListener('pointerenter', () => {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) activateCapability(item);
      });
      item.addEventListener('focus', () => activateCapability(item));
    });
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

(() => {
  const revealItems = document.querySelectorAll('[data-model-reveal]');
  const tiltDeck = document.querySelector('[data-tilt-deck]');
  const deckCards = tiltDeck ? [...tiltDeck.querySelectorAll('[data-tilt-card]')] : [];
  const swipeRail = document.querySelector('[data-swipe-rail]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: .14, rootMargin: '0px 0px -25px' });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
      observer.observe(item);
    });
  } else revealItems.forEach((item) => item.classList.add('revealed'));

  const updateDeck = (activeIndex) => {
    const count = deckCards.length;
    if (!count) return;
    deckCards.forEach((card, index) => {
      const relative = (index - activeIndex + count) % count;
      card.classList.toggle('is-front', relative === 0);
      card.classList.toggle('is-left', relative === 1);
      card.classList.toggle('is-right', relative === 2);
      card.style.zIndex = String(relative === 0 ? 4 : relative === 1 ? 2 : 1);
      card.style.transform = relative === 0
        ? 'translateX(-50%) rotateY(var(--deck-ry,0deg)) rotateX(var(--deck-rx,0deg))'
        : relative === 1
          ? 'translateX(-82%) rotate(-9deg) scale(.88)'
          : 'translateX(-18%) rotate(8deg) scale(.88)';
      if (relative !== 0) {
        card.style.setProperty('--deck-ry', '0deg');
        card.style.setProperty('--deck-rx', '0deg');
      }
    });
    tiltDeck.dataset.active = String(activeIndex);
  };
  let activeDeckIndex = Math.max(deckCards.findIndex((card) => card.classList.contains('deck-card-main')), 0);
  updateDeck(activeDeckIndex);

  document.querySelector('[data-deck-prev]')?.addEventListener('click', () => {
    activeDeckIndex = (activeDeckIndex - 1 + deckCards.length) % deckCards.length;
    updateDeck(activeDeckIndex);
  });
  document.querySelector('[data-deck-next]')?.addEventListener('click', () => {
    activeDeckIndex = (activeDeckIndex + 1) % deckCards.length;
    updateDeck(activeDeckIndex);
  });

  if (tiltDeck) {
    let dragStartX = null;
    tiltDeck.addEventListener('pointerdown', (event) => { dragStartX = event.clientX; });
    tiltDeck.addEventListener('pointerup', (event) => {
      if (dragStartX === null || Math.abs(event.clientX - dragStartX) < 45) { dragStartX = null; return; }
      activeDeckIndex = (activeDeckIndex + (event.clientX < dragStartX ? 1 : -1) + deckCards.length) % deckCards.length;
      dragStartX = null;
      updateDeck(activeDeckIndex);
    });
    tiltDeck.addEventListener('pointercancel', () => { dragStartX = null; });
  }

  if (tiltDeck && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    tiltDeck.addEventListener('pointermove', (event) => {
      const activeCard = deckCards.find((card) => card.classList.contains('is-front'));
      if (!activeCard) return;
      const bounds = activeCard.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      activeCard.style.setProperty('--deck-ry', `${(x - .5) * 13}deg`);
      activeCard.style.setProperty('--deck-rx', `${(.5 - y) * 9}deg`);
      activeCard.style.setProperty('--spot-x', `${x * 100}%`);
      activeCard.style.setProperty('--spot-y', `${y * 100}%`);
    });
    tiltDeck.addEventListener('pointerleave', () => {
      const activeCard = deckCards.find((card) => card.classList.contains('is-front'));
      if (!activeCard) return;
      activeCard.style.setProperty('--deck-ry', '0deg');
      activeCard.style.setProperty('--deck-rx', '0deg');
      activeCard.style.setProperty('--spot-x', '50%');
      activeCard.style.setProperty('--spot-y', '50%');
    });
  }

  document.querySelector('[data-swipe-prev]')?.addEventListener('click', () => {
    const card = swipeRail?.querySelector('.swipe-card');
    swipeRail?.scrollBy({ left: -(card?.getBoundingClientRect().width || 210) - 13, behavior: 'smooth' });
  });
  document.querySelector('[data-swipe-next]')?.addEventListener('click', () => {
    const card = swipeRail?.querySelector('.swipe-card');
    swipeRail?.scrollBy({ left: (card?.getBoundingClientRect().width || 210) + 13, behavior: 'smooth' });
  });

  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('[data-spotlight]').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
        card.style.setProperty('--spot-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
      });
    });
  }
})();

// LinkedIn Timelapse Player
(() => {
  const slides = [...document.querySelectorAll('[data-timelapse-slide]')];
  const pills = [...document.querySelectorAll('[data-timelapse-pill]')];
  const playBtn = document.querySelector('[data-timelapse-play]');
  const prevBtn = document.querySelector('[data-timelapse-prev]');
  const nextBtn = document.querySelector('[data-timelapse-next]');
  if (!slides.length) return;

  let currentIndex = 0;
  let isPlaying = false;
  let timer = null;

  const showSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });
    pills.forEach((pill, i) => {
      pill.classList.toggle('active', i === currentIndex);
    });
  };

  const play = () => {
    isPlaying = true;
    if (playBtn) playBtn.textContent = '⏸ Pause';
    timer = setInterval(() => {
      showSlide(currentIndex + 1);
    }, 3800);
  };

  const pause = () => {
    isPlaying = false;
    if (playBtn) playBtn.textContent = '▶ Play Timelapse';
    if (timer) clearInterval(timer);
    timer = null;
  };

  playBtn?.addEventListener('click', () => {
    if (isPlaying) pause();
    else play();
  });

  prevBtn?.addEventListener('click', () => {
    pause();
    showSlide(currentIndex - 1);
  });

  nextBtn?.addEventListener('click', () => {
    pause();
    showSlide(currentIndex + 1);
  });

  pills.forEach((pill, i) => {
    pill.addEventListener('click', () => {
      pause();
      showSlide(i);
    });
  });

  showSlide(0);
})();

