import { c as createComponent } from './astro-component_Bm-5TSlt.mjs';
import 'piccolore';
import { r as renderTemplate, m as maybeRenderHead, l as renderComponent } from './entrypoint_D7e8hfS1.mjs';
import { r as renderScript } from './script_CRtOvk9E.mjs';
import { $ as $$Layout } from './Layout_DsOADmIq.mjs';
import 'clsx';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$SkeletonLoader = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(["", `<div id="skeleton-screen"> <div class="skeleton-main-card-ui"> <div class="skel-header"> <div style="display: flex; align-items: center;"> <div class="skel-avatar shim"></div> <div class="skel-username shim"></div> </div> <div style="width: 30px; height: 30px; border-radius: 50%;" class="shim"></div> </div> <div class="skel-grid"> <div class="skel-main-card shim"></div> <div class="skel-main-card shim"></div> </div> <div style="display: flex; justify-content: space-between; gap: 10px;"> <div style="width: 100px; height: 34px; border-radius: 12px;" class="shim"></div> <div style="width: 80px; height: 34px; border-radius: 12px;" class="shim"></div> </div> <div class="skel-bar shim"></div> <div class="skel-bar shim"></div> </div> </div>  <script>
  // Fungsi darurat buat ngilangin skeleton
  function removeSkeleton() {
    const skel = document.getElementById('skeleton-screen');
    const container = document.querySelector('.container');
    
    if (skel) {
      skel.style.opacity = '0';
      skel.style.visibility = 'hidden';
      setTimeout(() => {
        skel.remove(); // Hapus dari layar
        if (container) container.style.display = 'block'; // Munculin menu utama
      }, 500);
    }
  }

  // 1. Ilangin pas semua data keload
  window.addEventListener('load', removeSkeleton);

  // 2. Safety Net: Kalau 5 detik nggak ilang juga (misal JS error), paksa ilang!
  setTimeout(removeSkeleton, 5000);
<\/script>`])), maybeRenderHead());
}, "/data/data/com.termux/files/home/hope-hype/src/components/SkeletonLoader.astro", void 0);

const $$AdBanner = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$AdBanner;
  return renderTemplate`${maybeRenderHead()}<div class="ad-banner-container"> <div class="ad-slider"> <video autoplay loop muted playsinline class="ad-slide" decoding="async"> <source src="/asets/gif/iklan1.webm" type="video/webm"> </video> <video autoplay loop muted playsinline class="ad-slide" decoding="async"> <source src="/asets/gif/iklan2.webm" type="video/webm"> </video> <video autoplay loop muted playsinline class="ad-slide" decoding="async"> <source src="/asets/gif/iklan3.webm" type="video/webm"> </video> <video autoplay loop muted playsinline class="ad-slide" id="installPwaAd" decoding="async" style="cursor: pointer;"> <source src="/asets/gif/iklan4.webm" type="video/webm"> </video> </div> </div> ${renderScript($$result, "/data/data/com.termux/files/home/hope-hype/src/components/AdBanner.astro?astro&type=script&index=0&lang.ts")}`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/AdBanner.astro", void 0);

const $$Header = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header> <div class="user-profile"> <img class="profile-avatar" id="avatar" src="/asets/png/profile.webp" alt="User"> <span class="username" id="username">Guest</span> <div class="avatar-menu" id="avatarMenu"> <button id="profileBtn" onclick="window.location.href='/data'">Profil</button> <button id="settingsBtn">Settings</button> <button id="logoutBtn">Logout</button> </div> </div> <h1 class="logo-wrapper"> <span class="logo-flip"></span> </h1> <div class="header-actions"> <div class="notif-wrapper top-notif" id="notifBell"> <span class="material-icons notification-icon">notifications</span> <span class="notif-dot" id="notifCount" style="display:none;">0</span> </div> <label class="switch" for="dark-mode-checkbox"> <span class="sr-only" style="display:none;">Dark mode</span> <input type="checkbox" id="dark-mode-checkbox" class="toggle toggle-dark"> <span class="slider"></span> </label> </div> </header>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/Header.astro", void 0);

const $$MenuCards = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="job-types"> <div class="job-card karya-card"> <div class="job-card-text"> <a href="/post" class="button" id="artButton"> <div class="bgContainer"> <span>Hope</span> <span>POST</span> </div> <div class="arrowContainer"> <svg width="25" height="25" viewBox="0 0 45 38" fill="none"> <path d="M43.7678 20.7678C44.7441 19.7915 44.7441 18.2085 43.7678 17.2322L27.8579 1.32233C26.8816 0.34602 25.2986 0.34602 24.3223 1.32233C23.346 2.29864 23.346 3.88155 24.3223 4.85786L38.4645 19L24.3223 33.1421C23.346 34.1184 23.346 35.7014 24.3223 36.6777C25.2986 37.654 26.8816 37.654 27.8579 36.6777L43.7678 20.7678ZM0 21.5L42 21.5V16.5L0 16.5L0 21.5Z" fill="black"></path> </svg> </div> </a> </div> </div> <div class="job-card music-card"> <div class="job-card-text"> <a href="/music" class="button"> <div class="bgContainer"> <span>Hope</span> <span>SONG</span> </div> <div class="arrowContainer"> <svg width="25" height="25" viewBox="0 0 45 38" fill="none"> <path d="M43.7678 20.7678C44.7441 19.7915 44.7441 18.2085 43.7678 17.2322L27.8579 1.32233C26.8816 0.34602 25.2986 0.34602 24.3223 1.32233C23.346 2.29864 23.346 3.88155 24.3223 4.85786L38.4645 19L24.3223 33.1421C23.346 34.1184 23.346 35.7014 24.3223 36.6777C25.2986 37.654 26.8816 37.654 27.8579 36.6777L43.7678 20.7678ZM0 21.5L42 21.5V16.5L0 16.5L0 21.5Z" fill="black"></path> </svg> </div> </a> </div> </div> </div> <div class="section-header pro-section-header"> <button class="coin-mini-header-btn" id="topupKoinBtn"> <div class="coin-mini-header-left"> <img src="/asets/svg/koin.svg" alt="Koin" class="coin-mini-header-icon" loading="lazy"> <span class="coin-mini-header-amount" id="coinAmount">0</span> </div> <span class="coin-mini-header-plus">+</span> </button> <button class="button-pro section-pro-btn" id="buyVerified"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24" style="width: 20px; fill: #f09f33;"> <path d="m18 0 8 12 10-8-4 20H4L0 4l10 8 8-12z"></path> </svg> <span style="color: white; font-weight: bold; font-size: 12px;">PRO</span> </button> </div> <a href="/chat" class="recent-card zodiac-card" id="hopeTalkBox"> <div class="logo zodiac-logo" style="display: flex; align-items: center; justify-content: center;"> <img src="/asets/png/zodiac.webp" alt="Zodiac Logo" loading="lazy" decoding="async" style="width: 42px; height: 42px; border-radius: 10px; object-fit: cover; display: block;"> </div> <div class="details"> <h4>Talkhype</h4> </div> <span id="hopeTalkBadge" class="chat-badge" style="display:none;">0</span> </a> <a href="/lobby" class="recent-card sawer-link"> <div class="logo saweria-logo" style="display: flex; align-items: center; justify-content: center;"> <img src="/asets/png/saweria.webp" alt="Saweria" loading="lazy" decoding="async" style="width: 42px; height: 42px; border-radius: 10px; object-fit: cover; display: block;"> </div> <div class="details"> <h4>Voicehype</h4> </div> </a> ${renderScript($$result, "/data/data/com.termux/files/home/hope-hype/src/components/MenuCards.astro?astro&type=script&index=0&lang.ts")}`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/MenuCards.astro", void 0);

const $$Modals = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="settingsModal" class="modal"> <div class="modal-content"> <span id="closeSettings">X</span> <input id="newUsername" placeholder="New username"> <div id="avatarOptions"> <img class="avatar-choice" src="/asets/png/avatar1.png"> <img class="avatar-choice" src="/asets/png/avatar2.png"> <img class="avatar-choice" src="/asets/png/avatar3.png"> <img class="avatar-choice" src="/asets/png/avatar4.png"> </div> <label for="avatarUpload" style="cursor:pointer; display:block; margin:10px 0; color:#fff;">
Upload Avatar
</label> <label for="avatarUpload" class="upload-avatar-label"> <img id="avatarPreview" src="/asets/png/up.png" alt="Avatar"> </label> <input type="file" id="avatarUpload" accept="image/*" style="display:none;"> <button id="saveSettings">Save</button> </div> </div> <div id="vip-bottom-sheet" class="bottom-sheet"> <div class="sheet-overlay"></div> <div class="sheet-content"> <div class="drag-handle"></div> <h3>Pilih Paket Badge VIP</h3> <div class="product-list"> <div class="product-card" data-price="30000" data-role="verified"> <div class="product-info-wrapper"> <div class="product-icon"> <svg width="24" height="24" viewBox="0 0 24 24" style="vertical-align:middle;"> <circle cx="12" cy="12" r="10" fill="#1DA1F2"></circle> <path d="M7 12.5l3 3 7-7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </svg> </div> <div class="product-text"> <span class="p-name">Verified Badge</span> <span class="p-price">Rp 30.000/Bulan</span> </div> </div> <button class="buy-now-btn">Beli</button> </div> <div class="product-card" data-price="14999" data-role="crown1"> <div class="product-info-wrapper"> <div class="product-icon"> <img src="/asets/png/crown1.png" alt="Bronze" class="crown-img"> </div> <div class="product-text"> <span class="p-name">Crown Bronze</span> <span class="p-price">Rp 14.999/Bulan</span> </div> </div> <button class="buy-now-btn">Beli</button> </div> <div class="product-card" data-price="20000" data-role="crown2"> <div class="product-info-wrapper"> <div class="product-icon"> <img src="/asets/png/crown2.png" alt="Silver" class="crown-img"> </div> <div class="product-text"> <span class="p-name">Crown Silver</span> <span class="p-price">Rp 20.000/Bulan</span> </div> </div> <button class="buy-now-btn">Beli</button> </div> <div class="product-card gold-card" data-price="49999" data-role="crown3"> <div class="product-info-wrapper"> <div class="product-icon"> <img src="/asets/png/crown3.png" alt="Gold" class="crown-img"> </div> <div class="product-text"> <span class="p-name">Crown Gold</span> <span class="p-price">Rp 49.999/Bulan</span> </div> </div> <button class="buy-now-btn">Beli</button> </div> </div> </div> </div> <div id="coin-bottom-sheet" class="bottom-sheet"> <div class="sheet-overlay coin-sheet-overlay"></div> <div class="sheet-content coin-sheet-content"> <div class="drag-handle"></div> <h3>Top Up Koin</h3> <div class="product-list"> <div class="product-card coin-product-card" data-price="10000" data-coins="100"> <div class="product-info-wrapper"> <div class="product-icon"> <img src="/asets/svg/koin.svg" alt="Koin" class="crown-img"> </div> <div class="product-text"> <span class="p-name">100 Koin</span> <span class="p-price">Rp 10.000</span> </div> </div> <button class="buy-coin-btn">Beli</button> </div> <div class="product-card coin-product-card" data-price="25000" data-coins="300"> <div class="product-info-wrapper"> <div class="product-icon"> <img src="/asets/svg/koin.svg" alt="Koin" class="crown-img"> </div> <div class="product-text"> <span class="p-name">300 Koin</span> <span class="p-price">Rp 25.000</span> </div> </div> <button class="buy-coin-btn">Beli</button> </div> <div class="product-card coin-product-card" data-price="50000" data-coins="700"> <div class="product-info-wrapper"> <div class="product-icon"> <img src="/asets/svg/koin.svg" alt="Koin" class="crown-img"> </div> <div class="product-text"> <span class="p-name">700 Koin</span> <span class="p-price">Rp 50.000</span> </div> </div> <button class="buy-coin-btn">Beli</button> </div> </div> <div class="topup-ad-container"> <img src="/asets/png/topup.webp" alt="Promo Top Up" class="topup-ad-img"> </div> <div class="custom-topup"> <h4>Custom Top Up</h4> <input type="number" id="custom-coins" placeholder="Masukkan jumlah koin" min="1"> <button id="buy-custom-coin-btn">Beli</button> <p id="custom-price-display"></p> </div> </div> </div> ${renderScript($$result, "/data/data/com.termux/files/home/hope-hype/src/components/Modals.astro?astro&type=script&index=0&lang.ts")}`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/Modals.astro", void 0);

const $$Contact = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="contact-wrapper"> <input type="checkbox" id="contact-toggle" style="display: none;"> <label for="contact-toggle" class="contact-text">Contact us</label> <div class="social-icons-container"> <a href="https://www.tiktok.com/@hopehypeoffcial" target="_blank" rel="noopener noreferrer"> <img src="/asets/png/tiktok.webp" width="24" height="24" class="social-icon" alt="TikTok"> </a> <a href="https://www.instagram.com/hopehypeofficial" target="_blank" rel="noopener noreferrer"> <img src="/asets/png/instagram.png" width="24" height="24" alt="Instagram" class="social-icon"> </a> <a href="mailto:hopeofficial2811@gmail.com"> <img src="/asets/png/mail.webp" width="24" height="24" alt="Email" class="social-icon"> </a> </div> </div> <ul id="notifList" style="display: none; list-style: none; margin: 0; padding: 0;"></ul>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/Contact.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "HelloHope-web" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main> ${renderComponent($$result2, "SkeletonLoader", $$SkeletonLoader, {})} ${renderComponent($$result2, "AdBanner", $$AdBanner, {})} <div class="loader"></div> <div class="grid-bg"></div> <div class="container" style="display: none;"> ${renderComponent($$result2, "Header", $$Header, {})} ${renderComponent($$result2, "MenuCards", $$MenuCards, {})} </div> ${renderComponent($$result2, "Modals", $$Modals, {})} ${renderComponent($$result2, "Contact", $$Contact, {})} ${renderScript($$result2, "/data/data/com.termux/files/home/hope-hype/src/pages/index.astro?astro&type=script&index=0&lang.ts")} </main> ` })}`;
}, "/data/data/com.termux/files/home/hope-hype/src/pages/index.astro", void 0);

const $$file = "/data/data/com.termux/files/home/hope-hype/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
