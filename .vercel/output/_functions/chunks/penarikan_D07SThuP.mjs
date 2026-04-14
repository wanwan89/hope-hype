import { c as createComponent } from './astro-component_XsMGnLTe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_QXYkg9oU.mjs';
import { r as renderScript } from './script_Bgh8hiDj.mjs';
import { $ as $$Layout } from './Layout_BklSxN7w.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Penarikan = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Withdraw - HopeHype" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([' <script src="/js/toast.js"><\/script> <link rel="stylesheet" href="/css/toast.css"> ', '<div class="wd-container"> <a href="/saldo" class="back-btn"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"> <polyline points="15 18 9 12 15 6"></polyline> </svg>\nBACK\n</a> <h2>Withdrawal</h2> <span class="wd-sub-title">Tarik koinmu menjadi saldo nyata</span> <div class="wd-info-box"> <p>Kurs: <b>1 Koin = Rp 70</b><br>Minimal penarikan <b>200 koin</b></p> </div> <div class="wd-form-group"> <label>Jumlah Koin</label> <input type="number" id="wdAmount" placeholder="Min. 200" min="200" oninput="updateEstimation()"> <div id="idrEstimation">Estimasi: Rp 0</div> </div> <div class="wd-form-group"> <label>Metode Pembayaran</label> <select id="wdMethod"> <option value="DANA">DANA</option> <option value="GOPAY">GOPAY</option> <option value="OVO">OVO</option> <option value="BANK_BCA">BANK BCA</option> <option value="BANK_MANDIRI">BANK MANDIRI</option> </select> </div> <div class="wd-form-group"> <label>Nama Pemilik Rekening</label> <input type="text" id="wdAccountName" placeholder="Nama sesuai ewallet/bank"> </div> <div class="wd-form-group"> <label>Nomor Rekening / HP</label> <input type="text" id="wdAccount" placeholder="08xxxx / 12345678"> </div> <button class="submit-btn" id="btnSubmit">Confirm Request</button> </div> ', " "])), maybeRenderHead(), renderScript($$result2, "/data/data/com.termux/files/home/hope-hype/src/pages/penarikan.astro?astro&type=script&index=0&lang.ts")) })}`;
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
