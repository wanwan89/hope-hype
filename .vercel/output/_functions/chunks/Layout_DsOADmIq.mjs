import { c as createComponent } from './astro-component_Bm-5TSlt.mjs';
import 'piccolore';
import { r as renderTemplate, o as renderSlot, p as renderHead, m as maybeRenderHead } from './entrypoint_D7e8hfS1.mjs';
import 'clsx';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="id"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>', `</title><link rel="manifest" href="/manifest.json"><link rel="apple-touch-icon" href="/asets/png/book.png"><link rel="icon" type="image/png" href="/asets/png/book.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"><link rel="preload" as="style" href="https://fonts.googleapis.com/icon?family=Material+Icons"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" media="print" onload="this.media='all'"><link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" media="print" onload="this.media='all'">`, `<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"></noscript><script defer src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script><script defer src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="SB-Mid-client-G2wOVrrTwcffYhkC"><\/script><script defer src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"><\/script><script defer src="https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"><\/script><script defer src="https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js"><\/script><script>
    window.pwaPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.pwaPrompt = e;
    });
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(err => console.error(err));
      });
    }
  <\/script>`, "</head> <body> ", " </body></html>"])), title, maybeRenderHead(), renderHead(), renderSlot($$result, $$slots["default"]));
}, "/data/data/com.termux/files/home/hope-hype/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
