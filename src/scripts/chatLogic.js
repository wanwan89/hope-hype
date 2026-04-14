import { createClient } from "https://esm.sh/@supabase/supabase-js";

// =======================
// SUPABASE INIT
// =======================
const SUPABASE_URL = "https://hqetnqnvmdxdgfnnluew.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXRucW52bWR4ZGdmbm5sdWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MzUyODIsImV4cCI6MjA4NzMxMTI4Mn0.Cr9lDBZMqfeONi1dfyFzHpBtawBzZTQLBEWKmPJVAOA";

window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabase = window.supabaseClient;

// =======================
// AUDIO CONFIG
// =======================
const sendSound = new Audio("/asets/sound/send.mp3");
const receiveSound = new Audio("/asets/sound/receive.mp3");
const ringtoneSound = new Audio("/asets/sound/call.wav"); // Sesuai file lu
if(ringtoneSound) ringtoneSound.loop = true;

// =======================
// GLOBAL STATE
// =======================
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
let isSidebarLoading = false; 
let selectedGroupFile = null;
let callRoom = null; 

// =======================
// DOM ELEMENTS
// =======================
const messagesEl = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const btnSend = document.getElementById("action-btn");
const membersEl = document.getElementById("chat-members");

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const hamburger = document.getElementById("menu-btn");

const inputSearchId = document.getElementById("input-search-id");
const btnSearchId = document.getElementById("btn-search-id");
const sideUsername = document.getElementById("side-username");
const sideAvatar = document.getElementById("side-avatar");
const myUniqueId = document.getElementById("my-unique-id");
const privateChatList = document.getElementById("private-chat-list");

const stickerMenu = document.getElementById("sticker-menu");
const stickerList = document.getElementById("sticker-list");
const searchInput = document.getElementById("sticker-search-input");
const searchBtn = document.getElementById("sticker-search-btn");

// =======================
// CACHE SYSTEM
// =======================
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

  const { data } = await supabase
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

let chatHistoryDebounce;
function triggerLoadChatHistory() {
  clearTimeout(chatHistoryDebounce);
  chatHistoryDebounce = setTimeout(() => refreshSidebar(), 1500); 
}

// =======================
// HELPERS & UI
// =======================
function scrollToBottom() {
  if (messagesEl) {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "smooth" });
  }
}

function closeSidebar() {
  if (sidebar) sidebar.classList.remove("open");
  if (sidebarOverlay) sidebarOverlay.style.display = "none";
}

function escapeHtml(str = "") {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatTime(dateString) {
  const d = new Date(dateString);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function getPartnerIdFromRoom(roomId) {
  if (!roomId.startsWith("pv_")) return null;
  return roomId.replace("pv_", "").split("_").find((id) => id !== currentUser?.id) || null;
}

function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) return alert(message);

  const toast = document.createElement("div");
  toast.className = `toast-msg`;
  toast.innerHTML = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function triggerPushNotif(teksPesan) {
  const partnerId = getPartnerIdFromRoom(currentRoomId);
  if (!partnerId) return; 

  fetch("https://hqetnqnvmdxdgfnnluew.supabase.co/functions/v1/send-chat-notif", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
    body: JSON.stringify({ record: { sender_id: currentUser.id, receiver_id: partnerId, content: teksPesan } })
  }).catch(err => console.error("Gagal kirim sinyal notif:", err));
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
    case "sending": return `<span class="status-icon" style="font-size:10px; opacity:0.6;">...</span>`;
    case "sent": return `<span class="status-icon" style="opacity:0.6;">✓</span>`;
    case "delivered": return `<span class="status-icon" style="opacity:0.6;">✓✓</span>`;
    case "read": return `<span class="status-icon read" style="color:#53bdeb;">✓✓</span>`;
    default: return "";
  }
}

function getBadge(role) {
  if (!role) return "";
  role = role.toLowerCase().trim();
  if (role === "admin") return `<span class="badge" style="background:#ff4757; color:white; font-size:8px; padding:2px 4px; border-radius:3px; margin-left:4px; font-weight:bold;">🛡 Admin</span>`;
  if (role === "verified") return `<span class="verified-icon" style="margin-left:4px; display:inline-flex; align-items:center;"><svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1DA1F2"/><path d="M7 12.5l3 3 7-7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
  const crownBadges = { crown1: "/asets/png/crown1.png", crown2: "/asets/png/crown2.png", crown3: "/asets/png/crown3.png" };
  if (crownBadges[role]) return `<img src="${crownBadges[role]}" style="width:14px;height:14px;margin-left:4px;vertical-align:middle;object-fit:contain;display:inline-block;" onerror="this.style.display='none';">`;
  return "";
}

// =======================
// AUTHENTICATION
// =======================
async function requireLogin() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session || !session.user) {
    window.location.href = "/login";
    return false;
  }
  currentUser = { id: session.user.id };
  return true;
}

async function loadProfile() {
  const profile = await getCachedProfile(currentUser.id);
  if (!profile) return;
  myUsername = profile.username || "User";
  myRole = profile.role || "user";
  
  if (sideUsername) sideUsername.textContent = myUsername;
  if (sideAvatar) sideAvatar.src = profile.avatar_url || "/asets/png/profile.webp";
  if (myUniqueId) myUniqueId.textContent = "#" + (profile.short_id || "----");
}

// =======================
// PRESENCE & STATUS
// =======================
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
    if (!typingHeader || !statusHeader) return;
    const typingUsers = [];
    for (const userId in state) {
      if (userId !== currentUser.id && state[userId].some((p) => p.isTyping)) typingUsers.push(state[userId][0].username);
    }
    if (typingUsers.length > 0) {
      statusHeader.style.display = "none"; typingHeader.style.display = "inline-block";
      typingHeader.textContent = `${typingUsers[0]} sedang mengetik...`;
    } else {
      statusHeader.style.display = "inline-block"; typingHeader.style.display = "none";
    }
  });

  presenceChannel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") await presenceChannel.track({ isTyping: false, username: myUsername });
  });

  if (chatInput) {
    chatInput.removeEventListener("input", handleTypingInput);
    chatInput.addEventListener("input", handleTypingInput);
  }

  if (!globalPresenceChannel) {
    globalPresenceChannel = supabase.channel(`global-online-users`, { config: { presence: { key: currentUser.id } } });
    globalPresenceChannel.on("presence", { event: "sync" }, () => {
      totalOnlineUsers = Object.keys(globalPresenceChannel.presenceState()).length;
      updateHeaderStatus();
    });
    globalPresenceChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") await globalPresenceChannel.track({ online: true, last_seen: new Date().toISOString() });
    });
  }
}

async function handleTypingInput() {
  if (!presenceChannel) return;
  if (!isCurrentlyTyping) { isCurrentlyTyping = true; await presenceChannel.track({ isTyping: true, username: myUsername }); }
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(async () => {
    isCurrentlyTyping = false;
    if (presenceChannel) await presenceChannel.track({ isTyping: false, username: myUsername });
  }, 3000);
}

function updateHeaderStatus() {
  const headerStatusEl = document.getElementById("status-header");
  if (!headerStatusEl || !currentUser) return;
  if (membersEl) membersEl.innerHTML = `<span class="online-dot"></span> ${totalOnlineUsers} user online`;

  if (currentRoomId === "room-1") {
    if (totalOnlineUsers <= 1) headerStatusEl.innerHTML = `<span style="opacity:0.8;">Hanya kamu yang online</span>`; 
    else headerStatusEl.innerHTML = `${totalOnlineUsers} users online`; 
    return;
  }
  const partnerId = getPartnerIdFromRoom(currentRoomId);
  if (!partnerId) return;
  const isOnline = !!(globalPresenceChannel ? globalPresenceChannel.presenceState() : {})[partnerId];
  headerStatusEl.innerHTML = isOnline ? `Sedang online` : `<span style="opacity:0.8;">Offline</span>`; 
}

// =======================
// RENDER MESSAGES
// =======================
function renderMessage(msg) {
  if (!messagesEl) return;
  if (document.getElementById(`msg-${msg.id}`)) return;

  if (msg.is_system) {
    const sysEl = document.createElement("div");
    sysEl.id = `msg-${msg.id}`;
    sysEl.style = "display: flex; justify-content: center; margin: 12px 0; width: 100%;";
    sysEl.innerHTML = `<div style="background: rgba(0,0,0,0.06); color: #888; font-size: 11px; padding: 5px 14px; border-radius: 20px;">${escapeHtml(msg.message)}</div>`;
    messagesEl.appendChild(sysEl);
    return; 
  }

  const isMe = msg.user_id === currentUser.id;
  const currentUsername = msg.profiles?.username || msg.username || "User";
  const avatarUrl = msg.profiles?.avatar_url || msg.avatar || "/asets/png/profile.webp";
  const currentRole = msg.profiles?.role || msg.role || "user";
  
  let contentHtml = "";
  if (msg.sticker_url) {
    contentHtml = `<img src="${msg.sticker_url}">`;
  } else if (msg.audio_url) {
    contentHtml = `
      <div class="vn-custom-player" style="min-width: 200px; display: flex; align-items: center; padding: 5px 0;">
        <button class="vn-play-btn" onclick="toggleVN('${msg.id}')" style="background: #00d2ff; border: none; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <div id="waveform-${msg.id}" style="flex-grow: 1; height: 30px; margin: 0 10px;"></div>
        <div class="vn-time" id="vn-time-${msg.id}" style="font-size: 10px; color: #666;">--:--</div>
      </div>`;
  } else {
    contentHtml = escapeHtml(msg.message || "");
  }

  const statusIcon = isMe ? getStatusIcon(msg.status || "sent") : "";
  const time = formatTime(msg.created_at);

  const msgEl = document.createElement("div");
  msgEl.id = `msg-${msg.id}`;
  msgEl.className = `chat-message ${isMe ? "self" : "other"}`;

  let replyHtml = "";
  if (msg.reply_to_msg) {
    let replyTextContent = msg.reply_to_msg.message || "";
    if (!replyTextContent && msg.reply_to_msg.sticker_url) replyTextContent = "🖼 Stiker";
    if (!replyTextContent && msg.reply_to_msg.audio_url) replyTextContent = "🎤 Voice Note";
    const replyBorderColor = isMe ? '#25D366' : '#3a7bd5'; 
    const replyBgColor = isMe ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.03)';
    replyHtml = `
      <div class="reply-preview-in-chat" onclick="window.scrollToMessage('${msg.reply_to_msg.id}')" style="cursor:pointer; background:${replyBgColor}; border-left:4px solid ${replyBorderColor}; padding:6px 10px; border-radius:6px; margin-bottom:8px;">
        <div style="font-size:12px; color:${replyBorderColor}; font-weight:bold; margin-bottom:2px;">${escapeHtml(msg.reply_to_msg.username)}</div>
        <div style="font-size:13px; color:#555; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(replyTextContent)}</div>
      </div>`;
  }

  const reactions = msg.reactions || {};
  const reactionIcons = Object.values(reactions); 
  const uniqueIcons = [...new Set(reactionIcons)].slice(0, 3);
  const reactionsHtml = uniqueIcons.length > 0 ? `
    <div class="message-reactions" onclick="event.stopPropagation(); window.openReactionMenu('${msg.id}', event)" style="background:var(--bg-input-field); padding:2px 6px; border-radius:12px; position:absolute; bottom:-10px; ${isMe ? 'right:20px;' : 'left:20px;'} font-size:12px; border:1px solid var(--border-color); cursor:pointer; z-index:10;">
      ${uniqueIcons.join("")} ${reactionIcons.length > 1 ? `<span style="font-size:9px; color:#999; margin-left:2px;">${reactionIcons.length}</span>` : ""}
    </div>` : "";

  // STRUKTUR HTML INI WAJIB SINKRON SAMA CSS BUBBLE YANG BARU
  msgEl.innerHTML = `
    <img class="avatar" src="${avatarUrl}" onerror="this.src='/asets/png/profile.webp'">
    <div class="content" onclick="window.openReactionMenu('${msg.id}', event)" ${isMe ? `oncontextmenu="window.showDeleteMenu('${msg.id}'); return false;"` : ""}>
      <span class="username">${escapeHtml(currentUsername)}${getBadge(currentRole)}</span>
      ${replyHtml}
      <div class="text" style="${msg.message === "Pesan ini telah dihapus" ? "font-style:italic;color:#aaa;" : ""}">${contentHtml}</div>
      ${reactionsHtml}
      <div class="message-info">
        <span class="timestamp">${time}</span>
        ${statusIcon}
      </div>
    </div>
  `;

  // SWIPE TO REPLY
  let startX = 0; let currentX = 0; let swiping = false;
  msgEl.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; currentX = startX; swiping = true; msgEl.style.transition = "none"; }, { passive: true });
  msgEl.addEventListener("touchmove", (e) => {
    if (!swiping) return;
    currentX = e.touches[0].clientX; let diff = currentX - startX;
    if (isMe) { if (diff < 0) { if (diff < -70) diff = -70; msgEl.style.transform = `translateX(${diff}px)`; } } 
    else { if (diff > 0) { if (diff > 70) diff = 70; msgEl.style.transform = `translateX(${diff}px)`; } }
  }, { passive: true });
  msgEl.addEventListener("touchend", () => {
    let diff = currentX - startX;
    msgEl.style.transition = "transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)"; msgEl.style.transform = "translateX(0)";
    if ((isMe && diff < -50) || (!isMe && diff > 50)) {
      currentReplyId = msg.id;
      if (chatInput) chatInput.dataset.replyTo = msg.id;
      const replyBox = document.getElementById("reply-preview-box");
      if (replyBox) {
        let previewText = msg.message;
        if (msg.sticker_url) previewText = "Stiker";
        if (msg.audio_url) previewText = "Voice Note";
        replyBox.style.display = "flex";
        replyBox.innerHTML = `
          <div class="reply-content-wrapper">
            <div class="reply-title">${escapeHtml(currentUsername)}</div>
            <div class="reply-text-preview">${escapeHtml(previewText || "")}</div>
          </div>
          <div class="close-reply-btn" onclick="window.cancelReply()">&times;</div>
        `;
      }
      if (chatInput) chatInput.focus();
      if (navigator.vibrate) navigator.vibrate(30);
    }
    swiping = false; currentX = 0;
  });

  messagesEl.appendChild(msgEl);

  // INIT WAVESURFER JIKA AUDIO
  if (msg.audio_url && !window.waveSurfers[msg.id]) {
    setTimeout(() => {
      const ws = WaveSurfer.create({
        container: `#waveform-${msg.id}`,
        waveColor: isMe ? '#94db9c' : '#A0B2C6',
        progressColor: isMe ? '#128C7E' : '#3a7bd5',
        barWidth: 2, barGap: 3, barRadius: 2, height: 25,
        url: msg.audio_url,
      });
      window.waveSurfers[msg.id] = ws;
      const timeEl = document.getElementById(`vn-time-${msg.id}`);
      const btnPlay = document.querySelector(`#msg-${msg.id} .vn-play-btn`);

      ws.on('ready', () => { if(timeEl) timeEl.innerText = formatVNTime(ws.getDuration()); });
      ws.on('audioprocess', () => { if(timeEl) timeEl.innerText = formatVNTime(ws.getCurrentTime()); });
      ws.on('finish', () => {
        if(btnPlay) btnPlay.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M8 5v14l11-7z"/></svg>`;
        if(timeEl) timeEl.innerText = formatVNTime(ws.getDuration());
      });
    }, 100);
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

// =======================
// CHAT LOGIC (DB)
// =======================
async function loadMessages() {
  if (!messagesEl || !currentUser) return;
  if (isFirstMessageLoad) showChatLoading();

  const waktu24JamLalu = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("messages")
    .select(`*, reply_to_msg:reply_to(id, username, message), profiles:profiles!messages_user_id_fkey(username, avatar_url, role)`)
    .eq("room_id", currentRoomId)
    .gte("created_at", waktu24JamLalu)
    .order("created_at", { ascending: false }) 
    .limit(30); 

  if (error) {
    messagesEl.innerHTML = `<div style="text-align:center; margin-top:20px; color:#ff4d4f;">⚠️ Gagal memuat pesan</div>`;
    return;
  }

  messagesEl.innerHTML = "";
  isFirstMessageLoad = false;

  if (!data || data.length === 0) {
    messagesEl.innerHTML = `<div style="text-align:center; margin-top:20px; color:#8696a0;">💬 Belum ada pesan</div>`;
    await markRoomAsRead();
    return;
  }

  data.reverse().forEach((msg) => renderMessage(msg));
  setTimeout(scrollToBottom, 100);
  await markRoomAsRead();
}

async function markRoomAsRead() {
  if (!currentUser) return;
  await supabase.from("messages").update({ status: "read" }).eq("room_id", currentRoomId).neq("user_id", currentUser.id).in("status", ["sent", "delivered"]);
}

async function Message() {
  const text = chatInput?.value.trim();
  if (!text || !currentUser) return;

  const replyTo = chatInput.dataset.replyTo || null;
  const tempId = "temp-" + Date.now();
  let replyData = null;

  if (replyTo) {
    const repliedEl = document.getElementById(`msg-${replyTo}`);
    if (repliedEl) {
      replyData = { id: replyTo, username: repliedEl.querySelector(".username")?.innerText || "User", message: repliedEl.querySelector(".text")?.innerText || "" };
    }
  }

  const optimisticMsg = {
    id: tempId, message: text, user_id: currentUser.id, username: myUsername, avatar: sideAvatar?.src, role: myRole, created_at: new Date().toISOString(), room_id: currentRoomId, status: "sending", reply_to_msg: replyData
  };

  renderMessage(optimisticMsg);
  scrollToBottom();
  chatInput.value = ""; window.cancelReply();
  if (sendSound) sendSound.play().catch(() => {});

  try {
    const payload = { message: text, user_id: currentUser.id, username: myUsername, room_id: currentRoomId, reply_to: replyTo, status: "sent" };
    if (window.currentChatMode === 'group' && window.activeGroupId) payload.group_id = window.activeGroupId;

    const { data, error } = await supabase.from("messages").insert([payload]).select().single();
    if (error) throw error;

    const tempEl = document.getElementById(`msg-${tempId}`);
    if (tempEl && data) { tempEl.id = `msg-${data.id}`; updateMessageStatusUI(data.id, "sent"); triggerPushNotif(text); }
  } catch (err) {
    showToast("Gagal mengirim pesan", "error");
  }
}

if (btnSend) btnSend.onclick = Message;
if (chatInput) chatInput.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); Message(); } });

async function sendAudioMessage(url) {
  const tempId = "temp-" + Date.now();
  renderMessage({ id: tempId, message: "🎤 Voice Note", audio_url: url, user_id: currentUser.id, username: myUsername, avatar: sideAvatar?.src, role: myRole, created_at: new Date().toISOString(), room_id: currentRoomId, status: "sending" });
  scrollToBottom();
  try {
    const { data, error } = await supabase.from("messages").insert([{ message: "🎤 Voice Note", audio_url: url, user_id: currentUser.id, username: myUsername, room_id: currentRoomId, status: "sent" }]).select().single();
    if (error) throw error;
    const tempEl = document.getElementById(`msg-${tempId}`);
    if (tempEl && data) { tempEl.id = `msg-${data.id}`; updateMessageStatusUI(data.id, "sent"); triggerPushNotif("🎤 Voice Note"); }
  } catch (err) { showToast("Gagal mengirim VN ke chat", "error"); }
}

// =======================
// REALTIME MESSAGES
// =======================
function initRealtimeMessages() {
  if (!currentUser) return;
  if (messageChannel) { supabase.removeChannel(messageChannel); messageChannel = null; }

  messageChannel = supabase
    .channel(`messages-global-monitor`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (payload) => {
      const newMsg = payload.new;
      if (newMsg.room_id.startsWith("pv_") || newMsg.room_id.startsWith("group_")) triggerLoadChatHistory();

      if (newMsg.is_system) {
        if (newMsg.message.includes("📞 Memanggil") && newMsg.user_id !== currentUser.id) { if (typeof window.showIncomingCall === "function") window.showIncomingCall(newMsg); }
        if (newMsg.message.includes("🚫 Panggilan Ditolak") && newMsg.user_id !== currentUser.id) { if (typeof window.endCall === "function") window.endCall(); showToast("Panggilan ditolak."); }
      }

      if (newMsg.room_id === currentRoomId) {
        if (document.getElementById(`msg-${newMsg.id}`)) return;
        const senderProfile = await getCachedProfile(newMsg.user_id);
        newMsg.profiles = { username: senderProfile?.username || "User", avatar_url: senderProfile?.avatar_url || "/asets/png/profile.webp", role: senderProfile?.role || "user" };

        if (newMsg.user_id === currentUser.id && !newMsg.is_system) {
          const tempEl = document.querySelector(`[id^="msg-temp-"]`);
          if (tempEl) tempEl.remove();
          renderMessage(newMsg);
        } else {
          renderMessage(newMsg);
          if (!newMsg.is_system) receiveSound.play().catch(() => {});
          if (newMsg.status !== "read" && !document.hidden && !newMsg.is_system) await supabase.from("messages").update({ status: "read" }).eq("id", newMsg.id);
        }
        scrollToBottom();
      }
    })
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (payload) => {
      const updated = payload.new; const old = payload.old;
      if (updated.status !== old?.status && updated.user_id === currentUser.id) updateMessageStatusUI(updated.id, updated.status || "sent");
      if (updated.room_id !== currentRoomId) return;
      if (updated.message === "Pesan ini telah dihapus") {
        const msgEl = document.getElementById(`msg-${updated.id}`);
        if (msgEl) { const textEl = msgEl.querySelector(".text"); if (textEl) { textEl.innerHTML = "<i>Pesan ini telah dihapus</i>"; textEl.style.color = "#aaa"; textEl.querySelectorAll("img, .vn-custom-player").forEach(m => m.remove()); } }
      }
    }).subscribe();
}

// =======================
// SIDEBAR, GROUPS & PV
// =======================
function renderGlobalChatItem(container) {
  const globalBtn = document.createElement("div");
  globalBtn.className = 'sidebar-chat-item';
  globalBtn.innerHTML = `<div style="width:40px; height:40px; border-radius:50%; background:linear-gradient(45deg, #0088cc, #00d2ff); display:flex; align-items:center; justify-content:center; margin-right:12px;"><span style="color:white; font-size:18px;">🌍</span></div><div><strong style="color:#0088cc;">Chat Global</strong><br><span style="font-size:11px; color:#888;">Obrolan Umum</span></div>`;
  globalBtn.onclick = async () => {
    window.currentChatMode = null; window.activeGroupId = null; currentRoomId = "room-1"; 
    const btnCall = document.getElementById('btn-start-call'); if (btnCall) btnCall.style.display = 'none';
    document.querySelector(".chat-header h3").textContent = "HopeTalk Globe";
    messagesEl.innerHTML = ""; initPresence(); await loadMessages(); closeSidebar();
  };
  container.appendChild(globalBtn);
}

async function loadGroupList() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: memberships, error } = await supabase.from('group_members').select(`group_id, groups(id, name, photo_url)`).eq('user_id', user.id);
    if (error || !memberships) return;

    if(memberships.length > 0) {
      const label = document.createElement("div");
      label.innerHTML = `<div class="history-label">GRUP SAYA</div>`;
      privateChatList.appendChild(label);
    }

    memberships.forEach(item => {
        const group = item.groups; if (!group) return;
        const groupEl = document.createElement('div'); groupEl.className = 'sidebar-chat-item';
        const avatarHtml = group.photo_url ? `<img src="${group.photo_url}" style="width:45px;height:45px;border-radius:50%;object-fit:cover;margin-right:12px;">` : `<div style="width:45px;height:45px;border-radius:50%;background:#3a7bd5;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;margin-right:12px;">${group.name.substring(0, 2).toUpperCase()}</div>`;
        groupEl.innerHTML = `${avatarHtml}<div style="flex:1;"><div><strong>${group.name}</strong></div><span>Grup Chat</span></div>`;
        groupEl.onclick = () => mulaiChatGrup(group.id, group.name);
        privateChatList.appendChild(groupEl);
    });
}

function mulaiChatGrup(groupId, groupName) {
    window.currentChatMode = 'group'; window.activeGroupId = groupId; currentRoomId = `group_${groupId}`; 
    const btnCall = document.getElementById('btn-start-call'); if (btnCall) btnCall.style.display = 'none';
    const headerTitle = document.querySelector('.chat-header h3');
    if (headerTitle) headerTitle.innerHTML = `${escapeHtml(groupName)}`;
    messagesEl.innerHTML = ''; closeSidebar(); isFirstMessageLoad = true; loadMessages(); initPresence(); 
}

async function loadChatHistory() {
  if (!privateChatList || !currentUser) return;
  try {
    const waktu24JamLalu = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: messages } = await supabase.from("messages").select("room_id, message, created_at, sticker_url, user_id, status, is_system").ilike("room_id", "pv_%").ilike("room_id", `%${currentUser.id}%`).gte("created_at", waktu24JamLalu).order("created_at", { ascending: false });

    const lastMessagesMap = new Map(); const unreadCountMap = new Map();
    if(messages) {
      messages.forEach((msg) => {
        const parts = msg.room_id.replace("pv_", "").split("_"); const partnerId = parts.find((id) => id !== currentUser.id);
        if (!partnerId) return;
        if (!lastMessagesMap.has(partnerId)) lastMessagesMap.set(partnerId, msg);
        if (msg.user_id !== currentUser.id && msg.status !== "read" && !msg.is_system) unreadCountMap.set(partnerId, (unreadCountMap.get(partnerId) || 0) + 1);
      });
    }

    const label = document.createElement("div"); 
    label.innerHTML = `<div class="history-label">RIWAYAT CHAT PRIBADI</div>`; 
    privateChatList.appendChild(label);

    if (lastMessagesMap.size === 0) {
      privateChatList.innerHTML += `<div class="empty-chat-state">Belum ada riwayat chat</div>`; return;
    }

    lastMessagesMap.forEach(async (chat, partnerId) => {
      const partner = await getCachedProfile(partnerId);
      if (!partner) return;
      const name = partner.username || "User";
      const avatar = partner.avatar_url || "/asets/png/profile.webp";
      const unreadCount = unreadCountMap.get(partnerId) || 0;
      let lastMsg = chat.sticker_url ? "🖼 Stiker" : (chat.message || "Chat");
      
      const chatEl = document.createElement("div"); chatEl.className = `sidebar-chat-item`;
      chatEl.innerHTML = `<img src="${avatar}" style="width:45px;height:45px;border-radius:50%;object-fit:cover;margin-right:12px;">
        <div style="flex:1; overflow:hidden;">
          <div style="display:flex; justify-content:space-between;"><strong>${name}</strong><span style="font-size:10px;">${formatTime(chat.created_at)}</span></div>
          <div style="display:flex; align-items:center; gap:4px; font-size:12px; color:#666; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lastMsg}</div>
        </div>`;
      chatEl.onclick = () => bukaChatPribadi(partnerId, name, partner.short_id || "");
      privateChatList.appendChild(chatEl);
    });
  } catch (err) { console.error(err); } 
}

async function refreshSidebar() {
  if (!privateChatList) return;
  privateChatList.innerHTML = "";
  renderGlobalChatItem(privateChatList);
  await loadGroupList();
  await loadChatHistory();
}

async function bukaChatPribadi(partnerId, partnerName, partnerShortId = "") {
  window.currentChatMode = 'private'; window.activeGroupId = null;
  const btnCall = document.getElementById('btn-start-call'); 
  if (btnCall) { btnCall.style.display = 'flex'; btnCall.dataset.targetId = partnerId; btnCall.dataset.targetName = partnerName; btnCall.onclick = () => window.startLiveKitCall(); }

  const ids = [currentUser.id, partnerId].sort();
  currentRoomId = `pv_${ids[0]}_${ids[1]}`; 
  
  isFirstMessageLoad = true; initPresence(); 
  document.querySelector(".chat-header h3").innerHTML = `${escapeHtml(partnerName)} <span style="font-size:10px; opacity:0.5;">#${escapeHtml(partnerShortId)}</span>`;
  
  updateHeaderStatus(); await loadMessages(); closeSidebar(); scrollToBottom();
}

if (btnSearchId) {
  btnSearchId.addEventListener("click", async () => {
    const searchValue = inputSearchId?.value.trim().toUpperCase(); const cleanId = (searchValue || "").replace("#", "");
    if (!cleanId) return showToast("Masukkan ID (contoh: 0E870)");
    const { data: friend, error } = await supabase.from("profiles").select("id, username, short_id").eq("short_id", cleanId).single();
    if (error || !friend) return showToast("ID tidak ditemukan!");
    if (friend.id === currentUser.id) return showToast("Ini ID kamu sendiri.");
    await bukaChatPribadi(friend.id, friend.username, friend.short_id || "");
  });
}

if (hamburger) hamburger.addEventListener("click", () => { sidebar.classList.toggle("open"); sidebarOverlay.style.display = sidebar.classList.contains("open") ? "block" : "none"; });
if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);

// =======================
// GIPHY STICKERS
// =======================
const apiKey = "vPUlBU5Qfz2ZygoEtKXVUqmIEAEcIB08";
async function fetchStickers(query = "") {
  if (!stickerList) return;
  stickerList.innerHTML = "<p style='font-size:12px; color:#999; text-align:center;'>Mencari...</p>";
  const endpoint = query ? `https://api.giphy.com/v1/stickers/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=30` : `https://api.giphy.com/v1/stickers/trending?api_key=${apiKey}&limit=20`;
  try {
    const res = await fetch(endpoint); const data = await res.json(); stickerList.innerHTML = "";
    data.data.forEach((sticker) => {
      const img = document.createElement("img"); img.src = sticker.images.fixed_width_small.webp;
      img.style.cssText = "width:75px; height:75px; margin:4px; cursor:pointer; border-radius:8px; background:#eee;";
      img.onclick = () => sendSticker(sticker.images.fixed_width.url);
      stickerList.appendChild(img);
    });
  } catch (err) { stickerList.innerHTML = "<p style='color:red;'>Gagal memuat stiker.</p>"; }
}

async function sendSticker(url) {
  const tempId = "temp-" + Date.now();
  renderMessage({ id: tempId, message: "", user_id: currentUser.id, username: myUsername, avatar: sideAvatar?.src, role: myRole, sticker_url: url, created_at: new Date().toISOString(), room_id: currentRoomId, status: "sending" });
  scrollToBottom(); if(sendSound) sendSound.play().catch(() => {});
  try {
    const { data, error } = await supabase.from("messages").insert([{ message: "", user_id: currentUser.id, username: myUsername, sticker_url: url, room_id: currentRoomId, status: "sent" }]).select().single();
    if (error) throw error;
    const tempEl = document.getElementById(`msg-${tempId}`);
    if (tempEl && data) { tempEl.id = `msg-${data.id}`; updateMessageStatusUI(data.id, "sent"); }
    if (stickerMenu) stickerMenu.style.display = "none";
  } catch (err) { showToast("Gagal kirim stiker", "error"); }
}

if (searchBtn) searchBtn.onclick = () => fetchStickers(searchInput?.value || "");
if (searchInput) searchInput.onkeydown = (e) => { if (e.key === "Enter") fetchStickers(searchInput.value); };
const stickerBtn = document.getElementById("sticker-btn");
if (stickerBtn) { stickerBtn.onclick = () => { if (stickerMenu) stickerMenu.style.display = stickerMenu.style.display === "none" || stickerMenu.style.display === "" ? "flex" : "none"; }; }

// =======================
// VOICE NOTE RECORDING
// =======================
const vnOverlay = document.getElementById("vn-overlay"); const vnTimer = document.getElementById("vn-timer");
let timerInterval; let isRecording = false; let startX = 0; let seconds = 0;
let mediaRecorder; let audioChunks = []; let isCanceledGlobal = false;

function startTimer() { seconds = 0; vnTimer.innerText = "00:00"; timerInterval = setInterval(() => { seconds++; let m = Math.floor(seconds / 60).toString().padStart(2, "0"); let s = (seconds % 60).toString().padStart(2, "0"); vnTimer.innerText = `${m}:${s}`; }, 1000); }
function stopTimer() { clearInterval(timerInterval); }

async function startVN(e) {
  isRecording = true; audioChunks = []; startX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunks.push(event.data); };
    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      if (!isCanceledGlobal && audioChunks.length > 0) { uploadToCloudinary(new Blob(audioChunks, { type: "audio/mpeg" })); }
    };
    mediaRecorder.start(); btnSend.classList.add("is-recording"); chatInput.style.visibility = "hidden"; vnOverlay.style.display = "flex";
    if (navigator.vibrate) navigator.vibrate(60); startTimer();
  } catch (err) { showToast("Gagal akses mic."); isRecording = false; }
}

function stopVN(isCanceled = false) {
  if (!isRecording) return;
  isRecording = false; isCanceledGlobal = isCanceled; stopTimer();
  if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  btnSend.classList.remove("is-recording"); chatInput.style.visibility = "visible"; vnOverlay.style.display = "none";
  if (isCanceled) showToast("VN Dibatalkan");
}

let holdTimer;
btnSend.addEventListener("mousedown", (e) => { if (chatInput.value.trim() === "") holdTimer = setTimeout(() => startVN(e), 300); });
window.addEventListener("mousemove", (e) => { if (isRecording && startX - e.clientX > 100) stopVN(true); });
window.addEventListener("mouseup", () => { clearTimeout(holdTimer); if (isRecording) stopVN(false); });
btnSend.addEventListener("touchstart", (e) => { if (chatInput.value.trim() === "") holdTimer = setTimeout(() => startVN(e), 300); }, { passive: true });
actionBtn.addEventListener("touchmove", (e) => { if (isRecording) { if (startX - e.touches[0].clientX > 80) stopVN(true); } }, { passive: true });
actionBtn.addEventListener("touchend", () => { clearTimeout(holdTimer); if (isRecording) stopVN(false); });

async function uploadToCloudinary(blob) {
  const formData = new FormData(); formData.append("file", blob); formData.append("upload_preset", "hopehype_preset"); formData.append("resource_type", "video");
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/dhhmkb8kl/upload`, { method: "POST", body: formData });
    const data = await res.json();
    if (data.secure_url) sendAudioMessage(data.secure_url); 
  } catch (err) { showToast("Koneksi bermasalah saat mengirim VN"); }
}

// =======================
// RADAR CARI DOI
// =======================
window.tutupDoiCard = function () { const modal = document.getElementById("doi-card-modal"); if (modal) modal.style.display = "none"; };
function tampilkanDoiCard(doi) {
  const modal = document.getElementById("doi-card-modal"); if (!doi || !modal) return;
  document.getElementById("doi-photo").src = doi.avatar_url || "/asets/png/profile.webp";
  document.getElementById("doi-name-age").innerText = `${doi.username}, ${doi.age || "?"}`;
  document.getElementById("doi-zodiac").innerText = doi.zodiac || "Rahasia";
  document.getElementById("doi-job").innerText = doi.pekerjaan || "Misterius";
  document.getElementById("doi-hobby").innerText = doi.hobi || "-";
  document.getElementById("btn-gas-chat").onclick = async () => { await bukaChatPribadi(doi.id, doi.username, doi.short_id || ""); window.tutupDoiCard(); };
  modal.style.display = "flex";
}

const btnCariDoiActual = document.getElementById("btn-sidebar-search");
if (btnCariDoiActual) {
  btnCariDoiActual.onclick = async () => {
    const myProfile = await getCachedProfile(currentUser.id); 
    if (!myProfile?.gender) return window.openEditProfile(); 
    closeSidebar();
    const loadingOverlay = document.createElement("div"); 
    loadingOverlay.className = "searching-overlay"; loadingOverlay.id = "active-search-overlay";
    loadingOverlay.innerHTML = `<div class="radar-pencari-ghaib"><div class="radar-inner"><div class="radar-scan"></div><img src="${sideAvatar?.src || '/asets/png/profile.webp'}" class="radar-center-avatar" /></div></div><div style="text-align: center; margin-top: 25px; z-index: 10001;"><h3 class="search-title-romantic">MEMINDAI DOI...</h3></div>`;
    document.body.appendChild(loadingOverlay);
    const lawanJenis = myProfile.gender === "Pria" ? "Wanita" : "Pria";
    setTimeout(async () => {
      const { data: users } = await supabase.from("profiles").select("*").neq("id", currentUser.id).eq("gender", lawanJenis);
      document.getElementById("active-search-overlay")?.remove();
      if (!users || users.length === 0) return showToast(`Waduh, belum ada ${lawanJenis} yang tersedia.`); 
      tampilkanDoiCard(users[Math.floor(Math.random() * users.length)]);
    }, 3000); 
  };
}

// ==========================================
// 🔥 CALL / TELEPHONE LOGIC 🔥
// ==========================================
let callRingingTimeout = null; 
let callTalkTimer = null;      
let callSeconds = 0;           

window.endCall = (isSilent = false) => {
    if(ringtoneSound) { ringtoneSound.pause(); ringtoneSound.currentTime = 0; }
    clearTimeout(callRingingTimeout);
    if (callTalkTimer) clearInterval(callTalkTimer);

    if (callRoom) { callRoom.disconnect(); callRoom = null; }
    
    document.getElementById('call-overlay').style.display = 'none';
    document.getElementById('incoming-call-overlay').style.display = 'none';
};

window.startLiveKitCall = async () => {
    const btn = document.getElementById('btn-start-call');
    const partnerId = btn.dataset.targetId;
    const partnerName = btn.dataset.targetName;
    if (!partnerId) return;

    document.getElementById('call-overlay').style.display = 'flex';
    document.getElementById('call-name').innerText = partnerName;
    document.getElementById('call-status').innerText = "MEMANGGIL...";

    const profile = await getCachedProfile(partnerId);
    if (profile) document.getElementById('call-avatar').src = profile.avatar_url || '/asets/png/profile.webp';

    try {
        await supabase.from('messages').insert([{ room_id: currentRoomId, message: `📞 Memanggil ${partnerName}...`, user_id: currentUser.id, is_system: true }]);
        callRingingTimeout = setTimeout(async () => {
            window.endCall();
            await supabase.from('messages').insert([{ room_id: currentRoomId, message: `☎️ Panggilan tak terjawab`, user_id: currentUser.id, is_system: true }]);
        }, 30000);
        await connectToCall(currentRoomId);
    } catch (err) { window.endCall(true); }
};

let callSignalData = null;
window.showIncomingCall = async function(msgData) {
    callSignalData = msgData; 
    document.getElementById('incoming-call-overlay').style.display = 'flex';
    if (msgData.user_id) {
        const profile = await getCachedProfile(msgData.user_id);
        if (profile) {
            document.getElementById('incoming-avatar').src = profile.avatar_url || '/asets/png/profile.webp';
            document.getElementById('incoming-name').innerText = profile.username || "Teman"; 
        }
    }
    if(ringtoneSound) ringtoneSound.play().catch(e => console.log("Autoplay block"));
};

window.answerCall = async () => {
    if(ringtoneSound) { ringtoneSound.pause(); ringtoneSound.currentTime = 0; }
    document.getElementById('incoming-call-overlay').style.display = 'none';
    document.getElementById('call-overlay').style.display = 'flex';
    document.getElementById('call-status').innerText = "CONNECTING...";

    if (callSignalData) {
        await connectToCall(callSignalData.room_id);
        document.getElementById('call-status').innerText = "ON CALL";
        callTalkTimer = setInterval(() => { callSeconds++; document.getElementById('call-status').innerText = `${Math.floor(callSeconds / 60).toString().padStart(2, '0')}:${(callSeconds % 60).toString().padStart(2, '0')}`; }, 1000);
    }
};

window.rejectCall = async () => {
    if(ringtoneSound) { ringtoneSound.pause(); ringtoneSound.currentTime = 0; }
    document.getElementById('incoming-call-overlay').style.display = 'none';
    if (callSignalData) {
        await supabase.from('messages').insert([{ room_id: callSignalData.room_id, message: `🚫 Panggilan Ditolak`, user_id: currentUser.id, is_system: true }]);
        callSignalData = null;
    }
};

async function connectToCall(roomName) {
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/get-livekit-token`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
            body: JSON.stringify({ username: myUsername, identity: currentUser.id, roomName: roomName })
        });
        const data = await response.json();
        callRoom = new LivekitClient.Room({ adaptiveStream: true, dynacast: true });
        callRoom.on(LivekitClient.RoomEvent.TrackSubscribed, (track) => { if (track.kind === "audio") { const element = track.attach(); document.body.appendChild(element); element.play().catch(() => {}); } });
        callRoom.on(LivekitClient.RoomEvent.ParticipantDisconnected, () => { window.endCall(); });
        callRoom.on(LivekitClient.RoomEvent.Disconnected, () => { window.endCall(); });
        callRoom.on(LivekitClient.RoomEvent.ParticipantConnected, () => { clearTimeout(callRingingTimeout); });
        
        const LIVEKIT_URL = "wss://voicegrup-zxmeibkn.livekit.cloud"; 
        await callRoom.connect(LIVEKIT_URL, data.token);
        await callRoom.localParticipant.setMicrophoneEnabled(true);
    } catch (e) { window.endCall(); }
}

// =======================
// INIT APP
// =======================
async function init() {
  try {
    const ok = await requireLogin(); 
    if (!ok) return;

    await loadProfile(); 
    await initPresence(); 
    await refreshSidebar(); 
    initRealtimeMessages(); 
    await loadMessages(); 
    updateHeaderStatus(); 
    fetchStickers(); 
    
    scrollToBottom();
  } catch (err) { console.error("Gagal memulai aplikasi:", err); }
}

init();
