import { supabase } from '../lib/supabase.js';

document.addEventListener("DOMContentLoaded", () => {
    let isSignUpMode = false;

    // Elements
    const passInput = document.getElementById("password");
    const switchModeBtn = document.getElementById("switchMode");
    const roleSelect = document.getElementById("userRole");
    const creatorArea = document.getElementById("creatorCategoryArea");
    const mainForm = document.getElementById("mainForm");
    const togglePassBtn = document.getElementById("togglePass");
    const forgotPassLink = document.getElementById("forgotPassLink");
    const googleBtn = document.getElementById("googleBtn");

    if (!mainForm) return;

    // Toggle Mata Password
    if (togglePassBtn) {
        togglePassBtn.onclick = () => {
            const isPass = passInput.type === "password";
            passInput.type = isPass ? "text" : "password";
        };
    }

    // Fungsi Toggle Login/Register
    window.toggleAuthMode = function() {
        isSignUpMode = !isSignUpMode;
        document.getElementById("usernameArea").style.display = isSignUpMode ? "flex" : "none";
        document.getElementById("roleArea").style.display = isSignUpMode ? "flex" : "none";
        document.getElementById("termsArea").style.display = isSignUpMode ? "flex" : "none";
        if(forgotPassLink) forgotPassLink.style.display = isSignUpMode ? "none" : "block";
        
        document.getElementById("subTitle").textContent = isSignUpMode ? "Bikin akun buat pamer karya lo" : "Login dulu buat lanjut cari hype";
        document.getElementById("submitBtn").textContent = isSignUpMode ? "Daftar Akun" : "Masuk Sekarang";
        document.getElementById("footerText").innerHTML = isSignUpMode ? "Udah punya akun? <span class='span' id='switchMode'>Login</span>" : "Belum ada akun? <span class='span' id='switchMode'>Daftar</span>";
        
        document.getElementById("switchMode").onclick = window.toggleAuthMode;
        if (typeof window.handleRoleChange === 'function') window.handleRoleChange();

        if (typeof window.turnstile !== 'undefined') window.turnstile.reset();
    };
    
    if (switchModeBtn) switchModeBtn.onclick = window.toggleAuthMode;

    window.handleRoleChange = function() {
        if (creatorArea && roleSelect) {
            creatorArea.style.display = (isSignUpMode && roleSelect.value === "creator") ? "flex" : "none";
        }
    };
    if (roleSelect) roleSelect.onchange = window.handleRoleChange;

    // LUPA PASSWORD
    if (forgotPassLink) {
        forgotPassLink.onclick = async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            if (!email) {
                alert("Ketik email lo dulu di kolom Email!");
                return;
            }

            const captchaToken = document.querySelector('[name="cf-turnstile-response"]')?.value;
            const submitBtn = document.getElementById("submitBtn");
            submitBtn.textContent = "Mengirim link...";
            
            // 🔥 FIXED: client -> supabase
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                captchaToken: captchaToken,
                redirectTo: window.location.origin + "/reset-password"
            });

            submitBtn.textContent = "Masuk Sekarang";
            if (error) {
                alert("Gagal: " + error.message);
                if (typeof window.turnstile !== 'undefined') window.turnstile.reset();
            } else {
                alert("Berhasil! Cek email buat reset password.");
            }
        };
    }

    // FORM SUBMIT
    mainForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = passInput.value;
        const submitBtn = document.getElementById("submitBtn");
        const captchaToken = document.querySelector('[name="cf-turnstile-response"]')?.value;

        if (!captchaToken) {
            alert("Selesaikan verifikasi CAPTCHA dulu!");
            return;
        }

        if (!isSignUpMode) {
            submitBtn.textContent = "Loading...";
            
            // 🔥 FIXED: client -> supabase
            const { error } = await supabase.auth.signInWithPassword({ 
                email, password, options: { captchaToken }
            });
            
            submitBtn.textContent = "Masuk Sekarang";
            
            if (error) {
                alert("Gagal Login: " + error.message);
                if (typeof window.turnstile !== 'undefined') window.turnstile.reset();
            } else {
                window.location.href = "/";
            }
        } else {
            const username = document.getElementById("username").value;
            const role = roleSelect ? roleSelect.value : 'user';
            const typeSelect = document.getElementById("creatorType");
            const type = typeSelect ? typeSelect.value : '';
            const checkTerms = document.getElementById("checkTerms");
            const agreed = checkTerms ? checkTerms.checked : true;

            if (!username) return alert("Isi username!");
            if (!agreed) return alert("Ceklis syaratnya!");

            submitBtn.textContent = "Loading...";
            let finalRole = (role === 'creator') ? `creator_${type}` : 'user';
            const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;

            // 🔥 FIXED: client -> supabase
            const { error } = await supabase.auth.signUp({
                email, password,
                options: { 
                    captchaToken, 
                    data: { username, avatar_url: avatar, role: finalRole } 
                }
            });

            submitBtn.textContent = "Daftar Akun";
            
            if (error) {
                alert("Gagal Daftar: " + error.message);
                if (typeof window.turnstile !== 'undefined') window.turnstile.reset();
            } else {
                alert("Berhasil daftar! Cek email kamu untuk aktivasi.");
                mainForm.reset();
                if (typeof window.turnstile !== 'undefined') window.turnstile.reset();
            }
        }
    };

    // Google Login
    if (googleBtn) {
        googleBtn.onclick = async () => {
            // 🔥 FIXED: client -> supabase
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin + "/" }
            });
        };
    }

    // 🔥 JURUS PEMAKSA CAPTCHA 🔥
    // Sengaja kita panggil ini buat maksa render kalau Astro telat nge-load
    setTimeout(() => {
        if (typeof window.turnstile !== 'undefined') {
            const captchaBox = document.querySelector('.cf-turnstile');
            if (captchaBox && !captchaBox.hasChildNodes()) {
                window.turnstile.render(captchaBox, {
                    sitekey: captchaBox.getAttribute('data-sitekey')
                });
            }
        }
    }, 500);
});
