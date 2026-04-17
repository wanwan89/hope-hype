import { c as createComponent } from './astro-component_Bm-5TSlt.mjs';
import 'piccolore';
import { m as maybeRenderHead, r as renderTemplate, l as renderComponent } from './entrypoint_D7e8hfS1.mjs';
import { r as renderScript } from './script_CRtOvk9E.mjs';
import { $ as $$Layout } from './Layout_DsOADmIq.mjs';
import 'clsx';

const $$Headerlog = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="form-header"> <h1>HopeHype</h1> <p id="subTitle">Login dulu buat lanjut cari hype</p> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/auth/Headerlog.astro", void 0);

const $$FormInputslog = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="flex-column" id="usernameArea" style="display:none;"> <label>Username</label> <div class="inputForm"> <svg width="18" height="18" fill="#9ca3af" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg> <input id="username" placeholder="Nickname lo" class="input" type="text"> </div> </div> <div class="flex-column" id="roleArea" style="display:none;"> <label>Gue Mau Jadi</label> <div class="inputForm"> <svg width="18" height="18" fill="#9ca3af" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg> <select id="userRole" class="role-select"> <option value="user">User Biasa</option> <option value="creator">Kreator HopeHype</option> </select> </div> </div> <div class="flex-column" id="creatorCategoryArea" style="display:none;"> <label>Jenis Karya</label> <div class="inputForm"> <svg width="18" height="18" fill="#9ca3af" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path></svg> <select id="creatorType" class="role-select"> <option value="post">Kreator Post (Visual/Teks)</option> <option value="singer">Kreator Music (Singer/Audio)</option> </select> </div> </div> <div class="flex-column"> <label>Email</label> <div class="inputForm"> <svg width="18" height="18" fill="#9ca3af" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path></svg> <input id="email" placeholder="email@lo.com" class="input" type="email" required> </div> </div> <div class="flex-column"> <label>Password</label> <div class="inputForm"> <svg width="18" height="18" fill="#9ca3af" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"></path></svg> <input id="password" placeholder="Min. 6 Karakter" class="input" type="password" required> <div class="toggle-pass" id="togglePass"> <svg id="eyeIcon" width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg> </div> </div> <a href="#" id="forgotPassLink" class="forgot-pass">Lupa Password?</a> </div> <div class="flex-column" id="captchaArea" style="align-items:center; margin-top: 5px;"> <div class="cf-turnstile" data-sitekey="0x4AAAAAAC8RAExeHvAJu5Xt" data-theme="light"></div> </div>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/auth/FormInputslog.astro", void 0);

const $$FormActionslog = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="terms-area" id="termsArea" style="display:none;"> <input type="checkbox" id="checkTerms"> <label for="checkTerms">saya setuju <a href="/temp" target="_blank">Syarat dan ketentuan</a> HopeHype.</label> </div> <button type="submit" class="button-submit" id="submitBtn">Masuk Sekarang</button> <p class="p-footer" id="footerText">Belum ada akun? <span class="span" id="switchMode">Daftar</span></p>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/auth/FormActionslog.astro", void 0);

const $$SocialLoginlog = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="divider">Atau lewat</div> <button type="button" class="btn-google" id="googleBtn"> <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
Google
</button>`;
}, "/data/data/com.termux/files/home/hope-hype/src/components/auth/SocialLoginlog.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Welcome to HopeHype - Login" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([' <link rel="stylesheet" href="/css/toast.css"> <script src="/js/toast.js"><\/script> <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer><\/script> ', '<div class="login-wrapper"> <form class="form" id="mainForm"> ', " ", " ", " ", " </form> </div> ", " "])), maybeRenderHead(), renderComponent($$result2, "Header", $$Headerlog, {}), renderComponent($$result2, "FormInputs", $$FormInputslog, {}), renderComponent($$result2, "FormActions", $$FormActionslog, {}), renderComponent($$result2, "SocialLogin", $$SocialLoginlog, {}), renderScript($$result2, "/data/data/com.termux/files/home/hope-hype/src/pages/login.astro?astro&type=script&index=0&lang.ts")) })}`;
}, "/data/data/com.termux/files/home/hope-hype/src/pages/login.astro", void 0);

const $$file = "/data/data/com.termux/files/home/hope-hype/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
