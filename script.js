/* ---------------------------
   Elements
----------------------------*/
const startScreen = document.getElementById("start-screen");
const backgroundMusic = document.getElementById("background-music");

const questionText = document.getElementById("question-text");
const mainContainer = document.getElementById("main-container");
const buttonGroup = document.getElementById("button-group");

const yesBtn =
  document.getElementById("yes-btn") ||
  (() => {
    /* If you used class "yes" not id, fallback */
    const el = document.querySelector(".yes");
    if (el) el.id = "yes-btn";
    return document.getElementById("yes-btn");
  })();
const noBtn =
  document.getElementById("no-btn") ||
  (() => {
    const el = document.querySelector(".no");
    if (el) el.id = "no-btn";
    return document.getElementById("no-btn");
  })();

const cryGif = document.getElementById("cry-gif");
const shockGif = document.getElementById("shock-gif");
const runGif = document.getElementById("run-gif");

const resultContent = document.getElementById("result-content");
const resultGif = document.getElementById("result-gif");

const heartCanvas = document.getElementById("heart-canvas");
const emojiLayer = document.getElementById("emoji-layer");
const sparklesContainer = document.getElementById("sparkles");
const popSfx = document.getElementById("pop-sfx");
const sparkSfx = document.getElementById("spark-sfx");

let fadeLevel = 1.0; // NO button opacity tracker

/* ---------------------------
   Starter: typing animation + start-screen
----------------------------*/
const questionString = "Will you be my beautiful girlfriend?";
let typingIndex = 0;
function typeQuestion() {
  if (typingIndex <= questionString.length) {
    questionText.textContent = questionString.slice(0, typingIndex);
    typingIndex++;
    setTimeout(typeQuestion, 40); // typing speed
  } else {
    // small pulse on yes button once typing is done
    yesBtn.classList.add("heart-pulse");
    setTimeout(() => yesBtn.classList.remove("heart-pulse"), 2000);
  }
}

/* Start screen click: enable audio and start typing + hearts */
startScreen.addEventListener("click", () => {
  // start audio safely
  backgroundMusic.volume = 0.55;
  backgroundMusic.play().catch(() => {});

  // hide start screen
  startScreen.style.opacity = "0";
  setTimeout(() => startScreen.remove(), 700);

  // start typing and hearts
  typeQuestion();
  startHeartBackground();
});

/* ---------------------------
   Heart background (canvas) - simple hearts drawn as emoji for performance
----------------------------*/
const ctx = heartCanvas.getContext?.("2d");
function resizeCanvas() {
  heartCanvas.width = window.innerWidth;
  heartCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let hearts = [];
class Heart {
  constructor() {
    this.x = Math.random() * heartCanvas.width;
    this.y = heartCanvas.height + Math.random() * 300;
    this.speed = 0.5 + Math.random() * 1.2;
    this.size = 12 + Math.random() * 20;
    this.opacity = 0.3 + Math.random() * 0.6;
    this.drift = Math.random() * 0.6 - 0.3;
    this.emoji = Math.random() > 0.6 ? "💖" : "❤️";
  }
  update() {
    this.y -= this.speed;
    this.x += this.drift;
    if (this.y < -60) {
      this.y = heartCanvas.height + 40;
      this.x = Math.random() * heartCanvas.width;
    }
  }
  draw() {
    if (!ctx) return;
    ctx.font = `${this.size}px Arial`;
    ctx.globalAlpha = this.opacity;
    ctx.fillText(this.emoji, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}
function startHeartBackground() {
  // seed a few hearts
  for (let i = 0; i < 40; i++) hearts.push(new Heart());
  (function loop() {
    if (!ctx) return;
    ctx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    if (hearts.length < 60) hearts.push(new Heart());
    hearts.forEach((h) => {
      h.update();
      h.draw();
    });
    requestAnimationFrame(loop);
  })();
}

/* ---------------------------
   Emoji particles (extra cuteness)
----------------------------*/
function spawnEmoji(xPercent) {
  const el = document.createElement("div");
  el.className = "emoji-particle";
  const emojis = ["💘", "💕", "💞", "💓", "💝"];
  el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  // random horizontal position in viewport or near center
  const left = Math.max(8, Math.min(92, xPercent || 40 + Math.random() * 20));
  el.style.left = `${left}vw`;
  el.style.bottom = `${6 + Math.random() * 6}vh`;
  emojiLayer.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

/* spawn periodic emojis */
setInterval(() => spawnEmoji(20 + Math.random() * 60), 1100);

/* ---------------------------
   Sparkles around YES when hovered/clicked
----------------------------*/
function createSpark(x, y) {
  if (!sparklesContainer) return;
  const s = document.createElement("div");
  s.className = "floating-heart";
  s.textContent = "✨";
  s.style.left = `${x}px`;
  s.style.bottom = `${y}px`;
  s.style.fontSize = `${8 + Math.random() * 12}px`;
  s.style.opacity = 0.95;
  sparklesContainer.appendChild(s);
  setTimeout(() => s.remove(), 900);
}

yesBtn.addEventListener("mouseenter", (e) => {
  // small sparkle effect
  createSpark(e.clientX - 8, 22);
  playSound(sparkSfx);
});
yesBtn.addEventListener("click", (e) => {
  // big sparkling burst
  for (let i = 0; i < 12; i++) {
    createSpark(e.clientX + (Math.random() * 120 - 60), 6 + Math.random() * 40);
  }
  playSound(popSfx);
});

/* ---------------------------
   NO button movement (runs away) + fades on clicks + shakes
----------------------------*/
function placeNoRandomlyInsideCard() {
  const rect = mainContainer.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const padding = 12;
  const maxX = Math.max(0, rect.width - btnRect.width - padding * 2);
  const maxY = Math.max(0, rect.height - btnRect.height - padding * 2);
  const x = rect.left + padding + Math.random() * maxX;
  const y = rect.top + padding + Math.random() * maxY;
  // place with fixed positioning relative to viewport to allow mobile movement
  noBtn.style.position = "fixed";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

/* First placement */
setTimeout(placeNoRandomlyInsideCard, 80);

/* on hover (or touchstart) move */
function moveNoButton() {
  const rect = mainContainer.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const padding = 8;
  const maxX = Math.max(0, rect.width - btnRect.width - padding * 2);
  const maxY = Math.max(0, rect.height - btnRect.height - padding * 2);
  // bias random to move farther when clicked many times
  let multiplier = 1 + (1 - fadeLevel) * 1.6;
  const x = rect.left + padding + Math.random() * maxX * multiplier;
  const y = rect.top + padding + Math.random() * maxY * multiplier;
  noBtn.style.position = "fixed";
  noBtn.style.left = `${Math.min(
    window.innerWidth - btnRect.width - 8,
    Math.max(8, x)
  )}px`;
  noBtn.style.top = `${Math.min(
    window.innerHeight - btnRect.height - 8,
    Math.max(8, y)
  )}px`;
  // play small pop sound
  playSound(popSfx);
  // spawn a random reaction gif occasionally
  const r = Math.random();
  if (r < 0.38) showGif(cryGif);
  else if (r < 0.7) showGif(shockGif);
  else showGif(runGif);
}

noBtn.addEventListener("mouseover", moveNoButton);
/* mobile: if user taps the NO button area, move away a bit */
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNoButton();
});

/* NO click: fades away gradually + dramatic behavior */
noBtn.addEventListener("click", (e) => {
  // short shake effect
  noBtn.style.transition = "transform .08s";
  noBtn.style.transform = "translateX(-6px)";
  setTimeout(() => (noBtn.style.transform = "translateX(6px)"), 80);
  setTimeout(() => (noBtn.style.transform = ""), 160);

  // fade
  fadeLevel = Math.max(0, fadeLevel - 0.1);
  noBtn.style.opacity = fadeLevel;

  // spawn emoji particle to emphasize
  spawnEmoji((parseFloat(noBtn.style.left || 40) / window.innerWidth) * 100);

  // if mostly gone show dramatic GIF and gentle message
  if (fadeLevel <= 0.25) {
    showGif(cryGif);
    // a soft message: (use a small modal or change question text temporarily)
    const prev = questionText.textContent;
    questionText.textContent = "Please... don't go!";
    setTimeout(() => (questionText.textContent = prev), 1800);
  }
});

/* ---------------------------
   GIF reaction helpers
----------------------------*/
function showGif(gifEl) {
  [cryGif, shockGif, runGif].forEach((g) => g.classList.remove("show"));
  if (!gifEl) return;
  gifEl.classList.add("show");
  setTimeout(() => gifEl.classList.remove("show"), 2300);
}

/* ---------------------------
   YES click: confetti, sound, auto love message
----------------------------*/
function startConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 8,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#ff7acb", "#ffd1ff", "#7b2cbf", "#fff29b"],
    });
    confetti({
      particleCount: 8,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#ff7acb", "#ffd1ff", "#7b2cbf", "#fff29b"],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* play love message modal (simple auto text) */
function playLoveMessage() {
  // small overlay
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = 9999;
  overlay.style.background = "rgba(0,0,0,0.45)";

  const card = document.createElement("div");
  card.style.background = "white";
  card.style.padding = "20px 26px";
  card.style.borderRadius = "14px";
  card.style.maxWidth = "420px";
  card.style.textAlign = "center";
  card.innerHTML = `<h3 style="margin:0 0 8px;color:#b2157a;font-weight:800">Thank you 💖</h3>
                    <p style="margin:0 0 12px">You made me the happiest. Let's make beautiful memories together ❤️</p>
                    <button id="close-love" style="padding:8px 14px;border-radius:10px;border:0;background:linear-gradient(135deg,#ff7acb,#7b2cbf);color:white;font-weight:700;cursor:pointer">Close</button>`;
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  document
    .getElementById("close-love")
    .addEventListener("click", () => overlay.remove());
}

/* yes click binding */
yesBtn.addEventListener("click", (e) => {
  // confetti + sound + sparkles + emojis
  startConfetti();
  playSound(popSfx);
  for (let i = 0; i < 14; i++) {
    spawnEmoji(20 + Math.random() * 60);
  }
  // show result content
  resultContent.classList.remove("hidden");
  // show celebratory gif
  if (resultGif) resultGif.src = "kiss.gif";
  // small timed overlay message
  setTimeout(() => playLoveMessage(), 700);
});

/* ---------------------------
   Sound helper
----------------------------*/
function playSound(audioEl) {
  try {
    if (!audioEl) return;
    audioEl.currentTime = 0;
    audioEl.volume = 0.6;
    audioEl.play().catch(() => {});
  } catch (e) {}
}

/* ---------------------------
   Utility: spawn emoji (used by NO/YES)
----------------------------*/
function spawnEmoji(xPercent) {
  const el = document.createElement("div");
  el.className = "emoji-particle";
  const pool = ["💘", "💕", "💞", "💓", "💝", "✨"];
  el.textContent = pool[Math.floor(Math.random() * pool.length)];
  el.style.left =
    (typeof xPercent === "number" ? xPercent : 20 + Math.random() * 60) + "vw";
  el.style.bottom = 6 + Math.random() * 6 + "vh";
  emojiLayer.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

/* ---------------------------
   Initial placement & small vfx
----------------------------*/
setTimeout(() => {
  // ensure NO button in a good spot initially
  try {
    placeNoRandomlyInsideCard();
  } catch (e) {}
}, 150);

/* helper used earlier - emulate function declaration here */
function placeNoRandomlyInsideCard() {
  const rect = mainContainer.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const padding = 12;
  const maxX = Math.max(0, rect.width - btnRect.width - padding * 2);
  const maxY = Math.max(0, rect.height - btnRect.height - padding * 2);
  const x = rect.left + padding + Math.random() * maxX;
  const y = rect.top + padding + Math.random() * maxY;
  noBtn.style.position = "fixed";
  noBtn.style.left = `${Math.min(
    window.innerWidth - btnRect.width - 8,
    Math.max(8, x)
  )}px`;
  noBtn.style.top = `${Math.min(
    window.innerHeight - btnRect.height - 8,
    Math.max(8, y)
  )}px`;
}

/* ---------------------------
   Accessibility & touch fallback
----------------------------*/
window.addEventListener("resize", () => {
  // ensure canvas resizes
  if (heartCanvas) {
    resizeCanvas();
  }
});
function resizeCanvas() {
  heartCanvas.width = window.innerWidth;
  heartCanvas.height = window.innerHeight;
}

/* ---------------------------
   Kick off small animated hearts (non-canvas alternative for older browsers)
----------------------------*/
setInterval(() => {
  const el = document.createElement("div");
  el.className = "floating-heart";
  el.innerText = "💖";
  el.style.left = Math.random() * 100 + "vw";
  el.style.fontSize = 12 + Math.random() * 28 + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}, 650);

/* ensure canvas sizing initially */
resizeCanvas();
