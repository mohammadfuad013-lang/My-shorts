const TOTAL = 30;

const scenes = [
  {
    start: 0,
    end: 6,
    number: "1/5",
    caption: "12:03 AM… HIS PHONE VIBRATED.",
    voice: "At exactly 12:03 AM, his phone suddenly vibrated.",
    phone: false,
    message: "",
    speech: "",
    mode: "walking"
  },

  {
    start: 6,
    end: 14,
    number: "2/5",
    caption: "DON'T GO HOME TONIGHT.",
    voice: "The message was from an unknown number: Don't go home tonight.",
    phone: true,
    message: "Don't go home tonight.",
    speech: "",
    mode: "shock"
  },

  {
    start: 14,
    end: 22,
    number: "3/5",
    caption: "HE THOUGHT IT WAS A JOKE…",
    voice: "He thought it was a joke… until another message arrived.",
    phone: true,
    message: "Don't go home tonight.",
    speech: "Who sent this?",
    mode: "walking"
  },

  {
    start: 22,
    end: 27,
    number: "4/5",
    caption: "I CAN SEE YOU. 😳",
    voice: "The second message said… I can see you.",
    phone: true,
    message: "I CAN SEE YOU.",
    speech: "",
    mode: "shock"
  },

  {
    start: 27,
    end: 30,
    number: "5/5",
    caption: "",
    voice: "He slowly turned around…",
    phone: false,
    message: "",
    speech: "",
    mode: "look-back"
  }
];

const character = document.getElementById("character");
const phoneScreen = document.getElementById("phoneScreen");
const phoneMessage = document.getElementById("phoneMessage");
const speech = document.getElementById("speech");
const caption = document.getElementById("caption");
const voiceLine = document.getElementById("voiceLine");
const sceneNumber = document.getElementById("sceneNumber");
const progressFill = document.getElementById("progressFill");

const playBtn = document.getElementById("playBtn");
const restartBtn = document.getElementById("restartBtn");
const soundBtn = document.getElementById("soundBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const blackout = document.getElementById("blackout");
const drama = document.getElementById("drama");

let elapsed = 0;
let playing = false;
let lastTime = null;
let raf = null;
let soundOn = true;
let audioCtx = null;


// -----------------------------
// AUDIO
// -----------------------------

function setupAudio() {
  if (!soundOn) return;

  if (!audioCtx) {
    audioCtx = new (
      window.AudioContext ||
      window.webkitAudioContext
    )();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function beep(freq = 500, duration = 0.12, type = "sine") {

  if (!soundOn) return;

  setupAudio();

  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(
    0.0001,
    audioCtx.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.12,
    audioCtx.currentTime + 0.01
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + duration
  );

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();

  osc.stop(
    audioCtx.currentTime +
    duration +
    0.02
  );
}


// -----------------------------
// FIND CURRENT SCENE
// -----------------------------

function currentScene(time) {

  return scenes.find(
    scene =>
      time >= scene.start &&
      time < scene.end
  ) || scenes[scenes.length - 1];

}


// -----------------------------
// UPDATE SCREEN
// -----------------------------

function render(time) {

  const scene = currentScene(time);

  sceneNumber.textContent =
    scene.number;

  progressFill.style.width =
    `${Math.min(
      100,
      (time / TOTAL) * 100
    )}%`;


  // Caption

  caption.textContent =
    scene.caption;

  caption.classList.toggle(
    "show",
    Boolean(scene.caption)
  );


  // Voice text

  voiceLine.textContent =
    scene.voice;


  // Phone

  phoneScreen.classList.toggle(
    "show",
    scene.phone
  );

  phoneMessage.textContent =
    scene.message || "";


  // Speech bubble

  speech.textContent =
    scene.speech;

  speech.classList.toggle(
    "show",
    Boolean(scene.speech)
  );


  // Character animation

  character.className =
    "character " + scene.mode;


  // Final scene

  if (time >= 27) {

    blackout.classList.add("show");

  } else {

    blackout.classList.remove("show");

  }

}


// -----------------------------
// ANIMATION LOOP
// -----------------------------

function tick(now) {

  if (!playing) return;

  if (lastTime === null) {
    lastTime = now;
  }

  const delta =
    (now - lastTime) / 1000;

  lastTime = now;

  const oldScene =
    currentScene(elapsed);

  elapsed += delta;


  // End

  if (elapsed >= TOTAL) {

    elapsed = TOTAL;

    playing = false;

    playBtn.textContent =
      "▶ Play";

    lastTime = null;

    render(elapsed);

    return;
  }


  const newScene =
    currentScene(elapsed);


  // Scene change sounds

  if (oldScene !== newScene) {

    // Phone notification

    if (newScene.number === "2/5") {

      beep(
        700,
        0.18,
        "square"
      );

    }


    // Dramatic reveal

    if (newScene.number === "4/5") {

      beep(
        110,
        0.25,
        "sawtooth"
      );

      setTimeout(() => {

        beep(
          90,
          0.18,
          "sawtooth"
        );

      }, 130);

    }

  }


  render(elapsed);

  raf =
    requestAnimationFrame(tick);
}


// -----------------------------
// PLAY
// -----------------------------

function play() {

  setupAudio();

  if (elapsed >= TOTAL) {

    elapsed = 0;

    render(elapsed);

  }

  playing = true;

  lastTime = null;

  playBtn.textContent =
    "❚❚ Pause";

  raf =
    requestAnimationFrame(tick);
}


// -----------------------------
// PAUSE
// -----------------------------

function pause() {

  playing = false;

  lastTime = null;

  playBtn.textContent =
    "▶ Play";

  if (raf) {

    cancelAnimationFrame(raf);

  }

}


// -----------------------------
// PLAY BUTTON
// -----------------------------

playBtn.addEventListener(
  "click",
  () => {

    if (playing) {

      pause();

    } else {

      play();

    }

  }
);


// -----------------------------
// RESTART
// -----------------------------

restartBtn.addEventListener(
  "click",
  () => {

    pause();

    elapsed = 0;

    render(elapsed);

  }
);


// -----------------------------
// SOUND
// -----------------------------

soundBtn.addEventListener(
  "click",
  () => {

    soundOn = !soundOn;

    soundBtn.textContent =
      soundOn
        ? "🔊 Sound"
        : "🔇 Muted";

    if (soundOn) {

      setupAudio();

    }

  }
);


// -----------------------------
// FULLSCREEN
// -----------------------------

fullscreenBtn.addEventListener(
  "click",
  async () => {

    try {

      if (!document.fullscreenElement) {

        await drama.requestFullscreen();

      } else {

        await document.exitFullscreen();

      }

    } catch (error) {

      console.log(
        "Fullscreen unavailable:",
        error
      );

    }

  }
);


// -----------------------------
// START
// -----------------------------

render(0);
