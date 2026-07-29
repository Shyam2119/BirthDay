/* =============================================
   SRAVANII'S BIRTHDAY - script.js
============================================= */

// ============================================================
// 📸 PASTE SRAVANII'S GOOGLE DRIVE PHOTO LINKS HERE
// Format: Right-click photo in Drive → "Get link" → paste below
// Example: 'https://drive.google.com/file/d/1aBcD.../view'
// ============================================================
const PHOTO_CONFIG = [
  { url: 'https://drive.google.com/file/d/10Bcl138d5Q9NbgkzQpOZYyfmQStBEVAZ/view?usp=drivesdk', caption: 'Sunshine Girl ☀️' },
  { url: 'https://drive.google.com/file/d/1HEbNNOKfchne2ni7NVu3fXbQf9rPCwtC/view?usp=drivesdk', caption: 'Simply Stunning ✨' },
  { url: 'https://drive.google.com/file/d/1wd5OysXqC8mXjcGUyIIFLAMc3aC1OeD3/view?usp=drivesdk', caption: 'Forever Glowing 🌸' },
  { url: 'https://drive.google.com/file/d/1hX0TrR9jxj6dXcusLBYN8P4X9daeY9J-/view?usp=drivesdk', caption: 'Pure Joy 🌟' },
  { url: 'https://drive.google.com/file/d/1Pkl14AutCTr-CMbhx7wc5U-prrgzLAzv/view?usp=drivesdk', caption: 'Radiant Soul 💫' },
  { url: 'https://drive.google.com/file/d/19zhu2X31-4XyLnJr6_R7s-5OYeeGCZsj/view?usp=drivesdk', caption: 'Birthday Queen 👑' },
];

function getDriveId(link) {
  if (!link) return '';
  const m = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  const m2 = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  return '';
}

// Converts Google Drive share URL to direct image URL
function getDriveUrl(link) {
  if (!link) return '';
  const id = getDriveId(link);
  return id ? `https://lh3.googleusercontent.com/d/${id}` : link;
}

// ===== STATE =====
let currentSlide = 1;
const totalSlides = 7;
let candlesBlown = 0;
const totalCandles = 5;
let balloonsPopped = 0;
const totalBalloons = 4;
let cardsFlipped = 0;       // single declaration (was duplicated — bug fix)
let musicPlaying = false;
let bgBalloonInterval = null;
let confettiInterval = null;
let ageAnimDone = false;
let ageSpinInterval = null;
let ageSpinTimer = null;
let cakeTimers = [];
let cakeBlowing = false;
let balloonTimers = [];
let flipContinueTimer = null;
let carouselSeenTimer = null;
let envelopeTimers = [];
let envelopeArmed = true;
let finaleTimers = [];
let fireworkInterval = null;
let lastReplayAt = 0;
let navigationLockedUntil = 0;

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  createStars(reduceMotion ? 12 : 28);
  if (!reduceMotion) {
    // Delay ambient effects so first paint stays snappy
    setTimeout(() => {
      createBgBalloons();
      startConfetti();
    }, 900);
  }
  showSlide(1);
  setupAutoMusic();
  setupEnvelopeInteraction();
  setupReplayButton();
  prefetchPhotos();
  setupVisibilityPause();
});

function prefetchPhotos() {
  PHOTO_CONFIG.forEach((_, i) => {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.src = getPhotoUrl(i);
  });
}

function setupVisibilityPause() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (confettiInterval) { clearInterval(confettiInterval); confettiInterval = null; }
      if (bgBalloonInterval) { clearInterval(bgBalloonInterval); bgBalloonInterval = null; }
      stopCarouselAuto();
    } else {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (!confettiInterval) startConfetti();
        if (!bgBalloonInterval) createBgBalloons();
      }
      if (currentSlide === 5) startCarouselAuto();
    }
  });
}

function revealContinueBtn(id) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.classList.remove('hidden');
  btn.classList.remove('btn-enter');
  void btn.offsetHeight;
  btn.classList.add('btn-enter');
  // Ensure the button is visible on mobile (often below the fold)
  requestAnimationFrame(() => {
    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function setupEnvelopeInteraction() {
  // Event delegation on slide-1 so handlers survive DOM resets
  const slide = document.getElementById('slide-1');
  if (!slide || slide.dataset.envBound === '1') return;
  slide.dataset.envBound = '1';

  const tryOpen = (e) => {
    const env = document.getElementById('envelope');
    if (!env || env.classList.contains('opened') || env.classList.contains('hidden')) return;
    if (env.style.display === 'none') return;
    if (!envelopeArmed) return;
    if (e.target !== env && !env.contains(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    openEnvelope();
  };

  slide.addEventListener('click', tryOpen);
  slide.addEventListener('touchend', tryOpen, { passive: false });
}

function setupReplayButton() {
  const btn = document.getElementById('replay-btn');
  if (!btn) return;

  const onReplay = (e) => {
    // Cancel the rest of this gesture so it cannot "click through" onto page 1
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - lastReplayAt < 600) return;
    lastReplayAt = now;

    // Defer DOM swap until after the current touch/click fully finishes
    setTimeout(() => replay(), 0);
  };

  btn.addEventListener('click', onReplay);
  btn.addEventListener('touchend', onReplay, { passive: false });
}

function clearFinaleEffects() {
  if (fireworkInterval) {
    clearInterval(fireworkInterval);
    fireworkInterval = null;
  }
  finaleTimers.forEach(t => clearTimeout(t));
  finaleTimers = [];
  document.querySelectorAll('.finale-spark').forEach(s => s.remove());
}

// Auto-start music on first interaction
function setupAutoMusic() {
  let started = false;
  const tryStart = () => {
    if (started || musicPlaying) return;
    started = true;
    startMusic({
      onSuccess: () => {
        showMusicToast();
        document.removeEventListener('touchend', tryStart);
        document.removeEventListener('click', tryStart);
      },
      onFail: () => { started = false; }
    });
  };
  document.addEventListener('touchend', tryStart, { passive: true });
  document.addEventListener('click', tryStart);
}

function showMusicToast() {
  const t = document.createElement('div');
  t.textContent = '🎵 Playing music for you...';
  t.style.cssText = `
    position:fixed; top:70px; right:16px;
    background:rgba(255,107,157,0.9);
    color:white; padding:8px 16px; border-radius:30px;
    font-family:'Poppins',sans-serif; font-size:0.78rem; font-weight:600;
    z-index:99999; backdrop-filter:blur(10px);
    animation: fadeIn 0.3s ease;
    box-shadow: 0 4px 20px rgba(255,107,157,0.4);
  `;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.5s'; }, 2000);
  setTimeout(() => t.remove(), 2600);
}


function clearAgeTimers() {
  if (ageSpinInterval) { clearInterval(ageSpinInterval); ageSpinInterval = null; }
  if (ageSpinTimer) { clearTimeout(ageSpinTimer); ageSpinTimer = null; }
  const t = document.getElementById('digit-tens');
  const o = document.getElementById('digit-ones');
  if (t) t.classList.remove('spinning');
  if (o) o.classList.remove('spinning');
}

function clearCakeTimers() {
  cakeTimers.forEach(t => clearTimeout(t));
  cakeTimers = [];
  cakeBlowing = false;
}

function clearBalloonTimers() {
  balloonTimers.forEach(t => clearTimeout(t));
  balloonTimers = [];
  if (flipContinueTimer) { clearTimeout(flipContinueTimer); flipContinueTimer = null; }
}

function clearCarouselSeenTimer() {
  if (carouselSeenTimer) { clearTimeout(carouselSeenTimer); carouselSeenTimer = null; }
}

function closeLightboxIfOpen() {
  const lb = document.getElementById('carousel-lightbox');
  if (lb) lb.classList.add('hidden');
  document.body.style.overflow = '';
}

// ===== SLIDE NAVIGATION =====
function showSlide(n) {
  const prev = currentSlide;

  // Clean up slide-specific timers/effects when leaving
  if (prev === 2 && n !== 2) clearAgeTimers();
  if (prev === 3 && n !== 3) clearCakeTimers();
  if (prev === 4 && n !== 4) {
    clearBalloonTimers();
    if (specialMsgTimer) { clearTimeout(specialMsgTimer); specialMsgTimer = null; }
  }
  if (prev === 5 && n !== 5) {
    stopCarouselAuto();
    clearCarouselSeenTimer();
    closeLightboxIfOpen();
  }
  if (prev === 6 && n !== 6) {
    letterTimers.forEach(t => clearTimeout(t));
    letterTimers = [];
  }
  if (prev === 7 && n !== 7) clearFinaleEffects();

  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active', 'exit'));
  document.querySelectorAll('.dot').forEach((d, i) => {
    const on = i + 1 === n;
    d.classList.toggle('active', on);
    if (on) d.setAttribute('aria-current', 'true');
    else d.removeAttribute('aria-current');
  });

  currentSlide = n;
  const slide = document.getElementById(`slide-${n}`);
  if (slide) {
    slide.classList.add('active');
    onSlideEnter(n);
  }
}

function nextSlide() {
  if (Date.now() < navigationLockedUntil) return;
  if (currentSlide < totalSlides) showSlide(currentSlide + 1);
}

function goToSlide(n) {
  if (Date.now() < navigationLockedUntil) return;
  showSlide(n);
}

function clearEnvelopeTimers() {
  envelopeTimers.forEach(t => clearTimeout(t));
  envelopeTimers = [];
}

function resetEnvelopeUI(options = {}) {
  const { skipToWelcome = false } = options;
  clearEnvelopeTimers();
  envelopeArmed = false;

  const env = document.getElementById('envelope');
  const welcomeReveal = document.getElementById('welcome-reveal');

  if (skipToWelcome) {
    // After Replay: skip the envelope (mobile ghost-click leaves it unresponsive).
    // Show welcome + Let's Begin so page 1 is immediately tappable.
    if (env) {
      env.className = 'envelope opened hidden';
      env.style.display = 'none';
    }
    if (welcomeReveal) {
      welcomeReveal.className = 'welcome-text';
      welcomeReveal.removeAttribute('style');
      welcomeReveal.style.animation = 'fadeInUp 0.6s ease';
    }
    envelopeArmed = true;
    return;
  }

  // First-visit / pristine envelope
  if (env) {
    env.className = 'envelope';
    env.removeAttribute('style');
  }
  if (welcomeReveal) {
    welcomeReveal.className = 'welcome-text hidden';
    welcomeReveal.removeAttribute('style');
  }

  envelopeTimers.push(setTimeout(() => {
    envelopeArmed = true;
  }, 400));
}

function replay() {
  // Stop all running timers
  stopCarouselAuto();
  clearEnvelopeTimers();
  clearFinaleEffects();
  clearAgeTimers();
  clearCakeTimers();
  clearBalloonTimers();
  clearCarouselSeenTimer();
  closeLightboxIfOpen();
  if (specialMsgTimer) { clearTimeout(specialMsgTimer); specialMsgTimer = null; }
  letterTimers.forEach(t => clearTimeout(t));
  letterTimers = [];

  // Block ghost-clicks from the Replay gesture advancing past welcome
  navigationLockedUntil = Date.now() + 550;

  currentSlide = 1;
  candlesBlown = 0;
  balloonsPopped = 0;
  cardsFlipped = 0;
  ageAnimDone = false;
  cakeBlowing = false;

  // Hide any open lightboxes (also handled by closeLightboxIfOpen above)
  // Reset continue buttons on all slides
  ['age-continue', 'cake-continue', 'balloon-continue', 'gallery-continue', 'letter-continue'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.add('hidden');
  });

  // Reset candles
  document.querySelectorAll('.candle').forEach(c => c.classList.remove('blown'));

  // Reset balloons
  document.querySelectorAll('.game-balloon').forEach(b => {
    b.classList.remove('popped');
    b.style.animation = 'none';
    b.style.opacity = '1';
    b.style.transform = '';
    b.style.visibility = 'visible';
    b.style.pointerEvents = 'auto';
    void b.offsetHeight;
    b.style.animation = '';
  });
  document.getElementById('popped-count').textContent = '0';
  document.getElementById('reveal-message').classList.add('hidden');

  // Reset balloon/special phase visibility
  const specialPhase = document.getElementById('special-phase');
  const balloonPhase = document.getElementById('balloon-phase');
  if (specialPhase) {
    specialPhase.classList.add('hidden');
    specialPhase.classList.remove('phase-visible');
  }
  if (balloonPhase) { balloonPhase.style.display = ''; balloonPhase.style.opacity = '1'; }

  // Reset flip cards
  document.querySelectorAll('.flip-card').forEach(c => c.classList.remove('flipped'));

  // Reset letter
  document.getElementById('letter-body').innerHTML = '';
  document.getElementById('letter-footer').classList.add('hidden');

  // After Replay, show welcome + Let's Begin (envelope skip — reliable on mobile)
  resetEnvelopeUI({ skipToWelcome: true });

  // Reset cake
  document.getElementById('candle-counter').textContent = 'Tap the cake to blow all candles! 🌬️';
  document.getElementById('wish-bubble').classList.add('hidden');

  // Reset age digits for a clean replay
  const digitTens = document.getElementById('digit-tens');
  const digitOnes = document.getElementById('digit-ones');
  const ageDesc = document.getElementById('age-desc');
  if (digitTens) { digitTens.textContent = '2'; digitTens.style.color = ''; digitTens.classList.remove('spinning', 'locked-in'); }
  if (digitOnes) { digitOnes.textContent = '2'; digitOnes.style.color = ''; digitOnes.classList.remove('spinning', 'locked-in'); }
  if (ageDesc) { ageDesc.textContent = ''; ageDesc.style.animation = ''; }

  // Reset carousel index
  carouselIndex = 0;
  carouselSeenPhotos = new Set();
  galleryContinueReady = false;

  showSlide(1);
}


// ===== SLIDE ENTER EVENTS =====
function onSlideEnter(n) {
  if (n === 2 && !ageAnimDone) startAgeCounter();
  if (n === 3) resetCakeSlide();
  if (n === 4) resetBalloonSpecial();
  if (n === 5) initCarousel();
  if (n === 6) startLetter();
  if (n === 7) launchGrandFinale();
}


// ===== SLIDE 1: ENVELOPE =====
function openEnvelope() {
  const env = document.getElementById('envelope');
  if (!env || env.classList.contains('opened') || !envelopeArmed) return;

  clearEnvelopeTimers();
  env.classList.add('opened');

  envelopeTimers.push(setTimeout(() => {
    env.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
    env.style.transform = 'scale(0.88)';
    env.style.opacity = '0';
    envelopeTimers.push(setTimeout(() => {
      env.style.display = 'none';
      const welcome = document.getElementById('welcome-reveal');
      if (welcome) {
        welcome.classList.remove('hidden');
        welcome.style.animation = 'none';
        void welcome.offsetHeight; // trigger reflow
        welcome.style.animation = 'fadeInUp 0.8s ease';
      }
      spawnConfettiBurst();
      // Stay on welcome until user taps "Let's Begin"
    }, 380));
  }, 450));
}


// ===== SLIDE 2: AGE COUNTER =====
function startAgeCounter() {
  if (ageAnimDone) return;
  clearAgeTimers();

  const desc = document.getElementById('age-desc');
  const t    = document.getElementById('digit-tens');
  const o    = document.getElementById('digit-ones');

  t.classList.add('spinning');
  o.classList.add('spinning');
  t.classList.remove('locked-in');
  o.classList.remove('locked-in');
  desc.textContent = '';

  const digits = ['0','1','2','3','4','5','6','7','8','9'];
  let count = 0;
  ageSpinInterval = setInterval(() => {
    t.textContent = digits[Math.floor(Math.random() * 10)];
    o.textContent = digits[Math.floor(Math.random() * 10)];
    count++;
    if (count > 20) {
      clearInterval(ageSpinInterval);
      ageSpinInterval = null;
      t.classList.remove('spinning');
      o.classList.remove('spinning');
      t.textContent = '2';
      o.textContent = '2';
      t.classList.add('locked-in');
      o.classList.add('locked-in');
      ageSpinTimer = setTimeout(() => {
        ageSpinTimer = null;
        if (currentSlide !== 2) return;
        ageAnimDone = true;
        desc.textContent = '22 beautiful years of being YOU! 🌸';
        desc.style.animation = 'fadeInUp 0.5s ease';
        revealContinueBtn('age-continue');
        spawnConfettiBurst();
      }, 300);
    }
  }, 80);
}


// ===== SLIDE 3: CAKE =====
function resetCakeSlide() {
  clearCakeTimers();
  document.getElementById('wish-bubble').classList.add('hidden');
  document.getElementById('cake-continue').classList.add('hidden');
  document.getElementById('candle-counter').textContent = 'Tap the cake to blow all candles! 🌬️';
  document.querySelectorAll('.candle').forEach(c => c.classList.remove('blown'));
  candlesBlown = 0;
  cakeBlowing = false;
}

function blowAllCandles() {
  const candles = document.querySelectorAll('.candle');
  let alreadyAllBlown = true;
  candles.forEach(c => { if (!c.classList.contains('blown')) alreadyAllBlown = false; });
  if (alreadyAllBlown || cakeBlowing) return;
  cakeBlowing = true;

  candles.forEach((candle, i) => {
    cakeTimers.push(setTimeout(() => {
      if (currentSlide !== 3) return;
      if (!candle.classList.contains('blown')) {
        candle.classList.add('blown');
        createParticleBurst(candle, '#ffd700');
      }
    }, i * 100));
  });

  document.getElementById('candle-counter').textContent = 'All candles blown! Your wish is granted! ⭐';
  document.getElementById('cake').classList.add('shake');
  cakeTimers.push(setTimeout(() => {
    const cake = document.getElementById('cake');
    if (cake) cake.classList.remove('shake');
  }, 500));

  cakeTimers.push(setTimeout(() => {
    if (currentSlide !== 3) return;
    candlesBlown = totalCandles;
    cakeBlowing = false;
    document.getElementById('wish-bubble').classList.remove('hidden');
    revealContinueBtn('cake-continue');
    spawnConfettiBurst();
  }, 700));
}

function blowCandle() { blowAllCandles(); }

function createParticleBurst(el, color) {
  const rect = el.getBoundingClientRect();
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:fixed;
      left:${rect.left + rect.width / 2}px;
      top:${rect.top}px;
      width:6px; height:6px;
      background:${color};
      border-radius:50%;
      pointer-events:none;
      z-index:9999;
      transition:all 0.6s ease-out;
    `;
    document.body.appendChild(p);
    const angle = (i / 8) * Math.PI * 2;
    const dist  = 40 + Math.random() * 30;
    setTimeout(() => {
      p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 20}px)`;
      p.style.opacity = '0';
    }, 10);
    setTimeout(() => p.remove(), 700);
  }
}


// ===== SLIDE 4: BALLOON POP + WHY YOU'RE SO SPECIAL (MERGED) =====

function resetBalloonSpecial() {
  clearBalloonTimers();
  if (specialMsgTimer) { clearTimeout(specialMsgTimer); specialMsgTimer = null; }
  balloonsPopped = 0;
  cardsFlipped = 0;
  document.getElementById('popped-count').textContent = '0';
  document.getElementById('reveal-message').classList.add('hidden');
  document.getElementById('balloon-continue').classList.add('hidden');
  document.getElementById('reveal-words').textContent = '';

  const revSub = document.getElementById('reveal-sub');
  if (revSub) revSub.classList.add('hidden');

  // Ensure balloon phase visible, special phase hidden
  const balloonPhase = document.getElementById('balloon-phase');
  const specialPhase  = document.getElementById('special-phase');
  if (balloonPhase) {
    balloonPhase.style.display = '';
    balloonPhase.style.opacity = '1';
  }
  if (specialPhase) {
    specialPhase.classList.add('hidden');
    specialPhase.classList.remove('phase-visible');
  }

  // Reset flip cards
  document.querySelectorAll('.flip-card').forEach(c => c.classList.remove('flipped'));

  // Clear any running typewriter
  if (specialMsgTimer) { clearTimeout(specialMsgTimer); specialMsgTimer = null; }

  // Reset balloons
  document.querySelectorAll('.game-balloon').forEach(b => {
    b.classList.remove('popped');
    b.style.animation = 'none';
    b.style.opacity = '1';
    b.style.transform = '';
    b.style.visibility = 'visible';
    b.style.pointerEvents = 'auto';
    void b.offsetHeight;
    b.style.animation = '';
  });
}

function popBalloon(balloon) {
  if (balloon.classList.contains('popped')) return;
  balloon.classList.add('popped');
  balloonsPopped++;
  document.getElementById('popped-count').textContent = balloonsPopped;

  createParticleBurst(balloon, '#ff6b9d');

  // Reveal words progressively
  const poppedWords = [];
  document.querySelectorAll('.game-balloon').forEach(b => {
    if (b.classList.contains('popped')) poppedWords.push(b.dataset.word);
  });
  document.getElementById('reveal-words').textContent = poppedWords.join(' ');
  document.getElementById('reveal-message').classList.remove('hidden');

  if (balloonsPopped === totalBalloons) {
    // Show sub-message + confetti
    balloonTimers.push(setTimeout(() => {
      if (currentSlide !== 4) return;
      const revSub = document.getElementById('reveal-sub');
      if (revSub) revSub.classList.remove('hidden');
      spawnConfettiBurst();
    }, 400));

    // Transition to special phase after 1.5s
    balloonTimers.push(setTimeout(() => {
      if (currentSlide !== 4) return;
      const balloonPhase = document.getElementById('balloon-phase');
      const specialPhase  = document.getElementById('special-phase');

      if (balloonPhase) {
        balloonPhase.style.transition = 'opacity 0.4s ease';
        balloonPhase.style.opacity = '0';
        balloonTimers.push(setTimeout(() => {
          if (currentSlide !== 4) return;
          balloonPhase.style.display = 'none';
        }, 420));
      }

      balloonTimers.push(setTimeout(() => {
        if (currentSlide !== 4) return;
        if (specialPhase) {
          // Remove hidden + add phase-visible to trigger CSS animation
          specialPhase.classList.remove('hidden');
          specialPhase.classList.remove('phase-visible');
          void specialPhase.offsetHeight; // force reflow so animation restarts
          specialPhase.classList.add('phase-visible');
        }
        const slideContent = document.querySelector('.balloon-special-slide');
        if (slideContent) slideContent.scrollTop = 0;
        startSpecialMsg();
      }, 440));
    }, 1500));
  }
}


// ===== FLIP CARDS (inside merged slide 4) =====
function flipCard(card) {
  if (card.classList.contains('flipped')) {
    card.classList.remove('flipped');
    cardsFlipped = Math.max(0, cardsFlipped - 1);
    return;
  }
  card.classList.add('flipped');
  cardsFlipped++;
  // Show continue after 3 cards flipped
  if (cardsFlipped >= 3) {
    if (flipContinueTimer) clearTimeout(flipContinueTimer);
    flipContinueTimer = setTimeout(() => {
      flipContinueTimer = null;
      if (currentSlide !== 4 || cardsFlipped < 3) return;
      revealContinueBtn('balloon-continue');
      spawnConfettiBurst();
    }, 400);
  }
}

// Typewriter for "Why You're So Special" message
const SPECIAL_MSG = "Sravanii, you are truly one of a kind — your warmth, your laughter, and your beautiful soul make this world a brighter place. Here are just a few of the endless reasons why you're so incredibly special 💖";

let specialMsgTimer = null;

function startSpecialMsg() {
  const el = document.getElementById('special-msg');
  if (!el) return;

  // Clear previous
  el.innerHTML = '';
  if (specialMsgTimer) { clearTimeout(specialMsgTimer); specialMsgTimer = null; }

  let i = 0;
  const cursor = document.createElement('span');
  cursor.className = 'tw-cursor';
  el.appendChild(cursor);

  function typeNext() {
    if (i < SPECIAL_MSG.length) {
      cursor.before(document.createTextNode(SPECIAL_MSG[i]));
      i++;
      specialMsgTimer = setTimeout(typeNext, 26);
    } else {
      specialMsgTimer = setTimeout(() => {
        specialMsgTimer = null;
        if (cursor.parentNode) cursor.remove();
      }, 1500);
    }
  }
  typeNext();
}


// ===== SLIDE 5: 3D CIRCULAR ROTATING CAROUSEL =====
const TOTAL_PHOTOS = 6;
const placeholderEmojis = ['🌸','💫','🌺','🌟','🦋','👑'];
const placeholderGrads  = [
  'linear-gradient(135deg,#ff9a9e,#fecfef)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)'
];

let carouselIndex    = 0;
let carouselAutoTimer = null;
let carouselDragging  = false;
let carouselBuilt     = false;  // prevent duplicate DOM build
let carouselSeenPhotos = new Set();
let galleryContinueReady = false;

function getPhotoUrl(i) {
  const cfg = PHOTO_CONFIG[i];
  return cfg && cfg.url ? getDriveUrl(cfg.url) : `photos/photo${i + 1}.jpg`;
}

function getCaption(i) {
  return PHOTO_CONFIG[i] ? PHOTO_CONFIG[i].caption : '';
}

function stopCarouselAuto() {
  if (carouselAutoTimer) {
    clearInterval(carouselAutoTimer);
    carouselAutoTimer = null;
  }
}

function initCarousel() {
  const track  = document.getElementById('carousel-track');
  const dotsEl = document.getElementById('carousel-dots');
  if (!track) return;

  // Build DOM only once
  if (!carouselBuilt) {
    carouselBuilt = true;

    for (let i = 0; i < TOTAL_PHOTOS; i++) {
      const card = document.createElement('div');
      card.className = 'c-card';
      card.dataset.index = i;

      // ── Photo area (fills bezel aperture) ──
      const photoWrap = document.createElement('div');
      photoWrap.className = 'c-photo-wrap';
      photoWrap.style.background = placeholderGrads[i];

      // Placeholder emoji (visible until image loads)
      const ph = document.createElement('div');
      ph.className = 'c-photo-ph';
      ph.textContent = placeholderEmojis[i];
      photoWrap.appendChild(ph);

      // Actual image (overlays placeholder when loaded)
      const img = document.createElement('img');
      img.alt = getCaption(i);
      img.referrerPolicy = 'no-referrer';
      const driveId = getDriveId(PHOTO_CONFIG[i]?.url);
      img.src = getPhotoUrl(i);
      img.onerror = function() {
        if (driveId && !this.dataset.triedFallback) {
          this.dataset.triedFallback = 'true';
          this.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
        } else {
          this.style.display = 'none';
        }
      };
      photoWrap.appendChild(img);

      // Glossy sheen overlay
      const shine = document.createElement('div');
      shine.className = 'c-photo-shine';
      photoWrap.appendChild(shine);

      card.appendChild(photoWrap);

      // ── Caption label (in the dark bezel strip below photo) ──
      const label = document.createElement('div');
      label.className = 'c-photo-label';
      label.textContent = getCaption(i);
      card.appendChild(label);

      // Click: active → lightbox; others → navigate toward it
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index);
        if (idx === carouselIndex) {
          openLightboxCarousel(idx);
        } else {
          let diff = idx - carouselIndex;
          if (diff >  TOTAL_PHOTOS / 2) diff -= TOTAL_PHOTOS;
          if (diff < -TOTAL_PHOTOS / 2) diff += TOTAL_PHOTOS;
          diff > 0 ? carouselNext() : carouselPrev();
        }
      });

      track.appendChild(card);
    }

    // Build dots
    dotsEl.innerHTML = '';
    for (let i = 0; i < TOTAL_PHOTOS; i++) {
      const dot = document.createElement('span');
      dot.className = 'cdot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goToCarousel(i));
      dotsEl.appendChild(dot);
    }

    // Swipe/drag (attached once)
    setupCarouselDrag(document.getElementById('carousel-stage'));
  }

  carouselIndex = 0;
  carouselSeenPhotos = new Set();
  galleryContinueReady = false;
  clearCarouselSeenTimer();
  renderCarousel();
  startCarouselAuto();

  document.getElementById('gallery-continue').classList.add('hidden');
  document.getElementById('gallery-continue').classList.remove('btn-enter');
  document.getElementById('carousel-hint').textContent = 'Swipe or tap to explore ✨';

  // Fallback so users never get stuck without a next button
  carouselSeenTimer = setTimeout(() => {
    carouselSeenTimer = null;
    if (currentSlide === 5) showGalleryContinue();
  }, 10000);
}

function renderCarousel() {
  const cards = document.querySelectorAll('.c-card');
  const n     = TOTAL_PHOTOS;

  cards.forEach((card, i) => {
    let rel = i - carouselIndex;
    if (rel >  n / 2) rel -= n;
    if (rel < -n / 2) rel += n;

    const isActive = rel === 0;
    const absRel   = Math.abs(rel);

    // ── Premium 3D coverflow — dramatic physical depth ──
    const rotY       = rel * 48;        // strong side tilt (±48° for ±1)
    const translateX = rel * 125;       // good spread without clipping
    const translateZ = isActive
      ? 110
      : Math.max(-90, 30 - absRel * 65);  // depth falloff
    const scale   = isActive ? 1.1  : Math.max(0.52, 1 - absRel * 0.24);
    const opacity = absRel > 2 ? 0   : Math.max(0.22, 1 - absRel * 0.38);

    card.style.transform = `
      translateX(-50%) translateY(-50%)
      translateX(${translateX}px)
      translateZ(${translateZ}px)
      rotateY(${rotY}deg)
      scale(${scale})
    `;
    card.style.opacity = opacity;
    card.style.zIndex  = 10 - absRel;
    card.classList.toggle('active', isActive);
    card.style.pointerEvents = absRel > 1 ? 'none' : 'auto'; // only active + adjacent clickable
  });

  // Update caption with fade
  const caption = document.getElementById('carousel-caption');
  const counter = document.getElementById('carousel-counter');
  if (caption) {
    const shownIndex = carouselIndex;
    caption.style.opacity = '0';
    setTimeout(() => {
      if (currentSlide !== 5 || carouselIndex !== shownIndex) return;
      caption.textContent = getCaption(shownIndex);
      if (counter) counter.textContent = `${shownIndex + 1} / ${TOTAL_PHOTOS}`;
      caption.style.opacity = '1';
    }, 150);
  }

  // Update dots
  document.querySelectorAll('.cdot').forEach((d, i) => {
    d.classList.toggle('active', i === carouselIndex);
  });

  carouselSeenPhotos.add(carouselIndex);

  // Show continue once the last photo is reached, or every photo has been seen
  if (carouselIndex === TOTAL_PHOTOS - 1 || carouselSeenPhotos.size >= TOTAL_PHOTOS) {
    showGalleryContinue();
  }
}

function showGalleryContinue() {
  if (galleryContinueReady || currentSlide !== 5) return;
  galleryContinueReady = true;
  clearCarouselSeenTimer();
  const hint = document.getElementById('carousel-hint');
  if (hint) hint.textContent = '✨ You\'ve seen them all!';
  revealContinueBtn('gallery-continue');
  spawnConfettiBurst();
}

function carouselNext() {
  carouselIndex = (carouselIndex + 1) % TOTAL_PHOTOS;
  renderCarousel();
}

function carouselPrev() {
  carouselIndex = (carouselIndex - 1 + TOTAL_PHOTOS) % TOTAL_PHOTOS;
  renderCarousel();
}

function goToCarousel(idx) {
  carouselIndex = idx;
  renderCarousel();
}

function startCarouselAuto() {
  stopCarouselAuto();
  carouselAutoTimer = setInterval(() => {
    if (!carouselDragging) carouselNext();
  }, 4500);
}

function setupCarouselDrag(stage) {
  if (!stage) return;
  let startX = 0;

  stage.addEventListener('touchstart', e => {
    carouselDragging = true;
    startX = e.touches[0].clientX;
    stopCarouselAuto();
  }, { passive: true });

  stage.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 30) dx < 0 ? carouselNext() : carouselPrev();
    carouselDragging = false;
    if (currentSlide === 5) startCarouselAuto();
  }, { passive: true });

  // Mouse drag — only on stage, cleanup on window
  stage.addEventListener('mousedown', e => {
    carouselDragging = true;
    startX = e.clientX;
    stopCarouselAuto();
    e.preventDefault();
  });

  const onMouseUp = e => {
    if (!carouselDragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 30) dx < 0 ? carouselNext() : carouselPrev();
    carouselDragging = false;
    if (currentSlide === 5) startCarouselAuto();
  };
  window.addEventListener('mouseup', onMouseUp);
}

// Lightbox
function openLightboxCarousel(idx) {
  const lb  = document.getElementById('carousel-lightbox');
  const img = document.getElementById('clb-img');
  const cap = document.getElementById('clb-caption');
  if (!lb || !img) return;

  const driveId = getDriveId(PHOTO_CONFIG[idx]?.url);
  img.style.display = '';
  img.referrerPolicy = 'no-referrer';
  delete img.dataset.triedFallback;
  img.src = getPhotoUrl(idx);
  img.onerror = function() {
    if (driveId && !this.dataset.triedFallback) {
      this.dataset.triedFallback = 'true';
      this.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
    } else {
      this.style.display = 'none';
    }
  };
  cap.textContent = getCaption(idx);
  lb.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  stopCarouselAuto();
}

function closeLightboxCarousel(e) {
  if (e.target !== e.currentTarget && !e.target.classList.contains('clb-close')) return;
  document.getElementById('carousel-lightbox').classList.add('hidden');
  document.body.style.overflow = '';
  if (currentSlide === 5) startCarouselAuto();
}

// Legacy no-ops
function openLightbox() {}
function closeLightbox() {}
function changeLightboxPhoto() {}


// ===== SLIDE 6: LETTER — typewriter reveal =====
const letterParagraphs = [
  "Happy Birthday to someone truly special ✨",
  "Your smile lights up every room, and your kindness touches every heart around you. Your presence brings a warmth and beauty that is as gentle and graceful as the moonlight 🌙",
  "No matter where life leads, I sincerely wish you endless happiness, great health, success, and countless reasons to smile every single day.",
  "May this new chapter of your life be filled with exciting adventures, cherished memories, and all the love you so deeply deserve 🌸",
  "Keep shining like the stars ⭐\nKeep glowing like the moon 🌙\nKeep being the wonderful person you are 💖",
  "Happy Birthday once again, Sravanii! 🎉✨"
];

let letterTimers = [];

function startLetter() {
  const body   = document.getElementById('letter-body');
  const footer = document.getElementById('letter-footer');
  const btn    = document.getElementById('letter-continue');

  // Clear any previous run
  letterTimers.forEach(t => clearTimeout(t));
  letterTimers = [];
  body.innerHTML = '';
  footer.classList.add('hidden');
  btn.classList.add('hidden');
  btn.classList.remove('btn-enter');

  // Scroll letter-paper (now scrollable) to top
  const paper = document.querySelector('.letter-paper');
  if (paper) paper.scrollTop = 0;

  // ── Type paragraphs ONE AT A TIME — no blank-space flicker ──
  function typeParagraph(pIdx) {
    if (pIdx >= letterParagraphs.length) {
      letterTimers.push(setTimeout(() => {
        if (currentSlide !== 6) return;
        footer.classList.remove('hidden');
        revealContinueBtn('letter-continue');
        // Scroll to reveal footer inside paper smoothly
        if (paper) paper.scrollTo({ top: paper.scrollHeight, behavior: 'smooth' });
      }, 350));
      return;
    }

    const para = letterParagraphs[pIdx];
    const p    = document.createElement('p');
    p.className = 'letter-para';
    p.style.opacity   = '1';
    p.style.animation = 'none';
    body.appendChild(p);

    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    p.appendChild(cursor);

    const chars = para.split('');
    let cIdx = 0;

    function typeChar() {
      if (cIdx < chars.length) {
        const ch = chars[cIdx];
        if (ch === '\n') cursor.before(document.createElement('br'));
        else cursor.before(document.createTextNode(ch));
        cIdx++;
        // Keep scroll at bottom if text grows past visible area
        if (paper && (paper.scrollHeight - paper.scrollTop - paper.clientHeight > 15)) {
          paper.scrollTop = paper.scrollHeight;
        }
        const speed = (ch === ',' || ch === '.' || ch === '!' || ch === '?') ? 55 : 20;
        letterTimers.push(setTimeout(typeChar, speed));
      } else {
        cursor.remove();
        letterTimers.push(setTimeout(() => typeParagraph(pIdx + 1), 380));
      }
    }
    typeChar();
  }

  typeParagraph(0);
}


// ===== SLIDE 7: GRAND FINALE =====
function launchGrandFinale() {
  clearFinaleEffects();
  launchFireworks();
  launchHeartBurst();
  spawnConfettiBurst();
  finaleTimers.push(setTimeout(spawnConfettiBurst, 600));
  finaleTimers.push(setTimeout(spawnConfettiBurst, 1300));
  launchFinaleSparkles();
}

function launchFinaleSparkles() {
  const sparkles = ['✨','⭐','🌟','💫','🎇','🎆','💥'];
  for (let i = 0; i < 28; i++) {
    finaleTimers.push(setTimeout(() => {
      const s = document.createElement('div');
      s.className = 'finale-spark';
      s.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
      s.style.left = `${Math.random() * 100}vw`;
      s.style.top  = `${60 + Math.random() * 40}vh`;
      s.style.fontSize = `${1 + Math.random() * 2}rem`;
      s.style.animationDelay = `${Math.random() * 0.4}s`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 4200);
    }, i * 110));
  }
}

function launchFireworks() {
  let fw = 0;
  fireworkInterval = setInterval(() => {
    if (fw++ > 20) {
      clearInterval(fireworkInterval);
      fireworkInterval = null;
      return;
    }
    createFirework();
  }, 200);
}

function createFirework() {
  const colors = ['#ff6b9d','#ffd700','#c77dff','#4d96ff','#6bcb77','#ff9a00'];
  const x = 10 + Math.random() * 80;
  const y = 5  + Math.random() * 65;
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    const angle = (i / 24) * Math.PI * 2;
    const dist  = 35 + Math.random() * 60;
    p.style.cssText = `
      position:fixed;left:${x}vw;top:${y}vh;
      width:5px;height:5px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:50%;
      pointer-events:none;z-index:9999;
      transition:all 0.9s ease-out;
      transform:translate(0,0);
    `;
    document.body.appendChild(p);
    setTimeout(() => {
      p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
      p.style.opacity = '0';
      p.style.width = '2px';
      p.style.height = '2px';
    }, 10);
    setTimeout(() => p.remove(), 1000);
  }
}

function launchHeartBurst() {
  spawnConfettiBurst();
  const hearts = ['💖','💗','💕','💓','❤️','🌸','✨','⭐'];
  for (let i = 0; i < 28; i++) {
    finaleTimers.push(setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'finale-spark';
      h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      h.style.cssText = `
        position:fixed;
        left:${Math.random() * 100}vw;
        top:108vh;
        font-size:${1 + Math.random() * 2}rem;
        pointer-events:none;z-index:9999;
        animation: rise-heart 3.2s ease forwards;
      `;
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 3300);
    }, i * 120));
  }
}


// ===== CONFETTI BURST =====
function spawnConfettiBurst() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#ff6b9d','#ffd700','#c77dff','#4d96ff','#6bcb77','#ff9a00','#fff'];
  const count = window.innerWidth < 480 ? 24 : 45;
  for (let i = 0; i < count; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.left = `${5 + Math.random() * 90}vw`;
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.width  = `${5 + Math.random() * 8}px`;
    c.style.height = `${5 + Math.random() * 8}px`;
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    c.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
    c.style.animationDelay    = `${Math.random() * 0.4}s`;
    document.getElementById('confetti-container').appendChild(c);
    setTimeout(() => c.remove(), 3200);
  }
}

// Background confetti (continuous)
function startConfetti() {
  if (confettiInterval) return;
  const colors = ['#ff6b9d','#ffd700','#c77dff','#4d96ff','#6bcb77','#ff9a00'];
  confettiInterval = setInterval(() => {
    if (document.hidden || Math.random() > 0.55) return;
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.left = `${Math.random() * 100}vw`;
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.width  = `${4 + Math.random() * 6}px`;
    c.style.height = `${4 + Math.random() * 6}px`;
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    c.style.animationDuration = `${3 + Math.random() * 3}s`;
    document.getElementById('confetti-container').appendChild(c);
    setTimeout(() => c.remove(), 6500);
  }, 700);
}

// Background balloons
function createBgBalloons() {
  if (bgBalloonInterval) return;
  const emojis = ['🎈','🎀','🌸','💫','⭐','✨','💖','🎊'];
  bgBalloonInterval = setInterval(() => {
    if (document.hidden) return;
    const b = document.createElement('div');
    b.className = 'bg-balloon';
    b.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    b.style.left = `${Math.random() * 100}vw`;
    b.style.fontSize = `${1 + Math.random() * 1.5}rem`;
    b.style.animationDuration = `${6 + Math.random() * 8}s`;
    b.style.animationDelay = '0s';
    b.style.opacity = `${0.3 + Math.random() * 0.4}`;
    document.getElementById('balloons-container').appendChild(b);
    setTimeout(() => b.remove(), 14000);
  }, 1400);
}

// Stars
function createStars(count = 28) {
  const container = document.getElementById('stars-container');
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.textContent = Math.random() > 0.7 ? '✦' : '·';
    s.style.left = `${Math.random() * 100}vw`;
    s.style.top  = `${Math.random() * 100}vh`;
    s.style.fontSize = `${6 + Math.random() * 12}px`;
    s.style.animationDuration = `${1.5 + Math.random() * 3}s`;
    s.style.animationDelay    = `${Math.random() * 3}s`;
    container.appendChild(s);
  }
}


// ===== MUSIC =====
let _audio = null;

function getAudio() {
  if (!_audio) {
    _audio = new Audio('music/ss.mpeg');
    _audio.loop   = true;
    _audio.volume = 0.5;
  }
  return _audio;
}

function toggleMusic() {
  musicPlaying ? stopMusic() : startMusic();
}

function startMusic(opts = {}) {
  const { onSuccess, onFail } = opts;
  try {
    const audio = getAudio();
    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        musicPlaying = true;
        const btn = document.getElementById('music-btn');
        btn.classList.add('playing');
        btn.setAttribute('aria-pressed', 'true');
        document.getElementById('music-icon').textContent = '🎶';
        if (onSuccess) onSuccess();
      }).catch(e => {
        console.log('Audio blocked:', e);
        if (onFail) onFail();
      });
    } else {
      musicPlaying = true;
      const btn = document.getElementById('music-btn');
      btn.classList.add('playing');
      btn.setAttribute('aria-pressed', 'true');
      document.getElementById('music-icon').textContent = '🎶';
      if (onSuccess) onSuccess();
    }
  } catch(e) {
    console.log('Audio error:', e);
    if (onFail) onFail();
  }
}

function stopMusic() {
  try { const a = getAudio(); a.pause(); a.currentTime = 0; } catch(e) {}
  musicPlaying = false;
  const btn = document.getElementById('music-btn');
  btn.classList.remove('playing');
  btn.setAttribute('aria-pressed', 'false');
  document.getElementById('music-icon').textContent = '🎵';
}


// ===== SHARE =====
function sharePage() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: 'Happy Birthday Sravanii! 🎂',
      text:  'Hey Sravanii 🎉 Open this — I made something special just for you! ✨',
      url
    }).catch(() => copyLink(url));
  } else {
    copyLink(url);
  }
}

function copyLink(url) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url)
      .then(() => showShareToast('🎉 Link copied! Send it to Sravanii!'))
      .catch(() => fallbackCopy(url));
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(url) {
  const el = document.createElement('textarea');
  el.value = url;
  el.style.cssText = 'position:fixed;opacity:0;';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  showShareToast('🎉 Link copied! Send it to Sravanii!');
}

function showShareToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
    background:linear-gradient(135deg,#ff6b9d,#c77dff);
    color:white; padding:12px 24px; border-radius:50px;
    font-family:'Poppins',sans-serif; font-size:0.9rem; font-weight:600;
    z-index:99999; box-shadow:0 8px 30px rgba(255,107,157,0.5);
    animation: fadeIn 0.3s ease; white-space:nowrap;
  `;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.5s'; }, 2500);
  setTimeout(() => t.remove(), 3100);
}


// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', e => {
  const lb = document.getElementById('carousel-lightbox');
  const lightboxOpen = lb && !lb.classList.contains('hidden');

  if (e.key === 'Escape' && lightboxOpen) {
    lb.classList.add('hidden');
    document.body.style.overflow = '';
    if (currentSlide === 5) startCarouselAuto();
    return;
  }

  // Don't change slides while lightbox is open
  if (lightboxOpen) return;

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    if (currentSlide < totalSlides) showSlide(currentSlide + 1);
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    if (currentSlide > 1) showSlide(currentSlide - 1);
  }
});


// ===== INJECT KEYFRAME =====
const _kfStyle = document.createElement('style');
_kfStyle.textContent = `
@keyframes rise-heart {
  0%   { transform: translateY(0)      rotate(0deg);   opacity: 1; }
  100% { transform: translateY(-110vh) rotate(720deg); opacity: 0; }
}
`;
document.head.appendChild(_kfStyle);
