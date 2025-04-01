const cacheName = 'floppybird-v1';
const urlsToCache = [
  '/',
  '/flappybird.js',
  '/AssetManager.js',
  '/Bird.js',
  '/Menu.js',
  '/style.css',
  '/PipeManager.js',
  '/assets/flappybird.png',
  '/assets/toppipe.png',
  '/assets/bottompipe.png',
  '/assets/flappybirdbg.png',
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        console.log('Caching files');
        cache.addAll(urlsToCache);
      })
      .catch(err => console.error(err))
  );
});

const cacheFirst = async (event: FetchEvent): Promise<Response> => {
  const resFromCache = await caches.match(event.request);
  if (resFromCache) {
    return resFromCache;
  }
  return fetch(event.request);
};

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(cacheFirst(event));
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  const cacheWhitelist = [cacheName];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

