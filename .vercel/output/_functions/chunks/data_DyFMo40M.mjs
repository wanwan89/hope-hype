import { c as createComponent } from './astro-component_Bm-5TSlt.mjs';
import 'piccolore';
import { m as maybeRenderHead, r as renderTemplate, l as renderComponent } from './entrypoint_D7e8hfS1.mjs';
import { r as renderScript } from './script_CRtOvk9E.mjs';
import { $ as $$Layout } from './Layout_DsOADmIq.mjs';
import 'clsx';

const $$BioModaldata = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="bio-modal"> <div class="modal-content"> <h3 style="margin-top:0;">Ubah Bio</h3> <textarea id="new-bio-input"></textarea> <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:15px;"> <button onclick="closeBioModal()" style="padding:8px 16px; border:none; background:#f1f1f2; border-radius:6px; cursor:pointer;">Batal</button> <button id="save-bio-btn" onclick="saveBio(event)" style="padding:8px 16px; border:none; background:#007bff; color:#fff; border-radius:6px; cursor:pointer;">Simpan</button> </div> </div> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/profile/BioModaldata.astro", void 0);

const $$Headerdata = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="top-nav"> <div onclick="goBack()" style="cursor:pointer; font-size: 16px; font-weight: 600; padding: 5px;">Back</div> <div id="header-name" style="font-weight: bold;">Profil</div> <div onclick="toggleSidebar()" style="cursor:pointer; padding: 5px; display: flex; align-items: center;"> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="3" y1="12" x2="21" y2="12"></line> <line x1="3" y1="6" x2="21" y2="6"></line> <line x1="3" y1="18" x2="21" y2="18"></line> </svg> </div> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/profile/Headerdata.astro", void 0);

const $$ProfileInfo = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="profile-container"> <div class="avatar-box"><img id="view-avatar" src="https://via.placeholder.com/150"></div> <div class="user-meta"> <div class="u-name-wrapper"> <span class="u-name" id="view-display-name">Memuat...</span> <div id="badge-container"></div> </div> <span class="u-handle" id="view-username">@handle</span> </div> <div class="stats"> <div class="stat-item"><span class="stat-val" id="stat-following">0</span><span class="stat-lbl">Following</span></div> <div class="stat-item"><span class="stat-val" id="stat-followers">0</span><span class="stat-lbl">Followers</span></div> <div class="stat-item"><span class="stat-val" id="stat-likes">0</span><span class="stat-lbl">Likes</span></div> </div> <div class="bio-text" id="view-bio">Memuat bio...</div> <div class="btn-group" id="action-buttons"></div> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/profile/ProfileInfo.astro", void 0);

const $$ShareModaldata = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="share-modal" class="modal-overlay"> <div class="modal-content qrcode-modal"> <div class="modal-header"> <h3>Bagikan Profil</h3> <button class="close-modal-btn" style="border:none; background:none; font-size:20px; cursor:pointer;" onclick="closeShareModal()">&times;</button> </div> <div class="share-card"> <div class="avatar-box-mini"> <img id="share-avatar" src=""> </div> <p id="share-handle">@handle</p> <div id="qrcode-container"></div> <p class="share-hint">Scan kode ini untuk membuka profil saya di HopeHype</p> </div> <button class="btn" style="background:var(--primary-blue); color:#fff; width:100%;" onclick="copyProfileLink()">Salin Link Profil</button> </div> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/profile/ShareModaldata.astro", void 0);

const $$Tabsdata = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="tabs"> <div class="tab active" onclick="switchTab(this, 'foto')"> <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20H5V4H10V20ZM12 20H19V11H12V20ZM12 9H19V4H12V9Z"></path></svg> </div> <div class="tab" onclick="switchTab(this, 'musik')"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M9 18V5l12-2v13"></path> <circle cx="6" cy="18" r="3"></circle> <circle cx="18" cy="16" r="3"></circle> </svg> </div> <div class="tab" onclick="switchTab(this, 'like')"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> </div> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/profile/Tabsdata.astro", void 0);

const $$PostGriddata = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="photo-grid" id="post-container"></div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/profile/PostGriddata.astro", void 0);

const $$Sidebardata = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="sidebar-overlay" class="sidebar-overlay" onclick="toggleSidebar()"></div> <div id="mySidebar" class="sidebar"> <div class="sidebar-search-container"> <div class="sidebar-search"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a8b91" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <input type="text" placeholder="Cari"> </div> </div> <div class="menu-category-label">Aset</div> <div class="menu-item-tiktok" onclick="window.location.href='/saldo'"> <div class="icon-wrapper"> <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg> </div> <div class="menu-text">Saldo</div> <div class="arrow-right">›</div> </div> <hr style="border: 0; border-top: 1px solid #f1f1f2; margin: 10px 16px;"> <div class="menu-category-label">Alat pribadi</div> <div class="menu-item-tiktok" onclick="shareProfile(); toggleSidebar();"> <div class="icon-wrapper"> <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect></svg> </div> <div class="menu-text">Kode QR Anda</div> <div class="arrow-right">›</div> </div> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/profile/Sidebardata.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Data = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Profil - Hope Hype" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([' <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script> ', " ", " ", " ", " ", " ", " ", " ", " "])), renderComponent($$result2, "BioModal", $$BioModaldata, {}), renderComponent($$result2, "Header", $$Headerdata, {}), renderComponent($$result2, "ProfileInfo", $$ProfileInfo, {}), renderComponent($$result2, "ShareModal", $$ShareModaldata, {}), renderComponent($$result2, "Tabs", $$Tabsdata, {}), renderComponent($$result2, "PostGrid", $$PostGriddata, {}), renderComponent($$result2, "Sidebar", $$Sidebardata, {}), renderScript($$result2, "/data/data/com.termux/files/home/hope-hype/src/pages/data.astro?astro&type=script&index=0&lang.ts")) })}`;
}, "/data/data/com.termux/files/home/hope-hype/src/pages/data.astro", void 0);

const $$file = "/data/data/com.termux/files/home/hope-hype/src/pages/data.astro";
const $$url = "/data";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Data,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
