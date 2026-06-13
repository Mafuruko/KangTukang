/* ============================================================
   KangTukang — PETA (Leaflet + OpenStreetMap)
   Peta sungguhan untuk lokasi & tracking. Jika Leaflet/jaringan
   tidak tersedia, layar otomatis memakai peta ilustrasi (fallback).
   ============================================================ */

import { h } from "./ui.js";
import { addCleanup } from "./ui.js";

export const DEFAULT_CENTER = { lat: -7.2754, lng: 112.7521 }; // Surabaya

export function hasLeaflet() {
  return typeof window !== "undefined" && !!window.L;
}

export function makeMap(el, center, zoom = 15, interactive = true) {
  const L = window.L;
  const map = L.map(el, {
    zoomControl: false,
    attributionControl: true,
    dragging: interactive,
    scrollWheelZoom: interactive,
    doubleClickZoom: interactive,
    boxZoom: false,
    keyboard: false,
    tap: interactive,
  });
  map.attributionControl.setPrefix(false);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);
  map.setView([center.lat, center.lng], zoom);
  addCleanup(() => map.remove());
  // ukuran container baru siap setelah mount → kalibrasi ulang
  setTimeout(() => map.invalidateSize(), 60);
  setTimeout(() => map.invalidateSize(), 350);
  return map;
}

export function homeMarker(map, pos) {
  const L = window.L;
  return L.marker([pos.lat, pos.lng], {
    icon: L.divIcon({
      className: "lf-marker",
      html: '<div class="lf-home"><svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 34],
    }),
  }).addTo(map);
}

export function driverMarker(map, pos, photoUrl) {
  const L = window.L;
  return L.marker([pos.lat, pos.lng], {
    icon: L.divIcon({
      className: "lf-marker",
      html: `<div class="lf-driver"><img src="${photoUrl}" alt="" onerror="this.style.display='none'"/></div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    }),
  }).addTo(map);
}

export function routeLine(map, points) {
  const L = window.L;
  return L.polyline(
    points.map((p) => [p.lat, p.lng]),
    { color: "#2F5E9E", weight: 4, opacity: 0.85, lineCap: "round" }
  ).addTo(map);
}

/* Ambil rute jalan raya asli via OSRM */
export async function fetchOSRMRoute(dest) {
  // Titik awal simulasi (misal 1-2 km dari lokasi)
  const start = {
    lat: dest.lat + 0.0095,
    lng: dest.lng - 0.0125,
  };
  
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.routes && data.routes.length > 0) {
      const coords = data.routes[0].geometry.coordinates;
      const distance = data.routes[0].distance; // dalam meter
      const duration = data.routes[0].duration; // dalam detik
      
      const pts = coords.map(c => ({ lat: c[1], lng: c[0] }));
      return { pts, distance, duration };
    }
  } catch (err) {
    console.warn("OSRM fetch failed, using fallback route", err);
  }
  
  // Fallback ke zig-zag jika gagal
  const pts = [start];
  for (let i = 1; i < 9; i++) {
    const t = i / 9;
    const lat = start.lat + (dest.lat - start.lat) * (t < 0.5 ? t * 0.6 : 0.3 + (t - 0.5) * 1.4);
    const lng = start.lng + (dest.lng - start.lng) * (t < 0.5 ? t * 1.4 : 0.7 + (t - 0.5) * 0.6);
    pts.push({
      lat: lat + (i % 2 ? 0.0006 : -0.0004),
      lng: lng + (i % 3 ? -0.0004 : 0.0005),
    });
  }
  pts.push({ lat: dest.lat, lng: dest.lng });
  return { pts, distance: 1500, duration: 300 };
}

/* Interpolasi titik untuk pergerakan halus (animasi) */
export function interpolateRoute(pts, stepsPerSegment = 10) {
  const smoothPts = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    for (let j = 0; j < stepsPerSegment; j++) {
      const t = j / stepsPerSegment;
      smoothPts.push({
        lat: p1.lat + (p2.lat - p1.lat) * t,
        lng: p1.lng + (p2.lng - p1.lng) * t
      });
    }
  }
  smoothPts.push(pts[pts.length - 1]);
  return smoothPts;
}

/* Peta ilustrasi fallback (tanpa jaringan) */
export function fallbackMapSvg(tall = false) {
  const div = h("div", { class: "map-canvas" });
  div.innerHTML = `
  <svg viewBox="0 0 340 ${tall ? 240 : 150}" preserveAspectRatio="xMidYMid slice">
    <rect width="340" height="240" fill="#e9e4d6"/>
    <g stroke="#f7f4ec" stroke-width="14" stroke-linecap="round">
      <path d="M40 -10 V250"/><path d="M115 -10 V250"/><path d="M198 -10 V250"/><path d="M280 -10 V250"/>
      <path d="M-10 86 H350"/><path d="M-10 150 H350"/><path d="M-10 210 H350"/>
    </g>
    <g stroke="#dcd6c6" stroke-width="3">
      <path d="M-10 50 H350"/><path d="M-10 118 H350"/><path d="M75 -10 V250"/><path d="M240 -10 V250"/>
    </g>
    <rect x="50" y="20" width="34" height="22" fill="#d9d5ca"/>
    <rect x="210" y="170" width="40" height="26" fill="#d9d5ca"/>
    <rect x="296" y="120" width="30" height="40" fill="#d9d5ca"/>
    <rect x="130" y="180" width="26" height="20" fill="#d9d5ca"/>
  </svg>`;
  return div;
}
