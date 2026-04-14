import { c as createComponent } from './astro-component_XsMGnLTe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_QXYkg9oU.mjs';
import { r as renderScript } from './script_Bgh8hiDj.mjs';
import { $ as $$Layout } from './Layout_BklSxN7w.mjs';

const $$Saldo = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Wallet - HopeHype" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="wallet-wrapper"> <div class="header"> <div class="back-link" onclick="window.location.href='/'"> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"> <polyline points="15 18 9 12 15 6"></polyline> </svg>
BACK
</div> <div class="status-indicator"> <div class="dot"></div>
HOPE PAYMENT
</div> </div> <div class="balance-section"> <span class="label-small">Estimated IDR Balance</span> <h1 class="main-balance" id="idrDisplay">Rp 0</h1> <div class="accent-line"></div> </div> <div class="assets-grid"> <div class="asset-box"> <span class="label-small">Coins</span> <span class="asset-val" id="coinDisplay">0</span> </div> <div class="asset-box"> <span class="label-small">Coupons</span> <span class="asset-val">0</span> </div> </div> <div class="menu-row" onclick="window.location.href='/history'"> <div> <span class="menu-title">Transactions</span> <span class="menu-sub" id="lastTrx">Cek riwayat koin & transaksi</span> </div> <div class="arrow-blue">›</div> </div> <div class="services-area"> <span class="label-small">Syarat & ketentuan</span> <div class="services-list"> <div class="service-item"><div class="square-icon"></div>MONETIZE</div> <div class="service-item"><div class="square-icon"></div>REWARDS</div> <div class="service-item"><div class="square-icon"></div>ADS</div> </div> </div> <div class="withdraw-btn"> <button class="btn-blue" onclick="location.href='/penarikan'">Request Withdrawal</button> </div> </div> ${renderScript($$result2, "/data/data/com.termux/files/home/hope-hype/src/pages/saldo.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/data/data/com.termux/files/home/hope-hype/src/pages/saldo.astro", void 0);

const $$file = "/data/data/com.termux/files/home/hope-hype/src/pages/saldo.astro";
const $$url = "/saldo";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Saldo,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
