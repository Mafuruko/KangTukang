/* ============================================================
   KangTukang — LAPISAN SIMULASI "BACKEND"
   Semua fungsi di sini meniru perilaku server: delay buatan,
   pencarian tukang, kalkulasi estimasi, dan penawaran harga.
   Tidak ada panggilan jaringan sungguhan.
   ============================================================ */

import { WORKERS } from "./data.js";

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* Kalkulasi estimasi harga dari jawaban form (dummy tapi konsisten) */
export function calcEstimate(service, answers) {
  const p = service.pricing;
  if (!p || !p.base) return null; // perlu konsultasi
  let [min, max] = p.base;

  if (p.perUnitField && answers[p.perUnitField]) {
    const n = Number(answers[p.perUnitField]) || 1;
    min *= n;
    max *= n;
  }
  if (p.addons) {
    for (const [fieldId, map] of Object.entries(p.addons)) {
      const v = answers[fieldId];
      if (v && map[v]) {
        min += map[v];
        max += map[v];
      }
    }
  }
  return { min, max };
}

/* Harga "penawaran tukang" untuk konsultasi: sedikit di atas tengah estimasi */
export function workerOffer(estimate) {
  if (!estimate) return 450000; // fallback layanan tanpa estimasi (renovasi)
  const mid = (estimate.min + estimate.max) / 2;
  return roundRp(mid * 1.08);
}

/* Harga revisi setelah negosiasi: turun ± 8–12% */
export function negotiatedOffer(offer) {
  return roundRp(offer * 0.9);
}

function roundRp(n) {
  return Math.round(n / 5000) * 5000;
}

/* Simulasi mencari tukang: pilih mitra sesuai kategori */
export async function findWorker(catId) {
  await wait(300); // delay kecil; animasi utama diatur layar pencarian
  const pool = WORKERS.filter((w) => w.skills.includes(catId));
  const list = pool.length ? pool : WORKERS;
  return list[Math.floor(Math.random() * list.length)];
}

/* Simulasi pembayaran */
export async function processPayment() {
  await wait(1600);
  return { ok: true, ref: "PAY-DEMO-" + Date.now().toString().slice(-6) };
}

/* ETA dummy untuk tracking (menit) */
export function initialEta() {
  return 8;
}
