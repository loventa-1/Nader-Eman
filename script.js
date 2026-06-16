/* ════════════════════════════════════════════════════════════════════
   WEDDING INVITATION · script.js
   ════════════════════════════════════════════════════════════════════ */

"use strict";

/* ─── CONFIGURATION ──────────────────────────────────────────────────
     🔹 UPDATE THESE VALUES WITH YOUR DATA 🔹
   ────────────────────────────────────────────────────────────────── */
const CONFIG = {
  // --- Wedding Info ---
  groomName: "Nader",
  brideName: "Eman",
  groomNameAr: "نادر",
  brideNameAr: "ايمان",
  weddingDate: "September 25, 2026",
  weddingDateAr: "٢٥ سبتمبر ٢٠٢٦",
  weddingTime: "7:00 PM",
  weddingLocation: "Villa laguna el marrioteya",
  weddingLocationAr: "اول سقاره فيلا لاجوانا",
  weddingMapLink:
    "https://www.google.com/maps/place/(+%DA%A4%D9%8A%D9%84%D8%A7+%D9%84%D8%A7%D8%AC%D9%88%D9%86%D8%A7+)+Villa+laguna+el+marrioteya%E2%80%AD/@29.9728594,31.1772494,18.39z/data=!4m6!3m5!1s0x145847509e09a28b:0xb407cd40e9587a71!8m2!3d29.9728393!4d31.1770239!16s%2Fg%2F11n052lhc7!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDYxMC4wIKXMDSoASAFQAw%3D%3D",

  // --- WhatsApp Numbers (for RSVP) ---
  groomWhatsapp: "201120517067",
  brideWhatsapp: "201122241232",

  // --- Social Media Links ---
  social: {
    whatsapp: "https://wa.me/201505646406",
    phone: "tel:+201505646406",
    tiktok: "https://www.tiktok.com/@loventa68",
    instagram: "https://www.instagram.com/love__nta/",
    facebook:
      "https://www.facebook.com/profile.php?id=61565289157594&mibextid=wwXIfr&rdid=LvOEQfQIXRkCukV0&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Ck7EUrzmW%2F%3Fmibextid%3DwwXIfr#",
  },

  // --- Contact Info (displayed in footer) ---
  contactPhone: "+201505646406",
  contactEmail: "midoreda66029@gmail.com",

  // --- Asset Paths ---
  assets: {
    crest: "assets/images/logo (1).webp",
    doorStatic: "assets/images/photo_2026-04-30_07-13-50.jpg",
    doorGif: "assets/images/IMG_4681.MP4",
    detailsBg: "assets/images/background.jpg",
    music: "assets/music/music1.mp3",
  },

  // --- Music Volume (0 to 1) ---
  musicVolume: 0.65,
};

/* ─── STATE ──────────────────────────────────────────────────────── */
let currentLang = "en";
let loadProgress = 0;
let doorPlayed = false;
let currentWhatsAppMessage = "";
let bgMusic = null;
let countdownInterval = null;
let isMusicPlaying = false;
let audioContextUnlocked = false;

/* ─── DOM REFS ───────────────────────────────────────────────────── */
const pageLoading = document.getElementById("page-loading");
const pageDoor = document.getElementById("page-door");
const pageDetails = document.getElementById("page-details");
const loadingBar = document.getElementById("loading-bar");
const doorGif = document.getElementById("door-gif");
const doorGlowRing = document.getElementById("door-glow-ring");
const knockBtn = document.getElementById("knock-btn");
const langBtnDoor = document.getElementById("lang-btn-door");
const langBtnDet = document.getElementById("lang-btn-details");
const rsvpForm = document.getElementById("rsvp-form");
const rsvpSuccess = document.getElementById("rsvp-success");
const particles = document.getElementById("particles");
const petalsWrap = document.getElementById("petals");
const musicControlBtn = document.getElementById("music-control-btn");

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const countdownMsgEn = document.getElementById("countdown-message");
const countdownMsgAr = document.getElementById("countdown-message-ar");

/* ─── AUDIO UNLOCK ───────────────────────────────────────────────── */
function unlockAudioContext() {
  if (audioContextUnlocked || !bgMusic) return;

  const unlock = () => {
    if (audioContextUnlocked) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const context = new AudioContext();
      const gain = context.createGain();
      gain.gain.value = 0;
      gain.connect(context.destination);
      const oscillator = context.createOscillator();
      oscillator.connect(gain);
      oscillator.start(0);
      oscillator.stop(0.001);
      context.close();
    }

    if (bgMusic && bgMusic.paused) {
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            bgMusic.pause();
            bgMusic.currentTime = 0;
            audioContextUnlocked = true;
          })
          .catch(() => {});
      }
    }
    audioContextUnlocked = true;
  };

  document.addEventListener("click", unlock, { once: true });
  document.addEventListener("touchstart", unlock, { once: true });
}

/* ─── COUNTDOWN ──────────────────────────────────────────────────── */
function initCountdown() {
  if (!daysEl) return;

  const dateTimeString = `${CONFIG.weddingDate} ${CONFIG.weddingTime}`;
  let targetDate = new Date(dateTimeString);
  if (isNaN(targetDate.getTime())) {
    targetDate = new Date(2026, 4, 28, 19, 0, 0);
  }

  function updateTimer() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      if (countdownInterval) clearInterval(countdownInterval);
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      if (countdownMsgEn)
        countdownMsgEn.textContent = "✨ The celebration has begun! ✨";
      if (countdownMsgAr) countdownMsgAr.textContent = "✨ بدأ الاحتفال! ✨";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    daysEl.textContent = days.toString().padStart(2, "0");
    hoursEl.textContent = hours.toString().padStart(2, "0");
    minutesEl.textContent = minutes.toString().padStart(2, "0");
    secondsEl.textContent = seconds.toString().padStart(2, "0");

    if (countdownMsgEn && days <= 7) {
      if (days === 0)
        countdownMsgEn.textContent = "🎉 Tomorrow is the big day! 🎉";
      else if (days <= 3)
        countdownMsgEn.textContent = "💛 Getting so close! 💛";
      else countdownMsgEn.textContent = "✨ Counting every moment ✨";
    }
    if (countdownMsgAr && days <= 7) {
      if (days === 0)
        countdownMsgAr.textContent = "🎉 غداً هو اليوم الكبير! 🎉";
      else if (days <= 3)
        countdownMsgAr.textContent = "💛 يقترب موعد الفرح! 💛";
      else countdownMsgAr.textContent = "✨ نعد كل لحظة ✨";
    }
  }

  updateTimer();
  countdownInterval = setInterval(updateTimer, 1000);
}

/* ─── AUDIO INIT ─────────────────────────────────────────────────── */
function initAudio() {
  bgMusic = document.getElementById("bg-music");
  if (CONFIG.assets.music && bgMusic) {
    bgMusic.src = CONFIG.assets.music;
    bgMusic.load();
    bgMusic.loop = true;
    bgMusic.volume = CONFIG.musicVolume;
    bgMusic.muted = false;
    unlockAudioContext();
  }
}

/* ─── MUSIC CONTROL ─────────────────────────────────────────────── */
function initMusicControl() {
  if (!musicControlBtn) return;

  const musicIcon = musicControlBtn.querySelector(".music-icon");
  const musicText = musicControlBtn.querySelectorAll(".music-text");

  const updateButtonUI = () => {
    if (musicIcon) {
      musicIcon.textContent = isMusicPlaying ? "🔊" : "🔇";
    }
    musicText.forEach((text) => {
      if (text.classList.contains("en-text")) {
        text.textContent = isMusicPlaying ? "Music On" : "Music Off";
      } else if (text.classList.contains("ar-text")) {
        text.textContent = isMusicPlaying ? "موسيقى" : "إيقاف";
      }
    });
  };

  const toggleMusic = (e) => {
    e.stopPropagation();
    if (!bgMusic) return;

    if (isMusicPlaying) {
      bgMusic.pause();
      isMusicPlaying = false;
    } else {
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isMusicPlaying = true;
            updateButtonUI();
          })
          .catch((error) => {
            console.log("Playback prevented:", error);
            isMusicPlaying = false;
            updateButtonUI();
            if (!audioContextUnlocked) {
              unlockAudioContext();
            }
          });
      }
    }
    updateButtonUI();
  };

  musicControlBtn.addEventListener("click", toggleMusic);
  updateButtonUI();
}

function fadeInMusic(el, vol = CONFIG.musicVolume, ms = 1500) {
  if (!el) return;
  el.volume = 0;

  const playPromise = el.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isMusicPlaying = true;
        const step = vol / (ms / 50);
        const id = setInterval(() => {
          if (el.volume + step < vol) el.volume += step;
          else {
            el.volume = vol;
            clearInterval(id);
          }
        }, 50);
        if (musicControlBtn) {
          const musicIcon = musicControlBtn.querySelector(".music-icon");
          if (musicIcon) musicIcon.textContent = "🔊";
        }
      })
      .catch((e) => {
        console.log("Audio play error:", e);
        isMusicPlaying = false;
      });
  }
}

/* ─── DOOR LOGIC ─────────────────────────────────────────────────── */
function playDoor() {
  if (doorPlayed) return;
  doorPlayed = true;

  doorGif.src = CONFIG.assets.doorGif;
  doorGif.load();
  doorGif.currentTime = 0;
  doorGif.muted = true;
  doorGif.play().catch((e) => console.warn("Video error:", e));

  if (bgMusic && CONFIG.assets.music) {
    bgMusic.currentTime = 0;
    fadeInMusic(bgMusic, CONFIG.musicVolume, 1500);
  }

  document.querySelector(".door-bg-wrap").classList.add("revealed");
  doorGlowRing.classList.add("active");
  knockBtn.style.opacity = "0";
  knockBtn.style.pointerEvents = "none";

  let transitionDone = false;
  const goToDetails = () => {
    if (transitionDone) return;
    transitionDone = true;
    transitionToPage(pageDoor, pageDetails, () => {
      spawnPetals();
      animateDetailCards();
      initCountdown();
    });
  };

  doorGif.addEventListener("ended", goToDetails, { once: true });
  setTimeout(goToDetails, 15000);
}

/* ─── CONTENT INJECTION ──────────────────────────────────────────── */
function injectContent() {
  document
    .querySelectorAll(".groom-name-en")
    .forEach((el) => (el.textContent = CONFIG.groomName));
  document
    .querySelectorAll(".bride-name-en")
    .forEach((el) => (el.textContent = CONFIG.brideName));
  document
    .querySelectorAll(".groom-name-ar")
    .forEach((el) => (el.textContent = CONFIG.groomNameAr));
  document
    .querySelectorAll(".bride-name-ar")
    .forEach((el) => (el.textContent = CONFIG.brideNameAr));
  document
    .querySelectorAll(".wedding-date-en")
    .forEach((el) => (el.textContent = CONFIG.weddingDate));
  document
    .querySelectorAll(".wedding-date-ar")
    .forEach((el) => (el.textContent = CONFIG.weddingDateAr));
  document
    .querySelectorAll(".wedding-time")
    .forEach((el) => (el.textContent = CONFIG.weddingTime));
  document
    .querySelectorAll(".wedding-location-en")
    .forEach((el) => (el.textContent = CONFIG.weddingLocation));
  document
    .querySelectorAll(".wedding-location-ar")
    .forEach((el) => (el.textContent = CONFIG.weddingLocationAr));
  document
    .querySelectorAll(".wedding-map-btn")
    .forEach((btn) => (btn.href = CONFIG.weddingMapLink));

  const year = CONFIG.weddingDate.match(/\d{4}/)?.[0] || "2026";
  document
    .querySelectorAll(".wedding-year, .wedding-year-ar")
    .forEach((el) => (el.textContent = year));

  if (document.querySelector(".door-static-bg")) {
    document.querySelector(".door-static-bg").style.backgroundImage =
      `url('${CONFIG.assets.doorStatic}')`;
  }
  if (document.querySelector(".details-bg")) {
    document.querySelector(".details-bg").style.backgroundImage =
      `url('${CONFIG.assets.detailsBg}')`;
  }
  document
    .querySelectorAll(".crest-img, #hero-crest-img")
    .forEach((img) => (img.src = CONFIG.assets.crest));

  // Social Media Links
  const socialIds = {
    "social-whatsapp": CONFIG.social.whatsapp,
    "social-phone": CONFIG.social.phone,
    "social-tiktok": CONFIG.social.tiktok,
    "social-instagram": CONFIG.social.instagram,
    "social-facebook": CONFIG.social.facebook,
  };
  Object.keys(socialIds).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = socialIds[id];
  });

  // Contact Info
  const phoneDisplay = document.getElementById("contact-phone-display");
  if (phoneDisplay) {
    const val = phoneDisplay.querySelector(".contact-value");
    if (val) val.textContent = CONFIG.contactPhone;
  }
  const emailDisplay = document.getElementById("contact-email-display");
  if (emailDisplay) {
    const val = emailDisplay.querySelector(".contact-value");
    if (val) val.textContent = CONFIG.contactEmail;
  }
}

/* ─── PARTICLES & PETALS ─────────────────────────────────────────── */
function spawnParticles() {
  for (let i = 0; i < 22; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 6 + 2;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;animation-duration:${Math.random() * 12 + 8}s;animation-delay:${Math.random() * 10}s;`;
    particles.appendChild(p);
  }
}

function spawnPetals() {
  if (!petalsWrap) return;
  petalsWrap.innerHTML = "";
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("div");
    p.className = "petal";
    const size = Math.random() * 8 + 4;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;animation-duration:${Math.random() * 18 + 12}s;animation-delay:${Math.random() * 14}s;`;
    petalsWrap.appendChild(p);
  }
}

function animateDetailCards() {
  pageDetails.querySelectorAll(".detail-card").forEach((c, i) => {
    c.style.animation = "cardEntrance 0.8s ease both";
    c.style.animationDelay = i * 0.15 + "s";
  });
}

/* ─── LOADING BAR ────────────────────────────────────────────────── */
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function setBar(target) {
  const from = loadProgress;
  const start = performance.now();
  const duration = 400;

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    loadProgress = from + (target - from) * easeInOut(t);
    loadingBar.style.width = loadProgress + "%";
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ─── PRELOAD ────────────────────────────────────────────────────── */
function preloadAllAssets() {
  const assets = [
    CONFIG.assets.crest,
    CONFIG.assets.doorStatic,
    CONFIG.assets.doorGif,
    CONFIG.assets.detailsBg,
    CONFIG.assets.music,
  ].filter(Boolean);

  const total = assets.length;
  if (total === 0) return Promise.resolve();

  let loaded = 0;
  const BAR_START = 10,
    BAR_END = 90;

  function onAssetDone() {
    loaded++;
    setBar(BAR_START + (loaded / total) * (BAR_END - BAR_START));
  }

  const promises = assets.map(
    (src) =>
      new Promise((resolve) => {
        const isVideo = src.match(/\.(mp4|webm|mov)$/i);
        const isAudio = src.match(/\.(mp3|wav|ogg)$/i);

        if (isVideo) {
          const video = document.createElement("video");
          video.preload = "auto";
          video.src = src;
          video.load();
          const timeout = setTimeout(() => resolve(), 12000);
          video.addEventListener(
            "canplaythrough",
            () => {
              clearTimeout(timeout);
              onAssetDone();
              resolve();
            },
            { once: true },
          );
          video.addEventListener(
            "error",
            () => {
              clearTimeout(timeout);
              onAssetDone();
              resolve();
            },
            { once: true },
          );
        } else if (isAudio) {
          const audio = new Audio();
          audio.preload = "auto";
          audio.src = src;
          const timeout = setTimeout(() => resolve(), 12000);
          audio.addEventListener(
            "canplaythrough",
            () => {
              clearTimeout(timeout);
              onAssetDone();
              resolve();
            },
            { once: true },
          );
          audio.addEventListener(
            "error",
            () => {
              clearTimeout(timeout);
              onAssetDone();
              resolve();
            },
            { once: true },
          );
          audio.load();
        } else {
          const img = new Image();
          const timeout = setTimeout(() => resolve(), 12000);
          img.onload = img.onerror = () => {
            clearTimeout(timeout);
            onAssetDone();
            resolve();
          };
          img.src = src;
        }
      }),
  );

  return Promise.all(promises);
}

/* ─── LOADING SCREEN ────────────────────────────────────────────── */
async function runLoadingScreen() {
  setBar(10);
  spawnParticles();
  await Promise.all([
    preloadAllAssets(),
    new Promise((r) => setTimeout(r, 2000)),
  ]);
  setBar(100);
  await new Promise((r) => setTimeout(r, 600));
  transitionToPage(pageLoading, pageDoor);
}

/* ─── PAGE TRANSITION ───────────────────────────────────────────── */
function transitionToPage(fromPage, toPage, cb) {
  fromPage.classList.add("fade-out");
  setTimeout(() => {
    fromPage.classList.remove("active", "fade-out");
    toPage.classList.add("active");
    if (cb) cb();
  }, 900);
}

/* ─── LANGUAGE TOGGLE ───────────────────────────────────────────── */
function toggleLanguage() {
  currentLang = currentLang === "en" ? "ar" : "en";
  document.documentElement.setAttribute("lang", currentLang);
  document.documentElement.setAttribute(
    "dir",
    currentLang === "ar" ? "rtl" : "ltr",
  );

  const nameEl = document.getElementById("rsvp-name");
  const msgEl = document.getElementById("rsvp-msg");
  if (nameEl)
    nameEl.placeholder = currentLang === "ar" ? "اسمك..." : "Your name...";
  if (msgEl)
    msgEl.placeholder =
      currentLang === "ar" ? "أمنياتك الطيبة..." : "Your warm wishes...";
}

/* ─── RSVP ───────────────────────────────────────────────────────── */
function handleRSVP(event) {
  event.preventDefault();

  const name = document.getElementById("rsvp-name").value.trim();
  const attendInput = document.querySelector('input[name="attend"]:checked');
  const message = document.getElementById("rsvp-msg").value.trim();

  if (!name) {
    alert(
      currentLang === "ar"
        ? "الرجاء إدخال اسمك الكامل."
        : "Please enter your full name.",
    );
    return;
  }
  if (!attendInput) {
    alert(
      currentLang === "ar"
        ? "الرجاء اختيار حالة الحضور."
        : "Please confirm attendance.",
    );
    return;
  }

  const attendText =
    attendInput.value === "yes"
      ? currentLang === "ar"
        ? "نعم، سأحضر 🥂"
        : "Yes, I will attend 🥂"
      : currentLang === "ar"
        ? "آسف، لن أتمكن من الحضور"
        : "Regretfully unable to attend";

  let fullMessage = `اسم الضيف: ${name}\nحالة الحضور: ${attendText}`;
  if (message) fullMessage += `\nرسالته: ${message}`;
  currentWhatsAppMessage = fullMessage;

  rsvpForm.classList.add("hidden");
  rsvpSuccess.classList.remove("hidden");
  bindWhatsAppButtons();
}

function bindWhatsAppButtons() {
  const groomBtn = document.getElementById("send-to-groom");
  const brideBtn = document.getElementById("send-to-bride");
  const copyBtn = document.getElementById("copy-message");

  if (groomBtn) {
    const newGroom = groomBtn.cloneNode(true);
    groomBtn.parentNode.replaceChild(newGroom, groomBtn);
    newGroom.onclick = () => {
      if (CONFIG.groomWhatsapp) {
        window.open(
          `https://wa.me/${CONFIG.groomWhatsapp}?text=${encodeURIComponent(currentWhatsAppMessage)}`,
          "_blank",
        );
      } else {
        alert("Groom number not set");
      }
    };
  }

  if (brideBtn) {
    const newBride = brideBtn.cloneNode(true);
    brideBtn.parentNode.replaceChild(newBride, brideBtn);
    newBride.onclick = () => {
      if (CONFIG.brideWhatsapp) {
        window.open(
          `https://wa.me/${CONFIG.brideWhatsapp}?text=${encodeURIComponent(currentWhatsAppMessage)}`,
          "_blank",
        );
      } else {
        alert("Bride number not set");
      }
    };
  }

  if (copyBtn) {
    const newCopy = copyBtn.cloneNode(true);
    copyBtn.parentNode.replaceChild(newCopy, copyBtn);
    newCopy.onclick = () => {
      navigator.clipboard
        .writeText(currentWhatsAppMessage)
        .then(() => alert("Message copied!"))
        .catch(() => alert("Copy failed"));
    };
  }
}

/* ─── INIT ───────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
  initAudio();
  initMusicControl();
  injectContent();

  pageLoading.classList.add("active");
  doorGif.removeAttribute("src");

  // Event Listeners
  knockBtn.addEventListener("click", playDoor);
  langBtnDoor.addEventListener("click", toggleLanguage);
  langBtnDet.addEventListener("click", toggleLanguage);
  if (rsvpForm) rsvpForm.addEventListener("submit", handleRSVP);

  await runLoadingScreen();
});
