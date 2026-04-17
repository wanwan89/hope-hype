import { c as createComponent } from './astro-component_Bm-5TSlt.mjs';
import 'piccolore';
import { m as maybeRenderHead, r as renderTemplate, l as renderComponent } from './entrypoint_D7e8hfS1.mjs';
import { $ as $$Layout } from './Layout_DsOADmIq.mjs';
import 'clsx';
import { r as renderScript } from './script_CRtOvk9E.mjs';

const $$Headerwd = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<a href="/saldo" class="back-btn"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"> <polyline points="15 18 9 12 15 6"></polyline> </svg>
BACK
</a> <h2>Withdrawal</h2> <span class="wd-sub-title">Tarik koinmu menjadi saldo nyata</span>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/withdraw/Headerwd.astro", void 0);

const $$InfoBoxwd = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="wd-info-box"> <p>Kurs: <b>1 Koin = Rp 70</b><br>Minimal penarikan <b>200 koin</b></p> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/withdraw/InfoBoxwd.astro", void 0);

const $$WithdrawFormwd = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="wd-form-group"> <label>Jumlah Koin</label> <input type="number" id="wdAmount" placeholder="Min. 200" min="200" oninput="updateEstimation()"> <div id="idrEstimation">Estimasi: Rp 0</div> </div> <div class="wd-form-group"> <label>Metode Pembayaran</label> <select id="wdMethod"> <option value="DANA">DANA</option> <option value="GOPAY">GOPAY</option> <option value="OVO">OVO</option> <option value="BANK_BCA">BANK BCA</option> <option value="BANK_MANDIRI">BANK MANDIRI</option> </select> </div> <div class="wd-form-group"> <label>Nama Pemilik Rekening</label> <input type="text" id="wdAccountName" placeholder="Nama sesuai ewallet/bank"> </div> <div class="wd-form-group"> <label>Nomor Rekening / HP</label> <input type="text" id="wdAccount" placeholder="08xxxx / 12345678"> </div> <button class="submit-btn" id="btnSubmit">Confirm Request</button> ${renderScript($$result, "/data/data/com.termux/files/home/hope-hype/src/components/withdraw/WithdrawFormwd.astro?astro&type=script&index=0&lang.ts")}`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/withdraw/WithdrawFormwd.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Penarikan = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Withdraw - HopeHype" }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([' <script src="/js/toast.js"><\/script> <link rel="stylesheet" href="/css/toast.css"> ', '<div class="wd-container"> ', " ", " ", " </div> "])), maybeRenderHead(), renderComponent($$result2, "Header", $$Headerwd, {}), renderComponent($$result2, "InfoBox", $$InfoBoxwd, {}), renderComponent($$result2, "WithdrawForm", $$WithdrawFormwd, {})) })}`;
}, "/data/data/com.termux/files/home/hope-hype/src/pages/penarikan.astro", void 0);

const $$file = "/data/data/com.termux/files/home/hope-hype/src/pages/penarikan.astro";
const $$url = "/penarikan";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Penarikan,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
