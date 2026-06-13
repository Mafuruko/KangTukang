# KangTukang

**Andalan Rumah Tangga, Sahabat Dompet Anda.**

Prototype MVP untuk demo expo: landing page + aplikasi demo interaktif (PWA mobile-first) untuk memesan jasa tukang secara online. Seluruh fitur backend (login, pencarian tukang, GPS/tracking, pembayaran) adalah **simulasi/gimik** — tidak ada server, database, atau transaksi sungguhan.

## Struktur

```
/
├── index.html          # Landing page (CTA "Coba Demo" → app/)
├── style.css
├── script.js
├── assets/img/         # Logo & ilustrasi brand
└── app/                # Aplikasi demo (SPA statis)
    ├── index.html
    ├── css/app.css     # Design tokens dari palette brand
    ├── js/
    │   ├── app.js            # Router (hash-based) + reset expo
    │   ├── data.js           # SEMUA data dummy (mudah diedit)
    │   ├── sim.js            # Lapisan simulasi "backend"
    │   ├── store.js          # State demo (sessionStorage)
    │   ├── ui.js             # Helper UI & komponen
    │   ├── screens-order.js  # Layar: start → checkout
    │   └── screens-live.js   # Layar: searching → demo selesai
    ├── manifest.webmanifest
    └── sw.js           # Service worker (cache asset)
```

## Tech stack & alasannya

**Vanilla JavaScript (ES Modules) + hash routing, tanpa framework dan tanpa build step.**

- Prototype statis untuk expo: tidak butuh state kompleks, SSR, atau ekosistem komponen — framework akan overkill.
- Konsisten dengan landing page existing (vanilla HTML/CSS/JS).
- Bundle sangat ringan → cepat dimuat di HP lewat jaringan seluler setelah scan QR.
- Tidak ada `npm install`/build: folder ini langsung bisa dideploy apa adanya.
- Data dummy terpusat di `app/js/data.js`, terpisah dari komponen UI; lapisan simulasi backend terpisah di `app/js/sim.js`.

## Menjalankan lokal

Butuh web server statis apa pun (ES modules tidak jalan via `file://`):

```bash
npx serve .
# atau
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000` (landing) atau `http://localhost:8000/app/` (demo).

## Deploy (Vercel / Netlify)

Tidak perlu build. Deploy folder ini sebagai static site:

- **Vercel:** `vercel --prod` dari root folder, atau import repo → framework preset "Other", tanpa build command, output directory `.`
- **Netlify:** drag & drop folder ini ke Netlify Drop, atau publish directory `.` tanpa build command.

**QR code expo** → arahkan ke `https://<domain>/app/?mode=expo&reset=true` agar setiap pengunjung mulai dari awal.

## Alur demo (± 3 menit)

Start → Login demo → Beranda → Pilih kategori & layanan → Detail kebutuhan → Lokasi → Estimasi → Konfirmasi detail & promo → Mencari tukang → Tukang ditemukan → Persetujuan harga jasa dua arah (setuju, hitung ulang, atau cari mitra lain) → Tracking → Progress pengerjaan realtime (tahapan baru hanya muncul saat ditemukan dan biaya tambahan wajib disetujui) → Pembayaran setelah promo → Rating tukang → Selesai / Ulangi demo.

Proses pencarian, kedatangan, mulai pengerjaan, dan progress berjalan otomatis agar alurnya terasa seperti aplikasi produksi. Negosiasi harga berlangsung melalui chat tersimpan dengan kartu penawaran interaktif; setelah pesanan tidak aktif, percakapan tetap tersedia sebagai arsip read-only.

## Mengedit data dummy

Semua di `app/js/data.js`: kategori, layanan (termasuk skema form & aturan harga), mitra tukang, lokasi demo, template progress per layanan, progress dinamis tambahan, script chat negosiasi, metode pembayaran, dan biaya platform. Tidak ada data yang di-hardcode di layar.

## Catatan

- State demo disimpan di `sessionStorage` saja; tombol **Reset/Ulangi Demo** atau query `?reset=true` membersihkannya.
- Tidak ada data sensitif yang diminta maupun dikirim.
- Mode demo selalu ditandai strip "Mode Demo — pesanan tidak benar-benar dibuat".
 
