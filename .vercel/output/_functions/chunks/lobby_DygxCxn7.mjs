import { c as createComponent } from './astro-component_Bm-5TSlt.mjs';
import 'piccolore';
import { m as maybeRenderHead, r as renderTemplate, l as renderComponent } from './entrypoint_D7e8hfS1.mjs';
import { $ as $$Layout } from './Layout_DsOADmIq.mjs';
import 'clsx';

const $$Headerlobby = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header class="top-nav"> <div class="user-pill" onclick="window.location.href='/data'"> <img src="/asets/png/profile.png" id="lobby-avatar" alt="User"> <div class="user-meta"> <span id="lobby-username">Loading...</span> <div class="coin-badge" style="display: flex; align-items: center; border: none !important; background: transparent !important; box-shadow: none !important; padding: 0 !important; margin-top: 4px;"> <img src="/asets/svg/koin.svg" alt="Koin" style="width: 16px; height: 16px; object-fit: contain; margin-right: 5px; border: none !important; background: transparent !important; box-shadow: none !important; outline: none !important; border-radius: 0 !important;"> <span id="lobby-coins" style="font-weight: 800; color: #f1c40f; font-size: 14px;">0</span> </div> </div> </div> </header>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/lobby/Headerlobby.astro", void 0);

const $$Herolobby = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="hero-section"> <div class="hero-card"> <div class="hero-text"> <h2>Panggung Utama</h2> <p>Jadilah bintang hari ini dan kumpulkan koin hope</p> <button class="btn-primary-neon" onclick="handleStartSinging()">ROOM KAMU</button> </div> <div class="hero-overlay-glow"></div> </div> </section>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/lobby/Herolobby.astro", void 0);

const $$RoomSectionlobby = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<main class="room-section"> <div class="section-header"> <h3>Panggung Aktif</h3> <div class="tabs"> <span class="active" onclick="filterKategori('Populer', this)">Populer</span> <span onclick="filterKategori('Musik', this)">Musik</span> <span onclick="filterKategori('Chat', this)">Chat</span> </div> </div> <div id="room-list" class="room-list-container"></div> </main>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/lobby/RoomSectionlobby.astro", void 0);

const $$FabCreatelobby = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<button class="fab-create" onclick="createRoom()"> <span class="material-icons">add</span> </button>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/lobby/FabCreatelobby.astro", void 0);

const $$CreateRoomModallobby = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="modal-create" class="modal-overlay" style="display: none;"> <div class="modal-content"> <h3>BUAT PANGGUNG BARU</h3> <p>Tentukan nama panggung dan ajak temanmu bernyanyi!</p> <div class="input-group"> <label>Nama Room</label> <input type="text" id="new-room-name" placeholder="Nama room kamu"> </div> <div class="input-group"> <label>Deskripsi</label> <textarea id="new-room-desc" placeholder="Bahas tentang apa.."></textarea> </div> <div class="input-group"> <label>Kategori</label> <select id="new-room-category" class="custom-select"> <option value="Musik">Musik dan Nyanyi</option> <option value="Chat">Chat dan Nongkrong</option> </select> </div> <div class="modal-actions"> <button class="btn-cancel" onclick="closeModal()">BATAL</button> <button class="btn-confirm" onclick="confirmCreateRoom()">BUAT SEKARANG</button> </div> </div> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/lobby/CreateRoomModallobby.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Lobby = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "HypeVoice - Lobby" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="lobby-container"> ', " ", " ", " </div> ", " ", ` <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script> <script>
    try {
        const supabaseUrl = 'https://hqetnqnvmdxdgfnnluew.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXRucW52bWR4ZGdmbm5sdWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MzUyODIsImV4cCI6MjA4NzMxMTI4Mn0.Cr9lDBZMqfeONi1dfyFzHpBtawBzZTQLBEWKmPJVAOA';
        
        window.sb = window.supabase.createClient(supabaseUrl, supabaseKey);
    } catch (err) {
        console.error("Supabase gagal dimuat:", err);
    }

    let MY_USER_ID = null; 
    let kategoriAktif = 'Populer';

    const showMsg = (title, msg, type) => {
        if (typeof toast === "function") toast(title, msg, type);
        else alert(title + " - " + msg);
    };

    window.filterKategori = function(kategori, elemen) {
        kategoriAktif = kategori;
        const semuaTab = document.querySelectorAll('.tabs span');
        semuaTab.forEach(tab => tab.classList.remove('active'));
        if (elemen) elemen.classList.add('active');
        loadRooms(); 
    };

    window.createRoom = function() {
        document.getElementById('modal-create').style.display = 'flex';
    };

    window.closeModal = function() {
        document.getElementById('modal-create').style.display = 'none';
    };

    window.handleStartSinging = async function() {
        if (!MY_USER_ID) return showMsg("Waduh", "Login dulu Bree!", "warning");

        const { data: existingRoom } = await window.sb.from('rooms')
            .select('id, name')
            .eq('owner_id', MY_USER_ID)
            .eq('is_active', true)
            .maybeSingle(); 

        if (existingRoom) {
            window.location.href = \`/voice?id=\${existingRoom.id}&name=\${encodeURIComponent(existingRoom.name)}\`;
        } else {
            window.createRoom();
        }
    };

    window.confirmCreateRoom = async function() {
        const nameInput = document.getElementById('new-room-name');
        const descInput = document.getElementById('new-room-desc');
        const categoryInput = document.getElementById('new-room-category');
        const btn = document.querySelector('.btn-confirm');

        const name = nameInput.value.trim();
        const desc = descInput.value.trim();
        const category = categoryInput.value;

        if (!name) return showMsg("Waduh", "Kasih nama panggung dulu dong!", "warning");
        if (!MY_USER_ID) return showMsg("Error", "Sesi login hilang, coba refresh/login ulang.", "error");

        btn.disabled = true;
        btn.innerText = "SEDANG MEMBUAT...";

        try {
            const { data: oldRooms } = await window.sb.from('rooms').select('id').eq('owner_id', MY_USER_ID);
            if (oldRooms && oldRooms.length > 0) {
                const oldRoomIds = oldRooms.map(r => r.id);
                await window.sb.from('room_slots').delete().in('room_id', oldRoomIds);
                await window.sb.from('rooms').delete().in('id', oldRoomIds);
            }

            const { data: newRoom, error: roomError } = await window.sb.from('rooms').insert([{
                name: name,
                description: desc,
                category: category,
                owner_id: MY_USER_ID,
                is_active: true
            }]).select().single();

            if (roomError) throw roomError;

            const slots = Array.from({ length: 6 }, (_, i) => ({
                room_id: newRoom.id,
                slot_index: i,
                profile_id: null
            }));
            
            const { error: slotError } = await window.sb.from('room_slots').insert(slots);
            if (slotError) throw slotError;

            showMsg("Berhasil", "Panggung lo udah siap!", "success");
            window.closeModal();

            setTimeout(() => {
                window.location.href = \`/voice?id=\${newRoom.id}&name=\${encodeURIComponent(name)}\`;
            }, 1000);

        } catch (e) {
            console.error("Gagal bikin panggung:", e);
            showMsg("Error", "Gagal bikin panggung nih.", "error");
            btn.disabled = false;
            btn.innerText = "BUAT SEKARANG";
        }
    };

    async function loadUserProfile() {
        if (!window.sb) return;
        const { data: { user } } = await window.sb.auth.getUser();
        
        if (user) {
            MY_USER_ID = user.id; 
            const { data: profile } = await window.sb.from('profiles')
                .select('username, avatar_url, coins')
                .eq('id', user.id)
                .single();

            if (profile) {
                document.getElementById('lobby-username').innerText = profile.username;
                document.getElementById('lobby-coins').innerText = (profile.coins || 0).toLocaleString();
                if (profile.avatar_url) document.getElementById('lobby-avatar').src = profile.avatar_url;
            }
        }
    }
    async function loadRooms() {
        if (!window.sb) return;
        const list = document.getElementById('room-list');
        
        list.innerHTML = \`
            <div class="skeleton-card"><div class="skeleton skeleton-thumb"></div><div class="skeleton-info"><div class="skeleton skeleton-text skeleton-title"></div><div class="skeleton skeleton-text skeleton-desc" style="width: 70%"></div></div></div>
            <div class="skeleton-card"><div class="skeleton skeleton-thumb"></div><div class="skeleton-info"><div class="skeleton skeleton-text skeleton-title"></div><div class="skeleton skeleton-text skeleton-desc" style="width: 40%"></div></div></div>
        \`;
        
        let query = window.sb.from('rooms').select('id, name, description').eq('is_active', true);

        if (kategoriAktif !== 'Populer') query = query.eq('category', kategoriAktif); 
        else query = query.order('created_at', { ascending: false }); 

        const { data: rooms, error } = await query;
        
        if (error) return list.innerHTML = \`<div style="text-align:center; padding: 20px; color: #ff4d4d;">Gagal memuat room.</div>\`;
        list.innerHTML = "";

        if (!rooms || rooms.length === 0) {
            list.innerHTML = \`<div style="text-align:center; padding: 40px 20px; color: #888; font-size: 13px;">Belum ada panggung di kategori \${kategoriAktif}.</div>\`;
            return;
        }

        const roomIds = rooms.map(r => r.id);
        const { data: occupiedSlots } = await window.sb.from('room_slots').select('room_id').in('room_id', roomIds).not('profile_id', 'is', null);

        const onlineCounts = {};
        if (occupiedSlots) {
            occupiedSlots.forEach(slot => {
                onlineCounts[slot.room_id] = (onlineCounts[slot.room_id] || 0) + 1;
            });
        }

        rooms.forEach(room => {
            const onlineCount = onlineCounts[room.id] || 0; 
            const card = document.createElement('div');
            card.className = 'room-card';
            card.onclick = () => window.location.href = \`/voice?id=\${room.id}&name=\${encodeURIComponent(room.name)}\`;
            card.innerHTML = \`
                <div class="room-thumb"><span class="material-icons">graphic_eq</span></div>
                <div class="room-info">
                    <h4>\${room.name.toUpperCase()}</h4>
                    <p>\${room.description || 'Ayo nyanyi bareng di panggung ini!'}</p>
                </div>
                <div class="room-status"><div class="online-pill">\${onlineCount} Online</div></div>
            \`;
            list.appendChild(card);
        });
    }

    setTimeout(() => {
        loadUserProfile().then(() => loadRooms());
    }, 500); 
  <\/script> `], [" ", '<div class="lobby-container"> ', " ", " ", " </div> ", " ", ` <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script> <script>
    try {
        const supabaseUrl = 'https://hqetnqnvmdxdgfnnluew.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXRucW52bWR4ZGdmbm5sdWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MzUyODIsImV4cCI6MjA4NzMxMTI4Mn0.Cr9lDBZMqfeONi1dfyFzHpBtawBzZTQLBEWKmPJVAOA';
        
        window.sb = window.supabase.createClient(supabaseUrl, supabaseKey);
    } catch (err) {
        console.error("Supabase gagal dimuat:", err);
    }

    let MY_USER_ID = null; 
    let kategoriAktif = 'Populer';

    const showMsg = (title, msg, type) => {
        if (typeof toast === "function") toast(title, msg, type);
        else alert(title + " - " + msg);
    };

    window.filterKategori = function(kategori, elemen) {
        kategoriAktif = kategori;
        const semuaTab = document.querySelectorAll('.tabs span');
        semuaTab.forEach(tab => tab.classList.remove('active'));
        if (elemen) elemen.classList.add('active');
        loadRooms(); 
    };

    window.createRoom = function() {
        document.getElementById('modal-create').style.display = 'flex';
    };

    window.closeModal = function() {
        document.getElementById('modal-create').style.display = 'none';
    };

    window.handleStartSinging = async function() {
        if (!MY_USER_ID) return showMsg("Waduh", "Login dulu Bree!", "warning");

        const { data: existingRoom } = await window.sb.from('rooms')
            .select('id, name')
            .eq('owner_id', MY_USER_ID)
            .eq('is_active', true)
            .maybeSingle(); 

        if (existingRoom) {
            window.location.href = \\\`/voice?id=\\\${existingRoom.id}&name=\\\${encodeURIComponent(existingRoom.name)}\\\`;
        } else {
            window.createRoom();
        }
    };

    window.confirmCreateRoom = async function() {
        const nameInput = document.getElementById('new-room-name');
        const descInput = document.getElementById('new-room-desc');
        const categoryInput = document.getElementById('new-room-category');
        const btn = document.querySelector('.btn-confirm');

        const name = nameInput.value.trim();
        const desc = descInput.value.trim();
        const category = categoryInput.value;

        if (!name) return showMsg("Waduh", "Kasih nama panggung dulu dong!", "warning");
        if (!MY_USER_ID) return showMsg("Error", "Sesi login hilang, coba refresh/login ulang.", "error");

        btn.disabled = true;
        btn.innerText = "SEDANG MEMBUAT...";

        try {
            const { data: oldRooms } = await window.sb.from('rooms').select('id').eq('owner_id', MY_USER_ID);
            if (oldRooms && oldRooms.length > 0) {
                const oldRoomIds = oldRooms.map(r => r.id);
                await window.sb.from('room_slots').delete().in('room_id', oldRoomIds);
                await window.sb.from('rooms').delete().in('id', oldRoomIds);
            }

            const { data: newRoom, error: roomError } = await window.sb.from('rooms').insert([{
                name: name,
                description: desc,
                category: category,
                owner_id: MY_USER_ID,
                is_active: true
            }]).select().single();

            if (roomError) throw roomError;

            const slots = Array.from({ length: 6 }, (_, i) => ({
                room_id: newRoom.id,
                slot_index: i,
                profile_id: null
            }));
            
            const { error: slotError } = await window.sb.from('room_slots').insert(slots);
            if (slotError) throw slotError;

            showMsg("Berhasil", "Panggung lo udah siap!", "success");
            window.closeModal();

            setTimeout(() => {
                window.location.href = \\\`/voice?id=\\\${newRoom.id}&name=\\\${encodeURIComponent(name)}\\\`;
            }, 1000);

        } catch (e) {
            console.error("Gagal bikin panggung:", e);
            showMsg("Error", "Gagal bikin panggung nih.", "error");
            btn.disabled = false;
            btn.innerText = "BUAT SEKARANG";
        }
    };

    async function loadUserProfile() {
        if (!window.sb) return;
        const { data: { user } } = await window.sb.auth.getUser();
        
        if (user) {
            MY_USER_ID = user.id; 
            const { data: profile } = await window.sb.from('profiles')
                .select('username, avatar_url, coins')
                .eq('id', user.id)
                .single();

            if (profile) {
                document.getElementById('lobby-username').innerText = profile.username;
                document.getElementById('lobby-coins').innerText = (profile.coins || 0).toLocaleString();
                if (profile.avatar_url) document.getElementById('lobby-avatar').src = profile.avatar_url;
            }
        }
    }
    async function loadRooms() {
        if (!window.sb) return;
        const list = document.getElementById('room-list');
        
        list.innerHTML = \\\`
            <div class="skeleton-card"><div class="skeleton skeleton-thumb"></div><div class="skeleton-info"><div class="skeleton skeleton-text skeleton-title"></div><div class="skeleton skeleton-text skeleton-desc" style="width: 70%"></div></div></div>
            <div class="skeleton-card"><div class="skeleton skeleton-thumb"></div><div class="skeleton-info"><div class="skeleton skeleton-text skeleton-title"></div><div class="skeleton skeleton-text skeleton-desc" style="width: 40%"></div></div></div>
        \\\`;
        
        let query = window.sb.from('rooms').select('id, name, description').eq('is_active', true);

        if (kategoriAktif !== 'Populer') query = query.eq('category', kategoriAktif); 
        else query = query.order('created_at', { ascending: false }); 

        const { data: rooms, error } = await query;
        
        if (error) return list.innerHTML = \\\`<div style="text-align:center; padding: 20px; color: #ff4d4d;">Gagal memuat room.</div>\\\`;
        list.innerHTML = "";

        if (!rooms || rooms.length === 0) {
            list.innerHTML = \\\`<div style="text-align:center; padding: 40px 20px; color: #888; font-size: 13px;">Belum ada panggung di kategori \\\${kategoriAktif}.</div>\\\`;
            return;
        }

        const roomIds = rooms.map(r => r.id);
        const { data: occupiedSlots } = await window.sb.from('room_slots').select('room_id').in('room_id', roomIds).not('profile_id', 'is', null);

        const onlineCounts = {};
        if (occupiedSlots) {
            occupiedSlots.forEach(slot => {
                onlineCounts[slot.room_id] = (onlineCounts[slot.room_id] || 0) + 1;
            });
        }

        rooms.forEach(room => {
            const onlineCount = onlineCounts[room.id] || 0; 
            const card = document.createElement('div');
            card.className = 'room-card';
            card.onclick = () => window.location.href = \\\`/voice?id=\\\${room.id}&name=\\\${encodeURIComponent(room.name)}\\\`;
            card.innerHTML = \\\`
                <div class="room-thumb"><span class="material-icons">graphic_eq</span></div>
                <div class="room-info">
                    <h4>\\\${room.name.toUpperCase()}</h4>
                    <p>\\\${room.description || 'Ayo nyanyi bareng di panggung ini!'}</p>
                </div>
                <div class="room-status"><div class="online-pill">\\\${onlineCount} Online</div></div>
            \\\`;
            list.appendChild(card);
        });
    }

    setTimeout(() => {
        loadUserProfile().then(() => loadRooms());
    }, 500); 
  <\/script> `])), maybeRenderHead(), renderComponent($$result2, "Header", $$Headerlobby, {}), renderComponent($$result2, "Hero", $$Herolobby, {}), renderComponent($$result2, "RoomSection", $$RoomSectionlobby, {}), renderComponent($$result2, "FabCreate", $$FabCreatelobby, {}), renderComponent($$result2, "CreateRoomModal", $$CreateRoomModallobby, {})) })}`;
}, "/data/data/com.termux/files/home/hope-hype/src/pages/lobby.astro", void 0);

const $$file = "/data/data/com.termux/files/home/hope-hype/src/pages/lobby.astro";
const $$url = "/lobby";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Lobby,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
