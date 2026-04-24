// =======================
// DYNAMIC BADGE SYSTEM
// =======================
export function getUserBadge(role) {
  let badge = "";
  if (role === "admin") {
    badge += `<span class="admin-badge" style="background: #ff4757; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin-left: 5px; display: inline-flex; align-items: center; vertical-align: middle; line-height: 1; font-weight: bold; height: 16px;">🛡 Dev</span>`;
  }
  if (role === "verified") {
    badge += `<span class="verified-badge" style="margin-left:5px;"><svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:middle;"><circle cx="12" cy="12" r="10" fill="#1DA1F2"/><path d="M7 12.5l3 3 7-7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
  }
  const crowBadges = { crown1: "/asets/png/crown1.png", crown2: "/asets/png/crown2.png", crown3: "/asets/png/crown3.png" };
  if (crowBadges[role]) {
    badge += `<img src="${crowBadges[role]}" style="width:18px;height:18px;margin-left:5px;vertical-align:middle;object-fit:contain;display:inline-block;" alt="${role}">`;
  }
  return badge;
}

// =======================
// TOAST MODERN
// =======================
let toastTimer;

function getToastIcon(type) {
  switch (type) { case "success": return "✓"; case "warning": return "⚠"; case "error": return "!"; default: return "i"; }
}

export function hideToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.classList.remove("show");
  setTimeout(() => { toast.className = ""; toast.innerHTML = ""; }, 260);
}

export function showToast(title, message = "", type = "info") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  clearTimeout(toastTimer);
  toast.className = "";
  toast.innerHTML = `
    <div class="toast-icon-wrap ${type}"><div class="toast-icon">${getToastIcon(type)}</div></div>
    <div class="toast-content"><div class="toast-title">${title}</div>${message ? `<div class="toast-subtitle">${message}</div>` : ""}</div>
    <button class="toast-close" aria-label="Close">✕</button>
  `;
  toast.classList.add("toast-card", type);
  requestAnimationFrame(() => toast.classList.add("show"));
  const closeBtn = toast.querySelector(".toast-close");
  if (closeBtn) closeBtn.onclick = () => hideToast();
  toastTimer = setTimeout(() => hideToast(), 3200);
}

// =======================
// MIDTRANS INIT
// =======================
let isMidtransLoading = false;
export function loadMidtrans() {
  if (window.snap || isMidtransLoading) return;
  isMidtransLoading = true;
  const script = document.createElement("script");
  script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
  script.setAttribute("data-client-key", "SB-Mid-client-G2wOVrrTwcffYhkC");
  script.async = true;
  script.onload = () => { isMidtransLoading = false; };
  script.onerror = () => { isMidtransLoading = false; };
  document.head.appendChild(script);
}

// ==========================================
// PARTICLES
// ==========================================
export function createParticles(x, y) {
  const colors = ["#f09f33", "#00d2ff", "#4ade80", "#ff758c", "#ffffff"];
  for (let i = 0; i < 15; i++) {
    const p = document.createElement("div"); p.className = "particle";
    const size = Math.random() * 8 + 4;
    p.style.width = `${size}px`; p.style.height = `${size}px`;
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = `${x}px`; p.style.top = `${y}px`;
    p.style.position = "fixed"; p.style.pointerEvents = "none"; p.style.borderRadius = "50%"; p.style.zIndex = "10001";
    document.body.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 100 + 50;
    const destinationX = Math.cos(angle) * velocity; const destinationY = Math.sin(angle) * velocity;

    p.animate([ { transform: "translate(0, 0) scale(1)", opacity: 1 }, { transform: `translate(${destinationX}px, ${destinationY}px) scale(0)`, opacity: 0 } ], 
    { duration: 600 + Math.random() * 400, easing: "cubic-bezier(0, .9, .57, 1)", fill: "forwards" });
    setTimeout(() => p.remove(), 1000);
  }
}
