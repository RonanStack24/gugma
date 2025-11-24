/* -------------------------------------------------
   ELEMENTS
------------------------------------------------- */
const startScreen = document.getElementById("start-screen");
const backgroundMusic = document.getElementById("background-music");

const questionText = document.getElementById("question-text");
const mainContainer = document.getElementById("main-container");

const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");

const cryGif = document.getElementById("cry-gif");
const shockGif = document.getElementById("shock-gif");
const runGif = document.getElementById("run-gif");

const resultContent = document.getElementById("result-content");
const resultGif = document.getElementById("result-gif");

const heartCanvas = document.getElementById("heart-canvas");
const emojiLayer = document.getElementById("emoji-layer");
const sparklesContainer = document.getElementById("sparkles");

const popSfx = document.getElementById("pop-sfx");

let fadeLevel = 1;

/* -------------------------------------------------
   TYPE QUESTION
------------------------------------------------- */
const questionString = "Will you be my beautiful girlfriend?";
let typingIndex = 0;

function typeQuestion() {
  if (typingIndex <= questionString.length) {
    questionText.textContent = questionString.slice(0, typingIndex);
    typingIndex++;
    setTimeout(typeQuestion, 40);
  } else {
    yesBtn.classList.add("heart-pulse");
    setTimeout(() => yesBtn.classList.remove("heart-pulse"), 2000);
  }
}

/* -------------------------------------------------
   START SCREEN (START MUSIC)
------------------------------------------------- */
startScreen.addEventListener("click", () => {
  backgroundMusic.volume = 0.55;
  backgroundMusic.play().catch(() => {});
  startScreen.style.opacity = "0";
  setTimeout(() => startScreen.remove(), 700);
  typeQuestion();
  startHeartBackground();
});

/* -------------------------------------------------
   HEART BACKGROUND (CANVAS)
------------------------------------------------- */
const ctx = heartCanvas.getContext("2d");

function resizeCanvas() {
  heartCanvas.width = window.innerWidth;
  heartCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

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
    if (this.y < -60) this.reset();
  }
  reset() {
    this.y = heartCanvas.height + 40;
    this.x = Math.random() * heartCanvas.width;
  }
  draw() {
    ctx.font = `${this.size}px Arial`;
    ctx.globalAlpha = this.opacity;
    ctx.fillText(this.emoji, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

function startHeartBackground() {
  for (let i = 0; i < 40; i++) hearts.push(new Heart());

  (function animate() {
    ctx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    if (hearts.length < 60) hearts.push(new Heart());
    hearts.forEach((h) => {
      h.update();
      h.draw();
    });
    requestAnimationFrame(animate);
  })();
}

/* -------------------------------------------------
   EMOJI PARTICLES
------------------------------------------------- */
function spawnEmoji(xPercent) {
  const el = document.createElement("div");
  el.className = "emoji-particle";
  const pool = ["💘", "💕", "💞", "💓", "💝", "✨"];
  el.textContent = pool[Math.floor(Math.random() * pool.length)];
  el.style.left = (xPercent || 20 + Math.random() * 60) + "vw";
  el.style.bottom = 6 + Math.random() * 6 + "vh";
  emojiLayer.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

setInterval(() => spawnEmoji(), 1100);

/* -------------------------------------------------
   SPARKLES
------------------------------------------------- */
yesBtn.addEventListener("mouseenter", (e) => {
  createSpark(e.clientX - 8, 22);
});
yesBtn.addEventListener("click", (e) => {
  for (let i = 0; i < 12; i++) {
    createSpark(e.clientX + (Math.random() * 120 - 60), 6 + Math.random() * 40);
  }
});

function createSpark(x, y) {
  const s = document.createElement("div");
  s.className = "floating-heart";
  s.textContent = "✨";
  s.style.left = `${x}px`;
  s.style.bottom = `${y}px`;
  s.style.fontSize = 10 + Math.random() * 12 + "px";
  sparklesContainer.appendChild(s);
  setTimeout(() => s.remove(), 900);
}

/* -------------------------------------------------
   NO BUTTON (RUN AWAY + FADE)
------------------------------------------------- */
function placeNoRandomly() {
  const rect = mainContainer.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const padding = 12;

  const maxX = rect.width - btnRect.width - padding * 2;
  const maxY = rect.height - btnRect.height - padding * 2;

  noBtn.style.position = "fixed";
  noBtn.style.left = rect.left + padding + Math.random() * maxX + "px";
  noBtn.style.top = rect.top + padding + Math.random() * maxY + "px";
}
setTimeout(placeNoRandomly, 150);

noBtn.addEventListener("mouseover", moveNoButton);
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNoButton();
});

function moveNoButton() {
  placeNoRandomly();
  spawnEmoji();
  showRandomGif();
}

function showRandomGif() {
  const r = Math.random();
  [cryGif, shockGif, runGif].forEach((g) => g.classList.remove("show"));

  if (r < 0.33) cryGif.classList.add("show");
  else if (r < 0.66) shockGif.classList.add("show");
  else runGif.classList.add("show");

  setTimeout(() => {
    cryGif.classList.remove("show");
    shockGif.classList.remove("show");
    runGif.classList.remove("show");
  }, 2300);
}

noBtn.addEventListener("click", () => {
  fadeLevel = Math.max(0, fadeLevel - 0.1);
  noBtn.style.opacity = fadeLevel;

  if (fadeLevel <= 0.25) {
    showRandomGif();
    const prev = questionText.textContent;
    questionText.textContent = "Please... don't go!";
    setTimeout(() => (questionText.textContent = prev), 1800);
  }
});

/* -------------------------------------------------
   YES CLICK (CONFETTI + EMAIL)
------------------------------------------------- */
yesBtn.addEventListener("click", () => {
  startConfetti();
  spawnEmoji();
  resultContent.classList.remove("hidden");
  resultGif.src = "kiss.gif";

  setTimeout(() => playLoveMessage(), 700);

  sendEmailYes(); // 👈 EMAIL FEATURE
});

/* -------------------------------------------------
   EMAIL SEND FEATURE (WEB3FORMS)
------------------------------------------------- */
function sendEmailYes() {
  const data = {
    access_key: "412d055a-99e6-4a18-b731-7f9188a6bf93",
    from_name: "Love Website",
    subject: "She clicked YES! ❤️",
    message: "She clicked YES on your love page! 💖",
  };

  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => {
      console.log("Email sent!", res);
    })
    .catch((err) => console.error("Email error:", err));
}

/* -------------------------------------------------
   CONFETTI
------------------------------------------------- */
function startConfetti() {
  const duration = 2200;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 9,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 9,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* -------------------------------------------------
   LOVE MESSAGE POPUP
------------------------------------------------- */
function playLoveMessage() {
  const overlay = document.createElement("div");
  overlay.style = `
    position:fixed;inset:0;display:flex;align-items:center;
    justify-content:center;background:rgba(0,0,0,0.45);z-index:9999;
  `;

  const card = document.createElement("div");
  card.style = `
    background:white;padding:20px 26px;border-radius:14px;
    max-width:420px;text-align:center;
  `;
  card.innerHTML = `
      <h3 style="color:#b2157a;font-weight:800">Thank you 💖</h3>
      <p>You made me the happiest. I love you! ❤️</p>
      <button style="
          padding:8px 14px;border-radius:10px;border:0;
          background:linear-gradient(135deg,#ff7acb,#7b2cbf);
          color:white;font-weight:700;cursor:pointer;">
          Close
      </button>
  `;
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  card.querySelector("button").onclick = () => overlay.remove();
}
