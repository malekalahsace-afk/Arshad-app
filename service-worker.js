// --- Service Worker لتطبيق سجل الحضور والغياب ---
// الهدف: تخزين كل ملفات التطبيق محلياً بالجهاز بعد أول تحميل، حتى يعمل التطبيق بالكامل بدون اتصال إنترنت بعد ذلك.

// رقم نسخة الكاش - مهم جداً: كل مرة تحدّث الكود وترفع نسخة جديدة، يجب تغيير هذا الرقم
// (مثلاً v1 -> v2) حتى يكتشف التطبيق وجود تحديث ويحمّل النسخة الجديدة.
const CACHE_VERSION = "v1";
const CACHE_NAME = "attendance-app-" + CACHE_VERSION;

// قائمة كل الملفات الأساسية المطلوبة لعمل التطبيق بدون نت
const FILES_TO_CACHE = [
  "./Index.html",
  "./manifest.json",
  "./icon-72.png",
  "./icon-96.png",
  "./icon-128.png",
  "./icon-144.png",
  "./icon-152.png",
  "./icon-192.png",
  "./icon-384.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) {
            return name !== CACHE_NAME;
          })
          .map(function (name) {
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      var fetchPromise = fetch(event.request)
        .then(function (networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(function () {
          return null;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
