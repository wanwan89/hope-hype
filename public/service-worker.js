// --- KODE IKLAN MONETAG (TARUH PALING ATAS BIAR JALAN DULUAN) ---
self.options = {
    "domain": "3nbf4.com",
    "zoneId": 10901272
}
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')


// ==========================================
// PWA CACHE SYSTEM (Supaya bisa di-install)
// ==========================================
const CACHE_NAME = 'hopehype-v1'; // <-- Ini sudah kuperbaiki jadi huruf 'c' kecil

// File yang wajib ada supaya aplikasi bisa dibuka offline (tampilan dasar)
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Ambil dari cache, jika tidak ada baru ambil dari internet
      return response || fetch(event.request);
    })
  );
});
