/* TransportHub - Service Worker
 * - Casca do app (HTML, ícones, manifest) disponível offline.
 * - Páginas: rede primeiro, cache como reserva (sempre pega a versão nova quando online).
 * - Scripts de CDN e arquivos do próprio site: responde do cache e atualiza em segundo plano.
 * - Dados (Firestore) NÃO passam por aqui: o próprio Firebase cuida do modo offline.
 */
const CACHE = 'transporthub-v1';
const CDN_HOSTS = ['cdn.tailwindcss.com', 'www.gstatic.com', 'cdn.jsdelivr.net', 'i.ibb.co'];
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './fundo-login.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      // cada item isolado: se algum faltar (ex.: fundo-login.jpg), os outros ainda entram
      .then(cache => Promise.all(PRECACHE.map(url => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Navegação: rede primeiro; offline, usa a última versão salva
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copia = res.clone();
            caches.open(CACHE).then(c => c.put('./index.html', copia));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Arquivos do site e CDNs conhecidos: cache + atualização em segundo plano
  if (url.origin === self.location.origin || CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.match(req).then(emCache => {
        const rede = fetch(req)
          .then(res => {
            if (res && (res.ok || res.type === 'opaque')) {
              const copia = res.clone();
              caches.open(CACHE).then(c => c.put(req, copia));
            }
            return res;
          })
          .catch(() => emCache);
        return emCache || rede;
      })
    );
  }
  // qualquer outra origem (Firestore, ipify, etc.) segue direto para a rede
});
