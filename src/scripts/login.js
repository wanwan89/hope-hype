
import { supabase } from '../lib/supabase.js';

    let isSignUpMode = false;

    // Elements
    const passInput = document.getElementById("password");
    const switchModeBtn = document.getElementById("switchMode");
    const roleSelect = document.getElementById("userRole");
    const creatorArea = document.getElementById("creatorCategoryArea");
    const mainForm = document.getElementById("mainForm");

    // Toggle Mata Password
    document.getElementById("togglePass").onclick = () => {
      const isPass = passInput.type === "password";
      passInput.type = isPass ? "text" : "password";
    };

    // Fungsi Toggle Login/Register
    function toggleAuthMode() {
      isSignUpMode = !isSignUpMode;
      document.getElementById("usernameArea").style.display = isSignUpMode ? "flex" : "none";
      document.getElementById("roleArea").style.display = isSignUpMode ? "flex" : "none";
      document.getElementById("termsArea").style.display = isSignUpMode ? "flex" : "none";
      document.getElementById("forgotPassLink").style.display = isSignUpMode ? "none" : "block";
      
      document.getElementById("subTitle").textContent = isSignUpMode ? "Bikin akun buat pamer karya lo" : "Login dulu buat lanjut cari hype";
      document.getElementById("submitBtn").textContent = isSignUpMode ? "Daftar Akun" : "Masuk Sekarang";
      document.getElementById("footerText").innerHTML = isSignUpMode ? "Udah punya akun? <span class='span' id='switchMode'>Login</span>" : "Belum ada akun? <span class='span' id='switchMode'>Daftar</span>";
      
      // Re-attach event listener
      document.getElementById("switchMode").onclick = toggleAuthMode;
      handleRoleChange();

      if (typeof window.turnstile !== 'undefined') window.turnstile.reset();
    }
    
    if (switchModeBtn) switchModeBtn.onclick = toggleAuthMode;

    function handleRoleChange() {
      if (creatorArea) {
        creatorArea.style.display = (isSignUpMode && roleSelect.value === "creator") ? "flex" : "none";
      }
    }
    if (roleSelect) roleSelect.onchange = handleRoleChange;

    // LUPA PASSWORD
    document.getElementById("forgotPassLink").onclick = async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      if (!email) {
        alert("Ketik email lo dulu di kolom Email!");
        return;
      }

      const captchaToken = document.querySelector('[name="cf-turnstile-response"]')?.value;
      const submitBtn = document.getElementById("submitBtn");
      submitBtn.textContent = "Mengirim link...";
      
      const { error } = await client.auth.resetPasswordForEmail(email, {
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
        const { error } = await client.auth.signInWithPassword({ 
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
        const role = roleSelect.value;
        const type = document.getElementById("creatorType").value;
        const agreed = document.getElementById("checkTerms").checked;

        if (!username) return alert("Isi username!");
        if (!agreed) return alert("Ceklis syaratnya!");

        submitBtn.textContent = "Loading...";
        let finalRole = (role === 'creator') ? `creator_${type}` : 'user';
        const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;

        const { error } = await client.auth.signUp({
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
    document.getElementById("googleBtn").onclick = async () => {
      await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + "/" }
      });
    };
