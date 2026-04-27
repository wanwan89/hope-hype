import { supabase } from '../lib/supabase.js';

// ===== INJEKSI CSS ANIMASI TYPING (AGAR BUBBLE MUNCUL) =====
if (!document.getElementById('hh-dynamic-styles')) {
  const style = document.createElement('style');
  style.id = 'hh-dynamic-styles';
  style.innerHTML = `
    @keyframes typingBlink {
      0%, 100% { transform: translateY(0); opacity: 0.4; }
      50% { transform: translateY(-3px); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

// ===== Audio Config =====
const sendSound = new Audio("asets/sound/send.mp3");
const receiveSound = new Audio("asets/sound/receive.mp3");
const ringtoneSound = new Audio("asets/sound/call.wav");
ringtoneSound.loop = true; 

// ===== Global State =====
let currentRoomId = "room-1";
let currentReplyId = null;
let currentUser = null;
let myUsername = "Guest";
let myRole = "user";
let myAvatar = "asets/png/profile.webp"; 
let presenceChannel = null;
let globalPresenceChannel = null; 
let messageChannel = null;
let typingTimeout = null;
let isCurrentlyTyping = false;
let selectedMessageId = null;
let isFirstMessageLoad = true; 
let totalOnlineUsers = 0; 
let callRoom; 
let receiverTypingTimeout = null;
let isRealtimeInitialized = false; 
let reactionTargetId = null; 
// ===== DOM =====
const messagesEl = document.getElementById("chat-messages");
const inputEl = document.getElementById("chat-input");
const Btn = document.getElementById("send-btn");
const membersEl = document.getElementById("chat-members");

const stickerMenu = document.getElementById("sticker-menu");
const stickerList = document.getElementById("sticker-list");
const searchInput = document.getElementById("sticker-search-input");
const searchBtn = document.getElementById("sticker-search-btn");

// MEMORI INTERNAL BIAR GAK TANYA DATABASE TERUS
const profileCache = new Map();

async function getCachedProfile(userId) {
  if (profileCache.has(userId)) return profileCache.get(userId);

  const localKey = `hh_profile_${userId}`;
  const cacheTimeKey = `hh_profile_time_${userId}`;
  
  const cached = localStorage.getItem(localKey);
  const cacheTime = localStorage.getItem(cacheTimeKey);
  
  if (cached && cacheTime && (Date.now() - parseInt(cacheTime) < 3600000)) {
    const data = JSON.parse(cached);
    profileCache.set(userId, data); 
    return data;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('username, avatar_url, role, short_id, gender')
    .eq('id', userId)
    .single();

  if (data) {
    localStorage.setItem(localKey, JSON.stringify(data));
    localStorage.setItem(cacheTimeKey, Date.now().toString()); 
    profileCache.set(userId, data);
  }
  return data;
}

// ===== Helpers =====
function scrollToBottom() {
  if (messagesEl) {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "smooth" });
  }
}

function renderTypingBubble(username, userId) {
  if (!messagesEl) return;

  let typingEl = document.getElementById("typing-indicator-bubble");

  if (!typingEl) {
    typingEl = document.createElement("div");
    typingEl.id = "typing-indicator-bubble";
    typingEl.className = "chat-message other new-msg";
    
    // Ukuran disesuaikan jadi lebih kecil (avatar 24px, padding dipersempit)
    typingEl.innerHTML = `
      <img id="typing-avatar" class="avatar" src="asets/png/profile.webp" onerror="this.src='asets/png/profile.webp'" style="width: 24px; height: 24px; border-radius: 50%; align-self: flex-end; margin-bottom: 8px;">
      <div class="content" style="margin-bottom: 8px;">
        <div class="username" style="font-size: 10px; color: #888; margin-bottom: 1px;">${escapeHtml(username)}</div>
        <div class="text" style="background: var(--tg-bg-secondary, #f0f0f0); padding: 6px 10px; border-radius: 12px; border-bottom-left-radius: 4px; display: inline-block; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          <div class="typing-bubble" style="display: inline-flex; gap: 3px; align-items: center; height: 10px;">
            <span style="width: 4px; height: 4px; background: #9ca3af; border-radius: 50%; animation: typingBlink 1.4s infinite both;"></span>
            <span style="width: 4px; height: 4px; background: #9ca3af; border-radius: 50%; animation: typingBlink 1.4s infinite both; animation-delay: 0.2s;"></span>
            <span style="width: 4px; height: 4px; background: #9ca3af; border-radius: 50%; animation: typingBlink 1.4s infinite both; animation-delay: 0.4s;"></span>
          </div>
        </div>
      </div>
    `;
    
    messagesEl.appendChild(typingEl);
    scrollToBottom();

    getCachedProfile(userId).then(profile => {
      const avatarImg = document.getElementById("typing-avatar");
      if (avatarImg && profile?.avatar_url) {
        avatarImg.src = profile.avatar_url;
      }
    });
  }

  clearTimeout(receiverTypingTimeout);
  receiverTypingTimeout = setTimeout(() => {
    removeTypingBubble();
  }, 4000);
}

function removeTypingBubble() {
  const typingEl = document.getElementById("typing-indicator-bubble");
  if (typingEl) typingEl.remove();
  
  clearTimeout(receiverTypingTimeout); 

  const currentTypingHeader = document.getElementById("typing-header");
  const currentStatusHeader = document.getElementById("status-header");
  if (currentTypingHeader && currentStatusHeader) {
    currentTypingHeader.style.display = "none";
    currentStatusHeader.style.display = "inline-block";
  }
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatTime(dateString) {
  const d = new Date(dateString);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}
// 🛠 FIX: openReactionMenu agar tidak error clientX undefined
window.openReactionMenu = function(id, event) {
  const menu = document.getElementById("reaction-menu");
  if (!menu) return;
  
  reactionTargetId = id;
  menu.style.display = "flex";
  
  // Ambil koordinat dengan pengecekan ekstra ketat
  let posX = 0;
  let posY = 0;

  if (event) {
    if (event.touches && event.touches.length > 0) {
      posX = event.touches[0].clientX;
      posY = event.touches[0].clientY;
    } else if (event.clientX !== undefined) {
      posX = event.clientX;
      posY = event.clientY;
    }
  }

  // Jika tetap gagal mendapatkan koordinat (misal karena event hilang), 
  // posisikan di tengah layar sebagai fallback agar tidak crash
  if (posX === 0 && posY === 0) {
    posX = window.innerWidth / 2 - 100;
    posY = window.innerHeight / 2;
  }
  
  // Atur posisi menu
  menu.style.left = `${Math.min(posX, window.innerWidth - 220)}px`;
  menu.style.top = `${Math.min(posY, window.innerHeight - 100)}px`;

  if (navigator.vibrate) navigator.vibrate(25);

  const closeMenu = (e) => {
    if (!menu.contains(e.target)) {
      menu.style.display = "none";
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('touchstart', closeMenu);
    }
  };
  
  setTimeout(() => {
    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('touchstart', closeMenu);
  }, 10);
};

// ==========================================
// FUNGSI PEMICU PUSH NOTIF
// ==========================================
function triggerPushNotif(teksPesan) {
  const partnerId = getPartnerIdFromRoom(currentRoomId);
  if (!partnerId) return; 
  
  const anonKey = supabase.supabaseKey; 

  fetch(`${supabase.supabaseUrl}/functions/v1/send-chat-notif`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}` 
    },
    body: JSON.stringify({
      record: {
        sender_id: currentUser.id,
        receiver_id: partnerId,
        content: teksPesan
      }
    })
  }).catch(err => console.error("Gagal kirim sinyal notif:", err));
}

function showToast(message) {
  let container = document.getElementById("toast");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast-card";
  toast.innerHTML = `
    <div class="toast-icon-wrap warning">
      <span class="toast-icon">!</span>
    </div>
    <div class="toast-content">
      <span class="toast-title">Pemberitahuan</span>
      <span class="toast-subtitle">${message}</span>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => { toast.classList.add("show"); });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showChatLoading() {
  if (!messagesEl) return;
  messagesEl.innerHTML = `
    <div class="chat-loading-screen">
      <div class="skeleton-msg left"><div class="skeleton-avatar shimmer"></div><div class="skeleton-bubble"><div class="shimmer skeleton-line w1"></div><div class="shimmer skeleton-line w2"></div><div class="shimmer skeleton-line w3"></div></div></div>
      <div class="skeleton-msg right"><div class="skeleton-bubble me"><div class="shimmer skeleton-line w4"></div><div class="shimmer skeleton-line w5"></div></div></div>
      <div class="skeleton-msg left"><div class="skeleton-avatar shimmer"></div><div class="skeleton-bubble typing-bubble"><span></span><span></span><span></span></div></div>
      <div class="loading-chat-hint">Menyambungkan percakapan...</div>
    </div>
  `;
}

function getStatusIcon(status) {
  switch (status) {
    case "sending": return `<span class="status-icon sending"><span class="sending-dot">.</span><span class="sending-dot">.</span><span class="sending-dot">.</span></span>`;
    case "sent": return `<span class="status-icon sent" title="Terkirim"><svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M3 8.5L6.2 11.5L13 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
    case "delivered": return `<span class="status-icon delivered" title="Terkirim"><svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M1.8 8.5L5 11.5L11.8 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.8 8.5L9 11.5L15 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
    case "read": return `<span class="status-icon read" title="Dibaca"><svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M1.8 8.5L5 11.5L11.8 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.8 8.5L9 11.5L15 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
    default: return "";
  }
}

function getBadge(role) {
  if (!role) return "";
  role = role.toLowerCase().trim();
  if (role === "admin") return `<span class="badge" style="background:#ff4757; font-size:7px; padding:0 4px; border-radius:3px; margin-left:2px; font-weight:600;">🛡 Admin</span>`;
  if (role === "verified") return `<span class="verified-icon" style="margin-left:4px; display:inline-flex; align-items:center;"><svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1DA1F2"/><path d="M7 12.5l3 3 7-7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
  const crownBadges = { crown1: "asets/png/crown1.png", crown2: "asets/png/crown2.png", crown3: "asets/png/crown3.png" };
  if (crownBadges[role]) return `<img src="${crownBadges[role]}" alt="${role}" style="width:16px;height:16px;margin-left:4px;vertical-align:middle;object-fit:contain;display:inline-block;" onerror="this.style.display='none';">`;
  return "";
}

function getPartnerIdFromRoom(roomId) {
  if (!roomId.startsWith("pv_")) return null;
  return roomId.replace("pv_", "").split("_").find((id) => id !== currentUser?.id) || null;
}

// ===== Global window funcs =====
window.cancelReply = function () {
  currentReplyId = null;
  const preview = document.getElementById("reply-preview-box");
  if (inputEl) { inputEl.dataset.replyTo = ""; inputEl.placeholder = "Tulis pesan..."; }
  if (preview) { preview.style.display = "none"; preview.innerHTML = ""; }
};

window.scrollToMessage = function (id) {
  const el = document.getElementById(`msg-${id}`);
  if (!el) { showToast("Pesan asli sudah terlalu lama atau telah dihapus."); return; }
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.style.background = "#fff3b0";
  setTimeout(() => { el.style.background = el.classList.contains("self") ? "rgba(220,248,198,0.9)" : "rgba(255,255,255,0.9)"; }, 1000);
};

// ===== Auth =====
async function requireLogin() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session || !session.user) {
    showToast("Kamu harus login dulu!");
    window.location.href = "/login";
    return false;
  }
  currentUser = { id: session.user.id };

  const myProfile = await getCachedProfile(session.user.id);
  myUsername = myProfile?.username || session.user.email || "Guest";
  myRole = myProfile?.role || "user";
  myAvatar = myProfile?.avatar_url || "asets/png/profile.webp";
  
  return true;
}

// ===== Presence / Typing =====
// 🔧 MODIFIED
async function initPresence() {
  if (!currentUser) return;

  clearTimeout(typingTimeout);
  isCurrentlyTyping = false;
  const typingHeader = document.getElementById("typing-header");
  const statusHeader = document.getElementById("status-header");
  if (typingHeader) typingHeader.style.display = "none";
  if (statusHeader) statusHeader.style.display = "inline-block";
  
  if (presenceChannel) { await supabase.removeChannel(presenceChannel); presenceChannel = null; }
  presenceChannel = supabase.channel(`presence-${currentRoomId}`, { config: { presence: { key: currentUser.id } } });

  // ✅ ADDED: Listen for broadcast typing events instead of presence
  presenceChannel.on("broadcast", { event: "typing" }, (payload) => {
    const typingUser = payload.payload.username;
    if (typeof renderTypingBubble === "function") {
      renderTypingBubble(typingUser, payload.payload.userId);
    }

    const currentTypingHeader = document.getElementById("typing-header");
    const currentStatusHeader = document.getElementById("status-header");
    if (currentTypingHeader && currentStatusHeader) {
      currentTypingHeader.style.display = "inline-block";
      currentStatusHeader.style.display = "none";
      currentTypingHeader.innerText = `${typingUser} sedang mengetik...`;
    }
  });

  presenceChannel.on("presence", { event: "sync" }, () => {
    // 🔧 MODIFIED: Only use presence sync for updating online status (removed slow typing checks)
    updateHeaderStatus();
  });

  presenceChannel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
        // 🔧 MODIFIED: Track simple online status in the room
        await presenceChannel.track({ online: true, user_id: currentUser.id });
    }
  });

  if (inputEl) {
    inputEl.removeEventListener("input", handleTypingInput);
    inputEl.addEventListener("input", handleTypingInput);
  }

  // 🔥 FIX ONLINE STATUS: Cek Global Presence 🔥
  if (!globalPresenceChannel) {
    globalPresenceChannel = supabase.channel(`global-online-users`, { config: { presence: { key: currentUser.id } } });
    
    globalPresenceChannel.on("presence", { event: "sync" }, () => {
      const state = globalPresenceChannel.presenceState();
      totalOnlineUsers = Object.keys(state).length;
      updateHeaderStatus(state); 
    });

    globalPresenceChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
          await globalPresenceChannel.track({ online: true, last_seen: new Date().toISOString(), user_id: currentUser.id });
      }
    });
  }
}

// 🔧 MODIFIED
async function handleTypingInput() {
  if (!presenceChannel) return;
  const text = inputEl ? inputEl.value.trim() : "";

  if (text === "") {
    clearTimeout(typingTimeout);
    if (isCurrentlyTyping) {
      isCurrentlyTyping = false;
    }
    return;
  }

  if (!isCurrentlyTyping) {
    isCurrentlyTyping = true;
    
    // ✅ ADDED: Pastikan channel sudah tersambung (joined) sebelum mengirim broadcast.
    // Ini menghilangkan warning "falling back to REST API"
    if (presenceChannel.state === 'joined') {
      presenceChannel.send({
        type: "broadcast",
        event: "typing",
        payload: { username: myUsername, userId: currentUser.id }
      }).catch(()=>{});
    }
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isCurrentlyTyping = false;
  }, 3000);
}

// 🔥 FIX ONLINE STATUS UI 🔥
// 🔧 MODIFIED
function updateHeaderStatus(passedState = null) {
  const headerStatusEl = document.getElementById("status-header");
  if (!headerStatusEl || !currentUser) return;

  const state = passedState || (globalPresenceChannel ? globalPresenceChannel.presenceState() : {});
  const totalOnline = Object.keys(state).length;

  if (membersEl) membersEl.innerHTML = `<span class="online-dot"></span> ${totalOnline} user online`;

  if (currentRoomId === "room-1") {
    if (totalOnline <= 1) { 
      headerStatusEl.innerHTML = `<span style="opacity:0.8;">Hanya kamu yang online</span>`; 
    } else { 
      headerStatusEl.innerHTML = `<span class="online-dot" style="background:#fff; width:7px; height:7px; display:inline-block; border-radius:50%; margin-right:4px;"></span> ${totalOnline} users online`; 
    }
    return;
  }

  const partnerId = getPartnerIdFromRoom(currentRoomId);
  if (!partnerId) {
      // 🔧 MODIFIED: Safely read presenceState without crashing if undefined
      const roomPresenceState = presenceChannel ? presenceChannel.presenceState() : {};
      const roomPresence = Object.keys(roomPresenceState).length || 1;
      headerStatusEl.innerHTML = `<span class="online-dot" style="background:#2ecc71; width:8px; height:8px; display:inline-block; border-radius:50%; margin-right:4px;"></span> ${roomPresence} anggota online`; 
      return;
  }

  // Jika partnerId ada di object state, berarti dia sedang online!
  const isOnline = !!state[partnerId];

  if (isOnline) { 
    headerStatusEl.innerHTML = `<span class="online-dot" style="background:#2ecc71; width:8px; height:8px; display:inline-block; border-radius:50%; margin-right:4px;"></span> Sedang online`; 
  } else { 
    headerStatusEl.innerHTML = `<span style="opacity:0.8;">Offline</span>`; 
  }
}

// ===== RENDER MESSAGE DENGAN SYSTEM MESSAGE =====
function renderMessage(msg) {
  if (!messagesEl) return;
  if (document.getElementById(`msg-${msg.id}`)) return;

  if (msg.is_system) {
    const sysEl = document.createElement("div");
    sysEl.id = `msg-${msg.id}`;
    sysEl.className = "system-message-container";
    sysEl.style = "display: flex; justify-content: center; margin: 12px 0; width: 100%; animation: fadeIn 0.3s ease;";
    sysEl.innerHTML = `
      <div style="background: rgba(0, 0, 0, 0.06); color: var(--text-color, #555); font-size: 11px; padding: 5px 14px; border-radius: 20px; font-weight: 500; border: 1px solid rgba(0,0,0,0.03);">
        ${escapeHtml(msg.message)}
      </div>
    `;
    messagesEl.appendChild(sysEl);
    return; 
  }

  const msgEl = document.createElement("div");
  msgEl.id = `msg-${msg.id}`;
  msgEl.className = `chat-message ${msg.user_id === currentUser.id ? "self" : "other"}`;

  const currentUsername = msg.profiles?.username || msg.username || "User";
  const avatarUrl = msg.profiles?.avatar_url || msg.avatar || "asets/png/profile.webp";
  const currentRole = msg.profiles?.role || msg.role || "user";
  const statusIcon = msg.user_id === currentUser.id ? getStatusIcon(msg.status || "sent") : "";

  let replyTextContent = msg.reply_to_msg?.message || "";
  if (!replyTextContent && msg.reply_to_msg?.sticker_url) replyTextContent = "🖼 Stiker";
  if (!replyTextContent && msg.reply_to_msg?.audio_url) replyTextContent = "🎤 Voice Note";

  const replyHtml = msg.reply_to_msg
    ? `<div class="reply-preview-in-chat" onclick="window.scrollToMessage('${msg.reply_to_msg.id}')" style="cursor:pointer; background:rgba(0,0,0,0.08); border-left:3px solid #0088cc; padding:5px 8px; border-radius:4px; margin-bottom:5px;">
        <div style="font-size:10px; color:#0088cc; font-weight:bold;">${escapeHtml(msg.reply_to_msg.username)}</div>
        <div style="font-size:11px; color: var(--text-color, #666); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(replyTextContent)}</div>
      </div>`
    : "";

  let contentHtml = "";
  if (msg.sticker_url) {
    contentHtml = `<img src="${msg.sticker_url}" style="width:100px;height:100px;border-radius:12px;object-fit:cover;">`;
  } else if (msg.audio_url) {
    contentHtml = `
      <div class="vn-custom-player">
        <button class="vn-play-btn" onclick="playVN(this, '${msg.audio_url}')"><svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M8 5v14l11-7z"/></svg></button>
        <div class="vn-waveform"><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span></div>
        <div class="vn-time">Voice Note</div>
      </div>`;
  } else {
    contentHtml = escapeHtml(msg.message || "");
  }

  const reactions = msg.reactions || {};
  const reactionIcons = Object.values(reactions); 
  const uniqueIcons = [...new Set(reactionIcons)].slice(0, 3);
  
  const reactionsHtml = uniqueIcons.length > 0 ? `
    <div class="message-reactions">
      ${uniqueIcons.join("")} 
      ${reactionIcons.length > 1 ? `<span style="font-size:9px; color:#999; margin-left:2px;">${reactionIcons.length}</span>` : ""}
    </div>` : "";

  const isMe = msg.user_id === currentUser.id;

  msgEl.innerHTML = `
    <img class="avatar" src="${avatarUrl}" onerror="this.src='asets/png/profile.webp'">
    <div class="content" style="position: relative; min-width: 80px; transition: transform 0.2s ease; margin-bottom: ${uniqueIcons.length > 0 ? '15px' : '5px'};">
      <div class="username">${escapeHtml(currentUsername)}${getBadge(currentRole)}</div>
      ${replyHtml}
      <div class="text" style="${msg.message === "Pesan ini telah dihapus" ? "font-style:italic;color:#aaa;" : ""} padding-bottom: 12px;">${contentHtml}</div>
      ${reactionsHtml}
      <div class="message-info" style="position: absolute; bottom: 4px; right: 8px; display:flex; align-items:center; gap:2px;">
        <span class="timestamp" style="font-size:9px; opacity:0.5;">${formatTime(msg.created_at)}</span>
        ${statusIcon}
      </div>
    </div>`;

    let startX = 0; let currentX = 0; let swiping = false;
  let holdTimer = null; let isHeld = false;
  let lastTapTime = 0; // 🔥 Tambahan untuk deteksi double tap 🔥

  msgEl.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX; currentX = startX; swiping = true; isHeld = false;
    msgEl.style.transition = "none";

    const realMsgId = msgEl.id.replace("msg-", ""); 

    if (isMe && msg.message !== "Pesan ini telah dihapus") {
      holdTimer = setTimeout(() => {
        isHeld = true;
        swiping = false;
        window.showDeleteMenu(realMsgId); 
      }, 500); 
    }
  }, { passive: true });

  msgEl.addEventListener("touchmove", (e) => {
    if (!swiping) return;
    currentX = e.touches[0].clientX; let diff = currentX - startX;
    if (Math.abs(diff) > 10) clearTimeout(holdTimer);

    if (msgEl.classList.contains("self")) { if (diff < 0) { if (diff < -70) diff = -70; msgEl.style.transform = `translateX(${diff}px)`; } } 
    else { if (diff > 0) { if (diff > 70) diff = 70; msgEl.style.transform = `translateX(${diff}px)`; } }
  }, { passive: true });

  msgEl.addEventListener("touchend", (e) => {
    clearTimeout(holdTimer);
    let diff = currentX - startX;
    const realMsgId = msgEl.id.replace("msg-", "");

    // 🔥 LOGIKA DOUBLE TAP UNTUK REACTION 🔥
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    if (tapLength < 300 && tapLength > 0 && !isHeld && Math.abs(diff) < 10 && msg.message !== "Pesan ini telah dihapus") {
      window.openReactionMenu(realMsgId, e);
      if (e.cancelable) e.preventDefault(); 
    }
    lastTapTime = currentTime; // Update waktu tap terakhir

    msgEl.style.transition = "transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)"; 
    msgEl.style.transform = "translateX(0)";

    const isSelf = msgEl.classList.contains("self");
    if ((isSelf && diff < -50) || (!isSelf && diff > 50)) {
      currentReplyId = realMsgId;
      if (inputEl) inputEl.dataset.replyTo = realMsgId;
      const replyBox = document.getElementById("reply-preview-box");
      if (replyBox) {
        let previewText = msg.message;
        if (msg.sticker_url) previewText = "Stiker";
        if (msg.audio_url) previewText = "Voice Note";
        replyBox.style.display = "flex";
        replyBox.innerHTML = `<div class="reply-content-wrapper"><div class="reply-title">Membalas ${escapeHtml(currentUsername)}</div><div class="reply-text-preview">${escapeHtml(previewText || "")}</div></div><div class="close-reply-btn" onclick="window.cancelReply()">&times;</div>`;
      }
      if (inputEl) inputEl.focus();
      if (navigator.vibrate) navigator.vibrate(30);
    }
    swiping = false; currentX = 0;
  });

  const typingIndicator = document.getElementById("typing-indicator-bubble");
  if (typingIndicator) {
    messagesEl.insertBefore(msgEl, typingIndicator);
  } else {
    messagesEl.appendChild(msgEl);
  }
}

function updateMessageStatusUI(messageId, status) {
  const msgEl = document.getElementById(`msg-${messageId}`);
  if (!msgEl) return;
  const infoEl = msgEl.querySelector(".message-info");
  const timeEl = msgEl.querySelector(".timestamp");
  if (!infoEl || !timeEl) return;
  const oldStatus = infoEl.querySelector(".status-icon");
  if (oldStatus) oldStatus.remove();
  timeEl.insertAdjacentHTML("afterend", getStatusIcon(status));
}

// ===== Load Messages =====
async function loadMessages() {
  if (!messagesEl || !currentUser) return;
  if (isFirstMessageLoad) showChatLoading();

  const start = Date.now();
  const waktu24JamLalu = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("messages")
    .select(`*, reply_to_msg:reply_to(id, username, message), profiles:profiles!messages_user_id_fkey(username, avatar_url, role)`)
    .eq("room_id", currentRoomId)
    .gte("created_at", waktu24JamLalu) 
    .order("created_at", { ascending: false }) 
    .limit(20); 

  const elapsed = Date.now() - start;
  const minDelay = 700;
  if (isFirstMessageLoad && elapsed < minDelay) await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));

  if (error) {
    messagesEl.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:40px 20px; margin-top:20px; color:#ff4d4f;"><div style="font-size:26px;">⚠️</div><div style="font-size:14px; font-weight:600;">Gagal memuat pesan</div></div>`;
    return;
  }

  isFirstMessageLoad = false;

  messagesEl.innerHTML = `
    <div class="encryption-notice">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/></svg>
      <span>Pesan dan panggilan dienkripsi secara <strong>end-to-end</strong>. Tidak ada orang di luar chat ini yang dapat membaca atau mendengarkannya.</span>
    </div>
  `;

  if (!data || data.length === 0) {
    messagesEl.innerHTML += `
      <div class="empty-chat">
        <div class="empty-icon">💬</div>
        <div class="empty-title">Belum ada pesan</div>
        <div class="empty-subtitle">Mulai percakapan sekarang juga</div>
      </div>
    `;
    await markRoomAsRead();
    return;
  }

  const sortedData = data.reverse();
  let unreadCount = 0;
  let firstUnreadMsgId = null;

  sortedData.forEach((msg) => {
    if (msg.user_id !== currentUser.id && msg.status !== "read" && !msg.is_system) {
      unreadCount++;
      if (!firstUnreadMsgId) {
        firstUnreadMsgId = msg.id; 
      }
    }
  });

  sortedData.forEach((msg) => {
    if (msg.id === firstUnreadMsgId && unreadCount > 0) {
      const unreadDivider = document.createElement("div");
      unreadDivider.className = "unread-divider";
      unreadDivider.innerHTML = `<span>${unreadCount} PESAN BARU</span>`;
      messagesEl.appendChild(unreadDivider);
    }
    renderMessage(msg);
  });

  setTimeout(scrollToBottom, 100);
  await markRoomAsRead();
}

async function Message() {
  const text = chatInput?.value.trim();
  if (!text || !currentUser) return;

  if (presenceChannel) {
    clearTimeout(typingTimeout);
    isCurrentlyTyping = false;
    presenceChannel.track({ isTyping: false, username: myUsername }).catch(()=>{});
  }
  
  removeTypingBubble(); 

  const replyTo = chatInput.dataset.replyTo || null;
  const tempId = "temp-" + Date.now();
  let replyData = null;

  if (replyTo) {
    const repliedEl = document.getElementById(`msg-${replyTo}`);
    if (repliedEl) {
      replyData = {
        id: replyTo,
        username: repliedEl.querySelector(".username")?.innerText || "User",
        message: repliedEl.querySelector(".text")?.innerText || "",
      };
    }
  }

  const optimisticMsg = {
    id: tempId,
    message: text,
    user_id: currentUser.id,
    username: myUsername,
    avatar: myAvatar, 
    role: myRole || "user",
    created_at: new Date().toISOString(),
    room_id: currentRoomId, 
    status: "sending", 
    reply_to_msg: replyData,
  };

  renderMessage(optimisticMsg);
  scrollToBottom();

  chatInput.value = ""; 
  chatInput.style.height = "auto";
  window.cancelReply();
  
  if (sendSound) sendSound.play().catch(() => {});

  try {
    const payload = { 
      message: text, 
      user_id: currentUser.id, 
      username: myUsername, 
      room_id: currentRoomId,
      reply_to: replyTo, 
      status: "sent" 
    };

    if (window.currentChatMode === 'group' && window.activeGroupId) {
      payload.group_id = window.activeGroupId;
    }

    const { data, error } = await supabase.from("messages").insert([payload]).select().single();

    if (error) throw error;

    const tempEl = document.getElementById(`msg-${tempId}`);
    if (tempEl && data) { 
        tempEl.id = `msg-${data.id}`; 
        updateMessageStatusUI(data.id, "sent"); 
        if (typeof triggerPushNotif === "function") triggerPushNotif(text); 
    }

  } catch (err) {
    console.error("Gagal kirim:", err);
    showToast("Gagal mengirim pesan");
    const failEl = document.getElementById(`msg-${tempId}`);
    if (failEl) {
        failEl.querySelector(".message-info")?.insertAdjacentHTML(
            "beforeend", 
            `<span style="font-size:10px; color:#ff4d4f; margin-left:4px;">failed</span>`
        );
    }
  }
}

if (Btn) Btn.onclick = Message;

if (inputEl) {
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { 
        e.preventDefault(); 
        Message(); 
    }
  });
}

async function sendAudioMessage(url) {
  const tempId = "temp-" + Date.now();
  renderMessage({ id: tempId, message: "🎤 Voice Note", audio_url: url, user_id: currentUser.id, username: myUsername, avatar: myAvatar, role: myRole || "user", created_at: new Date().toISOString(), room_id: currentRoomId, status: "sending" });
  scrollToBottom();

  try {
    const { data, error } = await supabase.from("messages").insert([{ message: "🎤 Voice Note", audio_url: url, user_id: currentUser.id, username: myUsername, room_id: currentRoomId, status: "sent" }]).select().single();
    if (error) throw error;
    const tempEl = document.getElementById(`msg-${tempId}`);
    if (tempEl && data) { 
        tempEl.id = `msg-${data.id}`; 
        updateMessageStatusUI(data.id, "sent"); 
        triggerPushNotif("🎤 Voice Note");
    }
  } catch (err) { showToast("Gagal mengirim VN ke chat"); }
}
async function initRealtimeMessages() {
  if (!currentUser) return;

  // 1. Bersihkan channel lama jika ada
  if (messageChannel) {
    await supabase.removeChannel(messageChannel);
    messageChannel = null;
  }

  console.log(`⏳ Menghubungkan realtime room: ${currentRoomId}...`);

  messageChannel = supabase
    .channel(`messages-${currentRoomId}`)
    .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "messages",
        filter: `room_id=eq.${currentRoomId}`
    }, async (payload) => {
      const newMsg = payload.new;
      if (!newMsg || newMsg.room_id !== currentRoomId) return;
      if (document.getElementById(`msg-${newMsg.id}`)) return;

      // 🔥 LOGIKA PANGGILAN (CALL LOGIC) 🔥
      
      // A. Jika ada panggilan masuk (Pihak Penerima)
      if (newMsg.is_system && newMsg.message.includes("📞 Memanggil") && newMsg.user_id !== currentUser.id) {
        if (typeof window.showIncomingCall === "function") {
          window.showIncomingCall(newMsg);
        }
      }

      // B. Jika panggilan ditolak/tak terjawab/berakhir (Pihak Penelepon & Penerima)
      const stopKeywords = ["🚫 Panggilan Ditolak", "☎️ Panggilan tak terjawab", "Panggilan berakhir"];
      const isCallStopped = stopKeywords.some(key => newMsg.message.includes(key));

      if (newMsg.is_system && isCallStopped) {
        if (typeof window.endCall === "function") {
          // False artinya tidak silent, agar muncul toast "Panggilan berakhir"
          window.endCall(false); 
        }
      }

      // Prosedur render pesan seperti biasa
      const senderProfile = await getCachedProfile(newMsg.user_id);
      newMsg.profiles = {
        username: senderProfile?.username || "User",
        avatar_url: senderProfile?.avatar_url || "asets/png/profile.webp",
        role: senderProfile?.role || "user"
      };

      removeTypingBubble();

      if (newMsg.user_id === currentUser.id && !newMsg.is_system) {
        const tempEl = document.querySelector(`[id^="msg-temp-"]`);
        if (tempEl) tempEl.remove();
        renderMessage(newMsg);
      } else {
        renderMessage(newMsg);
        // Suara pesan masuk hanya jika bukan sistem & bukan kita sendiri
        if (!newMsg.is_system && receiveSound) receiveSound.play().catch(() => {});

        if (newMsg.status !== "read" && !document.hidden && !newMsg.is_system) {
          await supabase.from("messages").update({ status: "read" }).eq("id", newMsg.id);
        }
      }
      scrollToBottom();
    })
    .on("postgres_changes", { 
        event: "UPDATE", 
        schema: "public", 
        table: "messages",
        filter: `room_id=eq.${currentRoomId}`
    }, (payload) => {
      const updated = payload.new;
      const old = payload.old;
      if (!updated || updated.room_id !== currentRoomId) return;

      if (updated.status !== old?.status && updated.user_id === currentUser.id) {
          updateMessageStatusUI(updated.id, updated.status || "sent");
      }

      if (updated.message === "Pesan ini telah dihapus") {
        const msgEl = document.getElementById(`msg-${updated.id}`);
        if (msgEl) {
          const textEl = msgEl.querySelector(".text");
          if (textEl) {
            textEl.innerHTML = "<i>Pesan ini telah dihapus</i>";
            textEl.style.color = "#aaa";
            textEl.querySelectorAll("img, .vn-custom-player").forEach(m => m.remove());
          }
        }
      }

      // 🔥 UPDATE REACTION SECARA REALTIME 🔥
      if (JSON.stringify(updated.reactions) !== JSON.stringify(old?.reactions)) {
        const msgEl = document.getElementById(`msg-${updated.id}`);
        if (msgEl) {
           const contentEl = msgEl.querySelector(".content");
           
           // Hapus reaction UI yang lama
           const oldReactions = contentEl.querySelector(".message-reactions");
           if (oldReactions) oldReactions.remove();

           // Render reaction UI yang baru
           const reactions = updated.reactions || {};
           const reactionIcons = Object.values(reactions);
           const uniqueIcons = [...new Set(reactionIcons)].slice(0, 3);

           if (uniqueIcons.length > 0) {
             const reactionsDiv = document.createElement("div");
             reactionsDiv.className = "message-reactions";
             reactionsDiv.innerHTML = `
               ${uniqueIcons.join("")} 
               ${reactionIcons.length > 1 ? `<span style="font-size:9px; color:#999; margin-left:2px;">${reactionIcons.length}</span>` : ""}
             `;
             
             // Masukkan tepat di atas elemen timestamp/message-info
             const msgInfo = contentEl.querySelector(".message-info");
             if (msgInfo) {
               contentEl.insertBefore(reactionsDiv, msgInfo);
             } else {
               contentEl.appendChild(reactionsDiv);
             }
             contentEl.style.marginBottom = '15px'; // Beri space biar rapi
           } else {
             contentEl.style.marginBottom = '5px'; // Kembalikan space normal jika kosong
           }
        }
      }
    })
    .subscribe(async (status, err) => {
       if (status === 'SUBSCRIBED') {
           console.log(`✅ Realtime Messages Berhasil Tersambung di ${currentRoomId}!`);
       } else if (status === 'CHANNEL_ERROR') {
           console.error(`❌ Gagal tersambung ke realtime Supabase. Ada error:`, err);
       }
    });
}

const apiKey = "vPUlBU5Qfz2ZygoEtKXVUqmIEAEcIB08";
async function fetchStickers(query = "") {
  if (!stickerList) return;
  stickerList.innerHTML = "<p style='font-size:12px; color:#999; text-align:center; width:100%;'>Mencari...</p>";
  const endpoint = query ? `https://api.giphy.com/v1/stickers/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=30&rating=g` : `https://api.giphy.com/v1/stickers/trending?api_key=${apiKey}&limit=20&rating=g`;
  try {
    const res = await fetch(endpoint); const data = await res.json(); stickerList.innerHTML = "";
    data.data.forEach((sticker) => {
      const img = document.createElement("img"); img.src = sticker.images.fixed_width_small.webp;
      img.style.cssText = "width:75px; height:75px; margin:4px; cursor:pointer; border-radius:8px; background:#eee;";
      img.loading = "lazy"; img.onclick = () => sendSticker(sticker.images.fixed_width.url);
      stickerList.appendChild(img);
    });
  } catch (err) { stickerList.innerHTML = "<p style='font-size:12px; color:red;'>Gagal memuat stiker.</p>"; }
}

async function sendSticker(url) {
  const tempId = "temp-" + Date.now();
  try {
    const profile = await getCachedProfile(currentUser.id);
    renderMessage({ id: tempId, message: "", user_id: currentUser.id, username: profile?.username || "User", avatar: profile?.avatar_url || "asets/png/profile.webp", role: profile?.role || "user", sticker_url: url, created_at: new Date().toISOString(), room_id: currentRoomId, status: "sending" });
    scrollToBottom(); sendSound.play().catch(() => {});
    const { data, error } = await supabase.from("messages").insert([{ message: "", user_id: currentUser.id, username: profile?.username || "User", avatar: profile?.avatar_url || "asets/png/profile.webp", role: profile?.role || "user", sticker_url: url, room_id: currentRoomId, status: "sent" }]).select().single();
    
    if (error) throw error;
    const tempEl = document.getElementById(`msg-${tempId}`);
    if (tempEl && data) { 
        tempEl.id = `msg-${data.id}`; 
        updateMessageStatusUI(data.id, "sent"); 
        triggerPushNotif("🖼 Mengirim Stiker");
    }
    if (stickerMenu) stickerMenu.style.display = "none";
  } catch (err) { showToast("Gagal kirim stiker"); }
}

if (searchBtn) searchBtn.onclick = () => fetchStickers(searchInput?.value || "");
if (searchInput) searchInput.onkeydown = (e) => { if (e.key === "Enter") fetchStickers(searchInput.value); };
const stickerBtn = document.getElementById("sticker-btn");
if (stickerBtn) { stickerBtn.onclick = () => { if (!stickerMenu) return; stickerMenu.style.display = stickerMenu.style.display === "none" || stickerMenu.style.display === "" ? "flex" : "none"; }; }

window.showDeleteMenu = function(id) {
  selectedMessageId = id; const overlayDelete = document.getElementById("delete-overlay");
  if (overlayDelete) { overlayDelete.style.display = "flex"; if (navigator.vibrate) navigator.vibrate(50); }
};

const confirmDeleteBtn = document.getElementById("confirm-delete");
if (confirmDeleteBtn) {
  confirmDeleteBtn.onclick = async () => {
    if (!selectedMessageId) return;
    confirmDeleteBtn.innerText = "Menghapus..."; confirmDeleteBtn.disabled = true;
    try {
      const { error } = await supabase.from("messages").update({ message: "Pesan ini telah dihapus", sticker_url: null, audio_url: null }).eq("id", selectedMessageId);
      if (error) throw error;
      document.getElementById("delete-overlay").style.display = "none"; showToast("Pesan dihapus");
      const msgEl = document.getElementById(`msg-${selectedMessageId}`);
      if (msgEl) { const textEl = msgEl.querySelector(".text"); if (textEl) { textEl.innerHTML = "<i>Pesan ini telah dihapus</i>"; textEl.style.color = "#aaa"; } }
    } catch (err) { showToast("Gagal menghapus pesan"); } 
    finally { confirmDeleteBtn.innerText = "Hapus"; confirmDeleteBtn.disabled = false; selectedMessageId = null; }
  };
}

// ===== Call Logic =====
let callRingingTimeout = null; 
let callTalkTimer = null;      
let callSeconds = 0;           

function stopRingtone() {
    ringtoneSound.pause();
    ringtoneSound.currentTime = 0;
}

function startCallTimer() {
    const statusEl = document.getElementById('call-status');
    callSeconds = 0;
    if (callTalkTimer) clearInterval(callTalkTimer);
    
    callTalkTimer = setInterval(() => {
        callSeconds++;
        const m = String(Math.floor(callSeconds / 60)).padStart(2, '0');
        const s = String(callSeconds % 60).padStart(2, '0');
        if (statusEl) statusEl.innerText = `${m}:${s}`;
    }, 1000);
}

function stopCallTimer() {
    if (callTalkTimer) {
        clearInterval(callTalkTimer);
        callTalkTimer = null;
    }
}

window.startLiveKitCall = async () => {
    const btn = document.getElementById('btn-start-call');
    const partnerId = btn.dataset.targetId;
    const partnerName = btn.dataset.targetName;
    if (!partnerId) return;

    const overlay = document.getElementById('call-overlay');
    const statusEl = document.getElementById('call-status');
    const nameEl = document.getElementById('call-name');
    const avatarEl = document.getElementById('call-avatar');

    if (overlay) overlay.style.display = 'flex';
    if (nameEl) nameEl.innerText = partnerName;
    
    if (statusEl) {
        statusEl.innerText = "MEMANGGIL...";
        statusEl.classList.add('anim-calling-text');
    }
    if (avatarEl) {
        avatarEl.classList.add('anim-calling-avatar');
    }

    const profile = await getCachedProfile(partnerId);
    if (profile && avatarEl) {
        avatarEl.src = profile.avatar_url || 'asets/png/profile.webp';
    }

    try {
        await supabase.from('messages').insert([{
            room_id: currentRoomId,
            message: `📞 Memanggil ${partnerName}...`,
            user_id: currentUser.id,
            is_system: true
        }]);

        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        callRingingTimeout = setTimeout(async () => {
            window.endCall();
            await supabase.from('messages').insert([{
                room_id: currentRoomId,
                message: `☎️ Panggilan tak terjawab`,
                user_id: currentUser.id,
                is_system: true
            }]);
        }, 30000);

        await connectToCall(currentRoomId);

    } catch (err) {
        console.error("Panggilan Gagal:", err);
        showToast("Gagal menyambung panggilan.");
        window.endCall(true);
    }
};

window.endCall = (isSilent = false) => {
    stopRingtone(); 
    clearTimeout(callRingingTimeout);
    stopCallTimer();

    const avatarEl = document.getElementById('call-avatar');
    const statusEl = document.getElementById('call-status');
    if (avatarEl) avatarEl.classList.remove('anim-calling-avatar');
    if (statusEl) {
        statusEl.classList.remove('anim-calling-text');
        statusEl.style.color = ""; 
    }

    const callOverlay = document.getElementById('call-overlay');
    const incomingOverlay = document.getElementById('incoming-call-overlay');
    let isOverlayOpen = (callOverlay && callOverlay.style.display !== 'none') || 
                        (incomingOverlay && incomingOverlay.style.display !== 'none');

    if (callRoom) {
        callRoom.disconnect();
        callRoom = null;
    }
    
    if (callOverlay) callOverlay.style.display = 'none';
    if (incomingOverlay) incomingOverlay.style.display = 'none';
    
    if (isOverlayOpen && !isSilent) {
        if (callSeconds > 0) {
            const m = String(Math.floor(callSeconds / 60)).padStart(2, '0');
            const s = String(callSeconds % 60).padStart(2, '0');
            showToast(`Panggilan berakhir (${m}:${s})`);
        } else {
            showToast("Panggilan berakhir");
        }
    }
};

let callSignalData = null;

window.showIncomingCall = async function(msgData) {
    callSignalData = msgData; 
    const overlay = document.getElementById('incoming-call-overlay');
    const nameEl = document.getElementById('incoming-name');
    const avatarEl = document.getElementById('incoming-avatar'); 
    
    if (overlay) overlay.style.display = 'flex';
    if (nameEl) nameEl.innerText = "Memuat..."; 

    if (msgData.user_id) {
        const profile = await getCachedProfile(msgData.user_id);
        if (profile) {
            if (avatarEl) avatarEl.src = profile.avatar_url || 'asets/png/profile.webp';
            if (nameEl) nameEl.innerText = profile.username || "Teman"; 
        }
    }

    ringtoneSound.play().catch(e => console.log("Browser blokir autoplay:", e));
};

window.answerCall = async () => {
    stopRingtone(); 

    const incomingOverlay = document.getElementById('incoming-call-overlay');
    if (incomingOverlay) incomingOverlay.style.display = 'none';

    const callOverlay = document.getElementById('call-overlay');
    if (callOverlay) callOverlay.style.display = 'flex';

    const callStatus = document.getElementById('call-status');
    if (callStatus) callStatus.innerText = "CONNECTING...";

    const callAvatar = document.getElementById('call-avatar');
    if (callAvatar && callSignalData?.user_id) {
        const profile = await getCachedProfile(callSignalData.user_id);
        if (profile) {
            callAvatar.src = profile.avatar_url || 'asets/png/profile.webp';
        }
    }

    if (callSignalData) {
        await connectToCall(callSignalData.room_id);
        if (callStatus) callStatus.innerText = "ON CALL";
    }
};

window.rejectCall = async () => {
    stopRingtone(); 

    const incomingOverlay = document.getElementById('incoming-call-overlay');
    if (incomingOverlay) incomingOverlay.style.display = 'none';
    
    if (callSignalData) {
        await supabase.from('messages').insert([{
            room_id: callSignalData.room_id,
            message: `🚫 Panggilan Ditolak`,
            user_id: currentUser.id,
            is_system: true
        }]);
        callSignalData = null;
    }
};

async function connectToCall(roomName) {
    try {
        const apiUrl = supabase.supabaseUrl;
        const anonKey = supabase.supabaseKey;

        const response = await fetch(`${apiUrl}/functions/v1/get-livekit-token`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'apikey': anonKey, 
                'Authorization': `Bearer ${anonKey}` 
            },
            body: JSON.stringify({ username: myUsername, identity: currentUser.id, roomName: roomName })
        });
        
        const data = await response.json();

        callRoom = new LivekitClient.Room({ adaptiveStream: true, dynacast: true });

        callRoom.on(LivekitClient.RoomEvent.TrackSubscribed, (track) => {
            if (track.kind === "audio") {
                const element = track.attach();
                document.body.appendChild(element);
                element.play().catch(() => {});
            }
        });
        callRoom.on(LivekitClient.RoomEvent.ParticipantDisconnected, (participant) => {
            showToast("Panggilan diakhiri oleh lawan bicara.");
            window.endCall();
        });

        callRoom.on(LivekitClient.RoomEvent.Disconnected, () => {
            window.endCall();
        });

        callRoom.on(LivekitClient.RoomEvent.ParticipantConnected, (participant) => {
            clearTimeout(callRingingTimeout); 
            
            const avatarEl = document.getElementById('call-avatar');
            const statusEl = document.getElementById('call-status');
            if (avatarEl) avatarEl.classList.remove('anim-calling-avatar');
            if (statusEl) {
                statusEl.classList.remove('anim-calling-text');
                statusEl.style.color = "#2ecc71"; 
            }

            startCallTimer(); 
        });

        const LIVEKIT_URL = "wss://voicegrup-zxmeibkn.livekit.cloud"; 
        await callRoom.connect(LIVEKIT_URL, data.token);
        await callRoom.localParticipant.setMicrophoneEnabled(true);

        if (callRoom.remoteParticipants.size > 0) {
            clearTimeout(callRingingTimeout);
            
            const avatarEl = document.getElementById('call-avatar');
            const statusEl = document.getElementById('call-status');
            if (avatarEl) avatarEl.classList.remove('anim-calling-avatar');
            if (statusEl) {
                statusEl.classList.remove('anim-calling-text');
                statusEl.style.color = "#2ecc71"; 
            }

            startCallTimer();
        }

    } catch (e) {
        console.error("Gagal koneksi LiveKit:", e.message);
        window.endCall();
    }
}

// ===== Voice Note Logic =====
const actionBtn = document.getElementById("action-btn"); 
const chatInput = document.getElementById("chat-input"); 
const vnOverlay = document.getElementById("vn-overlay"); 
const vnTimer = document.getElementById("vn-timer");
let holdTimer, timerInterval; let isRecording = false; let startX = 0; let seconds = 0;

function startVNTimer() { seconds = 0; vnTimer.innerText = "00:00"; timerInterval = setInterval(() => { seconds++; let m = Math.floor(seconds / 60).toString().padStart(2, "0"); let s = (seconds % 60).toString().padStart(2, "0"); vnTimer.innerText = `${m}:${s}`; }, 1000); }
function stopVNTimer() { clearInterval(timerInterval); }

let mediaRecorder; let audioChunks = []; let isCanceledGlobal = false;
async function startVN(e) {
  if (callRoom && callRoom.state === 'connected') {
    showToast("Matikan telpon dulu untuk merekam suara!");
    return;
  }

  isRecording = true; 
  audioChunks = []; 
  startX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (event) => { 
      if (event.data.size > 0) audioChunks.push(event.data); 
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      
      if (!isCanceledGlobal && audioChunks.length > 0) { 
        uploadToCloudinary(new Blob(audioChunks, { type: "audio/mpeg" })); 
      }
    };

    mediaRecorder.start(); 
    actionBtn.classList.add("is-recording"); 
    chatInput.style.visibility = "hidden"; 
    vnOverlay.style.display = "flex";
    if (navigator.vibrate) navigator.vibrate(60); 
    startVNTimer();

  } catch (err) {
    let pesanError = "Gagal akses mic";
    if (err.name === 'NotAllowedError') pesanError = "Izin Mic Ditolak Browser";
    else if (err.name === 'NotReadableError') pesanError = "Mic dipakai aplikasi lain (WA/Game/Telpon)";
    else if (err.name === 'SecurityError') pesanError = "Wajib HTTPS untuk pakai Mic";
    
    showToast(pesanError); 
    isRecording = false;
  }
}

function stopVN(isCanceled = false) {
  if (!isRecording) return;
  isRecording = false; isCanceledGlobal = isCanceled; stopVNTimer();
  if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  actionBtn.classList.remove("is-recording"); chatInput.style.visibility = "visible"; vnOverlay.style.display = "none";
  if (isCanceled) { showToast("VN Dibatalkan"); if (navigator.vibrate) navigator.vibrate([30, 30]); } 
  else { if (seconds < 1) { isCanceledGlobal = true; showToast("Tahan lebih lama untuk merekam"); } }
}

window.sendReaction = async function(emoji) {
  if (!reactionTargetId) return;
  try {
    const { data: msg } = await supabase.from("messages").select("reactions").eq("id", reactionTargetId).single();
    let newReactions = msg.reactions || {};
    if (newReactions[currentUser.id] === emoji) delete newReactions[currentUser.id]; else newReactions[currentUser.id] = emoji;
    await supabase.from("messages").update({ reactions: newReactions }).eq("id", reactionTargetId);
    document.getElementById("reaction-menu").style.display = "none";
  } catch (err) { showToast("Gagal memberikan emoji"); }
};

if (actionBtn) {
  actionBtn.onclick = () => { if (chatInput && chatInput.value.trim() !== "") Message(); };
  actionBtn.addEventListener("mousedown", (e) => { if (chatInput.value.trim() === "") holdTimer = setTimeout(() => startVN(e), 300); });
  window.addEventListener("mousemove", (e) => { if (isRecording) { if (startX - e.clientX > 100) stopVN(true); } });
  window.addEventListener("mouseup", () => { clearTimeout(holdTimer); if (isRecording) stopVN(false); });
  actionBtn.addEventListener("touchstart", (e) => { if (chatInput.value.trim() === "") holdTimer = setTimeout(() => startVN(e), 300); }, { passive: true });
  actionBtn.addEventListener("touchmove", (e) => { if (isRecording) { if (startX - e.touches[0].clientX > 80) stopVN(true); } }, { passive: true });
  actionBtn.addEventListener("touchend", () => { clearTimeout(holdTimer); if (isRecording) stopVN(false); });
}

async function uploadToCloudinary(blob) {
  const formData = new FormData(); formData.append("file", blob); formData.append("upload_preset", "hopehype_preset"); formData.append("resource_type", "video");
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/dhhmkb8kl/upload`, { method: "POST", body: formData });
    const data = await res.json();
    if (data.secure_url) sendAudioMessage(data.secure_url); else showToast("Gagal upload: " + (data.error?.message || "Unknown error"));
  } catch (err) { showToast("Koneksi bermasalah saat mengirim VN"); }
}

window.playVN = function (btn, audioUrl) {
  if (window.currentAudio && !window.currentAudio.paused) {
    window.currentAudio.pause();
    document.querySelectorAll(".vn-custom-player").forEach((p) => p.classList.remove("playing"));
    document.querySelectorAll(".vn-play-btn").forEach((b) => { b.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M8 5v14l11-7z"/></svg>`; });
    if (window.currentAudio.src === audioUrl) { window.currentAudio = null; return; }
  }
  const audio = new Audio(audioUrl); window.currentAudio = audio; const playerContainer = btn.closest(".vn-custom-player");
  audio.play().then(() => { playerContainer.classList.add("playing"); btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`; }).catch(() => showToast("Gagal memutar pesan suara."));
  audio.onended = () => { playerContainer.classList.remove("playing"); btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M8 5v14l11-7z"/></svg>`; window.currentAudio = null; };
};

// ===== Initial Routing & Initialization =====
const urlParams = new URLSearchParams(window.location.search);
const fromId = urlParams.get('from');
const groupId = urlParams.get('group');
const groupName = urlParams.get('gname');

async function init() {
  try {
    const ok = await requireLogin(); 
    if (!ok) return;

    const headerTitle = document.querySelector(".chat-header h3");
    const btnCall = document.getElementById('btn-start-call');
    const btnInvite = document.getElementById('btn-open-invite');

    if (groupId) {
        window.currentChatMode = 'group';
        window.activeGroupId = groupId;
        currentRoomId = `group_${groupId}`;
        
        if (btnCall) btnCall.style.display = 'none'; 
        if (btnInvite) btnInvite.style.display = 'flex'; 
        
        if (headerTitle) {
            const customIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; cursor: pointer; margin-left: 6px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15)); transition: transform 0.3s ease;" onclick="window.openGroupSettings()" title="Pengaturan Grup"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
            headerTitle.innerHTML = `${escapeHtml(groupName || "Memuat Grup...")} ${customIcon}`;
        }
        
        window.history.replaceState({}, document.title, window.location.pathname);

    } else if (fromId) {
        window.currentChatMode = 'private';
        window.activeGroupId = null;
        
        const ids = [currentUser.id, fromId].sort();
        currentRoomId = `pv_${ids[0]}_${ids[1]}`;
        
        if (btnInvite) btnInvite.style.display = 'none'; 
        
        if (headerTitle) {
            const profile = await getCachedProfile(fromId);
            if (profile) {
                headerTitle.innerHTML = `${escapeHtml(profile.username)} <span style="font-size:10px; opacity:0.5;">#${escapeHtml(profile.short_id || "")}</span>`;
            }
            
            if (btnCall) {
                btnCall.style.display = 'flex';
                btnCall.dataset.targetId = fromId;
                btnCall.dataset.targetName = profile ? profile.username : "Teman";
                btnCall.onclick = () => window.startLiveKitCall();
            }
        }
        
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        window.currentChatMode = null;
        window.activeGroupId = null;
        currentRoomId = "room-1";
        
        if (headerTitle) headerTitle.textContent = "HopeTalk Globe";
        if (btnCall) btnCall.style.display = 'none';
        if (btnInvite) btnInvite.style.display = 'none';
    }

    await initPresence(); 
    await initRealtimeMessages(); 
    await loadMessages(); 
    fetchStickers(); 
    updateHeaderStatus();
    
    scrollToBottom();
  } catch (err) { 
    console.error("Gagal memulai aplikasi:", err); 
  }
}

init();

document.addEventListener("visibilitychange", async () => { 
  if (!document.hidden) await markRoomAsRead(); 
});

const animChatInput = document.getElementById("chat-input");
const animActionBtn = document.getElementById("action-btn");

if (animChatInput && animActionBtn) {
  animChatInput.addEventListener('input', () => {
    if (animChatInput.value.trim().length > 0) {
      animActionBtn.classList.add('mode-typing');
    } else {
      animActionBtn.classList.remove('mode-typing');
    }
  });

  const resetTombol = () => {
    setTimeout(() => {
      if (animChatInput.value.trim().length === 0) {
        animActionBtn.classList.remove('mode-typing');
      }
    }, 100); 
  };

  animActionBtn.addEventListener('click', resetTombol);
  animChatInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter" && !e.shiftKey) resetTombol();
  });
}

async function markRoomAsRead() {
  if (!currentRoomId || !currentUser) return;

  try {
    await supabase
      .from("messages")
      .update({ status: "read" })
      .eq("room_id", currentRoomId)
      .neq("user_id", currentUser.id)
      .neq("status", "read");

    setTimeout(() => {
      const dividers = document.querySelectorAll(".unread-divider");
      dividers.forEach(d => {
        d.style.transition = "opacity 0.8s ease";
        d.style.opacity = "0"; 
        setTimeout(() => d.remove(), 800); 
      });
    }, 3500); 

  } catch (err) {
    console.error("Gagal menandai pesan terbaca:", err);
  }
}

// ==========================================
// LOGIKA GRUP (UNDANG & PENGATURAN) 
// ==========================================
const btnOpenInvite = document.getElementById('btn-open-invite');
if (btnOpenInvite) {
  btnOpenInvite.onclick = (e) => {
    e.preventDefault(); e.stopPropagation(); 
    const modal = document.getElementById('invite-modal');
    if (modal) { modal.style.display = 'flex'; if (navigator.vibrate) navigator.vibrate(40); }
  };
}

const btnInviteNow = document.getElementById('btn-invite-now');
if (btnInviteNow) {
  btnInviteNow.onclick = async () => {
    let input = document.getElementById('in-invite-search').value.trim();
    input = input.replace('@', '').replace('#', ''); 

    if (!input) return showToast("Isi ID atau Username dulu!");
    if (!window.activeGroupId) return showToast("Grup belum terpilih!");

    btnInviteNow.innerText = "Mencari...";
    btnInviteNow.disabled = true;

    try {
      const { data: targetUser, error: findError } = await supabase
        .from('profiles').select('id, username')
        .or(`short_id.eq.${input.toUpperCase()},username.ilike.${input}`).maybeSingle();

      if (findError || !targetUser) throw new Error("User tidak ditemukan!");

      const { data: isMember } = await supabase
        .from('group_members').select('id')
        .eq('group_id', window.activeGroupId).eq('user_id', targetUser.id).maybeSingle();

      if (isMember) throw new Error("Dia sudah ada di grup ini!");

      const { error: insertError } = await supabase
        .from('group_members').insert([{ group_id: window.activeGroupId, user_id: targetUser.id }]);
      if (insertError) throw insertError;

      const systemMsg = `${myUsername} mengundang ${targetUser.username}`;
      await supabase.from('messages').insert([{
          room_id: `group_${window.activeGroupId}`,
          message: systemMsg,
          user_id: currentUser.id,
          is_system: true
      }]);

      showToast(`Berhasil! ${targetUser.username} bergabung!`);
      const modalInvite = document.getElementById('invite-modal');
      if(modalInvite) modalInvite.style.display = 'none';
      document.getElementById('in-invite-search').value = '';

    } catch (err) { showToast(err.message); } 
    finally { btnInviteNow.innerText = "Tambah Member"; btnInviteNow.disabled = false; }
  };
}

let selectedEditGroupFile = null;
const editGroupPhotoInput = document.getElementById('edit-group-photo-input');
if (editGroupPhotoInput) {
    editGroupPhotoInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedEditGroupFile = file; 
            document.getElementById('edit-group-photo-preview').src = URL.createObjectURL(file); 
        }
    };
}

window.openGroupSettings = async () => {
    if (!window.activeGroupId || window.currentChatMode !== 'group') return;
    
    const modal = document.getElementById('group-settings-modal');
    if(modal) modal.style.display = 'flex';

    const container = document.getElementById('member-list-container');
    if(container) container.innerHTML = "<div style='font-size:12px; color:#666; text-align:center;'>Memuat anggota...</div>";

    try {
        const { data: group, error: groupErr } = await supabase
            .from('groups').select('*').eq('id', window.activeGroupId).single();
            
        if (groupErr) throw groupErr;
        
        const isAdmin = group && group.created_by === currentUser.id;
        
        const editNameInput = document.getElementById('edit-group-name');
        if(editNameInput && group) editNameInput.value = group.name || '';

        const editPhotoPreview = document.getElementById('edit-group-photo-preview');
        if (editPhotoPreview && group) editPhotoPreview.src = group.photo_url || 'asets/png/profile.webp';
        
        selectedEditGroupFile = null;

        const { data: members, error: membersErr } = await supabase
            .from('group_members')
            .select(`user_id, profiles(username, avatar_url)`)
            .eq('group_id', window.activeGroupId);

        if (membersErr) throw membersErr;

        if(container) {
            container.innerHTML = "";
            if (members && members.length > 0) {
                members.forEach(m => {
                    const profileName = m.profiles?.username || "User";
                    const profileAvatar = m.profiles?.avatar_url || 'asets/png/profile.webp';
                    const isMe = m.user_id === currentUser.id;
                    
                    const kickButton = (isAdmin && !isMe) 
                        ? `<button onclick="window.kickMember('${m.user_id}', '${profileName}')" style="margin-left:auto; background:rgba(239, 68, 68, 0.1); color:#ef4444; border:none; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:600; cursor:pointer;">Keluarkan</button>` 
                        : '';

                    let roleLabel = '';
                    if (isMe && isAdmin) roleLabel = '<span style="font-size:10px; color:#10b981; font-weight:600; background:rgba(16, 185, 129, 0.1); padding:2px 6px; border-radius:4px;">Admin (Kamu)</span>';
                    else if (isMe) roleLabel = '<span style="font-size:10px; color:#3a7bd5; font-weight:600;">(Kamu)</span>';
                    else if (group.created_by === m.user_id) roleLabel = '<span style="font-size:10px; color:#10b981; font-weight:600; background:rgba(16, 185, 129, 0.1); padding:2px 6px; border-radius:4px;">Admin</span>';

                    const div = document.createElement('div');
                    div.style = "display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid rgba(0,0,0,0.05);";
                    div.innerHTML = `
                        <img src="${profileAvatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border: 1px solid rgba(0,0,0,0.1);">
                        <div style="display:flex; flex-direction:column; gap:2px;">
                          <span style="font-size:13px; font-weight:600; color: inherit;">${profileName}</span>
                          ${roleLabel}
                        </div>
                        ${kickButton}
                    `;
                    container.appendChild(div);
                });
            } else {
                container.innerHTML = "<div style='font-size:12px; color:#999; text-align:center;'>Belum ada anggota.</div>";
            }
        }
    } catch (err) {
        if(container) container.innerHTML = "<div style='font-size:12px; color:#ff4757; text-align:center;'>Gagal memuat data.</div>";
    }
};

window.updateGroupInfo = async () => {
    const newName = document.getElementById('edit-group-name')?.value.trim();
    const btn = document.getElementById('btn-save-group-info');
    
    if (!newName && !selectedEditGroupFile) {
        return showToast("Tidak ada yang diubah");
    }

    if(btn) { btn.innerText = "Mengunggah..."; btn.disabled = true; }

    try {
        let finalPhotoUrl = null;

        if (selectedEditGroupFile) {
            const fd = new FormData();
            fd.append("file", selectedEditGroupFile);
            fd.append("upload_preset", "post_hope"); 

            const res = await fetch("https://api.cloudinary.com/v1_1/dhhmkb8kl/image/upload", { 
                method: "POST", body: fd 
            });
            const cData = await res.json();
            
            if (cData.secure_url) {
                finalPhotoUrl = cData.secure_url;
            } else {
                throw new Error("Gagal mengunggah foto ke server");
            }
        }

        const updateData = {};
        if (newName) updateData.name = newName;
        if (finalPhotoUrl) updateData.photo_url = finalPhotoUrl;

        const { error } = await supabase.from('groups').update(updateData).eq('id', window.activeGroupId);
        if(error) throw error;
        
        showToast("Info grup berhasil diperbarui!");
        
        if (newName) {
            const headerTitle = document.querySelector('.chat-header h3');
            if(headerTitle) {
                const customIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; cursor: pointer; margin-left: 6px;" onclick="window.openGroupSettings()"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
                headerTitle.innerHTML = `${escapeHtml(newName)} ${customIcon}`;
            }
        }
        
        selectedEditGroupFile = null;
        const modal = document.getElementById('group-settings-modal');
        if(modal) modal.style.display = 'none';

    } catch(err) { 
        showToast("Gagal: " + err.message); 
    } finally { 
        if(btn) { btn.innerText = "Simpan Perubahan"; btn.disabled = false; } 
    }
};

window.leaveGroup = async () => {
    if(!confirm("Yakin mau keluar dari grup ini?")) return;
    try {
        const { error } = await supabase.from('group_members').delete()
            .eq('group_id', window.activeGroupId).eq('user_id', currentUser.id);
        if (error) throw error;
        
        await supabase.from('messages').insert([{
            room_id: `group_${window.activeGroupId}`,
            message: `${myUsername} telah meninggalkan grup`,
            user_id: currentUser.id,
            is_system: true
        }]);

        showToast("Kamu telah keluar dari grup");
        
        const modal = document.getElementById('group-settings-modal');
        if(modal) modal.style.display = 'none';
        
        window.location.href = '/hypetalk';
    } catch(err) { showToast("Gagal keluar dari grup"); }
};

window.kickMember = async (targetId, targetName) => {
    if(!confirm(`Keluarkan ${targetName} dari grup?`)) return;
    try {
        const { error } = await supabase.from('group_members').delete()
            .eq('group_id', window.activeGroupId).eq('user_id', targetId);
        if (error) throw error;
        
        showToast(`${targetName} dikeluarkan`);
        window.openGroupSettings(); // Refresh list member
        
        await supabase.from('messages').insert([{
            room_id: `group_${window.activeGroupId}`,
            message: `${targetName} telah dikeluarkan oleh admin`,
            user_id: currentUser.id,
            is_system: true
        }]);
    } catch(err) { showToast("Gagal mengeluarkan member"); }
};
// ==========================================
// HANDLE TOMBOL KEMBALI (BACK BUTTON SYSTEM)
// ==========================================

// 1. Dorong state awal saat halaman pertama kali dimuat
history.pushState({ page: 'chat-room' }, document.title, window.location.href);

// 2. Listen event popstate (saat user tekan tombol kembali di HP/Browser)
window.addEventListener('popstate', (e) => {
    // Daftar semua ID overlay, modal, atau menu yang mungkin terbuka
    const popups = [
        'reaction-menu',
        'sticker-menu',
        'delete-overlay',
        'invite-modal',
        'group-settings-modal',
        'vn-overlay'
    ];

    let isPopupOpen = false;

    // Cek apakah ada modal/menu yang sedang tampil
    popups.forEach(id => {
        const el = document.getElementById(id);
        if (el && (el.style.display === 'flex' || el.style.display === 'block')) {
            el.style.display = 'none'; // Tutup modalnya
            isPopupOpen = true;
        }
    });

    // Cek juga apakah mode "Reply" sedang aktif
    const replyBox = document.getElementById("reply-preview-box");
    if (replyBox && replyBox.style.display === 'flex') {
        window.cancelReply(); // Panggil fungsi cancel reply kamu
        isPopupOpen = true;
    }

    if (isPopupOpen) {
        // Jika ada menu yang ditutup, kita NETRALKAN efek tombol kembali 
        // dengan cara mendorong state baru agar history tidak benar-benar mundur.
        history.pushState({ page: 'chat-room' }, document.title, window.location.href);
    } else {
        // JIKA TIDAK ADA POPUP YANG TERBUKA:
        // Cek apakah user sedang di dalam room chat (ada ?from= atau ?group= di URL)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('from') || urlParams.get('group')) {
            // Lempar kembali ke halaman beranda/lobby chat-mu (sesuaikan path-nya ya!)
            window.location.href = '/hypetalk'; 
        } else {
            // Kalau memang lagi di lobby, biarkan dia keluar/mundur normal
            history.back(); 
        }
    }
});
