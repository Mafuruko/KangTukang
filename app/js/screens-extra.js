/* ============================================================
   KangTukang — LAYAR PENDUKUNG (tab app)
   promo, aktivitas/riwayat, profil, top up
   ============================================================ */

import { DEMO_USER, DEMO_HISTORY, VOUCHERS, TOPUP_AMOUNTS, TOPUP_METHODS, getService, getWorker, getCategory, getProgressPhoto, SERVICES } from "./data.js";
import { wait, workerOffer, negotiatedOffer } from "./sim.js";
import { getState, setState, updateOrder, adjustBalance, addHistory, logout } from "./store.js";
import { h, icon, screen, btn, fmtRp, photoAvatar, toast, addTimer, stars } from "./ui.js";

const go = (hash) => (location.hash = hash);

/* ---------- Promo ---------- */
export function PromoScreen() {
  const listEl = h("div", { class: "stack" });

  /* render ulang di tempat — tanpa pindah halaman */
  function renderVouchers() {
    const st = getState();
    listEl.replaceChildren(
      ...VOUCHERS.map((v) => {
        const used = st.activeVoucher === v.code;
        return h(
          "div",
          { class: "card voucher-card" },
          h("span", { class: "voucher-left" }, icon("tag")),
          h(
            "div",
            { class: "voucher-body" },
            h("strong", {}, v.title),
            h("span", { class: "row-sub voucher-desc" }, v.desc),
            h("span", { class: "row-sub", style: "color:var(--brand);font-weight:700;margin-top:2px" }, "S&K Berlaku >")
          ),
          h(
            "div",
            { class: "voucher-act" },
            v.type === "expired" || v.type === "disabled" ? h("span", { class: "soon-badge", style: "background: #ffebe9; color: var(--accent); border: 1px solid #ffdce0;" }, v.type === "expired" ? "Habis" : "S&K") :
            v.type === "cashback"
              ? h("span", { class: "soon-badge" }, "Otomatis")
              : h(
                  "button",
                  {
                    class: "app-btn app-btn-" + (used ? "secondary" : "primary") + " small",
                    type: "button",
                    onClick: () => {
                      if (used) {
                        setState({ activeVoucher: null });
                        toast("Voucher dilepas");
                      } else {
                        setState({ activeVoucher: v.code });
                        toast("Voucher " + v.code + " siap dipakai saat checkout 🎉");
                      }
                      renderVouchers();
                    },
                  },
                  used ? "Terpakai ✓" : "Pakai"
                )
          )
        );
      })
    );
  }
  renderVouchers();

  return screen({
    title: "Promo & Voucher",
    nav: "promo",
    content: h(
      "div",
      { class: "stack" },
      h("p", { class: "muted tiny" }, "Pilih voucher yang ingin digunakan pada pesanan berikutnya."),
      listEl
    ),
  });
}

/* ---------- Aktivitas / riwayat ---------- */
export function ActivityScreen() {
  const st = getState();
  const items = [];

  /* pesanan aktif — hanya setelah benar-benar dikonfirmasi (cari tukang dst.),
     bukan saat user masih menyusun pesanan (form/lokasi/checkout) */
  const CONFIRMED_STEPS = ["searching", "found", "price-agreement", "tracking", "progress", "payment", "rating"];
  if (st.order && CONFIRMED_STEPS.includes(st.order.step)) {
    const s = getService(st.order.serviceId);
    const stepHash = st.order.step === "price-agreement" ? "#/chat/" + st.order.id : ({
      form: "#/form",
      searching: "#/searching",
      found: "#/found",
      tracking: "#/tracking",
      progress: "#/progress",
      payment: "#/payment",
      rating: "#/rating",
    }[st.order.step] || "#/home");
    items.push(
      h("h3", { class: "h3" }, "Sedang berlangsung"),
      h(
        "button",
        { class: "list-row", type: "button", onClick: () => go(stepHash) },
        h("span", { class: "row-icon tint-yellow" }, icon("wrench")),
        h(
          "div",
          { class: "row-main" },
          h("strong", {}, s ? s.name : "Pesanan"),
          h("span", { class: "row-sub" }, "No. " + st.order.id + " · ketuk untuk lanjut")
        ),
        h("span", { class: "status-pill status-active" }, "Berjalan")
      )
    );
  }

  const all = [...(st.history || []), ...DEMO_HISTORY];
  items.push(h("h3", { class: "h3" }, "Riwayat pesanan"));
  if (!all.length) {
    items.push(h("p", { class: "muted tiny" }, "Belum ada riwayat."));
  } else {
    items.push(
      h(
        "div",
        { class: "list" },
        all.map((o) => {
          const sObj = SERVICES.find(x => x.name === o.serviceName);
          const cat = sObj ? getCategory(sObj.catId) : { icon: "doc", tint: "green" };
          return h(
            "button",
            { class: "list-row", type: "button", onClick: () => toast("Detail pesanan tersimpan di Aktivitas") },
            h("span", { class: "row-icon tint-" + cat.tint }, icon(cat.icon)),
            h(
              "div",
              { class: "row-main" },
              h("strong", {}, o.serviceName),
              h("span", { class: "row-sub" }, o.date + " · " + o.id),
              h("span", { class: "row-price" }, fmtRp(o.total))
            ),
            h(
              "div",
              { class: "row-meta" },
              h("span", { class: "status-pill status-done" }, o.status),
              o.rating && h("span", { class: "stars", "aria-label": "Rating tukang " + o.rating }, icon("star", "star-ic"), " " + o.rating.toFixed(1))
            )
          )
        })
      )
    );
  }

  return screen({
    title: "Aktivitas",
    nav: "activity",
    content: h("div", { class: "stack" }, items),
  });
}

/* ---------- Pesan ---------- */
export function MessagesScreen() {
  const st = getState();
  const order = st.order;
  const service = order ? getService(order.serviceId) : null;
  const worker = order && order.workerId ? getWorker(order.workerId) : null;
  const isActive = order && order.step && order.step !== "done";

  const activeThread = worker && isActive
    ? h(
        "button",
        {
          class: "list-row message-thread",
          type: "button",
          onClick: () => go("#/chat/" + order.id),
        },
        photoAvatar(worker),
        h(
          "div",
          { class: "row-main" },
          h("strong", {}, worker.name),
          h("span", { class: "row-sub message-preview" }, order.agreedPrice ? "Harga telah disepakati. Sampai bertemu di lokasi." : "Saya sudah mengirim penawaran harga."),
          h("span", { class: "message-context" }, service ? service.name : "Pesanan aktif")
        ),
        order.chatUnread
          ? h("span", { class: "unread-count" }, order.chatUnread > 9 ? "9+" : String(order.chatUnread))
          : h("span", { class: "unread-dot" })
      )
    : h(
        "div",
        { class: "empty-state compact-empty" },
        icon("chat"),
        h("p", { class: "muted tiny" }, "Tidak ada chat layanan yang sedang aktif.")
      );

  const archived = [
    ...(worker && !isActive
      ? [{ id: order.id, worker, serviceName: service.name, preview: "Pesanan selesai. Terima kasih sudah menggunakan layanan saya." }]
      : []),
    { id: "KT-8821", worker: getWorker("w1"), serviceName: "Cuci AC Rutin", preview: "AC sudah dites dan dingin kembali, Kak." },
    { id: "KT-8514", worker: getWorker("w4"), serviceName: "Cleaning Reguler", preview: "Seluruh ruangan sudah selesai dibersihkan." },
  ];

  return screen({
    title: "Pesan",
    nav: "messages",
    content: h(
      "div",
      { class: "stack page-section" },
      h("div", { class: "message-section-title active" }, h("span", { class: "status-orb" }), h("h3", { class: "h3" }, "Layanan aktif")),
      activeThread,
      h("div", { class: "message-section-title" }, h("h3", { class: "h3" }, "Chat sebelumnya"), h("span", {}, archived.length + " percakapan")),
      h(
        "div",
        { class: "list" },
        archived.map((item) =>
          h(
            "button",
            { class: "list-row message-thread archived", type: "button", onClick: () => go("#/chat/" + item.id) },
            photoAvatar(item.worker),
            h(
              "div",
              { class: "row-main" },
              h("strong", {}, item.worker.name),
              h("span", { class: "row-sub message-preview" }, item.preview),
              h("span", { class: "message-context" }, item.serviceName)
            ),
            icon("chevR", "chev")
          )
        )
      )
    ),
  });
}

/* ---------- Detail chat ---------- */
export function ChatScreen(threadId) {
  const st = getState();
  const order = st.order;
  const isCurrent = !!order && order.id === threadId;

  if (!isCurrent) return archivedChatScreen(threadId);

  const service = getService(order.serviceId);
  const worker = getWorker(order.workerId);
  const cat = getCategory(service.catId);

  /* pesan dibaca → hapus badge belum-dibaca */
  if (order.chatUnread) updateOrder({ chatUnread: 0 });

  /* konteks live: chat tahu sedang di fase apa (perjalanan / pengerjaan) */
  const inProgress = order.step === "progress";
  const inTransit = order.step === "tracking";
  const isLive = inProgress || inTransit;
  const progressLabel = order.progressLabel || "Persiapan";
  const stageLabel = inProgress ? progressLabel : "Dalam perjalanan";
  const progressPhoto = getProgressPhoto(service.catId);

  let activeOffer = order.agreedPrice || (order.priceRevisionCount ? negotiatedOffer(workerOffer(order.estimate)) : workerOffer(order.estimate));
  let canNegotiate = order.step === "price-agreement" && !order.agreedPrice && !order.priceRevisionCount;
  let canAccept = order.step === "price-agreement" && !order.agreedPrice;

  let messages = order.chatMessages?.length
    ? [...order.chatMessages]
    : [
        { from: "worker", text: `Halo Kak John, saya sudah meninjau detail pekerjaan ${service.name}.` },
        { from: "worker", text: "Penawaran saya sudah termasuk jasa, alat kerja, dan pembersihan area setelah selesai." },
      ];
  if (!order.chatMessages?.length) updateOrder({ chatMessages: messages });

  const chatEl = h("div", { class: "chat chat-detail" });
  const composer = h("div", { class: "chat-composer-wrap" });

  function persist() {
    updateOrder({ chatMessages: messages });
  }

  /* ----- persetujuan pekerjaan tambahan via chat (sinkron dengan layar progress) ----- */
  let approvalDecided = null; // "approved" | "skipped" (keputusan di sesi chat ini)

  function aLine(label, value, cls = "") {
    return h("div", { class: "line " + cls }, h("span", {}, label), h("span", {}, value));
  }

  function approveFromChat() {
    const ord = getState().order;
    const ps = ord.progressSteps;
    if (!ps || !ps.pendingUpdate) return;
    const u = ps.pendingUpdate;
    const injected = u.steps.map((label, i) => ({
      label,
      extra: true,
      note: i === 0,
      updateType: u.type,
      badge: "Detail dari tukang",
    }));
    const steps = [...ps.steps];
    steps.splice((ps.current || 0) + 1, 0, ...injected);
    const costs = [...(ord.extraCosts || [])];
    if (u.cost && !costs.some((c) => c.label === u.cost.label)) costs.push({ ...u.cost, approved: true });
    updateOrder({ progressSteps: { ...ps, steps, pendingUpdate: null }, extraCosts: costs });
    approvalDecided = "approved";
    messages.push({ from: "user", text: "Saya setujui pekerjaan tambahannya, silakan lanjut Pak 👍", state: stageLabel });
    persist();
    renderChat();
    toast("Pekerjaan tambahan disetujui");
    workerReplies([{ from: "worker", text: "Siap Kak, saya kerjakan sekalian ya. Terima kasih 🙏", state: stageLabel }]);
  }

  function skipFromChat() {
    const ord = getState().order;
    const ps = ord.progressSteps;
    if (!ps || !ps.pendingUpdate) return;
    updateOrder({ progressSteps: { ...ps, pendingUpdate: null } });
    approvalDecided = "skipped";
    messages.push({ from: "user", text: "Untuk yang ini dilewati dulu ya, Pak 🙏", state: stageLabel });
    persist();
    renderChat();
    workerReplies([{ from: "worker", text: "Baik Kak, saya lanjutkan pekerjaan utamanya 👍", state: stageLabel }]);
  }

  function approvalBubble() {
    const ps = getState().order.progressSteps;
    const u = ps ? ps.pendingUpdate : null;
    if (!u && !approvalDecided) return null;
    if (!u) {
      return h(
        "div",
        { class: "chat-offer-card inactive" },
        h("span", { class: "price-box-label" }, "Pekerjaan tambahan"),
        h(
          "span",
          { class: "offer-locked" },
          icon("check"),
          approvalDecided === "approved" ? "Disetujui — dikerjakan sekalian" : "Dilewati"
        )
      );
    }
    return h(
      "div",
      { class: "chat-offer-card approval-card" },
      h("span", { class: "paid-badge" }, "PERLU PERSETUJUAN"),
      h("strong", {}, "Rekomendasi dari tukang"),
      h("p", { class: "muted tiny", style: "margin:0" }, u.note),
      h(
        "div",
        { class: "breakdown" },
        aLine("Pekerjaan", u.steps.join(", "), "block"),
        u.cost && aLine("Tambahan biaya", fmtRp(u.cost.amount), "strong")
      ),
      h(
        "div",
        { class: "inline-actions" },
        btn("Setujui", { small: true, onClick: approveFromChat }),
        btn("Lewati", { variant: "secondary", small: true, onClick: skipFromChat })
      )
    );
  }

  function offerBubble() {
    const disabled = !canAccept;
    const ord = getState().order;
    const extras = ord.agreedPrice ? ord.extraCosts || [] : [];
    const extrasSum = extras.reduce((a, c) => a + c.amount, 0);
    const total = ord.agreedPrice ? ord.agreedPrice + extrasSum : activeOffer;

    return h(
      "div",
      { class: "chat-offer-card" + (disabled ? " inactive" : "") },
      h(
        "span",
        { class: "price-box-label" },
        ord.agreedPrice
          ? extras.length
            ? "Harga jasa + pekerjaan tambahan"
            : "Harga jasa disepakati"
          : !canNegotiate
          ? "Penawaran final tukang"
          : "Penawaran harga jasa"
      ),
      h("strong", {}, fmtRp(total)),
      extras.length
        ? h(
            "div",
            { class: "breakdown offer-breakdown" },
            h("div", { class: "line" }, h("span", {}, "Jasa disepakati"), h("span", {}, fmtRp(ord.agreedPrice))),
            extras.map((c) =>
              h("div", { class: "line" }, h("span", {}, c.label), h("span", { class: "extra-amount" }, "+" + fmtRp(c.amount)))
            )
          )
        : null,
      h("span", { class: "muted tiny" }, "Belum termasuk promo dan biaya aplikasi"),
      disabled
        ? h("span", { class: "offer-locked" }, icon("check"), "Harga telah dikunci")
        : btn("Setujui Harga", { small: true, onClick: acceptOffer })
    );
  }

  function renderChat() {
    chatEl.replaceChildren(
      h("div", { class: "chat-day" }, isCurrent && order.step !== "done" ? "Hari ini · Pesanan aktif" : "Riwayat percakapan"),
      ...messages.flatMap((m) => {
        const out = [];
        if (m.photo) {
          out.push(
            h(
              "div",
              { class: "bubble " + m.from + " photo" },
              h("img", { src: m.photo, alt: "Foto progress", loading: "lazy" }),
              m.text ? h("span", { class: "photo-caption" }, m.text) : null
            )
          );
        } else {
          out.push(h("div", { class: "bubble " + m.from }, m.text));
        }
        /* penanda: pesan ini dikirim saat tahap progress apa */
        if (m.state) out.push(h("span", { class: "bubble-meta " + m.from }, "saat: “" + m.state + "”"));
        return out;
      }),
      ...[offerBubble(), approvalBubble()].filter(Boolean)
    );
    requestAnimationFrame(() => {
      const sc = document.querySelector(".screen-body");
      if (sc) sc.scrollTop = sc.scrollHeight;
    });
  }

  function acceptOffer() {
    messages.push({ from: "user", text: `Saya setuju dengan harga jasa ${fmtRp(activeOffer)}.` });
    persist();
    updateOrder({ agreedPrice: activeOffer, priceAgreedAt: new Date().toISOString(), step: "tracking" });
    toast("Harga disepakati dan dikunci");
    go("#/tracking");
  }

  async function sendNegotiation() {
    if (!input.value.trim()) return;
    const text = input.value;
    input.value = "";
    sendBtn.disabled = true;
    input.disabled = true;
    messages.push(isLive ? { from: "user", text: text, state: stageLabel } : { from: "user", text: text });
    persist();
    renderChat();

    /* Easter egg: request foto/selfie */
    const lowerText = text.toLowerCase();
    if (lowerText.includes("foto") || lowerText.includes("selfie")) {
      await workerReplies([
        { from: "worker", text: "Ini fotonya Kak 📷" },
        { from: "worker", photo: "img/progress/generic.jpg", text: "Foto", state: isLive ? stageLabel : "Chat" }
      ]);
      sendBtn.disabled = false;
      input.disabled = false;
      renderComposer();
      return;
    }

    if (!canNegotiate) {
        composer.replaceChildren(h("div", { class: "typing-bar" }, h("span", { class: "status-orb" }), worker.name.split(" ")[0] + " sedang mengetik..."));
        await new Promise((resolve) => addTimer(setTimeout(resolve, 900)));
        messages.push(
          inProgress
            ? { from: "worker", text: "Siap Kak 👍 Saya lanjutkan pekerjaannya ya.", state: progressLabel }
            : inTransit
            ? { from: "worker", text: "Siap Kak, saya sedang menuju lokasi 🛵", state: stageLabel }
            : { from: "worker", text: "Baik Kak, ditunggu konfirmasinya." }
        );
        persist();
        renderChat();
        sendBtn.disabled = false;
        input.disabled = false;
        renderComposer();
        return;
    }

    composer.replaceChildren(h("div", { class: "typing-bar" }, h("span", { class: "status-orb" }), worker.name.split(" ")[0] + " sedang mengetik..."));
    await new Promise((resolve) => addTimer(setTimeout(resolve, 900)));
    const finalOffer = negotiatedOffer(activeOffer);
    activeOffer = finalOffer;
    canNegotiate = false;
    messages.push({ from: "worker", text: `Bisa Kak. Penawaran final saya ${fmtRp(finalOffer)}. Harga ini sudah paling sesuai untuk cakupan pekerjaannya.` });
    updateOrder({ priceRevisionCount: 1, chatMessages: messages });
    renderChat();
    sendBtn.disabled = false;
    input.disabled = false;
    renderComposer();
  }

  /* ----- quick reply saat pengerjaan berlangsung ----- */
  function quickReply(label, onClick) {
    return h("button", { class: "chip quick-reply", type: "button", onClick }, label);
  }

  async function workerReplies(replies) {
    composer.replaceChildren(
      h("div", { class: "typing-bar" }, h("span", { class: "status-orb" }), worker.name.split(" ")[0] + " sedang mengetik...")
    );
    await new Promise((r) => addTimer(setTimeout(r, 1100)));
    for (const rep of replies) messages.push(rep);
    persist();
    renderChat();
    renderComposer();
  }

  function sendPhotoRequest() {
    messages.push({ from: "user", text: "Bisa saya lihat progressnya? 📷", state: progressLabel });
    persist();
    renderChat();
    workerReplies([
      { from: "worker", text: "Siap Kak, ini foto pekerjaannya 👍" },
      { from: "worker", photo: progressPhoto, text: "Foto saat “" + progressLabel + "”", state: progressLabel },
    ]);
  }

  function sendWhereAreWe() {
    messages.push({ from: "user", text: inTransit ? "Sudah di mana, Pak?" : "Sudah sampai mana, Pak?", state: stageLabel });
    persist();
    renderChat();
    workerReplies([
      inTransit
        ? { from: "worker", text: "Saya sedang di jalan menuju lokasi Kak, sebentar lagi sampai 🛵", state: stageLabel }
        : { from: "worker", text: "Sekarang sedang tahap “" + progressLabel + "” Kak. Aman, sesuai rencana 👍", state: progressLabel },
    ]);
  }

  function sendCareful() {
    messages.push({ from: "user", text: "Hati-hati di jalan, Pak 🙏" });
    persist();
    renderChat();
    workerReplies([{ from: "worker", text: "Siap, terima kasih Kak 🙏" }]);
  }

  function sendThanks() {
    messages.push({ from: "user", text: "Terima kasih, Pak 🙏" });
    persist();
    renderChat();
    workerReplies([{ from: "worker", text: "Sama-sama, Kak 🙏" }]);
  }

  function renderComposer() {
    if (isLive) {
      const quicks = inProgress
        ? [
            quickReply("Bisa saya lihat progressnya? 📷", sendPhotoRequest),
            quickReply("Sudah sampai mana, Pak?", sendWhereAreWe),
            quickReply("Terima kasih 🙏", sendThanks),
          ]
        : [
            quickReply("Sudah di mana, Pak?", sendWhereAreWe),
            quickReply("Hati-hati di jalan 🙏", sendCareful),
          ];
      composer.replaceChildren(
        h("div", { class: "quick-replies" }, quicks),
        h(
          "div",
          { class: "chat-composer" },
          h("button", { class: "round-btn", type: "button", style: "flex-shrink:0; background:var(--surface-2); color:var(--muted); border:none;", "aria-label": "Kirim Gambar", onClick: () => toast("Fitur kirim gambar (demo)") }, icon("camera")),
          input,
          sendBtn
        )
      );
    } else if (order.agreedPrice) {
      composer.replaceChildren(h("div", { class: "chat-readonly" }, icon("shield"), "Percakapan tersimpan · harga sudah disepakati"));
    } else {
      const banner = !canNegotiate ? h("div", { class: "chat-warning-banner" }, icon("shield"), "Penawaran ini sudah final.") : "";
      composer.replaceChildren(
        banner ? banner : "",
        h("div", { class: "chat-composer" }, 
          h("button", { class: "round-btn", type: "button", style: "flex-shrink:0; background:var(--surface-2); color:var(--muted); border:none;", "aria-label": "Kirim Gambar", onClick: () => toast("Fitur kirim gambar (demo)") }, icon("camera")),
          input, 
          sendBtn
        )
      );
    }
  }

  const input = h("input", {
    class: "input chat-input",
    placeholder: "Tulis pesan...",
    value: canNegotiate ? "Apakah harga masih bisa disesuaikan mendekati estimasi awal?" : "",
    "aria-label": "Tulis pesan",
  });
  const sendBtn = btn("Kirim", { small: true, full: false, onClick: sendNegotiation });

  renderComposer();

  renderChat();
  const stickyHeader = h(
    "div",
    { class: "chat-sticky-head" },
    h(
      "div",
      { class: "card driver-card flat" },
      h(
        "div",
        { class: "driver-head" },
        photoAvatar(worker, "big"),
        h(
          "div",
          { class: "driver-info" },
          h("strong", {}, worker.name),
          h("span", { class: "row-sub" }, "Mitra " + cat.name + " · " + worker.years + " th pengalaman"),
          h(
            "div",
            { class: "driver-badges" },
            stars(worker.rating),
            h("span", { class: "row-sub" }, worker.orders.toLocaleString("id-ID") + " order")
          )
        )
      ),
      inProgress
        ? h(
            "div",
            { class: "chat-progress-chip" },
            icon("wrench"),
            h("span", {}, "Sedang dikerjakan: ", h("strong", {}, progressLabel))
          )
        : inTransit
        ? h(
            "div",
            { class: "chat-progress-chip" },
            icon("pin"),
            h("span", {}, h("strong", {}, worker.name.split(" ")[0]), " sedang menuju lokasi Anda 🛵")
          )
        : null,
      order.step === "price-agreement" ? h(
        "div",
        { class: "inline-actions", style: "margin-top: 0;" },
        btn("Cari Mitra Lain", { variant: "secondary", small: true, onClick: () => {
          updateOrder({ workerId: null, agreedPrice: null, priceRevisionCount: 0, step: "searching", chatMessages: null });
          toast("Mencari mitra lain...");
          go("#/searching");
        } }),
        btn("Batalkan", { variant: "ghost", small: true, style: "color: var(--accent);", onClick: () => {
          updateOrder({ step: "form", workerId: null, agreedPrice: null, chatMessages: null, priceRevisionCount: 0 });
          toast("Pesanan dibatalkan");
          go("#/home");
        } })
      ) : null
    )
  );

  return screen({
    title: worker.name,
    back: inProgress ? "#/progress" : inTransit ? "#/tracking" : "#/messages",
    content: h(
      "div",
      { class: "chat-page" },
      stickyHeader,
      h("div", { class: "stack", style: "margin-top: 14px;" }, chatEl)
    ),
    bottom: composer,
  });
}

function archivedChatScreen(threadId) {
  const archive = {
    "KT-8821": { worker: getWorker("w1"), service: "Cuci AC Rutin", offer: 150000, messages: ["Halo Kak, saya segera menuju lokasi.", "Pembersihan selesai. AC sudah dites dan dingin kembali, Kak."] },
    "KT-8514": { worker: getWorker("w4"), service: "Cleaning Reguler", offer: 210000, messages: ["Saya sudah tiba di lokasi.", "Seluruh ruangan sudah selesai dibersihkan. Terima kasih, Kak."] },
  }[threadId];
  if (!archive) return screen({ title: "Chat", back: "#/messages", content: h("div", { class: "empty-state card" }, h("strong", {}, "Percakapan tidak ditemukan")) });

  const stickyHeader = h(
    "div",
    { class: "chat-sticky-head" },
    h(
      "div",
      { class: "card driver-card flat" },
      h(
        "div",
        { class: "driver-head" },
        photoAvatar(archive.worker, "big"),
        h(
          "div",
          { class: "driver-info" },
          h("strong", {}, archive.worker.name),
          h("span", { class: "row-sub" }, "Mitra · " + archive.worker.years + " th pengalaman"),
          h(
            "div",
            { class: "driver-badges" },
            stars(archive.worker.rating),
            h("span", { class: "row-sub" }, archive.worker.orders.toLocaleString("id-ID") + " order")
          )
        )
      )
    )
  );

  return screen({
    title: archive.worker.name,
    back: "#/messages",
    content: h(
      "div",
      { class: "chat-page" },
      stickyHeader,
      h(
        "div",
        { class: "stack chat-detail", style: "margin-top: 14px;" },
        h("div", { class: "chat-day" }, "Pesanan selesai"),
        ...archive.messages.map((text) => h("div", { class: "bubble worker" }, text)),
        h(
          "div",
          { class: "chat-offer-card inactive" },
          h("span", { class: "price-box-label" }, "Harga jasa disepakati"),
          h("strong", {}, fmtRp(archive.offer)),
          h("span", { class: "offer-locked" }, icon("check"), "Pesanan telah selesai")
        )
      )
    ),
    bottom: h("div", { class: "chat-readonly" }, icon("doc"), "Percakapan lama hanya dapat dilihat"),
  });
}

/* ---------- Profil ---------- */
export function ProfileScreen() {
  const st = getState();
  let confirmLogout = false;

  const logoutRow = h(
    "button",
    {
      class: "menu-row danger",
      type: "button",
      onClick: () => {
        if (!confirmLogout) {
          confirmLogout = true;
          logoutLabel.textContent = "Ketuk sekali lagi untuk keluar";
          setTimeout(() => {
            confirmLogout = false;
            logoutLabel.textContent = "Keluar";
          }, 2500);
          return;
        }
        logout();
        toast("Anda telah keluar");
        go("#/start");
      },
    },
    h("span", { class: "menu-ic" }, icon("logout")),
    h("div", { class: "row-main" }, h("strong", {}, "")),
  );
  const logoutLabel = logoutRow.querySelector("strong");
  logoutLabel.textContent = "Keluar";

  const menuItem = (ic, label, sub, onClick) =>
    h(
      "button",
      { class: "menu-row", type: "button", onClick: onClick || (() => toast(label)) },
      h("span", { class: "menu-ic" }, icon(ic)),
      h("div", { class: "row-main" }, h("strong", {}, label), sub && h("span", { class: "row-sub" }, sub)),
      icon("chevR", "chev")
    );

  return screen({
    title: "Profil",
    back: "#/home",
    content: h(
      "div",
      { class: "stack" },
      h(
        "div",
        { class: "profile-head" },
        photoAvatar(DEMO_USER, "xl"),
        h("h2", { class: "h2" }, DEMO_USER.name),
        h("p", { class: "muted tiny" }, DEMO_USER.phone + " · " + DEMO_USER.email),
        h("span", { class: "member-pill" }, "★ Member sejak " + DEMO_USER.memberSince)
      ),
      /* kartu saldo */
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
          h("button", { class: "wallet-act", type: "button", onClick: () => go("#/topup") }, icon("plus"), "Top Up")
        )
      ),
      h(
        "div",
        { class: "menu-group" },
        menuItem("pin", "Alamat Tersimpan", "Rumah, Apartemen, Kantor"),
        menuItem("wallet", "Metode Pembayaran", "KangPay, QRIS, Tunai"),
        menuItem("tag", "Voucher Saya", null, () => go("#/promo")),
        menuItem("shield", "Keamanan Akun")
      ),
      h(
        "div",
        { class: "menu-group" },
        menuItem("help", "Pusat Bantuan"),
        menuItem("doc", "Syarat & Ketentuan"),
        menuItem("info", "Tentang KangTukang", "Versi 1.0.0")
      ),
      h("div", { class: "menu-group" }, logoutRow),
      h(
        "button",
        {
          class: "link-btn center-block",
          type: "button",
          onClick: () => {
            logout();
            go("#/start");
          },
        },
        "Ulangi demo dari awal"
      ),
      h("p", { class: "demo-note" }, "Kelola profil, keamanan akun, dan preferensi layanan.")
    ),
  });
}

/* ---------- Top Up KangPay ---------- */
export function TopupScreen() {
  let amount = TOPUP_AMOUNTS[1];
  let method = TOPUP_METHODS[0].id;

  const amountGrid = h("div", { class: "amount-grid" });
  const renderAmounts = () => {
    amountGrid.replaceChildren(
      ...TOPUP_AMOUNTS.map((a) =>
        h(
          "button",
          {
            class: "amount-card" + (a === amount ? " active" : ""),
            type: "button",
            onClick: () => {
              amount = a;
              renderAmounts();
              payBtn.textContent = "Top Up " + fmtRp(amount);
            },
          },
          fmtRp(a)
        )
      )
    );
  };

  const methodsEl = h("div", { class: "list" });
  const renderMethods = () => {
    methodsEl.replaceChildren(
      ...TOPUP_METHODS.map((m) =>
        h(
          "button",
          {
            class: "loc-row" + (method === m.id ? " active" : ""),
            type: "button",
            onClick: () => {
              method = m.id;
              renderMethods();
            },
          },
          h("span", { class: "row-icon tint-blue" }, icon("wallet")),
          h("div", { class: "row-main" }, h("strong", {}, m.name), h("span", { class: "row-sub" }, m.desc)),
          h("span", { class: "radio" + (method === m.id ? " on" : "") })
        )
      )
    );
  };

  const payBtn = btn("Top Up " + fmtRp(amount), {
    onClick: async () => {
      payBtn.disabled = true;
      payBtn.textContent = "Memproses…";
      await wait(1400);
      const newBal = adjustBalance(amount);
      addHistory({
        id: "TP-" + Date.now().toString().slice(-5),
        serviceName: "Top Up KangPay",
        date: "Hari ini",
        total: amount,
        status: "Selesai",
      });
      toast("Top up berhasil · Saldo: " + fmtRp(newBal));
      go("#/home");
    },
  });

  renderAmounts();
  renderMethods();

  return screen({
    title: "Top Up KangPay",
    back: "#/home",
    content: h(
      "div",
      { class: "stack" },
      h(
        "div",
        { class: "card", style: "text-align:center" },
        h("span", { class: "price-box-label" }, "Saldo saat ini"),
        h("strong", { class: "estimate-value" }, fmtRp(getState().balance))
      ),
      h("h3", { class: "h3" }, "Pilih nominal"),
      amountGrid,
      h("h3", { class: "h3" }, "Metode top up"),
      methodsEl,
      h("p", { class: "demo-note" }, "Saldo akan bertambah setelah pembayaran berhasil diverifikasi.")
    ),
    bottom: payBtn,
  });
}
