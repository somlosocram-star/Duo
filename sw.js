/* DUO — service worker v1 */
const CACHE = 'duo-v3';
const CARDS = ['ancla','arbol','ballena','barco','calavera','caliz','campana','corona','cuervo','escarabajo','llave','luna','mano','ojo','polilla','reloj','rosa','serpiente','sol','torre'];
const ASSETS = ['./','index.html','manifest.json','icon-192.png','icon-512.png']
  .concat(CARDS.map(n => n + '.webp'));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // fuentes, Firebase: red directa
  // network-first para el HTML, cache-first para el resto
  if (e.request.mode === 'navigate' || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }))
    );
  }
});
