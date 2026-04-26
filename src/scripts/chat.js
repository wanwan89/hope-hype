import { supabase } from '../lib/supabase.js';

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
    
    typingEl.innerHTML = `
      <img id="typing-avatar" class="avatar" src="asets/png/profile.webp" onerror="this.src='asets/png/profile.webp'">
      <div class="content" style="margin-bottom: 5px;">
        <div class="username">${escapeHtml(username)}</div>
        <div class="text">
          <div class="typing-bubble" style="padding: 2px 8px; min-width: auto;">
            <span></span><span></span><span></span>
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

// ==========================================
// FUNGSI PEMICU PUSH NOTIF
// ==========================================
function triggerPushNotif(teksPesan) {
  const partnerId = getPartnerIdFromRoom(currentRoomId);
  if (!partnerId) return; 

  fetch("https://hqetnqnvmdxdgfnnluew.supabase.co/functions/v1/send-chat-notif", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}` 
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
  return true;
}

// ===== Presence / Typing =====
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

  presenceChannel.on("presence", { event: "sync" }, () => {
    const state = presenceChannel.presenceState();
    const typingUsers = [];
    let typingUserId = null; 

    for (const userId in state) {
      if (userId !== currentUser.id && state[userId].some((p) => p.isTyping)) {
        typingUsers.push(state[userId][0].username);
        typingUserId = userId; 
      }
    }

    if (typingUsers.length > 0) {
      if (typeof renderTypingBubble === "function") {
        renderTypingBubble(typingUsers[0], typingUserId);
      }
    } else {
      if (typeof removeTypingBubble === "function") {
        removeTypingBubble();
      }
    }

    const currentTypingHeader = document.getElementById("typing-header");
    const currentStatusHeader = document.getElementById("status-header");
    if (currentTypingHeader && currentStatusHeader) {
      if (typingUsers.length > 0) {
        currentTypingHeader.style.display = "inline-block";
        currentStatusHeader.style.display = "none";
        currentTypingHeader.innerText = `${typingUsers[0]} sedang mengetik...`;
      } else {
        currentTypingHeader.style.display = "none";
        currentStatusHeader.style.display = "inline-block";
      }
    }
  });

  presenceChannel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") await presenceChannel.track({ isTyping: false, username: myUsername });
  });

  if (inputEl) {
    inputEl.removeEventListener("input", handleTypingInput);
    inputEl.addEventListener("input", handleTypingInput);
  }

  if (!globalPresenceChannel) {
    globalPresenceChannel = supabase.channel(`global-online-users`, { config: { presence: { key: currentUser.id } } });
    
    globalPresenceChannel.on("presence", { event: "sync" }, () => {
      const state = globalPresenceChannel.presenceState();
      totalOnlineUsers = Object.keys(state).length;
      updateHeaderStatus();
    });

    globalPresenceChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") await globalPresenceChannel.track({ online: true, last_seen: new Date().toISOString() });
    });
  }
}

async function handleTypingInput() {
  if (!presenceChannel) return;
  const text = inputEl ? inputEl.value.trim() : "";

  if (text === "") {
    clearTimeout(typingTimeout);
    if (isCurrentlyTyping) {
      isCurrentlyTyping = false;
      presenceChannel.track({ isTyping: false, username: myUsername }).catch(()=>{});
    }
    return;
  }

  if (!isCurrentlyTyping) {
    isCurrentlyTyping = true;
    presenceChannel.track({ isTyping: true, username: myUsername }).catch(()=>{});
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isCurrentlyTyping = false;
    if (presenceChannel) presenceChannel.track({ isTyping: false, username: myUsername }).catch(()=>{});
  }, 3000);
}

function updateHeaderStatus() {
  const headerStatusEl = document.getElementById("status-header");
  if (!headerStatusEl || !currentUser) return;

  if (membersEl) membersEl.innerHTML = `<span class="online-dot"></span> ${totalOnlineUsers} user online`;

  if (currentRoomId === "room-1") {
    if (totalOnlineUsers <= 1) { 
      headerStatusEl.innerHTML = `<span style="opacity:0.8;">Hanya kamu yang online</span>`; 
    } else { 
      headerStatusEl.innerHTML = `<span class="online-dot" style="background:#fff; width:7px; height:7px; display:inline-block; border-radius:50%; margin-right:4px;"></span> ${totalOnlineUsers} users online`; 
    }
    return;
  }

  const partnerId = getPartnerIdFromRoom(currentRoomId);
  if (!partnerId) return;

  const state = globalPresenceChannel ? globalPresenceChannel.presenceState() : {};
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

    if (!isHeld && Math.abs(diff) < 10 && msg.message !== "Pesan ini telah dihapus") {
      window.openReactionMenu(realMsgId, e);
    }

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
    avatar: "asets/png/profile.webp", // Default
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
  renderMessage({ id: tempId, message: "🎤 Voice Note", audio_url: url, user_id: currentUser.id, username: myUsername, avatar: "asets/png/profile.webp", role: myRole || "user", created_at: new Date().toISOString(), room_id: currentRoomId, status: "sending" });
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

// ===== Realtime Messages =====
function initRealtimeMessages() {
  if (!currentUser) return;
  if (messageChannel) {
    supabase.removeChannel(messageChannel);
    messageChannel = null;
  }

  messageChannel = supabase
    .channel(`messages-global-monitor`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (payload) => {
      const newMsg = payload.new;

      if (newMsg.is_system) {
        if (newMsg.message.includes("📞 Memanggil")) {
          if (newMsg.user_id !== currentUser.id) {
            if (typeof showIncomingCall === "function") showIncomingCall(newMsg);
          }
        }
        if (newMsg.message.includes("🚫 Panggilan Ditolak")) {
          if (newMsg.user_id !== currentUser.id) {
            if (typeof window.endCall === "function") window.endCall();
            showToast("Panggilan ditolak oleh lawan bicara.");
          }
        }
      }

      if (newMsg.room_id === currentRoomId) {
        if (document.getElementById(`msg-${newMsg.id}`)) return;

        const senderProfile = await getCachedProfile(newMsg.user_id);
        newMsg.profiles = {
          username: senderProfile?.username || "User",
          avatar_url: senderProfile?.avatar_url || "asets/png/profile.webp",
          role: senderProfile?.role || "user"
        };

        if (newMsg.user_id === currentUser.id && !newMsg.is_system) {
          const tempEl = document.querySelector(`[id^="msg-temp-"]`);
          if (tempEl) tempEl.remove();
          renderMessage(newMsg);
        } else {
          if (typeof removeTypingBubble === "function") removeTypingBubble();
          renderMessage(newMsg);
          if (!newMsg.is_system) receiveSound.play().catch(() => {});

          if (newMsg.status !== "read" && !document.hidden && !newMsg.is_system) {
            await supabase.from("messages").update({ status: "read" }).eq("id", newMsg.id);
          }
        }
        scrollToBottom();
      }
    })
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (payload) => {
      const updated = payload.new;
      const old = payload.old;

      if (updated.status !== old?.status) {
        if (updated.user_id === currentUser.id) {
          updateMessageStatusUI(updated.id, updated.status || "sent");
        }
      }

      if (updated.room_id !== currentRoomId) return;

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
        return;
      }

      if (updated.reactions) {
        const msgEl = document.getElementById(`msg-${updated.id}`);
        if (msgEl) {
          const contentEl = msgEl.querySelector(".content");
          const reactions = updated.reactions || {};
          const reactionIcons = Object.values(reactions);
          const uniqueIcons = [...new Set(reactionIcons)].slice(0, 3);
          const reactionsHtml = uniqueIcons.length > 0 ? `${uniqueIcons.join("")} ${reactionIcons.length > 1 ? `<span style="font-size:9px; color:#999; margin-left:2px;">${reactionIcons.length}</span>` : ""}` : "";

          let badgeEl = contentEl.querySelector(".message-reactions");
          if (reactionsHtml) {
            if (!badgeEl) {
              badgeEl = document.createElement("div");
              badgeEl.className = "message-reactions";
              contentEl.insertBefore(badgeEl, contentEl.querySelector(".message-info"));
            }
            badgeEl.innerHTML = reactionsHtml;
            contentEl.style.marginBottom = "15px";
          } else if (badgeEl) {
            badgeEl.remove();
            contentEl.style.marginBottom = "5px";
          }
        }
      }
    }).subscribe();
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
        const response = await fetch(`${SUPABASE_URL}/functions/v1/get-livekit-token`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'apikey': SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}` 
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
        showToast("Gagal terhubung ke server panggilan.");
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

// ===== Initial Routing =====
const urlParams = new URLSearchParams(window.location.search);
const fromId = urlParams.get('from');

if (fromId) {
    // Kalau ada 'from' di URL, set langsung ke room private-nya
    currentRoomId = `pv_${[currentUser?.id || "", fromId].sort().join('_')}`;
    window.history.replaceState({}, document.title, window.location.pathname);
}

document.addEventListener("visibilitychange", async () => { if (!document.hidden) await markRoomAsRead(); });

async function init() {
  try {
    const ok = await requireLogin(); 
    if (!ok) return;

    if (fromId) {
        const ids = [currentUser.id, fromId].sort();
        currentRoomId = `pv_${ids[0]}_${ids[1]}`;
        const headerTitle = document.querySelector(".chat-header h3");
        if (headerTitle) {
            const profile = await getCachedProfile(fromId);
            if (profile) headerTitle.innerText = profile.username;
        }
    }

    await initPresence(); 
    initRealtimeMessages(); 
    await loadMessages(); 
    fetchStickers(); 
    
    scrollToBottom();
  } catch (err) { console.error("Gagal memulai aplikasi:", err); }
}

init();

// Logika Animasi Tombol Mic <-> Send
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
