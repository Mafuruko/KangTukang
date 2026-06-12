/* ============================================================
   KangTukang — LAYAR ALUR PEMESANAN (v2)
   start → login → otp → home → kategori → layanan → form
   → lokasi → estimasi → konsultasi → checkout
   ============================================================ */

import {
  CATEGORIES, SERVICES, DEMO_USER, DEMO_LOCATIONS, NEGO_SCRIPTS, PLATFORM_FEE,
  PROMO_BANNERS, VOUCHERS, getCategory, getService, getVoucher, servicesByCategory,
} from "./data.js";
import { calcEstimate, workerOffer, negotiatedOffer, findWorker, wait } from "./sim.js";
import { getState, setState, newOrder, updateOrder } from "./store.js";
import {
  h, icon, screen, btn, fmtRp, fmtRange, stars, photoAvatar, toast, addTimer,
} from "./ui.js";
import { hasLeaflet, makeMap, homeMarker, fallbackMapSvg, DEFAULT_CENTER } from "./map.js";

const go = (hash) => (location.hash = hash);

/* ---------- 1. Demo start ---------- */
export function StartScreen() {
  return screen({
    title: null,
    cls: "start-screen",
    content: h(
      "div",
      { class: "start-inner" },
      h("img", { class: "start-logo", src: "../assets/img/logo.png", alt: "Logo KangTukang" }),
      h("h1", { class: "start-title", html: "Kang<strong>Tukang</strong>" }),
      h("p", { class: "start-tagline" }, "Andalan Rumah Tangga, Sahabat Dompet Anda."),
      h(
        "div",
        { class: "card start-card" },
        h("span", { class: "start-kicker" }, "Urusan rumah jadi mudah"),
        h(
          "p",
          {},
          "Pesan tukang terverifikasi, sepakati harga dengan adil, lalu pantau pengerjaan sampai selesai."
        ),
        btn("Mulai", { onClick: () => go("#/login") })
      )
    ),
  });
}

export function LoginScreen() {
  const inputName = h("input", { class: "input", type: "text", placeholder: "", disabled: true });
  const inputEmail = h("input", { class: "input", type: "email", placeholder: "", disabled: true });
  const inputPhone = h("input", { class: "input", type: "tel", placeholder: "", disabled: true });

  const loginBtn = btn("Mendaftarkan...", { disabled: true });

  addTimer(setTimeout(async () => {
    await typeText(inputName, DEMO_USER.name);
    await wait(400);
    await typeText(inputEmail, DEMO_USER.email);
    await wait(400);
    await typeText(inputPhone, DEMO_USER.phone);
    await wait(800);
    loginBtn.textContent = "Melanjutkan...";
    await wait(400);
    setState({ pendingPhone: "+62 " + DEMO_USER.phone });
    go("#/otp");
  }, 600));

  async function typeText(el, text) {
    for (let i = 0; i < text.length; i++) {
      el.value += text[i];
      await wait(Math.random() * 50 + 30);
    }
  }

  return screen({
    title: "",
    back: "#/start",
    content: h(
      "div",
      { class: "stack" },
      h(
        "div",
        { class: "auth-hero" },
        h("img", { class: "auth-logo", src: "../assets/img/logo.png", alt: "" }),
        h("h2", { class: "h1" }, "Selamat datang"),
        h("p", { class: "muted" }, "Membuat akun otomatis untuk Anda...")
      ),
      h("div", { class: "field" }, h("span", { class: "field-label" }, "Nama Lengkap"), inputName),
      h("div", { class: "field" }, h("span", { class: "field-label" }, "Email"), inputEmail),
      h("div", { class: "field" }, h("span", { class: "field-label" }, "Nomor HP"), inputPhone),
      loginBtn
    ),
  });
}

/* ---------- 2b. OTP (gimik) ---------- */
export function OtpScreen() {
  const st = getState();
  const phone = st.pendingPhone || DEMO_USER.phone;
  const code = ["4", "8", "2", "7"];
  const boxes = code.map(() => h("div", { class: "otp-box" }, ""));
  let filled = 0;

  const verifyBtn = btn("Verifikasi", {
    onClick: doVerify,
  });
  verifyBtn.disabled = true;

  function fillNext() {
    if (filled >= code.length) return;
    boxes[filled].textContent = code[filled];
    boxes[filled].classList.add("filled");
    filled++;
    if (filled === code.length) {
      verifyBtn.disabled = false;
      addTimer(setTimeout(doVerify, 700));
    }
  }

  // simulasi SMS otomatis terisi
  addTimer(setTimeout(() => {
    toast("Kode OTP diterima");
    for (let i = 0; i < code.length; i++) addTimer(setTimeout(fillNext, 350 * i));
  }, 900));

  let verifying = false;
  async function doVerify() {
    if (verifying || filled < code.length) return;
    verifying = true;
    verifyBtn.disabled = true;
    verifyBtn.textContent = "Memverifikasi…";
    await wait(800);
    setState({ loggedIn: true });
    go("#/home");
  }

  return screen({
    title: "Verifikasi",
    back: "#/login",
    content: h(
      "div",
      { class: "stack center-text" },
      h("h2", { class: "h2", style: "margin-top:8px" }, "Masukkan kode OTP"),
      h("p", { class: "muted tiny" }, "Kode dikirim via SMS ke " + phone),
      h("div", { class: "otp-row" }, boxes),
      verifyBtn,
      h(
        "div",
        { class: "resend-row" },
        "Tidak menerima kode?",
        h("button", { class: "link-btn", type: "button", onClick: () => toast("Kode dikirim ulang") }, "Kirim ulang")
      )
    ),
  });
}

/* ---------- 3. Home ---------- */
export function HomeScreen() {
  const st = getState();
  const popular = [...SERVICES].sort((a, b) => b.sold - a.sold).slice(0, 4);
  const homeCats = CATEGORIES.slice(0, 7);

  return screen({
    title: null,
    nav: "home",
    content: h(
      "div",
      { class: "stack" },
      /* greeting */
      h(
        "div",
        { class: "home-top" },
        h(
          "div",
          { class: "grow" },
          h("p", { class: "home-hi" }, greetingTime() + ","),
          h("p", { class: "home-name" }, DEMO_USER.greetingName)
        ),
        h(
          "button",
          { class: "icon-btn", type: "button", "aria-label": "Notifikasi", onClick: () => toast("Tidak ada notifikasi baru") },
          icon("bell")
        ),
        h("button", { type: "button", onClick: () => go("#/profile"), "aria-label": "Profil" }, photoAvatar(DEMO_USER))
      ),
      /* search */
      h(
        "button",
        { class: "search-bar", type: "button", onClick: () => toast("Pilih kategori layanan yang Anda butuhkan") },
        icon("search"),
        "Mau perbaiki apa hari ini?"
      ),
      /* wallet */
      h(
        "div",
        { class: "wallet-card" },
        h(
          "div",
          { class: "wallet-left" },
          h("span", { class: "wallet-ic" }, icon("wallet")),
          h(
            "div",
            { class: "wallet-info" },
            h("span", { class: "wallet-label" }, "Saldo KangPay"),
            h("span", { class: "wallet-amount" }, fmtRp(st.balance))
          )
        ),
        h(
          "div",
          { class: "wallet-actions" },
          h("button", { class: "wallet-act", type: "button", onClick: () => go("#/topup") }, icon("plus"), "Top Up"),
          h("button", { class: "wallet-act", type: "button", onClick: () => go("#/activity") }, icon("clock"), "Riwayat")
        )
      ),
      /* kategori */
      h(
        "div",
        { class: "cat-grid" },
        homeCats.map((c) => catTile(c)),
        h(
          "button",
          { class: "cat-card", type: "button", onClick: () => go("#/services") },
          h("span", { class: "cat-ic", style: "background:var(--surface-2);color:var(--muted)" }, icon("plus")),
          h("span", { class: "cat-name" }, "Lainnya")
        )
      ),
      /* promo */
      h(
        "div",
        { class: "section-title" },
        h("h3", { class: "h3" }, "Promo untukmu"),
        h("button", { class: "link-btn", type: "button", onClick: () => go("#/promo") }, "Lihat semua")
      ),
      h(
        "div",
        { class: "promo-scroll" },
        PROMO_BANNERS.map((p) =>
          h(
            "button",
            {
              class: "promo-card promo-" + p.tint,
              type: "button",
              onClick: () => {
                if (p.code) {
                  setState({ activeVoucher: p.code });
                  toast("Kode " + p.code + " diterapkan!");
                  go("#/promo");
                } else {
                  go("#/promo");
                }
              },
            },
            h("strong", {}, p.title),
            h("span", {}, p.sub)
          )
        )
      ),
      /* populer */
      h(
        "div",
        { class: "section-title" },
        h("h3", { class: "h3" }, "Paling banyak dipesan")
      ),
      h("div", { class: "list" }, popular.map((s) => serviceRow(s)))
    ),
  });
}

function greetingTime() {
  const hr = new Date().getHours();
  if (hr < 11) return "Selamat pagi";
  if (hr < 15) return "Selamat siang";
  if (hr < 18) return "Selamat sore";
  return "Selamat malam";
}

function catTile(c) {
  return h(
    "button",
    {
      class: "cat-card",
      type: "button",
      onClick: () => {
        if (c.comingSoon) {
          toast(c.name + " segera hadir");
          return;
        }
        go("#/category/" + c.id);
      },
    },
    h("span", { class: "cat-ic tint-" + c.tint }, icon(c.icon)),
    h("span", { class: "cat-name" }, c.name),
    c.comingSoon && h("span", { class: "soon-badge" }, "Segera")
  );
}

function serviceRow(s) {
  const cat = getCategory(s.catId);
  return h(
    "button",
    { class: "list-row service-row", type: "button", onClick: () => go("#/service/" + s.id) },
    h("span", { class: "row-icon tint-" + cat.tint }, icon(cat.icon)),
    h(
      "div",
      { class: "row-main" },
      h("strong", {}, s.name),
      h("span", { class: "row-sub" }, s.short),
      h("span", { class: "row-price" }, priceLabel(s))
    ),
    h(
      "div",
      { class: "row-meta" },
      h("span", { class: "order-count" }, s.sold.toLocaleString("id-ID") + "+ order"),
      icon("chevR", "chev")
    )
  );
}

function priceLabel(s) {
  if (!s.pricing.base) return s.pricing.consultText || "Harga via konsultasi";
  const [min, max] = s.pricing.base;
  const unit = s.pricing.perUnitField ? " /unit" : "";
  return min === max ? fmtRp(min) + unit : `${fmtRp(min)} – ${fmtRp(max)}${unit}`;
}

/* ---------- 3b. Semua layanan ---------- */
export function AllServicesScreen() {
  return screen({
    title: "Semua Layanan",
    back: "#/home",
    content: h(
      "div",
      { class: "stack" },
      CATEGORIES.map((c) =>
        h(
          "div",
          { class: "stack", style: "gap:10px" },
          h(
            "div",
            { class: "section-title" },
            h("h3", { class: "h3" }, c.name),
            c.comingSoon && h("span", { class: "soon-badge" }, "Segera hadir")
          ),
          c.comingSoon
            ? h(
                "button",
                {
                  class: "list-row",
                  type: "button",
                  onClick: () => toast(c.name + " segera hadir di KangTukang 🚧"),
                },
                h("span", { class: "row-icon tint-" + c.tint }, icon(c.icon)),
                h(
                  "div",
                  { class: "row-main" },
                  h("strong", {}, c.name),
                  h("span", { class: "row-sub" }, c.desc)
                ),
                icon("chevR", "chev")
              )
            : servicesByCategory(c.id).map((s) => serviceRow(s))
        )
      )
    ),
  });
}

/* ---------- 4. Kategori ---------- */
export function CategoryScreen(catId) {
  const cat = getCategory(catId);
  if (!cat || cat.comingSoon) return missing("Kategori belum tersedia");
  const items = servicesByCategory(catId);
  return screen({
    title: cat.name,
    back: "#/home",
    content: h(
      "div",
      { class: "stack" },
      h("p", { class: "muted" }, cat.desc),
      h("div", { class: "list" }, items.map((s) => serviceRow(s)))
    ),
  });
}

/* ---------- 5. Detail layanan ---------- */
export function ServiceScreen(serviceId) {
  const s = getService(serviceId);
  if (!s) return missing("Layanan tidak ditemukan");
  const cat = getCategory(s.catId);

  return screen({
    title: "Detail Layanan",
    back: "#/category/" + s.catId,
    content: h(
      "div",
      { class: "stack" },
      h(
        "div",
        { class: "service-hero" },
        h("span", { class: "hero-icon tint-" + cat.tint }, icon(cat.icon)),
        h(
          "div",
          {},
          h("h2", { class: "h2" }, s.name),
          h(
            "p",
            { class: "muted tiny service-meta" },
            h("span", {}, `${s.sold.toLocaleString("id-ID")}+ dipesan · ${s.duration}`)
          )
        )
      ),
      h(
        "div",
        { class: "card price-box" },
        h("span", { class: "price-box-label" }, "Estimasi harga"),
        h("strong", { class: "price-box-value" }, priceLabel(s)),
        h(
          "span",
          { class: "muted tiny" },
          s.needsConsult
            ? "Harga final disepakati lewat konsultasi singkat dengan mitra."
            : "Harga final dikonfirmasi sebelum pengerjaan dimulai."
        )
      ),
      h(
        "div",
        { class: "card stack" },
        h("h3", { class: "h3", style: "margin:0;" }, "Tentang layanan"),
        h("p", { class: "body-text", style: "margin:0;" }, s.desc),
        h(
          "ul",
          { class: "perk-list", style: "margin-top:4px;" },
          h("li", {}, "Mitra terverifikasi identitas & keahlian"),
          h("li", {}, "Harga transparan, tanpa biaya tersembunyi"),
          h("li", {}, "Garansi pengerjaan 7 hari"),
          h("li", {}, "Progres pengerjaan bisa dipantau langsung")
        )
      )
    ),
    bottom: btn("Pesan Layanan Ini", {
      onClick: () => {
        newOrder(s.id);
        go("#/location");
      },
    }),
  });
}

/* ---------- 6. Form kebutuhan + estimasi harga (live) ---------- */
export function FormScreen() {
  const order = getState().order;
  const s = getService(order.serviceId);
  const answers = { ...order.answers };

  for (const f of s.form) {
    if (answers[f.id] == null && f.default != null) answers[f.id] = f.default;
  }

  /* panel estimasi yang ter-update otomatis tiap input berubah */
  const estBox = h("div", { class: "form-estimate" });
  function refreshEstimate() {
    const est = calcEstimate(s, answers);
    estBox.replaceChildren(
      h(
        "div",
        { class: "form-estimate-info" },
        h("span", { class: "price-box-label" }, "Estimasi harga"),
        h("strong", {}, est ? fmtRange(est) : "Perlu konsultasi mitra")
      ),
      h(
        "span",
        { class: "muted tiny" },
        est ? "+ " + fmtRp(PLATFORM_FEE) + " biaya aplikasi" : "Penawaran diberikan oleh mitra"
      )
    );
  }
  refreshEstimate();

  return screen({
    title: "Kebutuhan & Estimasi",
    back: "#/location",
    content: h(
      "div",
      { class: "stack" },
      h("div", { class: "context-chip" }, icon(getCategory(s.catId).icon, "chip-icon"), s.name),
      s.form.map((f) => renderField(f, answers, refreshEstimate))
    ),
    bottom: h(
      "div",
      { class: "stack-sm" },
      estBox,
      btn("Lanjut Konfirmasi Pesanan", {
        onClick: () => {
          for (const f of s.form) {
            if (f.required && f.type === "textarea" && !String(answers[f.id] || "").trim()) {
              toast("Mohon isi: " + f.label);
              return;
            }
          }
          updateOrder({ answers, estimate: calcEstimate(s, answers) });
          go("#/checkout");
        },
      })
    ),
  });
}

function renderField(f, answers, onChange) {
  const changed = () => {
    if (typeof onChange === "function") onChange();
  };
  if (f.type === "stepper") {
    const val = h("span", { class: "stepper-value" }, String(answers[f.id]));
    const set = (n) => {
      answers[f.id] = Math.min(f.max, Math.max(f.min, n));
      val.textContent = String(answers[f.id]);
      changed();
    };
    return h(
      "div",
      { class: "field" },
      h("span", { class: "field-label" }, f.label),
      h(
        "div",
        { class: "stepper" },
        h("button", { class: "stepper-btn", type: "button", onClick: () => set(answers[f.id] - 1) }, "−"),
        val,
        h("span", { class: "muted tiny" }, f.suffix || ""),
        h("button", { class: "stepper-btn", type: "button", onClick: () => set(answers[f.id] + 1) }, "+")
      )
    );
  }

  if (f.type === "choice") {
    const wrap = h("div", { class: "chips" });
    const render = () => {
      wrap.replaceChildren(
        ...f.options.map((o) =>
          h(
            "button",
            {
              class: "chip" + (answers[f.id] === o.value ? " active" : ""),
              type: "button",
              onClick: () => {
                answers[f.id] = o.value;
                render();
                changed();
              },
            },
            o.label
          )
        )
      );
    };
    render();
    return h("div", { class: "field" }, h("span", { class: "field-label" }, f.label), wrap);
  }

  if (f.type === "photo") {
    const zone = h("div", { class: "photo-zone" });
    const renderEmpty = () => {
      zone.replaceChildren(
        h(
          "button",
          {
            class: "photo-btn",
            type: "button",
            onClick: () => {
              answers[f.id] = "demo-photo";
              renderDone();
              changed();
              toast("Foto berhasil ditambahkan");
            },
          },
          icon("camera"),
          "Ambil / Upload Foto Lokasi"
        )
      );
    };
    const renderDone = () => {
      zone.replaceChildren(
        h(
          "div",
          { class: "photo-preview" },
          h("div", { class: "photo-thumb" }, icon("camera")),
          h(
            "div",
            { class: "photo-info" },
            h("strong", {}, "foto-lokasi.jpg"),
            h("span", { class: "photo-ok" }, "✓ Foto berhasil ditambahkan")
          ),
          h(
            "button",
            {
              class: "link-btn",
              type: "button",
              onClick: () => {
                delete answers[f.id];
                renderEmpty();
                changed();
              },
            },
            "Hapus"
          )
        )
      );
    };
    answers[f.id] ? renderDone() : renderEmpty();
    return h("div", { class: "field" }, h("span", { class: "field-label" }, f.label), zone);
  }

  const ta = h("textarea", {
    class: "input",
    rows: 3,
    placeholder: f.placeholder || "",
    onInput: (e) => (answers[f.id] = e.target.value),
  });
  ta.value = answers[f.id] || "";
  return h(
    "div",
    { class: "field" },
    h("span", { class: "field-label" }, f.label + (f.required ? " *" : "")),
    ta
  );
}

/* ---------- 7. Lokasi (peta asli + GPS opsional) ---------- */
export function LocationScreen() {
  const order = getState().order;
  let selected = order.location || DEMO_LOCATIONS[0];

  /* peta */
  const mapWrap = h("div", { class: "map-wrap mini" });
  let leafMap = null;
  let leafMarker = null;

  function renderMap() {
    if (hasLeaflet()) {
      if (!leafMap) {
        const mapEl = h("div", { class: "map-real" });
        mapWrap.replaceChildren(mapEl, h("span", { class: "map-tag" }, "OpenStreetMap"));
        leafMap = makeMap(mapEl, selected, 15, false);
        leafMarker = homeMarker(leafMap, selected);
      } else {
        leafMap.setView([selected.lat, selected.lng], 15);
        leafMarker.setLatLng([selected.lat, selected.lng]);
      }
    } else {
      mapWrap.replaceChildren(fallbackMapSvg(), h("span", { class: "map-tag" }, "Peta"));
    }
  }

  /* daftar alamat tersimpan */
  const listEl = h("div", { class: "list" });
  const renderList = () => {
    const rows = DEMO_LOCATIONS.map((loc) =>
      h(
        "button",
        {
          class: "loc-row" + (selected.id === loc.id ? " active" : ""),
          type: "button",
          onClick: () => {
            selected = loc;
            renderList();
            renderMap();
          },
        },
        h("span", { class: "row-icon tint-blue" }, icon("pin")),
        h("div", { class: "row-main" }, h("strong", {}, loc.label), h("span", { class: "row-sub" }, loc.address)),
        h("span", { class: "radio" + (selected.id === loc.id ? " on" : "") })
      )
    );
    if (selected.gps) {
      rows.unshift(
        h(
          "button",
          { class: "loc-row active", type: "button" },
          h("span", { class: "row-icon tint-green" }, icon("crosshair")),
          h("div", { class: "row-main" }, h("strong", {}, selected.label), h("span", { class: "row-sub" }, selected.address)),
          h("span", { class: "radio on" })
        )
      );
    }
    listEl.replaceChildren(...rows);
  };
  renderList();
  renderMap();

  /* GPS asli (opsional) */
  const gpsBtn = h(
    "button",
    {
      class: "gps-btn",
      type: "button",
      onClick: () => {
        if (!navigator.geolocation) {
          toast("GPS tidak tersedia — gunakan alamat tersimpan");
          return;
        }
        gpsBtn.replaceChildren(icon("crosshair"), "Mendeteksi lokasi…");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            selected = {
              id: "gps",
              gps: true,
              label: "Lokasi Saya (GPS)",
              address: `Terdeteksi · akurasi ±${Math.round(pos.coords.accuracy)} m`,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            renderList();
            renderMap();
            gpsBtn.replaceChildren(icon("check"), "Lokasi terdeteksi");
            toast("Lokasi GPS berhasil dideteksi");
          },
          () => {
            gpsBtn.replaceChildren(icon("crosshair"), "Gunakan Lokasi Saya (GPS)");
            toast("Izin lokasi ditolak — gunakan alamat tersimpan");
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      },
    },
    icon("crosshair"),
    "Gunakan Lokasi Saya (GPS)"
  );

  return screen({
    title: "Lokasi Layanan",
    back: "#/service/" + order.serviceId,
    content: h(
      "div",
      { class: "stack" },
      mapWrap,
      gpsBtn,
      h("h3", { class: "h3" }, "Alamat tersimpan"),
      listEl
    ),
    bottom: btn("Pakai Lokasi Ini", {
      onClick: () => {
        updateOrder({ location: selected });
        go("#/form");
      },
    }),
  });
}

/* ---------- 8. Estimasi harga ---------- */
export function EstimateScreen() {
  const order = getState().order;
  const s = getService(order.serviceId);
  const est = calcEstimate(s, order.answers);
  updateOrder({ estimate: est });

  return screen({
    title: "Estimasi Harga",
    back: "#/location",
    content: h(
      "div",
      { class: "stack" },
      h("div", { class: "context-chip" }, icon(getCategory(s.catId).icon, "chip-icon"), s.name),
      est
        ? h(
            "div",
            { class: "card estimate-card" },
            h("span", { class: "price-box-label" }, "Perkiraan total"),
            h(
              "strong",
              { class: "estimate-value" },
              fmtRange({ min: est.min + PLATFORM_FEE, max: est.max + PLATFORM_FEE })
            ),
            h(
              "div",
              { class: "breakdown" },
              line("Estimasi jasa", fmtRange(est)),
              line("Biaya layanan aplikasi", fmtRp(PLATFORM_FEE))
            ),
            h(
              "p",
              { class: "muted tiny" },
              "Estimasi berdasarkan detail yang Anda isi. Harga final dikonfirmasi " +
                (s.needsConsult ? "lewat konsultasi dengan mitra." : "sebelum pengerjaan dimulai.")
            )
          )
        : h(
            "div",
            { class: "card estimate-card" },
            h("span", { class: "price-box-label" }, "Harga"),
            h("strong", { class: "estimate-value" }, "Perlu Konsultasi"),
            h(
              "p",
              { class: "muted tiny" },
              "Pekerjaan ini punya banyak variabel. Mitra akan memberi penawaran setelah melihat kebutuhan Anda."
            )
          ),
      summaryAnswers(s, order.answers),
      locationCard(order.location)
    ),
    bottom: btn("Lanjut Konfirmasi Pesanan", { onClick: () => go("#/checkout") }),
  });
}

function line(label, value, cls = "") {
  return h("div", { class: "line " + cls }, h("span", {}, label), h("span", {}, value));
}

export function summaryAnswers(s, answers) {
  const items = [];
  for (const f of s.form) {
    const v = answers[f.id];
    if (v == null || v === "") continue;
    let text = v;
    if (f.type === "choice") {
      const o = f.options.find((x) => x.value === v);
      text = o ? o.label : v;
    }
    if (f.type === "stepper") text = `${v} ${f.suffix || ""}`;
    if (f.type === "photo") text = "1 foto terlampir";
    const label = f.label.replace(" (opsional)", "").replace(" (disarankan)", "").replace(" *", "");
    /* teks bebas (catatan/deskripsi) bisa panjang → render sebagai blok agar wrap ke bawah */
    items.push(line(label, String(text), f.type === "textarea" ? "block" : ""));
  }
  if (!items.length) return null;
  return h(
    "div",
    { class: "card" },
    h("h3", { class: "h3", style: "margin-bottom:10px" }, "Detail kebutuhan"),
    h("div", { class: "breakdown" }, items)
  );
}

export function locationCard(loc) {
  if (!loc) return null;
  return h(
    "div",
    { class: "card" },
    h("h3", { class: "h3", style: "margin-bottom:10px" }, "Lokasi"),
    h(
      "div",
      { class: "loc-static" },
      h("span", { class: "row-icon tint-blue" }, icon("pin")),
      h("div", {}, h("strong", {}, loc.label), h("p", { class: "muted tiny" }, loc.address))
    )
  );
}

/* ---------- 9. Konsultasi / negosiasi ---------- */
export function ConsultScreen() {
  const order = getState().order;
  const s = getService(order.serviceId);
  const offer1 = workerOffer(order.estimate);
  const offer2 = negotiatedOffer(offer1);

  const chatEl = h("div", { class: "chat" });
  const actionEl = h("div", { class: "consult-actions" });

  const headerName = h("strong", {}, "Mitra KangTukang");
  const headWrap = h(
    "div",
    { class: "card consult-head flat" },
    photoAvatar({ name: "Mitra" }),
    h("div", {}, headerName, h("p", { class: "muted tiny" }, "Konsultasi harga · simulasi percakapan"))
  );

  findWorker(s.catId).then((w) => {
    updateOrder({ workerId: w.id });
    headerName.textContent = w.name;
    headWrap.replaceChildren(
      photoAvatar(w),
      h("div", {}, headerName, h("p", { class: "muted tiny" }, "Konsultasi harga · simulasi percakapan"))
    );
  });

  async function pushMsgs(msgs, after) {
    for (const m of msgs) {
      await typing(700);
      chatEl.append(bubble(m.from, m.text));
      scrollChat();
    }
    if (after) after();
  }

  function typing(ms) {
    const t = h("div", { class: "bubble worker typing" }, "•••");
    chatEl.append(t);
    scrollChat();
    return wait(ms).then(() => t.remove());
  }

  function bubble(from, text) {
    return h("div", { class: "bubble " + from }, text);
  }

  function offerCard(amount, final = false) {
    return h(
      "div",
      { class: "offer-card" },
      h("span", { class: "price-box-label" }, final ? "Penawaran revisi" : "Penawaran mitra"),
      h("strong", {}, fmtRp(amount)),
      h("span", { class: "muted tiny" }, "Termasuk jasa & alat · belum termasuk biaya aplikasi")
    );
  }

  function scrollChat() {
    requestAnimationFrame(() => {
      const sc = document.querySelector(".screen-body");
      if (sc) sc.scrollTop = sc.scrollHeight;
    });
  }

  function showFirstOffer() {
    chatEl.append(offerCard(offer1));
    scrollChat();
    actionEl.replaceChildren(
      btn("Setujui " + fmtRp(offer1), { onClick: () => agree(offer1) }),
      btn("Negosiasi", { variant: "secondary", onClick: doNegotiate })
    );
  }

  async function doNegotiate() {
    actionEl.replaceChildren();
    chatEl.append(bubble("user", NEGO_SCRIPTS.negotiate[0].text));
    scrollChat();
    await pushMsgs(NEGO_SCRIPTS.negotiate.slice(1), () => {
      chatEl.append(offerCard(offer2, true));
      scrollChat();
      actionEl.replaceChildren(btn("Setujui Harga Final " + fmtRp(offer2), { onClick: () => agree(offer2) }));
    });
  }

  async function agree(amount) {
    actionEl.replaceChildren();
    updateOrder({ agreedPrice: amount });
    await pushMsgs(NEGO_SCRIPTS.agree, () => {
      actionEl.replaceChildren(btn("Lanjut Konfirmasi Pesanan", { onClick: () => go("#/checkout") }));
    });
  }

  addTimer(
    setTimeout(() => {
      pushMsgs(NEGO_SCRIPTS.opening, showFirstOffer);
    }, 400)
  );

  return screen({
    title: "Konsultasi Harga",
    back: "#/estimate",
    cls: "consult-screen",
    content: h("div", { class: "stack" }, headWrap, chatEl),
    bottom: actionEl,
  });
}

/* ---------- 10. Checkout ---------- */
export function CheckoutScreen() {
  const st = getState();
  const order = st.order;
  const s = getService(order.serviceId);

  /* voucher */
  let voucherCode = order.voucher || st.activeVoucher;

  const priceCard = h("div", { class: "card" });
  function renderPrice() {
    const rows = [];
    let baseMin = null;
    let baseMax = null;
    if (order.agreedPrice) {
      rows.push(line("Jasa (disepakati)", fmtRp(order.agreedPrice)));
      baseMin = baseMax = order.agreedPrice;
    } else if (order.estimate) {
      rows.push(line("Estimasi jasa", fmtRange(order.estimate)));
      baseMin = order.estimate.min;
      baseMax = order.estimate.max;
    }
    rows.push(line("Biaya layanan aplikasi", fmtRp(PLATFORM_FEE)));

    let discMin = 0;
    let discMax = 0;
    const v = voucherCode ? getVoucher(voucherCode) : null;
    if (v && baseMin != null) {
      if (v.type === "pct") {
        discMin = Math.min(Math.round(baseMin * v.pct), v.max);
        discMax = Math.min(Math.round(baseMax * v.pct), v.max);
      } else if (v.type === "fee") {
        discMin = discMax = PLATFORM_FEE;
      }
      if (discMax > 0) rows.push(line("Voucher " + v.code, "−" + fmtRp(discMax), "discount"));
    }

    let totalText = "Sesuai konsultasi";
    if (baseMin != null) {
      const tMin = baseMin + PLATFORM_FEE - discMin;
      const tMax = baseMax + PLATFORM_FEE - discMax;
      totalText = fmtRange({ min: tMin, max: tMax });
    }
    rows.push(line("Total", totalText, "strong"));

    priceCard.replaceChildren(
      h("h3", { class: "h3", style: "margin-bottom:10px" }, "Rincian biaya"),
      h("div", { class: "breakdown" }, rows),
      h(
        "div",
        { class: "fair-note" },
        icon("shield"),
        h(
          "div",
          {},
          h("strong", {}, "Harga final belum ditetapkan"),
          h("span", {}, "Setelah mitra ditemukan, harga jasa disepakati dua arah sebelum mitra berangkat.")
        )
      )
    );
  }
  renderPrice();

  /* baris voucher */
  const voucherRow = h("div", {});
  function renderVoucher() {
    const v = voucherCode ? getVoucher(voucherCode) : null;
    voucherRow.replaceChildren(
      h(
        "button",
        {
          class: "list-row",
          type: "button",
          onClick: () => {
            if (v) {
              voucherCode = null;
              updateOrder({ voucher: null });
              setState({ activeVoucher: null });
              renderVoucher();
              renderPrice();
              toast("Voucher dilepas");
            } else {
              voucherCode = "HEMAT10";
              updateOrder({ voucher: voucherCode });
              setState({ activeVoucher: voucherCode });
              renderVoucher();
              renderPrice();
              toast("Voucher HEMAT10 dipakai 🎉");
            }
          },
        },
        h("span", { class: "row-icon tint-yellow" }, icon("tag")),
        h(
          "div",
          { class: "row-main" },
          h("strong", {}, v ? "Voucher " + v.code + " terpakai" : "Pakai voucher promo"),
          h("span", { class: "row-sub" }, v ? v.title : "Diskon 10% s/d Rp25.000 tersedia")
        ),
        h("span", { class: "link-btn" }, v ? "Lepas" : "Pakai")
      )
    );
  }
  renderVoucher();

  return screen({
    title: "Konfirmasi Pesanan",
    back: "#/form",
    content: h(
      "div",
      { class: "stack" },
      h(
        "div",
        { class: "card" },
        h("h3", { class: "h3", style: "margin-bottom:10px" }, "Layanan"),
        h(
          "div",
          { class: "loc-static" },
          h("span", { class: "row-icon tint-" + getCategory(s.catId).tint }, icon(getCategory(s.catId).icon)),
          h("div", {}, h("strong", {}, s.name), h("p", { class: "muted tiny" }, s.duration))
        )
      ),
      summaryAnswers(s, order.answers),
      locationCard(order.location),
      voucherRow,
      priceCard,
      h("p", { class: "demo-note" }, "Harga final baru ditetapkan setelah mitra ditemukan dan disetujui dua arah.")
    ),
    bottom: btn("Konfirmasi Detail & Cari Tukang", {
      onClick: () => {
        updateOrder({ step: "searching", voucher: voucherCode });
        go("#/searching");
      },
    }),
  });
}

function missing(msg) {
  return screen({
    title: "Ups",
    back: "#/home",
    content: h("p", { class: "muted" }, msg),
  });
}
