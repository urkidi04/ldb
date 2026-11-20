// LDB Chihuahua: funciona sin señal. La página y los resultados se buscan primero en internet
// (para ver siempre lo más nuevo) y, si no hay conexión, se usan los guardados.
const CACHE = 'ldb-v2';
const PRECACHE = ['./', 'index.html', 'manifest.webmanifest', 'resultados.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'equipos/dorados.png', 'equipos/guerreros.png', 'equipos/bachilleres.png',
  'equipos/talentos.png', 'equipos/yankees.png', 'equipos/uchb.png',
  'convocatoria/c1.jpg', 'convocatoria/c2.jpg', 'convocatoria/c3.jpg', 'reglamento/texto.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(PRECACHE.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const fresh = req.mode === 'navigate' || /\/(index\.html|resultados\.json)?$/.test(new URL(req.url).pathname) || req.url.endsWith('resultados.json');
  if (fresh) {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
      return res;
    })));
  }
});
