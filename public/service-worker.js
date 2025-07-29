
const CACHE_NAME = 'cardapio-digital-v2';
const OFFLINE_URL = '/';

// Recursos essenciais para cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/ac9a4a20-a7e9-4ab9-8416-9296f0410f67.png',
  '/src/main.tsx',
  '/src/index.css'
];

// Instalação do Service Worker
self.addEventListener('install', function(event) {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Todos os recursos foram cacheados');
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', function(event) {
  console.log('[SW] Ativando Service Worker...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker ativado');
      return self.clients.claim();
    })
  );
});

// Estratégia de cache: Network First com fallback para cache
self.addEventListener('fetch', function(event) {
  // Só intercepta requisições GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Se a requisição foi bem-sucedida, atualiza o cache
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(function() {
        // Se a rede falhar, tenta buscar do cache
        return caches.match(event.request)
          .then(function(response) {
            if (response) {
              return response;
            }
            // Se não houver no cache, retorna a página offline
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Sincronização em background
self.addEventListener('sync', function(event) {
  console.log('[SW] Sincronização em background:', event.tag);
});

// Push notifications (preparado para futuro uso)
self.addEventListener('push', function(event) {
  console.log('[SW] Push recebido:', event);
  
  const options = {
    body: 'Seu pedido foi atualizado!',
    icon: '/lovable-uploads/ac9a4a20-a7e9-4ab9-8416-9296f0410f67.png',
    badge: '/lovable-uploads/ac9a4a20-a7e9-4ab9-8416-9296f0410f67.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Cardápio Digital', options)
  );
});
