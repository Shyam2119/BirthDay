/* =============================================
   SRAVANII'S BIRTHDAY - script.js
============================================= */

// ============================================================
// 📸 PASTE SRAVANII'S GOOGLE DRIVE PHOTO LINKS HERE
// Format: Right-click photo in Drive → "Get link" → paste below
// Example: 'https://drive.google.com/file/d/1aBcD.../view'
// ============================================================
const PHOTO_CONFIG = [
  { url: '', caption: 'Sunshine Girl ☀️' },      // photo 1 → paste drive link
  { url: '', caption: 'Simply Stunning ✨' },     // photo 2
  { url: '', caption: 'Forever Glowing 🌸' },    // photo 3
  { url: '', caption: 'Pure Joy 🌟' },           // photo 4
  { url: '', caption: 'Radiant Soul 💫' },       // photo 5
  { url: '', caption: 'Birthday Queen 👑' },     // photo 6
];

// Converts Google Drive share URL to direct image URL
function getDriveUrl(link) {
  if (!link) return '';
  const m = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  const m2 = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/uc?export=view&id=${m2[1]}`;
  return link;
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

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  createStars();
  createBgBalloons();
  startConfetti();
  showSlide(1);
  setupAutoMusic();
});

// Auto-start music on first interaction
function setupAutoMusic() {
  let started = false;
  const tryStart = () => {
    if (started || musicPlaying) return;
    started = true;
    startMusic();
    showMusicToast();
  };
  document.addEventListener('touchend', tryStart, { once: true, passive: true });
  document.addEventListener('click',    tryStart, { once: true });
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


// ===== SLIDE NAVIGATION =====
function showSlide(n) {
  // Stop carousel auto-rotate when leaving slide 5 (bug fix)
  if (currentSlide === 5 && n !== 5) stopCarouselAuto();

  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active', 'exit'));
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i + 1 === n));

  const slide = document.getElementById(`slide-${n}`);
  if (slide) {
    slide.classList.add('active');
    onSlideEnter(n);
  }
  currentSlide = n;
}

function nextSlide() {
  if (currentSlide < totalSlides) showSlide(currentSlide + 1);
}

function goToSlide(n) {
  showSlide(n);
}

function replay() {
  // Stop all running timers
  stopCarouselAuto();
  if (specialMsgTimer) { clearTimeout(specialMsgTimer); specialMsgTimer = null; }
  letterTimers.forEach(t => clearTimeout(t));
  letterTimers = [];

  currentSlide = 1;
  candlesBlown = 0;
  balloonsPopped = 0;
  cardsFlipped = 0;
  ageAnimDone = false;

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
  document.getElementById('balloon-continue').classList.add('hidden');

  // Reset balloon/special phase visibility
  const specialPhase = document.getElementById('special-phase');
  const balloonPhase = document.getElementById('balloon-phase');
  if (specialPhase) specialPhase.classList.add('hidden');
  if (balloonPhase) { balloonPhase.style.display = ''; balloonPhase.style.opacity = '1'; }

  // Reset flip cards
  document.querySelectorAll('.flip-card').forEach(c => c.classList.remove('flipped'));

  // Reset letter
  document.getElementById('letter-body').innerHTML = '';
  document.getElementById('letter-footer').classList.add('hidden');
  document.getElementById('letter-continue').classList.add('hidden');

  // Reset envelope
  const env = document.getElementById('envelope');
  env.classList.remove('opened');
  env.style.display = '';
  env.style.opacity = '';
  env.style.transform = '';
  env.style.visibility = '';
  document.getElementById('welcome-reveal').classList.add('hidden');

  // Reset cake
  document.getElementById('candle-counter').textContent = 'Tap the cake to blow all candles! 🌬️';
  document.getElementById('wish-bubble').classList.add('hidden');
  document.getElementById('cake-continue').classList.add('hidden');

  // Reset carousel index
  carouselIndex = 0;

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
  if (env.classList.contains('opened')) return;
  env.classList.add('opened');
  setTimeout(() => {
    env.style.transform = 'scale(0.9)';
    env.style.opacity = '0';
    setTimeout(() => {
      env.style.display = 'none';
      document.getElementById('welcome-reveal').classList.remove('hidden');
      spawnConfettiBurst();
    }, 400);
  }, 500);
}


// ===== SLIDE 2: AGE COUNTER =====
function startAgeCounter() {
  ageAnimDone = true;
  const desc = document.getElementById('age-desc');
  const t    = document.getElementById('digit-tens');
  const o    = document.getElementById('digit-ones');
  const btn  = document.getElementById('age-continue');

  t.classList.add('spinning');
  o.classList.add('spinning');
  desc.textContent = '';

  const digits = ['0','1','2','3','4','5','6','7','8','9'];
  let count = 0;
  const spinInterval = setInterval(() => {
    t.textContent = digits[Math.floor(Math.random() * 10)];
    o.textContent = digits[Math.floor(Math.random() * 10)];
    count++;
    if (count > 20) {
      clearInterval(spinInterval);
      t.classList.remove('spinning');
      o.classList.remove('spinning');
      t.textContent = '2';
      o.textContent = '2';
      t.style.color = '#ff6b9d';
      o.style.color = '#ff6b9d';
      setTimeout(() => {
        desc.textContent = '22 beautiful years of being YOU! 🌸';
        desc.style.animation = 'fadeInUp 0.5s ease';
        btn.classList.remove('hidden');
        spawnConfettiBurst();
      }, 300);
    }
  }, 80);
}


// ===== SLIDE 3: CAKE =====
function resetCakeSlide() {
  document.getElementById('wish-bubble').classList.add('hidden');
  document.getElementById('cake-continue').classList.add('hidden');
  document.getElementById('candle-counter').textContent = 'Tap the cake to blow all candles! 🌬️';
  document.querySelectorAll('.candle').forEach(c => c.classList.remove('blown'));
  candlesBlown = 0;
}

function blowAllCandles() {
  const candles = document.querySelectorAll('.candle');
  let alreadyAllBlown = true;
  candles.forEach(c => { if (!c.classList.contains('blown')) alreadyAllBlown = false; });
  if (alreadyAllBlown) return;

  candles.forEach((candle, i) => {
    setTimeout(() => {
      if (!candle.classList.contains('blown')) {
        candle.classList.add('blown');
        createParticleBurst(candle, '#ffd700');
      }
    }, i * 100);
  });

  document.getElementById('candle-counter').textContent = 'All candles blown! Your wish is granted! ⭐';
  document.getElementById('cake').classList.add('shake');
  setTimeout(() => document.getElementById('cake').classList.remove('shake'), 500);

  setTimeout(() => {
    document.getElementById('wish-bubble').classList.remove('hidden');
    document.getElementById('cake-continue').classList.remove('hidden');
    spawnConfettiBurst();
  }, 700);
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
  if (specialPhase) specialPhase.classList.add('hidden');

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
    setTimeout(() => {
      const revSub = document.getElementById('reveal-sub');
      if (revSub) revSub.classList.remove('hidden');
      spawnConfettiBurst();
    }, 400);

    // Transition to special phase after 1.5s
    setTimeout(() => {
      const balloonPhase = document.getElementById('balloon-phase');
      const specialPhase  = document.getElementById('special-phase');
      const slideContent  = document.querySelector('.balloon-special-slide');

      if (balloonPhase) {
        balloonPhase.style.transition = 'opacity 0.4s ease';
        balloonPhase.style.opacity = '0';
        setTimeout(() => { balloonPhase.style.display = 'none'; }, 420);
      }

      setTimeout(() => {
        if (specialPhase) {
          // Force re-animation by removing and re-adding
          specialPhase.style.animation = 'none';
          specialPhase.classList.remove('hidden');
          void specialPhase.offsetHeight;
          specialPhase.style.animation = '';
        }
        if (slideContent) slideContent.scrollTop = 0;
        startSpecialMsg();
      }, 440);
    }, 1500);
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
    setTimeout(() => {
      document.getElementById('balloon-continue').classList.remove('hidden');
    }, 600);
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
      setTimeout(() => { if (cursor.parentNode) cursor.remove(); }, 1500);
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

      // Placeholder shown immediately; image loaded on top
      const ph = document.createElement('div');
      ph.className = 'c-card-ph';
      ph.textContent = placeholderEmojis[i];
      ph.style.background = placeholderGrads[i];
      card.style.background = placeholderGrads[i];
      card.appendChild(ph);

      const img = document.createElement('img');
      img.alt = getCaption(i);
      img.style.position = 'absolute';
      img.style.inset = '0';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '18px';
      img.src = getPhotoUrl(i);
      img.onerror = function() { this.style.display = 'none'; };
      card.appendChild(img);

      // Click: active → lightbox; others → navigate toward it
      card.addEventListener('click', () => {
        const idx  = parseInt(card.dataset.index);
        if (idx === carouselIndex) {
          openLightboxCarousel(idx);
        } else {
          // Step one card at a time toward clicked card
          let diff = idx - carouselIndex;
          if (diff > TOTAL_PHOTOS / 2) diff -= TOTAL_PHOTOS;
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
  renderCarousel();
  startCarouselAuto();

  document.getElementById('gallery-continue').classList.add('hidden');
  document.getElementById('carousel-hint').textContent = 'Swipe or tap to explore ✨';
}

function renderCarousel() {
  const cards = document.querySelectorAll('.c-card');
  const n     = TOTAL_PHOTOS;

  // Track whether we've already triggered the "all seen" prompt this session
  const activeIsLast = carouselIndex === TOTAL_PHOTOS - 1;

  cards.forEach((card, i) => {
    let rel = i - carouselIndex;
    if (rel >  n / 2) rel -= n;
    if (rel < -n / 2) rel += n;

    const isActive = rel === 0;
    const absRel   = Math.abs(rel);

    const rotY      = rel * 27;                                        // Y-rotation
    const translateX = rel * 115;                                      // horizontal spread
    const translateZ = isActive ? 80 : Math.max(-80, 40 - absRel * 50);
    const scale      = isActive ? 1.15 : Math.max(0.58, 1 - absRel * 0.2);
    const opacity    = absRel > 2 ? 0 : Math.max(0.28, 1 - absRel * 0.32);

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
    caption.style.opacity = '0';
    setTimeout(() => {
      caption.textContent = getCaption(carouselIndex);
      counter.textContent = `${carouselIndex + 1} / ${TOTAL_PHOTOS}`;
      caption.style.opacity = '1';
    }, 150);
  }

  // Update dots
  document.querySelectorAll('.cdot').forEach((d, i) => {
    d.classList.toggle('active', i === carouselIndex);
  });

  // "All seen" — show once when user reaches last photo
  if (activeIsLast) {
    const hint = document.getElementById('carousel-hint');
    const btn  = document.getElementById('gallery-continue');
    if (hint && hint.textContent !== '✨ You\'ve seen them all!') {
      setTimeout(() => {
        hint.textContent = '✨ You\'ve seen them all!';
        btn.classList.remove('hidden');
        spawnConfettiBurst();
      }, 500);
    }
  }
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
  }, 3500);
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
    startCarouselAuto();
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
    startCarouselAuto();
  };
  window.addEventListener('mouseup', onMouseUp);
}

// Lightbox
function openLightboxCarousel(idx) {
  const lb  = document.getElementById('carousel-lightbox');
  const img = document.getElementById('clb-img');
  const cap = document.getElementById('clb-caption');
  if (!lb || !img) return;

  img.style.display = '';
  img.src = getPhotoUrl(idx);
  img.onerror = function() { this.style.display = 'none'; };
  cap.textContent = getCaption(idx);
  lb.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  stopCarouselAuto();
}

function closeLightboxCarousel(e) {
  if (e.target !== e.currentTarget && !e.target.classList.contains('clb-close')) return;
  document.getElementById('carousel-lightbox').classList.add('hidden');
  document.body.style.overflow = '';
  startCarouselAuto();
}

// Legacy no-ops
function openLightbox() {}
function closeLightbox() {}
function changeLightboxPhoto() {}


// ===== SLIDE 6: LETTER — typewriter reveal =====
const letterParagraphs = [
  "Happy Birthday to someone who has always been special in her own unique way.",
  "Your presence has always been larger than life. Your smile has a way of making everything around you feel brighter, your eyes sparkle like countless stars in the night sky, and your beauty is as gentle and peaceful as the moon. If angels walked among us, I think they'd look a little like you.",
  "Life doesn't always unfold the way we hope, but some people continue to leave a beautiful mark on our hearts. No matter where life takes us, I sincerely wish you endless happiness, good health, success, and countless reasons to smile.",
  "May this new chapter of your life be filled with laughter, exciting adventures, dreams coming true, and people who cherish you the way you deserve.",
  "Keep shining like the stars.\nKeep glowing like the moon.\nKeep being the wonderful person you are.",
  "Happy Birthday once again, Sravanii! 🌙✨"
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

  // Scroll letter to top
  const paper = document.querySelector('.letter-paper');
  if (paper) paper.scrollTop = 0;

  let paraDelay = 0;

  letterParagraphs.forEach((para, pIdx) => {
    const p = document.createElement('p');
    p.className = 'letter-para';
    p.style.opacity = '1';
    p.style.animation = 'none';
    body.appendChild(p);

    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    p.appendChild(cursor);

    const t1 = setTimeout(() => {
      let cIdx = 0;
      const chars = para.split('');

      function typeChar() {
        if (cIdx < chars.length) {
          const ch = chars[cIdx];
          if (ch === '\n') {
            cursor.before(document.createElement('br'));
          } else {
            cursor.before(document.createTextNode(ch));
          }
          cIdx++;
          const speed = (ch === ',' || ch === '.' || ch === '!') ? 60 : 22;
          letterTimers.push(setTimeout(typeChar, speed));
        } else {
          cursor.remove();
          if (pIdx === letterParagraphs.length - 1) {
            setTimeout(() => {
              footer.classList.remove('hidden');
              btn.classList.remove('hidden');
            }, 400);
          }
        }
      }
      typeChar();
    }, paraDelay);

    letterTimers.push(t1);
    // Estimate time for this paragraph: ~22ms/char + pauses at punctuation + 400ms gap
    const punctCount = (para.match(/[,.!]/g) || []).length;
    paraDelay += para.length * 22 + punctCount * 38 + 400;
  });
}


// ===== SLIDE 7: GRAND FINALE =====
function launchGrandFinale() {
  launchFireworks();
  launchHeartBurst();
  spawnConfettiBurst();
  setTimeout(spawnConfettiBurst, 600);
  setTimeout(spawnConfettiBurst, 1300);
  launchFinaleSparkles();
}

function launchFinaleSparkles() {
  const sparkles = ['✨','⭐','🌟','💫','🎇','🎆','💥'];
  for (let i = 0; i < 28; i++) {
    setTimeout(() => {
      const s = document.createElement('div');
      s.className = 'finale-spark';
      s.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
      s.style.left = `${Math.random() * 100}vw`;
      s.style.top  = `${60 + Math.random() * 40}vh`;
      s.style.fontSize = `${1 + Math.random() * 2}rem`;
      s.style.animationDelay = `${Math.random() * 0.4}s`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 4200);
    }, i * 110);
  }
}

function launchFireworks() {
  let fw = 0;
  const interval = setInterval(() => {
    if (fw++ > 20) { clearInterval(interval); return; }
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
    setTimeout(() => {
      const h = document.createElement('div');
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
    }, i * 120);
  }
}


// ===== CONFETTI BURST =====
function spawnConfettiBurst() {
  const colors = ['#ff6b9d','#ffd700','#c77dff','#4d96ff','#6bcb77','#ff9a00','#fff'];
  for (let i = 0; i < 45; i++) {
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
  const colors = ['#ff6b9d','#ffd700','#c77dff','#4d96ff','#6bcb77','#ff9a00'];
  confettiInterval = setInterval(() => {
    if (Math.random() > 0.6) return;
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
  }, 300);
}

// Background balloons
function createBgBalloons() {
  const emojis = ['🎈','🎀','🌸','💫','⭐','✨','💖','🎊'];
  bgBalloonInterval = setInterval(() => {
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
  }, 1000);
}

// Stars
function createStars() {
  const container = document.getElementById('stars-container');
  for (let i = 0; i < 60; i++) {
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
    _audio = new Audio('music/ReelAudio-3029.mp3.mpeg');
    _audio.loop   = true;
    _audio.volume = 0.5;
  }
  return _audio;
}

function toggleMusic() {
  musicPlaying ? stopMusic() : startMusic();
}

function startMusic() {
  try {
    const audio = getAudio();
    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        musicPlaying = true;
        document.getElementById('music-btn').classList.add('playing');
        document.getElementById('music-icon').textContent = '🎶';
      }).catch(e => console.log('Audio blocked:', e));
    } else {
      musicPlaying = true;
      document.getElementById('music-btn').classList.add('playing');
      document.getElementById('music-icon').textContent = '🎶';
    }
  } catch(e) { console.log('Audio error:', e); }
}

function stopMusic() {
  try { const a = getAudio(); a.pause(); a.currentTime = 0; } catch(e) {}
  musicPlaying = false;
  document.getElementById('music-btn').classList.remove('playing');
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
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    if (currentSlide < totalSlides) showSlide(currentSlide + 1);
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    if (currentSlide > 1) showSlide(currentSlide - 1);
  }
  if (e.key === 'Escape') {
    const lb = document.getElementById('carousel-lightbox');
    if (lb && !lb.classList.contains('hidden')) {
      lb.classList.add('hidden');
      document.body.style.overflow = '';
      startCarouselAuto();
    }
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
