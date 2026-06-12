/* ============================================================
   KangTukang — DATA DUMMY TERPUSAT
   Semua data demo ada di file ini agar mudah diedit.
   Foto memakai placeholder (i.pravatar.cc) — ganti dengan
   foto asli cukup dengan mengubah URL "photo" di bawah.
   ============================================================ */

export const DEMO_USER = {
  name: "John Doe",
  greetingName: "John",
  phone: "+62 812-3456-7890",
  email: "john.doe@kangtukang.id",
  memberSince: "Jan 2026",
  photo: "https://i.pravatar.cc/150?img=12", // placeholder — ganti sesuka hati
};

export const INITIAL_BALANCE = 250000;

export const DEMO_LOCATIONS = [
  {
    id: "loc-1",
    label: "Rumah",
    address: "Jl. Mawar Tengah No. 12, Gubeng, Surabaya",
    note: "Pagar hitam, sebelah warung kopi",
    lat: -7.2754,
    lng: 112.7521,
  },
  {
    id: "loc-2",
    label: "Apartemen",
    address: "Apartemen Sejahtera Tower B Lt. 9, Wonokromo, Surabaya",
    note: "Lobi B, lapor resepsionis",
    lat: -7.3032,
    lng: 112.7387,
  },
  {
    id: "loc-3",
    label: "Kantor",
    address: "Ruko Niaga Blok C-7, Rungkut, Surabaya",
    note: "Jam operasional 08.00–17.00",
    lat: -7.3318,
    lng: 112.7822,
  },
];

/* ---------- Kategori layanan ----------
   comingSoon: true → tampil di katalog tapi belum bisa dipesan di demo
*/
export const CATEGORIES = [
  { id: "ac", name: "Servis AC", desc: "Cuci, perbaikan & pasang AC", icon: "snow", tint: "blue" },
  { id: "listrik", name: "Listrik", desc: "Instalasi, korsleting & lampu", icon: "zap", tint: "yellow" },
  { id: "pipa", name: "Pipa & Air", desc: "Bocor, mampet & instalasi air", icon: "droplet", tint: "teal" },
  { id: "cleaning", name: "Cleaning", desc: "Reguler, deep cleaning & sofa", icon: "sparkle", tint: "green" },
  { id: "renovasi", name: "Renovasi", desc: "Cat, dinding & perbaikan kecil", icon: "roller", tint: "orange" },
  { id: "elektronik", name: "Elektronik", desc: "Mesin cuci, kulkas & lainnya", icon: "plug", tint: "purple" },
  { id: "kayu", name: "Kayu & Furnitur", desc: "Perbaikan & rakit furnitur", icon: "box", tint: "brown", comingSoon: true },
  { id: "taman", name: "Taman", desc: "Potong rumput & perawatan", icon: "leaf", tint: "green", comingSoon: true },
  { id: "cctv", name: "CCTV & Keamanan", desc: "Pasang & servis CCTV", icon: "video", tint: "blue", comingSoon: true },
  { id: "pindahan", name: "Pindahan", desc: "Angkut & pindahan rumah", icon: "truck", tint: "orange", comingSoon: true },
  { id: "pest", name: "Pest Control", desc: "Rayap, tikus & serangga", icon: "shield", tint: "red", comingSoon: true },
];

/* ---------- Layanan ----------
   pricing:
   - base: [min, max] estimasi dasar (Rupiah)
   - perUnitField: id field pengali harga (opsional)
   - addons: { fieldId: { optionValue: tambahanRupiah } } (opsional)
   - consultText: dipakai jika harga butuh konsultasi
*/
export const SERVICES = [
  {
    id: "ac-cuci",
    catId: "ac",
    name: "Cuci AC Rutin",
    short: "Pembersihan unit indoor & outdoor",
    desc: "Pembersihan menyeluruh unit indoor dan outdoor, pengecekan freon ringan, dan testing setelah selesai. Disarankan tiap 3 bulan.",
    sold: 1240,
    duration: "± 45 mnt / unit",
    pricing: { base: [75000, 150000], perUnitField: "unit" },
    needsConsult: false,
    form: [
      { id: "unit", type: "stepper", label: "Jumlah unit AC", min: 1, max: 5, default: 1, suffix: "unit" },
      {
        id: "masalah", type: "choice", label: "Jenis kebutuhan",
        options: [
          { value: "cuci", label: "Cuci rutin" },
          { value: "tidak-dingin", label: "Tidak dingin" },
          { value: "bocor", label: "Bocor / menetes" },
          { value: "berisik", label: "Berisik" },
        ],
        default: "cuci",
      },
      { id: "catatan", type: "textarea", label: "Catatan tambahan (opsional)", placeholder: "Contoh: AC di lantai 2, merk Panasonic" },
    ],
  },
  {
    id: "ac-perbaikan",
    catId: "ac",
    name: "Perbaikan AC",
    short: "AC mati, tidak dingin, atau bocor",
    desc: "Pemeriksaan menyeluruh dan perbaikan AC bermasalah. Biaya part (jika ada) dikonfirmasi dulu sebelum dikerjakan.",
    sold: 860,
    duration: "± 1–2 jam",
    pricing: { base: [125000, 300000], perUnitField: "unit" },
    needsConsult: false,
    form: [
      { id: "unit", type: "stepper", label: "Jumlah unit AC", min: 1, max: 3, default: 1, suffix: "unit" },
      {
        id: "masalah", type: "choice", label: "Jenis masalah",
        options: [
          { value: "tidak-dingin", label: "Tidak dingin" },
          { value: "mati", label: "Mati total" },
          { value: "bocor", label: "Bocor / menetes" },
          { value: "berisik", label: "Berisik" },
        ],
        default: "tidak-dingin",
      },
      { id: "catatan", type: "textarea", label: "Catatan tambahan (opsional)", placeholder: "Ceritakan gejala AC Anda" },
    ],
  },
  {
    id: "ac-pasang",
    catId: "ac",
    name: "Pasang / Bongkar AC",
    short: "Instalasi AC baru atau pindah unit",
    desc: "Pemasangan AC baru atau bongkar-pasang unit pindahan, termasuk vakum dan pengecekan kebocoran instalasi.",
    sold: 410,
    duration: "± 2–3 jam / unit",
    pricing: { base: [150000, 350000], perUnitField: "unit" },
    needsConsult: false,
    form: [
      { id: "unit", type: "stepper", label: "Jumlah unit", min: 1, max: 3, default: 1, suffix: "unit" },
      {
        id: "jenis", type: "choice", label: "Kebutuhan",
        options: [
          { value: "pasang", label: "Pasang baru" },
          { value: "bongkar", label: "Bongkar" },
          { value: "bongkar-pasang", label: "Bongkar + pasang" },
        ],
        default: "pasang",
      },
      { id: "catatan", type: "textarea", label: "Catatan tambahan (opsional)" },
    ],
  },
  {
    id: "listrik-perbaikan",
    catId: "listrik",
    name: "Perbaikan Listrik",
    short: "Korsleting, mati sebagian, stop kontak",
    desc: "Penanganan korsleting, listrik mati sebagian, stop kontak rusak, hingga MCB sering turun. Pengecekan aman sesuai standar.",
    sold: 1015,
    duration: "± 1 jam",
    pricing: { base: [100000, 200000] },
    needsConsult: false,
    form: [
      {
        id: "masalah", type: "choice", label: "Jenis masalah",
        options: [
          { value: "korslet", label: "Korsleting / MCB turun" },
          { value: "mati-sebagian", label: "Listrik mati sebagian" },
          { value: "stopkontak", label: "Stop kontak / saklar rusak" },
          { value: "lampu", label: "Lampu & fitting" },
        ],
        default: "korslet",
      },
      { id: "catatan", type: "textarea", label: "Catatan tambahan (opsional)", placeholder: "Contoh: MCB turun tiap malam" },
    ],
  },
  {
    id: "listrik-instalasi",
    catId: "listrik",
    name: "Instalasi Titik Listrik",
    short: "Tambah stop kontak, saklar, titik lampu",
    desc: "Penambahan titik listrik baru dengan material standar SNI. Jumlah titik dan jalur kabel memengaruhi biaya akhir.",
    sold: 432,
    duration: "± 1–3 jam",
    pricing: { base: [85000, 150000], perUnitField: "titik" },
    needsConsult: false,
    form: [
      { id: "titik", type: "stepper", label: "Jumlah titik", min: 1, max: 8, default: 1, suffix: "titik" },
      {
        id: "jenis", type: "choice", label: "Jenis titik",
        options: [
          { value: "stopkontak", label: "Stop kontak" },
          { value: "saklar", label: "Saklar" },
          { value: "lampu", label: "Titik lampu" },
        ],
        default: "stopkontak",
      },
      { id: "catatan", type: "textarea", label: "Catatan tambahan (opsional)" },
    ],
  },
  {
    id: "pipa-bocor",
    catId: "pipa",
    name: "Perbaikan Kebocoran",
    short: "Pipa bocor, rembes, kran rusak",
    desc: "Penanganan pipa bocor, dinding rembes, dan penggantian kran. Termasuk pengecekan jalur air di area masalah.",
    sold: 730,
    duration: "± 1–2 jam",
    pricing: { base: [100000, 250000] },
    needsConsult: false,
    form: [
      {
        id: "masalah", type: "choice", label: "Jenis masalah",
        options: [
          { value: "bocor", label: "Pipa bocor" },
          { value: "rembes", label: "Dinding rembes" },
          { value: "kran", label: "Kran / shower rusak" },
        ],
        default: "bocor",
      },
      { id: "catatan", type: "textarea", label: "Catatan tambahan (opsional)", placeholder: "Contoh: bocor di plafon kamar mandi" },
    ],
  },
  {
    id: "pipa-mampet",
    catId: "pipa",
    name: "Saluran Mampet",
    short: "Wastafel, kloset, saluran pembuangan",
    desc: "Pembersihan saluran mampet pada wastafel, kloset, atau pembuangan utama dengan alat khusus.",
    sold: 505,
    duration: "± 1 jam",
    pricing: { base: [150000, 350000] },
    needsConsult: false,
    form: [
      {
        id: "area", type: "choice", label: "Area yang mampet",
        options: [
          { value: "wastafel", label: "Wastafel / sink" },
          { value: "kloset", label: "Kloset" },
          { value: "pembuangan", label: "Saluran pembuangan" },
        ],
        default: "wastafel",
      },
      { id: "catatan", type: "textarea", label: "Catatan tambahan (opsional)" },
    ],
  },
  {
    id: "cleaning-reguler",
    catId: "cleaning",
    name: "Cleaning Reguler",
    short: "Bersih harian: sapu, pel, lap, kamar mandi",
    desc: "Pembersihan menyeluruh: menyapu, mengepel, lap permukaan, dan kamar mandi. Cocok untuk perawatan rutin.",
    sold: 1980,
    duration: "± 2–3 jam",
    pricing: {
      base: [150000, 250000],
      addons: { luas: { sedang: 50000, besar: 120000 }, kotor: { sedang: 30000, berat: 80000 } },
    },
    needsConsult: false,
    form: [
      {
        id: "ruangan", type: "choice", label: "Tipe hunian",
        options: [
          { value: "rumah", label: "Rumah" },
          { value: "apartemen", label: "Apartemen" },
          { value: "kos", label: "Kamar kos" },
        ],
        default: "rumah",
      },
      {
        id: "luas", type: "choice", label: "Estimasi luas",
        options: [
          { value: "kecil", label: "< 36 m²" },
          { value: "sedang", label: "36–70 m²" },
          { value: "besar", label: "> 70 m²" },
        ],
        default: "sedang",
      },
      {
        id: "kotor", type: "choice", label: "Tingkat kotor",
        options: [
          { value: "ringan", label: "Ringan" },
          { value: "sedang", label: "Sedang" },
          { value: "berat", label: "Berat" },
        ],
        default: "sedang",
      },
      { id: "foto", type: "photo", label: "Foto lokasi (opsional)" },
      { id: "catatan", type: "textarea", label: "Catatan tambahan (opsional)", placeholder: "Contoh: fokus area dapur" },
    ],
  },
  {
    id: "cleaning-deep",
    catId: "cleaning",
    name: "Deep Cleaning",
    short: "Pembersihan total hingga sela & kerak",
    desc: "Pembersihan intensif hingga sela-sela, kerak kamar mandi, dan area yang jarang dijangkau. Harga final melalui konsultasi singkat dengan mitra.",
    sold: 640,
    duration: "± 4–6 jam",
    pricing: {
      base: [350000, 700000],
      addons: { luas: { sedang: 100000, besar: 250000 }, kotor: { sedang: 50000, berat: 150000 } },
    },
    needsConsult: true,
    form: [
      {
        id: "ruangan", type: "choice", label: "Tipe hunian",
        options: [
          { value: "rumah", label: "Rumah" },
          { value: "apartemen", label: "Apartemen" },
        ],
        default: "rumah",
      },
      {
        id: "luas", type: "choice", label: "Estimasi luas",
        options: [
          { value: "kecil", label: "< 36 m²" },
          { value: "sedang", label: "36–70 m²" },
          { value: "besar", label: "> 70 m²" },
        ],
        default: "sedang",
      },
      {
        id: "kotor", type: "choice", label: "Tingkat kotor",
        options: [
          { value: "ringan", label: "Ringan" },
          { value: "sedang", label: "Sedang" },
          { value: "berat", label: "Berat" },
        ],
        default: "berat",
      },
      { id: "foto", type: "photo", label: "Foto lokasi (disarankan)" },
      { id: "catatan", type: "textarea", label: "Catatan tambahan (opsional)" },
    ],
  },
  {
    id: "cleaning-sofa",
    catId: "cleaning",
    name: "Cuci Sofa & Kasur",
    short: "Vakum & cuci sofa, kasur, karpet",
    desc: "Pembersihan sofa, kasur, dan karpet dengan mesin extractor — mengangkat debu, tungau, dan noda ringan.",
    sold: 720,
    duration: "± 1–2 jam",
    pricing: { base: [100000, 250000], perUnitField: "item" },
    needsConsult: false,
    form: [
      { id: "item", type: "stepper", label: "Jumlah item", min: 1, max: 6, default: 1, suffix: "item" },
      {
        id: "jenis", type: "choice", label: "Jenis item",
        options: [
          { value: "sofa", label: "Sofa" },
          { value: "kasur", label: "Kasur" },
          { value: "karpet", label: "Karpet" },
          { value: "campur", label: "Campuran" },
        ],
        default: "sofa",
      },
      { id: "catatan", type: "textarea", label: "Catatan tambahan (opsional)" },
    ],
  },
  {
    id: "renovasi-ringan",
    catId: "renovasi",
    name: "Renovasi Ringan",
    short: "Perbaikan dinding, keramik, plafon",
    desc: "Pekerjaan renovasi skala kecil: tambal dinding, ganti keramik pecah, perbaikan plafon, dan sejenisnya. Harga ditentukan setelah konsultasi dengan mitra.",
    sold: 215,
    duration: "± 1–3 hari",
    pricing: { base: null, consultText: "Harga via konsultasi" },
    needsConsult: true,
    form: [
      {
        id: "jenis", type: "choice", label: "Jenis pekerjaan",
        options: [
          { value: "dinding", label: "Dinding / plester" },
          { value: "keramik", label: "Keramik / lantai" },
          { value: "plafon", label: "Plafon" },
          { value: "lainnya", label: "Lainnya" },
        ],
        default: "dinding",
      },
      { id: "deskripsi", type: "textarea", label: "Deskripsi kebutuhan", placeholder: "Ceritakan pekerjaan yang dibutuhkan", required: true },
      { id: "foto", type: "photo", label: "Foto lokasi (disarankan)" },
    ],
  },
  {
    id: "renovasi-cat",
    catId: "renovasi",
    name: "Pengecatan Dinding",
    short: "Cat ulang interior per ruangan",
    desc: "Cat ulang dinding interior termasuk perapian permukaan ringan. Cat disediakan pelanggan atau mitra (dikonfirmasi saat konsultasi).",
    sold: 390,
    duration: "± 1 hari / ruangan",
    pricing: { base: [250000, 450000], perUnitField: "ruangan" },
    needsConsult: true,
    form: [
      { id: "ruangan", type: "stepper", label: "Jumlah ruangan", min: 1, max: 5, default: 1, suffix: "ruangan" },
      {
        id: "kondisi", type: "choice", label: "Kondisi dinding",
        options: [
          { value: "baik", label: "Baik / mulus" },
          { value: "retak", label: "Ada retak rambut" },
          { value: "lembab", label: "Bekas lembab" },
        ],
        default: "baik",
      },
      { id: "foto", type: "photo", label: "Foto ruangan (opsional)" },
      { id: "catatan", type: "textarea", label: "Catatan tambahan (opsional)" },
    ],
  },
  {
    id: "elektronik-servis",
    catId: "elektronik",
    name: "Servis Elektronik Rumah",
    short: "Mesin cuci, kulkas, kipas, water heater",
    desc: "Pemeriksaan dan perbaikan elektronik rumah tangga. Biaya part (jika perlu ganti) dikonfirmasi sebelum dikerjakan.",
    sold: 540,
    duration: "± 1–2 jam",
    pricing: { base: [85000, 200000] },
    needsConsult: false,
    form: [
      {
        id: "perangkat", type: "choice", label: "Perangkat",
        options: [
          { value: "mesin-cuci", label: "Mesin cuci" },
          { value: "kulkas", label: "Kulkas" },
          { value: "water-heater", label: "Water heater" },
          { value: "kipas", label: "Kipas / lainnya" },
        ],
        default: "mesin-cuci",
      },
      { id: "catatan", type: "textarea", label: "Gejala / keluhan", placeholder: "Contoh: mesin cuci tidak mau berputar" },
    ],
  },
];

/* ---------- Mitra tukang ----------
   photo = placeholder (pravatar). Ganti dengan foto asli dengan
   mengubah URL, atau arahkan ke file lokal mis. "img/mitra-1.jpg".
*/
export const WORKERS = [
  { id: "w1", name: "Joko Susilo", skills: ["ac", "elektronik"], rating: 4.9, orders: 1320, years: 8, distanceKm: 1.2, vehicle: "Motor · L 4321 KT", photo: "https://i.pravatar.cc/150?img=53" },
  { id: "w2", name: "Budi Santoso", skills: ["listrik"], rating: 4.9, orders: 1480, years: 10, distanceKm: 0.8, vehicle: "Motor · L 2456 BS", photo: "https://i.pravatar.cc/150?img=59" },
  { id: "w3", name: "Slamet Riyadi", skills: ["pipa", "renovasi"], rating: 4.8, orders: 905, years: 12, distanceKm: 2.1, vehicle: "Motor · L 7812 SR", photo: "https://i.pravatar.cc/150?img=68" },
  { id: "w4", name: "Sri Wahyuni", skills: ["cleaning"], rating: 4.9, orders: 2150, years: 5, distanceKm: 1.5, vehicle: "Motor · L 3344 SW", photo: "https://i.pravatar.cc/150?img=47" },
  { id: "w5", name: "Agus Priyanto", skills: ["renovasi", "pipa"], rating: 4.7, orders: 610, years: 9, distanceKm: 2.8, vehicle: "Pickup · L 9087 AP", photo: "https://i.pravatar.cc/150?img=60" },
  { id: "w6", name: "Dimas Saputra", skills: ["ac", "listrik", "elektronik"], rating: 4.8, orders: 760, years: 6, distanceKm: 1.9, vehicle: "Motor · L 5610 DS", photo: "https://i.pravatar.cc/150?img=57" },
];

/* ---------- Promo & voucher ---------- */
export const PROMO_BANNERS = [
  { id: "b1", title: "Diskon 10% Cleaning", sub: "Pakai voucher HEMAT10", tint: "green" },
  { id: "b2", title: "Cashback 20% KangPay", sub: "Bayar pakai saldo KangPay", tint: "blue" },
  { id: "b3", title: "Servis AC mulai 75rb", sub: "Promo musim panas", tint: "orange" },
];

export const VOUCHERS = [
  {
    code: "HEMAT10",
    title: "Diskon 10% s/d Rp25.000",
    desc: "Min. transaksi Rp100.000 · Semua layanan",
    expiry: "30 Jun 2026",
    type: "pct",
    pct: 0.1,
    max: 25000,
  },
  {
    code: "GRATISAPP",
    title: "Gratis Biaya Aplikasi",
    desc: "Tanpa minimum transaksi",
    expiry: "30 Jun 2026",
    type: "fee",
  },
  {
    code: "KANGPAY20",
    title: "Cashback 20% via KangPay",
    desc: "Maks. cashback Rp30.000 · khusus KangPay",
    expiry: "15 Jul 2026",
    type: "cashback",
    pct: 0.2,
    max: 30000,
  },
];

/* ---------- Riwayat pesanan dummy ---------- */
export const DEMO_HISTORY = [
  { id: "KT-8821", serviceName: "Cuci AC Rutin", date: "28 Mei 2026", total: 160000, status: "Selesai", rating: 5 },
  { id: "KT-8514", serviceName: "Cleaning Reguler", date: "14 Mei 2026", total: 235000, status: "Selesai", rating: 5 },
  { id: "KT-8102", serviceName: "Perbaikan Kebocoran", date: "29 Apr 2026", total: 180000, status: "Selesai", rating: 4 },
];

/* ---------- Template progress pengerjaan ---------- */
export const PROGRESS_TEMPLATES = {
  "ac-cuci": [
    "Tukang tiba",
    "Pemeriksaan awal",
    "Pembersihan unit indoor",
    "Pembersihan unit outdoor",
    "Pengecekan freon",
    "Testing AC",
    "Selesai",
  ],
  "ac-perbaikan": [
    "Tukang tiba",
    "Pemeriksaan awal",
    "Identifikasi kerusakan",
    "Perbaikan komponen",
    "Testing AC",
    "Selesai",
  ],
  ac: ["Tukang tiba", "Pemeriksaan awal", "Pengerjaan unit", "Vakum & tes kebocoran", "Testing AC", "Selesai"],
  listrik: [
    "Tukang tiba",
    "Pemeriksaan instalasi",
    "Identifikasi masalah",
    "Perbaikan komponen",
    "Testing",
    "Selesai",
  ],
  pipa: [
    "Tukang tiba",
    "Pengecekan jalur air",
    "Identifikasi titik masalah",
    "Perbaikan / pembersihan",
    "Testing aliran air",
    "Selesai",
  ],
  cleaning: [
    "Tukang tiba",
    "Persiapan alat",
    "Membersihkan kamar",
    "Membersihkan kamar mandi",
    "Mengepel lantai",
    "Finishing",
    "Selesai",
  ],
  renovasi: [
    "Tukang tiba",
    "Pengecekan area kerja",
    "Persiapan material",
    "Pengerjaan utama",
    "Perapian & pembersihan",
    "Selesai",
  ],
  elektronik: [
    "Tukang tiba",
    "Pemeriksaan perangkat",
    "Identifikasi kerusakan",
    "Perbaikan",
    "Testing perangkat",
    "Selesai",
  ],
  default: ["Tukang tiba", "Pemeriksaan awal", "Pengerjaan", "Testing", "Selesai"],
};

/* ---------- Progress dinamis tambahan ("update dari tukang") ---------- */
export const EXTRA_PROGRESS = {
  "ac-cuci": {
    updates: [
      { after: 1, type: "detail", note: "Filter AC ditemukan sangat berdebu", steps: ["Pembersihan filter intensif"] },
      { after: 3, type: "paid", note: "Kapasitor melemah dan disarankan untuk diganti", steps: ["Penggantian kapasitor", "Testing ulang"], cost: { label: "Penggantian kapasitor", amount: 45000 } },
    ],
  },
  "ac-perbaikan": {
    updates: [
      { after: 2, type: "detail", note: "Tegangan masuk stabil, masalah terisolasi pada modul kontrol", steps: ["Pemeriksaan modul kontrol"] },
      { after: 3, type: "paid", note: "Modul PCB perlu diperbaiki", steps: ["Perbaikan modul PCB", "Testing ulang"], cost: { label: "Perbaikan modul PCB", amount: 85000 } },
    ],
  },
  cleaning: {
    updates: [
      { after: 2, type: "free", note: "Mitra menemukan noda ringan di area dapur", steps: ["Pembersihan noda dapur"], label: "Bonus dari mitra" },
      { after: 4, type: "detail", note: "Area utama selesai dibersihkan dan masuk tahap perapian", steps: ["Pengecekan ulang area utama"] },
    ],
  },
  listrik: {
    updates: [
      { after: 1, type: "detail", note: "Sumber gangguan terdeteksi pada jalur utama", steps: ["Pemetaan jalur bermasalah"] },
      { after: 2, type: "paid", note: "Kabel lama ditemukan rapuh dan tidak aman digunakan", steps: ["Penggantian kabel jalur utama", "Testing ulang"], cost: { label: "Penggantian kabel (3 m)", amount: 40000 } },
    ],
  },
  pipa: {
    updates: [
      { after: 1, type: "detail", note: "Tekanan air stabil, kebocoran terisolasi pada satu sambungan", steps: ["Penandaan titik kebocoran"] },
      { after: 2, type: "paid", note: "Sambungan pipa lama ditemukan retak dan perlu diganti agar kebocoran tidak berulang", steps: ["Penggantian sambungan pipa"], cost: { label: "Sambungan pipa baru", amount: 30000 } },
    ],
  },
};

/* ---------- Script chat negosiasi (simulasi) ---------- */
export const NEGO_SCRIPTS = {
  opening: [
    { from: "worker", text: "Halo Kak, saya sudah lihat detail kebutuhannya 🙏" },
    { from: "worker", text: "Berdasarkan info yang Kakak isi, ini penawaran saya:" },
  ],
  negotiate: [
    { from: "user", text: "Bisa kurang sedikit nggak, Pak?" },
    { from: "worker", text: "Hmm… karena areanya lumayan, saya bantu turunkan sedikit ya Kak." },
    { from: "worker", text: "Ini sudah termasuk alat dan pembersihan akhir. Penawaran terbaik saya:" },
  ],
  agree: [{ from: "worker", text: "Siap Kak, harga disepakati. Saya berangkat sesuai jadwal ya 👍" }],
};

/* ---------- Biaya & pembayaran ---------- */
export const PLATFORM_FEE = 5000;

export const PAYMENT_METHODS = [
  { id: "kangpay", name: "KangPay", desc: "Saldo KangPay", icon: "wallet" },
  { id: "qris", name: "QRIS", desc: "Scan kode QR", icon: "qr" },
  { id: "cash", name: "Tunai", desc: "Bayar langsung ke mitra", icon: "cash" },
];

export const TOPUP_AMOUNTS = [50000, 100000, 200000, 500000];

export const TOPUP_METHODS = [
  { id: "bca", name: "BCA Virtual Account", desc: "Otomatis terverifikasi" },
  { id: "mandiri", name: "Mandiri Virtual Account", desc: "Otomatis terverifikasi" },
  { id: "alfamart", name: "Alfamart / Indomaret", desc: "Tunjukkan kode ke kasir" },
];

/* ---------- Helper lookup ---------- */
export const getCategory = (id) => CATEGORIES.find((c) => c.id === id);
export const getService = (id) => SERVICES.find((s) => s.id === id);
export const getWorker = (id) => WORKERS.find((w) => w.id === id);
export const servicesByCategory = (catId) => SERVICES.filter((s) => s.catId === catId);
export const getVoucher = (code) => VOUCHERS.find((v) => v.code === code);

export function getProgressTemplate(service) {
  return (
    PROGRESS_TEMPLATES[service.id] ||
    PROGRESS_TEMPLATES[service.catId] ||
    PROGRESS_TEMPLATES.default
  );
}

export function getExtraProgress(service) {
  return EXTRA_PROGRESS[service.id] || EXTRA_PROGRESS[service.catId] || null;
}
