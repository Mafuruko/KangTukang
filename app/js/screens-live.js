/* ============================================================
   KangTukang — LAYAR ALUR LIVE (v2)
   searching → found → tracking (peta asli) → progress
   → payment (KangPay/voucher) → rating → done
   ============================================================ */

import {
  PLATFORM_FEE, PAYMENT_METHODS,
  getService, getWorker, getCategory, getVoucher,
  getProgressTemplate, getExtraProgress, SERVICES,
} from "./data.js";
import { findWorker, processPayment, initialEta, workerOffer, negotiatedOffer } from "./sim.js";
import { getState, updateOrder, setState, adjustBalance, addHistory } from "./store.js";
import { h, icon, screen, btn, fmtRp, stars, photoAvatar, toast, addTimer } from "./ui.js";
import { hasLeaflet, makeMap, homeMarker, driverMarker, routeLine, buildRoute, fallbackMapSvg, DEFAULT_CENTER } from "./map.js";

const go = (hash) => (location.hash = hash);

/* ---------- 11. Mencari tukang ---------- */
export function SearchingScreen() {
  const order = getState().order;
  const s = getService(order.serviceId);

  const statusEl = h("p", { class: "search-status" }, "Menghubungkan ke mitra terdekat…");
  const texts = [
    "Menghubungkan ke mitra terdekat…",
    "Memeriksa mitra yang tersedia…",
    "Mencocokkan keahlian mitra…",
    "Hampir dapat…",
  ];
  let i = 0;
  addTimer(
    setInterval(() => {
      i = (i + 1) % texts.length;
      statusEl.textContent = texts[i];
    }, 1100)
  );

  let resolved = false;
  async function resolveWorker() {
    if (resolved) return;
    resolved = true;
    let workerId = order.workerId;
    if (!workerId) {
      const w = await findWorker(s.catId);
      workerId = w.id;
    }
    updateOrder({ workerId, step: "found" });
    go("#/found");
  }

  addTimer(setTimeout(resolveWorker, 3600));

  return screen({
    title: "Mencari Tukang",
    content: h(
      "div",
      { class: "center-stack" },
      h(
        "div",
        { class: "radar" },
        h("span", { class: "radar-ring r1" }),
        h("span", { class: "radar-ring r2" }),
        h("span", { class: "radar-ring r3" }),
        h("img", { src: "../assets/img/logo.png", alt: "KangTukang Logo", style: "position:relative; z-index:2; width: 110px; height: 130px; object-fit: contain; filter: drop-shadow(0 8px 24px rgba(224,178,34,0.45));" })
      ),
      h("h2", { class: "h2 center" }, "Mencari tukang untukmu…"),
      statusEl,
      h("p", { class: "muted tiny center" }, "Pesanan " + order.id + " · " + s.name)
    ),
    bottom: btn("Batalkan Pencarian", { variant: "ghost", onClick: () => {
      updateOrder({ step: "form", workerId: null });
      toast("Pencarian dibatalkan");
      go("#/home");
    } }),
  });
}

/* ---------- 12. Tukang ditemukan ---------- */
export function FoundScreen() {
  const order = getState().order;
  const s = getService(order.serviceId);
  const w = getWorker(order.workerId);
  const cat = getCategory(s.catId);

  addTimer(setTimeout(() => {
    updateOrder({ step: "price-agreement" });
    go("#/chat/" + order.id);
  }, 2200));

  return screen({
    title: "Tukang Ditemukan",
    content: h(
      "div",
      { class: "stack" },
      h("div", { class: "found-banner" }, "Mitra ditemukan untuk pesananmu 🎉"),
      h(
        "div",
        { class: "card driver-card" },
        h(
          "div",
          { class: "driver-head" },
          photoAvatar(w, "big"),
          h(
            "div",
            { class: "driver-info" },
            h("strong", {}, w.name),
            h("span", { class: "row-sub" }, "Mitra " + cat.name + " · " + w.years + " th pengalaman"),
            h(
              "div",
              { class: "driver-badges" },
              stars(w.rating),
              h("span", { class: "row-sub" }, w.orders.toLocaleString("id-ID") + " order"),
              h("span", { class: "plate" }, w.vehicle)
            )
          )
        ),
        h(
          "div",
          { class: "driver-badges" },
          h("span", { class: "verified-pill" }, "✓ Identitas terverifikasi"),
          h("span", { class: "verified-pill" }, "✓ Keahlian teruji")
        )
      ),
      h(
        "div",
        { class: "card" },
        h("h3", { class: "h3", style: "margin-bottom:10px" }, "Pesanan"),
        h(
          "div",
          { class: "loc-static" },
          h("span", { class: "row-icon tint-" + cat.tint }, icon(cat.icon)),
          h("div", {}, h("strong", {}, s.name), h("p", { class: "muted tiny" }, "No. pesanan " + order.id))
        )
      )
    ),
    bottom: btn("Membuka obrolan...", { disabled: true }),
  });
}

/* ---------- 12b. Persetujuan harga tetap dua arah ---------- */
export function PriceAgreementScreen() {
  const order = getState().order;
  const s = getService(order.serviceId);
  const w = getWorker(order.workerId);
  const voucher = order.voucher ? getVoucher(order.voucher) : null;
  const firstOffer = workerOffer(order.estimate);
  let offer = order.agreedPrice || (order.priceRevisionCount ? negotiatedOffer(firstOffer) : firstOffer);
  let revisionCount = order.priceRevisionCount || 0;

  const statusEl = h("div", { class: "agreement-status pending" });
  const priceEl = h("strong", { class: "agreement-price" });
  const savingEl = h("span", { class: "agreement-saving" });
  const actions = h("div", { class: "stack-sm" });
  const chatEl = h(
    "div",
    { class: "chat agreement-chat" },
    h("div", { class: "bubble worker" }, `Halo Kak John, saya sudah meninjau detail pekerjaan ${s.name}.`),
    h("div", { class: "bubble worker" }, "Penawaran ini sudah termasuk jasa, alat kerja, dan pembersihan area setelah selesai."),
    revisionCount >= 1 && h("div", { class: "bubble user" }, "Apakah harga masih bisa disesuaikan mendekati estimasi awal?"),
    revisionCount >= 1 && h("div", { class: "bubble worker" }, `Penawaran final saya ${fmtRp(offer)}. Harga ini sudah paling sesuai untuk cakupan pekerjaan tersebut.`)
  );

  function promoDiscount(amount) {
    if (!voucher) return 0;
    if (voucher.type === "pct") return Math.min(Math.round(amount * voucher.pct), voucher.max);
    if (voucher.type === "fee") return PLATFORM_FEE;
    return 0;
  }

  function render() {
    const discount = promoDiscount(offer);
    priceEl.textContent = fmtRp(offer);
    savingEl.textContent = voucher && discount
      ? `Setelah promo ${voucher.code}: ${fmtRp(offer + PLATFORM_FEE - discount)} termasuk biaya aplikasi`
      : `Dibayar nanti: ${fmtRp(offer + PLATFORM_FEE)} termasuk biaya aplikasi`;
    statusEl.className = "agreement-status pending";
    const isFinal = revisionCount >= 1;
    statusEl.replaceChildren(
      h("span", { class: "status-orb" }),
      h("div", {}, h("strong", {}, isFinal ? "Penawaran final dari tukang" : "Menunggu persetujuan pelanggan"), h("span", {}, isFinal ? "Harga sudah disesuaikan dalam batas estimasi" : "Mitra sudah menyetujui harga ini"))
    );
    const actionButtons = [btn("Setujui Harga Jasa " + fmtRp(offer), { onClick: accept })];
    if (!isFinal) actionButtons.push(btn("Diskusikan Harga", { variant: "secondary", onClick: recalculate }));
    actionButtons.push(btn("Tolak & Cari Mitra Lain", { variant: "ghost", onClick: decline }));
    actions.replaceChildren(...actionButtons);
  }

  function accept() {
    updateOrder({
      agreedPrice: offer,
      priceRevisionCount: revisionCount,
      priceAgreedAt: new Date().toISOString(),
      step: "tracking",
    });
    toast("Harga jasa terkunci. Promo tetap dipotong saat pembayaran.");
    go("#/tracking");
  }

  async function recalculate() {
    if (revisionCount >= 1) return;
    actions.replaceChildren(btn("Menunggu balasan tukang...", { variant: "secondary" }));
    chatEl.append(h("div", { class: "bubble user" }, "Apakah harga masih bisa disesuaikan mendekati estimasi awal?"));
    await new Promise((resolve) => addTimer(setTimeout(resolve, 900)));
    revisionCount++;
    offer = negotiatedOffer(offer);
    updateOrder({ priceRevisionCount: revisionCount });
    chatEl.append(
      h("div", { class: "bubble worker" }, `Bisa Kak. Penawaran final saya ${fmtRp(offer)}. Harga ini sudah paling sesuai untuk cakupan pekerjaan tersebut.`)
    );
    render();
  }

  function decline() {
    updateOrder({ workerId: null, agreedPrice: null, priceRevisionCount: 0, step: "searching" });
    toast("Penawaran ditolak. Mencari mitra lain tanpa penalti.");
    go("#/searching");
  }

  render();

  return screen({
    title: "Persetujuan Harga",
    back: "#/found",
    content: h(
      "div",
      { class: "stack" },
      statusEl,
      h(
        "div",
        { class: "card driver-card compact-card" },
        h(
          "div",
          { class: "driver-head" },
          photoAvatar(w),
          h(
            "div",
            { class: "driver-info" },
            h("strong", {}, w.name),
            stars(w.rating),
            h("span", { class: "row-sub" }, "Mitra terverifikasi untuk " + s.name)
          )
        )
      ),
      h(
        "div",
        { class: "card agreement-card" },
        h("span", { class: "price-box-label" }, "Harga jasa yang diajukan mitra"),
        priceEl,
        h("span", { class: "muted tiny" }, "Harga ini disepakati sebelum promo dan belum termasuk biaya aplikasi."),
        h("div", { class: "agreement-divider" }),
        savingEl
      ),
      h("div", { class: "section-title" }, h("h3", { class: "h3" }, "Diskusi dengan tukang")),
      chatEl,
      h(
        "div",
        { class: "fair-note strong-note" },
        icon("shield"),
        h(
          "div",
          {},
          h("strong", {}, "Perlindungan harga dua arah"),
          h("span", {}, "Mitra tidak dapat menaikkan harga jasa setelah disetujui. Pekerjaan tambahan wajib meminta persetujuan baru.")
        )
      )
    ),
    bottom: h(
      "div",
      { class: "stack-sm" },
      actions,
      btn("Buka Chat Lengkap", { variant: "secondary", onClick: () => go("#/chat/" + order.id) })
    ),
  });
}

/* ---------- 13. Tracking (peta sungguhan) ---------- */
export function TrackingScreen() {
  const order = getState().order;
  const w = getWorker(order.workerId);
  const loc = order.location || { ...DEFAULT_CENTER, label: "Lokasi layanan", address: "Surabaya" };
  const dest = { lat: loc.lat ?? DEFAULT_CENTER.lat, lng: loc.lng ?? DEFAULT_CENTER.lng };

  let eta = initialEta();
  const etaText = h("span", {}, "Tiba ± " + eta + " mnt");
  const statusRow = h("div", { class: "track-status-row" }, icon("pin"), h("span", {}, w.name.split(" ")[0] + " sedang menuju lokasi Anda"));

  const mapWrap = h("div", { class: "map-wrap tall" });
  const etaPill = h("div", { class: "eta-pill" }, h("span", { class: "dot" }), etaText);

  /* state perjalanan */
  const route = buildRoute(dest, 9);
  let seg = 0;
  let arrived = false;

  let leaf = null; // {map, drv}
  let svgPin = null;

  if (hasLeaflet()) {
    const mapEl = h("div", { class: "map-real" });
    mapWrap.replaceChildren(mapEl, etaPill);
    const map = makeMap(mapEl, dest, 15, true);
    homeMarker(map, dest);
    routeLine(map, route);
    const drv = driverMarker(map, route[0], w.photo);
    const b = window.L.latLngBounds(route.map((p) => [p.lat, p.lng]));
    map.fitBounds(b.pad(0.18));
    leaf = { map, drv };
  } else {
    /* fallback ilustrasi */
    const path = [
      { x: 12, y: 86 }, { x: 12, y: 62 }, { x: 34, y: 62 }, { x: 34, y: 36 },
      { x: 58, y: 36 }, { x: 58, y: 52 }, { x: 78, y: 52 }, { x: 78, y: 40 },
    ];
    svgPin = { path, el: h("div", { class: "map-pin worker-pin", style: `left:${path[0].x}%;top:${path[0].y}%` }, icon("wrench")) };
    mapWrap.replaceChildren(
      fallbackMapSvg(true),
      h("div", { class: "map-pin cust-pin", style: "left:78%;top:40%" }, icon("pin")),
      svgPin.el,
      etaPill,
      h("span", { class: "map-tag" }, "Peta")
    );
  }

  const totalSegs = leaf ? route.length - 1 : svgPin.path.length - 1;

  function arrive() {
    if (arrived) return;
    arrived = true;
    eta = 0;
    etaText.textContent = "Mitra tiba 🎉";
    statusRow.replaceChildren(icon("check"), h("span", {}, w.name.split(" ")[0] + " sudah tiba di lokasi"));
    if (leaf) leaf.drv.setLatLng([dest.lat, dest.lng]);
    else {
      const last = svgPin.path[svgPin.path.length - 1];
      svgPin.el.style.left = last.x + "%";
      svgPin.el.style.top = last.y + "%";
    }
    bottomEl.replaceChildren(h("div", { class: "arrival-wait" }, h("span", { class: "status-orb" }), h("span", {}, "Tukang memulai pemeriksaan awal")));
    addTimer(setTimeout(() => {
      updateOrder({ step: "progress" });
      go("#/progress");
    }, 1100));
  }

  const tick = addTimer(
    setInterval(() => {
      seg++;
      if (seg >= totalSegs) {
        clearInterval(tick);
        arrive();
        return;
      }
      if (leaf) {
        const p = route[seg];
        leaf.drv.setLatLng([p.lat, p.lng]);
      } else {
        const p = svgPin.path[seg];
        svgPin.el.style.left = p.x + "%";
        svgPin.el.style.top = p.y + "%";
      }
      eta = Math.max(1, Math.round(initialEta() * (1 - seg / totalSegs)));
      etaText.textContent = "Tiba ± " + eta + " mnt";
      if (seg === totalSegs - 2) statusRow.replaceChildren(icon("pin"), h("span", {}, w.name.split(" ")[0] + " hampir tiba"));
    }, 1500)
  );

  const bottomEl = h("div", { class: "arrival-wait" }, h("span", { class: "status-orb" }), h("span", {}, "Tukang sedang menuju lokasi"));

  return screen({
    title: "Lacak Tukang",
    content: h(
      "div",
      { class: "stack" },
      mapWrap,
      statusRow,
      h(
        "div",
        { class: "card driver-card" },
        h(
          "div",
          { class: "driver-head" },
          photoAvatar(w, "big"),
          h(
            "div",
            { class: "driver-info" },
            h("strong", {}, w.name),
            h("div", { class: "driver-badges" }, stars(w.rating), h("span", { class: "plate" }, w.vehicle)),
            h("span", { class: "row-sub" }, "Tujuan: " + (loc.address || loc.label))
          ),
          h(
            "div",
            { class: "contact-btns" },
            h("button", { class: "round-btn", type: "button", "aria-label": "Chat", onClick: () => go("#/chat/" + order.id) }, icon("chat")),
            h("button", { class: "round-btn", type: "button", "aria-label": "Telepon", onClick: () => toast("Menghubungi " + w.name.split(" ")[0] + "...") }, icon("phone"))
          )
        )
      )
    ),
    bottom: bottomEl,
  });
}

/* ---------- 14. Progress pengerjaan ---------- */
export function ProgressScreen() {
  const order = getState().order;
  const s = getService(order.serviceId);
  const w = getWorker(order.workerId);

  const baseSteps = getProgressTemplate(s).map((t) => ({ label: t, extra: false }));
  const updateConfig = getExtraProgress(s);
  const updates = updateConfig ? [...(updateConfig.updates || [])] : [];

  /* restore state progress dari order — bolak-balik ke chat tidak mengulang dari awal */
  const saved = order.progressSteps || null;
  const plan = saved && Array.isArray(saved.steps) && saved.steps.length ? [...saved.steps] : [...baseSteps];
  let current = saved ? saved.current || 0 : 0;
  let nextUpdate = saved ? saved.nextUpdate || 0 : 0;
  let pendingUpdate = saved ? saved.pendingUpdate || null : null;
  let waitingApproval = false;
  let flowTimer = null;

  function persistProgress() {
    updateOrder({
      progressLabel: plan[Math.min(current, plan.length - 1)].label,
      progressSteps: { steps: plan, current, nextUpdate, pendingUpdate },
    });
  }

  const listEl = h("ol", { class: "timeline" });
  const bottomEl = h("div", { class: "stack-sm" });
  const updateEl = h("div", { class: "progress-update-slot" });
  const summaryEl = h("div", { class: "progress-focus" });

  function insertUpdate(update, approved = true) {
    const injected = update.steps.map((label, index) => ({
      label,
      extra: true,
      note: index === 0,
      updateType: update.type,
      badge: update.type === "free" ? (update.label || "Gratis dari tukang") : "Detail dari tukang",
    }));
    plan.splice(current + 1, 0, ...injected);
    if (approved && update.cost) {
      const costs = [...(getState().order.extraCosts || [])];
      if (!costs.some((c) => c.label === update.cost.label)) {
        costs.push({ ...update.cost, approved: true });
        updateOrder({ extraCosts: costs });
      }
    }
  }

  function approveExtra(update) {
    insertUpdate(update, true);
    waitingApproval = false;
    pendingUpdate = null;
    updateEl.replaceChildren();
    render();
    scheduleNext();
  }

  function declineExtra() {
    waitingApproval = false;
    pendingUpdate = null;
    updateEl.replaceChildren();
    render();
    scheduleNext();
  }

  function showPaidApproval(update) {
    waitingApproval = true;
    pendingUpdate = update;
    clearTimeout(flowTimer);

    /* tukang juga mengabari lewat chat + badge belum dibaca di ikon chat */
    const ord = getState().order;
    const msgs = [...(ord.chatMessages || [])];
    if (!msgs.some((m) => m.text === update.note)) {
      const stageNow = plan[Math.min(current, plan.length - 1)].label;
      msgs.push({ from: "worker", text: update.note, state: stageNow });
      msgs.push({
        from: "worker",
        text:
          "Rinciannya: " +
          update.steps.join(", ") +
          " — tambahan biaya " +
          fmtRp(update.cost.amount) +
          ". Pekerjaan ini baru saya mulai setelah Kakak setujui dari halaman progress ya 🙏",
        state: stageNow,
      });
      updateOrder({ chatMessages: msgs, chatUnread: (ord.chatUnread || 0) + 2 });
      toast("💬 Pesan baru dari " + w.name.split(" ")[0]);
    }
    refreshChatBadge();

    updateEl.replaceChildren(
      h(
        "div",
        { class: "card field-update-card" },
        h("div", { class: "field-update-head" }, h("span", { class: "paid-badge" }, "PERLU PERSETUJUAN"), h("strong", {}, "Rekomendasi dari tukang")),
        h("p", { class: "body-text update-description" }, update.note),
        h(
          "div",
          { class: "breakdown compact-breakdown" },
          lineRow("Pekerjaan", update.steps.join(", "), "block"),
          lineRow("Tambahan biaya", fmtRp(update.cost.amount), "strong")
        ),
        h("p", { class: "muted tiny" }, "Pekerjaan belum dimulai dan tidak masuk tagihan sebelum disetujui."),
        h(
          "div",
          { class: "inline-actions" },
          btn("Setujui", { small: true, onClick: () => approveExtra(update) }),
          btn("Lewati", { variant: "secondary", small: true, onClick: declineExtra })
        )
      )
    );
    render();
  }

  function processUpdates() {
    while (nextUpdate < updates.length && updates[nextUpdate].after <= current) {
      const update = updates[nextUpdate++];
      if (update.type === "paid") {
        showPaidApproval(update);
        return true;
      }
      insertUpdate(update, false);
      const inlineUpdate = h(
        "div",
        { class: `progress-inline-update ${update.type}` },
        icon(update.type === "free" ? "sparkle" : "info"),
        h(
          "div",
          {},
          h("strong", {}, update.type === "free" ? (update.label || "Tambahan gratis dari tukang") : "Detail pekerjaan diperbarui"),
          h("span", { class: "update-description" }, update.note)
        )
      );
      updateEl.replaceChildren(inlineUpdate);
      addTimer(setTimeout(() => {
        if (updateEl.firstChild === inlineUpdate) updateEl.replaceChildren();
      }, 3200));
    }
    return false;
  }

  function render() {
    const visible = plan.map((step, idx) => ({ step, idx }));

    /* simpan tahap berjalan + rencana lengkap ke order (untuk chat & restore) */
    persistProgress();

    listEl.replaceChildren(
      ...visible.map(({ step, idx }) => {
        const state = idx < current ? "done" : idx === current ? "now" : "todo";
        const recent = idx === current - 1;
        return h(
          "li",
          { class: `tl-item ${state}${step.extra ? " extra" : ""}${recent ? " recent" : ""}` },
          h("span", { class: "tl-dot" }, state === "done" ? "✓" : ""),
          h(
            "div",
            { class: "tl-body" },
            step.note && h("span", { class: "tl-badge " + (step.updateType || "") }, step.badge || "Detail dari tukang"),
            h("span", { class: "tl-label update-description" }, step.label),
            recent && h("span", { class: "tl-complete" }, "Baru selesai"),
            state === "now" && idx < plan.length - 1 && h("span", { class: "tl-working" }, waitingApproval ? "Menunggu persetujuan" : "Sedang dikerjakan")
          )
        );
      })
    );

    const doneCount = Math.min(current, plan.length - 1);
    summaryEl.replaceChildren(
      h("div", { class: "progress-count" }, h("strong", {}, `${doneCount}/${plan.length - 1}`), h("span", {}, "tahap selesai")),
      h("div", { class: "progress-meter" }, h("span", { style: `width:${Math.max(4, Math.round((doneCount / (plan.length - 1)) * 100))}%` }))
    );

    if (current >= plan.length - 1) {
      bottomEl.replaceChildren(
        btn("Lihat Ringkasan Pembayaran", {
          onClick: () => {
            updateOrder({ step: "payment" });
            go("#/payment");
          },
        })
      );
    } else if (waitingApproval) {
      bottomEl.replaceChildren(h("p", { class: "muted tiny center" }, "Pengerjaan utama tetap aman. Pilih keputusan untuk rekomendasi di atas."));
    } else {
      bottomEl.replaceChildren(
        h("div", { class: "progress-running" }, h("span", { class: "status-orb" }), h("span", {}, "Progress diperbarui otomatis oleh tukang"))
      );
    }
  }

  function advance() {
    if (waitingApproval || current >= plan.length - 1) return;
    current++;
    render();
    if (!processUpdates()) scheduleNext();
  }

  function scheduleNext() {
    if (waitingApproval || current >= plan.length - 1) return;
    clearTimeout(flowTimer);
    flowTimer = addTimer(setTimeout(advance, 2800));
  }

  /* tombol chat dengan badge jumlah pesan belum dibaca */
  const chatBadge = h("span", { class: "chat-badge", style: "display:none" }, "");
  const chatBtn = h(
    "button",
    { class: "round-btn", type: "button", "aria-label": "Chat tukang", onClick: () => go("#/chat/" + order.id) },
    icon("chat"),
    chatBadge
  );
  function refreshChatBadge() {
    const n = getState().order.chatUnread || 0;
    chatBadge.textContent = n > 9 ? "9+" : String(n);
    chatBadge.style.display = n > 0 ? "grid" : "none";
  }
  refreshChatBadge();

  render();
  if (pendingUpdate) {
    /* user sempat meninggalkan layar saat ada rekomendasi berbayar — tampilkan lagi */
    showPaidApproval(pendingUpdate);
  } else {
    scheduleNext();
  }

  return screen({
    title: "Progress Pengerjaan",
    content: h(
      "div",
      { class: "stack" },
      h(
        "div",
        { class: "card driver-card flat" },
        h(
          "div",
          { class: "driver-head" },
          photoAvatar(w),
          h(
            "div",
            { class: "driver-info" },
            h("strong", {}, w.name),
            h(
              "div",
              { class: "driver-badges" },
              h("span", { class: "live-dot" }, "LIVE"),
              h("span", { class: "row-sub" }, s.name + " · " + order.id)
            )
          ),
          h(
            "div",
            { class: "contact-btns" },
            chatBtn,
            h(
              "button",
              { class: "round-btn", type: "button", "aria-label": "Telepon", onClick: () => toast("Panggilan — simulasi") },
              icon("phone")
            )
          )
        )
      ),
      summaryEl,
      h("div", { class: "card progress-card" }, listEl),
      updateEl
    ),
    bottom: bottomEl,
  });
}

/* ---------- 15. Pembayaran ---------- */
export function PaymentScreen() {
  const st = getState();
  const order = st.order;
  const s = getService(order.serviceId);

  let base;
  if (order.agreedPrice) base = order.agreedPrice;
  else if (order.estimate) base = Math.round((order.estimate.min + order.estimate.max) / 2 / 1000) * 1000;
  else base = 450000;

  const extras = order.extraCosts || [];
  const extrasSum = extras.reduce((a, c) => a + c.amount, 0);

  /* diskon voucher */
  const v = order.voucher ? getVoucher(order.voucher) : null;
  let discount = 0;
  if (v) {
    if (v.type === "pct") discount = Math.min(Math.round((base + extrasSum) * v.pct), v.max);
    else if (v.type === "fee") discount = PLATFORM_FEE;
  }

  const total = base + extrasSum + PLATFORM_FEE - discount;

  let method = st.balance >= total ? "kangpay" : "qris";
  const methodsEl = h("div", { class: "list" });
  const renderMethods = () => {
    methodsEl.replaceChildren(
      ...PAYMENT_METHODS.map((m) => {
        const isKangpay = m.id === "kangpay";
        const insufficient = isKangpay && st.balance < total;
        return h(
          "button",
          {
            class: "loc-row" + (method === m.id ? " active" : ""),
            type: "button",
            onClick: () => {
              if (insufficient) {
                toast("Saldo KangPay kurang — top up dulu atau pilih metode lain");
                return;
              }
              method = m.id;
              renderMethods();
            },
          },
          h("span", { class: "row-icon " + (isKangpay ? "tint-yellow" : m.id === "qris" ? "tint-blue" : "tint-green") }, icon(m.icon)),
          h(
            "div",
            { class: "row-main" },
            h("strong", {}, m.name),
            h("span", { class: "row-sub" }, isKangpay ? "Saldo: " + fmtRp(st.balance) + (insufficient ? " (kurang)" : "") : m.desc)
          ),
          h("span", { class: "radio" + (method === m.id ? " on" : "") })
        );
      })
    );
  };
  renderMethods();

  const payBtn = btn("Bayar " + fmtRp(total), {
    onClick: async () => {
      payBtn.disabled = true;
      payBtn.textContent = "Memproses pembayaran…";
      await processPayment();
      let cashbackAmount = 0;
      if (v && v.type === "cashback") {
        if (method === "kangpay") {
          cashbackAmount = Math.min(total * v.pct, v.max || Infinity);
        }
      }

      if (method === "kangpay") {
        adjustBalance(-total);
        if (cashbackAmount > 0) {
          adjustBalance(cashbackAmount);
          toast("Pembayaran berhasil ✓ Cashback " + fmtRp(cashbackAmount) + " masuk ke KangPay!");
        } else {
          toast("Pembayaran berhasil ✓");
        }
      } else {
        if (v && v.type === "cashback") {
          toast("Pembayaran berhasil ✓ (Cashback gagal: tidak pakai KangPay)");
        } else {
          toast("Pembayaran berhasil ✓");
        }
      }

      addHistory({
        id: order.id,
        serviceName: s.name,
        date: "Hari ini",
        total,
        status: "Selesai",
      });
      setState({ activeVoucher: null });
      updateOrder({ step: "rating", paidTotal: total, paymentMethod: method });
      go("#/rating");
    },
  });

  return screen({
    title: "Pembayaran",
    content: h(
      "div",
      { class: "stack" },
      h(
        "div",
        { class: "card" },
        h("h3", { class: "h3", style: "margin-bottom:10px" }, "Ringkasan biaya"),
        h(
          "div",
          { class: "breakdown" },
          lineRow("Jasa — " + s.name, fmtRp(base)),
          extras.map((c) => lineRow(c.label, fmtRp(c.amount), "extra-line")),
          lineRow("Biaya layanan aplikasi", fmtRp(PLATFORM_FEE)),
          v && discount > 0 ? lineRow("Voucher " + v.code, "−" + fmtRp(discount), "discount") : null,
          v && v.type === "cashback" ? lineRow("Cashback KangPay", fmtRp(Math.min(total * v.pct, v.max || Infinity)), "discount") : null,
          lineRow("Total", fmtRp(total), "strong")
        ),
        extras.length
          ? h("p", { class: "muted tiny", style: "margin-top:8px" }, "Biaya tambahan berasal dari tahapan ekstra yang dikonfirmasi saat pengerjaan.")
          : null
      ),
      h(
        "div",
        { class: "fair-note strong-note" },
        icon("shield"),
        h(
          "div",
          {},
          h("strong", {}, "Sesuai harga yang disepakati"),
          h("span", {}, "Harga jasa terkunci sebelum promo. Hanya pekerjaan tambahan yang Anda setujui yang masuk tagihan.")
        )
      ),
      h("h3", { class: "h3" }, "Metode pembayaran"),
      methodsEl,
      h("p", { class: "demo-note" }, "Pembayaran diproses setelah seluruh rincian biaya disetujui.")
    ),
    bottom: payBtn,
  });
}

function lineRow(label, value, cls = "") {
  return h("div", { class: "line " + cls }, h("span", {}, label), h("span", {}, value));
}

/* ---------- 16. Rating & review ---------- */
export function RatingScreen() {
  const order = getState().order;
  const w = getWorker(order.workerId);

  let ratingVal = 5;
  const chipsSel = new Set(["Hasil memuaskan"]);
  const chipOptions = ["Ramah", "Rapi", "Cepat", "Hasil memuaskan", "Harga sesuai"];

  const starsEl = h("div", { class: "star-row" });
  const renderStars = () => {
    starsEl.replaceChildren(
      ...[1, 2, 3, 4, 5].map((n) =>
        h(
          "button",
          {
            class: "star-btn" + (n <= ratingVal ? " on" : ""),
            type: "button",
            "aria-label": n + " bintang",
            onClick: () => {
              ratingVal = n;
              renderStars();
            },
          },
          "★"
        )
      )
    );
  };
  renderStars();

  const chipsEl = h("div", { class: "chips center-chips" });
  const renderChips = () => {
    chipsEl.replaceChildren(
      ...chipOptions.map((c) =>
        h(
          "button",
          {
            class: "chip" + (chipsSel.has(c) ? " active" : ""),
            type: "button",
            onClick: () => {
              chipsSel.has(c) ? chipsSel.delete(c) : chipsSel.add(c);
              renderChips();
            },
          },
          c
        )
      )
    );
  };
  renderChips();

  const ta = h("textarea", { class: "input", rows: 3, placeholder: "Tulis ulasan (opsional)" });

  return screen({
    title: "Nilai Tukang",
    content: h(
      "div",
      { class: "stack center-text" },
      h("div", { style: "display:flex;justify-content:center;padding-top:8px" }, photoAvatar(w, "xl")),
      h("h2", { class: "h2 center" }, "Bagaimana pengerjaan " + w.name.split(" ")[0] + "?"),
      h("p", { class: "muted tiny center" }, "Rating ini khusus untuk kinerja tukang, bukan jenis layanan."),
      starsEl,
      chipsEl,
      ta
    ),
    bottom: btn("Kirim Penilaian", {
      onClick: () => {
        const st = getState();
        st.lastRating = { stars: ratingVal, chips: [...chipsSel], text: ta.value };
        const history = st.history || [];
        if (history.length > 0 && history[0].id === st.order?.id) {
          history[0].rating = ratingVal;
        }
        setState({ lastRating: st.lastRating, history: history });
        updateOrder({ step: "done" });
        go("#/done");
      },
    }),
  });
}

/* ---------- 17. Pesanan selesai ---------- */
export function DoneScreen() {
  const st = getState();
  const order = st.order;
  const s = order ? getService(order.serviceId) : null;

  return screen({
    title: null,
    cls: "start-screen",
    content: h(
      "div",
      { class: "start-inner" },
      h("div", { class: "done-check" }, icon("check")),
      h("h1", { class: "h2 center" }, "Pesanan selesai 🎉"),
      h(
        "p",
        { class: "muted center" },
        "Terima kasih telah menggunakan KangTukang. Bukti pembayaran dan detail pesanan tersimpan di Aktivitas."
      ),
      s &&
        h(
          "div",
          { class: "card full-width" },
          h(
            "div",
            { class: "breakdown" },
            lineRow("Layanan", s.name),
            order.paidTotal ? lineRow("Total dibayar", fmtRp(order.paidTotal)) : null,
            st.lastRating ? lineRow("Rating Anda", "★".repeat(st.lastRating.stars)) : null
          )
        ),
      h(
        "div",
        { class: "stack-sm full-width" },
        btn("Kembali ke Beranda", {
          onClick: () => {
            updateOrder({ step: "done" });
            go("#/home");
          },
        })
      )
    ),
  });
}
