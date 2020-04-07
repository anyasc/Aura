const cacheName = 'v1';

// Install

self.addEventListener('install', e => {
  console.log('Service Worker installed')
})

// Activate

self.addEventListener('activate', e => {
  console.log('Service Worker activated')
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            console.log('Service Worker: cleaning old cache');
            return caches.delete(cache);
          }
        })
      )
    })
  );
})


// Fetch
self.addEventListener('fetch', e => {
  console.log('Service Worker fetching');
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const resClone = res.clone();
        caches
          .open(cacheName)
          .then(cache => {
            cache.put(e.request, resClone);
          });
        return res
      }).catch(err => caches.match(e.request).then(res => res))
  );
});