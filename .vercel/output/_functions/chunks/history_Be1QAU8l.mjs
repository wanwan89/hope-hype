import { c as createComponent } from './astro-component_XsMGnLTe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_QXYkg9oU.mjs';
import { r as renderScript } from './script_Bgh8hiDj.mjs';
import { $ as $$Layout } from './Layout_BklSxN7w.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$History = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Withdrawal History - HopeHype" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([' <link rel="stylesheet" href="/css/toast.css"> <script src="/js/toast.js"><\/script> ', '<div class="history-container"> <a href="/saldo" class="back-btn"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"> <polyline points="15 18 9 12 15 6"></polyline> </svg>\nBACK\n</a> <h2>History</h2> <span class="sub-title">Status penarikan koin terakhirmu</span> <div class="history-list" id="historyContainer"> <div class="empty-state" id="loadingText">Mengambil data...</div> </div> </div> ', " "])), maybeRenderHead(), renderScript($$result2, "/data/data/com.termux/files/home/hope-hype/src/pages/history.astro?astro&type=script&index=0&lang.ts")) })}`;
}, "/data/data/com.termux/files/home/hope-hype/src/pages/history.astro", void 0);

const $$file = "/data/data/com.termux/files/home/hope-hype/src/pages/history.astro";
const $$url = "/history";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$History,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
