/*
 * Service Worker da experiência Mamo AR.
 * Usa Network First para que as correções de câmera e os novos assets sejam
 * buscados do servidor antes de recorrer ao cache local.
 */

const CACHE_NAME = 'mamo-ar-cache-v13';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/app.css',
  './manifest.json',
  './js/state.js',
  './js/targets-config.js',
  './js/targets-config.js?v=1',
  './js/models.js',
  './js/lighting.js',
  './js/interactions.js',
  './js/editor.js',
  './js/app.js',
  './js/app.js?v=6',
  './assets/images/logo_mamo.png',
  './assets/images/qrcode.png',
  './targets.mind?v=11',
  './assets/3d/novaCaixa.glb?v=2',
  './assets/3d/flores.glb?v=2',
  './assets/3d/mamo-letras.glb?v=2',
  './assets/3d/gramanova.glb?v=2',
  './assets/3d/novacolecaofrase.glb?v=2',
  './assets/3d/givermy.glb?v=2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(
        ASSETS_TO_CACHE.map(asset =>
          cache.add(asset).catch(error => {
            console.warn('[Service Worker] Não foi possível cachear:', asset, error);
          })
        )
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copy).catch(err => console.warn('Cache put falhou', err));
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }))
  );
});
