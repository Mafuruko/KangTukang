/* ============================================================
   KangTukang — UI HELPERS (desain v2: halus & minimalis)
   ============================================================ */

/* Membuat elemen secara deklaratif */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function")
      el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "dataset") Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(c));
  }
  return el;
}

export function fmtRp(n) {
  return "Rp" + Number(n).toLocaleString("id-ID");
}

export function fmtRange(est) {
  if (!est) return "Harga via konsultasi";
  if (est.min === est.max) return fmtRp(est.min);
  return `${fmtRp(est.min)} – ${fmtRp(est.max)}`;
}

/* Ikon garis halus (24px, gaya feather) */
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.8"/>',
  tag: '<path d="M20.6 13.4 11 3.8H4v7l9.6 9.6a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8Z"/><circle cx="7.5" cy="7.3" r="1.3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c1.4-3.8 4.5-5.7 7.5-5.7s6.1 1.9 7.5 5.7"/>',
  wallet: '<rect x="2.5" y="6" width="19" height="14" rx="3"/><path d="M16.5 13h.01"/><path d="M2.5 10h19"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M18 8.5a6 6 0 0 0-12 0c0 6.5-2.5 8-2.5 8h17S18 15 18 8.5"/><path d="M13.7 20.5a2 2 0 0 1-3.4 0"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  star: '<path d="m12 2.5 2.9 5.9 6.6 1-4.7 4.6 1.1 6.5L12 17.4l-5.9 3.1 1.1-6.5L2.5 9.4l6.6-1Z"/>',
  pin: '<path d="M20 10.2c0 5.7-8 11.3-8 11.3s-8-5.6-8-11.3a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.8"/>',
  crosshair: '<circle cx="12" cy="12" r="7.5"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/>',
  phone: '<path d="M22 16.9v2.6a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.5 4.2 2 2 0 0 1 4.5 2h2.6a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 5.9 5.9l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>',
  chat: '<path d="M21 14.5a2 2 0 0 1-2 2H7.5L3 20.5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
  camera: '<path d="M22 8.5a2 2 0 0 0-2-2h-2.6L15.5 4h-7L6.6 6.5H4a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"/><circle cx="12" cy="13" r="3.6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  logout: '<path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  shield: '<path d="M12 22s8-3.5 8-10V5.5L12 2.5l-8 3V12c0 6.5 8 10 8 10Z"/><path d="m8.8 11.8 2.3 2.3 4.2-4.2"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.3 9a2.8 2.8 0 0 1 5.4.9c0 1.8-2.7 2.3-2.7 3.8"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  check: '<path d="M20 6 9 17l-4-4"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-8 8L7 20a2.1 2.1 0 0 1-3-3l6.5-6.5a6 6 0 0 1 8-8Z"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14h1v1h-1zM14 20h1v1h-1zM18 18h3v3h-3z"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M5.5 9.5h.01M18.5 14.5h.01"/>',
  snow: '<path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11"/><path d="m9.5 3.8 2.5 2 2.5-2M9.5 20.2l2.5-2 2.5 2"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  droplet: '<path d="M12 2.7s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 9.7 12 2.7 12 2.7Z"/>',
  sparkle: '<path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9Z"/><path d="m18.5 15.5.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9Z"/>',
  roller: '<rect x="3" y="3.5" width="13" height="5" rx="1.2"/><path d="M16 5.5h4.5V11H11v3"/><rect x="10" y="14" width="2.5" height="7" rx="1"/>',
  plug: '<path d="M9 2.5V8M15 2.5V8"/><path d="M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0Z"/><path d="M12 17v4.5"/>',
  box: '<path d="m12 2.5 9 5v9l-9 5-9-5v-9Z"/><path d="m3 7.5 9 5 9-5"/><path d="M12 12.5v9"/>',
  leaf: '<path d="M11 20A8 8 0 0 0 21 4c-7 0-13 4-14 12"/><path d="M3 21c2-5 6-9 12-11"/>',
  video: '<rect x="1.5" y="6" width="14" height="12" rx="2"/><path d="m22.5 8-7 4 7 4Z"/>',
  truck: '<rect x="1.5" y="5.5" width="13" height="11"/><path d="M14.5 9.5h4l3 3v4h-7"/><circle cx="6" cy="18.5" r="2"/><circle cx="17.5" cy="18.5" r="2"/>',
};

export function icon(name, cls = "") {
  const span = document.createElement("span");
  span.className = "icon " + cls;
  span.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.wrench}</svg>`;
  return span;
}

/* Kerangka layar app */
export function screen({ title, back, content, bottom, headerExtra, nav, cls = "" }) {
  const root = h("div", { class: "screen " + cls });
  if (title !== null && title !== undefined) {
    root.append(
      h(
        "header",
        { class: "app-header" },
        back
          ? h("button", { class: "icon-btn", "aria-label": "Kembali", onClick: () => (location.hash = back) }, icon("back"))
          : h("span", { class: "icon-btn placeholder" }),
        h("span", { class: "app-header-title" }, title || ""),
        headerExtra || h("span", { class: "icon-btn placeholder" })
      )
    );
  }
  root.append(h("main", { class: "screen-body" }, content));
  if (bottom) root.append(h("div", { class: "bottom-bar" }, bottom));
  if (nav) root.append(bottomNav(nav));
  return root;
}

/* Bottom navigation (tab utama) */
export function bottomNav(active) {
  const tabs = [
    { id: "home", label: "Beranda", icon: "home", hash: "#/home" },
    { id: "activity", label: "Aktivitas", icon: "clock", hash: "#/activity" },
    { id: "promo", label: "Promo", icon: "tag", hash: "#/promo" },
    { id: "messages", label: "Pesan", icon: "chat", hash: "#/messages" },
  ];
  return h(
    "nav",
    { class: "bottom-nav" },
    tabs.map((t) =>
      h(
        "button",
        {
          class: "nav-item" + (t.id === active ? " active" : ""),
          type: "button",
          onClick: () => (location.hash = t.hash),
        },
        icon(t.icon),
        h("span", {}, t.label)
      )
    )
  );
}

export function mount(el) {
  const app = document.getElementById("app");
  app.replaceChildren(el);
  requestAnimationFrame(() => el.classList.add("screen-ready"));
  app.scrollTop = 0;
  window.scrollTo(0, 0);
}

let toastTimer = null;
export function toast(msg) {
  const rootEl = document.getElementById("toast-root");
  rootEl.replaceChildren(h("div", { class: "toast" }, msg));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => rootEl.replaceChildren(), 2400);
}

export function btn(label, { onClick, variant = "primary", full = true, small = false, id } = {}) {
  return h(
    "button",
    {
      class: `app-btn app-btn-${variant}${full ? " full" : ""}${small ? " small" : ""}`,
      type: "button",
      id,
      onClick,
    },
    label
  );
}

export function stars(rating) {
  return h(
    "span",
    { class: "stars", "aria-label": `Rating ${rating}` },
    icon("star", "star-ic"),
    " " + Number(rating).toFixed(1)
  );
}

/* Avatar foto dengan fallback inisial (jika gambar gagal dimuat / offline) */
export function photoAvatar(person, cls = "") {
  const name = person.name || "?";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const wrap = h("span", { class: "p-avatar " + cls });
  if (person.photo) {
    const img = h("img", { src: person.photo, alt: name, loading: "lazy" });
    img.addEventListener("error", () => {
      wrap.replaceChildren(h("span", { class: "p-avatar-fallback" }, initials));
    });
    wrap.append(img);
  } else {
    wrap.append(h("span", { class: "p-avatar-fallback" }, initials));
  }
  return wrap;
}

/* Registry timer agar interval/timeout dibersihkan saat pindah layar */
const timers = new Set();
export function addTimer(id) {
  timers.add(id);
  return id;
}
export function clearTimers() {
  for (const t of timers) {
    clearTimeout(t);
    clearInterval(t);
  }
  timers.clear();
}

/* Registry pembersih layar (mis. destroy peta Leaflet) */
const cleanups = new Set();
export function addCleanup(fn) {
  cleanups.add(fn);
}
export function runCleanups() {
  for (const fn of cleanups) {
    try { fn(); } catch (e) { /* abaikan */ }
  }
  cleanups.clear();
}
