
import { supabase as supabaseClient } from '../lib/supabase.js';

    let myId = null; 
    let targetName = ""; 
    let targetProfileId = null;

    // [FIX EGRESS] TAB CACHE: Simpan data post biar gak nembak ulang pas ganti tab
    const tabCache = { foto: null, musik: null, like: null };

    const urlParams = new URLSearchParams(window.location.search);
    targetProfileId = urlParams.get('id'); 
    const userParam = urlParams.get('user'); 

    function getUserBadge(role) {
      if (!role) return ""; 
      let badge = "";
      if (role.includes("admin")) badge += `<span class="admin-badge" style="background: #ff4757; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin-left: 5px; display: inline-flex; align-items: center; vertical-align: middle; line-height: 1; font-weight: bold; height: 16px;">🛡 Dev</span>`;
      if (role.includes("verified")) badge += `<span class="verified-badge" style="margin-left:5px;"><svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:middle; display:inline-block;"><circle cx="12" cy="12" r="10" fill="#1DA1F2"/><path d="M7 12.5l3 3 7-7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
      const crowBadges = { crown1: "/asets/png/crown1.png", crown2: "/asets/png/crown2.png", crown3: "/asets/png/crown3.png" };
      Object.keys(crowBadges).forEach(key => { if (role.includes(key)) badge += `<img src="${crowBadges[key]}" style="width:18px; height:18px; margin-left:5px; vertical-align:middle; object-fit:contain; display:inline-block;" alt="${key}">`; });
      return badge;
    }

    async function loadProfile() {
        try {
            const { data: authData } = await supabaseClient.auth.getUser();
            const user = authData?.user;
            myId = user ? user.id : null; 

            const params = new URLSearchParams(window.location.search);
            const userUrl = params.get('user');      
            const usernameUrl = params.get('username'); 
            const idUrl = params.get('id');          

            let searchName = usernameUrl || userUrl;
            let searchId = idUrl;

            if (!searchName && !searchId && myId) {
                const cachedProfileStr = sessionStorage.getItem(`hh_profile_${myId}`);
                if (cachedProfileStr) {
                    searchName = JSON.parse(cachedProfileStr).username;
                } else {
                    const { data: myProf } = await supabaseClient.from('profiles').select('username').eq('id', myId).maybeSingle();
                    searchName = myProf?.username;
                }
            }

            let query = supabaseClient.from('profiles').select('id, username, bio, avatar_url, role');

            if (searchId) {
                query = query.eq('id', searchId);
            } else if (searchName) {
                query = query.eq('username', searchName);
            } else {
                query = query.eq('username', 'hiilinda'); 
            }

            const { data: profile, error } = await query.single();

            if (!profile || error) {
                document.getElementById('view-display-name').innerText = "User Tidak Ditemukan";
                return;
            }

            targetProfileId = profile.id;
            targetName = profile.username;

            document.getElementById('header-name').innerText = profile.username;
            document.getElementById('view-display-name').innerText = profile.username;
            document.getElementById('view-username').innerText = '@' + profile.username.toLowerCase();
            document.getElementById('view-bio').innerText = profile.bio || 'Belum ada bio.';
            
            if (profile.avatar_url) {
                document.getElementById('view-avatar').src = profile.avatar_url;
            } else {
                document.getElementById('view-avatar').src = '/asets/png/profile.png';
            }

            const badgeCont = document.getElementById('badge-container');
            if (badgeCont) badgeCont.innerHTML = getUserBadge(profile.role);

            initButtons(profile.id); 
            updateStats(profile.id, profile.username);
            loadPosts('foto'); 

        } catch (err) { 
            console.error("Load Error:", err); 
        }
    }

    async function updateStats(tId, tUsername) {
        try {
            const { count: fers } = await supabaseClient.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', tId);
            const { count: fing } = await supabaseClient.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', tId);
            
            const { data: myPosts } = await supabaseClient.from('posts').select('id').eq('name', tUsername); 
            let totalLikes = 0;
            if (myPosts && myPosts.length > 0) {
                const postIds = myPosts.map(p => p.id);
                const { count: lks } = await supabaseClient.from('likes').select('*', { count: 'exact', head: true }).in('post_id', postIds);
                totalLikes = lks || 0;
            }

            if (document.getElementById('stat-followers')) document.getElementById('stat-followers').innerText = fers || 0;
            if (document.getElementById('stat-following')) document.getElementById('stat-following').innerText = fing || 0;
            if (document.getElementById('stat-likes')) document.getElementById('stat-likes').innerText = totalLikes;
        } catch (err) { console.error("Error updating stats:", err); }
    }

    async function loadPosts(type) {
        const container = document.getElementById('post-container');
        if (!container) return;
        
        if (tabCache[type]) {
            renderGrid(tabCache[type], container, type);
            return;
        }

        container.innerHTML = `<div class="loading-wrapper"><div class="skeleton-loader"></div><div class="skeleton-loader"></div><div class="skeleton-loader"></div><div class="skeleton-loader"></div><div class="skeleton-loader"></div><div class="skeleton-loader"></div></div>`;
        
        try {
            let posts = [];
            
            if (type === 'foto') {
                const { data, error } = await supabaseClient.from('posts').select('id, image_url, created_at').eq('creator_id', targetProfileId).eq('status', 'approved').order('created_at', { ascending: false });
                if (error) throw error;
                posts = data || [];
            } else if (type === 'musik') {
                const { data, error } = await supabaseClient.from('songs').select('id, cover_url').eq('artist', targetName).order('id', { ascending: false }); 
                if (error) throw error;
                posts = data ? data.map(song => ({ id: song.id, image_url: song.cover_url })) : [];
            } else if (type === 'like') {
                const { data: rels, error: relError } = await supabaseClient.from('likes').select('post_id').eq('user_id', targetProfileId);
                if (relError) throw relError;
                if (rels && rels.length > 0) {
                    const postIds = rels.map(r => r.post_id).filter(id => id !== null && id !== undefined && id !== 'null' && id !== '');
                    if (postIds.length > 0) {
                        const { data: pData, error: pError } = await supabaseClient.from('posts').select('id, image_url').in('id', postIds).eq('status', 'approved'); 
                        if (pError) throw pError;
                        posts = pData || [];
                    }
                }
            }
            
            tabCache[type] = posts;
            renderGrid(posts, container, type);
            
        } catch (err) {
            console.error("Gagal memuat postingan:", err.message);
            container.innerHTML = '<div class="no-posts"><p>Gagal memuat konten.</p></div>';
        }
    }

    function renderGrid(data, container, type) {
        if (data && data.length > 0) {
            container.innerHTML = data.map(p => {
                let targetPage = (type === 'musik') ? '/music' : '/post';
                return `<div class="grid-item"><a href="${targetPage}?id=${p.id}"><img src="${p.image_url}" loading="lazy"></a></div>`;
            }).join('');
        } else {
            container.innerHTML = `<div class="no-posts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg><p>Belum ada postingan</p></div>`;
        }
    }

    async function initButtons(targetId) {
        const btnBox = document.getElementById('action-buttons');
        if (myId === targetId) {
            btnBox.innerHTML = `<button class="btn" onclick="editBio()">Edit</button><button class="btn" onclick="shareProfile()">Share</button>`;
        } else {
            if (!myId) {
                btnBox.innerHTML = `<button class="btn btn-follow" onclick="alert('Silakan login')">Ikuti</button>`;
                return;
            }
            const { data: isFollowing } = await supabaseClient.from('followers').select('id').eq('follower_id', myId).eq('following_id', targetId).maybeSingle();
            renderFollowButton(targetId, !!isFollowing);
        }
    }

    function renderFollowButton(targetId, isFollowing) {
        const btnBox = document.getElementById('action-buttons');
        btnBox.innerHTML = isFollowing 
            ? `<button class="btn" onclick="toggleFollow('${targetId}', true)">Mengikuti</button>` 
            : `<button class="btn btn-follow" onclick="toggleFollow('${targetId}', false)">Ikuti</button>`;
    }

    async function toggleFollow(tId, isCurrentlyFollowing) {
        const followerEl = document.getElementById('stat-followers');
        let currentFollowers = parseInt(followerEl.innerText) || 0;

        if (isCurrentlyFollowing) {
            renderFollowButton(tId, false);
            followerEl.innerText = Math.max(0, currentFollowers - 1);
            showToast("Berhenti mengikuti");
            await supabaseClient.from('followers').delete().eq('follower_id', myId).eq('following_id', tId);
        } else {
            renderFollowButton(tId, true);
            followerEl.innerText = currentFollowers + 1;
            showToast("Mulai mengikuti");
            const { error } = await supabaseClient.from('followers').insert([{ follower_id: myId, following_id: tId }]);
            if (!error) {
                const channel = supabaseClient.channel('user-notifications');
                channel.send({ type: 'broadcast', event: 'new-follower', payload: { targetId: tId } });
            }
        }
    }

    function switchTab(el, type) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        loadPosts(type);
    }

    function editBio() {
        const currentBio = document.getElementById('view-bio').innerText;
        document.getElementById('new-bio-input').value = (currentBio === 'Belum ada bio.' || currentBio === 'Memuat bio...') ? '' : currentBio;
        document.getElementById('bio-modal').style.display = 'flex';
    }
    
    function closeBioModal() { document.getElementById('bio-modal').style.display = 'none'; }

    async function saveBio(e) {
        const newBio = document.getElementById('new-bio-input').value;
        const btn = e.target;
        btn.disabled = true;
        try {
            const { error } = await supabaseClient.from('profiles').update({ bio: newBio }).eq('id', myId);
            if (error) throw error;
            document.getElementById('view-bio').innerText = newBio || 'Belum ada bio.';
            closeBioModal();
        } catch (err) { alert(err.message); }
        btn.disabled = false;
    }

    let currentQRCode = null;
    function closeShareModal() {
        document.getElementById('share-modal').style.display = 'none';
        if (currentQRCode) { document.getElementById('qrcode-container').innerHTML = ""; currentQRCode = null; }
    }

    function shareProfile() {
        const modal = document.getElementById('share-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        const viewAvatar = document.getElementById('view-avatar'); 
        const viewDisplayName = document.getElementById('view-display-name'); 
        const shareAvatar = document.getElementById('share-avatar'); 
        const shareHandle = document.getElementById('share-handle'); 
        if(viewAvatar && shareAvatar) shareAvatar.src = viewAvatar.src; 
        if(viewDisplayName && shareHandle) shareHandle.textContent = '@' + viewDisplayName.textContent.replace(/\s/g, '').toLowerCase(); 
        const profileUrl = window.location.href; 
        const qrcodeContainer = document.getElementById('qrcode-container');
        if (!currentQRCode) {
            qrcodeContainer.innerHTML = ""; 
            currentQRCode = new QRCode(qrcodeContainer, { text: profileUrl, width: 140, height: 140, colorDark : "#000000", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.H });
        }
    }

    function copyProfileLink() {
        navigator.clipboard.writeText(window.location.href);
        showToast("Link profil disalin!");
    }

    window.closeBioModal = closeBioModal;
    window.saveBio = saveBio;
    window.switchTab = switchTab;
    window.editBio = editBio;
    window.shareProfile = shareProfile;
    window.closeShareModal = closeShareModal;
    window.copyProfileLink = copyProfileLink;
    window.toggleFollow = toggleFollow;
    window.goBack = goBack;
    window.toggleSidebar = toggleSidebar;

    loadProfile();

    function goBack() {
        if (document.referrer !== "") window.history.back();
        else window.location.href = '/'; 
    }

    function showToast(msg) {
        let toast = document.getElementById('toast-msg');
        if (!toast) {
            toast = document.createElement('div'); toast.id = 'toast-msg'; toast.className = 'toast'; document.body.appendChild(toast);
        }
        toast.innerText = msg; toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2000);
    }

    function toggleSidebar() {
        const sidebar = document.getElementById('mySidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (!sidebar || !overlay) return;
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open'); overlay.style.opacity = '0'; setTimeout(() => { overlay.style.display = 'none'; }, 300);
        } else {
            overlay.style.display = 'block'; setTimeout(() => { overlay.style.opacity = '1'; sidebar.classList.add('open'); }, 10);
        }
    }