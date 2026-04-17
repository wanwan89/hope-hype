import { c as createComponent } from './astro-component_Bm-5TSlt.mjs';
import 'piccolore';
import { m as maybeRenderHead, r as renderTemplate, l as renderComponent } from './entrypoint_D7e8hfS1.mjs';
import { r as renderScript } from './script_CRtOvk9E.mjs';
import { $ as $$Layout } from './Layout_DsOADmIq.mjs';
import 'clsx';

const $$Sidebarpost = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="sidebar"> <div class="sidebar-header"> <h2 class="sidebar-logo">Menu</h2> </div> <nav class="sidebar-nav"> <a href="#" class="nav-item active" data-category="all">All</a> <a href="#" class="nav-item" data-category="karya">Karya</a> <a href="#" class="nav-item" data-category="prestasi">Prestasi</a> <a href="#" class="nav-item" data-category="photography">Photography</a> <a href="#" class="nav-item" data-category="mountain">Mountain</a> <hr class="nav-divider"> <button type="button" class="sidebar-post-btn" id="openPostModalBtn">+ Post Karya</button> </nav> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/layout/Sidebarpost.astro", void 0);

const $$SearchWrapperpost = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="search-wrapper"> <div class="menu-toggle" id="mobileMenuBtn"> <span></span> <span></span> <span></span> </div> <div class="brutal-input-container"> <input type="text" id="searchCreator" placeholder="Cari kreator..." class="brutal-input" required> </div> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/layout/SearchWrapperpost.astro", void 0);

const $$Gallerypost = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="gallery" id="mainGallery"> <div class="loading-state" style="color: white; text-align: center; grid-column: 1/-1; padding: 50px;"> <p>Memuat karya terbaru...</p> </div> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/post/Gallerypost.astro", void 0);

const $$CommentModalpost = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="commentModal"> <div class="comment-box"> <div class="comment-header">
Komentar
<button class="comment-close">×</button> </div> <div class="comment-list"></div> <div class="comment-input-wrap"> <input type="text" class="comment-input" placeholder="Tulis komentar..."> </div> </div> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/post/CommentModalpost.astro", void 0);

const $$LoginPopuppost = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="loginPopup" class="popup-overlay"> <div class="popup-content"> <span class="close-login">X</span> <h2 style="text-align: center; margin-bottom: 20px;">LOGIN DULU BRO</h2> <form class="form"> <div class="flex-column"><label>Email</label></div> <div class="inputForm"> <svg height="20" viewBox="0 0 32 32" width="20"> <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path> </svg> <input type="email" class="input" placeholder="Enter your Email" required> </div> <div class="flex-column"><label>Password</label></div> <div class="inputForm"> <svg height="20" viewBox="0 0 24 24" width="20"> <path d="M12.1 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3 9.24 3 10.91 3.81 12 5.09 13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5 22 12.28 18.6 15.36 13.55 20.04z"></path> </svg> <input type="password" class="input" placeholder="Enter your Password" required> </div> <button class="button-submit" type="submit">Sign In</button> </form> </div> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/auth/LoginPopuppost.astro", void 0);

const $$PostModal = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="postModal" class="post-modal"> <div class="post-modal-content"> <button class="post-close-btn" id="closePostModalBtn">×</button> <h2 class="post-modal-title">Upload Post</h2> <p class="post-modal-subtitle">Karya kamu akan dikirim untuk direview dulu ya</p> <form id="postForm" class="post-form"> <div class="post-upload-area" id="postUploadArea"> <input type="file" id="postImageInput" accept="image/*" hidden> <div class="post-upload-placeholder" id="postUploadPlaceholder"> <span class="post-upload-text">Pilih foto karya</span> <small>JPG, PNG, WEBP • Max 5MB</small> </div> <img id="postPreviewImage" class="post-preview-image" style="display:none;" alt="Preview karya"> </div> <textarea id="postCaption" class="post-textarea" placeholder="Tulis caption...." maxlength="300"></textarea> <div class="category-dropdown" id="categoryDropdown"> <div class="select-trigger"> <span id="selectedCategoryText">Pilih kategori</span> <i class="arrow-icon">▼</i> </div> <div class="options-container"> <div class="option-item" data-value="Karya">Karya</div> <div class="option-item" data-value="Prestasi">Prestasi</div> <div class="option-item" data-value="Photography">Photography</div> <div class="option-item" data-value="Mountain">Mountain</div> </div> <input type="hidden" id="postCategory" name="category"> </div> <button type="submit" id="submitPostBtn" class="post-submit-btn">
Kirim ke Review
</button> </form> </div> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/post/PostModal.astro", void 0);

const $$GiftSheetpost = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="giftSheet" class="gift-sheet"> <div class="gift-sheet-overlay" onclick="closeGiftSheet()"></div> <div class="gift-sheet-content"> <div class="sheet-handle"></div> <div class="gift-header"> <span>Kirim hadiah untuk mendukung kreator</span> <span class="gift-close-x" onclick="closeGiftSheet()">&times;</span> </div> <div class="gift-grid"> <div class="gift-item" data-amount="10" onclick="selectGift(this, 10, '/asets/png/gift1.png')"> <div class="gift-img-container"> <img src="/asets/png/gift1.png" class="img-gift" alt="Gift 1"> </div> <span class="gift-name">troi</span> <span class="gift-price"> <img src="/asets/svg/koin.svg" class="img-coin-inline"> 10
</span> </div> <div class="gift-item" data-amount="20" onclick="selectGift(this, 20, '/asets/png/gift2.png')"> <div class="gift-img-container"> <img src="/asets/png/gift2.png" class="img-gift" alt="Gift 2"> </div> <span class="gift-name">fox</span> <span class="gift-price"> <img src="/asets/svg/koin.svg" class="img-coin-inline"> 20
</span> </div> <div class="gift-item" data-amount="20" onclick="selectGift(this, 20, '/asets/png/gift3.png')"> <div class="gift-img-container"> <img src="/asets/png/gift3.png" class="img-gift" alt="Gift 3"> </div> <span class="gift-name">panda</span> <span class="gift-price"> <img src="/asets/svg/koin.svg" class="img-coin-inline"> 20
</span> </div> <div class="gift-item" data-amount="25" onclick="selectGift(this, 25, '/asets/png/gift4.png')"> <div class="gift-img-container"> <img src="/asets/png/gift4.png" class="img-gift" alt="Gift 4"> </div> <span class="gift-name">Rabbit</span> <span class="gift-price"> <img src="/asets/svg/koin.svg" class="img-coin-inline"> 25
</span> </div> <div class="gift-item" data-amount="100" onclick="selectGift(this, 100, '/asets/png/gift5.png')"> <div class="gift-img-container"> <img src="/asets/png/gift5.png" class="img-gift" alt="Gift 5"> </div> <span class="gift-name">Catglow</span> <span class="gift-price"> <img src="/asets/svg/koin.svg" class="img-coin-inline"> 100
</span> </div> </div> <div class="gift-footer"> <div class="user-coins-info"> <img src="/asets/svg/koin.svg" class="img-coin-footer"> <span id="giftUserCoins">0</span> <span style="color: rgba(255,255,255,0.3); margin-left: 5px;">&rsaquo;</span> </div> <button id="sendGiftBtn" class="btn-send-gift" disabled onclick="processGiftTransaction()">
Kirim
</button> </div> </div> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/post/GiftSheetpost.astro", void 0);

const $$Overlayspost = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="notif"></div> <div id="bigImageContainer" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 99999; pointer-events: auto;"> <div id="bigImageOverlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 1;" onclick="closeBigImage()"></div> <img id="bigImage" src="" style="max-width: 90vw; max-height: 90vh; position: relative; z-index: 2; border-radius: 15px; box-shadow: 0 0 20px #000;"> </div> <div id="giftAnimationContainer" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 99999;"></div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/ui/Overlayspost.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Post = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Creator Gallery - Hope POST" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([` <script>
    (function() {
      try {
        const theme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Cek localStorage, jika 'dark' atau belum ada tapi sistem HP/PC 'dark'
        if (theme === 'dark' || (!theme && prefersDark)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        // Event listener agar jika tema diganti di tab "Home", tab "Post" ikut berubah seketika
        window.addEventListener('storage', (e) => {
          if (e.key === 'theme') {
            if (e.newValue === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        });
      } catch (e) {}
    })();
  <\/script> <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"><\/script> `, " ", " ", " ", " ", " ", " ", " ", " ", " "])), renderComponent($$result2, "Sidebar", $$Sidebarpost, {}), renderComponent($$result2, "SearchWrapper", $$SearchWrapperpost, {}), renderComponent($$result2, "Gallery", $$Gallerypost, {}), renderComponent($$result2, "CommentModal", $$CommentModalpost, {}), renderComponent($$result2, "LoginPopup", $$LoginPopuppost, {}), renderComponent($$result2, "PostModal", $$PostModal, {}), renderComponent($$result2, "GiftSheet", $$GiftSheetpost, {}), renderComponent($$result2, "Overlays", $$Overlayspost, {}), renderScript($$result2, "/data/data/com.termux/files/home/hope-hype/src/pages/post.astro?astro&type=script&index=0&lang.ts")) })}`;
}, "/data/data/com.termux/files/home/hope-hype/src/pages/post.astro", void 0);

const $$file = "/data/data/com.termux/files/home/hope-hype/src/pages/post.astro";
const $$url = "/post";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Post,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
