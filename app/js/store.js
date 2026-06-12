/* ============================================================
   KangTukang — STATE DEMO
   State sementara disimpan di sessionStorage (bukan database).
   ============================================================ */

import { INITIAL_BALANCE } from "./data.js";

const KEY = "kt-demo-state";

const initial = () => ({
  loggedIn: false,
  pendingPhone: null,
  balance: INITIAL_BALANCE,
  history: [],          // pesanan yang diselesaikan selama sesi demo
  activeVoucher: null,  // kode voucher terpakai
  order: null,          // pesanan aktif
  lastRating: null,
});

let state = load();

function load() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return { ...initial(), ...JSON.parse(raw) };
  } catch (e) {
    /* abaikan */
  }
  return initial();
}

function persist() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    /* abaikan */
  }
}

export function getState() {
  return state;
}

export function setState(patch) {
  state = { ...state, ...patch };
  persist();
}

export function updateOrder(patch) {
  state.order = { ...(state.order || {}), ...patch };
  persist();
}

export function newOrder(serviceId) {
  state.order = {
    id: "KT-" + String(Math.floor(9000 + Math.random() * 999)),
    serviceId,
    answers: {},
    location: null,
    estimate: null,
    agreedPrice: null,
    priceRevisionCount: 0,
    priceAgreedAt: null,
    workerId: null,
    extraCosts: [],
    progressSteps: null,
    voucher: null,
    step: "form",
  };
  persist();
  return state.order;
}

export function clearOrder() {
  state.order = null;
  persist();
}

export function addHistory(entry) {
  state.history = [entry, ...(state.history || [])];
  persist();
}

export function adjustBalance(delta) {
  state.balance = Math.max(0, (state.balance || 0) + delta);
  persist();
  return state.balance;
}

/* Logout = keluar dari sesi demo (state dibersihkan, seperti app sungguhan) */
export function logout() {
  resetDemo();
}

export function resetDemo() {
  state = initial();
  try {
    sessionStorage.removeItem(KEY);
  } catch (e) {
    /* abaikan */
  }
}
