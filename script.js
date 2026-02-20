// Simple state
let currentScreen = "lock";
let passcode = "1234";
let enteredPasscode = "";
let currentPage = 1;
let totalPages = 2;

// Elements
const lockScreen = document.getElementById("lockScreen");
const passcodeScreen = document.getElementById("passcodeScreen");
const homeWrapper = document.getElementById("homeWrapper");
const dots = document.querySelectorAll("#passcode-dots .dot");
const keys = document.querySelectorAll(".key[data-num]");
const deleteKey = document.getElementById("key-delete");
const homePages = document.querySelectorAll(".homePage");
const pageDots = document.querySelectorAll(".pageDot");
const apps = document.querySelectorAll(".app");
const messagesApp = document.getElementById("messagesApp");
const settingsApp = document.getElementById("settingsApp");
const browserApp = document.getElementById("browserApp");
const appstoreApp = document.getElementById("appstoreApp");
const cameraApp = document.getElementById("cameraApp");
const siriOverlay = document.getElementById("siriOverlay");
const siriInput = document.getElementById("siriInput");
const siriClose = document.getElementById("siriClose");
const darkModeToggle = document.getElementById("darkModeToggle");
const cc = document.getElementById("controlCenter");
const ccHandle = document.getElementById("ccHandle");
const ccClose = document.getElementById("ccClose");
const homeBar = document.getElementById("homeBar");
const msgInput = document.getElementById("msgInput");
const msgSend = document.getElementById("msgSend");
const cameraVideo = document.getElementById("cameraVideo");
const cameraShutter = document.getElementById("cameraShutter");

// Helper: switch main screens
function showScreen(name) {
  currentScreen = name;
  [lockScreen, passcodeScreen, homeWrapper].forEach((el) =>
    el.classList.remove("active")
  );
  if (name === "lock") lockScreen.classList.add("active");
  if (name === "passcode") passcodeScreen.classList.add("active");
  if (name === "home") homeWrapper.classList.add("active");
}

// Lock screen swipe up (simple click to simulate)
lockScreen.addEventListener("click", () => {
  if (currentScreen === "lock") {
    showScreen("passcode");
  }
});

// Passcode input
keys.forEach((key) => {
  key.addEventListener("click", () => {
    if (enteredPasscode.length >= 4) return;
    enteredPasscode += key.dataset.num;
    updateDots();
    if (enteredPasscode.length === 4) {
      setTimeout(checkPasscode, 200);
    }
  });
});

deleteKey.addEventListener("click", () => {
  enteredPasscode = enteredPasscode.slice(0, -1);
  updateDots();
});

function updateDots() {
  dots.forEach((d, i) => {
    d.classList.toggle("filled", i < enteredPasscode.length);
  });
}

function checkPasscode() {
  if (enteredPasscode === passcode) {
    enteredPasscode = "";
    updateDots();
    showScreen("home");
  } else {
    enteredPasscode = "";
    updateDots();
  }
}

// Home page swipe (simple left/right click on background)
let startX = null;
homeWrapper.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

homeWrapper.addEventListener("touchend", (e) => {
  if (startX === null) return;
  const endX = e.changedTouches[0].clientX;
  const diff = endX - startX;
  if (Math.abs(diff) > 50) {
    if (diff < 0 && currentPage < totalPages) currentPage++;
    if (diff > 0 && currentPage > 1) currentPage--;
    updatePages();
  }
  startX = null;
});

// Also allow click on page dots
pageDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    currentPage = parseInt(dot.dataset.page, 10);
    updatePages();
  });
});

function updatePages() {
  homePages.forEach((p) =>
    p.classList.toggle("active", parseInt(p.dataset.page, 10) === currentPage)
  );
  pageDots.forEach((d) =>
    d.classList.toggle("active", parseInt(d.dataset.page, 10) === currentPage)
  );
}

// Open apps
apps.forEach((app) => {
  app.addEventListener("click", () => {
    const appName = app.dataset.app;
    openApp(appName);
  });
});

function hideAllApps() {
  [messagesApp, settingsApp, browserApp, appstoreApp, cameraApp].forEach((a) =>
    a.classList.remove("active")
  );
}

function openApp(name) {
  hideAllApps();
  if (name === "messages") messagesApp.classList.add("active");
  if (name === "settings") settingsApp.classList.add("active");
  if (name === "browser") browserApp.classList.add("active");
  if (name === "appstore") appstoreApp.classList.add("active");
  if (name === "camera") {
    cameraApp.classList.add("active");
    startCamera();
  }
  if (name === "siri") {
    openSiri();
  }
}

// Back buttons
document.querySelectorAll(".back-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const back = btn.dataset.back;
    if (back === "home") {
      hideAllApps();
      stopCamera();
    }
  });
});

// Fake Messages send
msgSend.addEventListener("click", () => {
  const text = msgInput.value.trim();
  if (!text) return;
  const thread = document.querySelector(".messages-thread");
  const bubble = document.createElement("div");
  bubble.className = "bubble sent";
  bubble.textContent = text;
  thread.appendChild(bubble);
  msgInput.value = "";
  thread.scrollTop = thread.scrollHeight;
});

// Dark mode toggle
if (darkModeToggle) {
  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark", darkModeToggle.checked);
  });
}

// Siri
function openSiri() {
  siriOverlay.style.display = "flex";
  siriInput.value = "";
}

siriClose.addEventListener("click", () => {
  siriOverlay.style.display = "none";
});

siriInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const value = siriInput.value.toLowerCase();
    if (value.includes("open messages")) {
      siriOverlay.style.display = "none";
      openApp("messages");
    } else if (value.includes("open camera")) {
      siriOverlay.style.display = "none";
      openApp("camera");
    } else {
      siriInput.value = "I can’t do that, but nice try 😄";
    }
  }
});

// Control Center
let ccOpen = false;

ccHandle.addEventListener("click", () => {
  toggleCC();
});

ccClose.addEventListener("click", () => {
  toggleCC(false);
});

function toggleCC(force) {
  if (typeof force === "boolean") {
    ccOpen = force;
  } else {
    ccOpen = !ccOpen;
  }
  cc.classList.toggle("active", ccOpen);
}

// Home bar: go home from apps
homeBar.addEventListener("click", () => {
  hideAllApps();
  stopCamera();
});

// Camera
function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      cameraVideo.srcObject = stream;
    })
    .catch(() => {});
}

function stopCamera() {
  if (cameraVideo.srcObject) {
    cameraVideo.srcObject.getTracks().forEach((t) => t.stop());
    cameraVideo.srcObject = null;
  }
}

cameraShutter.addEventListener("click", () => {
  // Just a fake flash effect
  const flash = document.createElement("div");
  flash.style.position = "absolute";
  flash.style.inset = "0";
  flash.style.background = "#fff";
  flash.style.opacity = "0.8";
  flash.style.pointerEvents = "none";
  document.getElementById("iphone").appendChild(flash);
  setTimeout(() => flash.remove(), 100);
});

// App Store fake installs
document.querySelectorAll(".get-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.textContent = "OPEN";
  });
});

// Initialize
showScreen("lock");
updatePages();
