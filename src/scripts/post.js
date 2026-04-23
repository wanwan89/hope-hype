// Ganti namanya biar gak bentrok sama library (Recursion Fix)
function showNotif(msg, type = "info") {
  // 1. Cari atau buat container #toast sesuai CSS lu
  let container = document.getElementById("toast");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast";
    document.body.appendChild(container);
  }

  // 2. Setting Icon & Title biar otomatis
  const config = {
    success: { title: "Berhasil", icon: "✓" },
    error: { title: "Gagal", icon: "✕" },
    warning: { title: "Peringatan", icon: "!" },
    info: { title: "Info", icon: "i" }
  };
  const { title, icon } = config[type] || config.info;

  // 3. Render HTML sesuai struktur CSS yang lu kasih
  const toastCard = document.createElement("div");
  toastCard.className = "toast-card";
  
  toastCard.innerHTML = `
    <div class="toast-icon-wrap ${type}">
      <span class="toast-icon">${icon}</span>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-subtitle">${msg}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.classList.remove('show'); setTimeout(()=>this.parentElement.remove(), 300)">×</button>
  `;

  container.appendChild(toastCard);

  // 4. Trigger animasi muncul (class .show di CSS lu)
  setTimeout(() => toastCard.classList.add("show"), 10);

  // 5. Hapus otomatis biar gak numpuk di layar
  setTimeout(() => {
    if(toastCard) {
      toastCard.classList.remove("show");
      setTimeout(() => toastCard.remove(), 300);
    }
  }, 4000);
}

console.log("JS CONNECTED - EGRESS OPTIMIZED 🔥");
const CLOUDINARY_CLOUD_NAME = "dhhmkb8kl";
const CLOUDINARY_UPLOAD_PRESET = "post_hope";

// =======================
// SUPABASE INIT
// =======================

import { supabase as supabaseClient } from '../lib/supabase.js';

let currentUser = null;
let currentPostId = null;
let currentPostCreator = null; 
let replyTo = null;
let replyToUsername = null;
let giftState = { postId: null, creatorId: null, creatorName: "", userCoins: 0, selectedAmount: 0 };
let selectedPostFile = null;
let selectedAudioUrl = null; // 🔥 VAR BARU BUAT MUSIK

// =======================
// CACHE HELPER (OPTIMIZED)
// =======================
async function getMyProfile(userId) {
  const cacheKey = `hh_profile_${userId}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // FIX: Hanya ambil kolom yang ditampilkan
  const { data } = await supabaseClient.from("profiles")
    .select("username, role, coins, avatar_url")
    .eq("id", userId)
    .single();
    
  if (data) sessionStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
}

// [FUNGSI BARU DITAMBAHKAN] - Panggil ini saat tombol Ganti Foto Profil diklik!
async function updateProfileAvatar(file) {
  if (!file) return;
  showNotif("Sedang mengunggah foto profil...", "info");
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return openLogin();

    // 1. Upload ke Cloudinary biar IRIT
    const cData = await uploadImageToCloudinary(file);
    const linkIrit = cData.secure_url;

    // 2. Simpan link-nya aja ke Supabase
    const { error } = await supabaseClient
      .from("profiles")
      .update({ avatar_url: linkIrit })
      .eq("id", session.user.id);

    if (error) throw error;

    sessionStorage.removeItem(`hh_profile_${session.user.id}`);
    showNotif("Foto profil diperbarui!", "success");
    setTimeout(() => location.reload(), 1000);
  } catch (err) {
    showNotif("Gagal update profil: " + err.message, "error");
  }
}

// =======================
// CREATE NOTIFICATION
// =======================
async function createNotification({ user_id, actor_id, post_id, type, message }) {
  try {
    const finalActorId = actor_id; 
    let finalTargetUserId = user_id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(finalTargetUserId)) return;
    if (finalTargetUserId === finalActorId) return;

    await supabaseClient.from("notifications").insert({
      user_id: finalTargetUserId,
      actor_id: finalActorId,
      post_id: parseInt(post_id),
      type: type,
      message: message,
      is_read: false,
    });
  } catch (err) {
    console.error("❌ Error System Notif:", err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const startApp = async () => {
    try {
      await getUser();
      // 🔥 TAMBAHKAN INI: Biar story muncul duluan di atas feed
      await fetchStories(); 
      await fetchPosts("all");
    } catch (err) {
      await fetchStories(); 
      await fetchPosts("all");
    }

    const safeInit = (name, fn) => {
      try { if (typeof fn === "function") fn(); } catch (e) {}
    };

    safeInit("Search", initSearch);
    safeInit("ReplyClick", initReplyClick);
    safeInit("Auth", initAuth);
    safeInit("Realtime", initRealtime);
    safeInit("CloseButtons", initCloseButtons);
    safeInit("PostModal", initPostModal);
    if (typeof initGiftSheet === "function") safeInit("GiftSheet", initGiftSheet);
  };

    startApp();

  // 🔥 TAMBAHKAN INI (Jurus Sakti Biar Autoplay Gak Diblokir Browser)
  document.body.addEventListener('click', () => {
      console.log("Audio Engine Unlocked 🔓");
      // Opsional: Langsung coba panggil play() kosong buat ngetes izin
      const silentAudio = new Audio();
      silentAudio.play().catch(() => {});
  }, { once: true });

  const navItems = document.querySelectorAll(".nav-item");
  const sidebar = document.querySelector(".sidebar");
  const menuBtn = document.getElementById("mobileMenuBtn");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      if (item.id === "adminPanelBtn") return;
      e.preventDefault();
      navItems.forEach((n) => n.classList.remove("active"));
      item.classList.add("active");
      fetchPosts(item.getAttribute("data-category"));
      if (sidebar) sidebar.classList.remove("active");
    });
  });

  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("active");
    });
    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        sidebar.classList.remove("active");
      }
    });
  }
});
 
let isFetchingPosts = false;
async function fetchPosts(category = "all") {
  if (isFetchingPosts) return;
  isFetchingPosts = true;

  const gallery = document.getElementById("mainGallery");
  if (!gallery) { isFetchingPosts = false; return; }

  gallery.innerHTML = `<div class="skeleton-wrapper" style="grid-column: 1/-1; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; width: 100%;">${Array(6).fill(0).map(() => `<div class="skeleton-card"><div class="skeleton-shimmer"></div></div>`).join("")}</div>`;

try { 
    let query = supabaseClient
      .from("posts")
      .select(`
        id, 
        image_url, 
        audio_src,  
        title,      
        artist,   
        bio,
        created_at, 
        creator_id, 
        profiles:creator_id (
          username, 
          role, 
          avatar_url
        )
      `) 
      .eq("status", "approved")
      .order("created_at", { ascending: false }) 
      .limit(100); // 🔥 Tarik 100 data biar acakannya lebih seru

    if (category && category !== "all") {
      query = query.ilike("category", `%${category.trim()}%`);
    }

    // 1. Simpan hasil tarikan ke variabel sementara (rawPosts)
    const { data: rawPosts, error } = await query;
    if (error) throw error;

    // 🔥 2. LOGIKA FYP (ACAK POSTINGAN) 🔥
    let posts = rawPosts;
    
    // Kalau buka tab "Semua" (FYP), kita acak urutannya!
    if (category === "all" || !category) {
      posts = rawPosts.sort(() => Math.random() - 0.5); 
    }

    gallery.innerHTML = "";

    if (!posts || posts.length === 0) {
      gallery.innerHTML = '<p style="color:var(--text-muted); text-align:center; grid-column:1/-1; padding:50px;">Tidak ada postingan.</p>';
      isFetchingPosts = false;
      return;
    }

    const postIds = posts.map(p => p.id);
    const [likesRes, commentsRes] = await Promise.all([
      supabaseClient.from("likes").select("post_id").in("post_id", postIds),
      supabaseClient.from("comments").select("post_id").in("post_id", postIds)
    ]);

    const likeCounts = {};
    const commentCounts = {};
    postIds.forEach(id => { likeCounts[id] = 0; commentCounts[id] = 0; });
    
    if (likesRes.data) likesRes.data.forEach(l => { if(likeCounts[l.post_id] !== undefined) likeCounts[l.post_id]++; });
    if (commentsRes.data) commentsRes.data.forEach(c => { if(commentCounts[c.post_id] !== undefined) commentCounts[c.post_id]++; });

// ==========================================
// RENDER POSTS KE GALLERY (ULTIMATE THREAD STYLE - FIXED SPASI & ICON)
// ==========================================
posts.forEach((post) => {
  const card = document.createElement("div");
  card.className = "card post-fade-in";
  
  // 1. Ambil State User & Badge & Avatar
  const userRole = (post.profiles?.role || "user").toLowerCase().trim();
  const badge = getUserBadge(userRole);
  const avatarUrl = post.profiles?.avatar_url || "https://via.placeholder.com/40";
  const formattedDate = new Date(post.created_at).toLocaleDateString("id-ID", { 
    day: "numeric", 
    month: "short" 
  });
  const isOwner = currentUser && currentUser.id === post.creator_id;

  // 2. Ambil Metadata Musik
  const musicTitle = post.title || 'Untitled';
  const musicArtist = post.artist || 'Unknown Artist';

  // 3. Logika Render Music Marquee (NO ICON 🎵)
  const musicHtml = post.audio_src ? (() => {
    let cleanAudio = (post.audio_src || "").trim();
    if (cleanAudio.includes('res.cloudinary.com') && cleanAudio.includes('/video/upload/')) {
        cleanAudio = cleanAudio.replace('/video/upload/', '/video/upload/f_mp3/');
    }
    const finalAudio = cleanAudio.startsWith("http") ? cleanAudio : `/songs/${cleanAudio}`;
    const mimeType = finalAudio.includes('.m4a') ? 'audio/mp4' : 'audio/mpeg';

    return `
      <div class="music-marquee-container" style="background: rgba(0,0,0,0.5); color: white; border-radius: 20px; padding: 5px 15px; z-index: 10; max-width: 150px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); pointer-events: none; margin-bottom: 10px;">
        <div class="marquee-text" style="font-size: 10px; font-weight: 700; white-space: nowrap; display: inline-block; animation: marquee-play 8s linear infinite; letter-spacing: 0.3px;">
          ${musicTitle} — ${musicArtist}
        </div>
        <audio class="post-audio-element" loop preload="metadata" playsinline webkit-playsinline style="display:none;">
          <source src="${finalAudio}" type="${mimeType}">
        </audio>
      </div>
    `;
  })() : '';

  // 4. KUMPULAN TOMBOL AKSI
  const engagementButtons = `
    <button class="icon-btn gift-btn" data-post="${post.id}" data-creator="${post.creator_id}" data-name="${post.profiles?.username}">
      <svg viewBox="0 0 24 24" class="icon" width="20" height="20" fill="currentColor"><path d="M20 7h-2.18A3 3 0 0 0 12 3a3 3 0 0 0-5.82 4H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8h1a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Zm-8-2a1 1 0 0 1 1 1v1h-2V6a1 1 0 0 1 1-1Zm-4 1a1 1 0 0 1 2 0v1H8a1 1 0 0 1 0-2Zm9 13h-4v-7h4Zm-6 0H7v-7h4Zm8-9H5V9h14Z"/></svg>
    </button>
    <button class="icon-btn like-btn" data-post="${post.id}" data-creator="${post.creator_id}">
      <svg viewBox="0 0 24 24" class="icon heart" width="20" height="20" fill="currentColor"><path d="M12.1 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3 9.24 3 10.91 3.81 12 5.09 13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5 22 12.28 18.6 15.36 13.55 20.04z"/></svg>
      <span class="like-count" style="font-size:12px; margin-left:4px;">${likeCounts[post.id] || 0}</span>
    </button>
    <button class="icon-btn comment-toggle" data-post="${post.id}" data-creator="${post.creator_id}">
      <svg viewBox="0 0 24 24" class="icon" width="20" height="20" fill="currentColor"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
      <span class="comment-count" style="font-size:12px; margin-left:4px;">${commentCounts[post.id] || 0}</span>
    </button>
  `;

  // 5. DETEKSI & RENDER DESAIN
  const hasImage = post.image_url && post.image_url.trim() !== "";

  if (hasImage) {
      // ==========================================
      // DESAIN 1: KARYA GAMBAR (STYLE IG)
      // ==========================================
      card.innerHTML = `
        <div class="slider" style="position: relative;">
          <div style="position: absolute; top: 12px; right: 12px;">${musicHtml}</div>
          <img src="${post.image_url}" class="active" loading="lazy" alt="${post.title}">
          <div class="watermark-overlay"><img src="/asets/svg/watermark.svg"></div>
        </div>
        
        <div class="overlay">
          <div style="display: flex; align-items: center; margin-bottom: 6px; width: 100%;">
            <h2 class="name" onclick="window.location.href='/data?id=${post.creator_id}'" style="cursor:pointer; display:flex; align-items:center; margin: 0; font-size: 14px;">
              ${post.profiles?.username || "User"} ${badge} 
            </h2>
            <button class="options-btn" onclick="openPostOptions('${post.id}', ${isOwner}, '${post.creator_id}')" style="background:none; border:none; color:var(--text-muted); cursor:pointer; padding:4px 0 4px 10px; margin-left: auto;">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>
          </div>

          <p class="post-bio" style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${(post.bio || "").trim()}</p>

          <div class="post-date-wrapper" style="margin-bottom: 12px;">
            <span style="font-size: 10px; color: var(--text-muted); opacity: 0.8;">Diunggah ${formattedDate}</span>
          </div>

          <div class="actions">
            <a href="/data?id=${post.creator_id}" class="primary">Detail</a>
            <div class="engagement-group" style="display: flex; gap: 10px; align-items: center;">
               ${engagementButtons}
            </div>
          </div>
        </div>`;
  } else {
      // ==========================================
      // DESAIN 2: THREADS MURNI (FIXED SPACING)
      // ==========================================
      card.style.padding = "16px"; 
      
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; gap: 12px; cursor: pointer;" onclick="window.location.href='/data?id=${post.creator_id}'">
            <img src="${avatarUrl}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; flex-direction: column; justify-content: center;">
              <div style="display: flex; align-items: center; gap: 4px; font-weight: 700; font-size: 15px; color: var(--text-main);">
                ${post.profiles?.username || "User"} ${badge}
              </div>
              <span style="font-size: 11px; color: var(--text-muted);">${formattedDate}</span>
            </div>
          </div>
          <button onclick="openPostOptions('${post.id}', ${isOwner}, '${post.creator_id}')" style="background:none; border:none; color:var(--text-muted); cursor:pointer; height: fit-content; padding: 4px;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
          </button>
        </div>

        <div style="font-size: 15px; color: var(--text-main); line-height: 1.5; white-space: pre-wrap; margin-bottom: 12px; padding-left: 2px;">${(post.bio || "").trim()}</div>

        ${post.audio_src ? `<div style="margin-top: 10px;">${musicHtml}</div>` : ''}

        <div style="border-top: 1px solid rgba(255,255,255,0.06); margin-top: 16px; padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
          <a href="/data?id=${post.creator_id}" style="font-size: 13px; color: var(--text-muted); text-decoration: none; font-weight: 600;">Lihat Profil</a>
          <div class="engagement-group" style="display: flex; gap: 15px; align-items: center; color: var(--text-muted);">
            ${engagementButtons}
          </div>
        </div>
      `;
  }

  gallery.appendChild(card);
});

    initGiftButtons(); 
    initLikeButtons(); 
    initComments(); 
    loadLikes(); 

    setTimeout(() => {
        initAutoPlayObserver();
    }, 500);

  } catch (err) {
    console.error(err);
  } finally {
    isFetchingPosts = false;
  }
}

async function fetchStories() {
  const container = document.querySelector(".stories-container");
  if (!container) return;

  const timeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    const { data: stories, error } = await supabaseClient
      .from("stories")
      .select("*, profiles(username, avatar_url)")
      .gte("created_at", timeLimit)
      .order("created_at", { ascending: false });

    if (error) throw error;

    container.innerHTML = "";

    if (!stories || stories.length === 0) {
      container.innerHTML = '<p style="font-size:11px; color:var(--text-muted); padding:10px;">Belum ada cerita</p>';
      return;
    }

    // 🔥 LOGIKA ANTI-DOUBLE: Satu User Satu Lingkaran 🔥
    const seenUsers = new Set();

    stories.forEach(story => {
      // Jika creator_id sudah ada di Set, kita skip (gak bakal didouble)
      if (seenUsers.has(story.creator_id)) return;
      seenUsers.add(story.creator_id);

      const item = document.createElement("div");
      item.className = "story-item";
      item.innerHTML = `
        <div class="story-circle unseen">
          <img src="${story.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + story.profiles?.username}" alt="user">
        </div>
        <span>${story.profiles?.username || 'User'}</span>
      `;
      
      item.onclick = () => {
        // Efek visual biar kerasa udah diklik
        item.querySelector('.story-circle').classList.remove('unseen');
        item.querySelector('.story-circle').classList.add('seen');
        
        // Navigasi ke halaman viewer khusus
        window.location.href = `/story/${story.id}`;
      };
      
      container.appendChild(item);
    });
  } catch (err) {
    console.error("Fetch Story Error:", err);
  }
}

// =======================
// GIFT SYSTEM
// =======================
function initGiftButtons() {
  document.querySelectorAll(".gift-btn").forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener("click", async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) { openLogin(); return; }

      const postId = newBtn.dataset.post;
      const creatorId = newBtn.dataset.creator;
      if (session.user.id === creatorId) { showNotif("Gak bisa gift diri sendiri", "warning"); return; }

      const prof = await getMyProfile(session.user.id);
      openGiftSheet({ postId, creatorId, creatorName: newBtn.dataset.name, userCoins: prof?.coins || 0 });
    });
  });
}

function openGiftSheet({ postId, creatorId, creatorName, userCoins }) {
  const sheet = document.getElementById("giftSheet");
  if (!sheet) return;
  giftState = { postId, creatorId, creatorName, userCoins, selectedAmount: 0 };
  document.getElementById("giftUserCoins").textContent = userCoins;
  const sendBtn = document.getElementById("sendGiftBtn");
  sendBtn.disabled = true; sendBtn.textContent = "Kirim";
  document.querySelectorAll(".gift-item").forEach((i) => i.classList.remove("active"));
  sheet.classList.add("active");
  document.body.style.overflow = "hidden";
}

let selectedGiftImage = null;
function selectGift(element, amount, imageName) {
  document.querySelectorAll(".gift-item").forEach((item) => item.classList.remove("selected-gift"));
  element.classList.add("selected-gift");
  selectedGiftImage = imageName;
  giftState.selectedAmount = amount;
  const sendBtn = document.getElementById("sendGiftBtn");
  sendBtn.disabled = false; sendBtn.textContent = `Kirim (${amount} Koin)`;
}

async function processGiftTransaction() {
  const amount = giftState.selectedAmount;
  const sendBtn = document.getElementById("sendGiftBtn");
  if (!selectedGiftImage || amount <= 0) return;
  if (amount > giftState.userCoins) { showNotif("Koin tidak cukup", "error"); return; }
  sendBtn.disabled = true; sendBtn.textContent = "Mengirim...";

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const { error: rpcErr } = await supabaseClient.rpc("transfer_coins", { sender_id: session.user.id, receiver_id: giftState.creatorId, amount });
    if (rpcErr) throw rpcErr;
    await supabaseClient.from("gift_transactions").insert({ sender_id: session.user.id, receiver_id: giftState.creatorId, post_id: parseInt(giftState.postId), amount });

    const sProf = await getMyProfile(session.user.id);
    const currentBalanceSender = (sProf?.coins || 0) - amount;

    await supabaseClient.from("coin_history").insert({ user_id: session.user.id, type: "keluar", transaction_type: "keluar", amount: amount, balance_after: currentBalanceSender, description: `Kirim gift ke ${giftState.creatorName}` });
    await supabaseClient.from("coin_history").insert({ user_id: giftState.creatorId, type: "masuk", transaction_type: "masuk", amount: amount, description: `Terima gift dari ${sProf?.username || 'Seseorang'}` });

    showBigImage(selectedGiftImage);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    await createNotification({ user_id: giftState.creatorId, actor_id: session.user.id, post_id: giftState.postId, type: "gift", message: `${sProf?.username} mengirim ${amount} coin ke karyamu` });

    giftState.userCoins -= amount;
    document.getElementById("giftUserCoins").textContent = giftState.userCoins;
    sProf.coins = giftState.userCoins;
    sessionStorage.setItem(`hh_profile_${session.user.id}`, JSON.stringify(sProf));
    closeGiftSheet();

  } catch (err) { 
    showNotif("Gagal: " + err.message, "error"); 
  } finally { 
    sendBtn.disabled = false; 
    sendBtn.textContent = "Kirim"; 
  }
}

function showBigImage(imageName) {
  const container = document.getElementById("giftAnimationContainer");
  if (!container) return;
  container.innerHTML = `<img src="${imageName}" class="gift-main-img">`;
  setTimeout(() => { container.innerHTML = ""; }, 2500);
}

function closeGiftSheet() {
  const sheet = document.getElementById("giftSheet");
  if (sheet) sheet.classList.remove("active");
  document.body.style.overflow = "";
}

// =======================
// COMMENTS SYSTEM
// =======================
function initComments() {
  const modal = document.getElementById("commentModal");
  if (!modal) return;
  const list = modal.querySelector(".comment-list");
  const input = modal.querySelector(".comment-input");

  document.querySelectorAll(".comment-toggle").forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener("click", async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) { openLogin(); return; }
      currentPostId = newBtn.dataset.post;
      currentPostCreator = newBtn.dataset.creator; 
      modal.classList.add("active");
      list.innerHTML = "<li style='color:var(--text-muted); text-align:center; padding:20px;'>Loading...</li>";
      await loadCommentsStructured();
    });
  });

  input.onkeydown = async (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      e.preventDefault();
      const content = input.value.trim();
      const sReplyTo = replyTo;
      const sReplyUser = replyToUsername;
      input.value = ""; input.placeholder = "Mengirim...";
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        await supabaseClient.from("comments").insert({ post_id: parseInt(currentPostId), user_id: session.user.id, content, parent_id: sReplyTo ? parseInt(sReplyTo) : null, reply_to_username: sReplyUser || null });
        replyTo = null; replyToUsername = null; input.placeholder = "Tulis komentar...";
        
        const sProf = await getMyProfile(session.user.id);
        await createNotification({ user_id: currentPostCreator, actor_id: session.user.id, post_id: currentPostId, type: "comment", message: `${sProf?.username} mengomentari karyamu` });
        
        await updateCommentCount(currentPostId);
        await loadCommentsStructured();
      } catch (err) { input.placeholder = "Gagal..."; }
    }
  };
}

function createComment(comment, isReply, postOwnerId) {
  const div = document.createElement("div");
  div.className = isReply ? "comment-item reply" : "comment-item";
  const isPostOwner = comment.user_id === postOwnerId;
  const creatorBadge = isPostOwner ? `<span style="background:#444; color:#eee; padding:2px 6px; border-radius:4px; font-size:9px; margin-left:5px; font-weight:800;">CREATOR</span>` : "";
  const p = comment.profiles;
  div.innerHTML = `<div class="comment-left"><img class="comment-avatar" src="${p?.avatar_url || "https://via.placeholder.com/40"}" onclick="window.location.href='/data?id=${p?.id}'"></div><div class="comment-right"><div class="comment-topline"><span class="comment-username" onclick="window.location.href='/data?id=${p?.id}'">${p?.username} ${getUserBadge(p?.role, true)} ${creatorBadge}</span></div><div class="comment-text">${comment.reply_to_username ? `<span class="reply-tag">@${comment.reply_to_username}</span> ` : ""}${comment.content}</div><div class="comment-actions"><span class="reply-btn" data-id="${comment.id}">Balas</span></div></div>`;
  return div;
}

async function loadCommentsStructured() {
  const list = document.querySelector(".comment-list");
  if (!list || !currentPostId) return;
  
  const { data } = await supabaseClient.from("comments")
    .select("id, content, created_at, user_id, parent_id, reply_to_username, profiles(id, username, avatar_url, role)")
    .eq("post_id", currentPostId)
    .order("created_at", { ascending: true });
  
  const ownerId = currentPostCreator;
  list.innerHTML = (!data || data.length === 0) ? "<li style='text-align:center; padding:20px; color:var(--text-muted);'>Belum ada komentar.</li>" : "";
  if(!data) return;

  const parents = data.filter(c => !c.parent_id);
  parents.forEach(p => {
    const wrap = document.createElement("div"); wrap.className = "comment-thread";
    wrap.appendChild(createComment(p, false, ownerId));
    
    const childs = data.filter(r => String(r.parent_id) === String(p.id));
    if (childs.length > 0) {
      const toggleBtn = document.createElement("div");
      toggleBtn.className = "view-replies-btn";
      toggleBtn.style.cssText = "margin-left: 55px; font-size: 11px; color: var(--text-muted); cursor: pointer; padding: 5px 0; font-weight: bold;";
      toggleBtn.innerHTML = `——— Lihat ${childs.length} balasan`;

      const replyWrap = document.createElement("div");
      replyWrap.className = "reply-group";
      replyWrap.style.display = "none"; 

      childs.forEach(c => replyWrap.appendChild(createComment(c, true, ownerId)));

      toggleBtn.onclick = () => {
        const isHidden = replyWrap.style.display === "none";
        replyWrap.style.display = isHidden ? "block" : "none";
        toggleBtn.innerHTML = isHidden ? `——— Sembunyikan balasan` : `——— Lihat ${childs.length} balasan`;
      };

      wrap.appendChild(toggleBtn);
      wrap.appendChild(replyWrap);
    }
    list.appendChild(wrap);
  });
}

function initReplyClick() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("reply-btn")) {
      replyTo = e.target.dataset.id;
      replyToUsername = e.target.closest(".comment-item").querySelector(".comment-username").childNodes[0].textContent.trim();
      const input = document.querySelector(".comment-input");
      if (input) { input.placeholder = "Membalas @" + replyToUsername + "..."; input.focus(); }
    }
  });
}

// =======================
// LIKES SYSTEM
// =======================
function initLikeButtons() {
  document.querySelectorAll(".like-btn").forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener("click", async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) { openLogin(); return; }
      
      const pId = newBtn.dataset.post;
      const creatorId = newBtn.dataset.creator; 
      const isCurrentlyLiked = newBtn.classList.contains("liked");
      let currentCount = parseInt(newBtn.querySelector(".like-count").textContent || "0");

      if (isCurrentlyLiked) {
        newBtn.classList.remove("liked");
        newBtn.querySelector(".like-count").textContent = Math.max(0, currentCount - 1);
        await supabaseClient.from("likes").delete().match({ post_id: pId, user_id: session.user.id });
      } else {
        newBtn.classList.add("liked");
        newBtn.querySelector(".like-count").textContent = currentCount + 1;
        await supabaseClient.from("likes").insert({ post_id: pId, user_id: session.user.id });
        
        const sP = await getMyProfile(session.user.id);
        await createNotification({ user_id: creatorId, actor_id: session.user.id, post_id: pId, type: "like", message: `${sP?.username} menyukai karyamu` });
      }
    });
  });
}

async function loadLikes() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return; 

  const likeBtns = document.querySelectorAll(".like-btn");
  if (likeBtns.length === 0) return;

  const postIds = Array.from(likeBtns).map(btn => btn.dataset.post);

  const { data } = await supabaseClient.from("likes")
      .select("post_id")
      .eq("user_id", session.user.id)
      .in("post_id", postIds);

  const myLikedPostIds = data ? data.map(row => String(row.post_id)) : [];
  likeBtns.forEach(btn => {
      if (myLikedPostIds.includes(btn.dataset.post)) btn.classList.add("liked");
  });
}

async function updateCommentCount(postId) {
  const { count } = await supabaseClient.from("comments").select("id", { count: "exact", head: true }).eq("post_id", postId);
  const el = document.querySelector(`.comment-toggle[data-post="${postId}"] .comment-count`);
  if (el) el.textContent = count || 0;
}

// =======================
// AUTH & UTILS
// =======================
async function getUser() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    currentUser = session.user;
    const prof = await getMyProfile(currentUser.id); 
    currentUser.role = prof?.role || "user";
    const adminBtn = document.getElementById("adminPanelBtn");
    if (adminBtn) adminBtn.style.display = currentUser.role === "admin" ? "flex" : "none";
  }
}

function getUserBadge(role, isComment = false) {
  const r = (role || "user").toLowerCase().trim();
  let b = "";
  if (r === "admin") b += `<span class="admin-badge" style="background:#ff4757; color:white; padding:2px 8px; border-radius:4px; font-size:10px; margin-left:5px; font-weight:bold;">🛡 Dev</span>`;
  const crowns = { crown1: "/asets/png/crown1.png", crown2: "/asets/png/crown2.png", crown3: "/asets/png/crown3.png" };
  if (isComment && crowns[r]) b += `<img src="${crowns[r]}" style="width:18px; margin-left:5px; vertical-align:middle;">`;
  else if (r === "verified" || (!isComment && crowns[r])) b += `<span class="verified-badge" style="margin-left:5px;"><svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1DA1F2"/><path d="M7 12.5l3 3 7-7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
  return b;
}

function initSearch() {
  const input = document.getElementById("searchCreator");
  input?.addEventListener("input", () => {
    const val = input.value.toLowerCase();
    document.querySelectorAll(".card").forEach((c) => c.style.display = c.innerText.toLowerCase().includes(val) ? "block" : "none");
  });
}

function initAuth() {
  const form = document.querySelector(".form");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { error } = await supabaseClient.auth.signInWithPassword({ email: form.querySelectorAll("input")[0].value, password: form.querySelectorAll("input")[1].value });
    if (error) showNotif(error.message, "error"); else location.reload();
  });
}

function openLogin() { const p = document.getElementById("loginPopup"); if (p) p.style.display = "flex"; }

function initCloseButtons() {
  document.querySelector(".comment-close")?.addEventListener("click", () => document.getElementById("commentModal").classList.remove("active"));
  document.querySelector(".close-login")?.addEventListener("click", () => document.getElementById("loginPopup").style.display = "none");
}

function initRealtime() {
  supabaseClient.channel("updates").on("postgres_changes", { event: "*", schema: "public", table: "comments" }, (payload) => {
    if(payload.new && payload.new.post_id) updateCommentCount(payload.new.post_id);
  }).subscribe();
}

function initPostModal() {
  const modal = document.getElementById("postModal");
  document.getElementById("openPostModalBtn")?.addEventListener("click", async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) { openLogin(); return; }
    modal.classList.add("active");
  });
  document.getElementById("closePostModalBtn")?.addEventListener("click", () => modal.classList.remove("active"));
  document.getElementById("postUploadArea")?.addEventListener("click", () => document.getElementById("postImageInput").click());
  document.getElementById("postImageInput")?.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) { selectedPostFile = f; const r = new FileReader(); r.onload = (ev) => { document.getElementById("postPreviewImage").src = ev.target.result; document.getElementById("postPreviewImage").style.display = "block"; document.getElementById("postUploadPlaceholder").style.display = "none"; }; r.readAsDataURL(f); }
  });

  // 🔥 LOGIKA BARU: KLIK TOGGLE FOTO vs TEKS SAJA 🔥
  const btnTypeImage = document.getElementById("btnTypeImage");
  const btnTypeText = document.getElementById("btnTypeText");
  const uploadArea = document.getElementById("postUploadArea");
  const captionInput = document.getElementById("postCaption");

  if (btnTypeImage && btnTypeText && uploadArea) {
    // 1. Kalau milih FOTO
    btnTypeImage.addEventListener("click", () => {
      // Ubah warna tombol
      btnTypeImage.style.background = "#1DA1F2";
      btnTypeImage.style.color = "white";
      btnTypeText.style.background = "transparent";
      btnTypeText.style.color = "var(--text-muted, #64748b)";
      
      // Munculin kotak foto
      uploadArea.style.display = "flex"; 
      if(captionInput) captionInput.placeholder = "Tulis caption menarik di sini....";
    });

    // 2. Kalau milih TEKS SAJA (Thread)
    btnTypeText.addEventListener("click", () => {
      // Ubah warna tombol
      btnTypeText.style.background = "#1DA1F2";
      btnTypeText.style.color = "white";
      btnTypeImage.style.background = "transparent";
      btnTypeImage.style.color = "var(--text-muted, #64748b)";
      
      // Sembunyiin kotak foto
      uploadArea.style.display = "none"; 
      if(captionInput) captionInput.placeholder = "Tulis apa yang sedang kamu pikirkan...";
      
      // Reset pilihan foto (biar ga sengaja ke-upload)
      selectedPostFile = null;
      document.getElementById("postPreviewImage").style.display = "none";
      document.getElementById("postUploadPlaceholder").style.display = "flex";
      document.getElementById("postImageInput").value = "";
    });
  }

  document.getElementById("postForm")?.addEventListener("submit", handlePostSubmit);
  setupCustomCategory();
  initMusicPicker(); 
}

function setupCustomCategory() {
  const dropdown = document.getElementById("categoryDropdown");
  const trigger = dropdown.querySelector(".select-trigger");

  trigger.onclick = (e) => {
    e.stopPropagation();
    // Ini kuncinya! Nambahin class 'active' ke div paling luar
    dropdown.classList.toggle("active"); 
  };

  // Tutup kalau pilih salah satu
  dropdown.querySelectorAll(".option-item").forEach(opt => {
    opt.onclick = () => {
      document.getElementById("selectedCategoryText").innerText = opt.innerText;
      document.getElementById("postCategory").value = opt.dataset.value;
      dropdown.classList.remove("active"); // Tutup lagi
    };
  });
}

async function handlePostSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById("submitPostBtn");
  const selectedTitle = document.getElementById("selectedMusicTitle");
  const captionValue = document.getElementById("postCaption").value.trim();
  
  const destination = document.querySelector('input[name="postDestination"]:checked')?.value || 'feed';

  if (!selectedPostFile && !captionValue) {
    return showNotif("Isi konten atau pilih foto dulu bro!", "warning");
  }
  
  btn.disabled = true; 
  btn.textContent = "Mengirim...";

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return openLogin();

    const { data: profileData } = await supabaseClient
      .from("profiles")
      .select("username") 
      .eq("id", session.user.id)
      .single();

    const uploaderName = profileData?.username || "User"; 

    // 1. UPLOAD KE CLOUDINARY
    let imageUrl = null;
    if (selectedPostFile) {
      const cData = await uploadImageToCloudinary(selectedPostFile);
      imageUrl = cData.secure_url;
    }
    
    // 🔥 2. OLAH LOGIKA MUSIK DI LUAR (Biar bisa dipake Feed & Story)
    let finalTitle = null, finalArtist = null, finalAudioSrc = null;
    if (selectedAudioUrl) {
      finalAudioSrc = selectedAudioUrl;
      const musicParts = selectedTitle ? selectedTitle.innerText.split(" — ") : [];
      finalTitle = musicParts[0]?.trim() || "Untitled";
      finalArtist = musicParts[1]?.trim() || "Unknown Artist";
    }

    // 3. EKSEKUSI BERDASARKAN TUJUAN
    if (destination === "story") {
      // INSERT KE TABEL STORIES (Sekarang dapet data musik)
      const { error } = await supabaseClient.from("stories").insert({
        creator_id: session.user.id,
        image_url: imageUrl,
        content: captionValue,
        audio_src: finalAudioSrc, // 🔥 Masukin ini
        title: finalTitle,        // 🔥 Dan ini
        artist: finalArtist       // 🔥 Dan ini
      });
      if (error) throw error;
      showNotif("Cerita berhasil dibagikan! 🔥", "success");
    } else {
      // INSERT KE TABEL POSTS
      const { error } = await supabaseClient.from("posts").insert({ 
          creator_id: session.user.id, 
          name: uploaderName,       
          bio: captionValue, 
          category: document.getElementById("postCategory").value || "Umum", 
          image_url: imageUrl, 
          audio_src: finalAudioSrc, 
          title: finalTitle,        
          artist: finalArtist,      
          status: "pending" 
      });
      if (error) throw error;
      showNotif("Karya dikirim ke review admin! 🔥", "success");
    }

    // --- RESET UI & STATE ---
    document.getElementById("postModal").classList.remove("active");
    e.target.reset();
    
    selectedAudioUrl = null; 
    selectedPostFile = null;
    if (selectedTitle) selectedTitle.innerText = "Pilih Musik (Opsional)...";

    const previewImg = document.getElementById("postPreviewImage");
    const placeholder = document.getElementById("postUploadPlaceholder");
    if (previewImg) previewImg.style.display = "none";
    if (placeholder) placeholder.style.display = "flex";

    setTimeout(() => location.reload(), 1000);

  } catch (err) { 
    console.error("Submit Error:", err);
    showNotif("Gagal: " + err.message, "error"); 
  } finally { 
    btn.disabled = false; 
    btn.textContent = destination === "story" ? "Bagikan ke Cerita" : "Kirim ke Review"; 
  }
}

async function uploadImageToCloudinary(file) {
  const fd = new FormData(); fd.append("file", file); fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
  return await res.json();
}

function closeBigImage() {
  const container = document.getElementById("bigImageContainer");
  if (container) container.style.display = "none";
}

// =======================
// MUSIC PICKER - ITUNES API VERSION
// =======================
let searchTimer;

async function initMusicPicker() {
  const listContainer = document.getElementById("predefinedMusicList");
  const selectedBox = document.getElementById("selectedMusicBox");
  const selectedTitle = document.getElementById("selectedMusicTitle");
  const removeBtn = document.getElementById("removeMusicBtn");
  
  // Pastiin lu punya input search di HTML dengan ID ini
  const searchInput = document.getElementById("searchMusicInput"); 

  if(!listContainer) return;

  // Fungsi buat tembak ke API iTunes
  const searchITunes = async (query) => {
    if (!query) {
      listContainer.innerHTML = "<div style='font-size:12px; color:gray; text-align:center; padding: 15px;'>Ketik judul lagu atau artis...</div>";
      return;
    }

    listContainer.innerHTML = "<div style='font-size:12px; color:gray; text-align:center; padding: 15px;'>Mencari lagu di iTunes... </div>";
    
    try {
      // Kita limit 10 aja biar gak kepanjangan
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`);
      const data = await response.json();

      listContainer.innerHTML = "";

      if (data.results.length === 0) {
        listContainer.innerHTML = "<div style='font-size:12px; color:gray; text-align:center; padding: 10px;'>Lagu gak ketemu, coba keyword lain.</div>";
        return;
      }

      data.results.forEach(song => {
        const div = document.createElement("div");
        div.style.cssText = "display:flex; align-items:center; gap:12px; padding:10px; border-radius:12px; cursor:pointer; background:var(--bg-secondary, #f1f3f5); border: 1px solid var(--border-color); transition:0.2s; margin-bottom:8px;";
        
        // iTunes pake artworkUrl100 buat gambar album
        div.innerHTML = `
          <img src="${song.artworkUrl100}" style="width:38px; height:38px; border-radius:8px; object-fit:cover;">
          <div style="flex:1; overflow:hidden;">
            <div style="font-size:13px; font-weight:700; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${song.trackName}</div>
            <div style="font-size:11px; color:gray;">${song.artistName}</div>
          </div>
        `;
        
        div.onclick = () => {
          // iTunes kasih previewUrl (30 detik)
          selectedAudioUrl = song.previewUrl; 
          
          // Set tampilan lagu terpilih
          selectedTitle.innerText = `${song.trackName} — ${song.artistName}`;
          selectedBox.style.display = "flex";
          
          // Reset border yang lain
          document.querySelectorAll('#predefinedMusicList > div').forEach(el => {
              el.style.borderColor = 'var(--border-color)';
              el.style.background = 'var(--bg-secondary)';
          });
          div.style.borderColor = '#1DA1F2';
          div.style.background = 'rgba(29, 161, 242, 0.05)';
        };
        
        listContainer.appendChild(div);
      });

    } catch (err) {
      console.error("iTunes Error:", err);
      listContainer.innerHTML = "<div style='font-size:12px; color:red; text-align:center; padding: 10px;'>Gagal nyambung ke iTunes.</div>";
    }
  };

  // Listener buat ngetik (pake debounce biar gak spam API)
  searchInput?.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    const query = e.target.value.trim();
    searchTimer = setTimeout(() => searchITunes(query), 600);
  });

  if(removeBtn) {
    removeBtn.onclick = () => {
      selectedAudioUrl = null;
      selectedBox.style.display = "none";
      if(searchInput) searchInput.value = "";
      listContainer.innerHTML = "<div style='font-size:12px; color:gray; text-align:center; padding: 15px;'>Ketik judul lagu atau artis...</div>";
    };
  }
}

window.togglePostMusic = function(btn) {
    const audio = btn.querySelector('.post-audio-element');
    const text = btn.querySelector('span');

    // Matiin lagu postingan lain dulu
    document.querySelectorAll('.post-audio-element').forEach(el => {
        if (el !== audio) {
            el.pause();
            const otherBtn = el.closest('.music-player-btn');
            otherBtn.querySelector('span').innerText = 'PLAY AUDIO';
        }
    });

    if (audio.paused) {
        audio.play();
        text.innerText = 'PAUSE AUDIO';
    } else {
        audio.pause();
        text.innerText = 'PLAY AUDIO';
    }
};

// =======================
// DELETE POST SYSTEM
// =======================
async function deletePost(postId) {
  if (!confirm("Yakin ingin menghapus karya ini secara permanen?")) return;
  showNotif("Sedang menghapus karya...", "info");
  
  try {
    const { error } = await supabaseClient.from("posts").delete().eq("id", postId);
    if (error) throw error;
    showNotif("Karya berhasil dihapus!", "success");
    fetchPosts("all"); 
  } catch (err) {
    showNotif("Gagal menghapus: " + err.message, "error");
  }
}

// =======================
// POST OPTIONS (BOTTOM SHEET)
// =======================
function openPostOptions(postId, isOwner, creatorId) {
    let sheet = document.getElementById('postOptionsSheet');
    
    if (!sheet) {
        sheet = document.createElement('div');
        sheet.id = 'postOptionsSheet';
        sheet.className = 'action-sheet-overlay';
        sheet.innerHTML = `
            <div class="action-sheet">
                <div class="sheet-handle"></div>
                <div class="sheet-content" id="sheetOptionsContent"></div>
                <button class="sheet-cancel" onclick="closePostOptions()">Batal</button>
            </div>
        `;
        document.body.appendChild(sheet);

        const style = document.createElement('style');
        style.innerHTML = `
            .action-sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 99999; display: flex; flex-direction: column; justify-content: flex-end; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
            .action-sheet-overlay.active { opacity: 1; pointer-events: auto; }
            .action-sheet { background: var(--bg-card, #fff); width: 100%; max-width: 500px; margin: 0 auto; border-radius: 20px 20px 0 0; padding: 20px; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .action-sheet-overlay.active .action-sheet { transform: translateY(0); }
            .sheet-handle { width: 40px; height: 5px; background: #cbd5e1; border-radius: 10px; margin: 0 auto 20px; }
            .sheet-btn { display: flex; align-items: center; gap: 14px; width: 100%; padding: 16px 12px; background: none; border: none; font-size: 15px; font-weight: 600; color: var(--text-main, #0f172a); text-align: left; cursor: pointer; border-radius: 12px; transition: 0.2s; }
            .sheet-btn:hover { background: rgba(0,0,0,0.05); }
            .sheet-btn.danger { color: #ef4444; }
            .sheet-btn.danger:hover { background: rgba(239, 68, 68, 0.1); }
            .sheet-cancel { width: 100%; padding: 16px; margin-top: 10px; border: none; border-radius: 12px; background: var(--bg-main, #f1f5f9); font-weight: 700; cursor: pointer; font-size: 15px; color: var(--text-muted, #475569);}
        `;
        document.head.appendChild(style);

        sheet.addEventListener('click', (e) => {
            if (e.target === sheet) closePostOptions();
        });
    }

    const content = document.getElementById('sheetOptionsContent');
    
    content.innerHTML = `
        <button class="sheet-btn" onclick="sharePost('${postId}')">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
            Bagikan Karya
        </button>
        <button class="sheet-btn" onclick="window.location.href='/data?id=${creatorId}'">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>
            Lihat Profil
        </button>
        ${isOwner ? `
        <button class="sheet-btn danger" onclick="confirmDeletePost('${postId}')">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Hapus Karya
        </button>
        ` : `
        <button class="sheet-btn" onclick="showNotif('Karya ini telah dilaporkan ke Admin.', 'success'); closePostOptions();">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
            Laporkan
        </button>
        `}
    `;

    setTimeout(() => sheet.classList.add('active'), 10);
}

function closePostOptions() {
    const sheet = document.getElementById('postOptionsSheet');
    if (sheet) sheet.classList.remove('active');
}

function sharePost(postId) {
    const url = window.location.origin + '/post?id=' + postId;
    if (navigator.share) {
        navigator.share({ title: 'Hope Hype', text: 'Cek karya keren ini di Hope Hype!', url: url });
    } else {
        navigator.clipboard.writeText(url);
        showNotif('Link disalin ke clipboard!', 'success');
    }
    closePostOptions();
}

function confirmDeletePost(postId) {
    closePostOptions();
    setTimeout(() => deletePost(postId), 300); 
}
// ==========================================
// AUTO PLAY POSTINGAN (ANTI BISU TIKTOK STYLE)
// ==========================================
function initAutoPlayObserver() {
    let userHasInteracted = false;

    document.body.addEventListener('click', () => { 
        userHasInteracted = true; 
        console.log("User unlocked audio 🔓");
    }, { once: true });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const audio = entry.target.querySelector('.post-audio-element');
            if (!audio) return;

            if (entry.isIntersecting) {
                // 🔥 STOP semua audio lain
                document.querySelectorAll('.post-audio-element').forEach(el => { 
                    if (el !== audio) {
                        el.pause();
                        el.muted = true;
                    }
                });

                // 🔥 RESET biar ga lanjut dari tengah
                audio.currentTime = 0;

                // 🔥 SET VOLUME
                audio.volume = 1.0;

                // 🔥 UNMUTE kalau user sudah interaksi
                audio.muted = !userHasInteracted;

                // 🔥 ANTI SPAM PLAY
                if (!audio.paused) return;

                const playPromise = audio.play();

                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            console.log("✅ Autoplay jalan:", audio.src);
                        })
                        .catch(() => {
                            // 🔥 fallback: paksa mute biar tetep jalan
                            audio.muted = true;
                            audio.play().catch(() => {});
                            console.log("⏳ Nunggu user interaction...");
                        });
                }

            } else {
                // 🔥 keluar viewport → stop total
                audio.pause();
                audio.currentTime = 0;
                audio.muted = true;
            }
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('.card').forEach(card => observer.observe(card));
}
// --- DAFTARKAN FUNGSI KE WINDOW BIAR BISA DIBACA HTML ---
window.selectGift = selectGift;
window.processGiftTransaction = processGiftTransaction;
window.closeGiftSheet = closeGiftSheet;
window.closeBigImage = closeBigImage;
window.openPostOptions = openPostOptions;
window.closePostOptions = closePostOptions;
window.sharePost = sharePost;
window.confirmDeletePost = confirmDeletePost;
