/* ============================================================
   KangTukang — LAYAR PENDUKUNG (tab app)
   promo, aktivitas/riwayat, profil, top up
   ============================================================ */

import { DEMO_USER, DEMO_HISTORY, VOUCHERS, TOPUP_AMOUNTS, TOPUP_METHODS, getService, getWorker } from "./data.js";
import { wait } from "./sim.js";
import { getState, setState, adjustBalance, addHistory, logout } from "./store.js";
import { h, icon, screen, btn, fmtRp, photoAvatar, toast } from "./ui.js";

const go = (hash) => (location.hash = hash);

/* ---------- Promo ---------- */
export function PromoScreen() {
  const st = getState();

  return screen({
    title: "Promo & Voucher",
    nav: "promo",
    content: h(
      "div",
      { class: "stack" },
      h("p", { class: "muted tiny" }, "Pilih voucher yang ingin digunakan pada pesanan berikutnya."),
      VOUCHERS.map((v) => {
        const used = st.activeVoucher === v.code;
        return h(
          "div",
          { class: "card voucher-card" },
          h("span", { class: "voucher-left" }, icon("tag")),
          h(
            "div",
            { class: "voucher-body" },
            h("strong", {}, v.title),
            h("span", { class: "row-sub" }, v.desc),
            h("span", { class: "row-sub" }, "Berlaku s/d " + v.expiry + " · Kode: " + v.code)
          ),
          h(
            "div",
            { class: "voucher-act" },
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
                      go("#/promo"); // re-render
                    },
                  },
                  used ? "Terpakai ✓" : "Pakai"
                )
          )
        );
      })
    ),
  });
}

/* ---------- Aktivitas / riwayat ---------- */
export function ActivityScreen() {
  const st = getState();
  const items = [];

  /* pesanan aktif */
  if (st.order && st.order.step && st.order.step !== "done") {
    const s = getService(st.order.serviceId);
    const stepHash = {
      form: "#/form",
      searching: "#/searching",
      found: "#/found",
      "price-agreement": "#/price-agreement",
      tracking: "#/tracking",
      progress: "#/progress",
      payment: "#/payment",
      rating: "#/rating",
    }[st.order.step] || "#/home";
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
        all.map((o) =>
          h(
            "button",
            { class: "list-row", type: "button", onClick: () => toast("Detail pesanan tersimpan di Aktivitas") },
            h("span", { class: "row-icon tint-green" }, icon("doc")),
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
              o.rating && h("span", { class: "stars", "aria-label": "Rating tukang " + o.rating }, icon("star", "star-ic"), " Tukang " + o.rating.toFixed(1))
            )
          )
        )
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

  const activeThread = worker
    ? h(
        "button",
        {
          class: "list-row message-thread",
          type: "button",
          onClick: () => go(order.step === "price-agreement" ? "#/price-agreement" : "#/" + (order.step || "activity")),
        },
        photoAvatar(worker),
        h(
          "div",
          { class: "row-main" },
          h("strong", {}, worker.name),
          h("span", { class: "row-sub message-preview" }, order.agreedPrice ? "Harga telah disepakati. Sampai bertemu di lokasi." : "Saya sudah mengirim penawaran harga."),
          h("span", { class: "message-context" }, service ? service.name : "Pesanan aktif")
        ),
        h("span", { class: "unread-dot" })
      )
    : h(
        "div",
        { class: "empty-state card" },
        icon("chat"),
        h("strong", {}, "Belum ada percakapan"),
        h("p", { class: "muted tiny" }, "Percakapan dengan tukang akan muncul setelah pesanan diterima.")
      );

  return screen({
    title: "Pesan",
    nav: "messages",
    content: h("div", { class: "stack page-section" }, h("h3", { class: "h3" }, "Percakapan"), activeThread),
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
