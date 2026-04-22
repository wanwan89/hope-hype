
  import { supabase } from '../lib/supabase.js';

  // HELPER: Generate Kode Unik
  const genCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  document.addEventListener('DOMContentLoaded', async () => {
    // Referensi Element
    const btnCheck = document.getElementById('btnClaimCheckin');
    const missionCoinEl = document.getElementById('missionCoinText');
    const hopeCoinEl = document.getElementById('hopeCoinText');
    
    let visitorId = "unknown";
    let userIP = "unknown";
    let currentUser = null;
    let userProfile = null;

    // --- 1. AMBIL IDENTITAS (Sarat Keamanan) ---
    try {
      if (typeof FingerprintJS !== 'undefined') {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        visitorId = result.visitorId;
      }
      
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      userIP = ipData.ip;
    } catch (e) {
      console.warn("Fingerprint/IP gagal diambil, menggunakan fallback.");
    }

    const REWARDS = [50, 50, 100, 50, 50, 100, 300]; 
    const MISSIONS = {
      listen:  { target: 3, reward: 30, type: 'mission_listen' },
      like:    { target: 5, reward: 25, type: 'mission_like' },
      comment: { target: 3, reward: 40, type: 'mission_comment' },
      upload:  { target: 1, reward: 100, type: 'mission_upload' },
      apk:     { reward: 300, type: 'mission_apk' }
    };

    // --- FUNGSI UPDATE DATABASE AMAN ---
    async function secureUpdate(updateObj, historyObj) {
      if (!currentUser) return;
      
      try {
        // Cek duplikat device
        const { data: dupe } = await supabase.from('profiles')
          .select('id').eq('device_id', visitorId).neq('id', currentUser.id).limit(1);

        if (dupe && dupe.length > 0) {
          const overlay = document.getElementById('securityOverlay');
          if (overlay) overlay.style.display = 'flex';
          return;
        }

        const { error } = await supabase.from('profiles')
          .update({ ...updateObj, device_id: visitorId, last_ip: userIP })
          .eq('id', currentUser.id);
        
        if (error) throw error;
        
        await supabase.from('coin_history').insert({ user_id: currentUser.id, ...historyObj });
        location.reload();
      } catch (err) {
        alert("Gagal melakukan aksi: " + err.message);
      }
    }

    // --- 2. MAIN DATA LOAD ---
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (btnCheck) btnCheck.textContent = "Silakan Login";
        return;
      }
      currentUser = session.user;

      const { data: profile, error: pErr } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
      if (pErr) throw pErr;
      userProfile = profile;

      // Update Tampilan Coin & Invite Code Segera
      if (missionCoinEl) missionCoinEl.textContent = userProfile.mission_coins || 0;
      if (hopeCoinEl) hopeCoinEl.textContent = userProfile.coins || 0;
      if (document.getElementById('myInviteCode')) document.getElementById('myInviteCode').textContent = userProfile.invite_code || "...";

      // Cek Duplikat Awal
      const { data: dupeCheck } = await supabase.from('profiles')
        .select('id').eq('device_id', visitorId).neq('id', currentUser.id).limit(1);
      if (dupeCheck && dupeCheck.length > 0) {
        const overlay = document.getElementById('securityOverlay');
        if (overlay) overlay.style.display = 'flex';
        return;
      }

      // Handle Invite Code
      if (!userProfile.invite_code) {
        const newCode = genCode();
        await supabase.from('profiles').update({ invite_code: newCode }).eq('id', currentUser.id);
        userProfile.invite_code = newCode;
        if (document.getElementById('myInviteCode')) document.getElementById('myInviteCode').textContent = newCode;
      }

      // --- SETUP CHECKIN ---
      const today = new Date().toLocaleDateString('en-CA', {timeZone:'Asia/Jakarta'});
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA', {timeZone:'Asia/Jakarta'});
      let streak = userProfile.checkin_streak || 0;
      let hasDone = userProfile.last_checkin === today;

      if (!hasDone && userProfile.last_checkin !== yesterday) streak = 0;
      if (streak >= 7 && !hasDone) streak = 0;

      const container = document.getElementById('streakDaysContainer');
      if (container) {
        container.innerHTML = '';
        for (let i=0; i<7; i++) {
          let isDone = (i+1) <= streak;
          let isActive = (i+1) === (streak + 1) && !hasDone;
          container.innerHTML += `
            <div class="day-card ${isDone?'done':''} ${isActive?'active':''}">
              <span class="day-label">Hari ${i+1}</span>
              <svg class="day-coin-icon" viewBox="0 0 24 24" fill="#f59e0b"><circle cx="12" cy="12" r="10"/></svg>
              <span class="day-reward">+${REWARDS[i]}</span>
            </div>`;
        }
      }

      if (btnCheck) {
        if (hasDone) {
          btnCheck.textContent = 'Klaim Selesai';
          btnCheck.disabled = true;
        } else {
          btnCheck.textContent = 'Check-in Sekarang';
          btnCheck.onclick = async () => {
            btnCheck.disabled = true;
            btnCheck.textContent = "Memproses...";
            const newStreak = streak + 1;
            const rew = REWARDS[newStreak - 1];
            await secureUpdate(
              { mission_coins: (userProfile.mission_coins || 0) + rew, last_checkin: today, checkin_streak: newStreak },
              { type:'masuk', transaction_type:'checkin', amount:rew, description:`Hari ${newStreak}` }
            );
          };
        }
      }

      // --- setup PWA ---
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPrompt = e;
        if (!userProfile.apk_downloaded) {
          const btn = document.getElementById('btnInstallPWA');
          if (btn) btn.style.display = 'block';
        }
      });

      document.getElementById('btnInstallPWA')?.addEventListener('click', async () => {
        if (!window.deferredPrompt) return alert("Buka menu browser dan pilih 'Instal Aplikasi'.");
        window.deferredPrompt.prompt();
        const { outcome } = await window.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          await secureUpdate(
            { mission_coins: (userProfile.mission_coins + 300), apk_downloaded: true },
            { type:'masuk', transaction_type:'mission_apk', amount:300, description:'Instal PWA' }
          );
        }
      });
      if (userProfile.apk_downloaded) {
        const status = document.getElementById('pwaStatus');
        if (status) status.style.display = 'block';
      }

      // --- setup DAILY MISSION ---
      const iso = new Date(); iso.setHours(0,0,0,0);
      const { count: lk } = await supabase.from('likes').select('*',{count:'exact', head:true}).eq('user_id', currentUser.id).gte('created_at', iso.toISOString());
      const { count: cm } = await supabase.from('comments').select('*',{count:'exact', head:true}).eq('user_id', currentUser.id).gte('created_at', iso.toISOString());
      const { count: up } = await supabase.from('posts').select('*',{count:'exact', head:true}).eq('creator_id', currentUser.id).gte('created_at', iso.toISOString());
      const ls = parseInt(localStorage.getItem('hh_daily_listens') || '0');
      const { data: clm } = await supabase.from('coin_history').select('transaction_type').eq('user_id', currentUser.id).gte('created_at', iso.toISOString());
      const doneList = clm ? clm.map(c => c.transaction_type) : [];

      const setupM = (k, cur, tag) => {
        const fill = document.getElementById(`progFill${tag}`);
        const txt = document.getElementById(`progText${tag}`);
        const b = document.getElementById(`btn${tag}`);
        if (!fill || !b) return;

        const c = MISSIONS[k];
        const v = Math.min(cur, c.target);
        fill.style.width = `${(v/c.target)*100}%`; txt.textContent = `${v}/${c.target}`;
        if(doneList.includes(c.type)) { b.textContent = 'Selesai'; b.className = 'm-btn btn-done'; b.onclick = null; }
        else if(v >= c.target) {
          b.textContent = 'Klaim'; b.className = 'm-btn btn-klaim';
          b.onclick = async () => {
            b.disabled = true;
            await secureUpdate({ mission_coins: (userProfile.mission_coins + c.reward) }, { type:'masuk', transaction_type:c.type, amount:c.reward, description:'Klaim Harian' });
          };
        }
      };
      setupM('listen', ls, 'Listen'); setupM('like', lk||0, 'Like'); setupM('comment', cm||0, 'Comment'); setupM('upload', up||0, 'Upload');

      // --- referral & exchange ---
      const btnInvite = document.getElementById('btnInviteCode');
      if (userProfile.referred_by) {
        const cont = document.getElementById('inviteCodeContainer');
        if (cont) cont.innerHTML = `<div class="m-info"><h4 class="m-title" style="color:#10b981;">Referral Selesai</h4></div>`;
      } else if (btnInvite) {
        btnInvite.onclick = async () => {
          const val = document.getElementById('inviteInputCode').value.trim().toUpperCase();
          if (val === userProfile.invite_code) return alert("Gunakan kode teman.");
          const { data: f } = await supabase.from('profiles').select('id, mission_coins').eq('invite_code', val).single();
          if (!f) return alert("Kode tidak ditemukan.");
          
          btnInvite.disabled = true;
          // Update dual
          const { error } = await supabase.from('profiles').update({ referred_by: val, mission_coins: (userProfile.mission_coins + 200), device_id: visitorId }).eq('id', currentUser.id);
          if (!error) {
             await supabase.from('profiles').update({ mission_coins: (f.mission_coins + 500) }).eq('id', f.id);
             await supabase.from('coin_history').insert([{ user_id:currentUser.id, type:'masuk', transaction_type:'referral', amount:200, description:'Pakai kode' }, { user_id:f.id, type:'masuk', amount:500, description: 'Teman pakai kodemu' }]);
             location.reload();
          }
        };
      }

      document.getElementById('btnExchange').onclick = async () => {
        if (userProfile.mission_coins < 1000) return alert("Koin tidak cukup.");
        if (!confirm("Tukar 1000 Misi ke 10 Hope?")) return;
        await secureUpdate(
          { mission_coins: userProfile.mission_coins - 1000, coins: (userProfile.coins || 0) + 10 },
          { type:'masuk', transaction_type:'exchange', amount:10, description: 'Tukar koin' }
        );
      };

      document.getElementById('btnShareLink').onclick = () => {
        const link = `${window.location.origin}/dailycek?ref=${userProfile.invite_code}`;
        if(navigator.share) navigator.share({ title:'HopeHype', text:'Join pakai kodemu!', url:link });
        else { navigator.clipboard.writeText(link); alert("Link disalin!"); }
      };

    } catch (err) {
      console.error("Critical Load Error:", err);
      if (btnCheck) btnCheck.textContent = "Error Memuat Data";
    }
  });
