self.addEventListener('install', () => { self.skipWaiting() })
self.addEventListener('activate', (evento) => { evento.waitUntil(self.clients.claim()) })
self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return
  evento.respondWith(fetch(evento.request).catch(() => caches.match(evento.request)))
})
