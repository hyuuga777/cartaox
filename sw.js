/**
 * sw.js
 * Service Worker para permitir funcionamento offline e cache local dos assets tridimensionais (GLBs).
 */

const CACHE_NAME = 'mamo-ar-cache-v2';

// Recursos estáticos que devem ser pré-cacheados imediatamente no processo de instalação
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/app.css',
  './js/state.js',
  './js/targets.js',
  './js/models.js',
  './js/lighting.js',
  './js/interactions.js',
  './js/app.js',
  './manifest.json',
  './assets/images/qrcode.png',
  './assets/targets/qrcode.mind',
  // Modelos 3D (Cache-First para evitar download redundante em redes móveis)
  './assets/3d/flores.glb',
  './assets/3d/givemy-letras.glb',
  './assets/3d/grama.glb',
  './assets/3d/mamo-letras.glb'
];

// Instalação do Service Worker e cacheamento dos recursos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheamento de arquivos da shell iniciado');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de cache: Cache First para assets locais e Fallback para rede
self.addEventListener('fetch', (event) => {
  // Ignora requests de outras origens ou CDNs (deixa a rede lidar)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retorna imediatamente do cache
        return cachedResponse;
      }

      // Se não estiver no cache, busca na rede e guarda no cache dinâmico
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch((err) => {
        console.error('[Service Worker] Falha ao buscar na rede:', err);
      });
    })
  );
});
