/* KashUp: permite instalar la app en Android y abrirla aunque la señal esté lenta.
   Los datos siempre se piden frescos a Google; solo se guarda la app (pantalla e íconos). */
var CACHE = 'kashup-' + self.registration.scope;
var APP = ['./', 'index.html'];
['verde', 'rosa', 'lila', 'vino'].forEach(function (c) {
  APP.push('manifest-' + c + '.webmanifest', 'icon-' + c + '-192.png', 'icon-' + c + '-512.png', 'icon-' + c + '-maskable-512.png', 'apple-touch-' + c + '.png');
});
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(APP); }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (x) { return x.indexOf('kashup-' + self.registration.scope) !== 0 && x.indexOf(self.registration.scope) > -1; }).map(function (x) { return caches.delete(x); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // Google Apps Script: siempre directo
  e.respondWith(
    fetch(e.request).then(function (r) {
      var copia = r.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
      return r;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match('index.html'); });
    })
  );
});
