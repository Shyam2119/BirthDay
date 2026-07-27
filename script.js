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
  // Handle /file/d/ID/view format
  const m = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  // Handle open?id=ID format
  const m2 = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/uc?export=view&id=${m2[1]}`;
  return link;
}

// ===== STATE =====
let currentSlide = 1;
const totalSlides = 9;
let candlesBlown = 0;
const totalCandles = 5;
let balloonsPopped = 0;
const totalBalloons = 4;
let cardsFlipped = 0;
let lightboxIndex = 0;
let musicPlaying = false;
let audioCtx = null;
let gainNode = null;
let bgBalloonInterval = null;
let confettiInterval = null;
let ageAnimDone = false;

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  loadPhotos();
  createStars();
  createBgBalloons();
  startConfetti();
  showSlide(1);
});

// Inject Google Drive photos into gallery img tags
function loadPhotos() {
  const imgs = document.querySelectorAll('#photo-gallery img');
  imgs.forEach((img, i) => {
    const cfg = PHOTO_CONFIG[i];
    if (cfg && cfg.url) {
      img.src = getDriveUrl(cfg.url);
      img.alt = cfg.caption;
    }
    // If no url, keep local path (placeholder gradient will show on error)
  });
}

// ===== SLIDE NAVIGATION =====
function showSlide(n) {
  // Remove active from all
  document.querySelectorAll('.slide').forEach(s => {
    s.classList.remove('active', 'exit');
  });
  // Update dots
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i + 1 === n);
  });
  // Activate slide
  const slide = document.getElementById(`slide-${n}`);
  if (slide) {
    slide.classList.add('active');
    onSlideEnter(n);
  }
  currentSlide = n;
}

function nextSlide() {
  if (currentSlide < totalSlides) {
    showSlide(currentSlide + 1);
  }
}

function goToSlide(n) {
  showSlide(n);
}

function replay() {
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
    b.style.visibility = 'visible';
    b.style.pointerEvents = 'auto';
  });
  document.getElementById('popped-count').textContent = '0';
  document.getElementById('reveal-message').classList.add('hidden');
  document.getElementById('balloon-continue').classList.add('hidden');
  // Reset flip cards
  document.querySelectorAll('.flip-card').forEach(c => c.classList.remove('flipped'));
  document.getElementById('cards-continue').classList.add('hidden');
  // Reset letter
  document.getElementById('letter-body').innerHTML = '';
  document.getElementById('letter-footer').classList.add('hidden');
  document.getElementById('letter-continue').classList.add('hidden');
  // Reset envelope
  document.getElementById('envelope').classList.remove('opened');
  document.getElementById('envelope').style.display = 'flex';
  document.getElementById('welcome-reveal').classList.add('hidden');
  document.getElementById('candle-counter').textContent = 'Tap the cake to blow all candles! 🌬️';
  document.getElementById('wish-bubble').classList.add('hidden');
  document.getElementById('cake-continue').classList.add('hidden');
  showSlide(1);
}

// ===== SLIDE ENTER EVENTS =====
function onSlideEnter(n) {
  if (n === 2 && !ageAnimDone) startAgeCounter();
  if (n === 3) resetCakeSlide();
  if (n === 4) resetBalloonGame();
  if (n === 7) startLetter();
  if (n === 8) launchFireworks();
  if (n === 9) launchHeartBurst();
}

// ===== SLIDE 1: ENVELOPE =====
function openEnvelope() {
  const env = document.getElementById('envelope');
  if (env.classList.contains('opened')) return;
  env.classList.add('opened');
  // Animate open
  setTimeout(() => {
    env.style.transform = 'scale(0.9)';
    env.style.opacity = '0';
    setTimeout(() => {
      env.style.display = 'none';
      const reveal = document.getElementById('welcome-reveal');
      reveal.classList.remove('hidden');
      spawnConfettiBurst();
    }, 400);
  }, 500);
}

// ===== SLIDE 2: AGE COUNTER =====
function startAgeCounter() {
  ageAnimDone = true;
  const desc = document.getElementById('age-desc');
  const t = document.getElementById('digit-tens');
  const o = document.getElementById('digit-ones');
  const btn = document.getElementById('age-continue');
  
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

// Blow ALL candles at once — single tap on cake
function blowAllCandles() {
  const candles = document.querySelectorAll('.candle');
  let alreadyAllBlown = true;
  candles.forEach(c => { if (!c.classList.contains('blown')) alreadyAllBlown = false; });
  if (alreadyAllBlown) return;

  // Stagger each candle blow for visual wow
  candles.forEach((candle, i) => {
    setTimeout(() => {
      if (!candle.classList.contains('blown')) {
        candle.classList.add('blown');
        createParticleBurst(candle, '#ffd700');
      }
    }, i * 100);
  });

  const counter = document.getElementById('candle-counter');
  counter.textContent = 'All candles blown! Your wish is granted! ⭐';

  document.getElementById('cake').classList.add('shake');
  setTimeout(() => document.getElementById('cake').classList.remove('shake'), 500);

  setTimeout(() => {
    document.getElementById('wish-bubble').classList.remove('hidden');
    document.getElementById('cake-continue').classList.remove('hidden');
    spawnConfettiBurst();
  }, 700);
}

// Legacy fallback — not used by UI
function blowCandle() { blowAllCandles(); }

function createParticleBurst(el, color) {
  const rect = el.getBoundingClientRect();
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width/2}px;
      top: ${rect.top}px;
      width: 6px; height: 6px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transition: all 0.6s ease-out;
    `;
    document.body.appendChild(p);
    const angle = (i / 8) * Math.PI * 2;
    const dist = 40 + Math.random() * 30;
    setTimeout(() => {
      p.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist - 20}px)`;
      p.style.opacity = '0';
    }, 10);
    setTimeout(() => p.remove(), 700);
  }
}

// ===== SLIDE 4: BALLOON POP =====
function resetBalloonGame() {
  balloonsPopped = 0;
  document.getElementById('popped-count').textContent = '0';
  document.getElementById('reveal-message').classList.add('hidden');
  document.getElementById('balloon-continue').classList.add('hidden');
  document.getElementById('reveal-words').textContent = '';
  const revSub = document.getElementById('reveal-sub');
  if (revSub) revSub.classList.add('hidden');
  document.querySelectorAll('.game-balloon').forEach(b => {
    b.classList.remove('popped');
    b.style.visibility = 'visible';
    b.style.pointerEvents = 'auto';
  });
}

function popBalloon(balloon) {
  if (balloon.classList.contains('popped')) return;
  balloon.classList.add('popped');
  balloonsPopped++;
  document.getElementById('popped-count').textContent = balloonsPopped;

  // Particle burst
  createParticleBurst(balloon, '#ff6b9d');

  // Build the revealed message word by word RIGHT AFTER EACH POP
  const poppedWords = [];
  document.querySelectorAll('.game-balloon').forEach(b => {
    if (b.classList.contains('popped')) poppedWords.push(b.dataset.word);
  });
  document.getElementById('reveal-words').textContent = poppedWords.join(' ');
  document.getElementById('reveal-message').classList.remove('hidden');

  // Show sub-message + continue after ALL popped
  if (balloonsPopped === totalBalloons) {
    setTimeout(() => {
      const revSub = document.getElementById('reveal-sub');
      if (revSub) revSub.classList.remove('hidden');
      document.getElementById('balloon-continue').classList.remove('hidden');
      spawnConfettiBurst();
    }, 400);
  }
}

// ===== SLIDE 5: FLIP CARDS =====
function flipCard(card) {
  if (card.classList.contains('flipped')) {
    card.classList.remove('flipped');
    return;
  }
  card.classList.add('flipped');
  cardsFlipped++;
  if (cardsFlipped >= 3) {
    setTimeout(() => {
      document.getElementById('cards-continue').classList.remove('hidden');
    }, 600);
  }
}

// ===== SLIDE 6: GALLERY / LIGHTBOX =====
function getPhotoUrls() {
  return PHOTO_CONFIG.map((cfg, i) =>
    cfg.url ? getDriveUrl(cfg.url) : `photos/photo${i + 1}.jpg`
  );
}

function openLightbox(idx) {
  lightboxIndex = idx;
  const photos = getPhotoUrls();
  document.getElementById('lightbox-img').src = photos[idx];
  document.getElementById('lb-caption').textContent = PHOTO_CONFIG[idx].caption;
  document.getElementById('lightbox').classList.remove('hidden');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
}

function changeLightboxPhoto(dir) {
  const photos = getPhotoUrls();
  lightboxIndex = (lightboxIndex + dir + photos.length) % photos.length;
  document.getElementById('lightbox-img').src = photos[lightboxIndex];
  document.getElementById('lb-caption').textContent = PHOTO_CONFIG[lightboxIndex].caption;
}

// ===== SLIDE 7: LETTER — instant paragraph reveal =====
const letterParagraphs = [
  "Happy Birthday to someone who has always been special in her own unique way.",
  "You may be short in height, but your presence has always been larger than life. Your smile has a way of making everything around you feel brighter, your eyes sparkle like countless stars in the night sky, and your beauty is as gentle and peaceful as the moon. If angels walked among us, I think they'd look a little like you.",
  "Life doesn't always unfold the way we hope, but some people continue to leave a beautiful mark on our hearts. No matter where life takes us, I sincerely wish you endless happiness, good health, success, and countless reasons to smile.",
  "May this new chapter of your life be filled with laughter, exciting adventures, dreams coming true, and people who cherish you the way you deserve.",
  "Keep shining like the stars.\nKeep glowing like the moon.\nKeep being the wonderful person you are.",
  "Happy Birthday once again, Sravanii! 🌙✨"
];

function startLetter() {
  const body = document.getElementById('letter-body');
  const footer = document.getElementById('letter-footer');
  const btn = document.getElementById('letter-continue');
  body.innerHTML = '';
  footer.classList.add('hidden');
  btn.classList.add('hidden');

  // Reveal each paragraph instantly with stagger animation
  letterParagraphs.forEach((para, i) => {
    const p = document.createElement('p');
    p.className = 'letter-para';
    p.style.animationDelay = `${i * 0.18}s`;
    // Handle \n within a paragraph as <br>
    p.innerHTML = para.replace(/\n/g, '<br>');
    body.appendChild(p);
  });

  // Show footer after all paragraphs appear
  const totalDelay = letterParagraphs.length * 180 + 300;
  setTimeout(() => {
    footer.classList.remove('hidden');
    btn.classList.remove('hidden');
  }, totalDelay);
}

// ===== SLIDE 8: FIREWORKS =====
function launchFireworks() {
  const container = document.getElementById('slide-8');
  if (!container) return;
  let fw = 0;
  const interval = setInterval(() => {
    if (fw++ > 15) { clearInterval(interval); return; }
    createFirework(container);
  }, 250);
}

function createFirework(container) {
  const colors = ['#ff6b9d','#ffd700','#c77dff','#4d96ff','#6bcb77','#ff9a00'];
  const x = 10 + Math.random() * 80;
  const y = 10 + Math.random() * 60;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    const angle = (i / 20) * Math.PI * 2;
    const dist = 30 + Math.random() * 50;
    p.style.cssText = `
      position:fixed;left:${x}vw;top:${y}vh;
      width:5px;height:5px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:50%;
      pointer-events:none;z-index:9999;
      transition:all 0.8s ease-out;
      transform:translate(0,0);
    `;
    document.body.appendChild(p);
    setTimeout(() => {
      p.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`;
      p.style.opacity = '0';
      p.style.width = '3px'; p.style.height = '3px';
    }, 10);
    setTimeout(() => p.remove(), 900);
  }
}

// ===== SLIDE 9: HEART BURST =====
function launchHeartBurst() {
  spawnConfettiBurst();
  const hearts = ['💖','💗','💕','💓','❤️','🌸','✨','⭐'];
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      h.style.cssText = `
        position:fixed;
        left:${Math.random()*100}vw;
        top:105vh;
        font-size:${1 + Math.random()*2}rem;
        pointer-events:none;z-index:9999;
        animation: rise-heart 3s ease forwards;
      `;
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 3100);
    }, i * 150);
  }
}

// ===== CONFETTI BURST =====
function spawnConfettiBurst() {
  const colors = ['#ff6b9d','#ffd700','#c77dff','#4d96ff','#6bcb77','#ff9a00','#fff'];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.left = `${10 + Math.random() * 80}vw`;
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.width = `${5 + Math.random() * 8}px`;
    c.style.height = `${5 + Math.random() * 8}px`;
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    c.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
    c.style.animationDelay = `${Math.random() * 0.5}s`;
    document.getElementById('confetti-container').appendChild(c);
    setTimeout(() => c.remove(), 3000);
  }
}

// ===== BACKGROUND CONFETTI (continuous) =====
function startConfetti() {
  const colors = ['#ff6b9d','#ffd700','#c77dff','#4d96ff','#6bcb77','#ff9a00'];
  confettiInterval = setInterval(() => {
    if (Math.random() > 0.6) return;
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.left = `${Math.random() * 100}vw`;
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.width = `${4 + Math.random() * 6}px`;
    c.style.height = `${4 + Math.random() * 6}px`;
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    c.style.animationDuration = `${3 + Math.random() * 3}s`;
    document.getElementById('confetti-container').appendChild(c);
    setTimeout(() => c.remove(), 6500);
  }, 300);
}

// ===== BACKGROUND BALLOONS =====
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

// ===== STARS =====
function createStars() {
  const container = document.getElementById('stars-container');
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.textContent = Math.random() > 0.7 ? '✦' : '·';
    s.style.left = `${Math.random() * 100}vw`;
    s.style.top = `${Math.random() * 100}vh`;
    s.style.fontSize = `${6 + Math.random() * 12}px`;
    s.style.animationDuration = `${1.5 + Math.random() * 3}s`;
    s.style.animationDelay = `${Math.random() * 3}s`;
    container.appendChild(s);
  }
}

// ===== MUSIC (Web Audio API) =====
function toggleMusic() {
  if (musicPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
}

function startMusic() {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.15;
    gainNode.connect(audioCtx.destination);
    musicPlaying = true;
    document.getElementById('music-btn').classList.add('playing');
    document.getElementById('music-icon').textContent = '🎶';
    playMelody();
  } catch(e) {
    console.log('Audio not supported:', e);
  }
}

function stopMusic() {
  if (audioCtx) {
    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    setTimeout(() => {
      try { audioCtx.close(); } catch(e) {}
      audioCtx = null;
    }, 200);
  }
  if (musicInterval) clearInterval(musicInterval);
  musicPlaying = false;
  document.getElementById('music-btn').classList.remove('playing');
  document.getElementById('music-icon').textContent = '🎵';
}

function playNote(freq, start, duration, type = 'sine') {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const env = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0, audioCtx.currentTime + start);
  env.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + start + 0.02);
  env.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
  osc.connect(env);
  env.connect(gainNode);
  osc.start(audioCtx.currentTime + start);
  osc.stop(audioCtx.currentTime + start + duration + 0.05);
}

function playMelody() {
  // Happy Birthday melody - C D C F E / C D C G F / C c A F E D / Bb A F G F
  const melody = [
    {f:264,t:0.0,d:0.4},{f:264,t:0.5,d:0.2},{f:297,t:0.7,d:0.5},
    {f:264,t:1.3,d:0.5},{f:352,t:1.9,d:0.5},{f:330,t:2.5,d:0.9},
    {f:264,t:3.6,d:0.4},{f:264,t:4.0,d:0.2},{f:297,t:4.3,d:0.5},
    {f:264,t:4.9,d:0.5},{f:396,t:5.5,d:0.5},{f:352,t:6.1,d:0.9},
    {f:264,t:7.1,d:0.4},{f:264,t:7.5,d:0.2},{f:528,t:7.8,d:0.5},
    {f:440,t:8.4,d:0.5},{f:352,t:9.0,d:0.4},{f:330,t:9.5,d:0.4},{f:297,t:10.0,d:0.8},
    {f:470,t:11.0,d:0.4},{f:470,t:11.4,d:0.2},{f:440,t:11.7,d:0.5},
    {f:352,t:12.3,d:0.5},{f:396,t:12.9,d:0.5},{f:352,t:13.5,d:1.2}
  ];

  const playLoop = () => {
    if (!musicPlaying) return;
    melody.forEach(n => playNote(n.f, n.t, n.d, 'triangle'));
    const duration = 15000;
    setTimeout(() => { if (musicPlaying) playLoop(); }, duration);
  };
  playLoop();
}

// ===== SHARE =====
function sharePage() {
  const shareUrl = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: 'Happy Birthday Sravanii! 🎂',
      text: 'Hey Sravanii 🎉 Open this — I made something special just for you! ✨',
      url: shareUrl
    }).catch(() => copyLink(shareUrl));
  } else {
    copyLink(shareUrl);
  }
}

function copyLink(url) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(() => showShareToast('🎉 Link copied! Send it to Sravanii!')).catch(() => fallbackCopy(url));
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(url) {
  const el = document.createElement('textarea');
  el.value = url;
  el.style.position = 'fixed'; el.style.opacity = '0';
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
    animation: fadeIn 0.3s ease;
  `;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.5s'; }, 2500);
  setTimeout(() => t.remove(), 3100);
}

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    if (currentSlide < totalSlides) showSlide(currentSlide + 1);
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    if (currentSlide > 1) showSlide(currentSlide - 1);
  }
  if (e.key === 'Escape') closeLightbox();
});

// ===== ADD HEART RISE KEYFRAME =====
const style = document.createElement('style');
style.textContent = `
@keyframes rise-heart {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-110vh) rotate(720deg); opacity: 0; }
}
`;
document.head.appendChild(style);
